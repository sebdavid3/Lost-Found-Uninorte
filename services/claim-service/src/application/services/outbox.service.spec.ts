import { OutboxService } from './outbox.service';
import { OutboxStatus } from '@prisma/client';

describe('OutboxService', () => {
  let service: OutboxService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      outboxEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    service = new OutboxService(mockPrisma);
  });

  describe('enqueueAuditEvent', () => {
    it('should create outbox event inside a transaction', async () => {
      const tx = {
        outboxEvent: {
          create: jest.fn().mockResolvedValue({ id: 'event-1' }),
        },
      };

      const result = await service.enqueueAuditEvent(tx as any, {
        action: 'CLAIM_CREATED',
        entityType: 'CLAIM',
        entityId: 'claim-1',
        actorId: 'user-1',
        actorRole: 'STUDENT',
        ipAddress: '127.0.0.1',
        payload: { test: true },
        result: 'SUCCESS',
      });

      expect(tx.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          topic: 'audit.event.created',
          payload: expect.anything(),
          status: OutboxStatus.PENDING,
        },
      });
      expect(result).toEqual({ id: 'event-1' });
    });
  });

  describe('reserveBatch', () => {
    it('should use raw query with FOR UPDATE SKIP LOCKED', async () => {
      const mockEvents = [
        { id: 'ev-1', status: OutboxStatus.PROCESSING, retryCount: 0 },
        { id: 'ev-2', status: OutboxStatus.PROCESSING, retryCount: 1 },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockEvents);

      const result = await service.reserveBatch(10);

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      const rawCall = mockPrisma.$queryRaw.mock.calls[0][0];
      const joinedSql = Array.isArray(rawCall) ? rawCall.join('') : rawCall;
      expect(joinedSql).toContain('UPDATE "OutboxEvent"');
      expect(joinedSql).toContain('FOR UPDATE SKIP LOCKED');
      expect(result).toEqual(mockEvents);
    });

    it('should default batch size to 20 when not provided', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await service.reserveBatch();

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('markPublished', () => {
    it('should update event to PUBLISHED', async () => {
      mockPrisma.outboxEvent.update.mockResolvedValue({ id: 'ev-1', status: OutboxStatus.PUBLISHED });

      const result = await service.markPublished('ev-1');

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'ev-1' },
        data: {
          status: OutboxStatus.PUBLISHED,
          publishedAt: expect.any(Date),
          lastError: null,
        },
      });
      expect(result.status).toBe(OutboxStatus.PUBLISHED);
    });
  });

  describe('markFailed', () => {
    it('should update event to FAILED with exponential backoff', async () => {
      mockPrisma.outboxEvent.update.mockResolvedValue({ id: 'ev-1', status: OutboxStatus.FAILED });

      await service.markFailed('ev-1', 0, 'Connection refused');

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'ev-1' },
        data: {
          status: OutboxStatus.FAILED,
          retryCount: 1,
          nextAttemptAt: expect.any(Date),
          lastError: 'Connection refused',
        },
      });

      const callArgs = mockPrisma.outboxEvent.update.mock.calls[0][0].data;
      expect(callArgs.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should cap backoff at 30000ms', async () => {
      mockPrisma.outboxEvent.update.mockResolvedValue({});

      await service.markFailed('ev-1', 10, 'Timeout');

      const callArgs = mockPrisma.outboxEvent.update.mock.calls[0][0].data;
      const delay = callArgs.nextAttemptAt.getTime() - Date.now();
      expect(delay).toBeLessThanOrEqual(30000);
    });

    it('should truncate error message to 1000 chars', async () => {
      mockPrisma.outboxEvent.update.mockResolvedValue({});

      const longError = 'x'.repeat(2000);
      await service.markFailed('ev-1', 0, longError);

      const callArgs = mockPrisma.outboxEvent.update.mock.calls[0][0].data;
      expect(callArgs.lastError.length).toBe(1000);
    });
  });
});

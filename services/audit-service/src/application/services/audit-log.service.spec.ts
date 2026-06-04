import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AuditLogFactory, AuditEventDto } from '../../domain/factories/audit-log.factory';
import { AUDIT_LOG_REPOSITORY } from '../../domain/ports/audit-log.repository';
import { AuditAction, AuditEntityType, AuditResult } from '../../domain/entities/audit-log-entry.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let mockRepository: any;
  let factory: AuditLogFactory;

  beforeEach(async () => {
    mockRepository = {
      appendWithChain: jest.fn().mockImplementation(async (builder) => {
        const entry = builder(null);
        await mockRepository.append(entry);
      }),
      append: jest.fn(),
      findAll: jest.fn(),
      findAllOrdered: jest.fn(),
      findByEntityId: jest.fn(),
      findByActorId: jest.fn(),
      findByAction: jest.fn(),
      findByDateRange: jest.fn(),
    };

    factory = new AuditLogFactory();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        AuditLogFactory,
        { provide: AUDIT_LOG_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  const createEvent = (): AuditEventDto => ({
    action: AuditAction.CLAIM_CREATED,
    entityType: AuditEntityType.CLAIM,
    entityId: 'claim-1',
    actorId: 'user-1',
    actorRole: 'STUDENT',
    ipAddress: '127.0.0.1',
    payload: { data: 'test' },
    result: AuditResult.SUCCESS,
  });

  describe('processAuditEvent', () => {
    it('should append event to audit log via repository', async () => {
      await service.processAuditEvent(createEvent());

      expect(mockRepository.appendWithChain).toHaveBeenCalled();
      expect(mockRepository.append).toHaveBeenCalled();
    });
  });

  describe('getAllLogs', () => {
    it('should paginate logs', async () => {
      mockRepository.findAll.mockResolvedValue([{ id: 'log-1' }]);

      const result = await service.getAllLogs(2, 25);

      expect(mockRepository.findAll).toHaveBeenCalledWith(2, 25);
      expect(result).toEqual([{ id: 'log-1' }]);
    });
  });

  describe('getEntityHistory', () => {
    it('should return logs filtered by entityId', async () => {
      mockRepository.findByEntityId.mockResolvedValue([{ entityId: 'claim-1' }]);

      const result = await service.getEntityHistory('claim-1');

      expect(mockRepository.findByEntityId).toHaveBeenCalledWith('claim-1');
    });
  });

  describe('getActorHistory', () => {
    it('should return logs filtered by actorId', async () => {
      mockRepository.findByActorId.mockResolvedValue([{ actorId: 'user-1' }]);

      const result = await service.getActorHistory('user-1');

      expect(mockRepository.findByActorId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getActionsByType', () => {
    it('should return logs filtered by action', async () => {
      mockRepository.findByAction.mockResolvedValue([{ action: AuditAction.CLAIM_CREATED }]);

      const result = await service.getActionsByType(AuditAction.CLAIM_CREATED);

      expect(mockRepository.findByAction).toHaveBeenCalledWith(AuditAction.CLAIM_CREATED);
    });
  });

  describe('getByDateRange', () => {
    it('should return logs within date range', async () => {
      mockRepository.findByDateRange.mockResolvedValue([]);

      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      await service.getByDateRange(start, end);

      expect(mockRepository.findByDateRange).toHaveBeenCalledWith(start, end);
    });
  });

  describe('verifyIntegrity', () => {
    it('should return valid=true for empty log', async () => {
      mockRepository.findAllOrdered.mockResolvedValue([]);

      const result = await service.verifyIntegrity();
      expect(result).toEqual({ isValid: true, brokenAt: null });
    });

    it('should detect invalid genesis block (previousHash !== null)', async () => {
      const genesis = factory.create(createEvent(), null);
      // Tamper with genesis
      const tampered = { ...genesis, previousHash: 'fake-hash' };

      mockRepository.findAllOrdered.mockResolvedValue([tampered]);

      const result = await service.verifyIntegrity();
      expect(result.isValid).toBe(false);
      expect(result.brokenAt).toBe(tampered.id);
    });

    it('should detect hash mismatch (tampered content)', async () => {
      const entry = factory.create(createEvent(), null);
      const tampered = { ...entry, action: AuditAction.CLAIM_DELETED };

      mockRepository.findAllOrdered.mockResolvedValue([tampered]);

      const result = await service.verifyIntegrity();
      expect(result.isValid).toBe(false);
      expect(result.brokenAt).toBe(tampered.id);
    });

    it('should detect broken chain (previousHash mismatch)', async () => {
      const first = factory.create(createEvent(), null);
      const secondEvent = createEvent();
      secondEvent.entityId = 'claim-2';
      const second = factory.create(secondEvent, first.hash);

      // Tamper second's previousHash
      const tamperedSecond = { ...second, previousHash: 'wrong-hash' };

      mockRepository.findAllOrdered.mockResolvedValue([first, tamperedSecond]);

      const result = await service.verifyIntegrity();
      expect(result.isValid).toBe(false);
      expect(result.brokenAt).toBe(tamperedSecond.id);
    });

    it('should return valid=true for intact chain', async () => {
      const first = factory.create(createEvent(), null);
      const secondEvent = createEvent();
      secondEvent.entityId = 'claim-2';
      const second = factory.create(secondEvent, first.hash);

      mockRepository.findAllOrdered.mockResolvedValue([first, second]);

      const result = await service.verifyIntegrity();
      expect(result.isValid).toBe(true);
      expect(result.brokenAt).toBeNull();
    });
  });
});

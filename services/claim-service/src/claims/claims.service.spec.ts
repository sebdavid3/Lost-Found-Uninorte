import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsService } from '../application/services/claims.service';
import { PrismaService } from '../infrastructure/prisma.service';
import { ClaimFactoryProvider } from '../application/factories/claim-factory.provider';
import { OutboxService } from '../application/services/outbox.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClaimStatus, ObjectCategory } from '@prisma/client';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let mockPrisma: any;
  let mockFactoryProvider: any;
  let mockOutbox: any;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn(async (fn: any) => fn(mockPrisma)),
      user: { findUnique: jest.fn() },
      object: { findUnique: jest.fn() },
      claim: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      evidence: { deleteMany: jest.fn() },
    };

    mockFactoryProvider = {
      getFactory: jest.fn().mockReturnValue({
        validateEvidences: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
      }),
    };

    mockOutbox = {
      enqueueAuditEvent: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ClaimFactoryProvider, useValue: mockFactoryProvider },
        { provide: OutboxService, useValue: mockOutbox },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  const actor = { actorId: 'user-1', actorRole: 'STUDENT', ipAddress: '127.0.0.1' };

  describe('create', () => {
    it('should create a claim with valid data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.object.findUnique.mockResolvedValue({
        id: 'obj-1',
        category: ObjectCategory.ELECTRONIC,
        photo: 'http://img',
      });
      mockPrisma.claim.create.mockResolvedValue({ id: 'claim-1' });

      const result = await service.create({
        userId: 'user-1',
        objectId: 'obj-1',
        objectCategory: ObjectCategory.ELECTRONIC,
        evidences: [{ type: 'SERIAL_NUMBER' as any, description: 'SN123' }],
      }, actor);

      expect(result).toEqual({ id: 'claim-1' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(mockPrisma.object.findUnique).toHaveBeenCalledWith({ where: { id: 'obj-1' } });
      expect(mockOutbox.enqueueAuditEvent).toHaveBeenCalled();
    });

    it('should throw BadRequestException when user does not exist (F22)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          userId: 'ghost-user',
          objectId: 'obj-1',
          objectCategory: ObjectCategory.ELECTRONIC,
          evidences: [{ type: 'SERIAL_NUMBER' as any, description: 'SN123' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when object does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.object.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          userId: 'user-1',
          objectId: 'ghost-obj',
          objectCategory: ObjectCategory.ELECTRONIC,
          evidences: [{ type: 'SERIAL_NUMBER' as any, description: 'SN123' }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when object has no photo', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.object.findUnique.mockResolvedValue({
        id: 'obj-1',
        category: ObjectCategory.ELECTRONIC,
        photo: '',
      });

      await expect(
        service.create({
          userId: 'user-1',
          objectId: 'obj-1',
          objectCategory: ObjectCategory.ELECTRONIC,
          evidences: [{ type: 'SERIAL_NUMBER' as any, description: 'SN123' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use real object category from DB (F21), ignoring DTO category', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.object.findUnique.mockResolvedValue({
        id: 'obj-1',
        category: ObjectCategory.ELECTRONIC,
        photo: 'http://img',
      });
      mockPrisma.claim.create.mockResolvedValue({ id: 'claim-1' });

      await service.create({
        userId: 'user-1',
        objectId: 'obj-1',
        objectCategory: 'COMMON' as any, // Client tries to send wrong category
        evidences: [{ type: 'SERIAL_NUMBER' as any, description: 'SN123' }],
      });

      // Should ask factory for ELECTRONIC (from DB), not COMMON (from DTO)
      expect(mockFactoryProvider.getFactory).toHaveBeenCalledWith(ObjectCategory.ELECTRONIC);
    });

    it('should throw BadRequestException when factory validation fails', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.object.findUnique.mockResolvedValue({
        id: 'obj-1',
        category: ObjectCategory.ELECTRONIC,
        photo: 'http://img',
      });
      mockFactoryProvider.getFactory.mockReturnValue({
        validateEvidences: jest.fn().mockReturnValue({
          isValid: false,
          errors: ['Falta número de serie'],
        }),
      });

      await expect(
        service.create({
          userId: 'user-1',
          objectId: 'obj-1',
          objectCategory: ObjectCategory.ELECTRONIC,
          evidences: [{ type: 'REFERENCE_PHOTO' as any, description: 'Photo' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated claims', async () => {
      mockPrisma.claim.findMany.mockResolvedValue([{ id: 'claim-1' }]);

      const result = await service.findAll(0, 20);

      expect(mockPrisma.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result).toEqual([{ id: 'claim-1' }]);
    });
  });

  describe('findByUser', () => {
    it('should return claims for a specific user with pagination', async () => {
      mockPrisma.claim.findMany.mockResolvedValue([{ id: 'claim-1', userId: 'user-1' }]);

      const result = await service.findByUser('user-1', 0, 10);

      expect(mockPrisma.claim.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' }, skip: 0, take: 10 }),
      );
      expect(result).toEqual([{ id: 'claim-1', userId: 'user-1' }]);
    });
  });

  describe('update', () => {
    it('should update a PENDING claim', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.PENDING,
        userId: 'user-1',
      });
      mockPrisma.claim.update.mockResolvedValue({ id: 'claim-1', status: ClaimStatus.APPROVED });

      const result = await service.update('claim-1', { status: ClaimStatus.APPROVED }, actor);

      expect(result.status).toBe(ClaimStatus.APPROVED);
      expect(mockOutbox.enqueueAuditEvent).toHaveBeenCalled();
    });

    it('should throw BadRequestException when body is empty (F16)', async () => {
      await expect(service.update('claim-1', {} as any, actor)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when claim does not exist', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue(null);

      await expect(service.update('ghost', { status: ClaimStatus.APPROVED }, actor)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when student tries to update another user claim (F4)', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.PENDING,
        userId: 'user-2',
      });

      await expect(
        service.update('claim-1', { status: ClaimStatus.APPROVED }, actor),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when claim is not PENDING', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.APPROVED,
        userId: 'user-1',
      });

      await expect(
        service.update('claim-1', { status: ClaimStatus.REJECTED }, actor),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a PENDING claim and its evidences', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.PENDING,
        userId: 'user-1',
      });
      mockPrisma.evidence.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.claim.delete.mockResolvedValue({ id: 'claim-1' });

      const result = await service.remove('claim-1', actor);

      expect(mockPrisma.evidence.deleteMany).toHaveBeenCalledWith({ where: { claimId: 'claim-1' } });
      expect(mockPrisma.claim.delete).toHaveBeenCalledWith({ where: { id: 'claim-1' } });
      expect(result).toEqual({ id: 'claim-1' });
      expect(mockOutbox.enqueueAuditEvent).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when student tries to delete another user claim (F4)', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.PENDING,
        userId: 'user-2',
      });

      await expect(service.remove('claim-1', actor)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when claim is not PENDING', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.APPROVED,
        userId: 'user-1',
      });

      await expect(service.remove('claim-1', actor)).rejects.toThrow(BadRequestException);
    });
  });
});

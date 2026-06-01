import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsController } from '../infrastructure/controllers/claims.controller';
import { ClaimsService } from '../application/services/claims.service';
import { ClaimsServiceProxy } from '../infrastructure/controllers/claims.service.proxy';
import { PrismaService } from '../infrastructure/prisma.service';
import { OutboxService } from '../application/services/outbox.service';
import { AntiCorruptionLayerService } from '../infrastructure/acl/anti-corruption-layer.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, ClaimStatus } from '@prisma/client';
import { Request } from 'express';

describe('ClaimsController', () => {
  let controller: ClaimsController;
  let mockClaimsService: any;
  let mockClaimsProxy: any;
  let mockPrisma: any;
  let mockOutbox: any;
  let mockAcl: any;

  beforeEach(async () => {
    mockClaimsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockClaimsProxy = {
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByFoundDateRange: jest.fn(),
      findOne: jest.fn(),
    };

    mockPrisma = {
      claim: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    mockOutbox = {
      enqueueAuditEvent: jest.fn(),
    };

    mockAcl = {
      normalizeCreateClaimInput: jest.fn((x) => x),
      toClaimResponse: jest.fn((claim, role) => ({ ...claim, role })),
      toClaimsResponse: jest.fn((claims, role) => claims.map((c: any) => ({ ...c, role }))),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        { provide: ClaimsService, useValue: mockClaimsService },
        { provide: ClaimsServiceProxy, useValue: mockClaimsProxy },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: AntiCorruptionLayerService, useValue: mockAcl },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
  });

  const mockRequest = (role = 'STUDENT', userId = 'user-1'): Partial<Request> => ({
    headers: { 'x-user-role': role, 'x-user-id': userId },
    url: '/claims',
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' } as any,
  });

  describe('create', () => {
    it('should create claim when userId matches header (ownership)', async () => {
      mockClaimsService.create.mockResolvedValue({ id: 'claim-1' });

      const req = mockRequest('STUDENT', 'user-1') as Request;
      const dto = { userId: 'user-1', objectId: 'obj-1', objectCategory: 'ELECTRONIC' as any, evidences: [] };

      const result = await controller.create(dto, req);

      expect(mockClaimsService.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when userId does not match header', async () => {
      const req = mockRequest('STUDENT', 'user-1') as Request;
      const dto = { userId: 'user-2', objectId: 'obj-1', objectCategory: 'ELECTRONIC' as any, evidences: [] };

      await expect(controller.create(dto, req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return paginated claims with ACL applied', async () => {
      mockClaimsProxy.findAll.mockResolvedValue([{ id: 'claim-1' }]);

      const req = mockRequest('ADMIN') as Request;
      const result = await controller.findAll(req, '2', '10');

      expect(mockClaimsProxy.findAll).toHaveBeenCalledWith(expect.anything(), 10, 10);
      expect(mockAcl.toClaimsResponse).toHaveBeenCalled();
    });
  });

  describe('findMyClaims', () => {
    it('should return claims for authenticated user', async () => {
      mockClaimsService.findByUser.mockResolvedValue([{ id: 'claim-1' }]);

      const req = mockRequest('STUDENT', 'user-1') as Request;
      const result = await controller.findMyClaims(req, '1', '20');

      expect(mockClaimsService.findByUser).toHaveBeenCalledWith('user-1', 0, 20);
    });
  });

  describe('verify', () => {
    it('should throw ForbiddenException for non-admin users', async () => {
      const req = mockRequest('STUDENT') as Request;

      await expect(controller.verify('claim-1', req)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if claim is not PENDING', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue({
        id: 'claim-1',
        status: ClaimStatus.APPROVED,
      });

      const req = mockRequest('ADMIN') as Request;
      await expect(controller.verify('claim-1', req)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if claim does not exist', async () => {
      mockPrisma.claim.findUnique.mockResolvedValue(null);

      const req = mockRequest('ADMIN') as Request;
      await expect(controller.verify('claim-1', req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should return NO_CONTENT (204) on successful delete', async () => {
      mockClaimsService.remove.mockResolvedValue({ id: 'claim-1' });

      const req = mockRequest('STUDENT', 'user-1') as Request;
      const result = await controller.remove('claim-1', req);

      expect(result).toBeUndefined(); // @HttpCode(NO_CONTENT) returns nothing
      expect(mockClaimsService.remove).toHaveBeenCalledWith('claim-1', expect.anything());
    });
  });
});

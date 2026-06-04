import { IdentityHandler } from './identity.handler';
import { AvailabilityHandler } from './availability.handler';
import { EvidenceMatchHandler } from './evidence-match.handler';
import { ClaimVerificationException } from './claim-verification.exception';
import { ClaimVerificationContext } from './claim-verification.types';
import { ClaimStatus } from '@prisma/client';

describe('Chain of Responsibility — Claim Verification Handlers', () => {
  const createMockPrisma = (overrides: any = {}) => {
    return {
      user: {
        findUnique: jest.fn(),
      },
      claim: {
        findFirst: jest.fn(),
      },
      ...overrides,
    } as any;
  };

  const buildContext = (overrides: any = {}): ClaimVerificationContext => ({
    claim: {
      id: 'claim-1',
      userId: 'user-1',
      objectId: 'object-1',
      status: ClaimStatus.PENDING,
      user: { id: 'user-1', email: 'test@uninorte.edu.co', name: 'Test', role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() },
      object: { id: 'object-1', name: 'Test Object', description: 'Desc', photo: 'url', category: 'ELECTRONIC', location: 'Lib', status: 'AVAILABLE', foundAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      evidences: [
        { id: 'ev-1', type: 'SERIAL_NUMBER', description: 'SN123', url: null, claimId: 'claim-1', createdAt: new Date(), updatedAt: new Date() },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides.claim,
    },
    ...overrides,
  });

  describe('IdentityHandler', () => {
    it('should pass when user exists', async () => {
      const prisma = createMockPrisma();
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const handler = new IdentityHandler(prisma);
      const context = buildContext();

      await expect(handler.handle(context)).resolves.toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw ClaimVerificationException when user does not exist', async () => {
      const prisma = createMockPrisma();
      prisma.user.findUnique.mockResolvedValue(null);

      const handler = new IdentityHandler(prisma);
      const context = buildContext();

      await expect(handler.handle(context)).rejects.toThrow(ClaimVerificationException);
      await expect(handler.handle(context)).rejects.toThrow(/no existe en los registros oficiales/);
    });

    it('should call next handler when set', async () => {
      const prisma = createMockPrisma();
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

      const handler = new IdentityHandler(prisma);
      const nextHandler = new EvidenceMatchHandler();
      handler.setNext(nextHandler);

      const context = buildContext();
      await expect(handler.handle(context)).resolves.toBe(true);
    });
  });

  describe('AvailabilityHandler', () => {
    it('should pass when object is not claimed by another user', async () => {
      const prisma = createMockPrisma();
      prisma.claim.findFirst.mockResolvedValue(null);

      const handler = new AvailabilityHandler(prisma);
      const context = buildContext();

      await expect(handler.handle(context)).resolves.toBe(true);
      expect(prisma.claim.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            objectId: 'object-1',
            status: ClaimStatus.APPROVED,
          }),
          select: { id: true },
        }),
      );
    });

    it('should throw when object is already approved for another user', async () => {
      const prisma = createMockPrisma();
      prisma.claim.findFirst.mockResolvedValue({ id: 'other-claim' });

      const handler = new AvailabilityHandler(prisma);
      const context = buildContext();

      await expect(handler.handle(context)).rejects.toThrow(ClaimVerificationException);
      await expect(handler.handle(context)).rejects.toThrow(/ya fue reclamado exitosamente por otra persona/);
    });

    it('should allow same user to have multiple claims on same object (not approved)', async () => {
      const prisma = createMockPrisma();
      prisma.claim.findFirst.mockResolvedValue(null);

      const handler = new AvailabilityHandler(prisma);
      const context = buildContext({ claim: { userId: 'user-1' } });

      await expect(handler.handle(context)).resolves.toBe(true);
    });
  });

  describe('EvidenceMatchHandler', () => {
    it('should pass for ELECTRONIC with SERIAL_NUMBER', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'ELECTRONIC' },
          evidences: [{ type: 'SERIAL_NUMBER', description: 'SN123' }],
        },
      });

      await expect(handler.handle(context)).resolves.toBe(true);
    });

    it('should pass for ELECTRONIC with DIGITAL_INVOICE', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'ELECTRONIC' },
          evidences: [{ type: 'DIGITAL_INVOICE', description: 'Invoice', url: 'http://inv' }],
        },
      });

      await expect(handler.handle(context)).resolves.toBe(true);
    });

    it('should throw for ELECTRONIC without valid evidence', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'ELECTRONIC' },
          evidences: [{ type: 'DETAILED_DESCRIPTION', description: 'Just text' }],
        },
      });

      await expect(handler.handle(context)).rejects.toThrow(ClaimVerificationException);
      await expect(handler.handle(context)).rejects.toThrow(/no contiene evidencias válidas/);
    });

    it('should pass for COMMON with DETAILED_DESCRIPTION + REFERENCE_PHOTO', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'COMMON' },
          evidences: [
            { type: 'DETAILED_DESCRIPTION', description: 'Blue thermos' },
            { type: 'REFERENCE_PHOTO', description: 'Photo', url: 'http://img' },
          ],
        },
      });

      await expect(handler.handle(context)).resolves.toBe(true);
    });

    it('should throw for COMMON without valid evidence', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'COMMON' },
          evidences: [{ type: 'SERIAL_NUMBER', description: 'SN123' }],
        },
      });

      await expect(handler.handle(context)).rejects.toThrow(ClaimVerificationException);
    });

    it('should handle ACCESSORY as non-electronic (DEFAULT types)', async () => {
      const handler = new EvidenceMatchHandler();
      const context = buildContext({
        claim: {
          object: { category: 'ACCESSORY' },
          evidences: [{ type: 'DETAILED_DESCRIPTION', description: 'White case' }],
        },
      });

      await expect(handler.handle(context)).resolves.toBe(true);
    });
  });

  describe('Chain orchestration', () => {
    it('should run full chain: Identity → Availability → EvidenceMatch', async () => {
      const prisma = createMockPrisma();
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.claim.findFirst.mockResolvedValue(null);

      const identity = new IdentityHandler(prisma);
      const availability = new AvailabilityHandler(prisma);
      const evidence = new EvidenceMatchHandler();

      identity.setNext(availability).setNext(evidence);

      const context = buildContext();
      await expect(identity.handle(context)).resolves.toBe(true);
    });

    it('should stop chain at first failure', async () => {
      const prisma = createMockPrisma();
      prisma.user.findUnique.mockResolvedValue(null);

      const identity = new IdentityHandler(prisma);
      const availability = new AvailabilityHandler(prisma);
      const evidence = new EvidenceMatchHandler();

      identity.setNext(availability).setNext(evidence);

      const context = buildContext();
      await expect(identity.handle(context)).rejects.toThrow(ClaimVerificationException);
      expect(prisma.claim.findFirst).not.toHaveBeenCalled();
    });
  });
});

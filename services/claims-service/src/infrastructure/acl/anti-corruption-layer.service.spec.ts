import { BadRequestException } from '@nestjs/common';
import { ClaimStatus, ObjectCategory, Role } from '@prisma/client';
import { AntiCorruptionLayerService } from './anti-corruption-layer.service';

describe('AntiCorruptionLayerService', () => {
  let service: AntiCorruptionLayerService;

  beforeEach(() => {
    service = new AntiCorruptionLayerService();
  });

  it('normalizes create payload', () => {
    const normalized = service.normalizeCreateClaimInput({
      userId: ' user-1 ',
      objectId: ' object-1 ',
      objectCategory: 'electronic' as ObjectCategory,
      evidences: [
        {
          type: ' factura ',
          url: ' https://example.com/proof ',
          description: ' documento ',
        },
      ],
    });

    expect(normalized.userId).toBe('user-1');
    expect(normalized.objectId).toBe('object-1');
    expect(normalized.objectCategory).toBe(ObjectCategory.ELECTRONIC);
    expect(normalized.evidences[0].type).toBe('FACTURA');
    expect(normalized.evidences[0].url).toBe('https://example.com/proof');
    expect(normalized.evidences[0].description).toBe('documento');
  });

  it('rejects invalid object categories', () => {
    expect(() =>
      service.normalizeCreateClaimInput({
        userId: 'user-1',
        objectId: 'object-1',
        objectCategory: 'INVALID' as ObjectCategory,
        evidences: [],
      }),
    ).toThrow(BadRequestException);
  });

  it('hides rejection reason for student responses', () => {
    const response = service.toClaimResponse(
      {
        id: 'claim-1',
        status: ClaimStatus.REJECTED,
        userId: 'user-1',
        objectId: 'object-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        rejectionReason: 'Evidencia insuficiente',
        evidences: [],
      } as never,
      Role.STUDENT,
    );

    expect(response.rejectionReason).toBeUndefined();
  });

  it('includes rejection reason for admin responses', () => {
    const response = service.toClaimResponse(
      {
        id: 'claim-1',
        status: ClaimStatus.REJECTED,
        userId: 'user-1',
        objectId: 'object-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        rejectionReason: 'Evidencia insuficiente',
        evidences: [],
      } as never,
      Role.ADMIN,
    );

    expect(response.rejectionReason).toBe('Evidencia insuficiente');
  });
});

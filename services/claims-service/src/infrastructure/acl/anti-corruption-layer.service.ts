import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Claim,
  ClaimStatus,
  Evidence,
  Object as FoundObject,
  ObjectCategory,
  Role,
} from '@prisma/client';
import { CreateClaimDto } from '../../application/dto/create-claim.dto';

type ClaimWithRelations = Claim & {
  evidences?: Evidence[];
  object?: FoundObject | null;
};

export interface ClaimResponseDto {
  id: string;
  status: ClaimStatus;
  userId: string;
  objectId: string;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string | null;
  evidences: Array<{
    id: string;
    type: string;
    url: string | null;
    description: string | null;
  }>;
  object?: {
    id: string;
    name: string;
    category: ObjectCategory;
    status: FoundObject['status'];
    location: string;
    foundAt: Date;
    photo: string | null;
  };
}

@Injectable()
export class AntiCorruptionLayerService {
  normalizeCreateClaimInput(payload: CreateClaimDto): CreateClaimDto {
    const normalizedCategory = this.normalizeObjectCategory(payload.objectCategory);

    const normalizedEvidences = payload.evidences.map(evidence => {
      const normalizedType = evidence.type?.trim().toUpperCase();

      if (!normalizedType) {
        throw new BadRequestException('Cada evidencia debe incluir un tipo válido.');
      }

      return {
        ...evidence,
        type: normalizedType,
        url: evidence.url?.trim() || undefined,
        description: evidence.description?.trim() || undefined,
      };
    });

    return {
      ...payload,
      userId: payload.userId.trim(),
      objectId: payload.objectId.trim(),
      objectCategory: normalizedCategory,
      evidences: normalizedEvidences,
    };
  }

  toClaimResponse(claim: ClaimWithRelations, role: Role): ClaimResponseDto {
    const response: ClaimResponseDto = {
      id: claim.id,
      status: claim.status,
      userId: claim.userId,
      objectId: claim.objectId,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      evidences: (claim.evidences ?? []).map(evidence => ({
        id: evidence.id,
        type: evidence.type,
        url: evidence.url,
        description: evidence.description,
      })),
      object: claim.object
        ? {
            id: claim.object.id,
            name: claim.object.name,
            category: claim.object.category,
            status: claim.object.status,
            location: claim.object.location,
            foundAt: claim.object.foundAt,
            photo: claim.object.photo,
          }
        : undefined,
    };

    if (role === Role.ADMIN) {
      response.rejectionReason = claim.rejectionReason;
    }

    return response;
  }

  toClaimsResponse(claims: ClaimWithRelations[], role: Role): ClaimResponseDto[] {
    return claims.map(claim => this.toClaimResponse(claim, role));
  }

  private normalizeObjectCategory(category: ObjectCategory): ObjectCategory {
    const normalized = String(category).trim().toUpperCase();

    if (!Object.values(ObjectCategory).includes(normalized as ObjectCategory)) {
      throw new BadRequestException(
        `Categoría inválida. Valores permitidos: ${Object.values(ObjectCategory).join(', ')}`,
      );
    }

    return normalized as ObjectCategory;
  }
}

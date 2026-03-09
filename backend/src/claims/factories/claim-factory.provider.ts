import { ClaimFactory } from './claim.factory';
import { ElectronicClaimFactory } from './electronic-claim.factory';
import { CommonClaimFactory } from './common-claim.factory';
import { ObjectCategory } from '@prisma/client';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ClaimFactoryProvider {
  constructor(
    private electronicFactory: ElectronicClaimFactory,
    private commonFactory: CommonClaimFactory,
  ) {}

  getFactory(category: ObjectCategory): ClaimFactory {
    switch (category) {
      case ObjectCategory.ELECTRONIC:
      case ObjectCategory.ACCESSORY: // Trataremos estos como electrónicos que requieren serie
        return this.electronicFactory;
      case ObjectCategory.COMMON:
      case ObjectCategory.CLOTHING:
      case ObjectCategory.STATIONERY:
      case ObjectCategory.DOCUMENT:
      case ObjectCategory.OTHER:
        return this.commonFactory;
      default:
        throw new BadRequestException(`No hay factory definida para la categoría: ${category}`);
    }
  }
}

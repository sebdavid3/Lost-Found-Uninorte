import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimFactoryProvider } from './factories/claim-factory.provider';

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private factoryProvider: ClaimFactoryProvider,
  ) {}

  async create(createClaimDto: CreateClaimDto) {
    const { userId, objectId, objectCategory, evidences } = createClaimDto;

    // 1. Obtener la factory correspondiente a la categoría del objeto
    const factory = this.factoryProvider.getFactory(objectCategory);

    // 2. Validar que las evidencias cumplan los requisitos de su categoría
    const validationResult = factory.validateEvidences(evidences);

    if (!validationResult.isValid) {
      throw new BadRequestException(
        `Evidencias inválidas para categoría ${objectCategory}: ${validationResult.errors.join(', ')}`,
      );
    }

    // 3. Obtener el Objeto de la base de datos para Validar la Regla Crítica (Debe tener foto)
    const object = await this.prisma.object.findUnique({
      where: { id: objectId },
    });

    if (!object) {
      throw new NotFoundException(`El objeto con ID ${objectId} no existe.`);
    }

    if (!object.photo || object.photo.trim() === '') {
      throw new BadRequestException(
        'El objeto no puede recibir reclamaciones porque no tiene una fotografía registrada en el sistema (Norma Institucional).',
      );
    }

    // 4. Crear la reclamación junto a sus evidencias
    return this.prisma.claim.create({
      data: {
        userId,
        objectId,
        evidences: {
          create: evidences.map(e => ({
            type: e.type,
            url: e.url,
            description: e.description,
          })),
        },
      },
      include: {
        evidences: true,
      },
    });
  }

  findAll() {
    return this.prisma.claim.findMany({ include: { evidences: true } });
  }

  findOne(id: string) {
    return this.prisma.claim.findUnique({
      where: { id },
      include: { evidences: true },
    });
  }

  update(id: string, updateClaimDto: UpdateClaimDto) {
    return this.prisma.claim.update({
      where: { id },
      data: updateClaimDto,
    });
  }

  remove(id: string) {
    return this.prisma.claim.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OutboxService } from '../../application/services/outbox.service';
import { CreateObjectDto } from '../../application/dto/create-object.dto';
import { UpdateObjectDto } from '../../application/dto/update-object.dto';

export interface ObjectFilters {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditActorContext {
  actorId: string;
  actorRole: string;
  ipAddress: string;
}

@Injectable()
export class ObjectsService {
  constructor(
    private prisma: PrismaService,
    private outboxService: OutboxService,
  ) {}

  async findAll(filters: ObjectFilters = {}): Promise<PaginatedResult<any>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.q && filters.q.trim() !== '') {
      const searchTerm = filters.q.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters.category && filters.category.trim() !== '') {
      where.category = filters.category.trim();
    }

    if (filters.location && filters.location.trim() !== '') {
      where.location = { contains: filters.location.trim(), mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.object.findMany({
        where,
        skip,
        take: limit,
        orderBy: { foundAt: 'desc' },
      }),
      this.prisma.object.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const obj = await this.prisma.object.findUnique({ where: { id } });
    if (!obj) {
      throw new NotFoundException(`Objeto con ID ${id} no encontrado.`);
    }
    return obj;
  }

  async create(dto: CreateObjectDto, actor?: AuditActorContext) {
    return this.prisma.$transaction(async (tx) => {
      const obj = await tx.object.create({
        data: {
          name: dto.name,
          description: dto.description,
          photo: dto.photo,
          category: dto.category,
          location: dto.location,
          status: 'AVAILABLE',
        },
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'OBJECT_CREATED',
        entityType: 'OBJECT',
        entityId: obj.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { object: obj },
        result: 'SUCCESS',
      });

      return obj;
    });
  }

  async update(id: string, dto: UpdateObjectDto, actor?: AuditActorContext) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const obj = await tx.object.update({
        where: { id },
        data: dto,
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'OBJECT_UPDATED',
        entityType: 'OBJECT',
        entityId: obj.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { updatedFields: dto, object: obj },
        result: 'SUCCESS',
      });

      return obj;
    });
  }

  async remove(id: string, actor?: AuditActorContext) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const obj = await tx.object.delete({
        where: { id },
      });

      await this.outboxService.enqueueAuditEvent(tx, {
        action: 'OBJECT_DELETED',
        entityType: 'OBJECT',
        entityId: obj.id,
        actorId: actor?.actorId ?? 'system',
        actorRole: actor?.actorRole ?? 'unknown',
        ipAddress: actor?.ipAddress ?? 'unknown',
        payload: { object: obj },
        result: 'SUCCESS',
      });

      return obj;
    });
  }
}

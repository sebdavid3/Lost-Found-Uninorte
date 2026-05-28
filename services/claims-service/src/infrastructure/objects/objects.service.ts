import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

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

@Injectable()
export class ObjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ObjectFilters = {}): Promise<PaginatedResult<any>> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ObjectWhereInput = {};

    // Filtro por búsqueda de texto en name y description
    if (filters.q && filters.q.trim() !== '') {
      const searchTerm = filters.q.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Filtro por categoría
    if (filters.category && filters.category.trim() !== '') {
      where.category = filters.category.trim() as any;
    }

    // Filtro por ubicación
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

  findOne(id: string) {
    return this.prisma.object.findUnique({ where: { id } });
  }
}

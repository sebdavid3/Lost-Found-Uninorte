import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateObjectDto } from './create-object.dto';
import { UpdateObjectDto } from './update-object.dto';

export interface ObjectFilters {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
  foundAtStart?: string;
  foundAtEnd?: string;
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
    if (filters.foundAtStart || filters.foundAtEnd) {
      where.foundAt = {};
      if (filters.foundAtStart) where.foundAt.gte = new Date(filters.foundAtStart);
      if (filters.foundAtEnd) where.foundAt.lte = new Date(filters.foundAtEnd);
    }
    const [items, total] = await Promise.all([
      this.prisma.object.findMany({ where, skip, take: limit, orderBy: { foundAt: 'desc' } }),
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

  async create(dto: CreateObjectDto) {
    return this.prisma.object.create({
      data: {
        name: dto.name,
        description: dto.description,
        photo: dto.photo,
        category: dto.category,
        location: dto.location,
        storageLocation: dto.storageLocation,
        status: 'AVAILABLE',
      },
    });
  }

  async update(id: string, dto: UpdateObjectDto) {
    await this.findOne(id);
    return this.prisma.object.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.object.delete({ where: { id } });
  }
}

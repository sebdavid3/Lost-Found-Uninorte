import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.object.findMany({
      include: {
        claims: true,
      },
    });
  }

  async findOne(id: string) {
    const object = await this.prisma.object.findUnique({
      where: { id },
      include: {
        claims: true,
      },
    });
    if (!object) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }
    return object;
  }
}

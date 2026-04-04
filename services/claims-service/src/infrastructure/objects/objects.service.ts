import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ObjectsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.object.findMany();
  }

  findOne(id: string) {
    return this.prisma.object.findUnique({ where: { id } });
  }
}

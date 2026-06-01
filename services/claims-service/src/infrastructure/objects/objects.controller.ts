import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ObjectsService, AuditActorContext } from './objects.service';
import { CreateObjectDto } from '../../application/dto/create-object.dto';
import { UpdateObjectDto } from '../../application/dto/update-object.dto';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  private getActorContext(request: Request, role: string): AuditActorContext {
    const userId = Array.isArray(request.headers['x-user-id'])
      ? request.headers['x-user-id'][0]
      : request.headers['x-user-id'] ?? 'system';
    const actorRole = Array.isArray(request.headers['x-user-role'])
      ? request.headers['x-user-role'][0]
      : request.headers['x-user-role'] ?? role;
    return {
      actorId: userId,
      actorRole,
      ipAddress: request.ip || request.connection?.remoteAddress || 'unknown',
    };
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.objectsService.findAll({
      q,
      category,
      location,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateObjectDto,
    @Headers('x-user-role') role: string,
    @Req() request: Request,
  ) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    return this.objectsService.create(dto, this.getActorContext(request, role));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateObjectDto,
    @Headers('x-user-role') role: string,
    @Req() request: Request,
  ) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    return this.objectsService.update(id, dto, this.getActorContext(request, role));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-user-role') role: string,
    @Req() request: Request,
  ) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    await this.objectsService.remove(id, this.getActorContext(request, role));
  }
}

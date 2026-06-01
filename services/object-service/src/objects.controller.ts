import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Headers, ForbiddenException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ObjectsService, ObjectFilters } from './objects.service';
import { CreateObjectDto } from './create-object.dto';
import { UpdateObjectDto } from './update-object.dto';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('foundAtStart') foundAtStart?: string,
    @Query('foundAtEnd') foundAtEnd?: string,
  ) {
    return this.objectsService.findAll({
      q,
      category,
      location,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      foundAtStart,
      foundAtEnd,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateObjectDto, @Headers('x-user-role') role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    return this.objectsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateObjectDto, @Headers('x-user-role') role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    return this.objectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Headers('x-user-role') role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos de administrador para realizar esta acción.');
    }
    await this.objectsService.remove(id);
  }
}

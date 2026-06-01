import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getUserByEmail(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email requerido');
    const user = await this.usersService.findByEmail(email);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new BadRequestException('Usuario no encontrado');
    return user;
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}

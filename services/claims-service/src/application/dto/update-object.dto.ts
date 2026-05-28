import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ObjectCategory } from '@prisma/client';

export class UpdateObjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  photo?: string;

  @IsEnum(ObjectCategory)
  @IsOptional()
  category?: ObjectCategory;

  @IsString()
  @IsOptional()
  location?: string;
}

import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ObjectCategory } from '@prisma/client';

export class CreateObjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  photo: string;

  @IsEnum(ObjectCategory)
  @IsNotEmpty()
  category: ObjectCategory;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  storageLocation?: string;
}

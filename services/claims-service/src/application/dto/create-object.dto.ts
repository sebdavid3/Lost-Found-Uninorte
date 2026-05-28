import { IsString, IsNotEmpty, IsEnum, IsUrl } from 'class-validator';
import { ObjectCategory } from '@prisma/client';

export class CreateObjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  photo: string;

  @IsEnum(ObjectCategory)
  @IsNotEmpty()
  category: ObjectCategory;

  @IsString()
  @IsNotEmpty()
  location: string;
}

import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectCategory } from '@prisma/client';

export class EvidenceDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  objectId: string;

  @IsEnum(ObjectCategory)
  @IsNotEmpty()
  objectCategory: ObjectCategory;
  
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidences: EvidenceDto[];
}

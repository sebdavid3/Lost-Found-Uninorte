import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectCategory } from '../../domain/enums';

export enum EvidenceType {
  SERIAL_NUMBER = 'SERIAL_NUMBER',
  DIGITAL_INVOICE = 'DIGITAL_INVOICE',
  DETAILED_DESCRIPTION = 'DETAILED_DESCRIPTION',
  REFERENCE_PHOTO = 'REFERENCE_PHOTO',
  LOCATION_DETAIL = 'LOCATION_DETAIL',
}

export class EvidenceDto {
  @IsEnum(EvidenceType)
  @IsNotEmpty()
  type: EvidenceType;

  @IsOptional()
  @IsString()
  url?: string;

  @IsString()
  @IsNotEmpty()
  description: string;
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
  
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidences: EvidenceDto[];

  @IsString()
  @IsOptional()
  lostLocation?: string;
}

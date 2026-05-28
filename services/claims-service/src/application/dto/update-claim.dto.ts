import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class UpdateClaimDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

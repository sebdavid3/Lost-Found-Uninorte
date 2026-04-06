import { IsEnum, IsOptional } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class UpdateClaimDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}

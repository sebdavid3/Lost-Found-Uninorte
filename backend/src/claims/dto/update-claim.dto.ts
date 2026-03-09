import { PartialType } from '@nestjs/mapped-types';
import { CreateClaimDto } from './create-claim.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;
}

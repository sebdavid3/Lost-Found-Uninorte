import { Module } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { ClaimFactoryProvider } from './factories/claim-factory.provider';
import { CommonClaimFactory } from './factories/common-claim.factory';
import { ElectronicClaimFactory } from './factories/electronic-claim.factory';

@Module({
  providers: [
    ClaimsService,
    ClaimFactoryProvider,
    CommonClaimFactory,
    ElectronicClaimFactory,
  ],
  controllers: [ClaimsController],
})
export class ClaimsModule {}

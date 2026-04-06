import { Module } from '@nestjs/common';
import { ClaimsService } from '../application/services/claims.service';
import { ClaimsController } from './controllers/claims.controller';
import { ClaimFactoryProvider } from '../application/factories/claim-factory.provider';
import { CommonClaimFactory } from '../application/factories/common-claim.factory';
import { ElectronicClaimFactory } from '../application/factories/electronic-claim.factory';
import { ClaimsServiceProxy } from './controllers/claims.service.proxy';
import { OutboxService } from '../application/services/outbox.service';
import { AntiCorruptionLayerService } from './acl/anti-corruption-layer.service';

@Module({
  providers: [
    ClaimsService,
    ClaimsServiceProxy,
    OutboxService,
    AntiCorruptionLayerService,
    ClaimFactoryProvider,
    CommonClaimFactory,
    ElectronicClaimFactory,
  ],
  controllers: [ClaimsController],
  exports: [OutboxService],
})
export class ClaimsModule {}

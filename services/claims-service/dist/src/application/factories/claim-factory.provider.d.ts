import { ClaimFactory } from './claim.factory';
import { ElectronicClaimFactory } from './electronic-claim.factory';
import { CommonClaimFactory } from './common-claim.factory';
import { ObjectCategory } from '@prisma/client';
export declare class ClaimFactoryProvider {
    private electronicFactory;
    private commonFactory;
    constructor(electronicFactory: ElectronicClaimFactory, commonFactory: CommonClaimFactory);
    getFactory(category: ObjectCategory): ClaimFactory;
}

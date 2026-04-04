import { Claim, Evidence, Object, User } from '@prisma/client';
export type ClaimVerificationPayload = Claim & {
    user: User;
    object: Object;
    evidences: Evidence[];
};
export interface ClaimVerificationContext {
    claim: ClaimVerificationPayload;
}

import { Claim, Evidence, Object as PrismaObject, User } from '@prisma/client';

export type ClaimVerificationPayload = Claim & {
  user: User;
  object: PrismaObject;
  evidences: Evidence[];
};

export interface ClaimVerificationContext {
  claim: ClaimVerificationPayload;
}

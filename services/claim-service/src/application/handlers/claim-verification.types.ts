import { Claim, Evidence } from '@prisma/client';

export interface SimpleUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SimpleObject {
  id: string;
  name: string;
  description: string;
  photo: string;
  category: string;
  location: string;
  foundAt: Date;
}

export type ClaimVerificationPayload = Claim & {
  user: SimpleUser;
  object: SimpleObject;
  evidences: Evidence[];
};

export interface ClaimVerificationContext {
  claim: ClaimVerificationPayload;
}

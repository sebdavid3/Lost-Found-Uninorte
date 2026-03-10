export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export enum ObjectCategory {
  ELECTRONIC = 'ELECTRONIC',
  COMMON = 'COMMON',
  CLOTHING = 'CLOTHING',
  STATIONERY = 'STATIONERY',
  DOCUMENT = 'DOCUMENT',
  ACCESSORY = 'ACCESSORY',
  OTHER = 'OTHER',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LostObject {
  id: string;
  description: string;
  photo: string;
  category: ObjectCategory;
  location: string;
  foundAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  url?: string | null;
  type: string;
  description?: string | null;
  claimId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  status: ClaimStatus;
  rejectionReason?: string | null;
  userId: string;
  objectId: string;
  object?: LostObject;
  user?: User;
  evidences?: Evidence[];
  createdAt: string;
  updatedAt: string;
}

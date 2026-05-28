export enum Role {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}

export enum ObjectCategory {
  ELECTRONIC = "ELECTRONIC",
  COMMON = "COMMON",
  CLOTHING = "CLOTHING",
  STATIONERY = "STATIONERY",
  DOCUMENT = "DOCUMENT",
  ACCESSORY = "ACCESSORY",
  OTHER = "OTHER",
}

export enum ClaimStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum EvidenceType {
  SERIAL_NUMBER = "SERIAL_NUMBER",
  DIGITAL_INVOICE = "DIGITAL_INVOICE",
  DETAILED_DESCRIPTION = "DETAILED_DESCRIPTION",
  REFERENCE_PHOTO = "REFERENCE_PHOTO",
  LOCATION_DETAIL = "LOCATION_DETAIL",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface FoundObject {
  id: string;
  name: string;
  description: string;
  photo: string;
  category: ObjectCategory;
  location: string;
  foundAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id?: string;
  type: EvidenceType;
  url?: string;
  description?: string;
}

export interface Claim {
  id: string;
  status: ClaimStatus;
  rejectionReason?: string | null;
  userId: string;
  objectId: string;
  user?: User;
  object?: FoundObject;
  evidences: Evidence[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
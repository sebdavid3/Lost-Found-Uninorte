export type Role = "ADMIN" | "STUDENT";
export const Role = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
} as const;

export type ObjectCategory =
  | "ELECTRONIC"
  | "COMMON"
  | "CLOTHING"
  | "STATIONERY"
  | "DOCUMENT"
  | "ACCESSORY"
  | "OTHER";
export const ObjectCategory = {
  ELECTRONIC: "ELECTRONIC",
  COMMON: "COMMON",
  CLOTHING: "CLOTHING",
  STATIONERY: "STATIONERY",
  DOCUMENT: "DOCUMENT",
  ACCESSORY: "ACCESSORY",
  OTHER: "OTHER",
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONIC: "Electrónico",
  COMMON: "Común",
  CLOTHING: "Ropa",
  STATIONERY: "Papelería",
  DOCUMENT: "Documento",
  ACCESSORY: "Accesorio",
  OTHER: "Otro",
};

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";
export const ClaimStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type EvidenceType =
  | "SERIAL_NUMBER"
  | "DIGITAL_INVOICE"
  | "DETAILED_DESCRIPTION"
  | "REFERENCE_PHOTO"
  | "LOCATION_DETAIL";
export const EvidenceType = {
  SERIAL_NUMBER: "SERIAL_NUMBER",
  DIGITAL_INVOICE: "DIGITAL_INVOICE",
  DETAILED_DESCRIPTION: "DETAILED_DESCRIPTION",
  REFERENCE_PHOTO: "REFERENCE_PHOTO",
  LOCATION_DETAIL: "LOCATION_DETAIL",
} as const;

export const EVIDENCE_LABELS: Record<string, string> = {
  SERIAL_NUMBER: "Número de serie",
  DIGITAL_INVOICE: "Factura digital",
  DETAILED_DESCRIPTION: "Descripción detallada",
  REFERENCE_PHOTO: "Foto de referencia",
  LOCATION_DETAIL: "Detalle de ubicación",
};

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
  storageLocation?: string | null;
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
  lostLocation?: string | null;
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

export interface CategoryStats {
  category: string;
  count: number;
  claims: number;
}

export interface ClaimsByDay {
  date: string;
  created: number;
  approved: number;
  rejected: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  object: string;
  category: string;
  status: string;
  date: string;
}

export interface DashboardStats {
  objects: {
    total: number;
    byCategory: CategoryStats[];
    byLocation: { location: string; count: number }[];
    recentAdded: number;
  };
  claims: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recentCreated: number;
    recentApproved: number;
    recentRejected: number;
    byDay: ClaimsByDay[];
    byLostLocation: { location: string; count: number }[];
  };
  recentActivity: RecentActivity[];
}
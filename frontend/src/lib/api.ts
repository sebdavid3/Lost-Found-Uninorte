import { Role, ObjectCategory, ClaimStatus, EvidenceType, User, FoundObject, Evidence, Claim } from "../types";

const CLAIMS_BASE_URL = import.meta.env.VITE_CLAIMS_API_URL || "http://localhost:3000";
const AUDIT_BASE_URL = import.meta.env.VITE_AUDIT_API_URL || "http://localhost:3001";

const getAuthHeaders = (): Record<string, string> => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const user = parsed?.state?.user;
      if (user) {
        return {
          "x-user-id": user.id,
          "x-user-role": user.role,
        };
      }
    }
  } catch (e) {
    console.error("Error reading auth headers from localStorage", e);
  }
  return {};
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isAudit = path.startsWith("/audit-log") || path.startsWith("/audit");
  const baseUrl = isAudit ? AUDIT_BASE_URL : CLAIMS_BASE_URL;
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Inyectar headers de autenticación automáticos
  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, val]) => {
    headers.set(key, val);
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "Error en la petición";
    try {
      const errBody = await response.json();
      errorMsg = errBody.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
};

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  // --- Objetos (Objects CRUD) ---
  getObjects: async (filters: { category?: string; location?: string; q?: string } = {}, page = 1, limit = 20): Promise<Paginated<FoundObject>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);
    if (filters.q) params.append("q", filters.q);
    params.append("page", String(page));
    params.append("limit", String(limit));

    // Nota: El backend original retorna un array directo o un paginado
    const res = await request<any>(`/objects?${params.toString()}`);
    if (res && res.items) {
      return res;
    }
    // Fallback si no está paginado
    const items = Array.isArray(res) ? res : [];
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  },

  getObjectById: (id: string) => request<FoundObject>(`/objects/${id}`),

  createObject: (obj: Omit<FoundObject, "id" | "createdAt" | "updatedAt">) =>
    request<FoundObject>("/objects", {
      method: "POST",
      body: JSON.stringify(obj),
    }),

  updateObject: (id: string, obj: Partial<Omit<FoundObject, "id" | "createdAt" | "updatedAt">>) =>
    request<FoundObject>(`/objects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(obj),
    }),

  deleteObject: (id: string) =>
    request<{ success: boolean }>(`/objects/${id}`, {
      method: "DELETE",
    }),

  // --- Reclamaciones (Claims CRUD & Saga) ---
  createClaim: (claim: { userId: string; objectId: string; objectCategory: ObjectCategory; evidences: Omit<Evidence, "id">[] }) =>
    request<Claim>("/claims", {
      method: "POST",
      body: JSON.stringify(claim),
    }),

  getClaims: async (page = 1, limit = 20): Promise<Paginated<Claim>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    const res = await request<any>(`/claims?${params.toString()}`);
    if (res && res.items) {
      return res;
    }
    const items = Array.isArray(res) ? res : [];
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  },

  getMyClaims: async (page = 1, limit = 20): Promise<Paginated<Claim>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    const res = await request<any>(`/claims/my?${params.toString()}`);
    if (res && res.items) {
      return res;
    }
    const items = Array.isArray(res) ? res : [];
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  },

  getClaimById: (id: string) => request<Claim>(`/claims/${id}`),

  updateClaim: (id: string, update: { status?: ClaimStatus; rejectionReason?: string }) =>
    request<Claim>(`/claims/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    }),

  deleteClaim: (id: string) =>
    request<{ success: boolean }>(`/claims/${id}`, {
      method: "DELETE",
    }),

  verifyClaim: (id: string) =>
    request<{ success: boolean; status: string; message?: string }>(`/claims/${id}/verify`, {
      method: "POST",
    }),

  // --- Auditoría (Audit Log & Integrity) ---
  getAuditLogs: async (page = 1, limit = 20): Promise<Paginated<any>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    const res = await request<any>(`/audit-log?${params.toString()}`);
    if (res && res.items) {
      return res;
    }
    const items = Array.isArray(res) ? res : [];
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  },

  verifyAuditIntegrity: () => request<{ isValid: boolean; brokenAt: string | null }>("/audit-log/verify-integrity"),

  getClaimAudit: (id: string) => request<any>(`/claims/${id}/audit`),
};

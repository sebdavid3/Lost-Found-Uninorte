import { ObjectCategory, ClaimStatus, type FoundObject, type Evidence, type Claim, type DashboardStats } from "../types";
import { useAuthStore } from "../stores/authStore";

const getAuthHeaders = (): Record<string, string> => {
  const user = useAuthStore.getState().user;
  if (user?.id && user?.role) {
    return {
      "x-user-id": user.id,
      "x-user-role": user.role,
    };
  }
  return {};
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = `/api${path}`;

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

  if (response.status === 204) {
    return null as T;
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
  getObjects: async (filters: { category?: string; location?: string; q?: string; status?: string } = {}, page = 1, limit = 20): Promise<Paginated<FoundObject>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.location) params.append("location", filters.location);
    if (filters.q) params.append("q", filters.q);
    if (filters.status) params.append("status", filters.status);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const res = await request<any>(`/objects?${params.toString()}`);

    // Mapear items para asegurar que tengan un campo 'name'
    const mapItem = (item: any): FoundObject => ({
      ...item,
      name: item.name || item.description || "Objeto sin nombre",
    });

    if (res && res.items) {
      return {
        ...res,
        items: res.items.map(mapItem),
      };
    }
    // Fallback si no está paginado
    const items = (Array.isArray(res) ? res : []).map(mapItem);
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  },

  getObjectById: (id: string) => request<FoundObject>(`/objects/${id}`),

  createObject: (obj: Omit<FoundObject, "id" | "createdAt" | "updatedAt" | "foundAt">) =>
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
  createClaim: (claim: { userId: string; objectId: string; objectCategory: ObjectCategory; evidences: Omit<Evidence, "id">[]; lostLocation?: string }) =>
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

  // --- Dashboard Stats ---
  getDashboardStats: () => request<DashboardStats>("/stats/dashboard"),
};

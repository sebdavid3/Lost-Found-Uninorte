import type { LostObject, Claim, Evidence } from '../types';

const API_BASE_URL = 'http://localhost:3000'; // Ajustar según el puerto real del backend

interface RequestOptions extends RequestInit {
  role?: string;
  userId?: string;
}

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { role, userId, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers || {});
  if (role) headers.append('x-user-role', role);
  if (userId) headers.append('x-user-id', userId);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error calling ${endpoint}: ${response.statusText}`);
  }

  return response.json();
}

export const apiService = {
  // --- OBJETOS ---
  getObjects: () => 
    apiFetch<LostObject[]>('/objects'),
    
  getObjectById: (id: string) => 
    apiFetch<LostObject>(`/objects/${id}`),

  // --- RECLAMACIONES ---
  createClaim: (data: { objectId: string, userId: string, objectCategory: string, evidences: Omit<Evidence, 'id' | 'claimId' | 'createdAt' | 'updatedAt'>[] }) =>
    apiFetch<Claim>('/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      role: 'STUDENT',
      userId: data.userId,
    }),

  getClaims: (role: string, userId: string) =>
    apiFetch<Claim[]>('/claims', { role, userId }),

  getClaimById: (id: string, role: string, userId: string) =>
    apiFetch<Claim>(`/claims/${id}`, { role, userId }),

  // --- PROCESAMIENTO (Chain of Responsibility) ---
  verifyClaim: (id: string, role: string, userId: string) =>
    apiFetch<{ message: string, claim: Claim }> (`/claims/${id}/verify`, {
      method: 'POST',
      role,
      userId,
    }),

  rejectClaim: (id: string, reason: string, role: string, userId: string) =>
    apiFetch<Claim>(`/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason }),
      role,
      userId,
    }),

  // --- AUDITORÍA (Visitor) ---
  auditClaim: (id: string, role: string, userId: string) =>
    apiFetch<{ 
      message: string, 
      auditReport: { score: number, details: string[] },
      similarityScores: Record<string, number> 
    }>(`/claims/${id}/audit`, { role, userId }),
};

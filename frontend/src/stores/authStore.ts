import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User, Role } from "../types";

const QUICK_USERS = [
  { email: "admin@uninorte.edu.co", name: "Administrador", role: Role.ADMIN },
  { email: "carre@uninorte.edu.co", name: "Andrés Carrero", role: Role.STUDENT },
  { email: "sebas@uninorte.edu.co", name: "Sebastian Ibañez", role: Role.STUDENT },
];

export { QUICK_USERS };

interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, role?: Role) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, role?: Role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`/api/users/me?email=${encodeURIComponent(email)}`);
          if (!res.ok) throw new Error("Error al conectar con el servidor");

          const data = await res.json();
          const foundUser: User = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role || role || Role.STUDENT,
          };

          set({
            user: foundUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.message || "Error al iniciar sesión",
          });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

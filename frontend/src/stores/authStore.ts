import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Role } from "../types";

// Simular una base de datos local de usuarios para pruebas
const MOCK_USERS: User[] = [
  {
    id: "admin-id-1",
    email: "admin@uninorte.edu.co",
    name: "Administrador de Objetos",
    role: Role.ADMIN,
  },
  {
    id: "student-id-1",
    email: "carre@uninorte.edu.co",
    name: "Andrés Carrero",
    role: Role.STUDENT,
  },
  {
    id: "student-id-2",
    email: "sebas@uninorte.edu.co",
    name: "Sebastian Ibañez",
    role: Role.STUDENT,
  },
];

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
          // Simular latencia de red
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Buscar el usuario mock
          let foundUser = MOCK_USERS.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          );

          // Si se especificó rol (para pruebas directas) y no se encontró por email, crear uno dinámico
          if (!foundUser && role) {
            foundUser = {
              id: `${role.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
              email,
              name: email.split("@")[0].replace(".", " "),
              role,
            };
          }

          if (!foundUser) {
            // Por defecto, si el email contiene "admin" es ADMIN, si no STUDENT
            const inferredRole = email.toLowerCase().includes("admin")
              ? Role.ADMIN
              : Role.STUDENT;

            foundUser = {
              id: `user-${Math.random().toString(36).substr(2, 9)}`,
              email,
              name: email.split("@")[0].split(".")[0],
              role: inferredRole,
            };
          }

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

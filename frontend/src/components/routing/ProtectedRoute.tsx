import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Role } from "../../types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">
            Cargando credenciales de acceso...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirigir a login y guardar la ubicación anterior
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si tiene un rol pero no está autorizado para esta ruta
    return <Navigate to="/unauthorized" replace />;
  }

  // Si está autenticado y tiene el rol correcto, renderiza el outlet
  return <Outlet />;
};

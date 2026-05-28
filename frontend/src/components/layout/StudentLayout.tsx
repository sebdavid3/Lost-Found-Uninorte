import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LogOut, Home, FileText } from "lucide-react";
import { Button } from "../ui/button";

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-black antialiased font-body">
      {/* Cabecera Estudiante */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-green flex items-center justify-center text-white font-display font-bold text-lg tracking-tighter">
                L&F
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-brand-black">
                Lost<span className="text-brand-green font-normal font-sans">Found</span>
              </span>
            </Link>
            
            {/* Navegación Estudiante */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                  isActive("/") ? "bg-gray-100 text-brand-green" : "text-brand-black hover:bg-gray-50 hover:text-brand-green"
                }`}
              >
                <Home className="h-4 w-4" />
                Catálogo de Objetos
              </Link>
              <Link 
                to="/mis-reclamaciones" 
                className={`text-sm font-semibold px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                  isActive("/mis-reclamaciones") ? "bg-gray-100 text-brand-green" : "text-brand-black hover:bg-gray-50 hover:text-brand-green"
                }`}
              >
                <FileText className="h-4 w-4" />
                Mis Reclamos
              </Link>
            </nav>
          </div>

          {/* Información y Cerrar Sesión */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-display font-bold">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ST"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-bold text-brand-black leading-tight">{user?.name || "Estudiante"}</span>
                <span className="text-xs font-mono text-gray-500 tracking-tight">{user?.email}</span>
              </div>
            </div>
            
            <div className="h-4 w-px bg-gray-200" />
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="rounded-pill hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Contenedor Acotado */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de menú para móviles */}
        <div className="flex md:hidden items-center justify-around gap-2 mb-6 border-b border-gray-100 pb-3">
          <Link 
            to="/" 
            className={`flex-1 text-center py-2 rounded-md text-xs font-bold transition-all ${
              isActive("/") ? "bg-brand-green text-white" : "bg-gray-50 text-brand-black"
            }`}
          >
            Catálogo
          </Link>
          <Link 
            to="/mis-reclamaciones" 
            className={`flex-1 text-center py-2 rounded-md text-xs font-bold transition-all ${
              isActive("/mis-reclamaciones") ? "bg-brand-green text-white" : "bg-gray-50 text-brand-black"
            }`}
          >
            Mis Reclamos
          </Link>
        </div>

        <Outlet />
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-gray-50 border-t border-gray-100 py-6 text-center text-xs text-gray-500 font-mono">
        <p>© {new Date().getFullYear()} Lost & Found Uninorte — Portal del Estudiante.</p>
      </footer>
    </div>
  );
};

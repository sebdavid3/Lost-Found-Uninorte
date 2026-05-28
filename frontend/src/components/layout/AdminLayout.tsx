import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  History, 
  LogOut, 
  Home, 
  Menu, 
  X
} from "lucide-react";
import { Button } from "../ui/button";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Reclamaciones",
      path: "/admin/claims",
      icon: FileText,
    },
    {
      name: "Objetos Perdidos",
      path: "/admin/objects",
      icon: Package,
    },
    {
      name: "Auditoría de Seguridad",
      path: "/admin/audit-logs",
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-brand-black antialiased font-body">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-near-black text-white shrink-0">
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-brand-coral flex items-center justify-center text-white font-display font-bold text-lg tracking-tighter">
              A
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Admin<span className="text-brand-coral font-sans font-normal">Panel</span>
            </span>
          </Link>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  active 
                    ? "bg-brand-coral text-white shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.name}
              </Link>
            );
          })}

          <div className="h-px bg-white/5 my-6" />

          {/* Volver a Vista Pública */}
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="h-4.5 w-4.5" />
            Catálogo Público
          </Link>
        </nav>

        {/* Footer del Sidebar con datos de Usuario */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral font-display font-bold text-sm">
              AD
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-mono text-brand-coral uppercase tracking-wider">ADMINISTRADOR</span>
              <span className="text-sm font-bold text-white truncate leading-tight">{user?.name || "Administrador"}</span>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 text-xs font-semibold px-4 py-2.5 flex items-center gap-2 transition-colors border-0"
          >
            <LogOut className="h-4.5 w-4.5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* MOBILE HEADER & NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Botón hamburguesa */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-display font-bold text-lg tracking-tight lg:text-xl">
              Lost & Found Uninorte — Consola de Control
            </h1>
          </div>

          {/* Estado de Seguridad / Bitácora */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Saga & Audit Activos
            </span>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL DEL ADMIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 transition-opacity" 
          />

          {/* Menú de Navegación Lateral */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-brand-near-black text-white h-full shadow-xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
              <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-brand-coral flex items-center justify-center text-white font-display font-bold text-lg tracking-tighter">
                  A
                </span>
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  Admin<span className="text-brand-coral font-sans font-normal">Panel</span>
                </span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      active 
                        ? "bg-brand-coral text-white shadow-sm" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.name}
                  </Link>
                );
              })}

              <div className="h-px bg-white/5 my-6" />

              <Link
                to="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Home className="h-4.5 w-4.5" />
                Catálogo Público
              </Link>
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-brand-coral/20 flex items-center justify-center text-brand-coral font-display font-bold text-sm">
                  AD
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-mono text-brand-coral uppercase tracking-wider">ADMINISTRADOR</span>
                  <span className="text-sm font-bold text-white truncate leading-tight">{user?.name || "Administrador"}</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleLogout();
                }}
                variant="ghost" 
                className="w-full justify-start rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/20 text-xs font-semibold px-4 py-2.5 flex items-center gap-2 transition-colors border-0"
              >
                <LogOut className="h-4.5 w-4.5" />
                Cerrar Sesión
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

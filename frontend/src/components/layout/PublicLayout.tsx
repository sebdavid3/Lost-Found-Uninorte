import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Role } from "../../types";
import { LogIn, LogOut, Shield, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../lib/api";

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [hasApprovedClaims, setHasApprovedClaims] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.role === Role.STUDENT) {
      api.getMyClaims(1, 100)
        .then((res) => {
          const approved = res.items?.some((c: any) => c.status === "APPROVED");
          setHasApprovedClaims(!!approved);
        })
        .catch((e) => console.error("Error check approved claims:", e));
    } else {
      setHasApprovedClaims(false);
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-black antialiased font-body">
      {/* Barra de Anuncios - Estilo cohere / design.md */}
      {showAnnouncement && (
        <div className="w-full bg-brand-black text-white text-[12px] md:text-[13px] font-mono tracking-wider py-2 px-4 flex justify-between items-center transition-all">
          <div className="flex-1 text-center">
            <span>✨ lost & found uninorte — canal oficial de reclamación de objetos perdidos universitarios.</span>
          </div>
          <button 
            onClick={() => setShowAnnouncement(false)}
            className="text-white/60 hover:text-white ml-2 focus:outline-none transition-colors"
            aria-label="Cerrar anuncio"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-green flex items-center justify-center text-white font-display font-bold text-lg tracking-tighter">
                L&F
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-brand-black">
                Lost<span className="text-brand-green font-normal font-sans">Found</span>Uninorte
              </span>
            </Link>
          </div>

          {/* Navegación Derecha */}
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-brand-black hover:text-brand-green transition-colors py-2 px-3 rounded-md hover:bg-gray-50">
              Catálogo
            </Link>

            {isAuthenticated && user && (
              <>
                {user.role === Role.STUDENT ? (
                  <Link 
                    to="/mis-reclamaciones" 
                    className="text-sm font-semibold text-brand-black hover:text-brand-green transition-colors py-2 px-3 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    Mis Reclamos
                    {hasApprovedClaims && (
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link 
                    to="/admin" 
                    className="text-sm font-semibold text-brand-black hover:text-brand-green transition-colors py-2 px-3 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <Shield className="h-4 w-4" />
                    Panel Admin
                  </Link>
                )}
              </>
            )}

            <div className="h-4 w-px bg-gray-200" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-mono tracking-tight text-gray-500 uppercase">{user.role}</span>
                  <span className="text-sm font-bold text-brand-black leading-tight">{user.name}</span>
                </div>
                <Button 
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  variant="outline" 
                  className="rounded-pill border-brand-near-black text-brand-near-black hover:bg-brand-near-black hover:text-white transition-all text-xs font-semibold px-4 py-2 flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Salir
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/login")}
                className="rounded-pill bg-brand-near-black hover:bg-brand-black text-white transition-all text-xs font-semibold px-5 py-2 flex items-center gap-2 shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                Ingresar
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer Estilo Cohere / design.md con dependencias en monocromo */}
      <footer className="bg-brand-near-black text-white py-12 px-6 border-t border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <span className="font-display font-bold text-2xl tracking-tighter text-white">
                Lost<span className="text-brand-coral font-normal font-sans">Found</span>Uninorte
              </span>
              <p className="text-gray-400 text-sm mt-3 max-w-sm leading-relaxed">
                Sistema institucional automatizado de registro y reclamación de objetos extraviados dentro de la Universidad del Norte.
              </p>
            </div>
            
            <div>
              <h3 className="font-mono text-xs text-brand-coral uppercase tracking-widest mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Catálogo Público</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Portal de Acceso</Link></li>
                <li><a href="https://www.uninorte.edu.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sitio Uninorte</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs text-brand-coral uppercase tracking-widest mb-4">Seguridad e Integridad</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><span className="font-mono text-xs text-gray-500">Tecnología confiable</span></li>
                <li><span className="font-mono text-xs text-gray-500">Registro de auditoría</span></li>
                <li><span className="font-mono text-xs text-gray-500">Procesos verificados</span></li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full mb-8" />

          {/* Dependencias Monocromo en espaciado horizontal (trust-logo-strip) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
            <div className="flex flex-wrap items-center gap-6 opacity-45">
              <span>UNIVERSIDAD DEL NORTE</span>
              <span>•</span>
              <span>BIENESTAR UNIVERSITARIO</span>
            </div>
            <p>© {new Date().getFullYear()} Universidad del Norte. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

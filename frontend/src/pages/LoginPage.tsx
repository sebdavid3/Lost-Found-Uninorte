import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, QUICK_USERS } from "../stores/authStore";
import { Role } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, User as UserIcon, ArrowRight, CheckCircle2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.STUDENT);

  // Ubicación a redirigir después de autenticar
  const from = (location.state as any)?.from?.pathname || "/";

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email, role);
    navigate(from, { replace: true });
  };

  const handleQuickLogin = async (selectedEmail: string, selectedRole: Role) => {
    clearError();
    await login(selectedEmail, selectedRole);
    const redirectPath = selectedRole === Role.ADMIN ? "/admin" : from;
    navigate(redirectPath, { replace: true });
  };

  const quickUsers = [
    {
      name: "Andrés Carrero (Estudiante)",
      email: QUICK_USERS[1].email,
      role: Role.STUDENT,
      icon: UserIcon,
      color: "border-brand-green bg-emerald-50/50 hover:bg-emerald-50 text-brand-green",
    },
    {
      name: "Sebastian Ibañez (Estudiante)",
      email: QUICK_USERS[2].email,
      role: Role.STUDENT,
      icon: UserIcon,
      color: "border-brand-green bg-emerald-50/50 hover:bg-emerald-50 text-brand-green",
    },
    {
      name: "Administrador",
      email: QUICK_USERS[0].email,
      role: Role.ADMIN,
      icon: Shield,
      color: "border-brand-coral bg-orange-50/50 hover:bg-orange-50 text-brand-coral",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-brand-black font-body antialiased">
      {/* SECCIÓN IZQUIERDA: HERO / BANNER INSTITUCIONAL */}
      <div className="lg:w-1/2 bg-brand-green text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Decoraciones abstractas estilo Cohere */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-navy/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <span className="h-10 w-10 rounded-xl bg-white text-brand-green flex items-center justify-center font-display font-bold text-xl tracking-tighter shadow-md">
              L&F
            </span>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              Lost<span className="text-brand-coral font-sans font-normal">Found</span>Uninorte
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none mb-6">
              Recupera lo que es tuyo.
            </h2>
            <p className="text-emerald-100 text-base md:text-lg leading-relaxed mb-8">
              Portal institucional de objetos extraviados en el campus de la Universidad del Norte.
            </p>
          </div>
        </div>

        {/* Pilares del Proyecto */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="flex items-start gap-2.5 bg-black/15 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-brand-coral shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-brand-coral">Fácil y rápido</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Registrá tu reclamación en pocos pasos con evidencias simples.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-black/15 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-brand-coral shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-brand-coral">Seguro y confiable</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Cada acción queda registrada con total transparencia.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
          <div className="mb-8">
            <h3 className="font-display text-2xl font-bold text-brand-black tracking-tight">
              Ingresar al portal
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Inicia sesión de forma instantánea usando un perfil preconfigurado o ingresa un correo personalizado.
            </p>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* SELECCIÓN RÁPIDA DE USUARIO */}
          <div className="space-y-3 mb-8">
            <Label className="text-xs font-mono tracking-wider uppercase text-gray-500 block mb-2">
              ⚡ Acceso rápido
            </Label>
            <div className="grid grid-cols-1 gap-2.5">
              {quickUsers.map((u) => {
                const Icon = u.icon;
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickLogin(u.email, u.role)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${u.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{u.name}</h4>
                        <span className="text-[11px] font-mono leading-none opacity-85 block mt-0.5">{u.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-3 items-center mb-6">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono tracking-wider text-gray-400 uppercase">o credenciales personalizadas</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* FORMULARIO MANUAL */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-mono tracking-wider uppercase text-gray-500">Correo Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="ej: carre@uninorte.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono tracking-wider uppercase text-gray-500 block">Rol del Usuario</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole(Role.STUDENT)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    role === Role.STUDENT
                      ? "border-brand-green bg-brand-green/5 text-brand-green"
                      : "border-gray-100 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setRole(Role.ADMIN)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    role === Role.ADMIN
                      ? "border-brand-coral bg-brand-coral/5 text-brand-coral"
                      : "border-gray-100 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  Administrador
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold h-11 shadow-sm mt-2 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 font-mono mt-8">
            Universidad del Norte
          </p>
        </div>
      </div>
    </div>
  );
};

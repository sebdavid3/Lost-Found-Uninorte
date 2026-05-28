import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, ArrowRight, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    try {
      // Simular latencia de red
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast.success("¡Registro de estudiante simulado con éxito!", {
        description: "Ya puedes iniciar sesión con tu nuevo correo.",
      });

      // Redirigir a login
      navigate("/login");
    } catch {
      toast.error("Error al registrar el estudiante.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-brand-black font-body antialiased">
      {/* SECCIÓN IZQUIERDA: HERO */}
      <div className="lg:w-1/2 bg-brand-green text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
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
              Únete a la comunidad.
            </h2>
            <p className="text-emerald-100 text-base md:text-lg leading-relaxed mb-8">
              Regístrate en la plataforma para poder radicar y hacer seguimiento de tus reclamos sobre pertenencias perdidas de manera oficial.
            </p>
          </div>
        </div>

        {/* Pilares del Proyecto */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="flex items-start gap-2.5 bg-black/15 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-brand-coral shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-brand-coral">Control Total</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Sigue el estado de tus reclamos en tiempo real.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-black/15 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <CheckCircle2 className="h-5 w-5 text-brand-coral shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono tracking-wider uppercase text-brand-coral">Notificaciones</h4>
              <p className="text-xs text-emerald-100/80 mt-1">Mantente informado mediante correos y alertas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
          <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-green transition-colors font-semibold mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al portal
            </Link>
            <h3 className="font-display text-2xl font-bold text-brand-black tracking-tight">
              Crear cuenta de estudiante
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Regístrate con tu correo Uninorte para gestionar tus objetos perdidos.
            </p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-mono tracking-wider uppercase text-gray-500">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="ej: Andrés Carrero"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green h-11"
              />
            </div>

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

            <Button
              type="submit"
              disabled={isLoading || !name || !email}
              className="w-full rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold h-11 shadow-sm mt-2 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Registrando...
                </>
              ) : (
                <>
                  Registrar estudiante
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 font-mono mt-8">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-brand-green font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

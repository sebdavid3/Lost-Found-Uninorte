import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-black px-6 font-body antialiased">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm text-center">
        {/* Icono de Alerta de Escudo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
            <ShieldAlert className="h-8 w-8 animate-bounce" />
          </div>
        </div>
        
        <h3 className="font-display text-2xl font-bold tracking-tight text-brand-black mb-2">
          Acceso denegado
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          No tienes los privilegios necesarios para ver esta sección. Si crees que esto es un error, por favor contacta con el administrador de la plataforma.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 rounded-pill border-brand-near-black text-brand-near-black hover:bg-gray-50 text-xs font-semibold h-11"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className="flex-1 rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold h-11 shadow-sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al Catálogo
          </Button>
        </div>
      </div>
    </div>
  );
};

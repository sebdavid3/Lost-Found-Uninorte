import React from 'react';
import { Lock, Eye } from 'lucide-react';
import type { Role } from '../types';

/**
 * Patrón Proxy para Protección de Datos
 * Misión: Controlar el acceso visual a información sensible (evidencias)
 * basado en el rol del usuario.
 */

interface DataProtectionProxyProps {
  userRole: Role;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  blur?: boolean;
}

export const DataProtectionProxy: React.FC<DataProtectionProxyProps> = ({ 
  userRole, 
  children, 
  placeholder,
  blur = true 
}) => {
  const isAdmin = userRole === 'ADMIN';

  if (isAdmin) {
    return <>{children}</>;
  }

  if (placeholder) {
    return <>{placeholder}</>;
  }

  return (
    <div className="relative group overflow-hidden rounded-lg">
      <div className={blur ? "filter blur-md grayscale pointer-events-none transition-all" : ""}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-white p-4 text-center">
        <Lock className="w-6 h-6 mb-2 text-amber-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Acceso Protegido</p>
        <p className="text-[8px] mt-1 opacity-70">Privacidad de Evidencias (Proxy Activo)</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-amber-500 text-black text-[8px] font-bold px-2 py-1 rounded flex items-center gap-1">
          <Eye className="w-2 h-2" /> REQUERIDO ADMIN
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Claim } from '../types';

interface AdminClaimTableProps {
  claims: Claim[];
  onViewDetails: (claim: Claim) => void;
}

export const AdminClaimTable: React.FC<AdminClaimTableProps> = ({ claims, onViewDetails }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm"><CheckCircle className="w-4 h-4" /> APROBADA</span>;
      case 'REJECTED':
        return <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm"><XCircle className="w-4 h-4" /> RECHAZADA</span>;
      default:
        return <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm"><Clock className="w-4 h-4" /> PENDIENTE</span>;
    }
  };

  if (claims.length === 0) {
    return (
      <div className="w-full p-8 text-center rounded-2xl border border-slate-700/50 bg-slate-800/50 text-slate-300">
        <p className="font-semibold">No hay reclamaciones registradas.</p>
        <p className="text-sm text-slate-400 mt-1">Cuando lleguen nuevas solicitudes aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 shadow-xl backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700/50">
              <th className="px-5 py-4">ID Ref</th>
              <th className="px-5 py-4">Objeto Reclamado</th>
              <th className="px-5 py-4">Estudiante</th>
              <th className="px-5 py-4">Fecha Solicitud</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-700/50 text-slate-200 bg-transparent leading-relaxed">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-5 py-4 font-mono text-xs text-slate-400">
                  <span className="bg-slate-900/50 px-2 py-1 rounded inline-block">#{claim.id.split('-')[0]}</span>
                </td>
                <td className="px-5 py-4 font-medium text-white max-w-[260px]">
                  <p className="line-clamp-2">{claim.object?.description}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 shrink-0">
                      {(claim.userId === '123' ? 'Juan Pérez' : 'Anon').charAt(0)}
                    </div>
                    <span className="text-slate-200">{claim.userId === '123' ? 'Juan Pérez' : 'Estudiante Anon'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                  {new Date(claim.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}
                </td>
                <td className="px-5 py-4">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button 
                    onClick={() => onViewDetails(claim)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/30 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" /> Gestor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

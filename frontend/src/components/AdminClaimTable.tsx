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

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-800/50 shadow-2xl backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700/50">
              <th className="px-8 py-5">ID Ref</th>
              <th className="px-8 py-5">Objeto Reclamado</th>
              <th className="px-8 py-5">Estudiante</th>
              <th className="px-8 py-5">Fecha Solicitud</th>
              <th className="px-8 py-5">Estado</th>
              <th className="px-8 py-5 text-right w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-700/50 text-slate-200 bg-transparent">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-8 py-6 font-mono text-xs text-slate-400">
                  <span className="bg-slate-900/50 px-2 py-1 rounded inline-block">#{claim.id.split('-')[0]}</span>
                </td>
                <td className="px-8 py-6 font-medium text-white">
                  {claim.object?.description}
                </td>
                <td className="px-8 py-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 shrink-0">
                    {(claim.userId === '123' ? 'Juan Pérez' : 'Anon').charAt(0)}
                  </div>
                  <span>{claim.userId === '123' ? 'Juan Pérez' : 'Estudiante Anon'}</span>
                </td>
                <td className="px-8 py-6 text-slate-400">
                  {new Date(claim.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}
                </td>
                <td className="px-8 py-6">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => onViewDetails(claim)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/30 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
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

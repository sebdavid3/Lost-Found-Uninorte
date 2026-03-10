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
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> APROBADA</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> RECHAZADA</span>;
      default:
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> PENDIENTE</span>;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Objeto</th>
            <th className="px-6 py-4">Estudiante</th>
            <th className="px-6 py-4">Fecha Solicitud</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-white/10 text-gray-200">
          {claims.map((claim) => (
            <tr key={claim.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-xs text-gray-400">
                #{claim.id.split('-')[0]}
              </td>
              <td className="px-6 py-4 font-medium text-white">
                {claim.object?.description}
              </td>
              <td className="px-6 py-4">
                {claim.userId === '123' ? 'Juan Pérez' : 'Estudiante Anon'}
              </td>
              <td className="px-6 py-4 text-xs">
                {new Date(claim.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(claim.status)}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onViewDetails(claim)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-[var(--primary)] text-white text-xs font-bold rounded-lg transition-all group-hover:scale-105"
                >
                  <Eye className="w-3 h-3" /> Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

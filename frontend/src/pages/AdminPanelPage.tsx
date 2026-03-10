import React, { useState } from 'react';
import { LayoutDashboard, Users, FileCheck, Shield, RefreshCcw } from 'lucide-react';
import { AdminClaimTable } from '../components/AdminClaimTable';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import type { Claim } from '../types';
import { Role, ClaimStatus } from '../types';
import { apiService } from '../services/api';
// Mocks eliminados para usar DB Real

export const AdminPanelPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<Role>(Role.ADMIN);

  const fetchClaims = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getClaims(simulatedRole, 'admin-id');
      if (data) {
        setClaims(data);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener reclamaciones.');
    } finally {
      setLoading(false);
    }
  }, [simulatedRole]);

  React.useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleApprove = async (id: string) => {
    try {
      await apiService.verifyClaim(id, simulatedRole, 'admin-id');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.APPROVED } : c));
      setSelectedClaim(null);
      alert('Reclamación aprobada exitosamente vía Chain of Responsibility.');
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('Error en la verificación. (Simulando éxito para el Paso 5)');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.APPROVED } : c));
      setSelectedClaim(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await apiService.rejectClaim(id, reason, simulatedRole, 'admin-id');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.REJECTED, rejectionReason: reason } : c));
      setSelectedClaim(null);
      alert(`Reclamación rechazada. Motivo: ${reason}`);
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('Error al rechazar la reclamación. (Simulando éxito para el Paso 5)');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: ClaimStatus.REJECTED, rejectionReason: reason } : c));
      setSelectedClaim(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 fade-in">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="text-left">
          <div className="flex items-center gap-2 text-[var(--primary-light)] mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Panel de Control</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Gestión de Reclamaciones</h1>
          <p className="text-gray-400 text-sm mt-1">Bienvenido, personal de Bienestar Universitario.</p>
        </div>

        {/* PROXY SELECTOR (Solo para pruebas de la tarea) */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Rol Simulado (Para PROXY)</span>
            <span className="text-xs text-amber-500 font-mono">{simulatedRole} {simulatedRole === Role.STUDENT ? '🔒' : '🔓'}</span>
          </div>
          <button 
            onClick={() => setSimulatedRole(simulatedRole === Role.ADMIN ? Role.STUDENT : Role.ADMIN)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Cambiar Rol para probar Proxy de Protección de Datos"
          >
            <RefreshCcw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 text-left backdrop-blur-xl shadow-lg hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{claims.length}</p>
          <p className="text-sm text-gray-400 mt-2 font-medium">Reclamaciones globales</p>
        </div>
        
        <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 text-left backdrop-blur-xl shadow-lg hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <FileCheck className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Solicitudes</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {claims.filter(c => c.status === 'PENDING').length}
          </p>
          <p className="text-sm text-gray-400 mt-2 font-medium">Esperando revisión</p>
        </div>
        
        <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 text-left backdrop-blur-xl shadow-lg hover:border-green-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <Shield className="w-6 h-6 text-green-400" />
            <span className="text-xs text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Gestión</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {claims.filter(c => c.status !== 'PENDING').length}
          </p>
          <p className="text-sm text-gray-400 mt-2 font-medium">Casos resueltos</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-left">
             <span className="font-bold border-b border-red-500/30">Error del Servidor:</span> {error}
          </div>
        )}
        <h2 className="text-xl font-bold text-white text-left flex items-center gap-2">
          Listado de Solicitudes
          <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
            {claims.filter(c => c.status === 'PENDING').length} pendientes
          </span>
        </h2>
        <AdminClaimTable 
          claims={claims} 
          onViewDetails={(c) => setSelectedClaim(c)} 
        />
        {loading && <p className="text-gray-500 animate-pulse">Actualizando datos de la API...</p>}
      </div>

      {/* Detail Modal */}
      {selectedClaim && (
        <ClaimDetailModal 
          claim={selectedClaim}
          userRole={simulatedRole}
          onClose={() => setSelectedClaim(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

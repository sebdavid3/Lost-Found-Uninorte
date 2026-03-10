import React, { useState } from 'react';
import { LayoutDashboard, Users, FileCheck, Shield, RefreshCcw } from 'lucide-react';
import { AdminClaimTable } from '../components/AdminClaimTable';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import type { Claim, Role } from '../types';
import { apiService } from '../services/api';
import { mockLostObjects } from '../services/mockData';

// Generar reclamos mock basados en los objetos
const initialMockClaims: Claim[] = [
  {
    id: 'claim-1',
    status: 'PENDING',
    userId: '123',
    objectId: '1',
    object: mockLostObjects[0],
    evidences: [
      { id: 'ev-1', type: 'NÚMERO DE SERIE', description: 'ABC-987-XYZ', claimId: 'claim-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'ev-2', type: 'FACTURA DIGITAL', description: 'Factura adjunta en formato PDF', url: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=400', claimId: 'claim-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'claim-2',
    status: 'PENDING',
    userId: '456',
    objectId: '2',
    object: mockLostObjects[1],
    evidences: [
      { id: 'ev-3', type: 'DESCRIPCIÓN DISTINTIVA', description: 'Tiene una calcomanía de un gato en la base.', claimId: 'claim-2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const AdminPanelPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(initialMockClaims);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<Role>('ADMIN');

  const fetchClaims = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getClaims(simulatedRole, 'admin-id');
      if (data && data.length > 0) {
        setClaims(data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
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
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c));
      setSelectedClaim(null);
      alert('Reclamación aprobada exitosamente vía Chain of Responsibility.');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error en la verificación. (Simulando éxito para el Paso 5)');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c));
      setSelectedClaim(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await apiService.rejectClaim(id, reason, simulatedRole, 'admin-id');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED', rejectionReason: reason } : c));
      setSelectedClaim(null);
      alert(`Reclamación rechazada. Motivo: ${reason}`);
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar la reclamación. (Simulando éxito para el Paso 5)');
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED', rejectionReason: reason } : c));
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
            <span className="text-xs text-amber-500 font-mono">{simulatedRole} {simulatedRole === 'STUDENT' ? '🔒' : '🔓'}</span>
          </div>
          <button 
            onClick={() => setSimulatedRole(simulatedRole === 'ADMIN' ? 'STUDENT' : 'ADMIN')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Cambiar Rol para probar Proxy de Protección de Datos"
          >
            <RefreshCcw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{claims.length}</p>
          <p className="text-xs text-gray-400 mt-1">Nuevas solicitudes</p>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
          <div className="flex justify-between items-start mb-4">
            <FileCheck className="w-5 h-5 text-green-400" />
            <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">Progreso</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {claims.filter(c => c.status !== 'PENDING').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Gestionadas hoy</p>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
          <div className="flex justify-between items-start mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">Seguridad</span>
          </div>
          <p className="text-2xl font-bold text-white">Módulo</p>
          <p className="text-xs text-gray-400 mt-1">Protección Proxy Activa</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
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

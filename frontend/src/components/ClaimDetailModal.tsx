import React from 'react';
import { X, CheckCircle, XCircle, FileText, User, Tag, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Claim, Role } from '../types';
import { DataProtectionProxy } from '../patterns/DataProtectionProxy';
import { ProcessingStepper } from '../patterns/ProcessingStepper';
import { EvidenceVisitorModal } from '../patterns/EvidenceVisitor';

interface ClaimDetailModalProps {
  claim: Claim;
  userRole: Role;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({ 
  claim, 
  userRole, 
  onClose, 
  onApprove, 
  onReject 
}) => {
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [showRejectForm, setShowRejectForm] = React.useState(false);
  const [showAuditor, setShowAuditor] = React.useState(false);

  const activeStep = claim.status === 'APPROVED' ? 2 : claim.status === 'REJECTED' ? 1 : 0;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="glass-card w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detalle de Reclamación</h2>
              <p className="text-xs text-gray-400 font-mono">ID: {claim.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* STEPPER (Chain of Responsibility Representation) */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-left">Cadena de Procesamiento</h3>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <ProcessingStepper currentStatus={claim.status} activeStep={activeStep} />
            </div>
          </div>

          {/* Grid de Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Información del Objeto</h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Tag className="w-4 h-4 text-[var(--primary-light)]" />
                  <span className="font-medium">{claim.object?.description}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Encontrado en: {claim.object?.location}</span>
                </div>
                <div className="pt-2">
                   <img 
                    src={claim.object?.photo} 
                    alt="Objeto" 
                    className="w-full h-32 object-cover rounded-lg border border-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Solicitante</h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Juan Pérez</p>
                    <p className="text-[10px] text-gray-500">Código: 200123456</p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20">
                    ESTUDIANTE REGULAR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Evidencias con PROXY */}
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Evidencias Presentadas (Sustento)</h3>
              {userRole === 'ADMIN' && (
                <button 
                  onClick={() => setShowAuditor(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                >
                  <ShieldCheck className="w-3 h-3" /> AUDITAR EVIDENCIAS (VISITOR)
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {claim.evidences?.map((ev, idx) => (
                <div key={ev.id || idx} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[var(--primary-light)] bg-[var(--primary)]/10 px-2 py-0.5 rounded uppercase">{ev.type}</span>
                    <ExternalLink className="w-3 h-3 text-gray-600" />
                  </div>
                  
                  {/* AQUÍ SE APLICA EL PATRÓN PROXY */}
                  <DataProtectionProxy userRole={userRole}>
                    <p className="text-xs text-gray-300 italic">"{ev.description}"</p>
                    {ev.url && (
                      <img 
                        src={ev.url} 
                        alt="Evidencia" 
                        className="w-full h-24 object-cover rounded-md mt-2 border border-white/10"
                      />
                    )}
                  </DataProtectionProxy>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          {claim.status === 'PENDING' && !showRejectForm && (
            <div className="pt-6 flex gap-3">
              <button 
                onClick={() => onApprove(claim.id)}
                className="flex-1 py-3 bg-[var(--success)] hover:bg-green-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Aprobar Reclamación
              </button>
              <button 
                onClick={() => setShowRejectForm(true)}
                className="flex-1 py-3 bg-white/10 hover:bg-red-500/20 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Rechazar
              </button>
            </div>
          )}

          {showRejectForm && (
            <div className="pt-6 border-t border-white/10 space-y-4 fade-in">
              <div className="form-group">
                <label className="form-label">Motivo de Rechazo</label>
                <textarea 
                  className="form-input min-h-[80px]"
                  placeholder="Explica al estudiante por qué su evidencia no es válida..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onReject(claim.id, rejectionReason)}
                  disabled={!rejectionReason}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                >
                  Confirmar Rechazo
                </button>
                <button 
                  onClick={() => setShowRejectForm(false)}
                  className="px-6 py-3 bg-white/5 text-gray-400 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VISITOR Modal */}
      <EvidenceVisitorModal 
        evidences={claim.evidences || []} 
        isOpen={showAuditor} 
        onClose={() => setShowAuditor(false)} 
      />
    </div>
  );
};

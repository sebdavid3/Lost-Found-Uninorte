import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import type { LostObject } from '../types';
import { ClaimFormFactory, type EvidenceData } from '../patterns/ClaimFormFactory';

interface ClaimFormProps {
  object: LostObject;
  onClose: () => void;
  onSubmit: (evidences: EvidenceData[]) => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ object, onClose, onSubmit }) => {
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([]);
  const [error, setError] = useState<string | undefined>();

  // Regla de Negocio: Validar tiempo para donación (6 meses = 180 días aprox)
  // Mostramos alerta si han pasado más de 120 días (4 meses)
  const foundDate = new Date(object.foundAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - foundDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isNearSemester = diffDays > 120;

  const handleValidationAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de sustento según tipo
    if (evidenceData.length === 0) {
      setError('Debes proporcionar al menos un sustento de propiedad válido.');
      return;
    }

    setError(undefined);
    onSubmit(evidenceData);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="glass-card w-full max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Reclamar Objeto</h2>
            <p className="text-xs text-gray-400 mt-1">ID: {object.id.split('-')[0]}...</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Objeto Resumen */}
          <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <img 
              src={object.photo} 
              alt={object.description} 
              className="w-20 h-20 object-cover rounded-lg border border-white/10"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white line-clamp-1">{object.description}</p>
              <p className="text-xs text-gray-400 mt-1">{object.location}</p>
              <div className="item-category mt-2 mb-0">{object.category}</div>
            </div>
          </div>

          {/* Alerta de Donación */}
          {isNearSemester && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex gap-3 items-start animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-amber-500 text-xs font-bold uppercase tracking-wider">Aviso de Donación Próxima</p>
                <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
                  Este objeto está cerca de cumplir el tiempo límite en almacén. Si no es reclamado pronto, se procederá a su donación o descarte institucional.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleValidationAndSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                Sustento de Propiedad
              </h3>
              <p className="text-xs text-gray-400">
                La información proporcionada será validada por el personal de Bienestar Universitario.
              </p>
            </div>

            {/* Factory Rendering */}
            {ClaimFormFactory.getFields(object.category, setEvidenceData, error)}

            <div className="pt-4">
              <button type="submit" className="btn-primary w-full group py-4">
                Enviar Reclamación
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
              <p className="text-[10px] text-center text-gray-500 mt-4 px-4">
                Al enviar, declaras que la información es verídica según el manual de convivencia de la Universidad del Norte.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

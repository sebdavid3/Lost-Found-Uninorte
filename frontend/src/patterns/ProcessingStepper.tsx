import React from 'react';
import { Check, ClipboardList, ShieldCheck, Database, Search } from 'lucide-react';

/**
 * Patrón Chain of Responsibility (Visualización)
 * Representa los eslabones de verificación en el backend:
 * 1. IdentityHandler -> 2. AvailabilityHandler -> 3. EvidenceMatchHandler
 */

interface StepperProps {
  currentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  activeStep?: number; // 0: Identity, 1: Availability, 2: Evidence Match
}

export const ProcessingStepper: React.FC<StepperProps> = ({ currentStatus, activeStep = 0 }) => {
  const steps = [
    { label: 'Identidad', icon: ShieldCheck, desc: 'Validando Usuario' },
    { label: 'Disponibilidad', icon: Database, desc: 'Verificando Stock' },
    { label: 'Evidencia', icon: Search, desc: 'Cruce de Datos' },
  ];

  const isCompleted = currentStatus === 'APPROVED';
  const isFailed = currentStatus === 'REJECTED';

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative px-2">
        {/* Línea de fondo */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Línea de progreso */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-[var(--primary)] -translate-y-1/2 z-0 rounded-full transition-all duration-700"
          style={{ width: isCompleted ? '100%' : `${(activeStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep;
          const isDone = index < activeStep || isCompleted;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${isDone 
                  ? 'bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_15px_rgba(255,193,7,0.4)]' 
                  : isCurrent && !isFailed
                    ? 'bg-gray-800 border-[var(--primary)] animate-pulse'
                    : isFailed && index === activeStep
                      ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-gray-900 border-white/10 text-gray-500'
                }
              `}>
                {isDone ? (
                  <Check className="w-5 h-5 text-black font-bold" />
                ) : (
                  <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                )}
              </div>
              
              <div className="absolute top-12 flex flex-col items-center w-32 text-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-gray-400 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mensaje de Estado Final */}
      <div className="mt-20 flex justify-center">
        {isCompleted && (
          <div className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> CADENA DE RESPONSABILIDAD COMPLETADA
          </div>
        )}
        {isFailed && (
          <div className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> VERIFICACIÓN INTERRUMPIDA
          </div>
        )}
      </div>
    </div>
  );
};

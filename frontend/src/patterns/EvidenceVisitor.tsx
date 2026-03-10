import React from 'react';
import { ShieldCheck, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Evidence } from '../types';

/**
 * Patrón Visitor (Lógica Frontend)
 * Misión: Analizar evidencias y generar un reporte de auditoría visual.
 */

interface AuditResult {
  matchScore: number;
  complianceChecked: boolean;
  notes: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Interfaz del Visitante
interface IVisitor {
  visitElectronicEvidence(ev: Evidence): void;
  visitCommonEvidence(ev: Evidence): void;
  getReport(): AuditResult;
}

// Implementación del Visitante de Auditoría
class ClaimAuditVisitor implements IVisitor {
  private score = 0;
  private notes: string[] = [];
  private count = 0;

  visitElectronicEvidence(ev: Evidence) {
    this.count++;
    const desc = ev.description || '';
    if (desc.length > 5 && desc.includes('-')) {
      this.score += 40; // Formato de serial probable
      this.notes.push('Estructura de ID electrónico válida.');
    } else {
      this.score += 10;
      this.notes.push('Descripción de ID electrónico débil.');
    }
  }

  visitCommonEvidence(ev: Evidence) {
    this.count++;
    const desc = ev.description || '';
    if (desc.length > 20) {
      this.score += 30;
      this.notes.push('Descripción detallada sustancial.');
    } else {
      this.score += 15;
      this.notes.push('Descripción común genérica.');
    }
  }

  getReport(): AuditResult {
    const finalScore = Math.min(this.score, 100);
    return {
      matchScore: finalScore,
      complianceChecked: true,
      notes: this.notes,
      riskLevel: finalScore > 70 ? 'LOW' : finalScore > 40 ? 'MEDIUM' : 'HIGH',
    };
  }
}

interface EvidenceVisitorProps {
  evidences: Evidence[];
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceVisitorModal: React.FC<EvidenceVisitorProps> = ({ evidences, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Ejecutar el patrón Visitor
  const visitor = new ClaimAuditVisitor();
  evidences.forEach(ev => {
    if (ev.type.includes('SERIE') || ev.type.includes('FACTURA')) {
      visitor.visitElectronicEvidence(ev);
    } else {
      visitor.visitCommonEvidence(ev);
    }
  });

  const report = visitor.getReport();

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md fade-in">
      <div className="glass-card w-full max-w-md p-8 border-amber-500/30">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-white">Reporte de Auditoría</h2>
        </div>

        <div className="space-y-6 text-left">
          {/* Match Score */}
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Puntaje de Coincidencia</p>
              <p className="text-4xl font-bold text-white mt-1">{report.matchScore}%</p>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-[10px] font-bold
              ${report.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' : 
                report.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}
            `}>
              RIESGO {report.riskLevel}
            </div>
          </div>

          {/* Hallazgos (Visitor Notes) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Hallazgos del Visitante
            </h3>
            <div className="space-y-2">
              {report.notes.map((note, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-300 items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-3 text-xs text-amber-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Este reporte es generado mediante el análisis algorítmico de evidencias (Patrón Visitor) para apoyar la decisión humana.</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

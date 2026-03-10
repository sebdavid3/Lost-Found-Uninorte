import React from 'react';
import { FileText, Type } from 'lucide-react';
import { ObjectCategory } from '../types';

/**
 * Abstract Factory Pattern para campos de evidencia
 * Misión: Proveer diferentes conjuntos de inputs según la categoría del objeto.
 */

export interface EvidenceData {
  type: string;
  description: string;
  url?: string;
}

interface EvidenceFieldsProps {
  onChange: (data: EvidenceData[]) => void;
  errors?: string;
}

// 1. Producto Concreto: Campos para Electrónicos
const ElectronicEvidenceFields: React.FC<EvidenceFieldsProps> = ({ onChange, errors }) => {
  const [serie, setSerie] = React.useState('');
  const [hasInvoice, setHasInvoice] = React.useState(false);

  React.useEffect(() => {
    const evidences: EvidenceData[] = [];
    if (serie) {
      evidences.push({ type: 'NÚMERO DE SERIE', description: serie });
    }
    if (hasInvoice) {
      evidences.push({ type: 'FACTURA DIGITAL', description: 'El usuario confirma tener factura' });
    }
    onChange(evidences);
  }, [serie, hasInvoice, onChange]);

  return (
    <div className="space-y-4 fade-in">
      <div className="form-group">
        <label className="form-label flex items-center gap-2">
          <Type className="w-4 h-4 text-[var(--primary-light)]" />
          Número de Serie / IMEI
        </label>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Ej: ABC123456789"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <input 
          type="checkbox" 
          id="invoice" 
          className="w-5 h-5 accent-[var(--primary)]"
          checked={hasInvoice}
          onChange={(e) => setHasInvoice(e.target.checked)}
        />
        <label htmlFor="invoice" className="text-sm text-gray-300">
          Poseo factura o comprobante de compra legal
        </label>
      </div>
      {errors && <p className="text-red-400 text-xs mt-1">{errors}</p>}
    </div>
  );
};

// 2. Producto Concreto: Campos para Objetos Comunes / Otros
const CommonEvidenceFields: React.FC<EvidenceFieldsProps> = ({ onChange, errors }) => {
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    const evidences: EvidenceData[] = [];
    if (description.length > 10) {
      evidences.push({ type: 'DESCRIPCIÓN DISTINTIVA', description });
    }
    onChange(evidences);
  }, [description, onChange]);

  return (
    <div className="form-group fade-in">
      <label className="form-label flex items-center gap-2">
        <FileText className="w-4 h-4 text-[var(--primary-light)]" />
        Detalles distintivos
      </label>
      <textarea 
        className="form-input min-h-[100px] resize-none" 
        placeholder="Describe marcas, rayones, calcomanías o contenido interno que demuestre tu propiedad..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <p className="text-[10px] text-gray-500 mt-2 italic">
        * Mínimo 10 caracteres para validar el sustento.
      </p>
      {errors && <p className="text-red-400 text-xs mt-1">{errors}</p>}
    </div>
  );
};

// 3. Factory: El creador que decide qué campos mostrar
export const ClaimFormFactory = {
  getFields: (category: ObjectCategory, onChange: (data: EvidenceData[]) => void, errors?: string) => {
    switch (category) {
      case ObjectCategory.ELECTRONIC:
        return <ElectronicEvidenceFields onChange={onChange} errors={errors} />;
      default:
        return <CommonEvidenceFields onChange={onChange} errors={errors} />;
    }
  }
};

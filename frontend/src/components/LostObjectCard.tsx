import React from 'react';
import { MapPin, Calendar, Camera } from 'lucide-react';
import type { LostObject } from '../types';
import { ObjectCategory } from '../types';

interface LostObjectCardProps {
  item: LostObject;
  onClaim: (item: LostObject) => void;
}

export const LostObjectCard: React.FC<LostObjectCardProps> = ({ item, onClaim }) => {
  const getCategoryLabel = (category: ObjectCategory) => {
    const labels: Record<ObjectCategory, string> = {
      [ObjectCategory.ELECTRONIC]: 'Electrónico',
      [ObjectCategory.COMMON]: 'Común',
      [ObjectCategory.CLOTHING]: 'Ropa',
      [ObjectCategory.STATIONERY]: 'Papelería',
      [ObjectCategory.DOCUMENT]: 'Documento',
      [ObjectCategory.ACCESSORY]: 'Accesorio',
      [ObjectCategory.OTHER]: 'Otro'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCloseToDonation = () => {
    const foundDate = new Date(item.foundAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - foundDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 150; // about 5 months
  };

  const closeToDonation = isCloseToDonation();

  return (
    <div className={`item-card relative rounded-2xl ${closeToDonation ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : ''}`}>
      <div className="glow-effect" />
      
      {closeToDonation && (
        <div className="absolute top-2 left-2 z-10 bg-orange-600/90 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg backdrop-blur-sm">
          <span className="animate-pulse">⚠️</span> Próximo a donación/descarte
        </div>
      )}

      <div className="w-full h-44 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-[var(--glass-border)]">
        {item.photo ? (
           <img 
            src={item.photo} 
            alt={item.description} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Sin+Foto';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--text-muted)] p-6 text-center">
            <Camera className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">Sin fotografía evidencial</span>
          </div>
        )}
      </div>

      <div className="inline-flex self-start text-[11px] font-semibold uppercase tracking-wide text-slate-300 bg-white/5 px-2.5 py-1 rounded-full mb-2 border border-white/10">
        {getCategoryLabel(item.category)}
      </div>
      <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]" title={item.description}>
        {item.description}
      </h3>
      
      <div className="item-date mt-2">
        <Calendar className="w-4 h-4" />
        <span>Reportado el {formatDate(item.foundAt)}</span>
      </div>
      
      <div className="item-desc flex items-start gap-2 mt-1">
        <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[var(--primary-light)]" />
        <span className="line-clamp-2 text-sm" title={`Ubicación: ${item.location}`}>
          Encontrado en: {item.location}
        </span>
      </div>
      
      <div className="mt-auto pt-4 border-t border-[var(--glass-border)]">
        <button className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-200 font-semibold hover:bg-blue-500/15 hover:border-blue-400/40 hover:text-white transition-colors" onClick={() => onClaim(item)}>
          Reclamar Objeto
        </button>
      </div>
    </div>
  );
};

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

  return (
    <div className="item-card">
      <div className="glow-effect" />
      
      <div className="w-full h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-[var(--glass-border)]">
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

      <div className="item-category">{getCategoryLabel(item.category)}</div>
      <h3 className="item-title truncate" title={item.description}>
        {item.description}
      </h3>
      
      <div className="item-date">
        <Calendar className="w-4 h-4" />
        <span>Reportado el {formatDate(item.foundAt)}</span>
      </div>
      
      <div className="item-desc flex items-start gap-2">
        <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[var(--primary-light)]" />
        <span className="line-clamp-2" title={`Ubicación: ${item.location}`}>
          Encontrado en: {item.location}
        </span>
      </div>
      
      <div className="mt-auto pt-4 border-t border-[var(--glass-border)]">
        <button className="btn-outline" onClick={() => onClaim(item)}>
          Reclamar Objeto
        </button>
      </div>
    </div>
  );
};

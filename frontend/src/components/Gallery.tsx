import React from 'react';
import { LostObjectCard } from './LostObjectCard';
import type { LostObject } from '../types';

interface GalleryProps {
  items: LostObject[];
  isLoading: boolean;
  onClaim: (item: LostObject) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, isLoading, onClaim }) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full p-8 text-center text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
        <p className="text-lg">No hay objetos perdidos registrados actualmente.</p>
        <p className="mt-2 text-sm">Los objetos encontrados por Bienestar Universitario aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {items.map((item) => (
        <LostObjectCard key={item.id} item={item} onClaim={onClaim} />
      ))}
    </div>
  );
};

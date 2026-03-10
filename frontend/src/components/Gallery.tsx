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
      <div className="w-full h-56 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        <p className="text-sm text-slate-400">Cargando objetos reportados...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full p-8 text-center text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)]">
        <p className="text-lg text-slate-200 font-semibold">No hay objetos perdidos registrados actualmente.</p>
        <p className="mt-2 text-sm">Los objetos encontrados por Bienestar Universitario aparecerán en este catálogo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <LostObjectCard key={item.id} item={item} onClaim={onClaim} />
      ))}
    </div>
  );
};

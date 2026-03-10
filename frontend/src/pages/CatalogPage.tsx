import React, { useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { Gallery } from '../components/Gallery';
import type { LostObject } from '../types';
import { mockLostObjects } from '../services/mockData';
import { ClaimForm } from '../components/ClaimForm';
import type { EvidenceData } from '../patterns/ClaimFormFactory';

export const CatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObject, setSelectedObject] = useState<LostObject | null>(null);
  
  const handleClaim = (item: LostObject) => {
    setSelectedObject(item);
  };

  const handleClaimSubmit = (evidences: EvidenceData[]) => {
    console.log('Enviando reclamación para:', selectedObject?.description);
    console.log('Evidencias:', evidences);
    alert('¡Reclamación enviada con éxito! (Simulando API en el Paso 5)');
    setSelectedObject(null);
  };

  const filteredObjects = mockLostObjects.filter(obj => 
    obj.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    obj.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex justify-center fade-in">
      <div className="w-full max-w-6xl flex flex-col items-center">
        
        {/* Encabezado / Hero Section */}
        <div className="text-center w-full max-w-3xl mb-12">
          <div className="hero-badge flex items-center gap-2 mx-auto justify-center mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Módulo de Reclamaciones</span>
          </div>
          <h1 className="hero-title">
            Recupera lo que es tuyo, <br />
            <span className="logo-accent">protegido y seguro.</span>
          </h1>
          <p className="hero-subtitle">
            Explora el catálogo de objetos perdidos encontrados en el campus de Uninorte. Selecciona tu objeto e inicia un proceso de verificación asistido para recuperarlo.
          </p>
          
          {/* Barra de Búsqueda Minimalista */}
          <div className="relative max-w-xl mx-auto w-full mt-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <input
              type="text"
              className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-lg backdrop-blur-md"
              placeholder="Buscar por descripción, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Galería Principal */}
        <div className="w-full text-left mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-semibold text-white">Objetos Recientes</h2>
          <span className="text-[var(--text-muted)] text-sm">{filteredObjects.length} encontrados</span>
        </div>
        
        <Gallery 
          items={filteredObjects} 
          isLoading={false} 
          onClaim={handleClaim} 
        />

        {selectedObject && (
          <ClaimForm 
            object={selectedObject} 
            onClose={() => setSelectedObject(null)}
            onSubmit={handleClaimSubmit}
          />
        )}
        
      </div>
    </div>
  );
};

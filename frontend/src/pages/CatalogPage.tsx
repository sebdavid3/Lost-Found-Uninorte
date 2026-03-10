import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Gallery } from '../components/Gallery';
import type { LostObject, Evidence } from '../types';
import { apiService } from '../services/api';
import { ClaimForm } from '../components/ClaimForm';
import type { EvidenceData } from '../patterns/ClaimFormFactory';

export const CatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [objects, setObjects] = useState<LostObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState<LostObject | null>(null);

  React.useEffect(() => {
    const fetchObjects = async () => {
      try {
        const data = await apiService.getObjects();
        if (data && data.length > 0) {
          setObjects(data);
        }
      } catch (error) {
        console.error('Error fetching objects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchObjects();
  }, []);
  
  const handleClaim = (item: LostObject) => {
    setSelectedObject(item);
  };

  const handleClaimSubmit = async (evidences: EvidenceData[]) => {
    if (!selectedObject) return;
    
    try {
      const formattedEvidences: Omit<Evidence, 'id' | 'claimId' | 'createdAt' | 'updatedAt'>[] = evidences.map(ev => ({
        type: ev.type,
        description: ev.description,
        url: ev.url
      }));

      await apiService.createClaim({
        objectId: selectedObject.id,
        userId: 'current-user-id',
        objectCategory: selectedObject.category,
        evidences: formattedEvidences
      });

      alert('¡Reclamación enviada con éxito al servidor!');
      setSelectedObject(null);
    } catch (error) {
      console.error('Error al enviar reclamación:', error);
      alert('Error al enviar reclamación. (Simulando éxito para el Paso 5)');
      setSelectedObject(null);
    }
  };

  const filteredObjects = objects.filter(obj => 
    obj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-10 fade-in">
      {/* Hero Section */}
      <section className="relative h-[320px] md:h-[360px] flex items-center justify-center overflow-hidden rounded-3xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--primary)] opacity-90 z-0"></div>
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 text-center space-y-4 px-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            Recupera lo que es tuyo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Lost<span className="text-[var(--primary)]">&</span>Found
          </h1>
          <p className="text-slate-300 mx-auto text-base md:text-lg leading-relaxed">
            Sistema inteligente de recuperación de objetos perdidos de la Universidad del Norte.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="sticky top-[76px] z-40 py-4 bg-[#0f172a]/90 backdrop-blur-xl border-y border-white/10 rounded-2xl">
        <div className="relative max-w-4xl mx-auto group px-3 md:px-4">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-2xl blur-md opacity-50"></div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar por nombre, categoría o descripción..." 
              className="w-full px-4 py-3.5 bg-slate-900/90 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Object Gallery */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-white/10 pb-4 text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Catálogo de Objetos</h2>
            <p className="text-sm text-slate-400 mt-1">Explora objetos reportados por Bienestar Universitario.</p>
          </div>
          <span className="text-slate-400 text-sm font-medium">{filteredObjects.length} resultados</span>
        </div>
        
        <Gallery 
          items={filteredObjects} 
          isLoading={loading} 
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

import React, { useState } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
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
    <div className="w-full max-w-6xl mx-auto space-y-12 fade-in">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden rounded-[40px]">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--primary)] opacity-90 z-0"></div>
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest animate-float">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            Recupera lo que es tuyo
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Lost<span className="text-[var(--primary)]">&</span>Found
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg">
            Sistema inteligente de recuperación de objetos perdidos de la Universidad del Norte.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="sticky top-24 z-40 py-4 bg-gray-900/50 backdrop-blur-xl">
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, categoría o descripción..." 
              className="w-full pl-16 pr-8 py-5 bg-gray-800/80 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Object Gallery */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white">Catálogo de Objetos</h2>
          <span className="text-gray-500 text-sm font-medium">{filteredObjects.length} objetos encontrados</span>
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

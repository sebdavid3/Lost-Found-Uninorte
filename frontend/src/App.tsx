import React, { useState } from 'react';

// Define our types
interface FoundObject {
  id: string;
  title: string;
  description: string;
  category: string;
  dateFound: string;
}

// Mock Data representing objects in the system
const mockFoundObjects: FoundObject[] = [
  {
    id: 'obj-101',
    title: 'Portátil Dell XPS 15',
    description: 'Portátil color plata con sticker de GitHub en la tapa. Encontrado en Bloque K, sala 3.',
    category: 'Electrónica',
    dateFound: '2026-03-08'
  },
  {
    id: 'obj-102',
    title: 'Termo Contigo Azul',
    description: 'Termo metálico azul oscuro de 24oz. Encontrado cerca de la cafetería central.',
    category: 'Accesorios',
    dateFound: '2026-03-09'
  },
  {
    id: 'obj-103',
    title: 'Calculadora Casio fx-991EX',
    description: 'Calculadora científica gris con estuche. Encontrada en la biblioteca, piso 2.',
    category: 'Útiles',
    dateFound: '2026-03-07'
  },
  {
    id: 'obj-104',
    title: 'Gafas de lectura Ray-Ban',
    description: 'Montura negra clásica, en estuche de cuero marrón. Encontradas en Bloque G.',
    category: 'Accesorios',
    dateFound: '2026-03-09'
  }
];

function App() {
  // State for view navigation
  const [currentView, setCurrentView] = useState<'list' | 'claimForm'>('list');
  const [selectedObject, setSelectedObject] = useState<FoundObject | null>(null);
  
  // State for the claim form
  const [formData, setFormData] = useState({
    description: '',
    evidenceDetails: ''
  });

  const handleSelectObject = (obj: FoundObject) => {
    setSelectedObject(obj);
    setCurrentView('claimForm');
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedObject(null);
    setFormData({ description: '', evidenceDetails: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObject) return;
    
    // Here we would normally make the POST request to the backend
    console.log('Submitting claim for:', selectedObject.id, formData);
    alert(`Reclamación enviada con éxito para: ${selectedObject.title}`);
    
    // Reset view
    handleBackToList();
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo" onClick={handleBackToList}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-accent">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          Lost & Found <span className="logo-accent">Uninorte</span>
        </div>
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>Portal de Estudiantes</span>
        </div>
      </nav>

      <main className="main-content">
        
        {/* VIEW 1: Found Items List */}
        {currentView === 'list' && (
          <div className="fade-in w-full">
            <div className="hero-badge">Objetos Encontrados Recientemente</div>
            <h1 className="hero-title">Recupera lo que es tuyo.</h1>
            <p className="hero-subtitle">
              Explora la lista de objetos reportados en el campus por Bienestar Universitario. Si identificas tu pertenencia, inicia el proceso de reclamación inmediatamente.
            </p>

            <div className="items-grid">
              {mockFoundObjects.map((obj) => (
                <div key={obj.id} className="item-card">
                  <span className="item-category">{obj.category}</span>
                  <h3 className="item-title">{obj.title}</h3>
                  <div className="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Encontrado el: {obj.dateFound}
                  </div>
                  <p className="item-desc">{obj.description}</p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      className="btn-outline"
                      onClick={() => handleSelectObject(obj)}
                    >
                      Es mío, quiero reclamarlo
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: Claim Form View */}
        {currentView === 'claimForm' && selectedObject && (
          <div className="fade-in" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <button className="btn-back" onClick={handleBackToList}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Volver al listado
            </button>
            
            <div style={{ position: 'relative' }}>
              <div className="glow-effect"></div>
              <div className="glass-card">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Formulario de Reclamación</h2>
                
                <div className="selected-item-pill">
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', opacity: 0.8 }}>Objeto Seleccionado</div>
                    <div style={{ fontWeight: 600 }}>{selectedObject.title}</div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="description">Detalles Adicionales de Propiedad</label>
                    <textarea
                      id="description"
                      className="form-input"
                      rows={3}
                      placeholder="Menciona detalles que solo tú sabrías (marcas de uso, contenido interno, fondos de pantalla...)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  
                  {selectedObject.category === 'Electrónica' && (
                    <div className="form-group slide-down">
                      <label className="form-label" htmlFor="evidence">Evidencia Requerida (Electrónica)</label>
                      <input
                         id="evidence"
                         type="text"
                         className="form-input"
                         placeholder="Número de serie o enlace a factura"
                         value={formData.evidenceDetails}
                         onChange={(e) => setFormData({ ...formData, evidenceDetails: e.target.value })}
                         required
                      />
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                        * Por normas de seguridad, equipos electrónicos requieren mayor evidencia.
                      </small>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                    Enviar Reclamación a Bienestar
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Lost & Found Uninorte. Sistema Proxy de Reclamaciones.
      </footer>
    </>
  );
}

export default App;

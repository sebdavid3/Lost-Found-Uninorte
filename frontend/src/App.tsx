import { Routes, Route, Link } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';
import { ShieldAlert } from 'lucide-react';
import './App.css';

function App() {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo text-white no-underline">
          <ShieldAlert className="logo-accent w-6 h-6" />
          <span>Lost<span className="logo-accent">&Found</span></span>
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="text-white hover:text-[var(--primary)] transition-colors px-3 py-2 rounded-md font-medium text-sm">
            Portal Estudiante
          </Link>
          <Link to="/admin" className="text-[var(--text-muted)] hover:text-white transition-colors px-3 py-2 rounded-md font-medium text-sm">
            Panel Admin
          </Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/admin" element={<div className="text-white">Panel Administrativo (Paso 4)</div>} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2026 Universidad del Norte - Bienestar Universitario</p>
        <p className="mt-1 opacity-60">Módulo de Reclamación y Verificación</p>
      </footer>
    </>
  );
}

export default App;

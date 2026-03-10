import { Routes, Route, Link } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { ShieldAlert } from 'lucide-react';
import './App.css';

function App() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-white no-underline flex items-center gap-3 group">
            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-all border border-blue-500/20 group-hover:border-blue-500/40 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <ShieldAlert className="w-6 h-6 text-blue-500 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Lost<span className="text-blue-500">&Found</span></span>
          </Link>
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <Link to="/" className="text-gray-300 hover:text-white hover:bg-white/10 transition-all px-5 py-2.5 rounded-xl font-medium text-sm">
              Catálogo
            </Link>
            <Link to="/admin" className="text-gray-300 hover:text-white hover:bg-white/10 transition-all px-5 py-2.5 rounded-xl font-medium text-sm">
              Gestión (Admin)
            </Link>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
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

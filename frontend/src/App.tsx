import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { ShieldAlert, LayoutDashboard, Search } from 'lucide-react';
import './App.css';

function App() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link to="/" className="text-white no-underline flex items-center gap-3 group self-start">
            <div className="p-2 bg-blue-500/10 rounded-xl transition-all border border-blue-500/25 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <ShieldAlert className="w-5 h-5 text-blue-400 transition-transform group-hover:scale-110" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xl md:text-2xl font-bold tracking-tight">Lost<span className="text-blue-500">&Found</span></span>
              <span className="block text-[11px] text-slate-400">Universidad del Norte</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-w-[150px] px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${isActive ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/10 hover:border-white/30 hover:text-white'}`
              }
            >
              <Search className="w-4 h-4" />
              Catálogo
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-w-[150px] px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${isActive ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30' : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/10 hover:border-white/30 hover:text-white'}`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </NavLink>
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
        <p className="font-medium text-slate-300">© 2026 Universidad del Norte - Bienestar Universitario</p>
        <p className="mt-1 text-xs">Módulo de Reclamación y Verificación de Objetos</p>
      </footer>
    </>
  );
}

export default App;

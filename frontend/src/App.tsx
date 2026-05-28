import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Role } from "./types";

// Layouts
import { PublicLayout } from "./components/layout/PublicLayout";
import { StudentLayout } from "./components/layout/StudentLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Guards
import { ProtectedRoute } from "./components/routing/ProtectedRoute";

// Páginas de Acceso
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

// Páginas del Estudiante / Públicas
import { CatalogPage } from "./pages/CatalogPage";
import { MyClaimsPage } from "./pages/MyClaimsPage";

// Páginas de Administración
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminClaimsListPage } from "./pages/admin/AdminClaimsListPage";
import { AdminObjectsListPage } from "./pages/admin/AdminObjectsListPage";
import { GlobalAuditLogPage } from "./pages/admin/GlobalAuditLogPage";

function App() {
  return (
    <BrowserRouter>
      {/* Sistema Global de Toasts (NF5) */}
      <Toaster richColors position="top-right" theme="light" closeButton />

      <Routes>
        {/* ================= RUTAS PÚBLICAS ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* ================= RUTAS DE ESTUDIANTE ================= */}
        <Route element={<ProtectedRoute allowedRoles={[Role.STUDENT]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/mis-reclamaciones" element={<MyClaimsPage />} />
          </Route>
        </Route>

        {/* ================= RUTAS DE ADMINISTRADOR ================= */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/claims" element={<AdminClaimsListPage />} />
            <Route path="/admin/objects" element={<AdminObjectsListPage />} />
            <Route path="/admin/audit-logs" element={<GlobalAuditLogPage />} />
          </Route>
        </Route>

        {/* ================= CONTROL DE ERROR 404 (NF8) ================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

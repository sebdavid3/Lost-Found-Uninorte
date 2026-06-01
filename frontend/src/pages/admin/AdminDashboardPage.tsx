import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, Package, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    claimsTotal: 0,
    claimsPending: 0,
    objectsTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const claims = await api.getClaims(1, 100);
        const objects = await api.getObjects({}, 1, 100);

        const pending = claims.items.filter((c: any) => c.status === "PENDING").length;

        setStats({
          claimsTotal: claims.total,
          claimsPending: pending,
          objectsTotal: objects.total,
        });
      } catch (e) {
        console.error("Error loading stats", e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
          Panel de Control
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Visión general del sistema: reclamaciones, objetos y estado de seguridad.
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400">Reclamaciones</CardTitle>
            <FileText className="h-5 w-5 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display tracking-tight text-brand-black">
              {loading ? "..." : stats.claimsTotal}
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Total de reclamos</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400">Pendientes</CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display tracking-tight text-brand-black">
              {loading ? "..." : stats.claimsPending}
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Por revisar</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400">Objetos</CardTitle>
            <Package className="h-5 w-5 text-brand-coral" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display tracking-tight text-brand-black">
              {loading ? "..." : stats.objectsTotal}
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">En inventario</p>
          </CardContent>
        </Card>
      </div>

      {/* CONTENEDORES SECUNDARIOS / LINKS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between h-48">
          <div>
            <span className="font-mono text-[10px] text-brand-coral uppercase tracking-widest block mb-2 font-bold">Gestión Activa</span>
            <h4 className="font-display font-bold text-xl text-brand-black tracking-tight leading-tight">Reclamaciones</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Revisá las evidencias enviadas por los estudiantes. Podés aprobar o rechazar cada reclamación.
            </p>
          </div>
          <Link to="/admin/claims" className="text-xs font-mono text-brand-green hover:underline font-bold mt-4 block">
            Ver reclamaciones →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between h-48">
          <div>
            <span className="font-mono text-[10px] text-brand-coral uppercase tracking-widest block mb-2 font-bold">Registro de actividad</span>
            <h4 className="font-display font-bold text-xl text-brand-black tracking-tight leading-tight">Historial de acciones</h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Consultá el historial completo de acciones realizadas en el sistema. Cada operación queda registrada para garantizar la transparencia.
            </p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs font-mono text-brand-green hover:underline font-bold mt-4 block">
            Ver historial →
          </Link>
        </div>
      </div>
    </div>
  );
};

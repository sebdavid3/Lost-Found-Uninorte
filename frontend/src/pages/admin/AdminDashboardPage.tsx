import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { DashboardStats } from "../../types";
import { CATEGORY_LABELS } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  FileText,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Activity,
  MapPin,
  Layers,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
  ELECTRONIC: "#6366f1",
  COMMON: "#14b8a6",
  CLOTHING: "#f97316",
  STATIONERY: "#8b5cf6",
  DOCUMENT: "#ec4899",
  ACCESSORY: "#06b6d4",
  OTHER: "#64748b",
};

const COLORS_LIST = ["#6366f1", "#14b8a6", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];

type Tab = "categorias" | "ubicaciones" | "actividad";

function BarChart({ data, labelKey, valueKey, colorKey }: {
  data: any[];
  labelKey: string;
  valueKey: string;
  colorKey?: string;
}) {
  const max = Math.max(1, ...data.map((d: any) => d[valueKey]));
  return (
    <div className="space-y-3">
      {data.map((item: any, i: number) => {
        const pct = (item[valueKey] / max) * 100;
        const color = colorKey
          ? COLORS[item[colorKey]] || COLORS_LIST[i % COLORS_LIST.length]
          : COLORS_LIST[i % COLORS_LIST.length];
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-500 w-24 truncate text-right flex-shrink-0" title={item[labelKey]}>
              {CATEGORY_LABELS[item[labelKey]] || item[labelKey]}
            </span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-gray-700 w-8 text-right flex-shrink-0">
              {item[valueKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, total, size = 130 }: {
  segments: { label: string; value: number; color: string }[];
  total: number;
  size?: number;
}) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        {total === 0 ? (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        ) : (
          segments.filter(s => s.value > 0).map((seg, i) => {
            const dash = circumference * (seg.value / total);
            const strokeDasharray = `${dash} ${circumference - dash}`;
            const sdashoffset = offset;
            offset += dash;
            return (
              <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={seg.color} strokeWidth="14"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={sdashoffset}
                style={{ transform: "rotate(-90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}
              />
            );
          })
        )}
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" className="text-sm font-bold font-display" fill="#1e293b">{total}</text>
      </svg>
      <div className="space-y-2">
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-500">{seg.label}</span>
            <span className="font-bold text-gray-700 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, height = 140 }: {
  data: { date: string; created: number; approved: number; rejected: number }[];
  height?: number;
}) {
  if (data.length === 0)
    return <p className="text-gray-400 text-xs text-center py-8 font-mono">Sin datos disponibles</p>;

  const maxVal = Math.max(1, ...data.flatMap(d => [d.created, d.approved, d.rejected]));
  const pad = { l: 3, r: 2, t: 10, b: 16 };
  const cw = 100 - pad.l - pad.r;
  const ch = 100 - pad.t - pad.b;

  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * cw;
  const y = (v: number) => pad.t + ch - (v / maxVal) * ch;

  const path = (key: string) => data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y((d as any)[key])}`).join(" ");
  const area = (key: string) => `${path(key)} L ${x(data.length - 1)} ${pad.t + ch} L ${x(0)} ${pad.t + ch} Z`;

  const labels = [0, 0.25, 0.5, 0.75, 1];
  const labelInterval = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 100 100" className="w-full" style={{ minWidth: 320, height }}>
        {labels.map((pct, i) => {
          const ly = pad.t + ch * (1 - pct);
          return <line key={i} x1={pad.l} y1={ly} x2={pad.l + cw} y2={ly} stroke="#f1f5f9" strokeWidth="0.3" />;
        })}
        <path d={area("created")} fill="rgba(99,102,241,0.08)" />
        <path d={area("approved")} fill="rgba(16,185,129,0.08)" />
        <path d={area("rejected")} fill="rgba(239,68,68,0.08)" />
        <path d={path("created")} fill="none" stroke="#6366f1" strokeWidth="1" />
        <path d={path("approved")} fill="none" stroke="#10b981" strokeWidth="1" />
        <path d={path("rejected")} fill="none" stroke="#ef4444" strokeWidth="1" />
        {data.map((d, i) => {
          if (i % labelInterval !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={x(i)} y={98} textAnchor="middle" fill="#94a3b8" fontSize="3.5" fontFamily="monospace">
              {d.date.split("-").slice(1).join("/")}
            </text>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-5 mt-2">
        <span className="text-[10px] font-mono flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Creadas</span>
        <span className="text-[10px] font-mono flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Aprobadas</span>
        <span className="text-[10px] font-mono flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Rechazadas</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: number | string; subtitle: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-mono tracking-wider uppercase text-gray-400">{title}</CardTitle>
        <Icon className="h-4 w-4" style={{ color }} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display tracking-tight text-brand-black">{value}</div>
        <p className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "categorias", label: "Categorías", icon: Layers },
  { key: "ubicaciones", label: "Ubicaciones", icon: MapPin },
  { key: "actividad", label: "Actividad", icon: TrendingUp },
];

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("categorias");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setStats(await api.getDashboardStats()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>
        <div className="h-8 w-64 bg-gray-100 rounded-lg mx-auto" />
        <div className="h-80 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  const { objects, claims, recentActivity } = stats;

  const donutSegments = [
    { label: "Pendientes", value: claims.pending, color: COLORS.pending },
    { label: "Aprobadas", value: claims.approved, color: COLORS.approved },
    { label: "Rechazadas", value: claims.rejected, color: COLORS.rejected },
  ];

  const approvalRate = claims.total > 0
    ? Math.round((claims.approved / (claims.approved + claims.rejected || 1)) * 100) : 0;

  return (
    <div className="space-y-8 antialiased font-body">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">Panel de Control</h2>
        <p className="text-gray-500 text-sm mt-1">
          Visión general del sistema con estadísticas en tiempo real.
        </p>
      </div>

      {/* Key metrics - always visible */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Objetos" value={objects.total} subtitle="En inventario" icon={Package} color="#6366f1" />
        <StatCard title="Reclamaciones" value={claims.total} subtitle="Total" icon={FileText} color="#0ea5e9" />
        <StatCard title="Pendientes" value={claims.pending} subtitle="Por revisar" icon={AlertCircle} color={COLORS.pending} />
        <StatCard title="Aprobadas" value={claims.approved} subtitle="Verificadas" icon={CheckCircle2} color={COLORS.approved} />
        <StatCard title="Rechazadas" value={claims.rejected} subtitle={`${approvalRate}% aprobación`} icon={XCircle} color={COLORS.rejected} />
      </div>

      {/* Weekly activity - always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="text-[10px] font-mono uppercase text-indigo-500 tracking-wider mb-1">Últimos 7 días</div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold text-indigo-700">{objects.recentAdded}</span>
            <span className="text-[11px] text-indigo-400 mb-0.5">objetos nuevos</span>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="text-[10px] font-mono uppercase text-amber-500 tracking-wider mb-1">Últimos 7 días</div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold text-amber-700">{claims.recentCreated}</span>
            <span className="text-[11px] text-amber-400 mb-0.5">reclamos nuevos</span>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="text-[10px] font-mono uppercase text-emerald-500 tracking-wider mb-1">Últimos 7 días</div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold text-emerald-700">{claims.recentApproved}</span>
            <span className="text-[11px] text-emerald-400 mb-0.5">aprobadas</span>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="text-[10px] font-mono uppercase text-red-500 tracking-wider mb-1">Últimos 7 días</div>
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-bold text-red-700">{claims.recentRejected}</span>
            <span className="text-[11px] text-red-400 mb-0.5">rechazadas</span>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mx-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${active
                  ? "bg-white text-brand-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="space-y-8">
        {tab === "categorias" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-400" />
                  Objetos por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={objects.byCategory} labelKey="category" valueKey="count" colorKey="category" />
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                  Distribución de Reclamaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart segments={donutSegments} total={claims.total} size={140} />
                {claims.total > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-400">Tasa de aprobación</span>
                      <span className="font-bold text-emerald-600">{approvalRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${approvalRate}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "ubicaciones" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Objetos encontrados por lugar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={objects.byLocation.slice(0, 10)} labelKey="location" valueKey="count" />
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Reclamos por bloque de pérdida
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claims.byLostLocation.length > 0 ? (
                  <BarChart data={claims.byLostLocation} labelKey="location" valueKey="count" />
                ) : (
                  <p className="text-gray-400 text-xs text-center py-8 font-mono">Sin datos de ubicación de pérdida</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "actividad" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                  Reclamaciones por Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={claims.byDay} height={160} />
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-gray-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recentActivity.slice(0, 10).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{
                          backgroundColor: item.status === "PENDING" ? COLORS.pending :
                            item.status === "APPROVED" ? COLORS.approved : COLORS.rejected,
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800">{item.user}</span>
                        <span className="text-gray-400"> reclamó </span>
                        <span className="font-medium text-gray-700 truncate">{item.object}</span>
                        <span className="text-gray-500 block text-[10px] font-mono mt-1">
                          {new Date(item.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          <span className={
                            item.status === "PENDING" ? "text-amber-600" :
                            item.status === "APPROVED" ? "text-emerald-600" : "text-red-600"
                          }>
                            {item.status === "PENDING" ? "Pendiente" : item.status === "APPROVED" ? "Aprobada" : "Rechazada"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-6 font-mono">Sin actividad reciente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link to="/admin/claims" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-brand-black group-hover:text-gray-700 transition-colors">Reclamaciones</h4>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{claims.pending} pendientes</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/objects" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-brand-black group-hover:text-gray-700 transition-colors">Objetos</h4>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{objects.total} en inventario</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/audit-logs" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-brand-black group-hover:text-gray-700 transition-colors">Auditoría</h4>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Ver historial completo</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

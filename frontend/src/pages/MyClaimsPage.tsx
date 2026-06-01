import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../lib/api";
import { type Claim, ClaimStatus } from "../types";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Inbox, Calendar, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export const MyClaimsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Paginated<Claim>>({ items: [], total: 0, page: 1, limit: 10 });

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyClaims();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar reclamaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-mono px-2.5 py-0.5 uppercase">Pendiente</Badge>;
      case ClaimStatus.APPROVED:
        return <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono px-2.5 py-0.5 uppercase">Aprobado</Badge>;
      case ClaimStatus.REJECTED:
        return <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-mono px-2.5 py-0.5 uppercase">Rechazado</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12 antialiased font-body">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
          Mis Reclamaciones
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Hacer seguimiento del estado de verificación de las reclamaciones de pertenencias que has realizado.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2.5 flex-1">
                <Skeleton className="h-6 w-1/3 bg-gray-100" />
                <Skeleton className="h-4 w-1/4 bg-gray-100" />
                <Skeleton className="h-4 w-1/2 bg-gray-100" />
              </div>
              <Skeleton className="h-6 w-20 bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50/50 rounded-2xl border border-red-100/50 max-w-xl mx-auto px-6">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-brand-black">Error al recuperar historial</h3>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
          <Button
            onClick={fetchClaims}
            className="mt-4 rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold px-6 py-2.5"
          >
            Reintentar
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 max-w-xl mx-auto px-6">
          <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-black">No tienes reclamaciones activas</h3>
          <p className="text-sm text-gray-500 mt-2">
            Aún no has reclamado ningún objeto extraviado del campus. Cuando lo hagas, aparecerá aquí su estado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((claim) => (
            <Card key={claim.id} className="border-gray-150 hover:border-gray-300 transition-all rounded-2xl bg-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center font-display font-bold">
                        {claim.object?.category?.substring(0, 2).toUpperCase() || "OB"}
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-lg text-brand-black tracking-tight leading-tight">
                          Reclamación de {claim.object?.name || "Objeto extraviado"}
                        </h4>
                        <span className="text-[11px] font-mono text-gray-400 tracking-tight block mt-0.5">
                          ID: {claim.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Radicado: {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {getStatusBadge(claim.status)}
                  </div>
                </div>

                {/* Si fue rechazado, mostrar motivo */}
                {claim.status === ClaimStatus.REJECTED && claim.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-red-800">Motivo del rechazo administrativo</h5>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">{claim.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

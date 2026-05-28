import React, { useEffect, useState } from "react";
import { api, Paginated } from "../../lib/api";
import { Claim } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { FileText, Calendar, ArrowRight, Eye, Settings } from "lucide-react";
import { toast } from "sonner";

export const AdminClaimsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<Claim>>({ items: [], total: 0, page: 1, limit: 10 });

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await api.getClaims(1, 10);
        setData(res);
      } catch (err: any) {
        toast.error("Error al cargar reclamaciones: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
          Gestión de Reclamaciones
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Tabla interactiva de reclamaciones radicadas por estudiantes del campus Uninorte.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            <Skeleton className="h-32 w-full bg-gray-100" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No hay reclamaciones registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">ID Reclamación</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Estudiante</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Objeto</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Fecha Registro</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Estado</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-mono text-xs text-gray-500 font-semibold pl-6">{claim.id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-semibold text-brand-black">{claim.user?.name || claim.userId}</TableCell>
                    <TableCell className="text-gray-600">{claim.object?.name || "Objeto extraviado"}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border ${
                        claim.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : claim.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        onClick={() => toast.info(`Abriendo consola de Saga para claim ${claim.id.substring(0, 8)}...`)}
                        variant="outline"
                        className="h-8 rounded-lg text-xs font-semibold text-brand-green border-brand-green/20 hover:bg-emerald-50 gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

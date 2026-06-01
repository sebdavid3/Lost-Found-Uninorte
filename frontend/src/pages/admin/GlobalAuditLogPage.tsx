import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ACTION_LABELS: Record<string, string> = {
  CLAIM_CREATED: "Reclamación creada",
  CLAIM_UPDATED: "Reclamación actualizada",
  CLAIM_DELETED: "Reclamación eliminada",
  CLAIM_VERIFIED: "Reclamación verificada",
  CLAIM_APPROVED: "Reclamación aprobada",
  CLAIM_REJECTED: "Reclamación rechazada",
  CLAIM_READ: "Reclamación consultada",
  CLAIM_LIST_READ: "Lista consultada",
  OBJECT_CREATED: "Objeto registrado",
  OBJECT_UPDATED: "Objeto actualizado",
  OBJECT_DELETED: "Objeto eliminado",
  ACCESS_DENIED: "Acceso denegado",
};

const formatAction = (action: string) => ACTION_LABELS[action] || action;

const shortHash = (hash: string) => hash ? `${hash.substring(0, 10)}…` : "—";

export const GlobalAuditLogPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<any>>({ items: [], total: 0, page: 1, limit: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const logs = await api.getAuditLogs(1, 10);
      setData(logs);
    } catch (err: any) {
      toast.error("Error al cargar auditoría: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
            Historial de Actividad
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Registro de todas las acciones realizadas en el sistema.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchData}
            variant="outline"
            className="rounded-pill border-gray-200 text-xs font-semibold h-10 w-10 p-0 flex items-center justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            <Skeleton className="h-32 w-full bg-gray-100" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No se han registrado eventos en el historial.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">Fecha y hora</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Acción</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Responsable</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pr-6">Ref.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="text-xs text-gray-500 font-medium pl-6">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-brand-black text-sm">
                      {formatAction(log.action)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.actorId || "Sistema"}
                    </TableCell>
                    <TableCell className="text-[11px] font-mono text-gray-400 pr-6">
                      {shortHash(log.hash)}
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

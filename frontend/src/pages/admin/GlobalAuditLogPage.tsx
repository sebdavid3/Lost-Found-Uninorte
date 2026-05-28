import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { ShieldCheck, ShieldAlert, RefreshCw, Database } from "lucide-react";
import { toast } from "sonner";

export const GlobalAuditLogPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [integrity, setIntegrity] = useState<{ isValid: boolean; brokenAt: string | null } | null>(null);
  const [data, setData] = useState<Paginated<any>>({ items: [], total: 0, page: 1, limit: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const logs = await api.getAuditLogs(1, 10);
      const integrityCheck = await api.verifyAuditIntegrity();
      setData(logs);
      setIntegrity(integrityCheck);
    } catch (err: any) {
      toast.error("Error al cargar auditoría: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runIntegrityCheck = async () => {
    setVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Latencia simulada
      const integrityCheck = await api.verifyAuditIntegrity();
      setIntegrity(integrityCheck);
      if (integrityCheck.isValid) {
        toast.success("¡Cadena de Hash verificada con éxito!", {
          description: "La integridad criptográfica está intacta (100% libre de manipulaciones).",
        });
      } else {
        toast.error("¡ALERTA DE MANIPULACIÓN!", {
          description: `Se detectó una alteración en la firma hash a partir de: ${integrityCheck.brokenAt || "origen"}.`,
        });
      }
    } catch (err: any) {
      toast.error("Error al correr verificación: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
            Bitácora de Auditoría
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Registro inmutable de auditoría criptográfica SHA-256 para prevenir fraude y manipulación de datos.
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

          <Button
            onClick={runIntegrityCheck}
            disabled={verifying || loading}
            className={`rounded-pill text-xs font-semibold h-10 px-5 flex items-center gap-2 shadow-sm ${
              integrity?.isValid 
                ? 'bg-brand-near-black hover:bg-brand-black text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {verifying ? "Analizando Cadena..." : "Verificar Integridad"}
          </Button>
        </div>
      </div>

      {/* ESTADO DE INTEGRIDAD */}
      {integrity && (
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          integrity.isValid 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
            : 'bg-red-50/50 border-red-100 text-red-800'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
              integrity.isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {integrity.isValid ? <ShieldCheck className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
            </div>
            <div>
              <h4 className="font-display font-bold text-lg leading-tight">
                {integrity.isValid ? "Cadena Criptográfica Íntegra" : "¡CADENA DE SEGURIDAD CORROMPIDA!"}
              </h4>
              <p className="text-xs opacity-90 mt-1 max-w-xl leading-relaxed font-medium">
                {integrity.isValid 
                  ? "Cada eslabón en el ledger de auditoría coincide perfectamente con la firma SHA-256 anterior. No se han detectado intentos de alteración directa de la base de datos."
                  : `Se ha roto el encadenamiento de firmas. El hash almacenado no concuerda a partir de: ${integrity.brokenAt}. Detenga las operaciones inmediatemente.`}
              </p>
            </div>
          </div>
          <Badge className={`text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-sm ${
            integrity.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {integrity.isValid ? "SECURE" : "CORRUPT"}
          </Badge>
        </div>
      )}

      {/* LISTA DE AUDIT LOGS */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            <Skeleton className="h-32 w-full bg-gray-100" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No se han registrado eventos en la bitácora de auditoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">Timestamp</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Acción / Evento</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Ejecutor</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Hash Firma SHA-256</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pr-6">Encadenamiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="text-xs text-gray-400 font-mono pl-6">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-brand-black">
                      <div>
                        <div className="leading-tight">{log.action}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5 max-w-xs truncate">
                          Detalles: {JSON.stringify(log.details || {})}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-600">
                      {log.userId || "SISTEMA"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-gray-500 truncate max-w-xs">
                      {log.hash || "SIN HASH"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Database className="h-3 w-3" />
                        LINKED
                      </span>
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

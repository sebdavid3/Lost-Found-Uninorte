import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../../lib/api";
import { type Claim, EVIDENCE_LABELS, CATEGORY_LABELS } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Eye, X, ShieldCheck, ShieldX, FileText, MapPin, Calendar, User, PackageOpen, Box, Search } from "lucide-react";
import { toast } from "sonner";

export const AdminClaimsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<Claim>>({ items: [], total: 0, page: 1, limit: 20 });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.getClaims(1, 20);
      setData(res);
    } catch (err: any) {
      toast.error("Error al cargar reclamaciones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  const openReviewModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowRejectForm(false);
    setRejectionReason("");
    setReviewModalOpen(true);
  };

  const handleVerifyClaim = async () => {
    if (!selectedClaim) return;
    setVerifying(true);
    try {
      await api.verifyClaim(selectedClaim.id);
      toast.success("¡Reclamación verificada y aprobada!");
      setReviewModalOpen(false);
      fetchClaims();
    } catch (err: any) {
      toast.error("Verificación fallida", { description: err.message || "No se pudo verificar." });
      fetchClaims();
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectClaim = async () => {
    if (!selectedClaim || !rejectionReason.trim()) {
      toast.error("Debes proporcionar un motivo de rechazo.");
      return;
    }
    setRejecting(true);
    try {
      await api.updateClaim(selectedClaim.id, { status: "REJECTED", rejectionReason: rejectionReason.trim() });
      toast.success("Reclamación rechazada.");
      setReviewModalOpen(false);
      fetchClaims();
    } catch (err: any) {
      toast.error("Error al rechazar: " + err.message);
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-amber-50">PENDIENTE</Badge>;
      case "APPROVED": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-emerald-50">APROBADO</Badge>;
      case "REJECTED": return <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-red-50">RECHAZADO</Badge>;
      default: return <Badge className="text-[10px] font-mono">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">Gestión de Reclamaciones</h2>
        <p className="text-gray-500 text-sm mt-1">Tabla interactiva de reclamaciones radicadas por estudiantes del campus Uninorte.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            <Skeleton className="h-32 w-full bg-gray-100" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">No hay reclamaciones registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">ID</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Estudiante</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Objeto</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Perdió en</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Fecha</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Estado</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((claim) => (
                  <TableRow key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-mono text-xs text-gray-500 font-semibold pl-6">{claim.id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-semibold text-brand-black">{claim.user?.name || claim.userId}</TableCell>
                    <TableCell className="text-gray-600">{claim.object?.name || "Objeto"}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">{claim.lostLocation || "—"}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button onClick={() => openReviewModal(claim)} variant="outline"
                        className="h-8 rounded-lg text-xs font-semibold text-brand-green border-brand-green/20 hover:bg-emerald-50 gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ═══════════════════ MODAL DE REVISIÓN LADO A LADO ═══════════════════ */}
      {reviewModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setReviewModalOpen(false)}>
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-black tracking-tight">Comparación de Reclamación</h3>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {selectedClaim.id} · {selectedClaim.user?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedClaim.status)}
                </div>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo: 2 columnas */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* ═══ COLUMNA IZQUIERDA: OBJETO ENCONTRADO ═══ */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
                    <PackageOpen className="h-4 w-4 text-indigo-400" />
                    Objeto Encontrado
                  </div>

                  {/* Foto */}
                  <div className="relative rounded-xl bg-gray-100 overflow-hidden border border-gray-150 h-56">
                    {selectedClaim.object?.photo ? (
                      <img
                        src={selectedClaim.object.photo}
                        alt={selectedClaim.object?.name || "Objeto"}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                          const fb = el.parentElement?.querySelector(".obj-fallback");
                          if (fb) fb.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className="obj-fallback hidden h-full w-full flex items-center justify-center bg-gray-100">
                      <PackageOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  </div>

                  {/* Datos del objeto */}
                  <div className="space-y-2.5">
                    <h4 className="font-display font-bold text-base text-brand-black">{selectedClaim.object?.name || "Objeto sin nombre"}</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Box className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono">{CATEGORY_LABELS[(selectedClaim.object as any)?.category] || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono">{selectedClaim.object?.foundAt ? new Date(selectedClaim.object.foundAt).toLocaleDateString("es-CO") : "—"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>Encontrado en: <strong className="text-gray-700">{(selectedClaim.object as any)?.location || "N/A"}</strong></span>
                      </div>
                      {(selectedClaim.object as any)?.storageLocation && (
                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                          <Search className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>Depósito: <strong className="text-gray-700">{(selectedClaim.object as any).storageLocation}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <p className="text-xs text-gray-600 leading-relaxed">{(selectedClaim.object as any)?.description || "Sin descripción"}</p>
                    </div>
                  </div>
                </div>

                {/* ═══ COLUMNA DERECHA: RECLAMACIÓN ═══ */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">
                    <FileText className="h-4 w-4 text-brand-coral" />
                    Reclamación del Estudiante
                  </div>

                  {/* Info del estudiante */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="h-9 w-9 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-black">{selectedClaim.user?.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">{selectedClaim.user?.email}</p>
                    </div>
                    {selectedClaim.lostLocation && (
                      <div className="ml-auto text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        Perdió en: {selectedClaim.lostLocation}
                      </div>
                    )}
                  </div>

                  {/* Evidencias */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">
                      Evidencias ({selectedClaim.evidences?.length || 0})
                    </h4>
                    {selectedClaim.evidences && selectedClaim.evidences.length > 0 ? (
                      selectedClaim.evidences.map((ev, idx) => (
                        <div key={ev.id || idx} className="p-3 bg-white rounded-lg border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/10 text-[9px] font-mono tracking-wider px-2 py-0.5 uppercase border-0">
                              {EVIDENCE_LABELS[ev.type]}
                            </Badge>
                            <span className="text-[9px] text-gray-400 font-mono">#{idx + 1}</span>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">{ev.description}</p>
                          )}
                          {ev.url && (
                            <div className="mt-2 relative">
                              {ev.url.startsWith('data:') || ev.url.startsWith('http') ? (
                                <>
                                  <img
                                    src={ev.url}
                                    alt={ev.description || ev.type}
                                    className="max-h-36 rounded-lg border border-gray-150 object-cover w-full"
                                    onError={(e) => {
                                      const el = e.target as HTMLImageElement;
                                      el.style.display = "none";
                                      const fb = el.parentElement?.querySelector(".ev-fallback");
                                      if (fb) fb.classList.remove("hidden");
                                    }}
                                  />
                                  <div className="ev-fallback hidden mt-1">
                                    <a href={ev.url} target="_blank" rel="noopener noreferrer"
                                      className="text-[10px] text-brand-green font-mono hover:underline break-all">
                                      Abrir en nueva pestaña
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-mono break-all">{ev.url}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Sin evidencias adjuntas.</p>
                    )}
                  </div>

                  {/* Motivo de rechazo si fue rechazado */}
                  {selectedClaim.status === "REJECTED" && selectedClaim.rejectionReason && (
                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                      <h4 className="text-xs font-bold text-red-800 mb-1">Motivo del Rechazo</h4>
                      <p className="text-xs text-red-700 leading-relaxed">{selectedClaim.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            {selectedClaim.status === "PENDING" && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 font-mono">
                  Compará visualmente las evidencias del estudiante con los datos del objeto encontrado.
                </p>
                <div className="flex items-center gap-3">
                  {!showRejectForm && (
                    <Button onClick={() => setShowRejectForm(true)} variant="outline"
                      className="rounded-pill border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-5 py-2.5 flex items-center gap-2"
                      disabled={verifying}>
                      <ShieldX className="h-3.5 w-3.5" /> Rechazar Manual
                    </Button>
                  )}
                  {showRejectForm && (
                    <div className="flex items-center gap-2">
                      <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Motivo del rechazo..."
                        rows={2} className="w-56 px-3 py-2 rounded-xl border border-red-200 text-xs resize-none focus:border-red-400 outline-none" />
                      <Button onClick={handleRejectClaim} disabled={rejecting || !rejectionReason.trim()}
                        className="rounded-pill bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2">
                        {rejecting ? "..." : "Confirmar"}
                      </Button>
                      <Button onClick={() => setShowRejectForm(false)} variant="ghost" className="text-xs" disabled={rejecting}>Cancelar</Button>
                    </div>
                  )}
                  <Button onClick={handleVerifyClaim} disabled={verifying || rejecting}
                    className="rounded-pill bg-brand-green hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm">
                    {verifying ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Verificando...</>
                    ) : (
                      <><ShieldCheck className="h-3.5 w-3.5" /> Aprobar y Verificar</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

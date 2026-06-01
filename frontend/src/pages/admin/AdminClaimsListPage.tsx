import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../../lib/api";
import { type Claim } from "../../types";
import { EVIDENCE_LABELS } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Eye, X, ShieldCheck, ShieldX, FileText, MapPin, Calendar, User, PackageOpen } from "lucide-react";
import { toast } from "sonner";

export const AdminClaimsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<Claim>>({ items: [], total: 0, page: 1, limit: 20 });

  // Modal de revisión
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

  useEffect(() => {
    fetchClaims();
  }, []);

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
      toast.success("¡Reclamación verificada y aprobada!", {
        description: `La reclamación ${selectedClaim.id.substring(0, 8)}... fue verificada exitosamente.`,
      });
      setReviewModalOpen(false);
      fetchClaims();
    } catch (err: any) {
      toast.error("Verificación fallida", {
        description: err.message || "La reclamación no pudo ser verificada.",
      });
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
      await api.updateClaim(selectedClaim.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Reclamación rechazada", {
        description: `La reclamación ${selectedClaim.id.substring(0, 8)}... ha sido rechazada manualmente.`,
      });
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
      case "PENDING":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-amber-50">PENDIENTE</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-emerald-50">APROBADO</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 border hover:bg-red-50">RECHAZADO</Badge>;
      default:
        return <Badge className="text-[10px] font-mono">{status}</Badge>;
    }
  };

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
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        onClick={() => openReviewModal(claim)}
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

      {/* ═══════════════════ MODAL DE REVISIÓN ═══════════════════ */}
      {reviewModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setReviewModalOpen(false)}>
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-xl text-brand-black tracking-tight">
                  Detalle de Reclamación
                </h3>
                <p className="text-[11px] font-mono text-gray-400 mt-1">ID: {selectedClaim.id}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Información del claim */}
            <div className="p-6 space-y-5">
              {/* Info del estudiante */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-black">{selectedClaim.user?.name || selectedClaim.userId}</h4>
                  <p className="text-[11px] text-gray-400 font-mono">{selectedClaim.user?.email || "Email no disponible"}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedClaim.status)}
                </div>
              </div>

              {/* Info del objeto */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">Objeto Reclamado</h4>
                <div className="flex items-start gap-3">
                  {selectedClaim.object && (
                    <img
                      src={(selectedClaim.object as any)?.photo || ""}
                      alt={selectedClaim.object?.name || "Objeto"}
                      className="h-16 w-16 rounded-lg object-cover shrink-0 bg-gray-200"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        const fallback = el.parentElement?.querySelector(".img-fallback");
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  )}
                  {selectedClaim.object && (
                    <div className="img-fallback hidden h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <PackageOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-brand-black">{selectedClaim.object?.name || "Objeto sin nombre"}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {(selectedClaim.object as any)?.location || "N/A"}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selectedClaim.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidencias */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Evidencias Presentadas ({selectedClaim.evidences?.length || 0})
                </h4>
                {selectedClaim.evidences && selectedClaim.evidences.length > 0 ? (
                  selectedClaim.evidences.map((ev, idx) => (
                    <div key={ev.id || idx} className="p-3 bg-white rounded-lg border border-gray-100 space-y-2">
                      <Badge className="bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/10 text-[9px] font-mono tracking-wider px-2 py-0.5 uppercase border-0">
                        {EVIDENCE_LABELS[ev.type] || ev.type.replace(/_/g, " ")}
                      </Badge>
                      {ev.description && <p className="text-xs text-gray-600 leading-relaxed">{ev.description}</p>}
                      {ev.url && (
                        <div className="mt-2 relative">
                          {ev.url.startsWith('data:') || ev.url.startsWith('http') ? (
                            <>
                              <img
                                src={ev.url}
                                alt={ev.description || ev.type}
                                className="max-h-48 rounded-lg border border-gray-150 object-cover"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  const fallback = el.parentElement?.querySelector(".ev-img-fallback");
                                  if (fallback) fallback.classList.remove("hidden");
                                }}
                              />
                              <div className="ev-img-fallback hidden mt-2">
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-brand-green font-mono hover:underline break-all"
                                >
                                  Abrir imagen en nueva pestaña
                                </a>
                              </div>
                            </>
                          ) : (
                            <p className="text-[11px] text-gray-400 break-all">{ev.url}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Sin evidencias adjuntas.</p>
                )}
              </div>

              {/* Motivo de rechazo (si ya fue rechazado) */}
              {selectedClaim.status === "REJECTED" && selectedClaim.rejectionReason && (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                  <h4 className="text-xs font-bold text-red-800 mb-1">Motivo del Rechazo</h4>
                  <p className="text-xs text-red-700 leading-relaxed">{selectedClaim.rejectionReason}</p>
                </div>
              )}

              {/* Formulario de rechazo manual */}
              {showRejectForm && selectedClaim.status === "PENDING" && (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-red-800">Motivo del rechazo (obligatorio)</h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explica el motivo por el cual se rechaza esta reclamación..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-red-200 text-sm resize-none focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none bg-white"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setShowRejectForm(false)}
                      variant="ghost"
                      className="text-xs rounded-lg"
                      disabled={rejecting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleRejectClaim}
                      disabled={rejecting || !rejectionReason.trim()}
                      className="rounded-pill bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 flex items-center gap-2"
                    >
                      {rejecting ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Rechazando...
                        </>
                      ) : (
                        <>
                          <ShieldX className="h-3.5 w-3.5" />
                          Confirmar Rechazo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            {selectedClaim.status === "PENDING" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                {!showRejectForm && (
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    variant="outline"
                    className="rounded-pill border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-5 py-2.5 flex items-center gap-2"
                    disabled={verifying}
                  >
                    <ShieldX className="h-3.5 w-3.5" />
                    Rechazar Manual
                  </Button>
                )}
                <Button
                  onClick={handleVerifyClaim}
                  disabled={verifying || rejecting}
                  className="rounded-pill bg-brand-green hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm"
                >
                  {verifying ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

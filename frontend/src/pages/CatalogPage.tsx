import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Paginated } from "../lib/api";
import { type FoundObject, ObjectCategory, EvidenceType, CATEGORY_LABELS, EVIDENCE_LABELS } from "../types";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Search, MapPin, Calendar, Folder, PackageOpen, AlertCircle, X, Send, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const EVIDENCE_BY_CATEGORY: Record<string, EvidenceType[]> = {
  ELECTRONIC: [EvidenceType.SERIAL_NUMBER, EvidenceType.DIGITAL_INVOICE],
  DEFAULT: [EvidenceType.DETAILED_DESCRIPTION, EvidenceType.REFERENCE_PHOTO],
};

const getEvidenceTypes = (category: string): EvidenceType[] =>
  EVIDENCE_BY_CATEGORY[category] || EVIDENCE_BY_CATEGORY.DEFAULT;

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Paginated<FoundObject>>({ items: [], total: 0, page: 1, limit: 12 });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  // Modal de reclamación
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimObject, setClaimObject] = useState<FoundObject | null>(null);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [evidences, setEvidences] = useState<{ type: EvidenceType; description: string; url?: string }[]>([
    { type: EvidenceType.DETAILED_DESCRIPTION, description: "" },
  ]);
  const [lostLocation, setLostLocation] = useState("");

  // Debounce de búsqueda (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchObjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getObjects(
        { q: debouncedSearch, category: selectedCategory },
        page,
        12
      );
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar objetos.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, page]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const handleClaimClick = (obj: FoundObject) => {
    if (!isAuthenticated || !user) {
      toast.info("Debes iniciar sesión para reclamar un objeto.");
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    if (user.role === "ADMIN") {
      toast.info("Los administradores no pueden reclamar objetos.");
      return;
    }
    setClaimObject(obj);
    const types = getEvidenceTypes(obj.category);
    setEvidences(types.map(type => ({ type, description: "" })));
    setLostLocation("");
    setClaimModalOpen(true);
  };

  const addEvidence = () => {
    const defaultType = claimObject ? getEvidenceTypes(claimObject.category)[0] : EvidenceType.DETAILED_DESCRIPTION;
    setEvidences(prev => [...prev, { type: defaultType, description: "", url: undefined }]);
  };

  const removeEvidence = (index: number) => {
    if (evidences.length <= 1) return;
    setEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const updateEvidence = (index: number, field: "type" | "description" | "url", value: string) => {
    setEvidences(prev => prev.map((ev, i) => {
      if (i !== index) return ev;
      return { ...ev, [field]: value };
    }));
  };

  const handleEvidenceFile = async (index: number, file: File) => {
    try {
      const b64 = await toBase64(file);
      updateEvidence(index, "url", b64);
    } catch {
      toast.error("No se pudo leer la imagen.");
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimObject || !user) return;

    // Validación
    const hasEmptyDescription = evidences.some(ev => !ev.description.trim());
    if (hasEmptyDescription) {
      toast.error("Todas las evidencias deben tener una descripción.");
      return;
    }

    const photoEvidence = evidences.find(ev => ev.type === EvidenceType.REFERENCE_PHOTO);
    if (photoEvidence && !photoEvidence.url) {
      toast.error("Debes adjuntar una foto en la evidencia de tipo 'Foto de Referencia'.");
      return;
    }

    setClaimSubmitting(true);
    try {
      await api.createClaim({
        userId: user.id,
        objectId: claimObject.id,
        objectCategory: claimObject.category,
        lostLocation: lostLocation || undefined,
        evidences: evidences.map(ev => ({
          type: ev.type,
          description: ev.description.trim(),
          url: ev.url || undefined,
        })),
      });
      toast.success("¡Reclamación enviada exitosamente!", {
        description: `Tu reclamación para "${claimObject.name}" ha sido registrada y está pendiente de verificación.`,
      });
      setClaimModalOpen(false);
      setClaimObject(null);
    } catch (err: any) {
      const msg = err.message || "Intenta de nuevo más tarde.";
      if (msg.includes("request entity too large") || msg.includes("demasiado grande")) {
        toast.error("La imagen es demasiado grande", {
          description: "Por favor, usa una foto de menor tamaño o comprímela antes de subirla.",
        });
      } else {
        toast.error("Error al enviar reclamación", {
          description: msg,
        });
      }
    } finally {
      setClaimSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 antialiased font-body">
      {/* SECCIÓN HERO PRINCIPAL */}
      <section className="text-center pt-8 md:pt-16 max-w-3xl mx-auto px-4">
        <span className="font-mono text-xs text-brand-coral uppercase tracking-widest bg-brand-coral/10 py-1.5 px-3 rounded-full mb-4 inline-block font-semibold">
          🚀 Recuperación del Campus
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter leading-none text-brand-black mb-4">
          Objetos Extraviados Uninorte
        </h1>
        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          ¿Perdiste algo en la universidad? Busca en nuestro catálogo público oficial e inicia tu reclamación fácilmente.
        </p>
      </section>

      {/* FILTROS Y BÚSQUEDA */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green h-11"
            />
          </div>

          {/* Categoría Selector */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => { setSelectedCategory(""); setPage(1); }}
              className={`px-4 py-2.5 rounded-pill text-xs font-semibold border transition-all ${
                selectedCategory === ""
                  ? "bg-brand-near-black border-brand-near-black text-white"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              Todos
            </button>
            {Object.values(ObjectCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`px-4 py-2.5 rounded-pill text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-near-black border-brand-near-black text-white"
                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENIDO DEL CATÁLOGO */}
      <section className="max-w-7xl mx-auto px-4">
        {loading ? (
          /* SKELETON LOADING */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-4 space-y-4">
                <Skeleton className="h-44 w-full rounded-xl bg-gray-100" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3 bg-gray-100" />
                  <Skeleton className="h-4 w-1/2 bg-gray-100" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-1/4 bg-gray-100" />
                  <Skeleton className="h-4 w-1/3 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="text-center py-16 bg-red-50/50 rounded-2xl border border-red-100/50 max-w-xl mx-auto px-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-black">Error de comunicación</h3>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
            <Button
              onClick={fetchObjects}
              className="mt-6 rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold px-6 py-2.5"
            >
              Reintentar Conexión
            </Button>
          </div>
        ) : data.items.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 max-w-xl mx-auto px-6">
            <PackageOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-black">No se encontraron objetos</h3>
            <p className="text-sm text-gray-500 mt-2">
              No hay objetos registrados que coincidan con la búsqueda o categoría seleccionada en este momento.
            </p>
          </div>
        ) : (
          /* GRID DE OBJETOS */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((obj) => (
              <Card key={obj.id} className="group overflow-hidden rounded-2xl border-gray-150 hover:border-gray-300 hover:shadow-md transition-all duration-350 bg-white">
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {obj.photo ? (
                    <img
                      src={obj.photo}
                      alt={obj.name}
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <Folder className="h-12 w-12 stroke-[1.5]" />
                    </div>
                  )}
                  {/* Badge de Categoría */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-brand-coral hover:bg-brand-coral text-white text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-sm uppercase">
                      {CATEGORY_LABELS[obj.category] || obj.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col justify-between h-[180px]">
                  <div>
                    <h3 className="font-display font-bold text-lg tracking-tight text-brand-black leading-tight mb-2 group-hover:text-brand-green transition-colors">
                      {obj.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                      {obj.description}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{obj.location}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(obj.foundAt).toLocaleDateString()}
                      </span>
                      <Button
                        onClick={() => handleClaimClick(obj)}
                        variant="ghost"
                        className="h-8 text-xs font-semibold text-brand-green hover:bg-emerald-50 px-2.5 rounded-lg"
                      >
                        Reclamar →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* PAGINACIÓN */}
      {!loading && !error && data.total > data.limit && (
        <section className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-4 pt-6">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            variant="outline"
            className="rounded-pill border-gray-200 text-xs font-bold text-brand-black"
          >
            Anterior
          </Button>
          <span className="text-xs font-mono text-gray-500 font-semibold">
            Página {page} de {Math.ceil(data.total / data.limit)}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / data.limit)}
            variant="outline"
            className="rounded-pill border-gray-200 text-xs font-bold text-brand-black"
          >
            Siguiente
          </Button>
        </section>
      )}

      {/* ═══════════════════ MODAL DE RECLAMACIÓN ═══════════════════ */}
      {claimModalOpen && claimObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setClaimModalOpen(false)}>
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-150">
                  {claimObject.photo ? (
                    <img src={claimObject.photo} alt={claimObject.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <Folder className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-brand-black tracking-tight leading-tight">
                    Reclamar Objeto
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{claimObject.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-brand-coral hover:bg-brand-coral text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-sm uppercase">
                      {CATEGORY_LABELS[claimObject.category] || claimObject.category}
                    </Badge>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {claimObject.location}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido del formulario */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Para verificar que eres el dueño legítimo, proporciona al menos una evidencia que demuestre tu posesión del objeto. Mientras más detallada, más rápida será la aprobación.
                </p>
              </div>

              {/* Ubicación de pérdida */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">
                  ¿Dónde lo perdiste? (opcional)
                </label>
                <select
                  value={lostLocation}
                  onChange={(e) => setLostLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                >
                  <option value="">No recuerdo / No aplica</option>
                  <option disabled>── Bloques del campus ──</option>
                  {["A","B","C","D","E","F","G","H","I","J","K","L","M"].map(blk => (
                    <option key={blk} value={`Bloque ${blk}`}>Bloque {blk}</option>
                  ))}
                </select>
              </div>

              {/* Lista de evidencias */}
              {evidences.map((ev, index) => (
                <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">
                      Evidencia #{index + 1}
                    </span>
                    {evidences.length > 1 && (
                      <button
                        onClick={() => removeEvidence(index)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Tipo de evidencia */}
                  <select
                    value={ev.type}
                    onChange={(e) => updateEvidence(index, "type", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  >
                    {getEvidenceTypes(claimObject?.category || "").map((type) => (
                      <option key={type} value={type}>{EVIDENCE_LABELS[type] || type}</option>
                    ))}
                  </select>

                  {/* Descripción */}
                  <textarea
                    value={ev.description}
                    onChange={(e) => updateEvidence(index, "description", e.target.value)}
                    placeholder="Describe tu evidencia con el mayor detalle posible..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none"
                  />

                  {/* Upload de foto para REFERENCE_PHOTO */}
                  {ev.type === EvidenceType.REFERENCE_PHOTO && (
                    <div>
                      {ev.url ? (
                        <div className="relative inline-block">
                          <img src={ev.url} alt="Evidencia" className="max-h-32 rounded-lg border border-gray-200 object-cover" />
                          <button
                            onClick={() => updateEvidence(index, "url", "")}
                            className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600"
                          >✕</button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 py-2 px-3 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 cursor-pointer hover:border-brand-green hover:text-brand-green transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Adjuntar foto</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleEvidenceFile(index, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Botón agregar evidencia */}
              <button
                onClick={addEvidence}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar otra evidencia
              </button>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <Button
                onClick={() => setClaimModalOpen(false)}
                variant="outline"
                className="rounded-pill border-gray-200 text-xs font-semibold px-5 py-2.5"
                disabled={claimSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitClaim}
                disabled={claimSubmitting}
                className="rounded-pill bg-brand-green hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm"
              >
                {claimSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Enviar Reclamación
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

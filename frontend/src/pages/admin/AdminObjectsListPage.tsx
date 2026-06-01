import React, { useEffect, useState, useRef } from "react";
import { api, type Paginated } from "../../lib/api";
import { type FoundObject, ObjectCategory, CATEGORY_LABELS } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Plus, MapPin, Calendar, Edit, Trash2, X, AlertTriangle, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

interface ObjectForm {
  name: string;
  description: string;
  photo: string;
  category: string;
  location: string;
  storageLocation: string;
}

const EMPTY_FORM: ObjectForm = {
  name: "",
  description: "",
  photo: "",
  category: "",
  location: "",
  storageLocation: "",
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const AdminObjectsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<FoundObject>>({ items: [], total: 0, page: 1, limit: 10 });
  const [page, setPage] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedObject, setSelectedObject] = useState<FoundObject | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchObjects = async (p: number = page) => {
    setLoading(true);
    try {
      const res = await api.getObjects({}, p, 10);
      setData(res);
      setPage(p);
    } catch (err: any) {
      toast.error("Error al cargar inventario: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchObjects(); }, []);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setPreviewUrl("");
    setCreateModalOpen(true);
  };

  const openEditModal = (obj: FoundObject) => {
    setSelectedObject(obj);
    setForm({ name: obj.name, description: obj.description, photo: obj.photo, category: obj.category, location: obj.location, storageLocation: obj.storageLocation || "" });
    setPreviewUrl(obj.photo);
    setEditModalOpen(true);
  };

  const openDeleteModal = (obj: FoundObject) => {
    setSelectedObject(obj);
    setDeleteModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await toBase64(file);
      setForm(f => ({ ...f, photo: b64 }));
      setPreviewUrl(b64);
    } catch {
      toast.error("No se pudo leer la imagen.");
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.photo.trim() || !form.category || !form.location.trim()) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      await api.createObject({
        name: form.name.trim(),
        description: form.description.trim(),
        photo: form.photo.trim(),
        category: form.category as ObjectCategory,
        location: form.location.trim(),
        storageLocation: form.storageLocation.trim() || undefined,
      });
      toast.success("Objeto registrado en el inventario.");
      setCreateModalOpen(false);
      fetchObjects(1);
    } catch (err: any) {
      toast.error("Error al crear: " + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedObject) return;
    if (!form.name.trim() && !form.description.trim() && !form.photo.trim() && !form.category && !form.location.trim()) {
      toast.error("Al menos un campo debe ser modificado.");
      return;
    }
    setSubmitting(true);
    const patch: Record<string, string> = {};
    if (form.name.trim() && form.name.trim() !== selectedObject.name) patch.name = form.name.trim();
    if (form.description.trim() && form.description.trim() !== selectedObject.description) patch.description = form.description.trim();
    if (form.photo && form.photo !== selectedObject.photo) patch.photo = form.photo;
    if (form.category && form.category !== selectedObject.category) patch.category = form.category;
    if (form.location.trim() && form.location.trim() !== selectedObject.location) patch.location = form.location.trim();
    if (form.storageLocation.trim() && form.storageLocation.trim() !== (selectedObject.storageLocation || "")) patch.storageLocation = form.storageLocation.trim();

    try {
      await api.updateObject(selectedObject.id, patch);
      toast.success("Objeto actualizado.");
      setEditModalOpen(false);
      fetchObjects(page);
    } catch (err: any) {
      toast.error("Error al editar: " + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedObject) return;
    setSubmitting(true);
    try {
      await api.deleteObject(selectedObject.id);
      toast.success("Objeto eliminado del inventario.");
      setDeleteModalOpen(false);
      setSelectedObject(null);
      fetchObjects(page);
    } catch (err: any) {
      toast.error("Error al eliminar: " + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const PhotoField = () => (
    <div>
      <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Foto</label>
      <div className="flex items-center gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-24 w-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-brand-green hover:bg-emerald-50/30 transition-colors shrink-0 overflow-hidden"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Upload className="h-6 w-6" />
              <span className="text-[9px] font-mono">Subir</span>
            </div>
          )}
        </div>
        <div className="flex-1 text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">Arrastrá o hacé clic para subir una foto</p>
          <p>JPEG, PNG o WebP. Máximo 5 MB.</p>
          {previewUrl && (
            <button onClick={() => { setForm(f => ({ ...f, photo: "" })); setPreviewUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="mt-2 text-red-500 hover:underline font-semibold text-[11px]">
              Quitar imagen
            </button>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
    </div>
  );

  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Nombre</label>
        <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="ej: MacBook Pro M1" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition" />
      </div>
      <div>
        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Descripción</label>
        <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Detalles del objeto encontrado..." rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Categoría</label>
          <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition">
            <option value="" disabled>Seleccionar categoría</option>
            {Object.values(ObjectCategory).map(cat => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Ubicación</label>
          <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="ej: Biblioteca 2do Piso" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition" />
        </div>
        <div>
          <label className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold block mb-1.5">Ubicación en depósito</label>
          <input type="text" value={form.storageLocation} onChange={(e) => setForm(f => ({ ...f, storageLocation: e.target.value }))}
            placeholder="ej: Estante 3 - Caja 5" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition" />
        </div>
      </div>
      <PhotoField />
    </div>
  );

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">Inventario de Objetos</h2>
          <p className="text-gray-500 text-sm mt-1">Registro, edición y categorización de objetos encontrados en el campus.</p>
        </div>
        <Button onClick={openCreateModal} className="rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold px-5 py-2.5 flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Registrar Objeto
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full bg-gray-100" />)}
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">No hay objetos registrados en el inventario.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">Foto</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Nombre</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Ubicación</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Depósito</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Encontrado</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Categoría</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((obj) => (
                  <TableRow key={obj.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-150">
                        {obj.photo ? (
                          <img src={obj.photo} alt={obj.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300"><ImageIcon className="h-5 w-5" /></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-brand-black">
                      <div className="leading-tight">{obj.name}</div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[200px]">{obj.description}</div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex items-center gap-1 text-xs"><MapPin className="h-3.5 w-3.5 text-gray-400" /><span>{obj.location}</span></div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">
                      {obj.storageLocation || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" /><span>{new Date(obj.foundAt).toLocaleDateString()}</span></div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2.5 py-0.5 rounded-pill text-[10px] font-mono font-bold tracking-wider uppercase bg-orange-50 text-brand-coral border border-orange-100">{CATEGORY_LABELS[obj.category] || obj.category}</span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button onClick={() => openEditModal(obj)} variant="ghost" className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-gray-100"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => openDeleteModal(obj)} variant="ghost" className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {!loading && data.total > data.limit && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button onClick={() => fetchObjects(page - 1)} disabled={page === 1} variant="outline" className="rounded-pill border-gray-200 text-xs font-bold text-brand-black">Anterior</Button>
          <span className="text-xs font-mono text-gray-500 font-semibold">Página {page} de {Math.ceil(data.total / data.limit)}</span>
          <Button onClick={() => fetchObjects(page + 1)} disabled={page >= Math.ceil(data.total / data.limit)} variant="outline" className="rounded-pill border-gray-200 text-xs font-bold text-brand-black">Siguiente</Button>
        </div>
      )}

      {/* ═══════════════ MODAL CREAR ═══════════════ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCreateModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-xl text-brand-black tracking-tight">Registrar Objeto</h3>
                <p className="text-xs text-gray-500 mt-1">Completá los datos del objeto encontrado en el campus.</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6"><FormFields /></div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <Button onClick={() => setCreateModalOpen(false)} variant="outline" className="rounded-pill border-gray-200 text-xs font-semibold px-5 py-2.5" disabled={submitting}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={submitting} className="rounded-pill bg-brand-green hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm">
                {submitting ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Creando...</> : <><Plus className="h-3.5 w-3.5" /> Registrar</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL EDITAR ═══════════════ */}
      {editModalOpen && selectedObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-xl text-brand-black tracking-tight">Editar Objeto</h3>
                <p className="text-xs text-gray-500 mt-1">ID: {selectedObject.id}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6"><FormFields /></div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <Button onClick={() => setEditModalOpen(false)} variant="outline" className="rounded-pill border-gray-200 text-xs font-semibold px-5 py-2.5" disabled={submitting}>Cancelar</Button>
              <Button onClick={handleEdit} disabled={submitting} className="rounded-pill bg-brand-green hover:bg-emerald-600 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm">
                {submitting ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Guardando...</> : <>Guardar Cambios</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL ELIMINAR ═══════════════ */}
      {deleteModalOpen && selectedObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-brand-black tracking-tight">Eliminar Objeto</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                ¿Estás seguro de eliminar <strong className="text-brand-black">"{selectedObject.name}"</strong> del inventario? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">
              <Button onClick={() => setDeleteModalOpen(false)} variant="outline" className="rounded-pill border-gray-200 text-xs font-semibold px-5 py-2.5" disabled={submitting}>Cancelar</Button>
              <Button onClick={handleDelete} disabled={submitting} className="rounded-pill bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-6 py-2.5 flex items-center gap-2 shadow-sm">
                {submitting ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Eliminando...</> : <><Trash2 className="h-3.5 w-3.5" /> Eliminar</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

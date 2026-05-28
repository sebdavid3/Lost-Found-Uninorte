import React, { useEffect, useState } from "react";
import { api, Paginated } from "../../lib/api";
import { FoundObject } from "../../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Package, Plus, MapPin, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const AdminObjectsListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Paginated<FoundObject>>({ items: [], total: 0, page: 1, limit: 10 });

  useEffect(() => {
    const fetchObjects = async () => {
      setLoading(true);
      try {
        const res = await api.getObjects({}, 1, 10);
        setData(res);
      } catch (err: any) {
        toast.error("Error al cargar objetos: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchObjects();
  }, []);

  return (
    <div className="space-y-8 antialiased font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-black">
            Inventario de Objetos
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            CRUD completo para el registro, edición y categorización de objetos encontrados en el campus.
          </p>
        </div>

        <Button
          onClick={() => toast.info("Funcionalidad para añadir objeto en desarrollo.")}
          className="rounded-pill bg-brand-near-black hover:bg-brand-black text-white text-xs font-semibold px-5 py-2.5 flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Registrar Objeto
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/4 bg-gray-100" />
            <Skeleton className="h-32 w-full bg-gray-100" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No hay objetos registrados en el inventario.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest pl-6">Foto</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Nombre</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Ubicación</TableHead>
                  <TableHead className="font-mono text-xs text-gray-400 uppercase tracking-widest">Encontrado El</TableHead>
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
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-brand-black">
                      <div>
                        <div className="leading-tight">{obj.name}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-xs">{obj.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{obj.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{new Date(obj.foundAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2.5 py-0.5 rounded-pill text-[10px] font-mono font-bold tracking-wider uppercase bg-orange-50 text-brand-coral border border-orange-100">
                        {obj.category}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => toast.info("Editar objeto en desarrollo.")}
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => toast.info("Eliminar objeto en desarrollo.")}
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

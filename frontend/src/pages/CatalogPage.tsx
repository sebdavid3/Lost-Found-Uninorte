import React, { useEffect, useState } from "react";
import { api, type Paginated } from "../lib/api";
import { type FoundObject, ObjectCategory } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Search, MapPin, Calendar, Folder, PackageOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const CatalogPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Paginated<FoundObject>>({ items: [], total: 0, page: 1, limit: 12 });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchObjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getObjects(
        { q: searchTerm, category: selectedCategory },
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
  };

  useEffect(() => {
    fetchObjects();
  }, [searchTerm, selectedCategory, page]);

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
          ¿Perdiste algo en la universidad? Busca en nuestro catálogo público oficial en tiempo real e inicia tu reclamación con total transparencia.
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
                {cat}
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
                      {obj.category}
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
                        onClick={() => toast.info(`Para reclamar este objeto: "${obj.name}", inicia sesión como Estudiante`)}
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
    </div>
  );
};

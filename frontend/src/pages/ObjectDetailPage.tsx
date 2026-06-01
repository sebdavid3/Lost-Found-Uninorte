import { useParams } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'

export default function ObjectDetailPage(){
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Objeto</h2>
      {!id ? <EmptyState title="Objeto no encontrado" description="ID faltante en la ruta." /> : (
        <div className="mt-4">
          <p className="text-sm text-slate-600">Mostrando detalles del objeto <strong>{id}</strong>.</p>
          <div className="mt-4 bg-white p-4 rounded shadow">Hero / Carrusel placeholder</div>
        </div>
      )}
    </div>
  )
}

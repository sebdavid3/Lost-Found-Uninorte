import { useParams } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'

export default function ClaimAuditPage(){
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Auditoría de Reclamo</h2>
      {!id ? <EmptyState title="Reclamo no encontrado" /> : (
        <div className="mt-4">Jaccard score, logs y firma para <strong>{id}</strong> (placeholder)</div>
      )}
    </div>
  )
}

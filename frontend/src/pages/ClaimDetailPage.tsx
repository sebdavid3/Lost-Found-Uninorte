import React from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'

export default function ClaimDetailPage(){
  const { id } = useParams()
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Detalle de Reclamo</h2>
      {!id ? <EmptyState title="Reclamo no encontrado" /> : (
        <div className="mt-4">Información del reclamo <strong>{id}</strong></div>
      )}
    </div>
  )
}

import React from 'react'
import { useForm } from 'react-hook-form'
import { ObjectSchema } from '../../schemas/objects'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'

export default function AdminEditObjectPage(){
  const { id } = useParams()
  const { register, handleSubmit } = useForm({resolver: zodResolver(ObjectSchema)})
  const onSubmit = (data:any)=>{ console.log('edit', id, data); alert('Objeto editado (simulado)') }
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Editar Objeto</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Nombre</label>
          <input {...register('name')} className="w-full border rounded px-2 py-1" />
        </div>
        <button className="px-3 py-1 bg-amber-600 text-white rounded">Guardar</button>
      </form>
    </div>
  )
}

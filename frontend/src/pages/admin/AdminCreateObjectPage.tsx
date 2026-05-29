import React from 'react'
import { useForm } from 'react-hook-form'
import { ObjectSchema } from '../../schemas/objects'
import { zodResolver } from '@hookform/resolvers/zod'

export default function AdminCreateObjectPage(){
  const { register, handleSubmit } = useForm({resolver: zodResolver(ObjectSchema)})
  const onSubmit = (data:any)=>{ console.log('create object', data); alert('Objeto creado (simulado)') }
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Crear Objeto</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Nombre</label>
          <input {...register('name')} className="w-full border rounded px-2 py-1" />
        </div>
        <button className="px-3 py-1 bg-green-600 text-white rounded">Crear</button>
      </form>
    </div>
  )
}

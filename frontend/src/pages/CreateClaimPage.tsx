import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { CreateClaimSchema } from '../schemas/claims'
import { zodResolver } from '@hookform/resolvers/zod'

export default function CreateClaimPage(){
  const { register, handleSubmit, control } = useForm({resolver: zodResolver(CreateClaimSchema)})
  const onSubmit = (data:any)=>{
    console.log('create claim', data)
    alert('Crear reclamo (simulado)')
  }
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Crear Reclamo</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Object ID</label>
          <input {...register('objectId')} className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Evidencias (JSON)</label>
          <Controller control={control} name="evidences" defaultValue={[{type:'PHOTO',description:'foto'}]} render={({field})=> (
            <textarea {...field} className="w-full border rounded p-2" rows={4} />
          )} />
        </div>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Enviar</button>
      </form>
    </div>
  )
}

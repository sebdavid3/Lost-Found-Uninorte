import React from 'react'

export default function ErrorState({title, description}:{title?:string, description?:string}){
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="text-3xl font-semibold text-red-600">{title ?? 'Error'}</div>
      {description && <p className="mt-2 text-sm text-red-500">{description}</p>}
    </div>
  )
}

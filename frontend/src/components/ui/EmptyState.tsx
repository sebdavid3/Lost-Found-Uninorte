export default function EmptyState({title, description}:{title?:string, description?:string}){
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="text-3xl font-semibold text-slate-700">{title ?? 'Nada por aquí'}</div>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  )
}

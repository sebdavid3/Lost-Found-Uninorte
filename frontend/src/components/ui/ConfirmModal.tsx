type Props = {
  open: boolean
  title?: string
  description?: string
  onConfirm: ()=>void
  onClose: ()=>void
}

export default function ConfirmModal({open, title, description, onConfirm, onClose}:Props){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title ?? 'Confirmar acción'}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-slate-100 rounded">Cancelar</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Confirmar</button>
        </div>
      </div>
    </div>
  )
}

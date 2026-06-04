type Props = {
  page: number
  pageSize: number
  total: number
  onChange: (p:number)=>void
}

export default function Pagination({page, pageSize, total, onChange}:Props){
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center gap-2">
      <button onClick={()=>onChange(Math.max(1, page-1))} className="px-2 py-1 bg-slate-100 rounded">Prev</button>
      <span className="text-sm">{page} / {totalPages}</span>
      <button onClick={()=>onChange(Math.min(totalPages, page+1))} className="px-2 py-1 bg-slate-100 rounded">Next</button>
    </div>
  )
}

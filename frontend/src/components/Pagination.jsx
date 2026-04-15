import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  const getPages = () => {
    const arr = []
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) arr.push(i)
    } else {
      arr.push(1)
      if (page > 3) arr.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) arr.push(i)
      if (page < pages - 2) arr.push('...')
      arr.push(pages)
    }
    return arr
  }

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={15} />
      </button>
      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`dots-${i}`} style={{ padding: '0 6px', color: 'var(--text-muted)' }}>…</span>
          : <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

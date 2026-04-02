import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import EmptyState from './EmptyState'

/**
 * SortableTable - Feature #7: Advanced tables with interactions
 * Supports: sorting, row selection, pagination, column toggles, inline actions
 */
export default function SortableTable({
  columns,
  data = [],
  emptyType = 'search',
  emptyTitle,
  emptyDesc,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  rowKey = 'id',
  className = '',
  compact = false,
}) {
  const [sortCol, setSortCol]         = useState(null)
  const [sortDir, setSortDir]         = useState('asc')
  const [page, setPage]               = useState(1)
  const [selected, setSelected]       = useState(new Set())
  const [hiddenCols, setHiddenCols]   = useState(new Set())
  const [showColMenu, setShowColMenu] = useState(false)

  // Sort
  const sorted = useMemo(() => {
    if (!sortCol) return data
    return [...data].sort((a, b) => {
      const col = columns.find(c => c.key === sortCol)
      const valA = col?.accessor ? col.accessor(a) : a[sortCol]
      const valB = col?.accessor ? col.accessor(b) : b[sortCol]
      const cmp = String(valA ?? '').localeCompare(String(valB ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortCol, sortDir, columns])

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)
  const visibleCols = columns.filter(c => !hiddenCols.has(c.key))

  const handleSort = (key) => {
    if (!key) return
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(key); setSortDir('asc') }
    setPage(1)
  }

  const toggleRow = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const all = new Set(paged.map(r => r[rowKey]))
      setSelected(all)
      onSelectionChange?.(Array.from(all))
    }
  }

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sortCol !== col.key) return <ChevronsUpDown size={13} style={{ opacity: 0.35, marginLeft: 4 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={13} style={{ color: '#1a73e8', marginLeft: 4 }} />
      : <ChevronDown size={13} style={{ color: '#1a73e8', marginLeft: 4 }} />
  }

  if (data.length === 0) {
    return <EmptyState type={emptyType} title={emptyTitle} desc={emptyDesc} />
  }

  return (
    <div className={`sortable-table-wrap ${className}`}>
      {/* Column visibility toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, position: 'relative' }}>
        <button
          onClick={() => setShowColMenu(v => !v)}
          style={{
            fontSize: 12, fontWeight: 600, padding: '5px 12px',
            border: '1px solid var(--border-color)', borderRadius: 8,
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
          }}
          title="Toggle column visibility"
        >
          Columns
        </button>
        {showColMenu && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 160, marginTop: 4
          }}>
            {columns.filter(c => c.toggleable !== false).map(c => (
              <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={!hiddenCols.has(c.key)}
                  onChange={() => {
                    const next = new Set(hiddenCols)
                    next.has(c.key) ? next.delete(c.key) : next.add(c.key)
                    setHiddenCols(next)
                  }}
                  style={{ width: 14, height: 14 }}
                />
                {c.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="sortable-table" role="grid">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40, padding: compact ? '10px 8px' : '14px 16px' }}>
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selected.size === paged.length}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                    style={{ width: 15, height: 15 }}
                  />
                </th>
              )}
              {visibleCols.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    padding: compact ? '10px 12px' : '14px 16px',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                  aria-sort={sortCol === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => {
              const key = row[rowKey] ?? i
              const isSelected = selected.has(key)
              return (
                <tr
                  key={key}
                  className={isSelected ? 'selected' : ''}
                  onClick={selectable ? () => toggleRow(key) : undefined}
                  style={{ cursor: selectable ? 'pointer' : 'default' }}
                  role={selectable ? 'checkbox' : 'row'}
                  aria-checked={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <td style={{ padding: compact ? '8px 8px' : '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        onClick={e => e.stopPropagation()}
                        aria-label="Select row"
                        style={{ width: 15, height: 15 }}
                      />
                    </td>
                  )}
                  {visibleCols.map(col => (
                    <td key={col.key} style={{ padding: compact ? '8px 12px' : '12px 16px' }}>
                      {col.render
                        ? col.render(col.accessor ? col.accessor(row) : row[col.key], row)
                        : (col.accessor ? col.accessor(row) : row[col.key]) ?? '—'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination" role="navigation" aria-label="Table pagination">
          <span className="pagination-info">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="pagination-controls">
            <button onClick={() => setPage(1)}       disabled={page === 1}          aria-label="First page">«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}       aria-label="Previous page">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = page - 2 + i
              if (p < 1) p = i + 1
              if (p > totalPages) p = totalPages - (4 - i)
              if (p < 1 || p > totalPages) return null
              return (
                <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''} aria-current={page === p ? 'page' : undefined}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}  aria-label="Last page">»</button>
          </div>
        </div>
      )}
    </div>
  )
}

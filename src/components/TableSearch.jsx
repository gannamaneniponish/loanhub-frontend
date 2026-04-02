import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import '../styles/TableSearch.css'

export function TableSearch({ data, columns, onFilter, title = 'Results' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

  // Filter data based on search term
  const filtered = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        columns.some(col => {
          const value = col.accessor ? col.accessor(item) : item[col.key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => {
          const itemValue = item[key]
          return itemValue === value
        })
      }
    })

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, filters, sortBy, sortOrder, columns])

  const getFilterOptions = (key) => {
    const uniqueValues = [...new Set(data.map(item => item[key]))]
    return uniqueValues.filter(Boolean)
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  return (
    <div className="table-search-container">
      <div className="search-bar-wrapper">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by loan ID, name, email, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-wrapper">
        <div className="filter-badges">
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <div key={key} className="filter-badge">
                <span>{key}: {value}</span>
                <button 
                  onClick={() => setFilters({...filters, [key]: ''})}
                  className="badge-close"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)}>
                  <div className="header-cell">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span className="sort-indicator">
                        {sortBy === col.key ? (sortOrder === 'asc' ? '↑' : '↓') : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={idx} className="table-row">
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : col.accessor ? col.accessor(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="result-count">
          Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> {title}
        </p>
      </div>
    </div>
  )
}

export default TableSearch

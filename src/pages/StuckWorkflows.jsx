import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import '../App.css'
import './StuckWorkflows.css'

const StuckWorkflows = () => {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reprocessingIds, setReprocessingIds] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const fetchStuckWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Replace with actual API path
      const response = await fetch('/api/workflows/stuck')
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
      const data = await response.json()
      setWorkflows(data.items || [])
      setCurrentPage(1)
    } catch (err) {
      console.error('Error fetching stuck workflows:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStuckWorkflows()
  }, [fetchStuckWorkflows])

  const formatAge = (minutes) => {
    if (!minutes) return '—'
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`
  }

  const handleReprocess = async (workflow) => {
    const id = workflow.thread_id
    try {
      setReprocessingIds(prev => ({ ...prev, [id]: true }))
      // TODO: Replace with actual API path
      const response = await fetch(`/api/workflows/${id}/reprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.status !== 200) throw new Error(`Reprocess failed: ${response.status}`)
      toast.success(`Workflow ${id} reprocessing triggered`)
      // Refresh the list after reprocessing
      fetchStuckWorkflows()
    } catch (err) {
      console.error('Error reprocessing workflow:', err)
      toast.error(`Failed to reprocess workflow ${id}`)
    } finally {
      setReprocessingIds(prev => ({ ...prev, [id]: false }))
    }
  }

  const formatTimestamp = (ts) => {
    if (!ts) return '—'
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      '  ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const totalPages = Math.ceil(workflows.length / rowsPerPage)
  const paginatedWorkflows = workflows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <>
        <div className="sw-page-title">Stuck Workflows</div>

        <div className="sw-table-wrapper">
          {loading ? (
            <div className="sw-loading-state">Loading stuck workflows…</div>
          ) : error ? (
            <div className="sw-error-state">
              Error: {error}
              <br />
              <button
                className="sw-reprocess-btn"
                style={{ marginTop: 12 }}
                onClick={fetchStuckWorkflows}
              >
                Retry
              </button>
            </div>
          ) : workflows.length === 0 ? (
            <div className="sw-empty-state">No stuck workflows found 🎉</div>
          ) : (
            <>
            <table className="sw-table">
              <thead>
                <tr>
                  <th>Thread ID</th>
                  <th>Pipeline</th>
                  <th>Severity</th>
                  <th>Current Node</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th>Age</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkflows.map((wf, idx) => {
                  const id = wf.thread_id || ((currentPage - 1) * rowsPerPage + idx)
                  const isReprocessing = !!reprocessingIds[id]
                  return (
                    <tr key={id}>
                      <td>
                        <span className="sw-ticket-id">
                          {wf.thread_id || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="sw-workflow-name">
                          {wf.pipeline_name || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`sw-status-badge ${wf.severity === 'P1' ? 'sw-stuck' : wf.severity === 'P2' ? 'sw-retrying' : 'sw-default'}`}>
                          {wf.severity || '—'}
                        </span>
                      </td>
                      <td>{wf.current_node || '—'}</td>
                      <td>{wf.event_type || '—'}</td>
                      <td>
                        <span className={`sw-status-badge ${wf.status === 'processing' ? 'sw-retrying' : 'sw-stuck'}`}>
                          {wf.status || '—'}
                        </span>
                      </td>
                      <td>{formatAge(wf.age_minutes)}</td>
                      <td>
                        <span className="sw-timestamp">
                          {formatTimestamp(wf.created_at)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="sw-reprocess-btn"
                          disabled={isReprocessing}
                          onClick={() => handleReprocess(wf)}
                        >
                          {isReprocessing ? (
                            <>
                              <span className="sw-spinner" />
                              Reprocessing…
                            </>
                          ) : (
                            '↻ Reprocess'
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="sw-pagination">
                <span className="sw-pagination-info">
                  Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, workflows.length)} of {workflows.length}
                </span>
                <div className="sw-pagination-controls">
                  <button
                    className="sw-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {getPageNumbers().map((pg, i) =>
                    pg === '...' ? (
                      <span key={`ellipsis-${i}`} className="sw-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={pg}
                        className={`sw-page-btn ${pg === currentPage ? 'sw-page-active' : ''}`}
                        onClick={() => setCurrentPage(pg)}
                      >
                        {pg}
                      </button>
                    )
                  )}
                  <button
                    className="sw-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
    </>
  )
}

export default StuckWorkflows

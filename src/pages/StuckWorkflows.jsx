import React, { useState, useEffect, useCallback } from 'react'
import TopNav from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import toast from 'react-hot-toast'
import '../App.css'
import './StuckWorkflows.css'

const StuckWorkflows = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reprocessingIds, setReprocessingIds] = useState({})

  const fetchStuckWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Replace with actual API path
      const response = await fetch('/api/workflows/stuck')
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
      const data = await response.json()
      setWorkflows(data.items || [])
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

  return (
    <div className="app">
      <TopNav open={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <Sidebar open={menuOpen} />

      <main className={`main${menuOpen ? ' shifted' : ''}`}>
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
                {workflows.map((wf, idx) => {
                  const id = wf.thread_id || idx
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
          )}
        </div>
      </main>
    </div>
  )
}

export default StuckWorkflows

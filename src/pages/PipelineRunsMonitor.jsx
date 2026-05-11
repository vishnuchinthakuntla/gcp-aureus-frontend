import React, { useState, useEffect } from 'react'
import './PipelineRunsMonitor.css'

const AGENT_BADGE = {
  Observer:    { label: 'Observer',      cls: 'agent-badge--observer' },
  RCA:         { label: 'RCA',           cls: 'agent-badge--rca' },
  Decision:    { label: 'Decision',      cls: 'agent-badge--decision' },
  SelfHealing: { label: 'Self-Healing',  cls: 'agent-badge--healing' },
  DataQuality: { label: 'Data Quality',  cls: 'agent-badge--quality' },
  system: { label: 'System', cls: 'agent-badge--system' },
  audit:  { label: 'Audit', cls: 'agent-badge--audit' },
  join:  { label: 'Join', cls: 'agent-badge--join' },
  "Self-Service":  { label: 'Self-Service', cls: 'agent-badge--selfservice' }
}

const PipelineRunsMonitor = () => {
  const [dateFrom, setDateFrom] = useState('2026-04-18')
  const [dateTo, setDateTo] = useState('2026-04-20')
  const [searchValue, setSearchValue] = useState('')
  const [pipeline, setPipeline] = useState('')
  const [liveEnabled, setLiveEnabled] = useState(true)
  const [agent, setAgent] = useState('')
  const [pipelineOptions, setPipelineOptions] = useState([])
  const [rows, setRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const fetchPipelineRuns = async (search = '') => {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', dateFrom);
    queryParams.append('end_date', dateTo);
    queryParams.append('pipeline_name', pipeline);
    queryParams.append('agent', agent)
    if (search) queryParams.append('search', search);
    const url = `/api/pipelines/monitoring?${queryParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json()
    setRows(data.logs)
  }

  useEffect(() => {
    fetchPipelineRuns()
  }, [dateFrom, dateTo, pipeline])

  useEffect(() => {
    loadPipelines();
  }, []);


  // Reset to page 1 when rows change
  // useEffect(() => {
  //   setCurrentPage(1)
  // }, [rows])

  const totalPages = Math.ceil(rows?.length / rowsPerPage)
  const paginatedRows = rows?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const loadPipelines = async () => {
    try {
      const res = await fetch("/api/pipelines_schedule");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data) {
        setTimeout(() => loadPipelines(), 1500)
        return
      }
      setPipelineOptions(data.items || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

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
      {/* ─── Filter Bar ─── */}
      <div className="filters">
        <div className="filter-group">
          <div className="filter-label">From</div>
          <input
            type="date"
            className="fi"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">To</div>
          <input
            type="date"
            className="fi"
            id="dateTo"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">Pipeline</div>
          <select className="fi" id="pipeFilter" onChange={(e) => setPipeline(e.target.value)}>
            <option value="">All Pipelines</option>
            {pipelineOptions.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Agent</div>
          <select className="fi" id="agentFilter" onChange={(e) => setAgent(e.target.value)}>
            <option value="">All Agents</option>
            <option value="observer">Observer</option>
            <option value="rca">RCA</option>
            <option value="decision">Decision</option>
            <option value="selfhealing">Self-Healing</option>
            <option value="dataquality">Data Quality</option>
          </select>
        </div>

        <div className="filter-group" style={{ flex: 1 }}>
          <div className="filter-label">Search</div>
          <div className="search-wrap">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="fi"
              id="searchInput"
              placeholder="Search by name, ID or trigger..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchPipelineRuns(searchValue)
              }}
            />
          </div>
        </div>

        <div className="filter-right">
          <label className="live-toggle">
            Live
            <input
              type="checkbox"
              id="liveToggle"
              checked={liveEnabled}
              onChange={() => setLiveEnabled((v) => !v)}
            />
          </label>
        </div>
      </div>

      {/* ─── Status Label ─── */}
      <div className={`status-text ${liveEnabled ? 'live' : ''}`} id="statusLabel">
        Status: {liveEnabled ? 'Live Streaming' : 'Paused'}
      </div>

      {/* ─── Events Table ─── */}
      <div className="runs-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="sortable">
                  Date
                  {/* <div className={`sort-icon ${sortField === 'date' ? sortDir : ''}`}>
                    <span className="up">▲</span>
                    <span className="down">▼</span>
                  </div> */}
                </th>
                <th className="sortable">
                  Pipeline Name
                  {/* <div className={`sort-icon ${sortField === 'pipeline' ? sortDir : ''}`}>
                    <span className="up">▲</span>
                    <span className="down">▼</span>
                  </div> */}
                </th>
                <th className="sortable">
                  Agent
                  {/* <div className={`sort-icon ${sortField === 'agent' ? sortDir : ''}`}>
                    <span className="up">▲</span>
                    <span className="down">▼</span>
                  </div> */}
                </th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {paginatedRows?.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  <td>{row.date}</td>
                  <td>{row.pipeline.toString()}</td>
                  <td>
                    <span className={`agent-badge ${AGENT_BADGE[row.agent]?.cls}`}>
                      {AGENT_BADGE[row.agent]?.label}
                    </span>
                  </td>
                  <td>{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="sw-pagination">
            <span className="sw-pagination-info">
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, rows.length)} of {rows.length}
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
      </div>
    </>
  )
}

export default PipelineRunsMonitor

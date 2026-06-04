import React, { useState, useEffect, useRef } from 'react'
import usePersistedState from '../hooks/usePersistedState'
import { Search } from 'lucide-react'
import './PipelineRunsMonitor.css'

const CustomSelect = ({ options, value, onChange, placeholder, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-dropdown" ref={dropdownRef} id={id}>
      <div
        className={`fi dropdown-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          <div
            className={`dropdown-item ${value === "" ? 'selected' : ''}`}
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AGENT_BADGE = {
  Observer: { label: 'Observer', cls: 'agent-badge--observer' },
  RCA: { label: 'RCA', cls: 'agent-badge--rca' },
  Decision: { label: 'Decision', cls: 'agent-badge--decision' },
  "Self-Healing": { label: 'Self-Healing', cls: 'agent-badge--healing' },
  DataQuality: { label: 'Data Quality', cls: 'agent-badge--quality' },
  system: { label: 'System', cls: 'agent-badge--system' },
  audit: { label: 'Audit', cls: 'agent-badge--audit' },
  join: { label: 'Join', cls: 'agent-badge--join' },
  "Self-Service": { label: 'Self-Service', cls: 'agent-badge--selfservice' },
  email: { label: 'Email', cls: 'agent-badge--email' }
}

const toDateStr = (d) => d.toISOString().split('T')[0]
const todayStr = toDateStr(new Date())
const sevenDaysAgoStr = toDateStr(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

const PipelineRunsMonitor = () => {
  const [draftDateFrom, setDraftDateFrom] = usePersistedState('prm-draftDateFrom', sevenDaysAgoStr)
  const [draftDateTo, setDraftDateTo] = usePersistedState('prm-draftDateTo', todayStr)
  const [draftPipeline, setDraftPipeline] = usePersistedState('prm-draftPipeline', '')
  const [draftAgent, setDraftAgent] = usePersistedState('prm-draftAgent', '')

  const [dateFrom, setDateFrom] = usePersistedState('prm-dateFrom', sevenDaysAgoStr)
  const [dateTo, setDateTo] = usePersistedState('prm-dateTo', todayStr)
  const [pipeline, setPipeline] = usePersistedState('prm-pipeline', '')
  const [agent, setAgent] = usePersistedState('prm-agent', '')
  const [liveEnabled, setLiveEnabled] = usePersistedState('prm-liveEnabled', true)
  const [searchValue, setSearchValue] = useState('')
  const [pipelineOptions, setPipelineOptions] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const handleApplyFilters = () => {
    setDateFrom(draftDateFrom)
    setDateTo(draftDateTo)
    setPipeline(draftPipeline)
    setAgent(draftAgent)
  }

  const fetchPipelineRuns = async (search = '') => {
    setLoading(true);
    try {
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
      if (!response.ok || !response) {
        setTimeout(() => fetchPipelineRuns(search), 3000)
        return
      }
      const data = await response.json()
      setRows(data.logs || [])
      setPipelineOptions(data.pipelines || [])
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPipelineRuns()
  }, [dateFrom, dateTo, pipeline, agent])

  // useEffect(() => {
  //   loadPipelines();
  // }, []);


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
      setPipelineOptions(data.items.map(p => p.pipeline_name) || []);
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
      {/* ─── Main Header ─── */}
      <div className="pages-header">
        <h1 className="pages-title">Pipeline Runs Monitor</h1>
        <p className="pages-description">
          Monitor running pipelines, their status, and execution details.
        </p>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="filters">
        <div className="filter-group">
          <div className="filter-label">From</div>
          <input
            type="date"
            className="fi"
            id="dateFrom"
            value={draftDateFrom}
            onChange={(e) => setDraftDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">To</div>
          <input
            type="date"
            className="fi"
            id="dateTo"
            value={draftDateTo}
            onChange={(e) => setDraftDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">Pipeline</div>
          <CustomSelect
            id="pipeFilter"
            value={draftPipeline}
            onChange={(val) => setDraftPipeline(val)}
            placeholder="All Pipelines"
            options={pipelineOptions.map(p => ({ label: p, value: p }))}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">Agent</div>
          <CustomSelect
            id="agentFilter"
            value={draftAgent}
            onChange={(val) => setDraftAgent(val)}
            placeholder="All Agents"
            options={[
              { label: "Observer", value: "observer" },
              { label: "RCA", value: "rca" },
              { label: "Decision", value: "decision" },
              { label: "Self-Healing", value: "self_healing" },
              { label: "Data Quality", value: "data_quality" }
            ]}
          />
        </div>

        <div className="filter-group">
          <div className="filter-label">&nbsp;</div>
          <button className="pr-btn-primary" onClick={handleApplyFilters} style={{ height: '34px', padding: '0 16px', borderRadius: '6px', border: 'none', background: '#0c58b7', color: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>Apply</button>
        </div>

        <div className="filter-group" style={{ flex: 1 }}>
          <div className="filter-label">Search</div>
          <div className="search-wrap">
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
            <button className="search-btn-icon" onClick={() => fetchPipelineRuns(searchValue)} aria-label="Search">
              <Search size={14} strokeWidth={2.5} style={{ flexShrink: 0, minWidth: 14, minHeight: 14 }} />
            </button>
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
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                    <div className="loader-container">
                      <div className="spinner"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows?.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No live events found
                  </td>
                </tr>
              ) : (
                paginatedRows?.map((row, idx) => (
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
                ))
              )}
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

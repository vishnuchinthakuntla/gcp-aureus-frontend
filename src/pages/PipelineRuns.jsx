import React, { useState, useEffect } from 'react';
import './PipelineRuns.css';

// --- Subcomponents ---

const ScoreGrid = ({ runs }) => {
  const total = runs.length;
  const success = runs.filter(r => (r.status || '').toLowerCase() === 'succeeded' || (r.status || '').toLowerCase() === 'success').length;
  const failure = runs.filter(r => (r.status || '').toLowerCase() === 'failed' || (r.status || '').toLowerCase() === 'failure').length;
  const successRate = total > 0 ? Math.round((success / Math.max(total, 1)) * 100) : 0;

  return (
    <div className="pr-score-grid">
      <div className="pr-score-card pr-card-total">
        <div className="pr-score-label">Total Runs</div>
        <div className="pr-score-value">{total}</div>
      </div>
      <div className="pr-score-card pr-card-success">
        <div className="pr-score-label">Successful</div>
        <div className="pr-score-value">{success}</div>
      </div>
      <div className="pr-score-card pr-card-failure">
        <div className="pr-score-label">Failed</div>
        <div className="pr-score-value">{failure}</div>
      </div>
      <div className="pr-score-card pr-card-prio">
        <div className="pr-score-label">Success Rate</div>
        <div className="pr-score-value">{successRate}%</div>
      </div>
    </div>
  );
};

const Filters = ({ filters, setFilters, pipelineOptions, onExport }) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearch = () => {
    setFilters({ ...filters, search: localSearch });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="pr-filters">
      <div className="pr-filter-group">
        <div className="pr-filter-label">From</div>
        <input type="date" className="pr-fi" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
      </div>
      <div className="pr-filter-group">
        <div className="pr-filter-label">To</div>
        <input type="date" className="pr-fi" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
      </div>
      <div className="pr-filter-group">
        <div className="pr-filter-label">Pipeline</div>
        <select className="pr-fi" value={filters.pipeline} onChange={e => setFilters({...filters, pipeline: e.target.value})}>
          <option value="">All Pipelines</option>
          {pipelineOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="pr-filter-group">
        <div className="pr-filter-label">Status</div>
        <select className="pr-fi" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="succeeded">Success</option>
          <option value="failed">Failure</option>
        </select>
      </div>
      <div className="pr-filter-group" style={{ flex: 1 }}>
        <div className="pr-filter-label">Search</div>
        <div className="pr-search-wrap">
          <input 
            type="text" 
            className="pr-fi" 
            placeholder="Search by name, ID or trigger..." 
            value={localSearch} 
            onChange={e => setLocalSearch(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
          <button className="pr-search-btn-icon" onClick={handleSearch} aria-label="Search">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="3"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="pr-filter-right">
        <button className="pr-btn-primary" onClick={onExport}>Export CSV</button>
      </div>
    </div>
  );
};

const PipelineModal = ({ isOpen, onClose, runId, pipelineName }) => {
  const [runData, setRunData] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openStates, setOpenStates] = useState({});

  useEffect(() => {
    if (isOpen && runId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/pipeline-run/${runId}`).then(res => res.json()).catch(() => ({})),
        fetch(`/api/pipeline-run-stages/${runId}`).then(res => res.json()).catch(() => [])
      ]).then(([run, stgs]) => {
        setRunData(run);
        setStages(Array.isArray(stgs) ? stgs : []);
        setLoading(false);
      });
    }
  }, [isOpen, runId]);

  if (!isOpen) return null;

  const handleToggleState = (idx) => {
    setOpenStates(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getStatusColor = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'succeeded' || s === 'success') return { bg: '#dcfce7', text: '#047857' };
    if (s === 'failed' || s === 'failure') return { bg: '#fee2e2', text: '#991b1b' };
    if (s === 'running') return { bg: '#dbeafe', text: '#1e40af' };
    if (s === 'warning') return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#f1f5f9', text: '#374151' };
  };

  const formatStatus = (s) => (s || '').replace(/_/g, ' ').toUpperCase();

  return (
    <div className={`pr-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="pr-modal" onClick={e => e.stopPropagation()}>
        <div className="pr-modal-header">
          <div>
            <div className="pr-modal-title">{runData?.pipeline || pipelineName || 'Pipeline Run'}</div>
            <div className="pr-modal-meta">
              <span>📅 {runData?.startTime || '—'}</span>
              <span>🆔 {runId}</span>
              <span>⏱ {runData?.duration || 0} sec</span>
            </div>
          </div>
          <button className="pr-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="pr-modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading data flow...</div>
          ) : (
            <>
              <div className="pr-workflow-section">
                <div className="pr-section-title">Run Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '14px', background: '#f8faff', border: '1px solid #e8edf5', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                    <div style={{ marginTop: '4px' }}>
                      {(() => {
                        const colors = getStatusColor(runData?.status);
                        return (
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '5px', background: colors.bg, color: colors.text, fontSize: '11px', fontWeight: 700, border: `1px solid ${colors.bg}` }}>
                            {formatStatus(runData?.status)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div style={{ padding: '14px', background: '#f8faff', border: '1px solid #e8edf5', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Duration</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f2040' }}>{runData?.duration || 0} <span style={{ fontSize: '12px', color: '#94a3b8' }}>sec</span></div>
                  </div>
                </div>
              </div>

              <div className="pr-workflow-section">
                <div className="pr-section-title">Data Flow</div>
                <div className="pr-timeline">
                  {stages.length === 0 ? (
                    <div style={{ textAlign: 'center', width: '100%', color: '#64748b', fontSize: '13px', padding: '20px' }}>No activity log found for this run.</div>
                  ) : (
                    stages.map((s, idx) => {
                      let timeLabel = s.time || '';
                      if (timeLabel) {
                        try {
                           const d = new Date(timeLabel);
                           if (!isNaN(d.getTime())) timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        } catch(e) {}
                      }
                      const statusClass = (s.status || '').toLowerCase().replace(/[^a-z_]/g, '');
                      let prettyState = s.state;
                      try { prettyState = JSON.stringify(JSON.parse(s.state), null, 2); } catch { }

                      return (
                        <div className="pr-timeline-item" key={idx}>
                          <div className="pr-timeline-dot"></div>
                          <div className="pr-timeline-content">
                            <div className="pr-timeline-top">
                              <span className="pr-timeline-agent">{s.agent || 'system'}</span>
                              <span className="pr-timeline-time">{timeLabel}</span>
                            </div>
                            <div className="pr-timeline-stage">{s.stage || '—'}</div>
                            <span className={`pr-timeline-status ${statusClass}`}>{formatStatus(s.status)}</span>
                            {s.state && (
                              <>
                                <div className="pr-state-toggle" onClick={() => handleToggleState(idx)}>
                                  <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: openStates[idx] ? 'rotate(90deg)' : 'none' }}>▶</span> View Data
                                </div>
                                <pre className={`pr-state-block ${openStates[idx] ? 'open' : ''}`}>{prettyState}</pre>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const PipelineRuns = () => {
  const [runs, setRuns] = useState([]);
  const [filteredRuns, setFilteredRuns] = useState([]);
  const [pipelineOptions, setPipelineOptions] = useState([]);
  
  const [filters, setFilters] = useState({
    dateFrom: '2026-04-18',
    dateTo: '2026-04-20',
    pipeline: '',
    status: '',
    search: ''
  });

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: -1 });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [modalState, setModalState] = useState({ isOpen: false, runId: null, pipelineName: '' });

  useEffect(() => {
    fetchRuns();
  }, [filters.dateFrom, filters.dateTo, filters.pipeline, filters.status]);

  const fetchRuns = async () => {
    try {
      const { pipeline, status, dateFrom, dateTo } = filters;
      let apiStatus = status;
      if (apiStatus === 'success') apiStatus = 'succeeded';
      if (apiStatus === 'failure') apiStatus = 'failed';

      const res = await fetch(`/api/pipeline-runs?pipeline=${pipeline}&status=${apiStatus}&from=${dateFrom}&to=${dateTo}`);
      if (res.ok) {
        const data = await res.json();
        const mappedRuns = data.map(r => ({
          id: r.id,
          date: r.date,
          time: r.time,
          pipeline: r.pipeline || r.PipelineName,
          status: r.status,
          duration: r.duration,
          rows: 0,
          trigger: "Scheduled"
        }));
        setRuns(mappedRuns);

        // Extract pipelines for dropdown
        const uniquePipelines = [...new Set(mappedRuns.map(r => r.pipeline))].filter(Boolean).sort();
        setPipelineOptions(uniquePipelines);
      }
    } catch (e) {
      console.error("Failed to fetch pipeline runs", e);
    }
  };

  useEffect(() => {
    // Apply search and sort
    let result = [...runs];
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r => 
        (r.pipeline && r.pipeline.toLowerCase().includes(q)) || 
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let av = a[sortConfig.key];
      let bv = b[sortConfig.key];
      
      if (sortConfig.key === 'duration') {
        av = parseFloat(av) || 0;
        bv = parseFloat(bv) || 0;
        return (av - bv) * sortConfig.direction;
      }
      
      return String(av || '').localeCompare(String(bv || '')) * sortConfig.direction;
    });

    setFilteredRuns(result);
    setCurrentPage(1); // reset to page 1 on filter/sort change
  }, [runs, filters.search, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key ? prev.direction * -1 : 1
    }));
  };

  const exportCSV = () => {
    const headers = ['Run ID', 'Date', 'Time', 'Pipeline', 'Status', 'Duration', 'Trigger'];
    const csvRows = filteredRuns.map(r => [r.id, r.date, r.time, r.pipeline, r.status, r.duration, r.trigger].join(','));
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pipeline_runs.csv';
    a.click();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRuns.length / rowsPerPage);
  const paginatedRuns = filteredRuns.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderSortArrow = (key) => {
    if (sortConfig.key === key) {
      return <span className="sort-arrow" style={{ opacity: 1, color: '#93c5fd' }}>{sortConfig.direction === 1 ? '↑' : '↓'}</span>;
    }
    return <span className="sort-arrow">↕</span>;
  };

  return (
    <div>
      <div style={{ background: '#ffffff', border: '1px solid #dde3ee', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(14,23,38,0.04), 0 4px 20px rgba(14,23,38,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '4px', height: '18px', background: 'linear-gradient(180deg, #3b82f6, #a78bfa)', borderRadius: '2px' }}></div>
          <div className="pr-page-title" style={{ marginBottom: 0, color: '#0c58b7', fontSize: '14px', letterSpacing: '0.3px' }}>Pipeline Run Log</div>
        </div>
        <div className="pr-page-sub" style={{ marginBottom: 0, paddingLeft: '14px', fontSize: '11px' }}>Pipeline-wise execution history — click any pipeline name to view its data flow</div>
      </div>

      <ScoreGrid runs={filteredRuns} />
      
      <Filters filters={filters} setFilters={setFilters} pipelineOptions={pipelineOptions} onExport={exportCSV} />

      <div className="pr-card">
        <div className="pr-card-head">
          <div className="pr-card-title">Execution Runs</div>
          <div className="pr-card-count">{filteredRuns.length} runs</div>
        </div>
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} className={sortConfig.key === 'date' ? 'sorted' : ''}>Date {renderSortArrow('date')}</th>
                <th onClick={() => handleSort('pipeline')} className={sortConfig.key === 'pipeline' ? 'sorted' : ''}>Pipeline Name {renderSortArrow('pipeline')}</th>
                <th onClick={() => handleSort('status')} className={sortConfig.key === 'status' ? 'sorted' : ''}>Status {renderSortArrow('status')}</th>
                <th onClick={() => handleSort('duration')} className={sortConfig.key === 'duration' ? 'sorted' : ''}>Duration {renderSortArrow('duration')}</th>
                <th>Trigger</th>
                <th>Run ID</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRuns.map((r, i) => {
                const st = (r.status || '').toLowerCase();
                let statusClass = 'warning';
                if (st === 'succeeded' || st === 'success') statusClass = 'succeeded';
                if (st === 'failed' || st === 'failure') statusClass = 'failed';
                if (st === 'running') statusClass = 'running';

                return (
                  <tr key={r.id || i}>
                    <td className="pr-td-date">{r.date} <span style={{ marginLeft: '8px', color: '#94a3b8', fontSize: '10px' }}>{r.time}</span></td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', width: '12px', height: '14px' }}>
                        <div style={{ width: '12px', height: '2px', background: '#0072e5' }}></div>
                        <div style={{ width: '12px', height: '2px', background: '#0072e5' }}></div>
                        <div style={{ width: '12px', height: '2px', background: '#0072e5' }}></div>
                      </div>
                      <span className="pr-pipeline-link" onClick={() => setModalState({ isOpen: true, runId: r.id, pipelineName: r.pipeline })}>
                        {r.pipeline}
                      </span>
                    </td>
                    <td>
                      <span className={`pr-status-badge ${statusClass}`}>
                        <span className={`pr-dot ${statusClass === 'running' ? 'pulse' : ''}`}></span>
                        {(st || 'Unknown').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{r.duration} sec</td>
                    <td><span style={{ fontSize: '11px', color: '#64748b' }}>{r.trigger}</span></td>
                    <td><span style={{ fontSize: '10px', color: '#64748b' }}>{r.id}</span></td>
                  </tr>
                );
              })}
              {paginatedRuns.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No pipeline runs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 0 && (
          <div className="pr-pagination">
            <div className="pr-pag-info">
              {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredRuns.length)} of {filteredRuns.length} runs
            </div>
            <div className="pr-pag-btns">
              <button className="pr-pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pr-pag-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ))}
              <button className="pr-pag-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <PipelineModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, runId: null, pipelineName: '' })}
        runId={modalState.runId}
        pipelineName={modalState.pipelineName}
      />
    </div>
  );
};

export default PipelineRuns;

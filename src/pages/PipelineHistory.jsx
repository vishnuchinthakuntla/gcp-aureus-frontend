import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PipelineCharts from '../components/PipelineHistory/PipelineCharts'
import ThreadGroup from '../components/PipelineHistory/ThreadGroup'
import '../App.css'
import './PipelineHistory.css'

/* ── Step helpers ── */
const getStepStatusClass = (status) => {
  if (!status) return 'not-executed';
  const s = status.toLowerCase();
  if (s.includes('succe') || s.includes('completed')) return 'succeeded';
  if (s.includes('fail')) return 'failed';
  if (s.includes('running') || s.includes('progress')) return 'running';
  return 'not-executed';
};

const getStepIcon = (status) => {
  switch (getStepStatusClass(status)) {
    case 'succeeded': return '✓';
    case 'failed':    return '✗';
    case 'running':   return '⟳';
    default:          return '○';
  }
};

const formatCompletedAt = (completedObj) => {
  if (!completedObj) return null;
  return { date: completedObj.date || '', time: completedObj.time || '' };
};

const AGENT_OPTIONS = [
    { value: '', label: 'All Agents' },
    { value: 'observer', label: 'Observer Agent' },
    { value: 'rca', label: 'RCA Agent' },
    { value: 'decision', label: 'Decision Agent' },
    { value: 'selfhealing', label: 'Self-Healing Agent' },
    { value: 'dataquality', label: 'Data Quality Agent' },
    { value: 'governance', label: 'Governance Agent' },
]


const PipelineHistory = () => {
    const [pipelineData, setPipelineData] = useState({})
    const [selectedAgent, setSelectedAgent] = useState('')
    const [pipelineOptions, setPipelineOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showLogs, setShowLogs] = useState(true)

    // Draft state (UI-only, not yet applied)
    const [draftPipeline, setDraftPipeline] = useState('')
    const [draftFromDate, setDraftFromDate] = useState(new Date())
    const [draftToDate, setDraftToDate] = useState(new Date())

    // Applied state (used for fetching)
    const [appliedPipeline, setAppliedPipeline] = useState('')
    const [appliedFromDate, setAppliedFromDate] = useState(new Date())
    const [appliedToDate, setAppliedToDate] = useState(new Date())

    const handleApplyFilters = () => {
        setAppliedPipeline(draftPipeline)
        setAppliedFromDate(draftFromDate)
        setAppliedToDate(draftToDate)
    }

    useEffect(() => {
        fetch('/api/pipelines')
            .then(response => response.json())
            .then(data => {
                setPipelineOptions([
                    { value: '', label: 'Select Pipeline' },
                    ...data.items.map(pipeline => ({
                        value: pipeline.pipeline_name,
                        label: pipeline.pipeline_name,
                    }))
                ])
            })
    }, [])

  useEffect(() => {
    const fetchPipelineData = async () => {
        try{
            // Construct query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('pipeline_name', appliedPipeline || '');
            queryParams.append('agent_node', selectedAgent || '');
            if (appliedFromDate) queryParams.append('start_date', appliedFromDate.toISOString().split('T')[0]);
            if (appliedToDate) queryParams.append('end_date', appliedToDate.toISOString().split('T')[0]);
            
            const queryString = queryParams.toString();
            const url = `/api/pipelines/performance/v2${queryString ? `?${queryString}` : ''}`;

            if(appliedPipeline === ''){
                setPipelineData({})
                return
            }
            setLoading(true)
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json()
            
            setPipelineData(data)
        }
        catch(error){
            console.error('Error fetching pipeline data:', error)
        }
        finally{
            setLoading(false)
        }
    }
    const timer = setTimeout(() => {
        fetchPipelineData()
    }, 400)
    return () => clearTimeout(timer)
  }, [appliedPipeline, selectedAgent, appliedFromDate, appliedToDate])

  return (
    <>
        {/* ── FILTER ROW ── */}
        <div className="ph-filter-row">
          {/* Pipeline Dropdown */}
          <div className="ph-filter-group">
            <label className="ph-filter-label">Pipeline</label>
            <select
              className="ph-select"
              value={draftPipeline}
              onChange={(e) => setDraftPipeline(e.target.value)}
            >
              {pipelineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>


          {/* From Date */}
          <div className="ph-filter-group">
            <label className="ph-filter-label">From</label>
            <DatePicker
              selected={draftFromDate}
              onChange={(date) => setDraftFromDate(date)}
              selectsStart
              startDate={draftFromDate}
              endDate={draftToDate}
              maxDate={draftToDate || new Date()}
              placeholderText="Start date"
              className="ph-datepicker"
              dateFormat="dd MMM yyyy"
              isClearable
            />
          </div>

          {/* To Date */}
          <div className="ph-filter-group">
            <label className="ph-filter-label">To</label>
            <DatePicker
              selected={draftToDate}
              onChange={(date) => setDraftToDate(date)}
              selectsEnd
              startDate={draftFromDate}
              endDate={draftToDate}
              minDate={draftFromDate}
              maxDate={new Date()}
              placeholderText="End date"
              className="ph-datepicker"
              dateFormat="dd MMM yyyy"
              isClearable
            />
          </div>

          {/* Apply Button */}
          <div className="ph-filter-group ph-apply-group">
            <label className="ph-filter-label">&nbsp;</label>
            <button className="ph-apply-btn" onClick={handleApplyFilters}>Apply</button>
          </div>
        </div>

        {/* ── AGENT FILTER (Pills) ── */}
        <div className="filter-row">
          <span className="filter-label">Filter:</span>
          {AGENT_OPTIONS.map(opt => (
            <button 
              key={opt.value} 
              className={`filter-btn ${selectedAgent === opt.value ? 'active' : ''}`}
              onClick={() => setSelectedAgent(opt.value)}
            >
              {opt.value === '' ? 'All' : opt.label.replace(' Agent', '')}
            </button>
          ))}
        </div>

        {/* ── LOGS / STEPS TAB SWITCHER ── */}
        <div className="ph-tab-switcher">
          <button
            className={`ph-tab-btn ${showLogs ? 'active' : ''}`}
            onClick={() => setShowLogs(true)}
          >
            Logs
          </button>
          <button
            className={`ph-tab-btn ${!showLogs ? 'active' : ''}`}
            onClick={() => setShowLogs(false)}
          >
            Steps
          </button>
        </div>

        {loading ? (
          <div className="ph-loader-overlay">
            <div className="ph-spinner"></div>
            <span className="ph-loader-text">Loading pipeline data…</span>
          </div>
        ) : showLogs ? (
          <>
            {/* ── CHARTS (memo'd — won't re-render on thread expand/collapse) ── */}
            <PipelineCharts pipelineData={pipelineData} selectedAgent={selectedAgent} />

            {/* ── EXECUTION FLOW ── */}
            <div className="td-section-title">
              {selectedAgent
                ? `Run Detail — ${(AGENT_OPTIONS.find(a => a.value === selectedAgent)?.label || selectedAgent).toUpperCase()} Analysis`
                : 'Execution Flow — Run Detail'}
            </div>

            <div className="timeline-container">
              {!appliedPipeline ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                  Please select a pipeline
                </div>
              ) : (!pipelineData?.threads || Object.keys(pipelineData.threads).length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                  Please change the parameters as there is no content to display with those parameters
                </div>
              ) : (
                Object.entries(pipelineData.threads).map(([groupKey, threadData]) => (
                  <ThreadGroup key={groupKey} groupKey={groupKey} threadData={threadData} selectedAgent={selectedAgent} />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="timeline-container">
            {!appliedPipeline ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                Please select a pipeline
              </div>
            ) : (!pipelineData?.threads || Object.keys(pipelineData.threads).length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                Please change the parameters as there is no content to display with those parameters
              </div>
            ) : (
              Object.entries(pipelineData.threads).map(([threadId, threadData]) => {
                const steps = threadData.steps || [];
                if (steps.length === 0) return null;

                return (
                  <div key={threadId} className="steps-section" data-theme="light">
                    <div className="steps-header">
                      <h3>Thread: {threadId}</h3>
                      <div className="steps-meta">
                        <span className="steps-count">{steps.length} steps</span>
                      </div>
                    </div>

                    <div className="steps-pipeline">
                      {steps.map((step, i) => {
                        const cls = getStepStatusClass(step.status);
                        const completed = formatCompletedAt(step.completed_at);
                        return (
                          <React.Fragment key={i}>
                            <div className={`step-node ${cls}`}>
                              <span className="step-number">{i + 1}</span>
                              <div className="step-icon">{getStepIcon(step.status)}</div>
                              <div className="step-info">
                                <span className="step-name">{step.step_name || step.step}</span>
                                <span className={`step-status ${cls}`}>{step.status}</span>
                                {step.wall_time && (
                                  <span className="step-time">⏱ {step.wall_time}</span>
                                )}
                                {completed && (
                                  <div className="step-completed-group">
                                    <span className="step-completed-date">{completed.date}</span>
                                    {completed.time && (
                                      <span className="step-completed-time">{completed.time}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`step-connector ${cls}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
    </>
  )
}

export default PipelineHistory
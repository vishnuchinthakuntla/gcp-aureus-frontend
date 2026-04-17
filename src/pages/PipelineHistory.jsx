import React, { useState, useEffect } from 'react'
import TopNav from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '../App.css'
import './PipelineHistory.css'

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
    const [menuOpen, setMenuOpen] = useState(false)
    const [pipelineData, setPipelineData] = useState([])
    const [selectedPipeline, setSelectedPipeline] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')
    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [pipelineOptions, setPipelineOptions] = useState([])

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
            queryParams.append('pipeline_name', selectedPipeline || '');
            queryParams.append('agent_node', selectedAgent || '');
            if (fromDate) queryParams.append('start_date', fromDate.toISOString().split('T')[0]);
            if (toDate) queryParams.append('end_date', toDate.toISOString().split('T')[0]);
            
            const queryString = queryParams.toString();
            const url = `/api/pipelines/performance${queryString ? `?${queryString}` : ''}`;

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
    }
    const timer = setTimeout(() => {
        fetchPipelineData()
    }, 400)
    return () => clearTimeout(timer)
  }, [selectedPipeline, selectedAgent, fromDate, toDate])
  
  return (
    <div className="app">
      <TopNav open={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <Sidebar open={menuOpen} />

      <main className={`main${menuOpen ? ' shifted' : ''}`}>
        {/* ── FILTER ROW ── */}
        <div className="ph-filter-row">
          {/* Pipeline Dropdown */}
          <div className="ph-filter-group">
            <label className="ph-filter-label">Pipeline</label>
            <select
              className="ph-select"
              value={selectedPipeline}
              onChange={(e) => setSelectedPipeline(e.target.value)}
            >
              {pipelineOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Dropdown */}
          <div className="ph-filter-group">
            <label className="ph-filter-label">Agent</label>
            <select
              className="ph-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {AGENT_OPTIONS.map((opt) => (
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
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              selectsStart
              startDate={fromDate}
              endDate={toDate}
              maxDate={toDate || new Date()}
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
              selected={toDate}
              onChange={(date) => setToDate(date)}
              selectsEnd
              startDate={fromDate}
              endDate={toDate}
              minDate={fromDate}
              maxDate={new Date()}
              placeholderText="End date"
              className="ph-datepicker"
              dateFormat="dd MMM yyyy"
              isClearable
            />
          </div>
        </div>

        {/* ── CONTENT BELOW (your execution flow) ── */}
        <div className="td-section-title">Execution Flow</div>

        <div className="flow-container">
          {!selectedPipeline ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
              Please select a pipeline
            </div>
          ) : (!pipelineData?.agent_logs || pipelineData.agent_logs.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
              Please change the parameters as there is no content to display with those parameters
            </div>
          ) : (
            (pipelineData.agent_logs).map((log, i) => {
              const level = (log.level || "info").toLowerCase();
              const time = (new Date(log.logged_at).toLocaleDateString() + ' \t ' + new Date(log.logged_at).toLocaleTimeString());

              return (
                <div key={log.log_id} className={`flow-step ${level}`}>
                  <div className="flow-line">
                    <div className={`flow-dot ${level}`} />
                    {i !== pipelineData.agent_logs.length - 1 && (
                      <div className="flow-connector" />
                    )}
                  </div>

                  <div className="flow-content">
                    <div className="flow-header">
                      <span>{log.agent_node}</span>
                      <span>{time}</span>
                    </div>
                    <div className={`flow-message ${level}`}>{log.message}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  )
}

export default PipelineHistory
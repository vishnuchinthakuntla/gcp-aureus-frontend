import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PipelineCharts from '../components/PipelineHistory/PipelineCharts'
import ThreadGroup from '../components/PipelineHistory/ThreadGroup'
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
    const [pipelineData, setPipelineData] = useState({})
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
            const url = `/api/pipelines/performance/v2${queryString ? `?${queryString}` : ''}`;

            if(selectedPipeline === ''){
                setPipelineData({})
                return
            }
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
    <>
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

        {/* ── CHARTS (memo'd — won't re-render on thread expand/collapse) ── */}
        <PipelineCharts pipelineData={pipelineData} selectedAgent={selectedAgent} />

        {/* ── EXECUTION FLOW ── */}
        <div className="td-section-title">
          {selectedAgent
            ? `Run Detail — ${(AGENT_OPTIONS.find(a => a.value === selectedAgent)?.label || selectedAgent).toUpperCase()} Analysis`
            : 'Execution Flow — Run Detail'}
        </div>

        <div className="timeline-container">
          {!selectedPipeline ? (
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
  )
}

export default PipelineHistory
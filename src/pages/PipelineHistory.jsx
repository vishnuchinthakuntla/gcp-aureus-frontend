import React, { useState, useEffect } from 'react'
import TopNav from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
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
    const [pipelineData, setPipelineData] = useState({})
    const [selectedPipeline, setSelectedPipeline] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')
    const [fromDate, setFromDate] = useState(new Date())
    const [toDate, setToDate] = useState(new Date())
    const [pipelineOptions, setPipelineOptions] = useState([])
    const [expandedLogs, setExpandedLogs] = useState({})
    const [collapsedThreads, setCollapsedThreads] = useState({})

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

  const toggleLogExpansion = (id) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const toggleThreadCollapse = (id) => {
    setCollapsedThreads(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Calculate Chart Options
  let agentDistributionSeries = [];
  if (pipelineData?.agent_step_distribution) {
      const dataPoints = Object.entries(pipelineData.agent_step_distribution).map(([agent, count]) => {
          let color = '#aab8cc';
          const nodeLower = agent.toLowerCase();
          if (nodeLower.includes('observer')) color = 'var(--observer, #4f8ef7)';
          else if (nodeLower.includes('rca')) color = 'var(--rca, #f5a524)';
          else if (nodeLower.includes('decision')) color = 'var(--decision, #a78bfa)';
          else if (nodeLower.includes('ticket') || nodeLower.includes('heal')) color = 'var(--healing, #10d9a0)';
          else if (nodeLower.includes('quality')) color = 'var(--quality, #22d3ee)';
          else if (nodeLower.includes('gov')) color = 'var(--governance, #f43f5e)';
          else if (nodeLower.includes('join')) color = '#D05090';

          let name = agent.charAt(0).toUpperCase() + agent.slice(1);
          if (agent === 'ticket_agent') name = 'Ticket';
          return { name, y: count, color };
      });
      
      agentDistributionSeries = [{
          name: 'Events',
          colorByPoint: true,
          data: dataPoints
      }];
  }

  const agentChartOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
    title: { text: null },
    xAxis: { type: 'category' },
    yAxis: { title: { text: null }, tickAmount: 4 },
    legend: { enabled: false },
    credits: { enabled: false },
    series: agentDistributionSeries
  };

  let outcomeCategories = [];
  let outcomeSeries = [];
  if (pipelineData?.outcome_timeline && pipelineData.outcome_timeline.length > 0) {
      const uniqueDates = [...new Set(pipelineData.outcome_timeline.map(item => item.run_date))].sort();
      
      outcomeCategories = uniqueDates.map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      outcomeSeries = [
          {
              name: 'Escalated',
              color: 'var(--red, #e02d46)',
              data: uniqueDates.map(date => pipelineData.outcome_timeline.filter(item => item.run_date === date && (item.outcome === 'escalate')).length)
          },
          {
              name: 'Auto-healed',
              color: 'var(--healing, #10d9a0)',
              data: uniqueDates.map(date => pipelineData.outcome_timeline.filter(item => item.run_date === date && item.outcome === 'self_heal').length)
          }
      ];
  }

  const timelineChartOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
    title: { text: null },
    xAxis: { categories: outcomeCategories },
    yAxis: { title: { text: null }, tickAmount: 4 },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderWidth: 0,
        borderRadius: 2
      }
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: outcomeSeries
  };

  console.log(pipelineData)
  
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

        {/* ── CHARTS ── */}
        {(pipelineData?.summary && Object.keys(pipelineData?.summary).length > 0) && (
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Total Runs</div>
              <div className="summary-value">{pipelineData.summary.total_runs}</div>
              <div className="summary-sub sub-amber">{pipelineData.summary.escalated_count} escalated</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Avg Resolution</div>
              <div className="summary-value">{pipelineData.summary.avg_resolution_label}</div>
              <div className="summary-sub sub-green">{pipelineData.summary.sla_status}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Auto-Heal Rate</div>
              <div className="summary-value">{pipelineData.summary.auto_heal_rate*100}%</div>
              <div className="summary-sub sub-green">{pipelineData.summary.auto_healed_count} of {pipelineData.summary.total_runs} runs</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">RCA Confidence</div>
              <div className="summary-value">{pipelineData.summary.avg_rca_confidence ?? 'N/A'}</div>
              <div className="summary-sub sub-amber">{pipelineData.summary.low_confidence_count} low-conf incidents</div>
            </div>
          </div>
        )}

        {((pipelineData?.agent_step_distribution && Object.keys(pipelineData.agent_step_distribution).length > 0) || 
          (pipelineData?.outcome_timeline && pipelineData.outcome_timeline.length > 0)) && (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-label">Agent step distribution</div>
              <HighchartsReact highcharts={Highcharts} options={agentChartOptions} />
            </div>
            <div className="chart-card">
              <div className="chart-label">Outcome timeline</div>
              <HighchartsReact highcharts={Highcharts} options={timelineChartOptions} />
            </div>
          </div>
        )}

        {/* ── CONTENT BELOW (your execution flow) ── */}
        <div className="td-section-title">Execution Flow — Run Detail</div>

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
            Object.entries(pipelineData.threads).map(([groupKey, threadData]) => {
              const groupLogs = threadData.agent_logs || [];
              if (groupLogs.length === 0) return null;
              
              const isCollapsed = !!collapsedThreads[groupKey];
              return (
              <React.Fragment key={groupKey}>
                <div className="run-header" onClick={() => toggleThreadCollapse(groupKey)} style={{ cursor: 'pointer' }}>
                  <div className="run-dot" />
                  <div className="run-name">Thread: {groupKey}</div>
                  <div className="run-status">
                    {groupLogs.length} events
                    <span style={{ marginLeft: '8px', fontSize: '9px', opacity: 0.7, paddingBottom: '2px', display: 'inline-block' }}>
                      {isCollapsed ? '▼' : '▲'}
                    </span>
                  </div>
                </div>
                {!isCollapsed && groupLogs.map((log, i) => {
                  const level = (log.level || "info").toLowerCase();
                  const isError = level === 'error' || level === 'critical';
                  const time = (new Date(log.logged_at).toLocaleDateString() + ' \t ' + new Date(log.logged_at).toLocaleTimeString());
                  
                  let agentColorVar = 'var(--text-primary)';
                  let agentBgVar = 'var(--bg-elevated)';
                  const nodeLower = (log.agent_node || '').toLowerCase();
                  if (nodeLower.includes('observer')) { agentColorVar = 'var(--observer)'; agentBgVar = 'var(--observer-lt)'; }
                  else if (nodeLower.includes('rca')) { agentColorVar = 'var(--rca)'; agentBgVar = 'var(--rca-lt)'; }
                  else if (nodeLower.includes('decision')) { agentColorVar = 'var(--decision)'; agentBgVar = 'var(--decision-lt)'; }
                  else if (nodeLower.includes('heal') || nodeLower.includes('ticket')) { agentColorVar = 'var(--healing)'; agentBgVar = 'var(--healing-lt)'; }
                  else if (nodeLower.includes('quality')) { agentColorVar = 'var(--quality)'; agentBgVar = 'var(--quality-lt)'; }
                  else if (nodeLower.includes('gov')) { agentColorVar = 'var(--governance)'; agentBgVar = 'var(--governance-lt)'; }

                  const id = log.log_id || `${groupKey}-${i}`;
                  const isExpanded = !!expandedLogs[id];

                  return (
                    <div key={id} className="tl-row" style={{ borderLeft: `2px solid ${agentColorVar}`, marginBottom: '2px' }} onClick={() => toggleLogExpansion(id)}>
                      <span 
                        className={isError ? "err-badge" : "badge"} 
                        style={!isError ? { color: agentColorVar, backgroundColor: agentBgVar, border: `1px solid ${agentColorVar}` } : {}}
                      >
                        {log.agent_node}
                      </span>
                      <span className={`tl-msg ${isExpanded ? 'expanded' : ''}`} title={!isExpanded ? log.message : ''}>
                        {log.message}
                      </span>
                      <span className="tl-time">{time}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            )})
          )}
        </div>
      </main>
    </div>
  )
}

export default PipelineHistory
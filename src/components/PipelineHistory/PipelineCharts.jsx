import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

/* ── colour look-up shared with ThreadGroup ── */
const AGENT_META = {
  rca:         { label: 'RCA Agent',          color: 'var(--rca)',        colorHex: '#f5a524', lt: 'var(--rca-lt)' },
  observer:    { label: 'Observer Agent',      color: 'var(--observer)',   colorHex: '#4f8ef7', lt: 'var(--observer-lt)' },
  decision:    { label: 'Decision Agent',      color: 'var(--decision)',   colorHex: '#a78bfa', lt: 'var(--decision-lt)' },
  selfhealing: { label: 'Self-Healing Agent',  color: 'var(--healing)',    colorHex: '#10d9a0', lt: 'var(--healing-lt)' },
  dataquality: { label: 'Data Quality Agent',  color: 'var(--quality)',    colorHex: '#22d3ee', lt: 'var(--quality-lt)' },
  governance:  { label: 'Governance Agent',    color: 'var(--governance)', colorHex: '#f43f5e', lt: 'var(--governance-lt)' },
}

/* ── helper: compute agent-level aggregates from threads ── */
function computeAgentSummary(threads, agentKey, pipelineData) {
  const entries = Object.entries(threads || {})
  const items = entries
    .map(([tid, t]) => ({
      threadId: tid,
      info: t[agentKey] || null,
      runDate: t.run_date,
      status: t.status,
      logs: (t.agent_logs || []).filter(l => l.agent_node === agentKey),
    }))
    .filter(d => d.info || d.logs.length > 0)

  if (items.length === 0) return null

  /* confidence */
  const confs = items.map(d => d.info?.confidence).filter(c => c != null)
  const avgConf = confs.length ? +(confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(2) : null
  const lowConfCount = confs.filter(c => c < 0.5).length

  /* root cause */
  const rcMap = {}
  items.forEach(d => { const rc = d.info?.root_cause; if (rc) rcMap[rc] = (rcMap[rc] || 0) + 1 })
  const topRC = Object.entries(rcMap).sort((a, b) => b[1] - a[1])[0] || null

  /* healable */
  const allNotHealable = items.every(d => d.info?.auto_healable === false)

  /* LLM */
  const prompts = items.map(d => d.info?.llm_prompt_chars).filter(c => c != null)
  const avgPrompt = prompts.length ? Math.round(prompts.reduce((a, b) => a + b, 0) / prompts.length) : null
  const llmModel = items.find(d => d.info?.llm_model)?.info.llm_model || 'N/A'

  /* escalated */
  const escCount = items.filter(d =>
    ['PendingApproval', 'Escalated', 'escalate'].includes(d.status) ||
    d.info?.action === 'escalate'
  ).length

  /* decision specific */
  const actMap = {}
  items.forEach(d => { const a = d.info?.action; if (a) actMap[a] = (actMap[a] || 0) + 1 })
  const topAct = Object.entries(actMap).sort((a, b) => b[1] - a[1])[0] || null

  const slaBreaches = items.filter(d => d.info?.sla_breached === true).length

  const prioMap = {}
  items.forEach(d => { const p = d.info?.priority; if (p) prioMap[p] = (prioMap[p] || 0) + 1 })
  const topPrio = Object.entries(prioMap).sort((a, b) => b[1] - a[1])[0] || null

  /* general logs stats */
  let totalLogs = 0
  let errLogs = 0
  items.forEach(d => {
    totalLogs += d.logs.length
    errLogs += d.logs.filter(l => l.level === 'error' || l.level === 'critical').length
  })

  /* timelines */
  const confTimeline = items
    .filter(d => d.info?.confidence != null)
    .map(d => ({ date: d.runDate, value: d.info.confidence }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const llmTimeline = items
    .filter(d => d.info?.llm_prompt_chars != null)
    .map(d => ({ date: d.runDate, value: d.info.llm_prompt_chars }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return {
    runsAnalysed: items.length,
    escalatedCount: escCount,
    avgConfidence: avgConf,
    lowConfCount,
    topRootCause: topRC ? topRC[0] : 'N/A',
    isRepeated: topRC ? topRC[1] > 1 : false,
    allNotHealable,
    avgPrompt,
    llmModel,
    topAction: topAct ? topAct[0] : 'N/A',
    topActionCount: topAct ? topAct[1] : 0,
    slaBreaches,
    topPriority: topPrio ? topPrio[0] : 'N/A',
    totalLogs,
    errorLogs: errLogs,
    confTimeline,
    llmTimeline,
  }
}

const PipelineCharts = ({ pipelineData, selectedAgent }) => {

  /* ════════════════════════════════════════════
     AGENT-SPECIFIC summary + charts
     ════════════════════════════════════════════ */
  const agentSummary = useMemo(() => {
    if (!selectedAgent || !pipelineData?.threads) return null
    return computeAgentSummary(pipelineData.threads, selectedAgent, pipelineData)
  }, [selectedAgent, pipelineData?.threads])

  const confChartOpts = useMemo(() => {
    if (!agentSummary?.confTimeline?.length) return null
    const cats = agentSummary.confTimeline.map(d => {
      const dt = new Date(d.date)
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    return {
      chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
      title: { text: null },
      xAxis: { categories: cats },
      yAxis: { title: { text: null }, min: 0, max: 1, tickAmount: 3 },
      legend: { enabled: false },
      accessibility: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { borderWidth: 0, borderRadius: 3, color: '#10d9a0' } },
      series: [{ name: 'Confidence', data: agentSummary.confTimeline.map(d => d.value) }],
    }
  }, [agentSummary?.confTimeline])

  const llmChartOpts = useMemo(() => {
    if (!agentSummary?.llmTimeline?.length) return null
    const cats = agentSummary.llmTimeline.map(d => {
      const dt = new Date(d.date)
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    return {
      chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
      title: { text: null },
      xAxis: { categories: cats },
      yAxis: { title: { text: null }, tickAmount: 4 },
      legend: { enabled: false },
      accessibility: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { borderWidth: 0, borderRadius: 3, color: '#a78bfa' } },
      series: [{ name: 'Prompt chars', data: agentSummary.llmTimeline.map(d => d.value) }],
    }
  }, [agentSummary?.llmTimeline])

  /* ════════════════════════════════════════════
     ALL-AGENTS charts (existing)
     ════════════════════════════════════════════ */
  const agentChartOptions = useMemo(() => {
    let series = []
    if (pipelineData?.agent_step_distribution) {
      const dataPoints = Object.entries(pipelineData.agent_step_distribution).map(([agent, count]) => {
        let color = '#aab8cc'
        const nodeLower = agent.toLowerCase()
        if (nodeLower.includes('observer')) color = 'var(--observer, #4f8ef7)'
        else if (nodeLower.includes('rca')) color = 'var(--rca, #f5a524)'
        else if (nodeLower.includes('decision')) color = 'var(--decision, #a78bfa)'
        else if (nodeLower.includes('ticket') || nodeLower.includes('heal')) color = 'var(--healing, #10d9a0)'
        else if (nodeLower.includes('quality')) color = 'var(--quality, #22d3ee)'
        else if (nodeLower.includes('gov')) color = 'var(--governance, #f43f5e)'
        else if (nodeLower.includes('join')) color = '#D05090'

        let name = agent.charAt(0).toUpperCase() + agent.slice(1)
        if (agent === 'ticket_agent') name = 'Ticket'
        return { name, y: count, color }
      })

      series = [{
        name: 'Events',
        colorByPoint: true,
        data: dataPoints
      }]
    }

    return {
      chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
      title: { text: null },
      xAxis: { type: 'category' },
      yAxis: { title: { text: null }, tickAmount: 4 },
      legend: { enabled: false },
      accessibility: { enabled: false },
      credits: { enabled: false },
      series
    }
  }, [pipelineData?.agent_step_distribution])

  const timelineChartOptions = useMemo(() => {
    let categories = []
    let series = []
    if (pipelineData?.outcome_timeline && pipelineData.outcome_timeline.length > 0) {
      const uniqueDates = [...new Set(pipelineData.outcome_timeline.map(item => item.run_date))].sort()

      categories = uniqueDates.map(d => {
        const date = new Date(d)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

      series = [
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
      ]
    }

    return {
      chart: { type: 'column', backgroundColor: 'transparent', height: 200 },
      title: { text: null },
      xAxis: { categories },
      yAxis: { title: { text: null }, tickAmount: 4 },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderWidth: 0,
          borderRadius: 2
        }
      },
      legend: { enabled: false },
      accessibility: { enabled: false },
      credits: { enabled: false },
      series
    }
  }, [pipelineData?.outcome_timeline])

  /* ═══════════════  RENDER  ═══════════════ */

  /* ── Agent-specific view ── */
  if (selectedAgent) {
    if (!agentSummary) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7a8ea8', fontSize: '13px', fontWeight: '600' }}>
          Loading agent data…
        </div>
      )
    }
    const meta = AGENT_META[selectedAgent] || { label: selectedAgent, color: '#7a8ea8', colorHex: '#7a8ea8', lt: '#eef2fa' }
    const dateRange = pipelineData?.date_range
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

    /* sub-text helpers */
    const escLabel = agentSummary.escalatedCount === agentSummary.runsAnalysed
      ? 'All escalated'
      : agentSummary.escalatedCount === 0
        ? 'None escalated'
        : `${agentSummary.escalatedCount} escalated`

    const confSub = agentSummary.avgConfidence != null
      ? `${agentSummary.avgConfidence < 0.5 ? 'Low' : 'Good'} · ${agentSummary.lowConfCount} at 0.0`
      : ''

    const rcSub = `${agentSummary.isRepeated ? 'Repeated' : 'Unique'}${agentSummary.allNotHealable ? ' · not healable' : ''}`

    const llmSub = agentSummary.avgPrompt != null
      ? `chars · ${agentSummary.llmModel?.replace('azure:', '') || 'N/A'}`
      : ''

    return (
      <>
        {/* ── Agent Banner ── */}
        <div className="agent-banner">
          <span className="agent-pill" style={{ color: meta.color, background: meta.lt, borderColor: meta.color }}>
            <span className="agent-pill-dot" style={{ background: meta.color }} />
            {meta.label}
          </span>
          <span className="agent-pipeline-name">/{pipelineData?.pipeline_name}</span>
          <span className="agent-date-range">
            {dateRange ? `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}` : ''}
          </span>
        </div>

        {/* ── Agent Summary Cards ── */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">{selectedAgent === 'observer' ? 'Threads Analysed' : 'Runs Analysed'}</div>
            <div className="summary-value">{agentSummary.runsAnalysed}</div>
            <div className="summary-sub sub-amber">{escLabel}</div>
          </div>

          {selectedAgent === 'rca' && (
            <>
              <div className="summary-card">
                <div className="summary-label">Avg Confidence</div>
                <div className="summary-value">{agentSummary.avgConfidence ?? 'N/A'}</div>
                <div className="summary-sub sub-amber">{confSub}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Root Cause</div>
                <div className="summary-value summary-value-sm">{agentSummary.topRootCause}</div>
                <div className="summary-sub sub-amber">{rcSub}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Avg LLM Prompt</div>
                <div className="summary-value">{agentSummary.avgPrompt ?? 'N/A'}</div>
                <div className="summary-sub sub-gray">{llmSub}</div>
              </div>
            </>
          )}

          {selectedAgent === 'decision' && (
            <>
              <div className="summary-card">
                <div className="summary-label">Top Action</div>
                <div className="summary-value summary-value-sm" style={{textTransform: 'capitalize'}}>{agentSummary.topAction}</div>
                <div className="summary-sub sub-amber">{agentSummary.topActionCount} occurrences</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">SLA Breaches</div>
                <div className="summary-value">{agentSummary.slaBreaches}</div>
                <div className="summary-sub sub-amber">Out of {agentSummary.runsAnalysed} runs</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Avg LLM Prompt</div>
                <div className="summary-value">{agentSummary.avgPrompt ?? 'N/A'}</div>
                <div className="summary-sub sub-gray">{llmSub}</div>
              </div>
            </>
          )}

          {selectedAgent !== 'rca' && selectedAgent !== 'decision' && (
            <>
              <div className="summary-card">
                <div className="summary-label">Events Logged</div>
                <div className="summary-value">{agentSummary.totalLogs}</div>
                <div className="summary-sub sub-amber">{agentSummary.errorLogs} errors</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Avg LLM Prompt</div>
                <div className="summary-value">{agentSummary.avgPrompt ?? 'N/A'}</div>
                <div className="summary-sub sub-gray">{llmSub || 'Not applicable'}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Status</div>
                <div className="summary-value summary-value-sm">Active</div>
                <div className="summary-sub sub-green">Monitoring logs</div>
              </div>
            </>
          )}
        </div>

        {/* ── Agent Charts ── */}
        {(confChartOpts || llmChartOpts) && (
          <div className="charts-grid">
            {confChartOpts && (
              <div className="chart-card">
                <div className="chart-label">Confidence across runs</div>
                <HighchartsReact highcharts={Highcharts} options={confChartOpts} />
              </div>
            )}
            {llmChartOpts && (
              <div className="chart-card">
                <div className="chart-label">LLM invocation cost (prompt chars)</div>
                <HighchartsReact highcharts={Highcharts} options={llmChartOpts} />
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  /* ── All-agents view (existing, unchanged) ── */
  const hasSummary = pipelineData?.summary && Object.keys(pipelineData.summary).length > 0
  const hasCharts = (pipelineData?.agent_step_distribution && Object.keys(pipelineData.agent_step_distribution).length > 0) ||
    (pipelineData?.outcome_timeline && pipelineData.outcome_timeline.length > 0)

  return (
    <>
      {hasSummary && (
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
            <div className="summary-value">{(pipelineData.summary.auto_heal_rate * 100).toFixed(2)}%</div>
            <div className="summary-sub sub-green">{pipelineData.summary.auto_healed_count} of {pipelineData.summary.total_runs} runs</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">RCA Confidence</div>
            <div className="summary-value">{pipelineData.summary.avg_rca_confidence ?? 'N/A'}</div>
            <div className="summary-sub sub-amber">{pipelineData.summary.low_confidence_count} low-conf incidents</div>
          </div>
        </div>
      )}

      {hasCharts && (
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
    </>
  )
}

export default React.memo(PipelineCharts)

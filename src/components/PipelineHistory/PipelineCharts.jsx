import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const PipelineCharts = ({ pipelineData }) => {
  // ── Agent Distribution Chart ──
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
      credits: { enabled: false },
      series
    }
  }, [pipelineData?.agent_step_distribution])

  // ── Outcome Timeline Chart ──
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
      credits: { enabled: false },
      series
    }
  }, [pipelineData?.outcome_timeline])

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
            <div className="summary-value">{pipelineData.summary.auto_heal_rate * 100}%</div>
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

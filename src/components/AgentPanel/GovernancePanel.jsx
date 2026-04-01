import useAgentStore from "../../stores/useAgentStore";
import './AgentPanel.css';
import React, { useMemo } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const sampleData = {
  agentPerformances: [
    { name: "Observer", icon: "👁️", totalCount: 0, failedCount: 0 },
    { name: "RCA", icon: "🔍", totalCount: 0, failedCount: 0 },
    { name: "Decision", icon: "🧠", totalCount: 0, failedCount: 0 },
    { name: "Self-Healing", icon: "🔧", totalCount: 0, failedCount: 0 },
  ],
  failurePatterns: [
    { patternName: "SCHEMA_CHANGE",    category: "Data",       hits: 160, percentOfFailures: 66.9 },
    { patternName: "FILE_AVAILABILITY", category: "Dependency", hits: 79,  percentOfFailures: 33.1 },
  ],
  rcaConfidences: [
    { confidenceRange: "<50%",   rca_Count: 25 },
    { confidenceRange: "50-60%", rca_Count: 0 },
    { confidenceRange: "60-70%", rca_Count: 0 },
    { confidenceRange: "70-80%", rca_Count: 25 },
    { confidenceRange: "80-90%", rca_Count: 25 },
    { confidenceRange: ">90%",   rca_Count: 25 },
  ],
};

const AgentTrack = ({track}) => {
    const successPct = track.totalCount === 0
          ? 0
          : Math.round(((track.totalCount - track.failedCount) / track.totalCount) * 100);
    return (
        <div className="agent-row">
            <div className="agent-avatar" style={{background: '#e8f0fe'}}>{track.icon}</div>
            <div className="agent-name">{track.name}</div>
            <div className="agent-track">
            <div className="agent-fill" style={{width: `${successPct}%`, background: 'linear-gradient(90deg,#1d6ef5,#0aa8a0)'}}></div>
            </div>
            <div className="agent-pct" style={{color: '#1d6ef5'}}>{successPct}%</div>
            <div className="agent-acts">{track.totalCount} acts</div>
        </div>
    )
} 

const AgentFailurePatterns = ({pattern}) => {
    return (
        <div className="pattern-row">
            <div>
            <div className="pattern-name">{pattern.patternName}</div>
            <div className="pattern-cat">{pattern.category}</div>
            </div>

            <div className="pattern-bar-track">
            <div className="pattern-bar-fill" style={{width: `${pattern.percentOfFailures}%`}}></div>
            </div>

            <div className="pattern-hits">{pattern.hits}</div>

            <div className="pattern-conf" style={{color: 'var(--green)'}}>
            {pattern.percentOfFailures}%
            </div>
        </div>
    )
}

export default function GovernancePanel() {
    const selectedAgent = useAgentStore((s) => s.selectedAgent);
    const selectAgent = useAgentStore((s) => s.selectAgent);

    const confidenceChartOptions = useMemo(() => ({
      chart: {
        type: 'column',
        height: 160,
        backgroundColor: 'transparent'
      },
      title: { text: undefined },
      xAxis: {
        categories: sampleData.rcaConfidences.map((x) => x.confidenceRange),
        gridLineWidth: 0,
        lineWidth: 0
      },
      yAxis: {
        title: { text: undefined },
        min: 0,
        max: 300,
        gridLineColor: '#f0f4f8',
        tickInterval: 50
      },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#dde3ec',
        borderWidth: 1,
        style: { color: '#0f2040' },
        padding: 10,
        useHTML: true,
        formatter: function () {
          return `<span style="color:#0f2040;font-weight:600">${this.x}</span><br/><span style="color:#7a8ea8">RCA Analyses: ${this.y}</span>`;
        }
      },
      plotOptions: {
        bar: {
          borderWidth: 1.5,
          borderRadius: 4,
          pointPadding: 0.1,
          groupPadding: 0.1,
          colorByPoint: true,
          colors: [
            'rgba(224,45,70,0.7)',
            'rgba(224,98,10,0.6)',
            'rgba(201,141,0,0.6)',
            'rgba(29,110,245,0.5)',
            'rgba(10,168,160,0.6)',
            'rgba(13,140,92,0.7)'
          ]
        }
      },
      series: [{
        name: 'RCA Analyses',
        data: sampleData.rcaConfidences.map((x) => x.rca_Count),
        borderColor: ['#e02d46', '#e0620a', '#c98d00', '#1d6ef5', '#0aa8a0', '#0d8c5c']
      }],
      credits: { enabled: false }
    }), []);

    let total = 0;
    let high = 0;
    let low = 0;
    sampleData.rcaConfidences.forEach((x) => {
      total += x.rca_Count;
      if(x.confidenceRange.includes("90")) {
        high += x.rca_Count;
      }
      if(x.confidenceRange === "<50%") {
        low += x.rca_Count;
      }
    });
    console.log(total, high, low)
    const highConfidencePct = total === 0 ? 0 : Math.round((high / total) * 100);

    const lowConfidencePct = total === 0 ? 0 : Math.round((low / total) * 100);

    return (
        <div className={`agent-panel card-governance${selectedAgent === 'governance' ? ' visible' : ''}`} style={{ display: selectedAgent === 'governance' ? 'block' : 'none' }}>
      <div className="panel-header">
        <span style={{ fontSize: 22 }}>🛡️</span>
        <div className="panel-title">Governance Agent</div>
        <span className="panel-badge">ALERT</span>
        <div className="panel-close" onClick={() => selectAgent(null)}>✕</div>
      </div>
      <div className="panel-grid">
        <div className="panel-col-governance">
          <div className="col-header card-header">
            <h3>Agent Performance</h3>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Today · success rate</span>
          </div>
          <div className="card-body" id="pnlGovernanceAgentMetrics">
            {sampleData.agentPerformances.map((x) => <AgentTrack key={x.name} track={x} />)}
          </div>
        </div>
        <div className="panel-col-governance">
          <div className="col-header card-header">
            <h3>Top Matched Failure Patterns</h3>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Last 30 days · hits</span>
          </div>
          <div className="card-body" id="pnlGovernanceFailurePatterns">
            {sampleData.failurePatterns.map((x) => <AgentFailurePatterns key={x.patternName} pattern={x} />)}
          </div>
        </div>
        <div className="panel-col-governance">
          <div className="col-header card-header">
            <h3>RCA Confidence Distribution</h3>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Last 30 days</span>
          </div>
          <div className="card-body">
            <HighchartsReact highcharts={Highcharts} options={confidenceChartOptions} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div
                style={{ padding: '10px 12px', background: 'var(--green-lt)', border: '1px solid rgba(13,140,92,0.2)', borderRadius: '7px' }}>
                <div
                  style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                  High Confidence</div>
                <div id="lblHighConfidence" style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{highConfidencePct}%</div>
                <div style={{ fontSize: 10, color: 'var(--green)' }}>≥ 80% confidence</div>
              </div>
              <div
                style={{ padding: '10px 12px', background: 'var(--red-lt)', border: '1px solid rgba(224,45,70,0.2)', borderRadius: '7px' }}>
                <div
                  style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Low Confidence</div>
                <div id="lblLowConfidence" style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)' }}>{lowConfidencePct}%</div>
                <div style={{ fontSize: 10, color: 'var(--red)' }}>&lt; 50% → escalated</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    );
}
import React from "react";
import "./InsightsDashboard.css";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
// import { confidenceOptions, failurePatternsOptions, agentPerformanceOptions } from './chartOptions';
import "highcharts/highcharts-more"
import useAgentStore from "../../stores/useAgentStore";

const mockAgents = [
  { Agent: "Observer", TotalCount: 120, FailedCount: 8 },
  { Agent: "RCA", TotalCount: 95, FailedCount: 15 },
  { Agent: "Decision", TotalCount: 80, FailedCount: 20 },
  { Agent: "Self-Healing", TotalCount: 60, FailedCount: 12 },
];

const agentColors = {
  "Observer": "#0284c7",
  "RCA": "#b45309",
  "Decision": "#6d28d9",
  "Self-Healing": "#047857",
  "Data Quality": "#0776a4"
};

export default function InsightsDashboard() {

  const rcaDistribution = useAgentStore(s => s.governanceDashData?.rcaDistribution);
  const agentPerformance = useAgentStore(s => s.governanceDashData?.agentPerformance);
  const failurePatterns = useAgentStore(s => s.governanceDashData?.failurePatterns);

  let confidenceOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 120
    },
    title: { text: undefined },
    xAxis: {
      categories: rcaDistribution?.chartData?.map(item => item.confidenceRange),
      labels: {
        style: { fontSize: '10px', color: '#7a8ea8' }
      },
      lineColor: '#e2e8f0',
      tickLength: 0,
      min: 0,
      // gridLineColor: '#e2e8f0'
    },
    yAxis: {
      title: { text: null },
      min: 0,
      tickInterval: 2,
      // gridLineColor: '#e2e8f0',
      lineColor: '#e2e8f0',
      lineWidth: 1,
      labels: {
        style: { fontSize: '10px', color: '#7a8ea8' }
      }
    },
    plotOptions: {
      column: {
        borderRadius: 3,
        borderWidth: 2,
        color: 'rgba(125, 211, 252, 0.7)',
        borderColor: '#7dd3fc',
        pointPadding: 0.15,
        groupPadding: 0.1
      }
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [{
      name: 'Confidence',
      data: rcaDistribution?.chartData?.map(item => item.rca_Count)
    }],
    tooltip: {
      pointFormat: '<b>{point.y}</b> tickets'
    }
  };

  let failurePatternsOptions = {
    chart: {
      type: 'bar',
      backgroundColor: 'transparent',
      height: 200
    },
    title: { text: undefined },
    xAxis: {
      categories: failurePatterns?.map(item => item.patternName),
      title: { text: null },
      labels: {
        style: {
          fontSize: '11px',
          color: '#3d5278'
        }
      },
      lineColor: '#e2e8f0'
    },
    yAxis: {
      title: { text: null },
      min: 0,
      allowDecimals: false,
      lineColor: '#e2e8f0',
      lineWidth: 1,
      // gridLineColor: '#e2e8f0',
      labels: {
        style: { fontSize: '10px', color: '#7a8ea8' }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#8b5cf6',
        color: 'rgba(139, 92, 246, 0.15)',
        pointPadding: 0.15,
        groupPadding: 0.1,
        dataLabels: {
          enabled: false
        }
      }
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [{
      name: 'Patterns',
      data: failurePatterns?.map(item => item.hits)
    }],
    tooltip: {
      pointFormat: '<b>{point.y}</b> occurrences'
    }
  };


  let agentPerformanceOptions = {
    chart: {
      polar: true,
      backgroundColor: 'transparent',
      height: 200,
      width: 200,
    },
    title: { text: undefined },
    accessibility: { enabled: false },
    credits: { enabled: false },
    pane: {
      size: '60%',
      startAngle: -36,
      endAngle: 324
    },
    xAxis: {
      categories: ['Accuracy', 'Speed', 'Coverage', 'Recovery', 'Uptime'],
      tickmarkPlacement: 'on',
      lineWidth: 0,
      labels: {
        distance: 5,
        style: {
          fontSize: '9px',
          color: '#7a8ea8',
          fontWeight: '500'
        }
      }
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      min: 0,
      max: 100,
      tickInterval: 10,
      labels: {
        format: '{value}%',
        style: { fontSize: '8px', color: '#7a8ea8' }
      },
      gridLineColor: '#e8edf5',
      gridLineWidth: 1
    },
    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>'
    },
    legend: { enabled: false },
    plotOptions: {
      line: {
        lineWidth: 1.5,
        marker: {
          radius: 3,
          symbol: 'circle'
        },
        dataLabels: { enabled: false }
      }
    },
    series: agentPerformance?.map(item => ({
      type: 'line',
        name: item.agentName,
      data: ['Accuracy', 'Speed', 'Coverage', 'Recovery', 'Uptime'].map(key => item.radarMetrics?.[key.toLowerCase()] || 0),
      color: agentColors[item.agentName],
      fillOpacity: 0.07,
      marker: { fillColor: agentColors[item.agentName] }
    }))
  };

  return (
    <div className="row-3">
      <div className="panel">
        <div className="ph">
          <div className="ph-title">
            <div className="ph-bar amber"></div>RCA Confidence Distribution
          </div>
          <div className="ph-tag">analysis</div>
        </div>
        <div className="pb">
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>

            <div className="cs" style={{ flex: 1 }}>
              <div id="highVal" className="cs-val" style={{ color: "var(--green)", fontSize: "18px" }}>{rcaDistribution?.summary?.high?.count} ({rcaDistribution?.summary?.high?.percent}%)</div>
              <div className="cs-lbl">High ≥80%</div>
            </div>

            <div className="cs" style={{ flex: 1 }}>
              <div id="mediumVal" className="cs-val" style={{ color: "var(--amber)", fontSize: "18px" }}>{rcaDistribution?.summary?.medium?.count} ({rcaDistribution?.summary?.medium?.percent}%)</div>
              <div className="cs-lbl">Medium 60–80%</div>
            </div>

            <div className="cs" style={{ flex: 1 }}>
              <div id="lowVal" className="cs-val" style={{ color: "var(--red)", fontSize: "18px" }}>{rcaDistribution?.summary?.low?.count} ({rcaDistribution?.summary?.low?.percent}%)</div>
              <div className="cs-lbl">Low &lt;60%</div>
            </div>

          </div>
          <HighchartsReact highcharts={Highcharts} options={confidenceOptions} />
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <div className="ph-title">
            <div className="ph-bar purple"></div>Top Matched Failure Patterns
          </div>
          <div className="ph-tag">{failurePatterns?.length} patterns</div>
        </div>
        <div className="pb">
          <div id="patternLegend" className="pat-legend" style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
            {/* failurePatterns?.map(pattern => (
              <span style={{
                fontSize: "9px", padding: "3px 8px", borderRadius: "4px",
                border: "1px solid #8b5cf6", color: "#6d28d9",
                background: "rgba(139,92,246,0.08)", fontWeight: 600, letterSpacing: "0.03em"
              }}>{pattern.patternName} ({pattern.hits})</span>
            )) */}
          </div>
          <HighchartsReact highcharts={Highcharts} options={failurePatternsOptions} />
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <div className="ph-title">
            <div className="ph-bar cyan"></div>Agent Performance
          </div>
          <div className="ph-tag">5 agents</div>
        </div>
        <div className="pb" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "14px 16px" }}>
          <div id="agentContainer" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* {mockAgents.map(agent => {
              const success = agent.TotalCount - agent.FailedCount;
              const percent = agent.TotalCount
                ? Math.round((success / agent.TotalCount) * 100)
                : 0; */}
            {agentPerformance?.map(agent => {
              const color = agentColors[agent.agentName] || "#1d6ef5";
              return (
                <div key={agent.agentName} className="ins-agent-card">
                  <div className="ins-agent-accent" style={{
                    background: `linear-gradient(180deg, ${color}, ${color})`,
                  }} />
                  <div className="ins-agent-header">
                    <span className="ins-agent-name">
                      {agent.agentName}
                    </span>
                    <span className="ins-agent-pct" style={{ color }}>
                      {agent.overallPercent}%
                    </span>
                  </div>
                  <div className="ins-agent-track">
                    <div className="ins-agent-fill" style={{
                      width: `${agent.overallPercent}%`,
                      background: `linear-gradient(90deg, ${color}, ${color})`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: "200px", height: "200px" }}>
            <HighchartsReact highcharts={Highcharts} options={agentPerformanceOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
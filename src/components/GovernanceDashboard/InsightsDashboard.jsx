import React from "react";
import "./InsightsDashboard.css";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { confidenceOptions, failurePatternsOptions, agentPerformanceOptions } from './chartOptions';
import "highcharts/highcharts-more"

const mockAgents = [
  { Agent: "Observer",     TotalCount: 120, FailedCount: 8 },
  { Agent: "RCA",          TotalCount: 95,  FailedCount: 15 },
  { Agent: "Decision",     TotalCount: 80,  FailedCount: 20 },
  { Agent: "Self-Healing", TotalCount: 60,  FailedCount: 12 },
];

const agentColors = {
  "Observer":     "#0284c7",
  "RCA":          "#b45309",
  "Decision":     "#6d28d9",
  "Self-Healing": "#047857",
  "Data Quality": "#0776a4"
};

export default function InsightsDashboard() {
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
          <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>

            <div className="cs" style={{flex:1}}>
                <div id="highVal" className="cs-val" style={{color:"var(--green)",fontSize:"18px"}}>7 (100%)</div>
                <div className="cs-lbl">High ≥80%</div>
            </div>

            <div className="cs" style={{flex:1}}>
                <div id="mediumVal" className="cs-val" style={{color:"var(--amber)",fontSize:"18px"}}>0 (0%)</div>
                <div className="cs-lbl">Medium 60–80%</div>
            </div>

            <div className="cs" style={{flex:1}}>
                <div id="lowVal" className="cs-val" style={{color:"var(--red)",fontSize:"18px"}}>0 (0%)</div>
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
          <div className="ph-tag">2 patterns</div>
        </div>
        <div className="pb">
          <div id="patternLegend" className="pat-legend" style={{display:"flex",gap:"8px",marginBottom:"10px",flexWrap:"wrap"}}>
            <span style={{
              fontSize:"9px",padding:"3px 8px",borderRadius:"4px",
              border:"1px solid #8b5cf6",color:"#6d28d9",
              background:"rgba(139,92,246,0.08)",fontWeight:600,letterSpacing:"0.03em"
            }}>FILE AVAILABILITY (5)</span>
            <span style={{
              fontSize:"9px",padding:"3px 8px",borderRadius:"4px",
              border:"1px solid #8b5cf6",color:"#6d28d9",
              background:"rgba(139,92,246,0.08)",fontWeight:600,letterSpacing:"0.03em"
            }}>SCHEMA CHANGE (2)</span>
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
        <div className="pb" style={{display:"flex",gap:"12px",alignItems:"center",padding:"14px 16px"}}>
          <div id="agentContainer" style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:"6px"}}>
            {mockAgents.map(agent => {
              const success = agent.TotalCount - agent.FailedCount;
              const percent = agent.TotalCount
                ? Math.round((success / agent.TotalCount) * 100)
                : 0;
              const color = agentColors[agent.Agent] || "#1d6ef5";
              return (
                <div key={agent.Agent} className="ins-agent-card">
                  <div className="ins-agent-accent" style={{
                    background: `linear-gradient(180deg, ${color}, ${color})`,
                  }} />
                  <div className="ins-agent-header">
                    <span className="ins-agent-name">
                      {agent.Agent}
                    </span>
                    <span className="ins-agent-pct" style={{ color }}>
                      {percent}%
                    </span>
                  </div>
                  <div className="ins-agent-track">
                    <div className="ins-agent-fill" style={{
                      width: `${percent}%`,
                      background: `linear-gradient(90deg, ${color}, ${color})`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{width:"170px",height:"170px"}}>
            <HighchartsReact highcharts={Highcharts} options={agentPerformanceOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
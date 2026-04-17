import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { knowledgeGrowthOptions } from "./chartOptions";
import "./KnowledgeGrowth.css";
import useAgentStore from "../../stores/useAgentStore";

/* const data = [
  { week: "Wk 1", patterns: 170, rules: 172, auto: 48 },
  { week: "Wk 2", patterns: 178, rules: 176, auto: 52 },
  { week: "Wk 3", patterns: 185, rules: 180, auto: 55 },
  { week: "Wk 4", patterns: 190, rules: 188, auto: 56 },
  { week: "Wk 5", patterns: 196, rules: 198, auto: 58 },
  { week: "Wk 6", patterns: 202, rules: 206, auto: 60 },
  { week: "Wk 7", patterns: 208, rules: 214, auto: 61 },
  { week: "Wk 8", patterns: 214, rules: 220, auto: 62 },
]; */

export default function KnowledgeGrowth() {
  const knowledgeGrowthData = useAgentStore(s => s.governanceDashData?.knowledgeGrowth);

  const knowledgeGrowthOptions = {
    chart: {
      type: 'area',
      height: '200px',
    },
    title: {
      text: null,
    },
    credits: { enabled: false },
    xAxis: {
      categories: knowledgeGrowthData?.timelineData?.map(item => item.weekLabel),
      tickStart: 0,
      tickInterval: 1,
    },
    yAxis: [
      {
        title: { text: 'Patterns / Rules' },
        // min: 170,
        // max: 220,
        // tickStart: 170,
        tickInterval: 10,
        gridLineWidth: 1,
        gridLineColor: '#e8edf5',
      },
      {
        title: { text: '% Auto-resolve' },
        opposite: true,
        labels: { format: '{value}%' },
        // min: 45,
        // max: 65,
        tickInterval: 5,
      },
    ],
    legend: {
      align: 'center',
      verticalAlign: 'top',
      layout: 'horizontal',
      y: -15,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.01,
        marker: { radius: 4 },
      },
    },
    series: [
      {
        name: 'Failure Patterns',
        data: knowledgeGrowthData?.timelineData?.map(item => item.failurePatterns),
        color: '#8B5CF6',
        fillColor: 'rgba(139, 92, 246, 0.1)',
        pointPlacement: 'on'
      },
      {
        name: 'Diagnostic Rules',
        data: knowledgeGrowthData?.timelineData?.map(item => item.diagnosticRules),
        color: '#3B82F6',
        fillColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        name: 'Auto-resolve %',
        type: 'line',           // plain line, no area fill
        dashStyle: 'Dash',      // dashed line
        data: knowledgeGrowthData?.timelineData?.map(item => item.autoResolvedPercent),
        color: '#F97316',
        yAxis: 1,               // maps to the right-side axis
        marker: { radius: 3 },  
      },
    ],
  };

  return (
    <div className="kg">
      <div className="kg-header">
        <div className="kg-title">
          <span className="bar"></span>
          <h3>KNOWLEDGE GROWTH & LEARNING</h3>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--purple)' }}></span> Failure Patterns <span style={{ color: 'var(--purple)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.failurePatterns, 0)}</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--cyan)' }}></span> Diagnostic Rules <span style={{ color: 'var(--cyan)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.diagnosticRules, 0)}</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--amber)' }}></span> Auto-resolved <span style={{ color: 'var(--amber)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.autoResolvedPercent, 0)/8}%</span>
          </div>
          <button className="trend-btn">8-week trend</button>
        </div>
      </div>
      <div className="kg-container">

        {/* LEFT */}
        <div className="kg-left">
          <HighchartsReact highcharts={Highcharts} options={knowledgeGrowthOptions} />
        </div>

        {/* RIGHT PANEL */}
        <div className="kg-right">
          <div className="kg-milestone-card">
            <div className="kg-milestone-header">
              <div className="kg-milestone-bar"></div>
              <span className="kg-milestone-title">L3 Milestone Progress</span>
            </div>
            <div className="kg-milestone-body">

              <div className="kg-milestone-item">
                <div className="kg-milestone-row">
                  <span className="kg-milestone-label">Pattern repo ≥ {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
                  <span className="kg-milestone-value kg-color-purple">{knowledgeGrowthData?.milestoneProgress?.patternRepo.current} / {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-purple" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.patternRepo.current / knowledgeGrowthData?.milestoneProgress?.patternRepo.target) * 100}%` }}></div>
                </div>
              </div>

              <div className="kg-milestone-item">
                <div className="kg-milestone-row">
                  <span className="kg-milestone-label">Auto-resolve ≥ {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}%</span>
                  <span className="kg-milestone-value kg-color-amber">{knowledgeGrowthData?.milestoneProgress?.autoResolve.current}% / {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}%</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-amber" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.autoResolve.current / knowledgeGrowthData?.milestoneProgress?.autoResolve.target) * 100}%` }}></div>
                </div>
              </div>

              <div className="kg-milestone-item">
                <div className="kg-milestone-row">
                  <span className="kg-milestone-label">Avg confidence ≥ {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
                  <span className="kg-milestone-value kg-color-amber">{knowledgeGrowthData?.milestoneProgress?.avgConfidence.current}% / {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-amber" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.avgConfidence.current / knowledgeGrowthData?.milestoneProgress?.avgConfidence.target) * 100}%` }}></div>
                </div>
              </div>

              <div className="kg-milestone-footer">
                <span className="kg-feedback-label">Feedback loop</span>
                <span className="kg-active-badge">
                  <span className="kg-active-dot"></span>{knowledgeGrowthData?.milestoneProgress?.feedbackLoop}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
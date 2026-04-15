import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { knowledgeGrowthOptions } from "./chartOptions";
import "./KnowledgeGrowth.css";

const data = [
  { week: "Wk 1", patterns: 170, rules: 172, auto: 48 },
  { week: "Wk 2", patterns: 178, rules: 176, auto: 52 },
  { week: "Wk 3", patterns: 185, rules: 180, auto: 55 },
  { week: "Wk 4", patterns: 190, rules: 188, auto: 56 },
  { week: "Wk 5", patterns: 196, rules: 198, auto: 58 },
  { week: "Wk 6", patterns: 202, rules: 206, auto: 60 },
  { week: "Wk 7", patterns: 208, rules: 214, auto: 61 },
  { week: "Wk 8", patterns: 214, rules: 220, auto: 62 },
];

function KnowledgeChart() {
  return <HighchartsReact highcharts={Highcharts} options={knowledgeGrowthOptions} />
}

export default function KnowledgeGrowth() {
  return (
    <div className="kg">
      <div className="kg-header">
        <div className="kg-title">
          <span className="bar"></span>
          <h3>KNOWLEDGE GROWTH & LEARNING</h3>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--purple)' }}></span> Failure Patterns <span style={{ color: 'var(--purple)' }}>214</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--cyan)' }}></span> Diagnostic Rules <span style={{ color: 'var(--cyan)' }}>38</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ background: 'var(--amber)' }}></span> Auto-resolved <span style={{ color: 'var(--amber)' }}>61%</span>
          </div>
          <button className="trend-btn">8-week trend</button>
        </div>
      </div>
      <div className="kg-container">

        {/* LEFT */}
        <div className="kg-left">
          <KnowledgeChart />
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
                  <span className="kg-milestone-label">Pattern repo ≥ 250</span>
                  <span className="kg-milestone-value kg-color-purple">214 / 250</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-purple" style={{ width: '85.6%' }}></div>
                </div>
              </div>

              <div className="kg-milestone-item">
                <div className="kg-milestone-row">
                  <span className="kg-milestone-label">Auto-resolve ≥ 70%</span>
                  <span className="kg-milestone-value kg-color-amber">61% / 70%</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-amber" style={{ width: '87.1%' }}></div>
                </div>
              </div>

              <div className="kg-milestone-item">
                <div className="kg-milestone-row">
                  <span className="kg-milestone-label">Avg confidence ≥ 88%</span>
                  <span className="kg-milestone-value kg-color-amber">84% / 88%</span>
                </div>
                <div className="kg-progress-track">
                  <div className="kg-progress-fill kg-fill-amber" style={{ width: '95.5%' }}></div>
                </div>
              </div>

              <div className="kg-milestone-footer">
                <span className="kg-feedback-label">Feedback loop</span>
                <span className="kg-active-badge">
                  <span className="kg-active-dot"></span>ACTIVE ✓
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
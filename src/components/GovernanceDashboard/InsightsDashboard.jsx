import React from "react";
import "./InsightsDashboard.css";

export default function InsightsDashboard() {
  return (
    <div className="insights-container">

      {/* CARD 1 */}
      <div className="card">
        <div className="card-header">
          <span className="dot orange"></span>
          <h3>RCA CONFIDENCE DISTRIBUTION</h3>
          <button className="tag">analysis</button>
        </div>

        <div className="rca-boxes">
          <div className="box green">
            <h2>7 (100%)</h2>
            <p>High ≥80%</p>
          </div>
          <div className="box orange">
            <h2>0 (0%)</h2>
            <p>Medium 60–80%</p>
          </div>
          <div className="box red">
            <h2>0 (0%)</h2>
            <p>Low &lt;60%</p>
          </div>
        </div>

        <div className="chart-placeholder">
          {/* simple bar */}
          <div className="bar"></div>
        </div>
      </div>

      {/* CARD 2 */}
      <div className="card">
        <div className="card-header">
          <span className="dot purple"></span>
          <h3>TOP MATCHED FAILURE PATTERNS</h3>
          <button className="tag">2 patterns</button>
        </div>

        <div className="pattern-tags">
          <span>FILE AVAILABILITY (5)</span>
          <span>SCHEMA CHANGE (2)</span>
        </div>

        <div className="pattern-bars">
          <div className="row">
            <label>FILE AVAILABILITY</label>
            <div className="progress"><span style={{ width: "90%" }}></span></div>
          </div>

          <div className="row">
            <label>SCHEMA CHANGE</label>
            <div className="progress"><span style={{ width: "40%" }}></span></div>
          </div>
        </div>
      </div>

      {/* CARD 3 */}
      <div className="card">
        <div className="card-header">
          <span className="dot blue"></span>
          <h3>AGENT PERFORMANCE</h3>
          <button className="tag">4 agents</button>
        </div>

        <div className="agent-list">
          <div className="agent">
            <span>Observer</span>
            <b>100%</b>
          </div>
          <div className="agent">
            <span>RCA</span>
            <b>0%</b>
          </div>
          <div className="agent">
            <span>Decision</span>
            <b>100%</b>
          </div>
          <div className="agent">
            <span>Self-Healing</span>
            <b>0%</b>
          </div>
        </div>

        <div className="radar-placeholder">
          Radar Chart
        </div>
      </div>

    </div>
  );
}
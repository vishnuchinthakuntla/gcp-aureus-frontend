import React from "react";
import "./GovernanceDashboard.css";

export default function ComplianceCard() {
  return (
    <div className="compliance-card">

      {/* Header */}
      <div className="comp-header">
        <span>COMPLIANCE SCORE</span>
        <span className="live">● LIVE</span>
      </div>

      {/* Main Score */}
      <div className="score-section">
        <div className="score-title">GOVERNANCE INDEX</div>
        <div className="score">92<span>/100</span></div>

        <div className="trend">▲ +1.4% <span>vs last wk</span></div>

        <div className="progress-label">
          PROGRESS <span>92%</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">

        <div className="stat st-green">
          <div className="value">91.4%</div>
          <div className="label">SLA Compliance</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-red">
          <div className="value">3 <span>of 35</span></div>
          <div className="label">SLA Breaches</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-orange">
          <div className="value">2 <span>flagged</span></div>
          <div className="label">Policy Violations</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-blue">
          <div className="value">35</div>
          <div className="label">Total Tickets</div>
          <div className="mini-bar"></div>
        </div>

      </div>
    </div>
  );
}
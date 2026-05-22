import React from "react";
import "./GovernanceDashboard.css";
import useAgentStore from "../../stores/useAgentStore";

export default function ComplianceCard() {

  const complianceMetrics = useAgentStore((s) => s.governanceDashData?.complianceMetrics);

  return (
    <div className="compliance-card">

      {/* Header */}
      <div className="ph">
        <div className="ph-title">
          <div className="ph-bar green"></div>
          COMPLIANCE SCORE
        </div>
        <span className="live">● LIVE</span>
      </div>

      {/* Main Score */}
      {/* <div className="score-section">
        <div className="score-title">GOVERNANCE INDEX</div>
        <div className="score">{complianceMetrics?.governanceIndex?.score}<span>/100</span></div>

        <div className="trend">▲ {complianceMetrics?.governanceIndex?.trendPercent} <span>vs last wk</span></div>

        <div className="progress-label">
          PROGRESS <span>{complianceMetrics?.governanceIndex?.score}%</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div> */}

      {/* Hero Section */}
      <div className="comp-hero">
        <div className="comp-hero-chart">
          <canvas id="complianceDonut" width="110" height="110"></canvas>
        </div>
        <div className="comp-hero-content">
          <div className="comp-hero-title">
            Governance Index
          </div>
          <div className="comp-hero-value-wrapper">
            <span className="comp-hero-value">
              <span id="vwGovernanceIndex">{complianceMetrics?.governanceIndex?.score || 0}</span>
            </span>
            <span className="comp-hero-total">/100</span>
          </div>
          <div className="comp-hero-trend-wrapper">
            <span className="comp-hero-trend-badge">{complianceMetrics?.governanceIndex?.trendDirection === "up" ? "▲" : "▼"} {complianceMetrics?.governanceIndex?.trendPercent || 0}%</span>
            <span className="comp-hero-trend-label">vs last wk</span>
          </div>
          <div className="comp-hero-progress-wrapper">
            <div className="comp-hero-progress-info">
              <span className="comp-hero-progress-label">Progress</span>
              <span className="comp-hero-progress-val">
                <span id="vwGovernanceIndexPer">{complianceMetrics?.governanceIndex?.trendPercent || 0}%</span>
              </span>
            </div>
            <div className="comp-hero-progress-track">
              <div
                id="vwGovernanceIndexProgress"
                className="comp-hero-progress-fill"
                style={{ width: `${complianceMetrics?.governanceIndex?.trendPercent || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">

        <div className="stat st-green">
          <div className="stat-st"></div>
          <div className="value">{complianceMetrics?.slaCompliancePercent}%</div>
          <div className="label">SLA Compliance</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-red">
          <div className="stat-st"></div>
          <div className="value">{complianceMetrics?.slaBreaches?.current} <span>of {complianceMetrics?.slaBreaches?.totalLimit}</span></div>
          <div className="label">SLA Breaches</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-orange">
          <div className="stat-st"></div>
          <div className="value">{complianceMetrics?.policyViolationsFlagged} <span>flagged</span></div>
          <div className="label">Policy Violations</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-blue">
          <div className="stat-st"></div>
          <div className="value">{complianceMetrics?.totalTickets}</div>
          <div className="label">Total Tickets</div>
          <div className="mini-bar"></div>
        </div>

      </div>
    </div >
  );
}
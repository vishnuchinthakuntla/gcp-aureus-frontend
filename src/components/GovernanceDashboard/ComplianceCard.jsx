import React from "react";
import "./GovernanceDashboard.css";
import useAgentStore from "../../stores/useAgentStore";

export default function ComplianceCard() {

  const complianceMetrics = useAgentStore((s) => s.governanceDashData?.complianceMetrics);

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
        <div className="score">{complianceMetrics?.governanceIndex?.score}<span>/100</span></div>

        <div className="trend">▲ {complianceMetrics?.governanceIndex?.trendPercent} <span>vs last wk</span></div>

        <div className="progress-label">
          PROGRESS <span>{complianceMetrics?.governanceIndex?.score}%</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">

        <div className="stat st-green">
          <div className="value">{complianceMetrics?.slaCompliancePercent}%</div>
          <div className="label">SLA Compliance</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-red">
          <div className="value">{complianceMetrics?.slaBreaches?.current} <span>of {complianceMetrics?.slaBreaches?.totalLimit}</span></div>
          <div className="label">SLA Breaches</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-orange">
          <div className="value">{complianceMetrics?.policyViolationsFlagged} <span>flagged</span></div>
          <div className="label">Policy Violations</div>
          <div className="mini-bar"></div>
        </div>

        <div className="stat st-blue">
          <div className="value">{complianceMetrics?.totalTickets}</div>
          <div className="label">Total Tickets</div>
          <div className="mini-bar"></div>
        </div>

      </div>
    </div>
  );
}
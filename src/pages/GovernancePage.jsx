import React, { useEffect } from "react";
import GovernanceDashboard from "../components/GovernanceDashboard/GovernanceDashboard";
import ComplianceCard from "../components/GovernanceDashboard/ComplianceCard";
import InsightsDashboard from "../components/GovernanceDashboard/InsightsDashboard";

import KnowledgeGrowth from "../components/GovernanceDashboard/KnowledgeGrowth";
import "../App.css";
import useAgentStore from '../stores/useAgentStore';

export default function GovernancePage() {
  const fetchGovernanceDashboard = useAgentStore((s) => s.fetchGovernanceDashboard);
  const data = useAgentStore((s) => s.governanceDashData);

  useEffect(() => {
    fetchGovernanceDashboard()
  }, []);

  const isLoading = !data;

  if (isLoading) {
    return (
      <div className="gov-loader-container">
        <div className="gov-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* TOP SECTION (2 columns) */}
      <div className="gov-layout">
        <div className="panel">
          <GovernanceDashboard />
        </div>

        <div className="panel">
          <ComplianceCard />
        </div>
      </div>

      {/* 🔥 BOTTOM SECTION (3 charts) */}
      <InsightsDashboard />

      <KnowledgeGrowth />
    </>
  );
};
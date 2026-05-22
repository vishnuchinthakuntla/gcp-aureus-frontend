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

  return (
    <>
      {/* TOP SECTION (2 columns) */}
      <div className="gov-layout">
        <div className="panel">
          {isLoading ? <div className="gov-skeleton" style={{ height: "350px" }} /> : <GovernanceDashboard />}
        </div>

        <div className="panel">
          {isLoading ? <div className="gov-skeleton" style={{ height: "350px" }} /> : <ComplianceCard />}
        </div>
      </div>

      {/* 🔥 BOTTOM SECTION (3 charts) */}
      {isLoading ? <div className="gov-skeleton" style={{ height: "300px", margin: "0 0 20px" }} /> : <InsightsDashboard />}

      {isLoading ? <div className="gov-skeleton" style={{ height: "300px", margin: "0 0 20px" }} /> : <KnowledgeGrowth />}
    </>
  );
};
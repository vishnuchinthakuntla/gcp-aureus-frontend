import React, { useEffect } from "react";
import GovernanceDashboard from "../components/GovernanceDashboard/GovernanceDashboard";
import ComplianceCard from "../components/GovernanceDashboard/ComplianceCard";
import InsightsDashboard from "../components/GovernanceDashboard/InsightsDashboard";

import KnowledgeGrowth from "../components/GovernanceDashboard/KnowledgeGrowth";
import "../App.css";
import useAgentStore from "../stores/useAgentStore";

const GovernancePage = () => {
  const fetchGovernanceDashboard = useAgentStore(s => s.fetchGovernanceDashboard);

  useEffect(() => {
    fetchGovernanceDashboard();
  }, []);

  return (
    <>
        {/* TOP SECTION (2 columns) */}
        <div className="gov-layout">
          <div className="left-panel">
            <GovernanceDashboard />
          </div>

          <div className="right-panel">
            <ComplianceCard />
          </div>
        </div>

        {/* 🔥 BOTTOM SECTION (3 charts) */}
        <InsightsDashboard />

        <KnowledgeGrowth />
    </>
  );
};

export default GovernancePage;
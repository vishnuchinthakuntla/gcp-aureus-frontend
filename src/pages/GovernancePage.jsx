import React, { useState } from "react";
import TopNav from "../components/Header/Header";
import GovernanceDashboard from "../components/GovernanceDashboard/GovernanceDashboard";
import ComplianceCard from "../components/GovernanceDashboard/ComplianceCard";
import InsightsDashboard from "../components/GovernanceDashboard/InsightsDashboard";

import KnowledgeGrowth from "../components/GovernanceDashboard/KnowledgeGrowth";

const GovernancePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* ✅ HEADER */}
      <TopNav open={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />

      {/* ✅ CONTENT */}
      <div className="page-container">

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

      </div>
    </div>
  );
};

export default GovernancePage;
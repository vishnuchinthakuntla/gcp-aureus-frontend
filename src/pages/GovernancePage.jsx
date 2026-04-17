import React, { useEffect, useState } from "react";
import TopNav from "../components/Header/Header";
import GovernanceDashboard from "../components/GovernanceDashboard/GovernanceDashboard";
import ComplianceCard from "../components/GovernanceDashboard/ComplianceCard";
import InsightsDashboard from "../components/GovernanceDashboard/InsightsDashboard";

import KnowledgeGrowth from "../components/GovernanceDashboard/KnowledgeGrowth";
import Sidebar from "../components/Sidebar/Sidebar";
import "../App.css";
import useAgentStore from "../stores/useAgentStore";

const GovernancePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fetchGovernanceDashboard = useAgentStore(s => s.fetchGovernanceDashboard);

  useEffect(() => {
    fetchGovernanceDashboard();
  }, []);

  return (
    <div className="app">
      {/* ✅ HEADER */}
      <TopNav open={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
      <Sidebar open={menuOpen} />

      {/* ✅ CONTENT */}
      <main className={`gov-main${menuOpen ? ' shifted' : ''}`}>

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

      </main>
    </div>
  );
};

export default GovernancePage;
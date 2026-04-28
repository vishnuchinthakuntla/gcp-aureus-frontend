import React, { useEffect } from "react";
import GovernanceDashboard from "../components/GovernanceDashboard/GovernanceDashboard";
import ComplianceCard from "../components/GovernanceDashboard/ComplianceCard";
import InsightsDashboard from "../components/GovernanceDashboard/InsightsDashboard";

import KnowledgeGrowth from "../components/GovernanceDashboard/KnowledgeGrowth";
import "../App.css";
import useAgentStore from '../stores/useAgentStore';

export default function GovernancePage() {
  const fetchGovernanceDashboard = useAgentStore((s) => s.fetchGovernanceDashboard);

  useEffect(() => {
    let isMounted = true; // Prevents memory leaks if the user navigates away
    let timeoutId;

    const pollForData = async () => {
      if (!isMounted) return;

      try {
        await fetchGovernanceDashboard();

        const currentData = useAgentStore.getState().governanceDashData;
        
        // If data is ready, stop polling
        if (currentData && currentData.activeTickets) {
           console.log("Data successfully loaded!");
           return; 
        }
      } catch (error) {
         console.warn("Governance data fetch failed:", error);
      }

      // 🔄 Retry after 3 seconds (less aggressive than 2s)
      if (isMounted) {
        timeoutId = setTimeout(pollForData, 3000); 
      }
    };

    pollForData();

    // Cleanup function: clears the timeout if the component is destroyed
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
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
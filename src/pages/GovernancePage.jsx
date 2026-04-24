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
      try {
        await fetchGovernanceDashboard();

        // Check the store directly to see if the data was populated successfully
        const currentData = useAgentStore.getState().governanceDashData;
        
        if (currentData && currentData.activeTickets) {
           console.log("Data successfully loaded!");
           return; 
        }
      } catch (error) {
         console.warn("Backend not ready or request failed. Retrying...");
      }

      // 🔄 If we reach here, it means either the fetch failed OR the data wasn't valid/ready
      if (isMounted) {
        timeoutId = setTimeout(pollForData, 2000); 
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
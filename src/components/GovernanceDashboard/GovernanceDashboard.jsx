import React, { useState, useEffect, useCallback } from "react";
import "./GovernanceDashboard.css";
import LifecycleModal from "./LifecycleModal";
import useAgentStore from "../../stores/useAgentStore";

export default function GovernanceDashboard() {
  const [selectedRow, setSelectedRow] = useState(null);
  const data = useAgentStore(s => s.governanceDashData?.activeTickets?.items);

  console.log(data)

  /* const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/governance/v2/dashboard");

      if (!response.ok) {
        throw new Error("API failed");
      }

      const result = await response.json();

      const formattedData =
        result?.activeTickets?.items?.map((item) => ({
          lifecycle: item.lifecycle_id,
          ticket: item.ticket_id,
          priority: item.priority,
          stage: item.stage,
          assigned: item.assigned_to || "Unassigned",
          eta: `${item.eta_minutes} min`,
          status: item.status,
          threadId: item.thread_id,
          pipeline: item.pipeline_name,
        })) || [];

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setData([]); // fallback
    } finally {
      setLoading(false);
    }
  });
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]); */

  const handleRowClick = (item) => {
    setSelectedRow(item);
  };

  const closeModal = () => {
    setSelectedRow(null);
  };

  return (
    <div className="gov-container">

      {/* Header */}
      <div className="gov-header">
        <div className="title">ACTIVE TICKET LIFECYCLES</div>

        <div className="header-right">
          <span className="view-text">Click row to view pipeline</span>
          <span className="badge">{data?.length} active</span>
        </div>
      </div>

      {/* Table */}
      <div className="gov-table">

        {/* Header Row */}
        <div className="table-header">
          <span>LIFECYCLE</span>
          <span>TICKET</span>
          <span>PRIORITY</span>
          <span>STAGE</span>
          <span>ASSIGNED</span>
          <span>ETA</span>
          <span>STATUS</span>
        </div>

        {/* ✅ Loading State INSIDE table */}
        {/* loading ? (
          <div className="table-row loading-row">
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
          </div>
        ) : */
        data?.length === 0 ? (
          <div className="table-row no-data-row">
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>No Data Available</span>
            <span>-</span>
            <span>-</span>
          </div>
        ) : (
          data?.map((item, index) => (
            <div
              className="table-row"
              key={index}
              onClick={() => handleRowClick(item)}
            >
              <span>{item.lifecycle || 'LC-UNK'}</span>
              <span>{item.ticket_id}</span>

              <span>
                <span className={`priority ${item.severity}`}>
                  • {item.severity}
                </span>
              </span>

              <span>
                <span className="stage">{item.stage || 'DETECT'}</span>
              </span>

              <span className="assigned">{item.assigned_to || 'Unassigned'}</span>
              <span>{item.eta || '00:00:00'}</span>

              <span>
                <span className={`status ${item.status.toLowerCase()}`}>
                  • {item.status || 'None'}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedRow && (
        <LifecycleModal
          data={selectedRow}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
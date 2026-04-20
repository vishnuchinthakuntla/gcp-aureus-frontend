import React, { useState, useEffect } from "react";
import "./GovernanceDashboard.css";
import LifecycleModal from "./LifecycleModal";

export default function GovernanceDashboard() {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
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
    };

    fetchDashboard();

    // ✅ Safety timeout (prevents infinite loading)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

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
          <span className="badge">{data.length} active</span>
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
        {loading ? (
          <div className="table-row loading-row">
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
            <span>Loading...</span>
          </div>
        ) : data.length === 0 ? (
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
          data.map((item, index) => (
            <div
              className="table-row"
              key={index}
              onClick={() => handleRowClick(item)}
            >
              <span>{item.lifecycle}</span>
              <span>{item.ticket}</span>

              <span>
                <span className={`priority ${item.priority}`}>
                  • {item.priority}
                </span>
              </span>

              <span>
                <span className="stage">{item.stage}</span>
              </span>

              <span className="assigned">{item.assigned}</span>
              <span>{item.eta}</span>

              <span>
                <span className={`status ${item.status}`}>
                  • {item.status}
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
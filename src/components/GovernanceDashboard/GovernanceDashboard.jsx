import React, { useState } from "react";
import "./GovernanceDashboard.css";
import LifecycleModal from "./LifecycleModal";
import useAgentStore from "../../stores/useAgentStore";
import { toTitleCase } from "../../utils";

export default function GovernanceDashboard() {
  const [selectedRow, setSelectedRow] = useState(null);
  const data = useAgentStore(s => s.governanceDashData?.activeTickets?.items) || [];

  function getSLAClass(status) {
    if (!status) return "info";
    switch (toTitleCase(status)) {
      case "Breached": return "err";
      case "At Risk": return "warn";
      case "On Track": return "ok";
      default: return "info";
    }
  }

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
    <>
      {/* Header */}
      <div className="ph">
        <div className="ph-title">
          <div className="ph-bar"></div>
          ACTIVE TICKET LIFECYCLES
        </div>

        <div className="header-right">
          <span className="view-text">Click row to view pipeline</span>
          <span className="badge">{data?.length} active</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="gov-table">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>

          {/* Header Row */}
          <thead>
            <tr className="table-header">
              <th><div>LIFECYCLE</div></th>
              <th><div>TICKET</div></th>
              <th><div>PRIORITY</div></th>
              <th><div>STAGE</div></th>
              <th><div>ASSIGNED</div></th>
              <th><div>ETA</div></th>
              <th><div>STATUS</div></th>
            </tr>
          </thead>
          <tbody>

            {/* ✅ Loading State INSIDE table */}
            {data?.length === 0 ? (
              <tr className="table-row">
                <td colSpan={7} style={{ display: "table-cell" }}>
                  <div className="no-data-row">No Active Ticket Found</div>
                </td>
              </tr>
            ) : (
              data?.map((item, index) => {
                const slaStatusClass = getSLAClass(item.status);
                return (
                  <tr
                    className="table-row"
                    key={index}
                    onClick={() => handleRowClick(item)}
                  >
                    <td><div>{item.lifecycle || 'LC-UNK'}</div></td>
                    <td><div>{item.ticket_id}</div></td>

                    <td>
                      <div>
                        <span className={`priority ${item.severity}`}>
                          • {item.severity}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className="stage">{item.stage || 'DETECT'}</span>
                      </div>
                    </td>

                    <td className="assigned"><div>{item.assigned_to || 'Unassigned'}</div></td>
                    <td><div>{item.eta || '00:00:00'}</div></td>

                    <td>
                      <div>
                        <span className={`status ${slaStatusClass}`}>
                          {item.status || 'None'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedRow && (
        <LifecycleModal
          data={selectedRow}
          onClose={closeModal}
        />
      )}
    </>
  );
}
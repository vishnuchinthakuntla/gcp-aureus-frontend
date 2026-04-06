
import React, { useState, useMemo } from "react";
import "./ApprovalAgent.css";
import useAgentStore from "../../stores/useAgentStore";
import { toast } from "react-hot-toast";


function ApprovalTable() {
  const approvals = useAgentStore((s) => s.approvals);
  const refreshApprovals = useAgentStore((s) => s.refreshApprovals);
  const [approvingId, setApprovingId] = useState(null);

  const approveTicket = async (threadId) => {
    setApprovingId(threadId);
    try {
      console.log("🚀 Approving:", threadId);

      const res = await fetch(`/api/approve/${threadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved: true,
          comment: "",
        }),
      });

      if (!res.ok) {
        throw new Error("Approve API failed");
      }

      console.log("✅ Approved");

      refreshApprovals();
    } catch (err) {
      console.error("❌ Approve error:", err);
      throw err;
    } finally {
      setApprovingId(null);
    }
  }

  /* ✅ Handle approve (store-based) */
  const handleApprove = async (threadId) => {
    try {
      await approveTicket(threadId);
      toast.success("Approved ✅");
    } catch {
      toast.error("Approval failed ❌");
    }
  };

  /* ✅ Normalize */
  const normalizedTickets = useMemo(() => {
    return (approvals || []).map((t, idx) => {
      let action = {};
      try {
        action = JSON.parse(t.recommended_action || "{}");
      } catch { }

      return {
        id: t.thread_id || idx,
        threadId: t.thread_id,
        pipeline: t.pipeline_name || "—",
        eventType: t.event_type || "—",
        severity: t.severity || "P3",
        status: t.status || "pending_approval",
        action: action.action || "—",
      };
    });
  }, [approvals]);

  return (
    <div className="tickets-section">
      <div className="tickets-section-header">
        <div className="tickets-section-title">HUMAN APPROVAL</div>
      </div>

      <div className="tickets-table-wrap">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>PIPELINE</th>
              <th>EVENT TYPE</th>
              <th>PRIORITY</th>
              <th>RECOMMENDED ACTION</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {
            normalizedTickets.length === 0 ? (
            <tr className="no-data">
              <td colSpan={5} style={{ textAlign: "center", padding: 12 }}>
                No approval data
              </td>
            </tr>
            ) : (
              normalizedTickets.map((t, i) => (
            <tr
              key={t.id}
              className={`tr-${t.severity.toLowerCase()}`}
              style={{
                animation: `feed-in .3s ${i * 0.04}s ease both`,
              }}
            >
              <td>{t.pipeline}</td>
              <td>{t.eventType}</td>

              <td>
                <span className={`t-prio ${t.severity.toLowerCase()}`}>
                  {t.severity}
                </span>
              </td>

              <td>{t.action}</td>

              <td>
                {t.status === "pending_approval" ? (
                  <button
                    className="tf-btn active"
                    style={{ backgroundColor: "#22c55e", color: "#fff" }}
                    disabled={approvingId === t.threadId}
                    onClick={() => handleApprove(t.threadId)}
                  >
                    {approvingId === t.threadId ? "Approving…" : "Approve"}
                  </button>
                ) : (
                  <span className="t-status">{t.status}</span>
                )}
              </td>
            </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApprovalTable;

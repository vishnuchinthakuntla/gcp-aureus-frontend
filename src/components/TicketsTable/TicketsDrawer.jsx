import React, { useEffect, useMemo, useState } from "react";
import useAgentStore from "../../stores/useAgentStore";
import "./TicketsTable.css";

export const STATUS_CLS = {
  CRITICAL: "ts-critical",
  HIGH: "ts-high",
  MEDIUM: "ts-medium",
  LOW: "ts-low",
  OPEN: "ts-open",
  "IN PROGRESS": "ts-inprogress",
  PENDING: "ts-pending",
};

export default function TicketDrawer() {
  const ticket = useAgentStore((s) => s.selectedTicket);
  const closeTicketDrawer = useAgentStore((s) => s.closeTicketDrawer);

  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ESC close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && ticket) closeTicketDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const normalized = useMemo(() => {
    if (!ticket) return null;


    return {
      id: ticket.ticket_id,
      title: ticket.title,
      desc: ticket.description,
      prio: ticket.severity,
      status: ticket.status?.toUpperCase(),
      owner: ticket.assigned_to || "Unassigned",
      createdAt: ticket.created_at,
      runId: ticket.run_id,
      url: ticket.external_url || "",
    };
  }, [ticket]);

  const age = useMemo(() => {
    if (!normalized?.createdAt) return "—";
    const diff = Math.floor(
      (Date.now() - new Date(normalized.createdAt)) / 1000,
    );
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }, [normalized]);

  // Pipeline API
  useEffect(() => {
    if (!normalized?.runId) return;

    const fetchPipeline = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pipelines/${normalized.runId}`);
        const data = await res.json();
        setPipelineData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [normalized?.runId]);

  if (!normalized) return null;

  const workflow = pipelineData?.workflow || {};
  const run = pipelineData?.run || {};

  const rcaConfidence = useMemo(() => {
    const logs = pipelineData?.agent_logs || [];

    for (let log of logs) {
      const match = log.message?.match(/confidence\s*=\s*([0-9.]+)/i);
      if (match) {
        return match[1]; // "0.9"
      }
    }

    return null;
  }, [pipelineData]);

  return (
    <>
      <div
        className={`ticket-drawer-overlay ${ticket ? "open" : ""}`}
        onClick={() => ticket && closeTicketDrawer()}
      />

      <div className={`ticket-drawer ${ticket ? "open" : ""}`}>
        {/* HEADER */}
        <div className="td-header">
          <div className="td-header-id">{normalized.id}</div>
          <div className="td-header-title">{normalized.title}</div>
          <div className="td-close" onClick={closeTicketDrawer}>
            ✕
          </div>
        </div>

        <div className="td-body">
          {/* HERO */}
          <div className="td-hero">
            <span
              className={`td-prio-badge tdp-${normalized.prio?.toLowerCase()}`}
            >
              {normalized.prio}
            </span>

            <div>
              <div className="td-hero-name">{normalized.title}</div>

              <div className="td-hero-desc">
                {(() => {
                  const lines = normalized.desc?.split("\n") || [];

                  // ✅ Get error line
                  const errorLine = lines.find((line) =>
                    line.toLowerCase().startsWith("error"),
                  );

                  // ✅ Clean error (remove long java part)
                  const cleanedError = errorLine
                    ? errorLine.split(": java")[0] + ":"
                    : null;

                  // ✅ Only required lines
                  const importantLines = lines.filter(
                    (line) =>
                      line.trim().startsWith("Pipeline") ||
                      line.trim().startsWith("Run ID") ||
                      line.trim().startsWith("Event"),
                  );

                  return (
                    <>
                      {/* ✅ Error Line */}
                      {cleanedError && (
                        <>
                          {cleanedError}
                          <br />
                        </>
                      )}

                      {/* ✅ Only 3 required lines */}
                      {importantLines.map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* TICKET DETAILS */}
          <div className="td-section-title">Ticket Details</div>
          <div className="td-grid">
            <div className="td-field">
              <div className="td-field-label">Status</div>
              <div className="td-field-val">
                <span
                  className={`t-status ${STATUS_CLS[normalized.status] || "ts-open"}`}
                >
                  {normalized.status}
                </span>
              </div>
            </div>
            <div className="td-field">
              <div className="td-field-label">Owner</div>
              <div className="td-field-val" style={{ fontSize: 13 }}>
                {normalized.owner}
              </div>
            </div>
            <div className="td-field">
              <div className="td-field-label">Age</div>
              <div
                className="td-field-val"
                style={{
                  color:
                    normalized.ageCls === "crit"
                      ? "#f43f5e"
                      : normalized.ageCls === "warn"
                        ? "#f59e0b"
                        : "var(--text-sub)",
                }}
              >
                {age}
              </div>
            </div>
            <div className="td-field">
              <div className="td-field-label">SLA</div>
              <div
                className="td-field-val"
                style={{
                  color: workflow?.sla_breached ? "#f43f5e" : "#10b981",
                  fontWeight: workflow?.sla_breached ? 800 : 700,
                }}
              >
                {workflow?.sla_breached ? "BREACHED" : "OK"}
              </div>
            </div>
            {/* <div className="td-field">
              <div>Status</div>
              <b>{normalized.status}</b>
            </div>
            <div className="td-field">
              <div>Owner</div>
              <b>{normalized.owner}</b>
            </div>
            <div className="td-field">
              <div>Age</div>
              <b>{age}</b>
            </div>
            <div className="td-field">
              <div>Severity</div>
              <b>{normalized.prio}</b>
            </div> */}
          </div>

          {/* ROOT CAUSE */}
          <div className="td-section-title">Root Cause</div>
          <div className="td-card scroll">
            {run.error_message || "No error info"}
          </div>

          {/* RCA DETAILS */}
          <div className="td-section-title">RCA Details</div>
          <div className="td-card scroll">
            <p>
              <b>Pipeline:</b> {run.pipeline_name}
            </p>
            <p>
              <b>Status:</b> {workflow.status}
            </p>
            <p>
              <b>Severity:</b> {workflow.severity}
            </p>
            <p>
              <b>Confidence:</b> {rcaConfidence ?? "N/A"}
            </p>
            {/* <p>
              <b>SLA Breach:</b> {workflow.sla_breached ? "YES" : "NO"}
            </p> */}
            <p>
  <b>Immediate Recommendations:</b>{" "}
  {(() => {
    try {
      const factors = JSON.parse(workflow.contributing_factors || "[]");

      return factors.length > 0
        ? factors.join(", ")
        : "N/A";
    } catch (e) {
      return "N/A";
    }
  })()}
</p>

            <p>
              <b>Recommended Actions:</b>
            </p>

            {(() => {
              try {
                const action = JSON.parse(workflow.recommended_action || "{}");

                return (
                  <div>
                    <p>
                      <b>Action:</b> {action.action || "N/A"}
                    </p>
                    <p>
                      <b>Requires Approval:</b>{" "}
                      {action.requires_approval ? "Yes" : "No"}
                    </p>
                    <p>
                      <b>SLA Impact:</b> {action.sla_impact || "N/A"}
                    </p>
                    <p>
                      <b>Business Impact:</b> {action.business_impact || "N/A"}
                    </p>
                    <p>
                      <b>Reasoning:</b> {action.reasoning || "N/A"}
                    </p>
                  </div>
                );
              } catch (e) {
                return <p>No recommended actions available</p>;
              }
            })()}
          </div>

          {/* 🔥 EXECUTION FLOW */}
          <div className="td-section-title">Execution Flow</div>

          <div className="flow-container">
            {(pipelineData?.agent_logs || []).map((log, i) => {
              const level = (log.level || "info").toLowerCase();
              const time = new Date(log.logged_at).toLocaleTimeString();

              return (
                <div key={log.log_id} className={`flow-step ${level}`}>
                  <div className="flow-line">
                    <div className={`flow-dot ${level}`} />
                    {i !== pipelineData.agent_logs.length - 1 && (
                      <div className="flow-connector" />
                    )}
                  </div>

                  <div className="flow-content">
                    <div className="flow-header">
                      <span>{log.agent_node}</span>
                      <span>{time}</span>
                    </div>
                    <div className={`flow-message ${level}`}>{log.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="td-action-btn"
            onClick={() => window.open(normalized.url, "_blank")}
          >
            VIEW TICKET
          </button>
        </div>
      </div>
    </>
  );
}

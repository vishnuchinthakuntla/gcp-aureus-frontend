import React, { useMemo } from "react";
import "./TicketsTable.css";
import useAgentStore from "../../stores/useAgentStore";
import { STATUS_CLS } from "./TicketsDrawer";

/* Helper: convert time → "2h 10m ago" */
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  return `${Math.floor(diff / 86400)}d`;
}

function TicketsTable() {
  const tickets = useAgentStore((s) => s.header.ticketsData);
  const onOpenDrawer = useAgentStore((s) => s.openTicketDrawer);
  const activeFilter = useAgentStore((s) => s.activeFilter);
  const setActiveFilter = useAgentStore((s) => s.setActiveFilter);

  // ✅ Transform YOUR backend → UI
  const normalizedTickets = useMemo(() => {
    return (tickets || []).map((t, idx) => {
      const prio = t.severity || "P3";

      return {
        id: t.ticket_id || `TKT-${idx}`,
        adoTicketId: t.ticket_id,

        name: t.title || "—",
        desc: t.description || "",

        prio: prio,
        status: (t.status || "open").toUpperCase(),

        age: timeAgo(t.created_at),
        ageCls: prio === "P1" ? "crit" : prio === "P2" ? "warn" : "ok",

        domain: "—", // not available in API
        source: "GCP", // optional default

        owner: t.assigned_to || "Unassigned",

        pipeline: t.title,

        sla: "OK",
        slABreach: "NO",
        ticketType: 0,

        raw: t, // keep original (useful for drawer)
      };
    });
  }, [tickets]);

  // ✅ Filters
  const filtered = useMemo(() => {
    if (activeFilter === "all") return normalizedTickets;

    if (activeFilter === "SLA") {
      return normalizedTickets.filter((t) => t.slABreach === "YES");
    }

    if (activeFilter === "HUMAN") {
      return normalizedTickets.filter((t) => t.ticketType === 1);
    }

    if (activeFilter === "SH") {
      return normalizedTickets.filter((t) => t.ticketType === 2);
    }

    return normalizedTickets.filter((t) => t.prio === activeFilter);
  }, [activeFilter, normalizedTickets]);

  const filters = [
    { key: "all", label: "ALL" },
    { key: "P1", label: "P1" },
    { key: "P2", label: "P2" },
    { key: "P3", label: "P3" },
    { key: "P4", label: "P4" },
    { key: "SLA", label: "SLA BREACH" },
    { key: "HUMAN", label: "HUMAN" },
    { key: "SH", label: "SELF-HEALING" },
  ];

  return (
    <div className="tickets-section">
      {/* Header */}
      <div className="tickets-section-header">
        <div className="tickets-section-title">OPEN TICKETS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tickets-filters">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`tf-btn ${activeFilter === f.key ? "active" : ""}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tickets-table-wrap">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>TICKET ID</th>
              <th>PIPELINE</th>
              <th>SOURCE</th>
              <th>DOMAIN</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>AGE</th>
              <th>OWNER</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr className="no-data">
                <td colSpan={9} style={{ textAlign: "center", padding: 12 }}>
                  No open tickets
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr
                  key={t.id}
                  className={`tr-${t.prio.toLowerCase()}`}
                  style={{
                    animation: `feed-in .3s ${i * 0.04}s ease both`,
                  }}
                  onClick={() => onOpenDrawer(t.raw)}
                >
                  <td>
                    <span className="t-id">{t.adoTicketId}</span>
                  </td>

                  <td>
                    <div className="t-name">{t.name}</div>
                  </td>

                  <td>
                    <span className="t-owner">{t.source}</span>
                  </td>

                  <td>
                    <span className="t-owner">{t.domain}</span>
                  </td>

                  <td>
                    <span className={`t-prio ${t.prio.toLowerCase()}`}>
                      {t.prio}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`t-status ${STATUS_CLS[t.status] || "ts-open"}`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td>
                    <span className={`t-age ${t.ageCls}`}>{t.age}</span>
                  </td>

                  <td>
                    <span className="t-owner">{t.owner}</span>
                  </td>

                  <td>
                    <span className="t-chevron">›</span>
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

export default React.memo(TicketsTable);

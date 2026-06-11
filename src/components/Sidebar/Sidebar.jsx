import { AGENTS } from "../../constants/agents";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Eye,
  Search,
  Brain,
  Wrench,
  CheckCircle,
  MessageSquare,
  Shield,
} from "lucide-react";
import useAgentStore from "../../stores/useAgentStore";
import React from "react";
import pipelineIcon from "../../assets/pipeline-icon.png";
import { toTitleCase } from "../../utils";


const ICON_MAP = {
  observer: Eye,
  rca: Search,
  decision: Brain,
  "self_healing": Wrench,
  "data_quality": CheckCircle,
  "self_service": MessageSquare,
  governance: Shield,
  approval: CheckCircle,
};

export default function Sidebar({ open }) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      {/* ✅ OVERVIEW BUTTON */}
      <button
        className={location.pathname === "/dashboard" ? "active" : ""}
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboard size={18} />
        Overview
      </button>
      {location.pathname === "/dashboard" && (
        <>
          <div className="sidebar-section">Agents</div>

          {AGENTS.filter((agent) => agent.id !== "governance").map((agent) => {
            return (
              <button
                key={agent.id}
                className={agent.id === selectedAgent ? "active" : ""}
                onClick={() => {
                  selectAgent(agent.id === selectedAgent ? null : agent.id)
                }}
              >
                <span className="icon">{agent.icon}</span>
                {toTitleCase(agent.label)}
              </button>
            );
          })}
        </>
      )}
      <div className="sidebar-section">DASHBOARD</div>

      {/* ✅ GOVERNANCE BUTTON */}
      <button
        className={
          location.pathname === "/governance-dashboard" ? "active" : ""
        }
        onClick={() => {
          navigate("/governance-dashboard")
        }}
      >
        <span className="icon">🛡️</span>
        Governance
      </button>
      <button
        className={location.pathname === "/pipeline-monitor" ? "active" : ""}
        onClick={() => navigate("/pipeline-monitor")}
      >
        <span className="icon">🖥️</span>
        Pipeline Monitoring
      </button>
      <button
        className={location.pathname === "/observability" ? "active" : ""}
        onClick={() => navigate("/observability")}
      >
        <span className="icon">🔎</span>
        Observability
      </button>

      <div className="sidebar-section">Admin</div>

      {/* ✅ PIPELINES BUTTON */}
      <button
        className={location.pathname === "/pipelines" ? "active" : ""}
        onClick={() => navigate("/pipelines")}
      >
        <span className="icon">🚀</span>
        Pipeline Actions
      </button>
      <button
        className={location.pathname === "/pipeline-history" ? "active" : ""}
        onClick={() => navigate("/pipeline-history")}
      >
        <span className="icon">🚀</span>
        Pipeline History
      </button>
      <button
        className={location.pathname === "/pipeline-runs" ? "active" : ""}
        onClick={() => navigate("/pipeline-runs")}
      >
        <span className="icon"><img src={pipelineIcon} style={{ height: "18px" }} alt="" /></span>
        Pipeline Runs
      </button>
      <button
        className={location.pathname === "/pipeline-metadata" ? "active" : ""}
        onClick={() => navigate("/pipeline-metadata")}
      >
        <span className="icon">🏷️</span>
        Pipeline Metadata
      </button>
      <button
        className={location.pathname === "/stuck-workflows" ? "active" : ""}
        onClick={() => navigate("/stuck-workflows")}
      >
        <span className="icon">⚠️</span>
        Stuck Workflows
      </button>
      <button
        className={location.pathname === "/data-quality-reports" ? "active" : ""}
        onClick={() => navigate("/data-quality-reports")}
      >
        <span className="icon">📊</span>
        Data Quality Reports
      </button>
    </aside>
  );
}

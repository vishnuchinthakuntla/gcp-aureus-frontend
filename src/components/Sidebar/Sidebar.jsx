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

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

const ICON_MAP = {
  observer: Eye,
  rca: Search,
  decision: Brain,
  selfhealing: Wrench,
  dataquality: CheckCircle,
  selfservice: MessageSquare,
  governance: Shield,
  approval: CheckCircle,
};

export default function Sidebar({ open }) {
  // ✅ MOVE HOOKS INSIDE COMPONENT
  const navigate = useNavigate();
  const location = useLocation();

  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const fetchGovernanceDashboard = useAgentStore((s) => s.fetchGovernanceDashboard);

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

      <div className="sidebar-section">Agents</div>

      {AGENTS.filter((agent) => agent.id !== "governance").map((agent) => {
        return (
          <button
            key={agent.id}
            onClick={() =>{
              if(location.pathname === "/governance-dashboard"){
                navigate("/dashboard")
              }
              selectAgent(agent.id === selectedAgent ? null : agent.id)
            }
            }
          >
            <span className="icon">{agent.icon}</span>
            {toTitleCase(agent.label)}
          </button>
        );
      })}
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
  Governance Agent
</button>

      <div className="sidebar-section">Admin</div>

      {/* ✅ PIPELINES BUTTON */}
      <button
        className={location.pathname === "/pipelines" ? "active" : ""}
        onClick={() => navigate("/pipelines")}
      >
        <span className="icon">🚀</span>
        Pipelines
      </button>
      <button
        className={location.pathname === "/pipeline-history" ? "active" : ""}
        onClick={() => navigate("/pipeline-history")}
      >
        <span className="icon">🚀</span>
        Pipeline History
      </button>
    </aside>
  );
}

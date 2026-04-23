import React, { useEffect, useState } from "react";
import "./PipelinesTable.css";

const VALID_AGENTS = ["observer", "rca", "decision"];
const AGENTS = ["none", ...VALID_AGENTS];

export default function PipelinesTable() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelines();
  }, []);

  // 🔄 LOAD DATA
  const loadPipelines = async () => {
    try {
      const res = await fetch("/api/pipelines_schedule");

      const data = await res.json();
      setPipelines(data.items || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (pl) => {
    if (pl.full_kill_switch === 1) return "killed";
    if (pl.agent_kill_switch && pl.agent_kill_switch !== "none")
      return "paused";
    return "active";
  };

  const handleRunAll = async () => {
    await fetch("/api/pipelines/run-all", { method: "POST" });
    loadPipelines();
  };

  const handleRun = async (name) => {
    await fetch(`/api/pipelines/${name}/run`, { method: "POST" });
    loadPipelines();
  };

  const handleKill = async (name) => {
    await fetch(`/api/pipelines/${name}/kill`, { method: "POST" });
    loadPipelines();
  };

  const handleUnkill = async (name) => {
    await fetch(`/api/pipelines/${name}/unkill`, { method: "POST" });
    loadPipelines();
  };

  const handleSetAgent = async (name, agent) => {
    await fetch("/api/pipelines/agent-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pipeline_name: name, agent }),
    });
    loadPipelines();
  };

  // ✅ LIVE LOGS
  const handleLiveLogs = (jobId) => {
    if (!jobId) {
      alert("Job ID not available");
      return;
    }

    window.open(`/api/pipelines/${jobId}/logs`, "_blank");
  };

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <div className="left">
          <span className="bar"></span>
          <span className="title">ACTIVE PIPELINES</span>
        </div>

        <button className="run-all-btn" onClick={handleRunAll}>
          ▶▶ Run All
        </button>
      </div>

      {/* ✅ ALWAYS SHOW TABLE */}
      <table className="pipeline-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>STATUS</th>
            <th>AGENT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {/* 🔄 LOADING */}
          {loading ? (
            <tr>
              <td colSpan="5">
                <div className="loader-container">
                  <div className="spinner"></div>
                </div>
              </td>
            </tr>
          ) : pipelines.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">
                No pipelines available
              </td>
            </tr>
          ) : (
            pipelines.map((pl) => {
              const status = getStatus(pl);
              const isKilled = status === "killed";

              return (
                <tr key={pl.pipeline_id}>
                  <td className="id">{pl.pipeline_id}</td>
                  <td className="name">{pl.pipeline_name}</td>

                  <td className={`status-${status}`}>
                    {status === "active" && "🟢 Active"}
                    {status === "paused" && "🟡 Agent Stop"}
                    {status === "killed" && "🔴 Killed"}
                  </td>

                  <td>
                    {isKilled
                      ? "-"
                      : (pl.agent_kill_switch || "none")}
                  </td>

                  <td>
                    {!isKilled && (
                      <button
                        className="run-btn"
                        onClick={() => handleRun(pl.pipeline_name)}
                      >
                        ▶ Run
                      </button>
                    )}

                    {isKilled ? (
                      <button
                        className="unkill-btn"
                        onClick={() => handleUnkill(pl.pipeline_name)}
                      >
                        ↩ Re-enable
                      </button>
                    ) : (
                      <button
                        className="kill-btn"
                        onClick={() => handleKill(pl.pipeline_name)}
                      >
                        🔴 Kill
                      </button>
                    )}

                    {!isKilled && (
                      <>
                        <select
                          className="agent-select"
                          value={pl.agent_kill_switch || "none"}
                          onChange={(e) =>
                            handleSetAgent(
                              pl.pipeline_name,
                              e.target.value
                            )
                          }
                        >
                          {AGENTS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>

                        <button
                          className="logs-btn"
                          onClick={() => handleLiveLogs(pl.job_id)}
                        >
                          📄 Logs
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
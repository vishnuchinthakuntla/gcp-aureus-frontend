import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./PipelinesTable.css";

const VALID_AGENTS = ["observer", "rca", "decision"];
const AGENTS = ["none", ...VALID_AGENTS];

export default function PipelinesTable() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW STATES (must be inside component)
  const [runningPipelines, setRunningPipelines] = useState({});
  const [loadingLogs, setLoadingLogs] = useState({});

  const navigate = useNavigate();

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
      toast.error("Failed to load pipelines ❌");
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

  // ✅ RUN ALL
  const handleRunAll = async () => {
    try {
      const res = await fetch("/api/pipelines/run-all", {
        method: "POST",
      });

      const data = await res.json();

      toast.success(data.message || "All pipelines triggered ✅");
      loadPipelines();
    } catch (err) {
      console.error(err);
      toast.error("Run all failed ❌");
    }
  };

  // ✅ RUN (with disable + loading)
  const handleRun = async (name) => {
    setRunningPipelines((prev) => ({ ...prev, [name]: true }));

    try {
      const res = await fetch(`/api/pipelines/${name}/run`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Run failed");
      }

      const jobId = data.job_id;

      setPipelines((prev) =>
        prev.map((p) =>
          p.pipeline_name === name ? { ...p, job_id: jobId } : p,
        ),
      );

      toast.success(data.message || `Pipeline started ✅`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Run failed ❌");
    } finally {
      setRunningPipelines((prev) => ({ ...prev, [name]: false }));
    }
  };

  // ✅ KILL
  const handleKill = async (name) => {
    try {
      const res = await fetch(`/api/pipelines/${name}/kill`, {
        method: "POST",
      });

      const data = await res.json();

      toast.success(data.message || "Pipeline killed 🔴");
      loadPipelines();
    } catch (err) {
      console.error(err);
      toast.error("Kill failed ❌");
    }
  };

  // ✅ UNKILL
  const handleUnkill = async (name) => {
    try {
      const res = await fetch(`/api/pipelines/${name}/unkill`, {
        method: "POST",
      });

      const data = await res.json();

      toast.success(data.message || "Pipeline re-enabled ↩");
      loadPipelines();
    } catch (err) {
      console.error(err);
      toast.error("Unkill failed ❌");
    }
  };

  // ✅ AGENT CHANGE
  const handleSetAgent = async (name, agent) => {
    try {
      const res = await fetch("/api/pipelines/agent-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pipeline_name: name, agent }),
      });

      const data = await res.json();

      toast.success(data.message || `Agent set to ${agent} ⚙️`);
      loadPipelines();
    } catch (err) {
      console.error(err);
      toast.error("Agent update failed ❌");
    }
  };

  // ✅ LOGS CLICK (with loading state)
  const handleLogsClick = (pl) => {
    const name = pl.pipeline_name;

    setLoadingLogs((prev) => ({ ...prev, [name]: true }));

    setTimeout(() => {
      navigate("/logs", {
        state: {
          jobId: pl.job_id,
          pipelineName: name,
        },
      });

      setLoadingLogs((prev) => ({ ...prev, [name]: false }));
    }, 300);
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

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "100%" }}>
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

                      <td>{isKilled ? "-" : pl.agent_kill_switch || "none"}</td>

                      <td>
                        {!isKilled && (
                          <button
                            className="run-btn"
                            disabled={runningPipelines[pl.pipeline_name]}
                            onClick={() => handleRun(pl.pipeline_name)}
                          >
                            {runningPipelines[pl.pipeline_name]
                              ? "Running..."
                              : "▶ Run"}
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
                                handleSetAgent(pl.pipeline_name, e.target.value)
                              }
                            >
                              {AGENTS.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>

                            {pl.job_id && (
                              <button
                                className="logs-btn"
                                disabled={loadingLogs[pl.pipeline_name]}
                                onClick={() => handleLogsClick(pl)}
                              >
                                {loadingLogs[pl.pipeline_name]
                                  ? "Opening..."
                                  : "📄 Logs"}
                              </button>
                            )}
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
      </div>
    </div>
  );
}

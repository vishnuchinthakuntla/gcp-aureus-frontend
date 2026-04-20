import React, { useEffect, useState } from "react";
import "./PipelinesTable.css";

const AGENTS = ["none", "observers", "roc", "decision", "test_heart", "data_quantity"];

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

  // 🔥 STATUS LOGIC
  const getStatus = (pl) => {
    if (pl.full_kill_switch === 1) return "killed";
    if (pl.agent_kill_switch && pl.agent_kill_switch !== "none") return "paused";
    return "active";
  };

  // ▶ RUN
  const handleRun = async (name) => {
    try {
      await fetch(`/api/pipelines/${encodeURIComponent(name)}/run`, {
        method: "POST",
      });
      loadPipelines();
    } catch (err) {
      console.error(err);
    }
  };

  // ▶▶ RUN ALL
  const handleRunAll = async () => {
    try {
      await fetch("/api/pipelines/run-all", {
        method: "POST",
      });
      loadPipelines();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔴 KILL
  const handleKill = async (name) => {
    try {
      await fetch(`/api/pipelines/${encodeURIComponent(name)}/kill`, {
        method: "POST",
      });
      loadPipelines();
    } catch (err) {
      console.error(err);
    }
  };

  // ↩ UNKILL
  const handleUnkill = async (name) => {
    try {
      await fetch(`/api/pipelines/${encodeURIComponent(name)}/unkill`, {
        method: "POST",
      });
      loadPipelines();
    } catch (err) {
      console.error(err);
    }
  };

  // ⚙️ SET AGENT
  const handleSetAgent = async (name, agent, pipeline) => {
    try {
      // If killed → unkill first
      if (pipeline.full_kill_switch === 1) {
        await fetch(`/api/pipelines/${encodeURIComponent(name)}/unkill`, {
          method: "POST",
        });
      }

      await fetch("/api/pipelines/agent-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipeline_name: name,
          agent: agent,
        }),
      });

      loadPipelines();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pipeline-container">
      {/* HEADER */}
      <div className="pipeline-header">
        <div className="left">
          <span className="bar"></span>
          <span className="title">ACTIVE PIPELINES</span>
        </div>

        <button className="run-all-btn" onClick={handleRunAll}>
          ▶▶ Run All
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Loading...</p>
      ) : (
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
            {pipelines.map((pl) => {
              const status = getStatus(pl);
              const isKilled = status === "killed";

              return (
                <tr key={pl.pipeline_id}>
                  {/* ID */}
                  <td className="id">{pl.pipeline_id}</td>

                  {/* NAME */}
                  <td className="name">{pl.pipeline_name}</td>

                  {/* STATUS */}
                  <td className={`status-${status}`}>
                    {status === "active" && "🟢 Active"}
                    {status === "paused" && "🟡 Agent Stop"}
                    {status === "killed" && "🔴 Killed"}
                  </td>

                  {/* AGENT */}
                  <td>
                    {isKilled ? "-" : pl.agent_kill_switch || "none"}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    {/* RUN */}
                    {!isKilled && (
                      <button
                        className="run-btn"
                        onClick={() => handleRun(pl.pipeline_name)}
                      >
                        ▶ Run
                      </button>
                    )}

                    {/* KILL / UNKILL */}
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

                    {/* AGENT SELECT */}
                    {!isKilled && (
                      <select
                        className="agent-select"
                        defaultValue={pl.agent_kill_switch || "none"}
                        onChange={(e) =>
                          handleSetAgent(
                            pl.pipeline_name,
                            e.target.value,
                            pl
                          )
                        }
                      >
                        {AGENTS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
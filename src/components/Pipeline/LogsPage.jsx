import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LogsPage.css";

export default function LogsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { jobId, pipelineName } = location.state || {};

  const [logs, setLogs] = useState([]);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stepsData, setStepsData] = useState(null);
  const [stepsLoading, setStepsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    fetchLogs();
    fetchSteps();
  }, [jobId]);

  const fetchLogs = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/pipelines/${jobId}/logs`);
      const data = await res.json();

      const rawLogs = Array.isArray(data.raw_logs)
        ? data.raw_logs
        : [];

      setLogs(rawLogs);
      setVisibleLogs([]);

      streamLogs(rawLogs);
    } catch (err) {
      console.error("Logs error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSteps = async () => {
    setStepsLoading(true);
    try {
      const res = await fetch(`/api/pipelines/${jobId}/steps`);
      const data = await res.json();
      setStepsData(data);
    } catch (err) {
      console.error("Steps error:", err);
    } finally {
      setStepsLoading(false);
    }
  };

  const streamLogs = (allLogs) => {
    let index = 0;

    const interval = setInterval(() => {
      if (index >= allLogs.length) {
        clearInterval(interval);
        return;
      }

      setVisibleLogs((prev) => [...prev, allLogs[index]]);
      index++;
    }, 200);
  };

  const getStepStatusClass = (status) => {
    if (!status) return "not-executed";
    const s = status.toLowerCase();
    if (s.includes("succe") || s.includes("completed")) return "succeeded";
    if (s.includes("fail")) return "failed";
    if (s.includes("running") || s.includes("progress")) return "running";
    return "not-executed";
  };

  const getStepIcon = (status) => {
    const cls = getStepStatusClass(status);
    switch (cls) {
      case "succeeded": return "✓";
      case "failed": return "✗";
      case "running": return "⟳";
      default: return "○";
    }
  };

  const getJobStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("done") || s.includes("succeeded")) return "job-done";
    if (s.includes("fail")) return "job-failed";
    if (s.includes("running")) return "job-running";
    if (s.includes("cancel")) return "job-cancelled";
    return "";
  };

  const formatJobStatus = (status) => {
    if (!status) return "Unknown";
    return status.replace("JOB_STATE_", "").replace(/_/g, " ");
  };

  const formatCompletedAt = (isoString) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      const date = d.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      });
      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
      });
      return { date, time };
    } catch {
      return { date: isoString, time: "" };
    }
  };

  return (
    <div className="logs-container">
      {/* HEADER */}
      <div className="logs-header">
        <h2>Logs - {pipelineName || "Pipeline"}</h2>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>

      {/* LOG BOX */}
      <div className="logs-box">
        {isLoading ? (
          <div className="loader-wrapper">
            <div className="spinner"></div>
            <p>Fetching logs...</p>
          </div>
        ) : visibleLogs.length === 0 ? (
          <div className="no-logs">No logs available</div>
        ) : (
          visibleLogs.map((log, index) => {
            if (!log || typeof log !== "object") return null;

            return (
              <div key={index} className="log-line">
                <span className="log-time">
                  [{log.timestamp || "No Time"}]
                </span>{" "}

                <span
                  className={`log-level ${
                    log.severity === "ERROR"
                      ? "error"
                      : log.severity === "WARNING"
                      ? "warning"
                      : "info"
                  }`}
                >
                  {log.severity || "INFO"}
                </span>{" "}

                <span className="log-message">
                  {log.message || JSON.stringify(log)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* STEPS PIPELINE */}
      <div className="steps-section">
        <div className="steps-header">
          <h3>Pipeline Steps</h3>
          {stepsData && (
            <div className="steps-meta">
              <span className={`job-status-badge ${getJobStatusClass(stepsData.job_status)}`}>
                {formatJobStatus(stepsData.job_status)}
              </span>
              <span className="steps-count">{stepsData.total || 0} steps</span>
            </div>
          )}
        </div>

        {stepsLoading ? (
          <div className="steps-loading">
            <div className="spinner" />
            <p>Loading steps…</p>
          </div>
        ) : !stepsData || !stepsData.steps || stepsData.steps.length === 0 ? (
          <div className="no-steps">No step data available</div>
        ) : (
          <div className="steps-pipeline">
            {stepsData.steps.map((step, i) => {
              const cls = getStepStatusClass(step.status);
              const completed = formatCompletedAt(step.completed_at);
              return (
                <React.Fragment key={i}>
                  <div className={`step-node ${cls}`}>
                    <span className="step-number">{i + 1}</span>
                    <div className="step-icon">{getStepIcon(step.status)}</div>
                    <div className="step-info">
                      <span className="step-name">{step.step}</span>
                      <span className={`step-status ${cls}`}>{step.status}</span>
                      {step.wall_time && (
                        <span className="step-time">⏱ {step.wall_time}</span>
                      )}
                      {completed && (
                        <div className="step-completed-group">
                          <span className="step-completed-date">{completed.date}</span>
                          {completed.time && (
                            <span className="step-completed-time">{completed.time}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {i < stepsData.steps.length - 1 && (
                    <div className={`step-connector ${cls}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



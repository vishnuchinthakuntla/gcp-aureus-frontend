import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LogsPage.css"; // 👈 add this

export default function LogsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { jobId, pipelineName } = location.state || {};

  const [logs, setLogs] = useState([]);
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    fetchLogs();
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
    </div>
  );
}



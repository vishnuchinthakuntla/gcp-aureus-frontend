import React, { useEffect, useState } from "react";
import "./LifecycleModal.css";

export default function LifecycleModal({ data, onClose }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!data) return null;

  // ✅ (Optional) Fetch pipeline stages dynamically using threadId
  useEffect(() => {
    const fetchStages = async () => {
      if (!data.threadId) return;

      setLoading(true);
      try {
        // 🔁 Replace with your real API
        const response = await fetch(
          `/api/governance/v2/pipeline/${data.threadId}`
        );
        const result = await response.json();

        setStages(result?.stages || []);
      } catch (err) {
        console.error("Error fetching pipeline stages:", err);
        setStages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, [data.threadId]);

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">LIFECYCLE PIPELINE</div>
            <div className="modal-sub">
              Execution trace for {data.lifecycle} - {data.ticket}
            </div>
          </div>

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Info Row */}
        <div className="modal-info">
          <div><span>LIFECYCLE</span>{data.lifecycle}</div>
          <div><span>TICKET</span>{data.ticket}</div>
          <div><span>PRIORITY</span>• {data.priority}</div>
          <div><span>ASSIGNED AGENT</span>{data.assigned}</div>
          <div><span>ETA</span>{data.eta}</div>
          <div><span>STATUS</span>• {data.status}</div>
        </div>

        {/* ✅ NEW: Pipeline Info */}
        <div className="pipeline-meta">
          <div><span>PIPELINE</span>{data.pipeline || "N/A"}</div>
          <div><span>THREAD ID</span>{data.threadId || "N/A"}</div>
        </div>

        {/* Pipeline Section */}
        <div className="pipeline-section">
          <div className="pipeline-title">PIPELINE STAGES</div>

          {loading ? (
            <div className="pipeline-placeholder">Loading stages...</div>
          ) : stages.length === 0 ? (
            <div className="pipeline-placeholder">
              No stages data available
            </div>
          ) : (
            <div className="pipeline-list">
              {stages.map((stage, index) => (
                <div key={index} className="pipeline-stage">
                  <div className="stage-name">{stage.name}</div>
                  <div className={`stage-status ${stage.status}`}>
                    {stage.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
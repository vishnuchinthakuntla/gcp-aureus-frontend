import React from "react";
import "./LifecycleModal.css";

export default function LifecycleModal({ data, onClose }) {
  if (!data) return null;

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

        {/* Pipeline Section */}
        <div className="pipeline-section">
          <div className="pipeline-title">PIPELINE STAGES</div>

          {/* Placeholder (you can enhance later) */}
          <div className="pipeline-placeholder">
            No stages data available
          </div>
        </div>

      </div>
    </div>
  );
}
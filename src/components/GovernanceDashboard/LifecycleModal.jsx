import React, { useEffect, useState } from "react";
import "./LifecycleModal.css";

export default function LifecycleModal({ data, onClose }) {

  if (!data) return null;

  // ✅ (Optional) Fetch pipeline stages dynamically using threadId
  /* useEffect(() => {
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
  }, [data.threadId]); */

  return (
    <div className="modal-overlay">
      <div className="modal">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon">
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="2.5" cy="8" r="1.8" fill="white" fillOpacity="0.9" />
              <circle cx="8" cy="8" r="1.8" fill="white" fillOpacity="0.9" />
              <circle cx="13.5" cy="8" r="1.8" fill="white" fillOpacity="0.9" />
              <line x1="4.3" y1="8" x2="6.2" y2="8" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
              <line x1="9.8" y1="8" x2="11.7" y2="8" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="modal-title-block">
            <div className="modal-title">Lifecycle Pipeline</div>
            <div className="modal-subtitle" id="modal-subtitle">Stage-by-stage execution trace</div>
          </div>
          <span id="modal-stage-badge" style={{ marginRight: '8px' }}></span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Info Row */}
        <div className="modal-meta-bar">
          <div className="meta-item"><span className="meta-label">LIFECYCLE</span><span className="meta-value">{data.lifecycle || 'LC-UNK'}</span></div>
          <div className="meta-item"><span className="meta-label">TICKET</span><span className="meta-value">{data.ticket_id}</span></div>
          <div className="meta-item"><span className="meta-label">PRIORITY</span><span className="meta-value">{data.severity}</span></div>
          <div className="meta-item"><span className="meta-label">ASSIGNED AGENT</span><span className="meta-value">{data.assigned_to || "Unassigned"}</span></div>
          <div className="meta-item"><span className="meta-label">ETA</span><span className="meta-value">{data.eta || '00:00:00'}</span></div>
          <div className="meta-item"><span className="meta-label">STATUS</span><span className="meta-value">{data.status}</span></div>
        </div>

        {/* ✅ NEW: Pipeline Info */}
        {/* <div className="pipeline-meta">
          <div><span>PIPELINE</span>{data.pipeline || "Pipeline Name"}</div>
          <div><span>THREAD ID</span>{data.threadId || "N/A"}</div>
        </div> */}

        {/* Pipeline Section */}
        <div className="modal-body">
          <div className="modal-section-title">Pipeline Stages</div>
          <div className="modal-pipeline-strip" id="modal-pipeline-strip">
            {data.pipeline_stages && data.pipeline_stages.map((stage, i) => {
              const statusLower = stage.status ? stage.status.toLowerCase() : 'idle';
              const state = statusLower === 'completed' ? 'done' :
                (statusLower === 'in_progress' || statusLower === 'breached') ? 'active' : 'idle';

              return (
                <React.Fragment key={i}>
                  <div className="ps-node">
                    <div className="ps-dot-wrap">
                      <div className={`ps-dot ${state}`}>
                        {state === 'completed' ? '✓' : (stage.stage_name ? stage.stage_name[0] : '')}
                      </div>
                      <div className={`ps-label ${state}`}>
                        {stage.stage_name}
                      </div>
                      <div className={`ps-time ${state}`}>
                        {stage.total_duration || '00:00'}
                      </div>
                    </div>
                  </div>
                  {i < data.pipeline_stages.length - 1 && (
                    <div className="ps-arrow">›</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="modal-timeline" id="modal-timeline">
            {data.pipeline_stages && data.pipeline_stages.map((stage, i) => {
              const statusLower = stage.status ? stage.status.toLowerCase() : 'idle';
              const state = statusLower === 'completed' ? 'done' :
                (statusLower === 'in_progress' || statusLower === 'active' || statusLower === 'breached') ? 'active' : 'idle';

              return (
                <div key={i} className={`mt-card ${state === 'done' ? 'done-card' : state === 'active' ? 'active-card' : ''}`}>
                  <div className={`mt-stage ${state}`}>{stage.stage_name.split(' ')[0]}</div>
                  <div className="mt-agent">{stage.stage_name ? stage.stage_name.toLowerCase() : ''}</div>
                  <div className={`mt-duration ${state}`}>
                    {stage.total_duration || '00:00'}
                  </div>
                  <div className="mt-status">
                      <span className={`lcm-status ${state === 'done' ? 'ok' : state === 'active' ? 'info' : ''}`}>
                        {state === 'done' ? '✔ Done' : state === 'active' ? '● Active' : 'Queued'}
                      </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}



{/* {loading ? (
      <div className="pipeline-placeholder">Loading stages...</div>
    ) : null}  */}
{/* data.pipeline_stages.length === 0 ? (
      <div className="pipeline-placeholder">
        No stages data available
      </div>
    ) : (
      <div className="pipeline-list">
        {data.pipeline_stages.map((stage, index) => (
          <div key={index} className="pipeline-stage">
            <div className="stage-name">{stage.stage_name}</div>
            <div className={`stage-status ${stage.status}`}>
              {stage.status}
            </div>
            <div>{stage.total_duration}</div>
          </div>
        ))}
      </div>
    ) */}
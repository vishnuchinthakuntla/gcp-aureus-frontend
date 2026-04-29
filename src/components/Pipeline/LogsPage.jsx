import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LogsPage.css";

export default function StepsOnlyPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { jobId, pipelineName } = location.state || {};

  const [stepsData, setStepsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchSteps = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${jobId}/steps?region=us-central1`);
        const data = await res.json();
        setStepsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [jobId]);

  const getStatus = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (s.includes("succe")) return "success";
    if (s.includes("fail")) return "failed";
    if (s.includes("running")) return "running";
    return "pending";
  };

  const getIcon = (name) => {
    if (name.toLowerCase().includes("extract")) return "📥";
    if (name.toLowerCase().includes("schema")) return "🔍";
    if (name.toLowerCase().includes("transform")) return "⚙️";
    if (name.toLowerCase().includes("quality")) return "✅";
    if (name.toLowerCase().includes("load")) return "🗄️";
    if (name.toLowerCase().includes("notify")) return "🔔";
    return "⚡";
  };

  return (
    <div className="steps-container">
      <div className="header">
        <div>
          <h2>{pipelineName || "Pipeline Flow"}</h2>
          <p className="subtitle">Execution steps overview</p>
        </div>

        <button onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      {loading ? (
        <div className="loader">Loading steps...</div>
      ) : !stepsData?.steps?.length ? (
        <div className="empty">No steps found</div>
      ) : (
        <div className="flow">
        {stepsData.steps.map((step, i) => {
  const status = getStatus(step.status);

  return (
    <React.Fragment key={i}>
      <div className={`card ${status}`}>
        <div className="icon">{getIcon(step.step)}</div>

        <div className="title">{step.step}</div>

        <div className={`status ${status}`}>
          ● {status.toUpperCase()}
        </div>

        {step.wall_time && (
          <div className="time">{step.wall_time}</div>
        )}
      </div>

      {i !== stepsData.steps.length - 1 && (
        <div className="arrow">→</div>
      )}
    </React.Fragment>
  );
})}
        </div>
      )}
    </div>
  );
}
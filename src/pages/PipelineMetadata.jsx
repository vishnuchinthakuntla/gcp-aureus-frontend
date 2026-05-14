import React, { useState, useEffect } from "react";
import './PipelineMetadata.css';

const PipelineMetadata = () => {
  const [pipelines, setPipelines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: true });

  useEffect(() => {
    // Fetch initial data - guessing the endpoint based on save endpoint and conventions
    const fetchPipelines = async () => {
      try {
        const res = await fetch("/api/pipelines/metadata");
        if (!res.ok || !res) { setTimeout(() => fetchPipelines(),3000); return;}
        const data = await res.json();
        setPipelines(data.data || []);
      } catch (err) {
        console.error("Failed to load pipelines metadata", err);
      }
    };
    fetchPipelines();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key ? !prev.direction : true,
    }));
  };

  const sortedPipelines = Array.isArray(pipelines) && pipelines.length !== 0 ? [...pipelines].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const key = sortConfig.key;
    let valA = a[key] ?? "";
    let valB = b[key] ?? "";

    if (valA !== "" && valB !== "" && !isNaN(valA) && !isNaN(valB)) {
      valA = Number(valA);
      valB = Number(valB);
      return sortConfig.direction ? valA - valB : valB - valA;
    }
    
    return sortConfig.direction
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  }) : [];

  const totalPages = Math.ceil(sortedPipelines.length / rowsPerPage) || 1;
  const displayedPipelines = sortedPipelines.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const startEdit = (pipeline) => {
    setEditingId(pipeline.pipeline_name);
    setEditData({ ...pipeline });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      // Ensure specific fields are 1/0 integers based on backend expectations from html file
      const payload = { ...editData };
      payload.is_active = payload.is_active ? 1 : 0;
    //   payload.IsRetry = payload.IsRetry ? 1 : 0;
    //   payload.IsDQ = payload.IsDQ ? 1 : 0;
      
      const res = await fetch(`/api/pipelines/${payload.pipeline_name}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "is_active": payload.is_active,
            "schedule_cron": payload.schedule_cron,
            "one_time_run_at": payload.one_time_run_at
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Update failed");
      }

      setPipelines((prev) =>
        prev.map((p) => {
          const rowId = p.pipeline_name;
          const payloadId = payload.pipeline_name;
          return rowId === payloadId ? { ...payload } : p;
        })
      );
      setEditingId(null);
      setEditData({});
    } catch (err) {
      alert(err.message);
      cancelEdit();
    }
  };

  return (
    <div className="panel">
      <div className="meta-page-header">
        <div className="meta-page-title-block">
          <h1>Pipeline Metadata</h1>
          <p>Review and update pipeline attributes with the same structured, high-contrast table treatment used in the tickets view.</p>
        </div>
      </div>

      <div className="meta-table-shell">
        <div className="meta-table-topbar">
          <div className="meta-table-title">Metadata Registry</div>
          <div className="meta-table-count">{pipelines.length} Pipelines</div>
        </div>

        <div className="meta-table-wrap">
          <table className="meta-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("pipeline_name")}>Name</th>
                <th onClick={() => handleSort("category")}>Type</th>
                <th onClick={() => handleSort("factory_name")}>Factory</th>
                {/* <th onClick={() => handleSort("Domain")}>Domain</th> */}
                <th onClick={() => handleSort("priority_level")}>Criticality</th>
                <th onClick={() => handleSort("sla_minutes")}>SLA</th>
                <th onClick={() => handleSort("is_active")}>Active</th>
                {/* <th onClick={() => handleSort("IsRetry")}>Retry</th>
                <th onClick={() => handleSort("IsDQ")}>DQ</th> */}
                <th onClick={() => handleSort("schedule_cron")}>Cron</th>
                <th>Custom Set</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {displayedPipelines.map((p) => {
                const rowId = p.pipeline_name;
                const isEditing = editingId != null && editingId === rowId;
                const data = isEditing ? editData : p;

                const isActiveChecked =
                  data.is_active === 1 ||
                  data.is_active === "1" ||
                  data.is_active === true ||
                  data.is_active === "true" ||
                  data.is_active === "True";
                
                // const isRetryChecked = data.IsRetry == 1 || data.IsRetry === true;
                // const isDqChecked = data.IsDQ == 1 || data.IsDQ === true;

                return (
                  <tr key={rowId} data-id={rowId} data-editing={isEditing}>
                    <td className="PipelineName">
                      {/* {isEditing ? (
                        <input
                          value={data.PipelineName || ""}
                          onChange={(e) => handleEditChange("PipelineName", e.target.value)}
                        />
                      ) : (
                    )} */}
                    {p.pipeline_name}
                    </td>
                    <td className="PipelineType">
                      {/* {isEditing ? (
                        <input
                          value={data.PipelineType || ""}
                          onChange={(e) => handleEditChange("PipelineType", e.target.value)}
                        />
                      ) : (
                    )} */}
                    {p.category}
                    </td>
                    <td className="DataFactoryName">
                      {/* {isEditing ? (
                        <input
                          value={data.DataFactoryName || ""}
                          onChange={(e) => handleEditChange("DataFactoryName", e.target.value)}
                        />
                      ) : (
                    )} */}
                    {p.factory_name}
                    </td>
                    {/* <td className="Domain">
                      {isEditing ? (
                        <input
                          value={data.Domain || ""}
                          onChange={(e) => handleEditChange("Domain", e.target.value)}
                        />
                      ) : (
                        p.domain || p.category
                        )}
                    </td> */}
                    <td className="Criticality">
                      {/* {isEditing ? (
                        <input
                          value={data.Criticality || ""}
                          onChange={(e) => handleEditChange("Criticality", e.target.value)}
                        />
                      ) : (
                      )} */}
                        <span className={`t-prio ${p.Criticality ? p.Criticality.toLowerCase() : p.priority?.toLowerCase() || ""}`}>
                          {p.Criticality || p.priority}
                        </span>
                    </td>
                    <td className="SLA_Minutes">
                      {/* {isEditing ? (
                        <input
                          type="number"
                          value={data.SLA_Minutes || ""}
                          onChange={(e) => handleEditChange("SLA_Minutes", e.target.value)}
                        />
                      ) : (
                    )} */}
                    {p.sla_minutes}
                    </td>
                    <td className="is_active">
                      <label className="switch">
                        <input
                          type="checkbox"
                          disabled={!isEditing}
                          checked={isActiveChecked}
                          onChange={(e) => handleEditChange("is_active", e.target.checked ? 1 : 0)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    {/* <td className="IsRetry">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={isRetryChecked}
                          onChange={(e) => handleEditChange("IsRetry", e.target.checked ? 1 : 0)}
                        />
                      ) : (
                        p.IsRetry || 'Not Set'
                      )}
                    </td>
                    <td className="IsDQ">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={isDqChecked}
                          onChange={(e) => handleEditChange("IsDQ", e.target.checked ? 1 : 0)}
                        />
                      ) : (
                        p.IsDQ || 'Not Set'
                      )}
                    </td> */}
                    <td className="schedule_cron">
                      {isEditing ? (
                        <input
                          value={data.schedule_cron || ""}
                          onChange={(e) => handleEditChange("schedule_cron", e.target.value)}
                        />
                      ) : (
                        p.schedule_cron || 'NULL'
                      )}
                    </td>
                    <td className="one_time_run_at">
                        {isEditing ? (
                          <input
                            type="datetime-local"
                            value={data.one_time_run_at || ""}
                            onChange={(e) => handleEditChange("one_time_run_at", e.target.value)}
                          />
                        ) : (
                          p.one_time_run_at || 'NULL'
                        )}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button className="save-btn" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="cancel-btn" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button className="edit-btn" onClick={() => startEdit(p)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button onClick={prevPage}>Prev</button>
        <span id="pageInfo">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
};

export default PipelineMetadata;

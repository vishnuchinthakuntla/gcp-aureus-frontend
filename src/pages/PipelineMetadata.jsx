import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import './PipelineMetadata.css';

const MetadataRow = React.memo(({ data, onSaveEdit, isSaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({});

  const handleStartEdit = () => {
    // Parse one_time_run_at ("2026-05-19 21:44:00") into separate date and time fields for the split inputs
    const otr = data.one_time_run_at || "";
    let otrDate = "";
    let otrTime = "";
    if (otr) {
      // Handle both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM" formats
      const parts = otr.replace("T", " ").split(" ");
      otrDate = parts[0] || "";
      otrTime = (parts[1] || "").substring(0, 5); // Take HH:MM only
    }
    setEditFields({
      ...data,
      _otr_date: otrDate,
      _otr_time: otrTime,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    onSaveEdit(editFields, () => {
      setIsEditing(false);
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const rowData = isEditing ? editFields : data;

  const isActiveChecked =
    rowData.is_active === 1 ||
    rowData.is_active === "1" ||
    rowData.is_active === true ||
    rowData.is_active === "true" ||
    rowData.is_active === "True";

  return (
    <tr data-id={data.pipeline_name} data-editing={isEditing}>
      <td className="PipelineName">
        {/* {isEditing ? (
                          <input
                            value={data.PipelineName || ""}
                            onChange={(e) => handleEditChange("PipelineName", e.target.value)}
                          />
                        ) : (
                      )} */}
        {data.pipeline_name}
      </td>
      <td className="PipelineType">
        {/* {isEditing ? (
                          <input
                            value={data.PipelineType || ""}
                            onChange={(e) => handleEditChange("PipelineType", e.target.value)}
                          />
                        ) : (
                      )} */}
        {data.category}
      </td>
      <td className="DataFactoryName">
        {/* {isEditing ? (
                          <input
                            value={data.DataFactoryName || ""}
                            onChange={(e) => handleEditChange("DataFactoryName", e.target.value)}
                          />
                        ) : (
                      )} */}
        {data.factory_name}
      </td>
      {/* <td className="Domain">
                        {isEditing ? (
                          <input
                            value={data.Domain || ""}
                            onChange={(e) => handleEditChange("Domain", e.target.value)}
                          />
                        ) : (
                          data.domain || data.category
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
        <span className={`t-prio ${data.priority?.toLowerCase() || ""}`}>
          {data.priority}
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
        {data.sla_minutes}
      </td>
      <td className="is_active">
        <label className="switch">
          <input
            type="checkbox"
            disabled={!isEditing}
            checked={isActiveChecked}
            onChange={(e) => handleEditFieldChange("is_active", e.target.checked ? 1 : 0)}
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
            value={rowData.schedule_cron || ""}
            onChange={(e) => handleEditFieldChange("schedule_cron", e.target.value)}
          />
        ) : (
          data.schedule_cron || 'NULL'
        )}
      </td>
      <td className="one_time_run_at">
        {isEditing ? (
          <div className="otr-datetime-wrap">
            <input
              type="date"
              value={rowData._otr_date || ""}
              onChange={(e) => handleEditFieldChange("_otr_date", e.target.value)}
            />
            <input
              type="time"
              value={rowData._otr_time || ""}
              onChange={(e) => handleEditFieldChange("_otr_time", e.target.value)}
            />
          </div>
        ) : (
          data.one_time_run_at || 'NULL'
        )}
      </td>
      <td>
        {isEditing ? (
          <>
            <button className="save-btn" onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>
              Cancel
            </button>
          </>
        ) : (
          <button className="edit-btn" onClick={handleStartEdit} disabled={isSaving}>
            Edit
          </button>
        )}
      </td>
    </tr>
  );
});

const PipelineMetadata = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: true });

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ["pipelinesMetadata"],
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/pipelines/metadata", { signal });
      if (!res.ok) throw new Error("Failed to load pipelines metadata");
      const resData = await res.json();
      return resData.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
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
      return payload;
    },
    onSuccess: (updatedPayload) => {
      queryClient.setQueryData(["pipelinesMetadata"], (old) => {
        if (!old) return [];
        return old.map((p) =>
          p.pipeline_name === updatedPayload.pipeline_name ? { ...p, ...updatedPayload } : p
        );
      });
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key ? !prev.direction : true,
    }));
  };

  const sortedPipelines = useMemo(() => {
    if (!Array.isArray(pipelines) || pipelines.length === 0) return [];
    return [...pipelines].sort((a, b) => {
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
    });
  }, [pipelines, sortConfig]);

  const totalPages = Math.ceil(sortedPipelines.length / rowsPerPage) || 1;
  const displayedPipelines = useMemo(() => {
    return sortedPipelines.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [sortedPipelines, currentPage, rowsPerPage]);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleSaveEdit = useCallback((editFields, onSuccessCallback) => {
    // Ensure specific fields are 1/0 integers based on backend expectations from html file
    const payload = { ...editFields };
    payload.is_active = payload.is_active ? 1 : 0;

    // Trim whitespace-only cron values so they become empty (displays as "NULL")
    payload.schedule_cron = (payload.schedule_cron || "").trim() || null;

    // Combine the split date and time fields into backend format "YYYY-MM-DD HH:MM:00"
    let formattedRunAt = "";
    if (payload._otr_date && payload._otr_time) {
      formattedRunAt = `${payload._otr_date} ${payload._otr_time}:00`;
    } else if (payload._otr_date) {
      formattedRunAt = `${payload._otr_date} 00:00:00`;
    }
    // Clean up helper fields before saving to local state
    delete payload._otr_date;
    delete payload._otr_time;
    payload.one_time_run_at = formattedRunAt;

    updateMutation.mutate(payload, {
      onSuccess: () => {
        onSuccessCallback();
      }
    });
  }, [updateMutation]);

  return (
    <div className="panel" style={{ padding: '24px' }}>
      {/* <div style={{ background: '#ffffff', border: '1px solid #dde3ee', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(14,23,38,0.04), 0 4px 20px rgba(14,23,38,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '4px', height: '18px', background: 'linear-gradient(180deg, #3b82f6, #a78bfa)', borderRadius: '2px' }}></div>
          <div style={{ marginBottom: 0, color: '#0c58b7', fontSize: '14px', letterSpacing: '0.3px', fontWeight: 600 }}>Pipeline Metadata</div>
        </div>
        <div style={{ marginBottom: 0, paddingLeft: '14px', fontSize: '11px', color: '#64748b' }}>Review and update pipeline attributes with the same structured, high-contrast table treatment used in the tickets view.</div>
      </div> */}

      <div className="pages-header">
        <h1 className="pages-title">Pipeline Metadata</h1>
        <p className="pages-description">
          Review and update pipeline attributes with the same structured, high-contrast table treatment used in the tickets view
        </p>
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
                <th onClick={() => handleSort("priority")}>Criticality</th>
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", display: "table-cell" }}>
                    <div className="loader-container">
                      <div className="spinner"></div>
                    </div>
                  </td>
                </tr>
              ) : displayedPipelines.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No pipeline metadata found
                  </td>
                </tr>
              ) : (
                displayedPipelines.map((p) => {
                  return (
                    <MetadataRow
                      key={p.pipeline_name}
                      data={p}
                      onSaveEdit={handleSaveEdit}
                      isSaving={updateMutation.isPending}
                    />
                  )
                })
              )}
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

import React, { useState, useEffect } from "react";
import './DataQualityReports.css';

const DataQualityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/data-quality-reports');
      if (!response.ok || !response) {
        setTimeout(() => fetchReports(), 3000)
        return
      }
      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetching list of available reports
    fetchReports();
  }, []);

  const handleView = async (id) => {
    console.log("View record", id);
    setLoadingReportDetails(true);
    setSelectedReport(id); // Open modal in loading state

    try {
      const response = await fetch(`/api/dq-reports/${id}`);
      if (!response.ok || !response) {
        setTimeout(() => handleView(id), 3000)
        return
      }
      const data = await response.json();
      if (data.status === "success" && data.data) {
        setSelectedReport(data.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (error) {
      console.error("Error viewing report details:", error);
    } finally {
      setLoadingReportDetails(false);
    }
  };

  const handleDownload = async (id) => {
    console.log("Download record", id);
    try {
      const response = await fetch(`/api/dq-reports/${id}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();

      // Attempt to extract filename from Content-Disposition header
      let filename = `report_${id}.csv`;
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log("Delete record", id);
    await fetch(`/api/dq-reports/${id}`, { method: 'DELETE' });
    setTimeout(() => {
      fetchReports();
    }, 300);
  };

  const closeViewModal = () => {
    setSelectedReport(null);
  };

  const getTableHeaders = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    return Object.keys(dataArray[0]).filter(key => key !== 'run_id' && key !== 'loaded_at');
  };

  return (
    <div className="dq-page-container">
      <div className="pages-header">
        <h1 className="pages-title">Data Quality Reports</h1>
        <p className="pages-description">
          Review and manage your data quality reports and export records.
        </p>
      </div>

      <div className="dq-table-shell">
        <div className="dq-table-topbar">
          <div className="dq-table-title">Reports</div>
          <div className="dq-table-count">{reports.length} Records</div>
        </div>

        <div className="dq-table-wrap">
          <table className="dq-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pipeline Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    <div className="loader-container">
                      <div className="spinner"></div>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No records found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.pipeline_name}</td>
                    <td>
                      <div className="dq-actions">
                        <button className="dq-btn view-btn" onClick={() => handleView(report.id)}>View</button>
                        <button className="dq-btn download-btn" onClick={() => handleDownload(report.id)}>Download</button>
                        <button className="dq-btn delete-btn" onClick={() => handleDelete(report.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedReport && (
        <div className="dq-modal-overlay" onClick={closeViewModal}>
          <div className="dq-modal-container" onClick={e => e.stopPropagation()}>
            {loadingReportDetails || !selectedReport.report_data ? (
              <div className="loader-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className="dq-modal-header">
                  <div className="dq-modal-title">
                    {selectedReport.pipeline_name ? `Report Details: ${selectedReport.pipeline_name}` : `Loading Report #${selectedReport.id}...`}
                  </div>
                  <button className="dq-modal-close" onClick={closeViewModal}>✕</button>
                </div>

                <div className="dq-modal-body">
                  <div className="dq-summary-grid">
                    <div className="dq-summary-card">
                      <div className="dq-summary-label">Status</div>
                      <div className="dq-summary-value" style={{ textTransform: 'capitalize' }}>{selectedReport.status || 'Unknown'}</div>
                    </div>
                    <div className="dq-summary-card">
                      <div className="dq-summary-label">Bad Records</div>
                      <div className={`dq-summary-value ${selectedReport.total_bad_records > 0 ? 'dq-value-critical' : ''}`}>
                        {selectedReport.total_bad_records}
                      </div>
                    </div>
                    <div className="dq-summary-card">
                      <div className="dq-summary-label">Run ID</div>
                      <div className="dq-summary-value" style={{ fontSize: '14px' }}>{selectedReport.run_id}</div>
                    </div>
                    <div className="dq-summary-card">
                      <div className="dq-summary-label">Created At</div>
                      <div className="dq-summary-value" style={{ fontSize: '13px' }}>
                        {new Date(selectedReport.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '12px', marginTop: '10px' }}>Failed Records</h3>

                  {selectedReport.report_data && selectedReport.report_data.length > 0 ? (
                    <div className="dq-modal-table-wrap">
                      <table className="dq-table">
                        <thead>
                          <tr>
                            {getTableHeaders(selectedReport.report_data).map(key => (
                              <th key={key}>{key.replace(/_/g, ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.report_data.map((row, idx) => (
                            <tr key={idx}>
                              {getTableHeaders(selectedReport.report_data).map(key => {
                                const val = row[key];
                                if (key === 'severity') {
                                  let sevClass = 'dq-sev-info';
                                  if (val === 'CRITICAL') sevClass = 'dq-sev-critical';
                                  if (val === 'WARNING' || val === 'HIGH') sevClass = 'dq-sev-warning';
                                  return (
                                    <td key={key}>
                                      <span className={`dq-severity-badge ${sevClass}`}>{val}</span>
                                    </td>
                                  );
                                }
                                return <td key={key}>{val}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      No bad records found in this report.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DataQualityReports;

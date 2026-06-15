import React, { useState, useEffect, useCallback } from "react";
import './DataQualityReports.css';
import ReportRow from "../components/DQReports/ReportRow";
import ReportDetailsModal from "../components/DQReports/ReportDetailsModal";

const DataQualityReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);

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
    fetchReports();
  }, []);

  const fetchReportDetailsWithRetry = async (id) => {
    try {
      const response = await fetch(`/api/dq-reports/${id}`);
      if (!response.ok) {
        // Retry after 3 seconds
        return new Promise((resolve) => {
          setTimeout(() => resolve(fetchReportDetailsWithRetry(id)), 3000);
        });
      }
      const data = await response.json();
      if (data.status === "success" && data.data) {
        return data.data;
      }
      throw new Error("Invalid format");
    } catch (error) {
      console.error("Error fetching report details:", error);
      throw error;
    }
  };

  const handleView = useCallback(async (id, pipeline_name) => {
    const promise = fetchReportDetailsWithRetry(id);
    setSelectedReport({ id, pipeline_name, promise });
  }, []);

  const handleDownload = useCallback(async (id) => {
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
  }, []);

  const handleDelete = useCallback(async (id) => {
    console.log("Delete record", id);
    await fetch(`/api/dq-reports/${id}`, { method: 'DELETE' });
    setTimeout(() => {
      fetchReports();
    }, 300);
  }, []);

  const closeViewModal = useCallback(() => {
    setSelectedReport(null);
  }, []);


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
                  <ReportRow
                    key={report.id}
                    report={report}
                    onView={handleView}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedReport && (
        <ReportDetailsModal
          reportId={selectedReport.id}
          pipelineName={selectedReport.pipeline_name}
          promise={selectedReport.promise}
          onClose={closeViewModal}
        />
      )}

    </div>
  );
};

export default DataQualityReports;

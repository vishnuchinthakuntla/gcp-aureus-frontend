import React, { useEffect, useState } from "react";

const getTableHeaders = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    return Object.keys(dataArray[0]).filter(key => key !== 'run_id' && key !== 'loaded_at');
};

const ReportDetailsModal = ({ reportId, pipelineName, promise, onClose }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!promise) return;
        let active = true;
        setLoading(true);
        promise
            .then((data) => {
                if (active) {
                    setReport(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [reportId]);

    return (
        <div className="dq-modal-overlay" onClick={onClose}>
            <div className="dq-modal-container" onClick={e => e.stopPropagation()}>
                {loading || !report ? (
                    <div className="loader-container"><div className="spinner"></div></div>
                ) : (
                    <>
                        <div className="dq-modal-header">
                            <div className="dq-modal-title">
                                {pipelineName ? `Report Details: ${pipelineName}` : `Loading Report #${reportId}...`}
                            </div>
                            <button className="dq-modal-close" onClick={onClose}>✕</button>
                        </div>
                        <div className="dq-modal-body">
                            <div className="dq-summary-grid">
                                <div className="dq-summary-card">
                                    <div className="dq-summary-label">Status</div>
                                    <div className="dq-summary-value" style={{ textTransform: 'capitalize' }}>{report.status || 'Unknown'}</div>
                                </div>
                                <div className="dq-summary-card">
                                    <div className="dq-summary-label">Bad Records</div>
                                    <div className={`dq-summary-value ${report.total_bad_records > 0 ? 'dq-value-critical' : ''}`}>
                                        {report.total_bad_records}
                                    </div>
                                </div>
                                <div className="dq-summary-card">
                                    <div className="dq-summary-label">Run ID</div>
                                    <div className="dq-summary-value" style={{ fontSize: '14px' }}>{report.run_id}</div>
                                </div>
                                <div className="dq-summary-card">
                                    <div className="dq-summary-label">Created At</div>
                                    <div className="dq-summary-value" style={{ fontSize: '13px' }}>
                                        {new Date(report.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '15px', color: '#1e293b', marginBottom: '12px', marginTop: '10px' }}>Failed Records</h3>

                            {report.report_data && report.report_data.length > 0 ? (
                                <div className="dq-modal-table-wrap">
                                    <table className="dq-table">
                                        <thead>
                                            <tr>
                                                {getTableHeaders(report.report_data).map(key => (
                                                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.report_data.map((row, idx) => (
                                                <tr key={idx}>
                                                    {getTableHeaders(report.report_data).map(key => {
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
    );
};

export default ReportDetailsModal;
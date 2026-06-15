import React from "react";

const ReportRow = React.memo(({ report, onView, onDownload, onDelete }) => {
    return (
        <tr>
            <td>{report.id}</td>
            <td>{report.pipeline_name}</td>
            <td>
                <div className="dq-actions">
                    <button className="dq-btn view-btn" onClick={() => onView(report.id, report.pipeline_name)}>View</button>
                    <button className="dq-btn download-btn" onClick={() => onDownload(report.id)}>Download</button>
                    <button className="dq-btn delete-btn" onClick={() => onDelete(report.id)}>Delete</button>
                </div>
            </td>
        </tr>
    );
});

export default ReportRow;
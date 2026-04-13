import React from "react";
import "./PipelinesTable.css";

const pipelines = [
  { id: "PL-001", domain: "Finance", name: "PL_FN_SalesData_Sync" },
  { id: "PL-002", domain: "Finance", name: "PL_FN_FinData_Sync" },
  { id: "PL-003", domain: "Finance", name: "PL_DS_FinanceData_Sync" },
  { id: "PL-004", domain: "Sales", name: "PL_Sales_Hourly_Load" },
  { id: "PL-005", domain: "Banking", name: "PL_User_LoadData" },
  { id: "PL-006", domain: "Global", name: "PL_CSV_Blob_Copy" },
];

export default function PipelinesTable() {
  return (
    <div className="pipeline-container">

      {/* HEADER */}
      <div className="pipeline-header">
        <div className="left">
          <span className="bar"></span>
          <span className="title">ACTIVE PIPELINES</span>
        </div>

        <button className="run-all-btn">▶ Run All Pipelines</button>
      </div>

      {/* TABLE */}
      <table className="pipeline-table">
        <thead>
          <tr>
            <th>PIPELINE ID</th>
            <th>DOMAIN</th>
            <th>PIPELINE NAME</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          {pipelines.map((item, index) => (
            <tr key={index}>
              <td className="id">{item.id}</td>
              <td>{item.domain}</td>
              <td className="name">{item.name}</td>
              <td>
                <button className="run-btn">▶ Run</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
import React from "react";
import "./GovernanceDashboard.css";

const data = [
  {
    lifecycle: "LC-1568",
    ticket: "TKT-694",
    priority: "P1",
    stage: "DETECT",
    assigned: "narendra.mamilla@covalenseglobal.com",
    eta: "25751 min",
    status: "BREACHED",
  },
  {
    lifecycle: "LC-1574",
    ticket: "TKT-697",
    priority: "P2",
    stage: "DETECT",
    assigned: "narendra.mamilla@covalenseglobal.com",
    eta: "25698 min",
    status: "BREACHED",
  },
  {
    lifecycle: "LC-1569",
    ticket: "TKT-695",
    priority: "P2",
    stage: "DETECT",
    assigned: "narendra.mamilla@covalenseglobal.com",
    eta: "25691 min",
    status: "BREACHED",
  },
  {
    lifecycle: "LC-1572",
    ticket: "TKT-696",
    priority: "P1",
    stage: "DETECT",
    assigned: "narendra.mamilla@covalenseglobal.com",
    eta: "25683 min",
    status: "BREACHED",
  },
  {
    lifecycle: "LC-1575",
    ticket: "TKT-698",
    priority: "P1",
    stage: "DETECT",
    assigned: "narendra.mamilla@covalenseglobal.com",
    eta: "25668 min",
    status: "BREACHED",
  },
];

export default function GovernanceDashboard() {
  return (
    <div className="gov-container">
      
      {/* Header */}
      <div className="gov-header">
        <div className="title">ACTIVE TICKET LIFECYCLES</div>
        <div className="header-right">
          <span className="view-text">Click row to view pipeline</span>
          <span className="badge">4 active</span>
        </div>
      </div>

      {/* Table */}
      <div className="gov-table">
        <div className="table-header">
          <span>LIFECYCLE</span>
          <span>TICKET</span>
          <span>PRIORITY</span>
          <span>STAGE</span>
          <span>ASSIGNED</span>
          <span>ETA</span>
          <span>STATUS</span>
        </div>

        {data.map((item, index) => (
          <div className="table-row" key={index}>
            <span>{item.lifecycle}</span>
            <span>{item.ticket}</span>

            <span>
              <span className={`priority ${item.priority}`}>
                • {item.priority}
              </span>
            </span>

            <span>
              <span className="stage">{item.stage}</span>
            </span>

            <span className="assigned">{item.assigned}</span>
            <span>{item.eta}</span>

            <span>
              <span className="status">• {item.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
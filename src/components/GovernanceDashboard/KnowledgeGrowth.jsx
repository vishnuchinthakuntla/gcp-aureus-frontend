import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./KnowledgeGrowth.css";

const data = [
  { week: "Wk 1", patterns: 170, rules: 172, auto: 48 },
  { week: "Wk 2", patterns: 178, rules: 176, auto: 52 },
  { week: "Wk 3", patterns: 185, rules: 180, auto: 55 },
  { week: "Wk 4", patterns: 190, rules: 188, auto: 56 },
  { week: "Wk 5", patterns: 196, rules: 198, auto: 58 },
  { week: "Wk 6", patterns: 202, rules: 206, auto: 60 },
  { week: "Wk 7", patterns: 208, rules: 214, auto: 61 },
  { week: "Wk 8", patterns: 214, rules: 220, auto: 62 },
];

export default function KnowledgeGrowth() {
  return (
    <div className="kg-container">

      {/* LEFT */}
      <div className="kg-left">
        
        <div className="kg-header">
          <div className="title">
            <span className="bar"></span>
            <h3>KNOWLEDGE GROWTH & LEARNING</h3>
          </div>

          <div className="legend">
            <span className="dot purple"></span> Failure Patterns 214
            <span className="dot blue"></span> Diagnostic Rules 38
            <span className="dot orange"></span> Auto-resolved 61%
            <button className="trend-btn">8-week trend</button>
          </div>
        </div>

        {/* 🔥 REAL CHART */}
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="patterns"
                stroke="#7c3aed"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="rules"
                stroke="#2563eb"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="auto"
                stroke="#ea580c"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="kg-right">
        <h4>L3 MILESTONE PROGRESS</h4>

        <div className="milestone">
          <div className="row">
            <span>Pattern repo ≥ 250</span>
            <b>214 / 250</b>
          </div>
          <div className="progress purple">
            <span style={{ width: "85%" }}></span>
          </div>
        </div>

        <div className="milestone">
          <div className="row">
            <span>Auto-resolve ≥ 70%</span>
            <b>61% / 70%</b>
          </div>
          <div className="progress orange">
            <span style={{ width: "70%" }}></span>
          </div>
        </div>

        <div className="milestone">
          <div className="row">
            <span>Avg confidence ≥ 88%</span>
            <b>84% / 88%</b>
          </div>
          <div className="progress orange">
            <span style={{ width: "75%" }}></span>
          </div>
        </div>

        <div className="status">
          <span>Feedback loop</span>
          <span className="active">● ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
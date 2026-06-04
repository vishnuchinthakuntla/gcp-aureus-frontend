import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import "./KnowledgeGrowth.css";
import useAgentStore from "../../stores/useAgentStore";

/* const data = [
  { week: "Wk 1", patterns: 170, rules: 172, auto: 48 },
  { week: "Wk 2", patterns: 178, rules: 176, auto: 52 }, ...
]; */

export default function KnowledgeGrowth() {
  const knowledgeGrowthData = useAgentStore(s => s.governanceDashData?.knowledgeGrowth);

  const knowledgeGrowthOptions = {
    chart: {
      type: 'area',
      height: '200px',
      // events: {
      //   render() {
      //     const fraction = 0.2;
      //     this.xAxis[0].update({ minPadding: fraction, maxPadding: fraction }, false);
      //   }
      // }
    },
    title: {
      text: null,
    },
    accessibility: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      useHTML: true,
      shared: true,
      pointFormat: '<div style="display: flex; align-items: center; gap: 4px;"><div style="width: 4px; height: 4px; display: inline-block; border-radius: 50%; background-color: {series.color};"></div><span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b></div>',
      crosshairs: true,
    },
    xAxis: {
      categories: knowledgeGrowthData?.timelineData?.map(item => item.weekLabel) || [],
      tickmarkPlacement: 'on',
      // tickStart: 0,
      // tickInterval: 1,
      // minPadding: 0.1,
      // maxPadding: 0.1
    },
    yAxis: [
      {
        title: { text: 'Patterns / Rules' },
        // tickStart: 170,
        // tickInterval: 10,
        tickAmount: 5,
        gridLineWidth: 1,
        gridLineColor: '#e8edf5',
      },
      {
        title: { text: '% Auto-resolve' },
        opposite: true,
        labels: { format: '{value}%' },
        tickAmount: 5,
      },
    ],
    legend: {
      align: 'center',
      verticalAlign: 'top',
      layout: 'horizontal',
      itemStyle: {
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: 'Open Sans, Helvetica Neue, sans-serif'
      },
      y: -15,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.01,
        marker: { radius: 4 },
      },
    },
    series: [
      {
        name: 'Failure Patterns',
        data: knowledgeGrowthData?.timelineData?.map(item => item.failurePatterns),
        color: '#8B5CF6',
        fillColor: 'rgba(139, 92, 246, 0.1)',
        pointPlacement: 'on'
      },
      {
        name: 'Diagnostic Rules',
        data: knowledgeGrowthData?.timelineData?.map(item => item.diagnosticRules),
        color: '#3B82F6',
        fillColor: 'rgba(59, 130, 246, 0.1)',
        pointPlacement: 'on'
      },
      {
        name: 'Auto-resolve %',
        type: 'line',
        dashStyle: 'Dash',
        data: knowledgeGrowthData?.timelineData?.map(item => item.autoResolvedPercent),
        color: '#F97316',
        yAxis: 1,               // maps to the right-side axis
        marker: { radius: 3 },
        pointPlacement: 'on'
      },
    ],
  };

  return (
    // <div className="kg">
    //   <div className="kg-header">
    //     <div className="kg-title">
    //       <span className="bar"></span>
    //       <h3>KNOWLEDGE GROWTH & LEARNING</h3>
    //     </div>

    //     <div className="legend">
    //       <div className="legend-item">
    //         <span className="dot" style={{ background: 'var(--purple)' }}></span> Failure Patterns <span style={{ color: 'var(--purple)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.failurePatterns, 0)}</span>
    //       </div>
    //       <div className="legend-item">
    //         <span className="dot" style={{ background: 'var(--cyan)' }}></span> Diagnostic Rules <span style={{ color: 'var(--cyan)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.diagnosticRules, 0)}</span>
    //       </div>
    //       <div className="legend-item">
    //         <span className="dot" style={{ background: 'var(--amber)' }}></span> Auto-resolved <span style={{ color: 'var(--amber)' }}>{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.autoResolvedPercent, 0) / 8}%</span>
    //       </div>
    //       <button className="trend-btn">8-week trend</button>
    //     </div>
    //   </div>
    //   <div className="kg-container">

    //     {/* LEFT */}
    //     <div className="kg-left">
    //       <HighchartsReact highcharts={Highcharts} options={knowledgeGrowthOptions} />
    //     </div>

    //     {/* RIGHT PANEL */}
    //     <div className="kg-right">
    //       <div className="kg-milestone-card">
    //         <div className="kg-milestone-header">
    //           <div className="kg-milestone-bar"></div>
    //           <span className="kg-milestone-title">L3 Milestone Progress</span>
    //         </div>
    //         <div className="kg-milestone-body">

    //           <div className="kg-milestone-item">
    //             <div className="kg-milestone-row">
    //               <span className="kg-milestone-label">Pattern repo ≥ {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
    //               <span className="kg-milestone-value kg-color-purple">{knowledgeGrowthData?.milestoneProgress?.patternRepo.current} / {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
    //             </div>
    //             <div className="kg-progress-track">
    //               <div className="kg-progress-fill kg-fill-purple" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.patternRepo.current / knowledgeGrowthData?.milestoneProgress?.patternRepo.target) * 100}%` }}></div>
    //             </div>
    //           </div>

    //           <div className="kg-milestone-item">
    //             <div className="kg-milestone-row">
    //               <span className="kg-milestone-label">Auto-resolve ≥ {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}%</span>
    //               <span className="kg-milestone-value kg-color-amber">{knowledgeGrowthData?.milestoneProgress?.autoResolve.current}% / {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}%</span>
    //             </div>
    //             <div className="kg-progress-track">
    //               <div className="kg-progress-fill kg-fill-amber" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.autoResolve.current / knowledgeGrowthData?.milestoneProgress?.autoResolve.target) * 100}%` }}></div>
    //             </div>
    //           </div>

    //           <div className="kg-milestone-item">
    //             <div className="kg-milestone-row">
    //               <span className="kg-milestone-label">Avg confidence ≥ {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
    //               <span className="kg-milestone-value kg-color-amber">{knowledgeGrowthData?.milestoneProgress?.avgConfidence.current}% / {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
    //             </div>
    //             <div className="kg-progress-track">
    //               <div className="kg-progress-fill kg-fill-amber" style={{ width: `${(knowledgeGrowthData?.milestoneProgress?.avgConfidence.current / knowledgeGrowthData?.milestoneProgress?.avgConfidence.target) * 100}%` }}></div>
    //             </div>
    //           </div>

    //           <div className="kg-milestone-footer">
    //             <span className="kg-feedback-label">Feedback loop</span>
    //             <span className={`kg-active-badge ${knowledgeGrowthData?.milestoneProgress?.feedbackLoopStatus.toLowerCase() === "active" ? "kg-online" : "kg-offline"}`}>
    //               <span className="kg-active-dot"></span>  
    //             </span>
    //           </div>

    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="panel">
      <div className="ph">
        <div className="ph-title">
          <div className="ph-bar green"></div>Knowledge Growth &amp; Learning
        </div>
        <div className="kg-stats-row">
          <div className="kg-stat">
            <div className="kg-dot kg-dot-purple"></div>
            <div className="kg-lbl">Failure Patterns</div>
            <div className="kg-val kg-val-purple">{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.failurePatterns, 0)}
            </div>
          </div>
          <div className="kg-stat">
            <div className="kg-dot kg-dot-cyan"></div>
            <div className="kg-lbl">Diagnostic Rules</div>
            <div className="kg-val kg-val-cyan">{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.diagnosticRules, 0)}
            </div>
          </div>
          <div className="kg-stat">
            <div className="kg-dot kg-dot-amber"></div>
            <div className="kg-lbl">Auto-resolved</div>
            <div className="kg-val kg-val-amber">{knowledgeGrowthData?.timelineData?.reduce((acc, item) => acc + item.autoResolvedPercent, 0) / 8}%
            </div>
          </div>
          <div className="ph-tag">8-week trend</div>
        </div>
      </div>
      <div className="pb">
        <div className="kg-grid-layout">
          <div className="kg-chart-wrap">
            <HighchartsReact highcharts={Highcharts} options={knowledgeGrowthOptions} />
          </div>

          <div className="kg-progress-panel">
            <div className="kg-progress-panel-header">
              <div className="kg-progress-panel-bar">
              </div>
              <span className="kg-progress-panel-title">L3
                Milestone Progress</span>
            </div>

            <div className="kg-progress-panel-body">

              <div>
                <div className="kg-progress-row-header">
                  <span className="kg-progress-label">Pattern repo ≥ {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
                  <span className="kg-progress-value-purple">{knowledgeGrowthData?.milestoneProgress?.patternRepo.current} / {knowledgeGrowthData?.milestoneProgress?.patternRepo.target}</span>
                </div>
                <div className="kg-progress-bar-track">
                  <div
                    className="kg-progress-bar-fill-purple" style={{ width: `${knowledgeGrowthData?.milestoneProgress?.patternRepo.current / knowledgeGrowthData?.milestoneProgress?.patternRepo.target * 100}%` }}>
                  </div>
                </div>
              </div>

              <div>
                <div className="kg-progress-row-header">
                  <span className="kg-progress-label">Auto-resolve ≥ {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}</span>
                  <span className="kg-progress-value-amber">{knowledgeGrowthData?.milestoneProgress?.autoResolve.current}% / {knowledgeGrowthData?.milestoneProgress?.autoResolve.target}%</span>
                </div>
                <div className="kg-progress-bar-track">
                  <div
                    className="kg-progress-bar-fill-amber" style={{ width: `${knowledgeGrowthData?.milestoneProgress?.autoResolve.current / knowledgeGrowthData?.milestoneProgress?.autoResolve.target * 100}%` }}>
                  </div>
                </div>
              </div>

              <div>
                <div className="kg-progress-row-header">
                  <span className="kg-progress-label">Avg confidence ≥ {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
                  <span className="kg-progress-value-amber">{knowledgeGrowthData?.milestoneProgress?.avgConfidence.current}% / {knowledgeGrowthData?.milestoneProgress?.avgConfidence.target}%</span>
                </div>
                <div className="kg-progress-bar-track">
                  <div
                    className="kg-progress-bar-fill-amber" style={{ width: `${knowledgeGrowthData?.milestoneProgress?.avgConfidence.current / knowledgeGrowthData?.milestoneProgress?.avgConfidence.target * 100}%` }}>
                  </div>
                </div>
              </div>

              <div className="kg-progress-footer">
                <span className="kg-progress-footer-label">Feedback loop</span>
                <span className="kg-progress-badge">
                  <span className="kg-progress-badge-dot"></span>{knowledgeGrowthData?.milestoneProgress?.feedbackLoopStatus}
                  ✓
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
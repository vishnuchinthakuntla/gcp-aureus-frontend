import React, { useState, useCallback } from 'react'

/* ── helper: compute step duration from agent_logs timestamps ── */
function computeDuration(logs) {
  if (!logs || logs.length < 2) return null
  const times = logs.map(l => new Date(l.logged_at).getTime()).filter(t => !isNaN(t))
  if (times.length < 2) return null
  const ms = Math.max(...times) - Math.min(...times)
  if (ms < 1000) return `${ms}ms`
  return `${Math.round(ms / 1000)}s`
}

const ThreadGroup = ({ groupKey, threadData, selectedAgent, isFirst }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState({})
  const [openPanels, setOpenPanels] = useState({ logs: Boolean(isFirst), steps: false })
  const togglePanel = (panel) => setOpenPanels(p => ({ ...p, [panel]: !p[panel] }))

  const toggleCollapse = useCallback(() => { setIsCollapsed(prev => !prev) }, [])
  const toggleLogExpansion = useCallback((id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  /* ════════════════════════════════════════════
     AGENT-SPECIFIC  "Run Detail" card
     ════════════════════════════════════════════ */
  if (selectedAgent) {
    const agentInfo = threadData[selectedAgent] || null
    const agentLogs = (threadData.agent_logs || []).filter(l => l.agent_node === selectedAgent)

    /* nothing to show for this thread */
    if (!agentInfo && agentLogs.length === 0) return null

    const runDate = threadData.run_date
    const dateLabel = runDate
      ? new Date(runDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : ''
    const timeLabel = agentLogs.length
      ? new Date(agentLogs[0].logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : ''

    const duration = computeDuration(agentLogs)
    const confidence = agentInfo?.confidence
    const confPct = confidence != null ? Math.round(confidence * 100) : null
    const healable = agentInfo?.auto_healable
    const rootCause = agentInfo?.root_cause
    const category = agentInfo?.category
    const actions = agentInfo?.recommended_actions || []

    /* decision-agent fallback fields */
    const action = agentInfo?.action
    const reasoning = agentInfo?.reasoning
    const priority = agentInfo?.priority
    const businessImpact = agentInfo?.business_impact

    return (
      <div className="agent-run-card">
        {/* ── Card Header ── */}
        <div className="arc-header">
          <div className="arc-header-left">
            <span className="arc-date">{dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}</span>
            {duration && <span className="arc-duration">{duration} duration</span>}
          </div>
          <div className="arc-header-right">
            {confPct != null && (
              <>
                <span className="arc-conf-label">Confidence</span>
                <div className="arc-conf-bar">
                  <div
                    className="arc-conf-fill"
                    style={{
                      width: `${confPct}%`,
                      background: confPct >= 70 ? '#10d9a0' : confPct >= 40 ? '#f5a524' : '#e02d46',
                    }}
                  />
                </div>
                <span className="arc-conf-val" style={{ color: confPct >= 70 ? '#10d9a0' : confPct >= 40 ? '#f5a524' : '#e02d46' }}>
                  {confidence}
                </span>
              </>
            )}
            {healable != null && (
              <span className={`arc-heal-badge ${healable ? 'healable' : 'not-healable'}`}>
                {healable ? 'Healable' : 'Not healable'}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="arc-body">
          {/* RCA-specific fields */}
          {rootCause && (
            <>
              <div className="arc-section-label">ROOT CAUSE</div>
              <div className="arc-root-cause">
                <span className="arc-rc-text">{rootCause}</span>
                {category && <span className="arc-cat-badge">{category}</span>}
              </div>
            </>
          )}

          {/* Decision-agent fallback */}
          {!rootCause && action && (
            <>
              <div className="arc-section-label">DECISION</div>
              <div className="arc-root-cause">
                <span className="arc-rc-text" style={{ textTransform: 'capitalize' }}>{action}</span>
                {priority && <span className="arc-cat-badge">{priority}</span>}
              </div>
              {reasoning && <div className="arc-reasoning">{reasoning}</div>}
              {businessImpact && (
                <>
                  <div className="arc-section-label" style={{ marginTop: '12px' }}>BUSINESS IMPACT</div>
                  <div className="arc-reasoning">{businessImpact}</div>
                </>
              )}
            </>
          )}

          {/* Recommended Actions */}
          {actions.length > 0 && (
            <>
              <div className="arc-section-label">RECOMMENDED ACTIONS</div>
              <ol className="arc-actions-list">
                {actions.map((a, i) => (
                  <li key={i}>
                    <span className="arc-action-num">{i + 1}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Show internal steps */}
          {agentLogs.length > 0 && (
            <>
              <button className="arc-steps-toggle" onClick={() => togglePanel('steps')}>
                {openPanels.steps ? '▲' : '▼'} {openPanels.steps ? 'Hide' : 'Show'} internal steps
              </button>

              {openPanels.steps && (
                <div className="arc-steps">
                  {agentLogs.map((log, i) => {
                    const level = (log.level || 'info').toLowerCase()
                    const isError = level === 'error' || level === 'critical'
                    const time = new Date(log.logged_at).toLocaleTimeString()
                    const id = log.log_id || `${groupKey}-${i}`
                    const isExpanded = !!expandedLogs[id]

                    let agentColorVar = 'var(--text-primary)'
                    let agentBgVar = 'var(--bg-elevated)'
                    const nodeLower = (log.agent_node || '').toLowerCase()
                    if (nodeLower.includes('observer')) { agentColorVar = 'var(--observer)'; agentBgVar = 'var(--observer-lt)' }
                    else if (nodeLower.includes('rca')) { agentColorVar = 'var(--rca)'; agentBgVar = 'var(--rca-lt)' }
                    else if (nodeLower.includes('decision')) { agentColorVar = 'var(--decision)'; agentBgVar = 'var(--decision-lt)' }
                    else if (nodeLower.includes('heal') || nodeLower.includes('ticket')) { agentColorVar = 'var(--healing)'; agentBgVar = 'var(--healing-lt)' }
                    else if (nodeLower.includes('quality')) { agentColorVar = 'var(--quality)'; agentBgVar = 'var(--quality-lt)' }
                    else if (nodeLower.includes('gov')) { agentColorVar = 'var(--governance)'; agentBgVar = 'var(--governance-lt)' }

                    return (
                      <div
                        key={id}
                        className="tl-row"
                        style={{ borderLeft: `2px solid ${agentColorVar}`, marginBottom: '2px' }}
                        onClick={() => toggleLogExpansion(id)}
                      >
                        <span
                          className={isError ? 'err-badge' : 'badge'}
                          style={!isError ? { color: agentColorVar, backgroundColor: agentBgVar, border: `1px solid ${agentColorVar}` } : {}}
                        >
                          {log.agent_node}
                        </span>
                        <span className={`tl-msg ${isExpanded ? 'expanded' : ''}`} title={!isExpanded ? log.message : ''}>
                          {log.message}
                        </span>
                        <span className="tl-time">{time}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════
     ALL-AGENTS view — with per-thread Logs / Steps tab
     ════════════════════════════════════════════ */
  const groupLogs = threadData.agent_logs || []
  const steps = threadData.steps || []
  const agent_steps = threadData.agent_steps || []

  /* hide thread entirely if nothing to show */
  if (groupLogs.length === 0 && steps.length === 0) return null

  /* ── step helpers (inline) ── */
  const getStepStatusClass = (status) => {
    if (!status) return 'not-executed'
    const s = status.toLowerCase()
    if (s.includes('succe') || s.includes('completed')) return 'succeeded'
    if (s.includes('fail')) return 'failed'
    if (s.includes('running') || s.includes('progress')) return 'running'
    return 'not-executed'
  }

  const getStepIcon = (status) => {
    switch (getStepStatusClass(status)) {
      case 'succeeded': return '✓'
      case 'failed': return '✗'
      case 'running': return '⟳'
      default: return '○'
    }
  }

  const formatCompletedAt = (completedObj) => {
    if (!completedObj) return null
    return { date: completedObj.date || '', time: completedObj.time || '' }
  }

  return (
    <>
      <div className="run-header" onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
        <div className="run-dot" />
        <div className="run-name">Thread: {groupKey}</div>
        <div className="run-status">
          {groupLogs.length} events
          <span style={{ marginLeft: '8px', fontSize: '9px', opacity: 0.7, paddingBottom: '2px', display: 'inline-block' }}>
            {isCollapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="ph-collapsible-panels">
            <div className={`ph-collapsible-panel ${openPanels.logs ? 'open' : ''}`}>
              <button className="ph-collapsible-header" onClick={() => togglePanel('logs')}>
                <span>AGENT STEPS</span>
                <span className="ph-collapsible-icon">{openPanels.logs ? '▲' : '▼'}</span>
              </button>

              {openPanels.logs && (<div className="ph-collapsible-body" >
                {/* <div className="modal-section-title">Pipeline Stages</div> */}
                <div className="steps-section" data-theme="light">
                  <div className="steps-pipeline modal-pipeline-strip">
                    {agent_steps &&
                      agent_steps.map((stage, i) => {
                        const statusLower = stage.status
                          ? stage.status.toLowerCase()
                          : "idle";
                        const state =
                          statusLower === "completed"
                            ? "done"
                            : statusLower === "in_progress" ||
                              statusLower === "breached"
                              ? "active"
                              : "idle";

                        return (
                          <React.Fragment key={i}>
                            <div className="ps-node">
                              <div className="ps-dot-wrap">
                                <div className={`ps-dot ${state}`}>
                                  {state === "completed"
                                    ? "✓"
                                    : stage.stage_name
                                      ? stage.stage_name[0]
                                      : ""}
                                </div>
                                <div className={`ps-label ${state}`}>
                                  {stage.stage_name}
                                </div>
                                <div className={`ps-time ${state}`}>
                                  {stage.total_duration || "00:00"}
                                </div>
                              </div>
                            </div>
                            {i < agent_steps.length - 1 && (
                              <div className="ps-arrow">›</div>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div> </div> </div>
                // Logs section
                /* <div className="ph-collapsible-body">
                 {groupLogs.map((log, i) => {
                   const level = (log.level || "info").toLowerCase()
                   const isError = level === 'error' || level === 'critical'
                   const time = (new Date(log.logged_at).toLocaleDateString() + ' \t ' + new Date(log.logged_at).toLocaleTimeString())

                   let agentColorVar = 'var(--text-primary)'
                   let agentBgVar = 'var(--bg-elevated)'
                   const nodeLower = (log.agent_node || '').toLowerCase()
                   if (nodeLower.includes('observer')) { agentColorVar = 'var(--observer)'; agentBgVar = 'var(--observer-lt)' }
                   else if (nodeLower.includes('rca')) { agentColorVar = 'var(--rca)'; agentBgVar = 'var(--rca-lt)' }
                   else if (nodeLower.includes('decision')) { agentColorVar = 'var(--decision)'; agentBgVar = 'var(--decision-lt)' }
                   else if (nodeLower.includes('heal') || nodeLower.includes('ticket')) { agentColorVar = 'var(--healing)'; agentBgVar = 'var(--healing-lt)' }
                   else if (nodeLower.includes('quality')) { agentColorVar = 'var(--quality)'; agentBgVar = 'var(--quality-lt)' }
                   else if (nodeLower.includes('gov')) { agentColorVar = 'var(--governance)'; agentBgVar = 'var(--governance-lt)' }

                   const id = log.log_id || `${groupKey}-${i}`
                   const isExpanded = !!expandedLogs[id]

                   return (
                     <div key={id} className="tl-row" style={{ borderLeft: `2px solid ${agentColorVar}`, marginBottom: '2px' }} onClick={() => toggleLogExpansion(id)}>
                       <span
                         className={isError ? "err-badge" : "badge"}
                         style={!isError ? { color: agentColorVar, backgroundColor: agentBgVar, border: `1px solid ${agentColorVar}` } : {}}
                       >
                         {log.agent_node}
                       </span>
                       <span className={`tl-msg ${isExpanded ? 'expanded' : ''}`} title={!isExpanded ? log.message : ''}>
                         {log.message}
                       </span>
                       <span className="tl-time">{time}</span>
                     </div>
                   )
                 })}
               </div> */
              )}
            </div>

            {steps.length > 0 && (
              <div className={`ph-collapsible-panel ${openPanels.steps ? 'open' : ''}`}>
                <button className="ph-collapsible-header" onClick={() => togglePanel('steps')}>
                  <span>PIPELINE STEPS</span>
                  <span className="ph-collapsible-icon">{openPanels.steps ? '▲' : '▼'}</span>
                </button>

                {openPanels.steps && (
                  <div className="ph-collapsible-body">
                    <div className="steps-section" data-theme="light">
                      {/* <div className="steps-header">
                        <h3>Pipeline Steps</h3>
                        <div className="steps-meta">
                          <span className="steps-count">{steps.length} steps</span>
                        </div>
                      </div> */}

                      <div className="steps-pipeline">
                        {steps.map((step, i) => {
                          const cls = getStepStatusClass(step.status)
                          const completed = formatCompletedAt(step.completed_at)
                          return (
                            <React.Fragment key={i}>
                              <div className={`step-node ${cls}`}>
                                <span className="step-number">{i + 1}</span>
                                <div className="step-icon">{getStepIcon(step.status)}</div>
                                <div className="step-info">
                                  <span className="step-name">{step.step_name || step.step}</span>
                                  <span className={`step-status ${cls}`}>{step.status}</span>
                                  {step.wall_time && (
                                    <span className="step-time">⏱ {step.wall_time}</span>
                                  )}
                                  {completed && (
                                    <div className="step-completed-group">
                                      <span className="step-completed-date">{completed.date}</span>
                                      {completed.time && (
                                        <span className="step-completed-time">{completed.time}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`step-connector ${cls}`} />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default React.memo(ThreadGroup)

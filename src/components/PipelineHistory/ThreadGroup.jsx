import React, { useState, useCallback } from 'react'

const ThreadGroup = ({ groupKey, threadData }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState({})

  const groupLogs = threadData.agent_logs || []
  if (groupLogs.length === 0) return null

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const toggleLogExpansion = useCallback((id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

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
      {!isCollapsed && groupLogs.map((log, i) => {
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
    </>
  )
}

export default React.memo(ThreadGroup)

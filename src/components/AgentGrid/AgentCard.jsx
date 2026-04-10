import React from 'react'
import useAgentStore from '../../stores/useAgentStore';

const AgentCard = ({ agent }) => {

  const selectAgent = useAgentStore(s => s.selectAgent );
  const selectedAgent = useAgentStore(s => s.selectedAgent );
  const { label, count, icon, bg, borderColor, numColor, status = 'idle', active = 0, processed = 0, carClass } = agent

  return (
    <div
      className={`score-card ${carClass} ${selectedAgent === agent.id ? 'active' : ''}`}
      onClick={() => selectAgent(agent.id === selectedAgent ? null : agent.id)}
      aria-pressed={agent.id === selectedAgent}
    >
      <span className="card-icon">{icon}</span>
      <div className="score-label">{label}</div>
      <div className="score-value" style={{ color: numColor }}>{agent.id === "selfservice" || agent.id === "governance" ? "" : count}</div>
      {agent.id !== "selfservice" && agent.id !== "governance" && <div className="agent-card__status">
        <span className={`agent-card__status-dot agent-card__status-dot--${status}`} />
        {active > 0 ? `${active} ACTIVE` : processed > 0 ? `${processed} DONE` : 'IDLE'}
      </div> }
    </div>
  )
}



export default AgentCard
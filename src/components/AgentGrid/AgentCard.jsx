import React from 'react'

const AgentCard = ({ agent, selected, onClick }) => {
  const { label, count, icon, bg, borderColor, numColor, status = 'idle', active = 0, processed = 0, carClass } = agent

  return (
    <div
      className={`score-card ${carClass} ${selected ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="card-icon">{icon}</span>
      <div className="score-label">{label}</div>
      <div className="score-value" style={{ color: numColor }}>{count}</div>
      {/* <div className="agent-card__status">
        <span className={`agent-card__status-dot agent-card__status-dot--${status}`} />
        {active > 0 ? `${active} ACTIVE` : processed > 0 ? `${processed} DONE` : 'IDLE'}
      </div> */}
    </div>
  )
}



export default AgentCard
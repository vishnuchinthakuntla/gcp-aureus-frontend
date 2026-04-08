import React from 'react'
import AgentCard from './AgentCard'
import useAgentStore from '../../stores/useAgentStore'
import './AgentGrid.css'

const AgentGrid = () => {
  const agents = useAgentStore(s => s.agents)

 return (
  <div className="score-grid" role="tablist" aria-label="Agent selector">
    {agents
      .filter(agent => agent.id !== 'approval') // 👈 hide approval
      .map(agent => (
        <AgentCard
          key={agent.id}
          agent={agent}
        />
      ))}
  </div>
);
}

export default AgentGrid
import React, { useEffect, useState } from 'react'
import Header from './components/Header/Header'
import AgentGrid from './components/AgentGrid/AgentGrid'
import AgentPanel from './components/AgentPanel/AgentPanel'
import useAgentStore from './stores/useAgentStore'
import Sidebar from './components/Sidebar/Sidebar'
import PipelinesBar from './components/PipelinesBar/PipelinesBar'
import TicketsTable from './components/TicketsTable/TicketsTable'
import TicketsDrawer from './components/TicketsTable/TicketsDrawer'
import Charts from './components/Charts/Charts'
import Ticker from './components/Ticker'
import './App.css'

const App = () => {
  const init = useAgentStore(s => s.init)
  const destroy = useAgentStore(s => s.destroy)
  const selectedAgent = useAgentStore(s => s.selectedAgent)
  const selectedTicket = useAgentStore(s => s.selectedTicket)
  const agents = useAgentStore(s => s.agents)
  const selectAgent = useAgentStore(s => s.selectAgent)
  const closePanel = useAgentStore(s => s.closePanel)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    init()
    return () => destroy()
  }, [init, destroy])

  const agent = agents.find(a => a.id === selectedAgent)

  return (
    <div className="app">
      <Header open={isOpen} onMenuToggle={() => setIsOpen(!isOpen)} />
      <Sidebar open={isOpen} onClickAgent={selectAgent} />

      <main className={`main${isOpen ? ' shifted' : ''}`}>
        <PipelinesBar />

        <Ticker />
        <AgentGrid
          selectedId={selectedAgent}
          onSelect={(id) => selectAgent(selectedAgent === id ? null : id)}
        />

        {selectedAgent && agent ? (
          <AgentPanel
            agentId={selectedAgent}
            agentLabel={agent.label}
            agentIcon={agent.icon}
            isActive={agent.status === 'active'}
            onClose={closePanel}
          />
        ) : (
          <TicketsTable />
        )}

        {selectedTicket && <TicketsDrawer />}

        <Charts />
      </main>
    </div>
  )
}

export default App
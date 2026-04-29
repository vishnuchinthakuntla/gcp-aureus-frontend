import React, { useEffect, useRef } from 'react'
import AgentGrid from '../components/AgentGrid/AgentGrid'
import AgentPanel from '../components/AgentPanel/AgentPanel'
import useAgentStore from '../stores/useAgentStore'
import PipelinesBar from '../components/PipelinesBar/PipelinesBar'
import TicketsTable from '../components/TicketsTable/TicketsTable'
import TicketsDrawer from '../components/TicketsTable/TicketsDrawer'
import Charts from '../components/Charts/Charts'
import Ticker from '../components/Ticker'
import PipelinesTable from '../components/Pipeline/PipelinesTable';
import '../App.css'

const Dashboard = () => {
  const selectedAgent = useAgentStore(s => s.selectedAgent)
  const selectedTicket = useAgentStore(s => s.selectedTicket)
  const agents = useAgentStore(s => s.agents)

  const agent = agents.find(a => a.id === selectedAgent)

  return (
    <>
        <PipelinesBar />
        <Ticker />

        <AgentGrid />

        {selectedAgent && agent ? (
          <AgentPanel />
        ) : selectedAgent === "pipelines" && (
          <PipelinesTable />
        )}

        <TicketsTable />

        {selectedTicket && <TicketsDrawer />}
        <Charts />
    </>
  )
}

export default Dashboard
import { AGENTS } from "../../constants/agents";
import './Sidebar.css';
import {
    LayoutDashboard,
    Eye,
    Search,
    Brain,
    Wrench,
    CheckCircle,
    MessageSquare,
    Shield
} from 'lucide-react';
import useAgentStore from '../../stores/useAgentStore';
import React from 'react';

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const ICON_MAP = {
    'observer': Eye,
    'rca': Search,
    'decision': Brain,
    'selfhealing': Wrench,
    'dataquality': CheckCircle,
    'selfservice': MessageSquare,
    'governance': Shield,
    'approval': CheckCircle,
};

export default function Sidebar({ open }) {

    const selectAgent = useAgentStore((s) => s.selectAgent);
    const selectedAgent = useAgentStore((s) => s.selectedAgent);

    return (
        <aside className={`sidebar${open ? ' open' : ''}`}>
            <button onClick={() => selectAgent(null)}>
                <LayoutDashboard size={18} />
                Overview
            </button>

            <div className="sidebar-section">Agents</div>

            {AGENTS.map((agent) => {
                const Icon = ICON_MAP[agent.id] || Eye;
                return (
                    <button
                        key={agent.id}
                        onClick={() => selectAgent(agent.id === selectedAgent ? null : agent.id)}
                    >
                        {/* <Icon className={`icon ${agent.id}`} size={18} /> */}
                        <span className="icon">{agent.icon}</span>
                        {toTitleCase(agent.label)}
                    </button>

                    
                );
            })}
             {/* <div className="sidebar-section">Admin</div>

            <button onClick={() => selectAgent("pipelines")}>
                <span className="icon">🚀</span>
                Pipelines
            </button> */}
        </aside>
    );
}

import React from 'react';
import { formatElapsedTime } from '../utils';
import './Ticker.css';
import useAgentStore from '../stores/useAgentStore';


function Ticker() {
    const allTickets = useAgentStore((s) => s.header.ticketsData);

    const PRIO_RANK = { P1: 1, P2: 2, P3: 3, P4: 4 };

    function getTopTickets(tickets, count = 5) {
        if (!tickets || tickets.length === 0) return [];
        return [...tickets]
            .sort((a, b) => {
                const prioA = PRIO_RANK[a.severity] ?? 99;
                const prioB = PRIO_RANK[b.severity] ?? 99;
                if (prioA !== prioB) return prioA - prioB;
                // older ticket first (earlier created_at = smaller timestamp)
                return new Date(a.created_at) - new Date(b.created_at);
            })
            .slice(0, count);
    }

    const tickerTickets = getTopTickets(allTickets, 5);
    

    if (!tickerTickets || tickerTickets.length === 0) {
        return (
            <div className="ticker-wrap">
                <div className="ticker-scroll-zone">
                    <div className="ticker-inner">
                        <span className="ticker-event" style={{ paddingLeft: 500, color: '#2563eb' }}>
                            No Open P1/P2 Tickets
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ticker-wrap">
            <div className="ticker-scroll-zone">
                <div className="ticker-inner">
                    {tickerTickets.map((ticket, i) => {
                          console.log("TICKET DATA:", ticket); 
                        const isP1 = ticket.severity === 'P1';
                        const priorityClass = isP1 ? 'p1-event' : 'p2-event';
                        const dotColor = isP1 ? '#f43f5e' : '#f59e0b';
                        const agingClass = ticket.sla_breach === 'YES' ? 'aging-crit' : 'aging-warn';
                        return (
                            <span key={`a-${i}`} className={`ticker-event ${priorityClass}`}>
                                <span className="dot" style={{ background: dotColor }}></span>
                                <b>{ticket.title}</b>({ticket.severity})
                                <span className={`aging-badge ${agingClass}`}>
                                    ⏱ {formatElapsedTime(ticket.created_at)}
                                </span>
                                Owner: {ticket.assigned_to || 'Unassigned'}
                            </span>
                        );
                    })}
                    {tickerTickets.map((ticket, i) => {
                        const isP1 = ticket.severity === 'P1';
                        const priorityClass = isP1 ? 'p1-event' : 'p2-event';
                        const dotColor = isP1 ? '#f43f5e' : '#f59e0b';
                        const agingClass = ticket.sla_breach === 'YES' ? 'aging-crit' : 'aging-warn';
                        return (
                            <span key={`b-${i}`} className={`ticker-event ${priorityClass}`}>
                                <span className="dot" style={{ background: dotColor }}></span>
                                <b>{ticket.title}</b>({ticket.severity})
                                <span className={`aging-badge ${agingClass}`}>
                                    ⏱ {formatElapsedTime(ticket.created_at)}
                                </span>
                               Owner: {ticket.assigned_to ?? 'Unassigned'}
                            </span>
                            
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default React.memo(Ticker);

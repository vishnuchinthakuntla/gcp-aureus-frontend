import React from 'react'
import useAgentStore from '../../stores/useAgentStore'
import './PipelinesBar.css'

/* ── sub-components ── */

const TicketBadge = ({ label, count, border_color, num_color, pill_class }) => {
    const setActiveFilter = useAgentStore(s => s.setActiveFilter)

    return (
        <div className={`p-pill ${pill_class === 'SLA Breach' ? 'sla-pill' : pill_class === 'Human' ? 'p1-human' : `${pill_class.toLowerCase()}-pill`}`} onClick={() => setActiveFilter(label === 'SLA Breach' ? 'SLA' : label === 'Human' ? 'HUMAN' : label)}>
            <span className="p-label">{label}</span>
            <span className="p-count" style={{ color: num_color }}>{count}</span>
        </div>
    )
}

const StatBox = ({ value, label, color }) => (
    <div className="stat-box">
        <div className="stat-box__value" style={{ color }}>{value}</div>
        <div className="stat-box__label">{label}</div>
    </div>
)

/* ── Transform store data → component shape ── */

function buildTicketBadges(tickets) {
    return [
        { label: 'P1', count: tickets.P1 ?? 0 },
        { label: 'P2', count: tickets.P2 ?? 0 },
        { label: 'P3', count: tickets.P3 ?? 0 },
        { label: 'P4', count: tickets.P4 ?? 0 },
        { label: 'SLA Breach', count: tickets.sla_breach ?? 0 },
        { label: 'Human', count: tickets.human ?? 0 },
    ]
}

function PipelinesBar() {

    const tickets = useAgentStore(s => s.header.tickets)
    const pipeline = useAgentStore(s => s.header.pipeline)
    const info = useAgentStore(s => s.header.info)

    const ticketBadges = buildTicketBadges(tickets)

    return (
        <>
            {/* tickets + pipeline bar */}
            <div className='page-header'>
                <div className='page-header-left'>
                    <div className="ticker-counts">
                        <span className="ticker-counts-label">Tickets</span>

                        {ticketBadges.map(t => <TicketBadge pill_class={t.label} key={t.label} {...t} />)}

                    </div>
                </div>

                <div className="ph-pipeline">
                    <div className="ph-pl-title">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div>{info.date}</div>
                            <div>Pipeline Run Summary</div>
                        </div>
                        <div className="ph-pl-sep"></div>
                        <div className="ph-pl-cards">
                            <div className="ph-pl-card ph-pl-done">
                                <div className="ph-pl-val">{pipeline.succeeded}</div>
                                <div className="ph-pl-lbl">COMPLETED</div>
                            </div>
                            <div className="ph-pl-sep"></div>
                            <div className="ph-pl-card ph-pl-total">
                                <div className="ph-pl-val">{pipeline.total}</div>
                                <div className="ph-pl-lbl">TOTAL</div>
                            </div>
                            <div className="ph-pl-sep"></div>
                            <div className="ph-pl-card ph-pl-rem">
                                <div className="ph-pl-val">{pipeline.remaining}</div>
                                <div className="ph-pl-lbl">REMAINING</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PipelinesBar

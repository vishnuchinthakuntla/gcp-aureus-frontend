import useAgentStore from "../../stores/useAgentStore";
import './AgentPanel.css';
import React from "react";  

export default function GovernancePanel() {
    const selectedAgent = useAgentStore((s) => s.selectedAgent);
    const selectAgent = useAgentStore((s) => s.selectAgent);

    return (
        <div className={`agent-panel card-governance${selectedAgent === 'governance' ? ' visible' : ''}`} style={{ display: selectedAgent === 'governance' ? 'block' : 'none' }}>
            <div className="panel-header">
                <span style={{ fontSize: 22 }}>🛡️</span>
                <div className="panel-title">Governance Agent</div>
                <span className="panel-badge">ALERT</span>
                <div className="panel-close" onClick={() => selectAgent(null)}>✕</div>
            </div>
            <div className="panel-grid">
                <div className="panel-col">
                    <div className="col-header"><h3>Policy Violations</h3><span className="col-count">2</span></div>
                    <div className="col-body">
                        <div className="feed-item">
                            <div className="feed-name">Retention &gt; 90d · PL_AUDIT</div>
                            <div className="feed-meta"><span className="badge b-failed">VIOLATION</span><span className="feed-time">GOV-601</span></div>
                        </div>
                        <div className="feed-item">
                            <div className="feed-name">PII Exposure · PL_CRM</div>
                            <div className="feed-meta"><span className="badge b-failed">CRITICAL</span><span className="feed-time">GOV-603</span></div>
                        </div>
                    </div>
                </div>
                <div className="panel-col">
                    <div className="col-header"><h3>Under Review</h3><span className="col-count">1</span></div>
                    <div className="col-body">
                        <div className="feed-item">
                            <div className="feed-name">Drift Detected · GOV Policy v2.3</div>
                            <div className="feed-meta"><span className="badge b-review">REVIEWING</span><span className="feed-time">GOV-605</span></div>
                        </div>
                    </div>
                </div>
                <div className="panel-col">
                    <div className="col-header"><h3>Compliant</h3><span className="col-count">2</span></div>
                    <div className="col-body">
                        <div className="feed-item">
                            <div className="feed-name">GDPR Check · PL_FINANCE · OK</div>
                            <div className="feed-meta"><span className="badge b-completed">COMPLIANT</span><span className="feed-time">10:10 AM</span></div>
                        </div>
                        <div className="feed-item">
                            <div className="feed-name">Access Audit · SVC_AUTH · OK</div>
                            <div className="feed-meta"><span className="badge b-completed">COMPLIANT</span><span className="feed-time">09:55 AM</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import './AnalysisModal.css';

export default function AnalysisModal({ threadId, agentType, onClose }) {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!threadId || !agentType) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dkb/history/${threadId}?agent=${agentType}`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          setAgentData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [threadId, agentType]);

  const title = agentType === 'rca' ? 'RCA Agent Thread' : agentType === 'decision' ? 'Decision Agent Thread' : 'Agent Thread';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="am-loader-container">
          <div className="am-spinner"></div>
          <div style={{marginTop: '12px', fontSize: '13px', color: '#64748b'}}>Loading analysis...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="am-error-container">
          <div style={{color: '#e02d46', fontWeight: 600}}>Error loading data</div>
          <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>{error}</div>
        </div>
      );
    }

    if (!agentData) return null;

    const postAnalysis = agentData.post_analysis || agentData;
    const rawHistory = agentData.history || postAnalysis.history;
    
    let historyArray = [];
    let rawHistoryStr = '';
    
    if (Array.isArray(rawHistory)) {
      historyArray = rawHistory;
    } else if (typeof rawHistory === 'string') {
      try {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          historyArray = parsed;
        } else {
          historyArray = Object.values(parsed);
        }
      } catch (e) {
        rawHistoryStr = rawHistory;
      }
    } else if (typeof rawHistory === 'object' && rawHistory !== null) {
      historyArray = Object.values(rawHistory);
    } else if (rawHistory) {
      rawHistoryStr = String(rawHistory);
    }

    return (
      <div className="am-sections">
        {/* Section 1: Post Analysis */}
        <div className="am-section">
          <div className="am-section-title">Post Analysis</div>
          <div className="am-card">
            {agentType === 'rca' && (
              <>
                <div className="am-row">
                  <span className="am-label">Root Cause</span>
                  <span className="am-value highlight">{postAnalysis.root_cause || 'N/A'}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">Category</span>
                  <span className="am-badge">{postAnalysis.category || 'N/A'}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">Confidence</span>
                  <span className="am-value">{postAnalysis.confidence ?? 'N/A'}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">Auto Healable</span>
                  <span className="am-value">{postAnalysis.auto_healable ? "Yes" : "No"}</span>
                </div>
                {postAnalysis.recommended_actions?.length > 0 && (
                  <div className="am-block">
                    <span className="am-label">Recommended Actions</span>
                    <ul className="am-list">
                      {postAnalysis.recommended_actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {agentType === 'decision' && (
              <>
                <div className="am-row">
                  <span className="am-label">Action</span>
                  <span className="am-value capitalize">{postAnalysis.action || 'N/A'}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">Priority</span>
                  <span className="am-badge priority">{postAnalysis.priority || 'N/A'}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">Requires Approval</span>
                  <span className="am-value">{postAnalysis.requires_approval ? "Yes" : "No"}</span>
                </div>
                <div className="am-row">
                  <span className="am-label">SLA Impact</span>
                  <span className="am-value">{postAnalysis.sla_impact ?? 'N/A'}</span>
                </div>
                <div className="am-block">
                  <span className="am-label">Reasoning</span>
                  <div className="am-text">{postAnalysis.reasoning || 'N/A'}</div>
                </div>
                <div className="am-block">
                  <span className="am-label">Business Impact</span>
                  <div className="am-text">{postAnalysis.business_impact || 'N/A'}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: History */}
        {historyArray.length > 0 && (
          <div className="am-section">
            <div className="am-section-title">History ({historyArray.length})</div>
            <div className="am-history-list">
              {historyArray.map((item, idx) => (
                <div className="am-card am-history-card" key={idx}>
                  {agentType === 'rca' && (
                    <>
                      <div className="am-row">
                        <span className="am-label">Pipeline Name</span>
                        <span className="am-value">{item.pipeline_name || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Similarity Score</span>
                        <span className="am-value">{item.similarity_score?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Error Message</span>
                        <span className="am-value">{item.error_message || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Root Cause</span>
                        <span className="am-value highlight">{item.root_cause || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Category</span>
                        <span className="am-badge">{item.category || 'N/A'}</span>
                      </div>
                      {item.recommended_actions?.length > 0 && (
                        <div className="am-block">
                          <span className="am-label">Recommended Actions</span>
                          <ul className="am-list">
                            {item.recommended_actions.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {agentType === 'decision' && (
                    <>
                      <div className="am-row">
                        <span className="am-label">Distance</span>
                        <span className="am-value">{item.distance?.toFixed(4) || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Action Taken</span>
                        <span className="am-value capitalize">{item.action_taken || 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Confidence</span>
                        <span className="am-value">{item.confidence ?? 'N/A'}</span>
                      </div>
                      <div className="am-row">
                        <span className="am-label">Success</span>
                        <span className="am-value">{item.success ? "Yes" : "No"}</span>
                      </div>
                      <div className="am-block">
                        <span className="am-label">Reasoning</span>
                        <div className="am-text">{item.reasoning || 'N/A'}</div>
                      </div>
                      <div className="am-block">
                        <span className="am-label">Business Impact</span>
                        <div className="am-text">{item.business_impact || 'N/A'}</div>
                      </div>
                    </>
                  )}
                  
                  {/* Dynamic fallback for any extra keys not explicitly handled above */}
                  {Object.entries(item).map(([k, v]) => {
                    const handledKeys = ["pipeline_name", "similarity_score", "error_message", "root_cause", "category", "recommended_actions", "distance", "action_taken", "confidence", "success", "reasoning", "business_impact"];
                    if (handledKeys.includes(k)) return null;
                    
                    const label = k.replace(/_/g, ' ');
                    if (typeof v === 'object' && v !== null) {
                      return (
                        <div className="am-block" key={k}>
                          <span className="am-label capitalize">{label}</span>
                          <pre className="am-text" style={{ fontSize: '11px', whiteSpace: 'pre-wrap', margin: 0 }}>
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <div className="am-row" key={k}>
                        <span className="am-label capitalize">{label}</span>
                        <span className="am-value">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {rawHistoryStr && (
          <div className="am-section">
            <div className="am-section-title">History (Raw)</div>
            <div className="am-card">
              <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap', margin: 0 }}>
                {rawHistoryStr}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="am-overlay">
      <div className="am-modal">
        {/* Header */}
        <div className="am-header">
          <div className="am-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div className="am-title-block">
            <div className="am-title">{title}</div>
            <div className="am-subtitle">Thread ID: {threadId || 'N/A'}</div>
          </div>
          <button className="am-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="am-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

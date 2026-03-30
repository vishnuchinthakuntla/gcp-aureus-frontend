import React from 'react'
import useAgentStore from '../../stores/useAgentStore'
import './AgentPanel.css'
import { AGENTS } from '../../constants/agents';
import SelfServicePanel from './SelfServicePanel';
import GovernancePanel from './GovernancePanel';
import ApprovalAgent from './ApprovalAgent';


// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(isoString) {
  if (!isoString) return ''
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 0) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

// ── RunTile ───────────────────────────────────────────────────────────────────

const severityClass = (s) =>
  `run-tile__severity run-tile__severity--${(s || 'unknown').toLowerCase()}`

const RunTile = ({ item }) => {
  const shortId = item.run_id
    ? item.run_id.length > 14 ? '…' + item.run_id.slice(-12) : item.run_id
    : item.thread_id?.slice(-12) || '—'

  const durationLabel = item.duration_ms != null
    ? item.duration_ms < 1000
      ? `${item.duration_ms}ms`
      : `${(item.duration_ms / 1000).toFixed(1)}s`
    : null

  return (
    <div className="run-tile">
      <div className="run-tile__header">
        <span className="run-tile__run-id" title={item.run_id}>{shortId}</span>
        <span className="run-tile__age">{item.age_label || timeAgo(item.created_at)}</span>
      </div>

      <div className="run-tile__pipeline" title={item.pipeline_name}>
        {item.pipeline_name || '—'}
      </div>

      <div className="run-tile__meta">
        <span className={`run-tile__status-dot run-tile__status-dot--${item.status}`} />
        {item.severity && (
          <span className={severityClass(item.severity)}>{item.severity}</span>
        )}
        {item.event_type && (
          <span style={{ fontSize: 9, color: '#aaa' }}>{item.event_type}</span>
        )}
        {durationLabel && (
          <span className="run-tile__duration">⏱ {durationLabel}</span>
        )}
      </div>

      {item.agent_summary && (
        <div className="run-tile__summary">{item.agent_summary}</div>
      )}
    </div>
  )
}

// ── FeedItem ──────────────────────────────────────────────────────────────────

const FeedItem = ({ item }) => {
  const time = item.timestamp
    ? new Date(item.timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    : ''
  return (
    <div className="feed-item">
      <span className={`feed-item__dot feed-item__dot--${item.level || 'info'}`} />
      <span className="feed-item__text">{item.message}</span>
      <span className="feed-item__time">{time}</span>
    </div>
  )
}

// ── Shimmer ───────────────────────────────────────────────────────────────────

const Shimmer = () => (
  <div className="col-body">
    {[80, 55, 70, 45, 65].map((w, i) => (
      <div key={i} className="shimmer" style={{ width: `${w}%` }} />
    ))}
  </div>
)

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ type }) {
  if (type === 'queue') return (
    <div className="empty-state"><div className="empty-emoji">📭</div>
      <div className="empty-title">Queue is Empty</div>
      <div className="empty-sub">Everything is running smoothly.</div></div>
  );
  if (type === 'agent') return (
    <div className="empty-state"><div className="empty-emoji">🤖</div>
      <div className="empty-title">Agent is standing by</div>
      <div className="empty-sub">No active tasks at the moment.</div></div>
  );
  return (
    <div className="empty-state"><div className="empty-emoji">📡</div>
      <div className="empty-title">No Live Feed Available</div>
      <div className="empty-sub">The agent has not reported any recent activity.</div></div>
  );
}

// ── JobList ───────────────────────────────────────────────────────────────────

function JobList({ jobs, agent }) {
  if (!jobs || jobs.length === 0) return <EmptyState type="queue" />;
  return (
    <>
      {jobs.map((job, i) => (
        <div key={job.log_id || i} className="feed-item">
          <div className="feed-name">{job.pipeline_name || job.jobName || job.JobName || '—'}</div>
          <div className="feed-meta">
            <span className={`badge b-${(job.status || 'queued').toLowerCase()}`}>{job.status || 'queued'}</span>
            <span className="feed-time">{toTitleCase(agent)}Id: {job.run_id || job.log_id || job.id || job.Id || '—'}</span>
          </div>
        </div>
      ))}
    </>
  );
}

// ── LiveFeedList ──────────────────────────────────────────────────────────────

function LiveFeedList({ items }) {
  if (!items || items.length === 0) return <EmptyState type="feed" />;
  return (
    <>
      {items.slice(0, 5).map((item, i) => {
        const time = item.timestamp
          ? new Date(item.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
          : '';
        return (
          <div key={item.event_id || i} className="feed-item">
            <div className="feed-name">
              <span className={`feed-live-dot feed-live-dot--${item.level || 'info'}`}></span>
              <span>{item.message || '—'}</span>
            </div>
            <div className="feed-meta">
              <span className={`badge b-${item.level || 'info'}`}>{item.level || 'info'}</span>
              <span className="feed-time">{time}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── AgentPanel ────────────────────────────────────────────────────────────────

function AgentPanel() {

  const panel = useAgentStore(s => s.panel);
  const selectedAgent = useAgentStore(s => s.selectedAgent);
  const selectAgent = useAgentStore(s => s.selectAgent);

  const { queued, inProgress, processed, liveFeed, loading } = panel;
  const config = AGENTS.find((a) => a.id === selectedAgent);
  if (!config) return null;

  const isHealingOrQuality = selectedAgent === 'selfhealing' || selectedAgent === 'dataquality';

  // For healing/quality agents, derive healed/passed and failed counts from processed items
  const processedItems = processed?.items || [];
  const healedCount = processedItems.filter((j) =>
    j.status?.toUpperCase() === 'HEALED' || j.status?.toUpperCase() === 'PASSED'
  ).length;
  const failedCount = processedItems.filter((j) =>
    j.status?.toUpperCase() === 'AUTO_HEAL_FAILED' || j.status?.toUpperCase() === 'FAILED'
  ).length;

  const col2Label = selectedAgent === 'selfhealing' ? 'Healing' : selectedAgent === 'dataquality' ? 'Validating' : 'In Progress';
  const col1Label = selectedAgent === 'dataquality' ? 'Flagged' : 'Queued';
  const col3Label = isHealingOrQuality
    ? `${selectedAgent === 'selfhealing' ? 'Healed' : 'Passed'}(${healedCount}) / Failed(${failedCount})`
    : 'Live Feed';

  if (selectedAgent === 'selfservice') return <SelfServicePanel />
  if (selectedAgent === 'governance') return <GovernancePanel />
  if (selectedAgent === 'approval') return <ApprovalAgent />

  return (
    <div
      className={`agent-panel ${config.carClass}${selectedAgent ? ' visible' : ''}`}
      style={{ display: selectedAgent ? 'block' : 'none' }}
    >
      <div className="panel-header">
        <span style={{ fontSize: 22 }}>{config.icon}</span>
        <div className="panel-title">{config.label}</div>
        <span className="panel-badge">{config.badge}</span>
        <div className="panel-close" onClick={() => selectAgent(null)}>✕</div>
      </div>
      <div className="panel-grid">
        {/* Column 1: Queued / Flagged */}
        <div className="panel-col">
          <div className="col-header">
            <h3>{col1Label}</h3>
            <span className="col-count">{queued?.count ?? 0}</span>
          </div>
          <div className="col-body">
            {loading ? <Shimmer /> : <JobList jobs={queued?.items} agent="alert" />}
          </div>
        </div>

        {/* Column 2: In Progress / Healing / Validating */}
        <div className="panel-col">
          <div className="col-header">
            <h3>{col2Label}</h3>
            <span className="col-count">{inProgress?.count ?? 0}</span>
          </div>
          <div className="col-body">
            {loading
              ? <Shimmer />
              : (inProgress?.items?.length > 0
                ? <JobList jobs={inProgress.items} agent={selectedAgent} />
                : <EmptyState type="agent" />)
            }
          </div>
        </div>

        {/* Column 3: Processed (for healing/quality) or Live Feed */}
        <div className="panel-col">
          <div className="col-header">
            <h3>{col3Label}</h3>
            <span className="col-count">
              {isHealingOrQuality ? (processed?.count ?? 0) : (liveFeed?.count ?? 0)}
            </span>
          </div>
          <div className="col-body">
            {loading
              ? <Shimmer />
              : isHealingOrQuality
                ? (processedItems.length > 0
                  ? <JobList jobs={processedItems} agent={selectedAgent} />
                  : <EmptyState type="agent" />)
                : <LiveFeedList items={liveFeed?.items} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentPanel

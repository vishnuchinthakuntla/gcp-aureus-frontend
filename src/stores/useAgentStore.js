// stores/useAgentStore.js
import { create } from "zustand";
import { AGENTS } from "../constants/agents";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function safeFetch(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

function getWsUrl() {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/events`;
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const seconds = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 1000,
  );
  if (seconds < 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function normalizeItems(items) {
  return (items || []).map((item, idx) => ({
    ...item,
    log_id: item.log_id || item.thread_id || item.run_id || `item-${idx}`,
    age_label: item.age_label || timeAgo(item.created_at || item.logged_at),
    pipeline_name: item.pipeline_name || "",
    status: item.status || "processing",
    severity: item.severity || "",
    event_type: item.event_type || "",
  }));
}

function normalizeFeed(items) {
  return (items || []).map((item, idx) => ({
    ...item,
    event_id: item.event_id || item.log_id || `feed-${idx}-${Date.now()}`,
    timestamp: item.timestamp || item.logged_at,
    level: item.level || "info",
    message: item.message || "",
  }));
}

function mergeAgents(data) {
  if (data?.agents && Array.isArray(data.agents)) {
    return AGENTS.map((sa) => {
      const live = data.agents.find((a) => a.id === sa.id) || {};
      const active = live.active ?? live.count ?? 0;
      const processed = live.processed ?? 0;
      const count = active > 0 ? active : processed; // ← show processed when idle
      return {
        ...sa,
        count,
        active,
        queued: live.queued ?? 0,
        processed,
        status: active > 0 ? "active" : "idle",
      };
    });
  }
  if (data?.items && typeof data.items === "object") {
    return AGENTS.map((sa) => {
      const live = data.items[sa.id] || {};
      const active = live.active ?? 0;
      const processed = live.processed ?? 0;
      const count = active > 0 ? active : processed; // ← show processed when idle
      return {
        ...sa,
        count,
        active,
        queued: live.queued ?? 0,
        processed,
        status: active > 0 ? "active" : "idle",
      };
    });
  }
  return null;
}

// ── WebSocket event types ─────────────────────────────────────────────────────

const AGENT_REFRESH_TYPES = new Set([
  "agent_count_update",
  "agent_update",
  "agent_completed",
  "workflow_started",
  "workflow_completed",
  "workflow_error",
  "approval_request",
]);

const PANEL_REFRESH_TYPES = new Set([
  "agent_count_update",
  "agent_update",
  "agent_completed",
  "live_feed_entry",
  "workflow_completed",
  "workflow_error",
  "workflow_started",
]);

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_AGENTS = AGENTS.map((a) => ({
  ...a,
  active: 0,
  queued: 0,
  processed: 0,
  status: a.count > 0 ? "active" : "idle",
}));

const EMPTY_PANEL = {
  queued: { count: 0, items: [] },
  inProgress: { count: 0, items: [] },
  processed: { count: 0, items: [] },
  liveFeed: { count: 0, items: [] },
  loading: false,
};

const INITIAL_HEADER = {
  pipeline: {
    total: 0,
    succeeded: 0,
    failed: 0,
    running: 0,
    remaining: 0,
    pending_approval: 0,
    sla_breached: 0,
  },
  tickets: { P1: 0, P2: 0, P3: 0, P4: 0, total: 0, sla_breach: 0, human: 0 },
  ticketsData: [],
  info: { date: "", agent_count: 7, is_live: false, last_refresh: "" },
};

// ══════════════════════════════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════════════════════════════

const useAgentStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────

  agents: INITIAL_AGENTS,
  selectedAgent: null,
  panel: EMPTY_PANEL,
  header: INITIAL_HEADER,
  wsConnected: false,
  eventLog: [],
  selectedTicket: null,
  activeFilter: "all",
  approvals: [],

  // Internal refs (not reactive)
  _ws: null,
  _retryTimer: null,
  _fetchAgentsTimer: null,
  _fetchPanelTimer: null,

  // ── Filter ──────────────────────────────────────────────────────────

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },

  // ── Ticket Drawer ───────────────────────────────────────────────────────────

  openTicketDrawer: (ticket) => {
    set({ selectedTicket: ticket });
  },

  closeTicketDrawer: () => {
    set({ selectedTicket: null });
  },

  // ── Agent Cards ───────────────────────────────────────────────────────────

  fetchAgents: async () => {
    const data = await safeFetch("/api/agents", null);
    if (!data) return;
    const merged = mergeAgents(data);
    if (merged) set({ agents: merged });
  },

  // ── Agent Panel (Kanban) — single call ────────────────────────────────────

  selectAgent: (agentId) => {
    set({ selectedAgent: agentId, panel: { ...EMPTY_PANEL, loading: true } });
    if (agentId) get().fetchPanel(agentId);
  },

  closePanel: () => {
    set({ selectedAgent: null, panel: EMPTY_PANEL });
  },

  fetchPanel: async (agentId) => {
    const id = agentId || get().selectedAgent;
    if (!id) return;

    set((s) => ({ panel: { ...s.panel, loading: true } }));

    // Single API call instead of 4
    if (id !== "approval") {
      const data = await safeFetch(`/api/agents/${id}/panel`, null);
    }

    if (!data) {
      set((s) => ({ panel: { ...s.panel, loading: false } }));
      return;
    }

    set({
      panel: {
        queued: {
          count: data.queued?.total ?? 0,
          items: normalizeItems(data.queued?.items),
        },
        inProgress: {
          count: data.in_progress?.total ?? 0,
          items: normalizeItems(data.in_progress?.items),
        },
        processed: {
          count: data.processed?.total ?? 0,
          items: normalizeItems(data.processed?.items),
        },
        liveFeed: {
          count: data.live_feed?.total ?? 0,
          items: normalizeFeed(data.live_feed?.items),
        },
        loading: false,
      },
    });
  },

  refreshApprovals: async () => {
    const data = await safeFetch("/api/approvals/pending", null);
    if (!data) return;
    set({ approvals: data.items });
  },

  // ── Header ────────────────────────────────────────────────────────────────
  fetchHeader: async () => {
    console.log("🔥 Calling ALL APIs");

    const [pipeline, headerTickets, ticketsRes, info] = await Promise.all([
      safeFetch("/api/header/pipeline", INITIAL_HEADER.pipeline),
      safeFetch("/api/header/tickets", INITIAL_HEADER.tickets),
      safeFetch("/api/tickets", {}),
      safeFetch("/api/header/info", INITIAL_HEADER.info),
    ]);

    console.log("✅ header tickets:", headerTickets);
    console.log("✅ table tickets (/api/tickets):", ticketsRes);

    set((s) => ({
      header: {
        ...s.header,
        pipeline,
        tickets: headerTickets || s.header.tickets,
        ticketsData: ticketsRes?.items || [],
        info,
      },
    }));
  },
  // ── WebSocket ─────────────────────────────────────────────────────────────

  connectWs: () => {
    const state = get();
    if (
      state._ws?.readyState === WebSocket.OPEN ||
      state._ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    let ws;
    try {
      ws = new WebSocket(getWsUrl());
    } catch {
      return;
    }

    set({ _ws: ws });

    ws.onopen = () => {
      set({ wsConnected: true });
      // Fetch everything fresh on connect
      get().fetchAgents();
      get().fetchHeader();
      if (get().selectedAgent) get().fetchPanel();
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const { type, data } = msg;

        if(type === "ticket_created") {
          setTimeout(() => get().fetchHeader(), 1000);
        }

        // Log event (keep last 100)
        set((s) => ({
          eventLog: [
            { type, timestamp: new Date().toISOString(), data },
            ...s.eventLog.slice(0, 99),
          ],
        }));

        // ── header_refresh / initial_state — use inline data, NO REST calls ──
        if (type === "header_refresh" || type === "initial_state") {
          if (data?.pipeline || data?.tickets || data?.items) {
            set((s) => ({
              header: {
                ...s.header,
                pipeline: data.pipeline || s.header.pipeline,
                tickets: data.tickets || s.header.tickets,
                ticketsData: data.items || s.header.ticketsData,
                info: data.info || s.header.info,
              },
            }));
          }

          if (data?.agents) {
            const merged = mergeAgents({ items: data.agents });
            if (merged) set({ agents: merged });
          }

          return;
        }

        // ── All other events — debounced REST fetches ──
        // Multiple events within 300ms trigger only ONE fetch each

        if (AGENT_REFRESH_TYPES.has(type)) {
          clearTimeout(get()._fetchAgentsTimer);
          const timer = setTimeout(() => get().fetchAgents(), 300);
          set({ _fetchAgentsTimer: timer });
        }

        if (PANEL_REFRESH_TYPES.has(type) && get().selectedAgent) {
          clearTimeout(get()._fetchPanelTimer);
          const timer = setTimeout(() => get().fetchPanel(), 300);
          set({ _fetchPanelTimer: timer });
        }
      } catch {
        /* ignore malformed */
      }
    };

    ws.onclose = () => {
      set({ wsConnected: false });
      const timer = setTimeout(() => get().connectWs(), 3000);
      set({ _retryTimer: timer });
    };

    ws.onerror = () => ws.close();
  },

  disconnectWs: () => {
    const { _ws, _retryTimer, _fetchAgentsTimer, _fetchPanelTimer } = get();
    if (_retryTimer) clearTimeout(_retryTimer);
    if (_fetchAgentsTimer) clearTimeout(_fetchAgentsTimer);
    if (_fetchPanelTimer) clearTimeout(_fetchPanelTimer);
    if (_ws) _ws.close();
    set({
      _ws: null,
      _retryTimer: null,
      _fetchAgentsTimer: null,
      _fetchPanelTimer: null,
      wsConnected: false,
    });
  },

  // ── Init / Destroy ────────────────────────────────────────────────────────

  init: () => {
    get().fetchAgents();
    get().fetchHeader();
    get().refreshApprovals();
    get().connectWs();
  },

  destroy: () => {
    get().disconnectWs();
  },
}));

export default useAgentStore;

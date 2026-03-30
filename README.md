# ADF Operations Dashboard

Aureus Unity Command Centre — React frontend for the DataOps multi-agent platform.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (runs on http://localhost:3000)
npm run dev
```

The app works **standalone with mock data** — no backend required to run locally.
When the FastAPI backend is running on port 8000, it automatically connects via the Vite proxy.

## Project Structure

```
src/
├── index.jsx                          # Entry point
├── index.css                          # Global reset + design tokens
├── App.jsx / App.css                  # Root shell
├── constants/
│   └── agents.js                      # Agent definitions (mirrors backend _AGENT_META)
├── hooks/
│   ├── useHeaderData.js               # /api/header/* polling (30s interval)
│   └── useAgentData.js                # /api/agents/* polling (15s / 10s intervals)
└── components/
    ├── Header/
    │   ├── Header.jsx                 # Top nav + tickets bar + pipeline summary
    │   └── Header.css
    ├── AgentGrid/
    │   ├── AgentGrid.jsx              # Card row (polls useAgentList)
    │   ├── AgentCard.jsx              # Individual card
    │   └── AgentGrid.css
    └── ObserverPanel/
        ├── ObserverPanel.jsx          # Queued / In Progress / Live Feed columns
        └── ObserverPanel.css
```

## Backend Connection

The Vite dev server proxies:
- `GET /api/*` → `http://localhost:8000`
- `WS  /ws`    → `ws://localhost:8000`

All data hooks fall back gracefully to mock data when the backend is offline.

## Build for Production

```bash
npm run build
# Output: dist/
```

import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import Maincard from "./pages/GovernancePage";
import PipelineHistory from "./pages/PipelineHistory";
import StuckWorkflows from "./pages/StuckWorkflows";
import TopNav from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import LogsPage from "./components/Pipeline/LogsPage";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      {/* ✅ HEADER */}
        <Router>
          <TopNav open={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
          <Sidebar open={menuOpen} />

          {/* ✅ CONTENT */}
            <main className={`main${menuOpen ? ' shifted' : ''}`}>
            <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pipelines" element={<Pipelines />} />
            <Route path="/governance-dashboard" element={<Maincard />} />
            <Route path="/pipeline-history" element={<PipelineHistory />} />
            <Route path="/stuck-workflows" element={<StuckWorkflows />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
          </main> 
        </Router>
    </div>
  );
}

export default App;
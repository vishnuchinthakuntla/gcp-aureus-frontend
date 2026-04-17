import React from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import Maincard from "./pages/GovernancePage";
import PipelineHistory from "./pages/PipelineHistory";

function App() {
  return (
    <Router>
            <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/governance-dashboard" element={<Maincard />} />
        <Route path="/pipeline-history" element={<PipelineHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
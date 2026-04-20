import React, { useState } from "react";
import PipelinesTable from "../components/Pipeline/PipelinesTable";
import TopNav from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import "../App.css";

const Pipelines = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <div className="app">
      {/* ✅ HEADER */}
      <TopNav open={menuOpen} onMenuToggle={handleMenuToggle} />
      
      {/* ✅ SIDEBAR */}
      <Sidebar open={menuOpen} />

      {/* ✅ PAGE CONTENT */}
      <main className={`main${menuOpen ? ' shifted' : ''}`}>
        <PipelinesTable />
      </main>
    </div>
  );
};

export default Pipelines;
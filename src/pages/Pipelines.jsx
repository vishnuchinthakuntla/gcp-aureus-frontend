import React, { useState } from "react";
import PipelinesTable from "../components/Pipeline/PipelinesTable";
import TopNav from "../components/Header/Header"; // ✅ adjust path if needed

const Pipelines = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <div>
      {/* ✅ HEADER */}
      <TopNav open={menuOpen} onMenuToggle={handleMenuToggle} />

      {/* ✅ PAGE CONTENT */}
      <div style={{ padding: "20px" }}>
        <PipelinesTable />
      </div>
    </div>
  );
};

export default Pipelines;
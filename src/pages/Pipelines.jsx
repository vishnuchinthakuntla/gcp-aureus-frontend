import React, { useState } from "react";
import PipelinesTable from "../components/Pipeline/PipelinesTable";
import "../App.css";

const Pipelines = ({open}) => {

  return (
    <>
        <PipelinesTable open={open}/>
    </>
  );
};

export default Pipelines;

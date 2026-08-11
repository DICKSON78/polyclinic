import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DischargeSummaries from "./discharge/DischargeSummaries";
import NursingCharts from "./nursing/NursingCharts";
import FluidBalances from "./fluid/FluidBalances";
import Mar from "./mar/Mar";

const WardRecordsRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/discharge" element={<DischargeSummaries />} />
      <Route path="/nursing" element={<NursingCharts />} />
      <Route path="/fluid-balance" element={<FluidBalances />} />
      <Route path="/mar" element={<Mar />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default WardRecordsRoutes;

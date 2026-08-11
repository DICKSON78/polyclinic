import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Queue from "./queue/Queue";
import History from "./history/History";

const TriageRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/queue"
        element={<Queue />}
      />
      <Route
        path="/patients/:patientId/vital-signs"
        element={<History />}
      />
    </Routes>
  );
};

export default TriageRoutes;

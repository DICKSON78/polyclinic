import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ErVisits from "./visits/ErVisits";
import NewVisit from "./new-visit/NewVisit";
import VisitDetail from "./visit-detail/VisitDetail";

const EmergencyRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="visits/new" element={<NewVisit />} />
      <Route path="visits/:visitId" element={<VisitDetail />} />
      <Route path="visits" element={<ErVisits />} />
      <Route path="" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default EmergencyRoutes;

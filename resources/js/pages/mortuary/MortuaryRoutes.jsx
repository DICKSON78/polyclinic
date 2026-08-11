import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Bodies from "./bodies/Bodies";
import BodyDetail from "./bodies/BodyDetail";
import Certificates from "./certificates/Certificates";

const MortuaryRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bodies" element={<Bodies />} />
      <Route path="/bodies/:bodyId" element={<BodyDetail />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default MortuaryRoutes;

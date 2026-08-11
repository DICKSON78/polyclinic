import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Theatres from "./theatres/Theatres";
import Surgeries from "./surgeries/Surgeries";
import NewSurgery from "./new-surgery/NewSurgery";
import SurgeryDetail from "./surgery-detail/SurgeryDetail";

const OperatingTheatreRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="theatres" element={<Theatres />} />
      <Route path="surgeries/new" element={<NewSurgery />} />
      <Route path="surgeries/:surgeryId" element={<SurgeryDetail />} />
      <Route path="surgeries" element={<Surgeries />} />
      <Route path="" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default OperatingTheatreRoutes;

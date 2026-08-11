import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Units from "./units/Units";
import Donors from "./donors/Donors";
import Transfusions from "./transfusions/Transfusions";
import TransfusionDetail from "./transfusions/TransfusionDetail";

const BloodBankRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/units" element={<Units />} />
      <Route path="/donors" element={<Donors />} />
      <Route path="/transfusions" element={<Transfusions />} />
      <Route path="/transfusions/:transfusionId" element={<TransfusionDetail />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default BloodBankRoutes;

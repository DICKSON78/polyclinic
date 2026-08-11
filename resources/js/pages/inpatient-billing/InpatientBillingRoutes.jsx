import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Charges from "./charges/Charges";
import Bills from "./bills/Bills";
import BillDetail from "./bills/BillDetail";

const InpatientBillingRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/charges" element={<Charges />} />
      <Route path="/bills" element={<Bills />} />
      <Route path="/bills/:billId" element={<BillDetail />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default InpatientBillingRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientItems from "../reports/PatientItems";
import ItemBalance from "../inventory-management/reports/ItemBalance";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/items-dispensed"
        element={
          <PatientItems
            module="Outpatient Dispensing"
            title="Items Dispensed Report"
            consultationType="Glass"
            status="Served"
          />
        }
      />
      <Route
        path="/items-not-dispensed"
        element={
          <PatientItems
            module="Outpatient Dispensing"
            title="Items Not Dispensed Report"
            consultationType="Glass"
            status="Pending,Paid,Billed"
          />
        }
      />
      <Route
        path="/item-balance"
        element={
          <ItemBalance
            module="Outpatient Dispensing"
            consultationType="Glass"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;

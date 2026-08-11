import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Stocktaking from "./Stocktaking";
import StocktakesList from "./StocktakesList";
import StockAlerts from "./StockAlerts";
import LensList from "./lens-list/LensList";
import LensTracking from "./lens-tracking/LensTracking";
import ReportsRoutes from "./reports/ReportsRoutes";

const InventoryManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="stocktaking"
        element={<Stocktaking />}
      />
      <Route
        path="stocktakes"
        element={<StocktakesList />}
      />
      <Route
        path="stock-alerts"
        element={<StockAlerts />}
      />
      <Route
        path="lens-list"
        element={<LensList />}
      />
      <Route
        path="lens-tracking"
        element={<LensTracking />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path=""
        element={<Navigate to="dashboard" />}
      />
    </Routes>
  );
};

export default InventoryManagementRoutes;

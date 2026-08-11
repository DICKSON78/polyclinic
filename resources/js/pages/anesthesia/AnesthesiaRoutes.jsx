import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Records from "./records/Records";
import NewRecord from "./new-record/NewRecord";
import RecordDetail from "./record-detail/RecordDetail";

const AnesthesiaRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="records/new" element={<NewRecord />} />
      <Route path="records/:recordId" element={<RecordDetail />} />
      <Route path="records" element={<Records />} />
      <Route path="" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default AnesthesiaRoutes;

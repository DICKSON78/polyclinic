import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Admissions from "./admissions/Admissions";
import AdmissionDetails from "./admissions/AdmissionDetails";
import NewAdmission from "./admissions/NewAdmission";
import Beds from "./beds/Beds";
import Notes from "./notes/Notes";
import Discharges from "./discharges/Discharges";
import History from "./history/History";

const WardsRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/admissions/new" element={<NewAdmission />} />
      <Route path="/admissions/:admissionId" element={<AdmissionDetails />} />
      <Route path="/beds" element={<Beds />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/discharges" element={<Discharges />} />
      <Route path="/patients/:patientId/history" element={<History />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default WardsRoutes;

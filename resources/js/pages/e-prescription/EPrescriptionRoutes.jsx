import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Prescriptions from "./prescriptions/Prescriptions";
import PrescriptionDetails from "./prescriptions/PrescriptionDetails";
import NewPrescription from "./prescriptions/NewPrescription";
import History from "./history/History";

const EPrescriptionRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/prescriptions" element={<Prescriptions />} />
      <Route path="/prescriptions/new" element={<NewPrescription />} />
      <Route path="/prescriptions/:prescriptionId" element={<PrescriptionDetails />} />
      <Route path="/patients/:patientId/history" element={<History />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default EPrescriptionRoutes;

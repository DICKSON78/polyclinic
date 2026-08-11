import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Patients from "./patients/Patients";
import PatientDetails from "./patients/PatientDetails";
import RegisterNewClient from "./register-new-client/RegisterNewClient";
import CheckInPatient from "./CheckInPatient";
import PatientRecords from "./patients/PatientRecords";
import PatientsToReturn from "./patients-to-return/PatientsToReturn";
import SentMessages from "./sent-messages/Messages";
import ReportsRoutes from "./reports/ReportsRoutes";

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/patients"
        exact
        element={<Patients />}
      />
      <Route
        path="/patients/:patientId"
        element={<PatientDetails />}
      />
      <Route
        path="/register-new-client"
        element={<RegisterNewClient />}
      />
      <Route
        path="/patients/:patientId/check-in"
        element={<CheckInPatient />}
      />
      <Route
        path="/patients/:patientId/records/*"
        element={<PatientRecords />}
      />
      <Route
        path="/to-return/patients"
        element={<PatientsToReturn />}
      />
      <Route
        path="/patients-scheduled-to-return"
        element={<PatientsToReturn />}
      />
      <Route
        path="/sent-messages"
        element={<SentMessages />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ReceptionRoutes;

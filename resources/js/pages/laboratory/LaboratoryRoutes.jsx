import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Tests from "./tests/Tests";
import Requests from "./requests/Requests";
import RequestDetails from "./requests/RequestDetails";
import NewRequest from "./requests/NewRequest";
import Results from "./results/Results";
import Samples from "./samples/Samples";
import Reports from "./reports/Reports";
import History from "./history/History";

const LaboratoryRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tests" element={<Tests />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/new" element={<NewRequest />} />
      <Route path="/requests/:requestId" element={<RequestDetails />} />
      <Route path="/results" element={<Results />} />
      <Route path="/samples" element={<Samples />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/patients/:patientId/history" element={<History />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default LaboratoryRoutes;

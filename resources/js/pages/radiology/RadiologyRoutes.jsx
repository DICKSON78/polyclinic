import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Exams from "./exams/Exams";
import Requests from "./requests/Requests";
import RequestDetails from "./requests/RequestDetails";
import NewRequest from "./requests/NewRequest";
import Results from "./results/Results";
import History from "./history/History";

const RadiologyRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/new" element={<NewRequest />} />
      <Route path="/requests/:requestId" element={<RequestDetails />} />
      <Route path="/results" element={<Results />} />
      <Route path="/patients/:patientId/history" element={<History />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default RadiologyRoutes;

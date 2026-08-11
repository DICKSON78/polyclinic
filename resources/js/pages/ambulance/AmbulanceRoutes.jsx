import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Vehicles from "./vehicles/Vehicles";
import Requests from "./requests/Requests";
import RequestDetail from "./requests/RequestDetail";
import Trips from "./trips/Trips";

const AmbulanceRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/vehicles" element={<Vehicles />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/:requestId" element={<RequestDetail />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default AmbulanceRoutes;

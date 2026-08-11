import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Companies from "./companies/Companies";
import Claims from "./claims/Claims";
import ClaimDetail from "./claims/ClaimDetail";
import CreateClaim from "./claims/CreateClaim";
import PatientInsurance from "./patient-insurance/PatientInsurance";

const InsuranceRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="companies" element={<Companies />} />
      <Route path="claims/new" element={<CreateClaim />} />
      <Route path="claims/:claimId" element={<ClaimDetail />} />
      <Route path="claims" element={<Claims />} />
      <Route path="patient-insurance" element={<PatientInsurance />} />
      <Route path="" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default InsuranceRoutes;

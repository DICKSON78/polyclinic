import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "../patients/PatientDetails";
import ClinicalNotes from "./clinical-notes/ClinicalNotes";
import useFetch from "../../../hooks/useFetch";

const GlassPatientRoutes = () => {
  const navigate = useNavigate();
  const { patientId, consultationId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  const { data: consultation, loading: loadingConsultation, error: consultationError } = useFetch(
    `api/consultations/${consultationId}`,
    null,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (!patientId || !consultationId) {
      navigate("/sales-management/glass-patients");
    }
  }, []);

  useEffect(() => {
    if (consultationError) {
      console.error('Consultation error:', consultationError);
      console.log('Error status:', consultationError.response?.status);
      console.log('Error response:', consultationError.response);
      // If consultation not found (404) or server error (500), redirect back to glass patients list
      if (consultationError.response?.status === 404 || consultationError.response?.status === 500) {
        console.log('Redirecting due to error status:', consultationError.response?.status);
        navigate("/sales-management/glass-patients");
      }
    }
  }, [consultationError, navigate]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Table" },
        { title: "Dispensing Patients" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient || loadingConsultation ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient && consultation ? (
        <Routes>
          <Route
            path="/clinical-notes"
            element={
              <ClinicalNotes
                patient={patient}
                consultation={consultation}
              />
            }
          />
        </Routes>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default GlassPatientRoutes;

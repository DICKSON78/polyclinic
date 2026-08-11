import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";
import ClinicalNotes from "./clinical-notes/ClinicalNotes";
import useFetch from "../../hooks/useFetch";

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
      navigate("/optician-center/glass-patients");
    }
  }, []);

  useEffect(() => {
    if (consultationError) {
      console.error('Consultation error:', consultationError);
      // If consultation not found (404), redirect back to glass patients list
      if (consultationError.response?.status === 404) {
        navigate("/optician-center/glass-patients");
      }
    }
  }, [consultationError, navigate]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Outpatient Dispensing" },
        { title: "Patients Sent for Dispensing" },
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

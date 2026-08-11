import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@mui/material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";
import ClinicalNotes from "./clinical-notes/ClinicalNotes";
import useFetch from "../../hooks/useFetch";

const ConsultationPatientRoutes = () => {
  const navigate = useNavigate();
  const { status, patientId, consultationId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  const { data: consultation, loading: loadingConsultation } = useFetch(
    `api/consultations/${consultationId}`,
    {
      with_diagnoses: "Yes",
      with_items: "Yes",
      with_visual_acuity: "Yes",
      with_external_examination: "Yes",
      with_refraction: "Yes",
      with_fundoscopy: "Yes",
      with_item_templates: "Yes",
      with_referral: "Yes",
      with_lab_results: "Yes",
      with_radiology_results: "Yes",
      with_vital_signs: "Yes",
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (!patientId || !consultationId) {
      navigate(`/consultation-room/consultation-patients/${status}`);
    }
  }, []);

  const getFromListTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getFromListTitle() },
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
                status={status}
              />
            }
          />
        </Routes>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ConsultationPatientRoutes;

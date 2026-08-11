import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const NewRecord = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  usePrivilege('wards', '/dashboard');

  const formRef = useRef();
  const patientRef = useRef();

  const [patientId, setPatientId] = useState();
  const [surgeryId, setSurgeryId] = useState();
  const [admissionId, setAdmissionId] = useState();
  const [anesthesiologistId, setAnesthesiologistId] = useState();
  const [anesthesiaType, setAnesthesiaType] = useState("General");
  const [asaClass, setAsaClass] = useState("");
  const [preOpAssessment, setPreOpAssessment] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");

  const { data: patients, loading: loadingPatients } = useFetch(
    "api/patients",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: surgeries, loading: loadingSurgeries } = useFetch(
    "api/operating-theatre/surgeries",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: anesthesiologists, loading: loadingAnesthetists } = useFetch(
    "api/anesthesia/staff",
    { role: "Anesthetist" },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data, loading: saving, error, handlePost } = usePost("api/anesthesia/records");

  useEffect(() => {
    document.title = `New Anesthesia Record - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => navigate("/anesthesia/records"), 1000);
    }
  }, [data]);

  const surgeryOptions = (surgeries || []).map((s) => ({
    value: s.id,
    label: `${s.surgery_no || ""} - ${s.procedure_name || ""}${s.patient?.full_name ? ` (${s.patient.full_name})` : ""}`,
  }));

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost("api/anesthesia/records", {
        patient_id: patientId,
        surgery_id: surgeryId || undefined,
        admission_id: admissionId || undefined,
        anesthesiologist_id: anesthesiologistId || undefined,
        anesthesia_type: anesthesiaType,
        asa_class: asaClass || undefined,
        pre_op_assessment: preOpAssessment || undefined,
        allergies: allergies || undefined,
        notes: notes || undefined,
      });
    }
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Anesthesia" }, { title: "New Record" }]}
    >
      <Card>
        <PageHeader
          title="New Anesthesia Record"
          subtitle="Open an anesthesia record for a patient"
          leading={
            <IconButton onClick={() => navigate("/anesthesia/records")}>
              <ArrowBackRounded />
            </IconButton>
          }
          trailing={
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              disabled={saving}
              onClick={handleSubmit}
            >
              {saving ? "Saving..." : "Save Record"}
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {saving && <LinearProgress />}
          <Form ref={formRef}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  ref={patientRef}
                  label="Patient *"
                  fullWidth
                  required
                  optionsLabel="full_name"
                  optionsValue="id"
                  placeholder="Search patient..."
                  loading={loadingPatients}
                  options={patients || []}
                  value={patientId}
                  onChange={(value) => setPatientId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Surgery"
                  fullWidth
                  clearable
                  options={surgeryOptions}
                  loading={loadingSurgeries}
                  value={surgeryId}
                  onChange={(value) => setSurgeryId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Anesthesia Type *"
                  fullWidth
                  required
                  options={["General", "Regional", "Local", "Sedation"]}
                  value={anesthesiaType}
                  onChange={(value) => setAnesthesiaType(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="ASA Class (I-VI)"
                  fullWidth
                  value={asaClass}
                  onChange={(value) => setAsaClass(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Anesthesiologist"
                  fullWidth
                  clearable
                  optionsLabel="full_name"
                  optionsValue="id"
                  loading={loadingAnesthetists}
                  options={anesthesiologists || []}
                  value={anesthesiologistId}
                  onChange={(value) => setAnesthesiologistId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Pre-op Assessment"
                  fullWidth
                  multiline
                  rows={3}
                  value={preOpAssessment}
                  onChange={(value) => setPreOpAssessment(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Allergies"
                  fullWidth
                  value={allergies}
                  onChange={(value) => setAllergies(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(value) => setNotes(value)}
                />
              </Grid>
            </Grid>
          </Form>
        </CardContent>
      </Card>
    </Page>
  );
};

export default NewRecord;

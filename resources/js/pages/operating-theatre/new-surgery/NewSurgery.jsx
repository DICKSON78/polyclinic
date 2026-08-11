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

const NewSurgery = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  usePrivilege('wards', '/dashboard');

  const formRef = useRef();
  const patientRef = useRef();
  const procedureRef = useRef();

  const [patientId, setPatientId] = useState();
  const [admissionId, setAdmissionId] = useState();
  const [theatreId, setTheatreId] = useState();
  const [surgeonId, setSurgeonId] = useState();
  const [assistantSurgeonId, setAssistantSurgeonId] = useState();
  const [anesthesiologistId, setAnesthesiologistId] = useState();
  const [scrubNurseId, setScrubNurseId] = useState();
  const [procedureName, setProcedureName] = useState("");
  const [procedureType, setProcedureType] = useState("Elective");
  const [scheduledAt, setScheduledAt] = useState("");
  const [preOpDiagnosis, setPreOpDiagnosis] = useState("");
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

  const { data: theatres, loading: loadingTheatres } = useFetch(
    "api/operating-theatre/theatres",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: admissions, loading: loadingAdmissions } = useFetch(
    "api/operating-theatre/admissions",
    {},
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: surgeons, loading: loadingSurgeons } = useFetch(
    "api/operating-theatre/staff",
    { role: "Doctor" },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: anesthesiologists, loading: loadingAnesthetists } = useFetch(
    "api/operating-theatre/staff",
    { role: "Anesthetist" },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: nurses, loading: loadingNurses } = useFetch(
    "api/operating-theatre/staff",
    { role: "Nurse" },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data, loading: saving, error, handlePost } = usePost("api/operating-theatre/surgeries");

  useEffect(() => {
    document.title = `Schedule Surgery - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => navigate("/operating-theatre/surgeries"), 1000);
    }
  }, [data]);

  const admissionOptions = (admissions || []).map((a) => ({
    value: a.id,
    label: `${a.admission_no}${a.patient?.full_name ? ` - ${a.patient.full_name}` : ""}${a.ward?.name ? ` (${a.ward.name})` : ""}`,
  }));

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost("api/operating-theatre/surgeries", {
        patient_id: patientId,
        admission_id: admissionId || undefined,
        theatre_id: theatreId || undefined,
        surgeon_id: surgeonId || undefined,
        assistant_surgeon_id: assistantSurgeonId || undefined,
        anesthesiologist_id: anesthesiologistId || undefined,
        scrub_nurse_id: scrubNurseId || undefined,
        procedure_name: procedureName,
        procedure_type: procedureType,
        scheduled_at: scheduledAt || undefined,
        pre_op_diagnosis: preOpDiagnosis || undefined,
        notes: notes || undefined,
      });
    }
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Operating Theatre" }, { title: "Schedule Surgery" }]}
    >
      <Card>
        <PageHeader
          title="Schedule Surgery"
          subtitle="Book a surgery into the theatre list"
          leading={
            <IconButton onClick={() => navigate("/operating-theatre/surgeries")}>
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
              {saving ? "Saving..." : "Schedule Surgery"}
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
                  label="Admission"
                  fullWidth
                  clearable
                  options={admissionOptions}
                  loading={loadingAdmissions}
                  value={admissionId}
                  onChange={(value) => setAdmissionId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  ref={procedureRef}
                  label="Procedure Name *"
                  fullWidth
                  required
                  value={procedureName}
                  rules={[validationRules.required]}
                  onChange={(value) => setProcedureName(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Procedure Type *"
                  fullWidth
                  required
                  options={["Elective", "Emergency", "Urgent"]}
                  value={procedureType}
                  onChange={(value) => setProcedureType(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Theatre"
                  fullWidth
                  clearable
                  optionsLabel="name"
                  optionsValue="id"
                  loading={loadingTheatres}
                  options={theatres || []}
                  value={theatreId}
                  onChange={(value) => setTheatreId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Surgeon"
                  fullWidth
                  clearable
                  optionsLabel="full_name"
                  optionsValue="id"
                  loading={loadingSurgeons}
                  options={surgeons || []}
                  value={surgeonId}
                  onChange={(value) => setSurgeonId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Assistant Surgeon"
                  fullWidth
                  clearable
                  optionsLabel="full_name"
                  optionsValue="id"
                  loading={loadingSurgeons}
                  options={surgeons || []}
                  value={assistantSurgeonId}
                  onChange={(value) => setAssistantSurgeonId(value)}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  label="Scrub Nurse"
                  fullWidth
                  clearable
                  optionsLabel="full_name"
                  optionsValue="id"
                  loading={loadingNurses}
                  options={nurses || []}
                  value={scrubNurseId}
                  onChange={(value) => setScrubNurseId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Scheduled At"
                  fullWidth
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(value) => setScheduledAt(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Pre-op Diagnosis"
                  fullWidth
                  value={preOpDiagnosis}
                  onChange={(value) => setPreOpDiagnosis(value)}
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

export default NewSurgery;

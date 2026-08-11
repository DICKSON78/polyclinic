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

const NewVisit = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  usePrivilege('triage', '/dashboard');

  const formRef = useRef();
  const patientRef = useRef();
  const categoryRef = useRef();
  const priorityRef = useRef();
  const nurseRef = useRef();
  const complaintRef = useRef();
  const historyRef = useRef();
  const notesRef = useRef();

  const [patientId, setPatientId] = useState();
  const [triageCategory, setTriageCategory] = useState("General");
  const [priority, setPriority] = useState("Stable");
  const [nurseId, setNurseId] = useState();
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [history, setHistory] = useState("");
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

  const { data: staff, loading: loadingStaff } = useFetch(
    "api/emergency/staff",
    { role: "Nurse" },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data, loading: saving, error, handlePost } = usePost("api/emergency/visits");

  useEffect(() => {
    document.title = `New ER Visit - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => navigate("/emergency/visits"), 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost("api/emergency/visits", {
        patient_id: patientId,
        triage_category: triageCategory,
        priority,
        nurse_id: nurseId || undefined,
        chief_complaint: chiefComplaint,
        history: history,
        notes: notes,
      });
    }
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Emergency" }, { title: "New Visit" }]}
    >
      <Card>
        <PageHeader
          title="New ER Visit"
          subtitle="Register a patient into the emergency department"
          leading={
            <IconButton onClick={() => navigate("/emergency/visits")}>
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
              {saving ? "Saving..." : "Save Visit"}
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
              <Grid size={{ xs: 12, md: 3 }}>
                <Select
                  ref={categoryRef}
                  label="Triage Category *"
                  fullWidth
                  required
                  options={["General", "Urgent", "Emergency"]}
                  value={triageCategory}
                  onChange={(value) => setTriageCategory(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Select
                  ref={priorityRef}
                  label="Priority *"
                  fullWidth
                  required
                  options={["Stable", "Serious", "Critical"]}
                  value={priority}
                  onChange={(value) => setPriority(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  ref={nurseRef}
                  label="Attending Nurse"
                  fullWidth
                  optionsLabel="full_name"
                  optionsValue="id"
                  loading={loadingStaff}
                  options={staff || []}
                  value={nurseId}
                  onChange={(value) => setNurseId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  ref={complaintRef}
                  label="Chief Complaint *"
                  fullWidth
                  required
                  value={chiefComplaint}
                  rules={[validationRules.required]}
                  onChange={(value) => setChiefComplaint(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  ref={historyRef}
                  label="History of Presenting Illness"
                  fullWidth
                  multiline
                  rows={3}
                  value={history}
                  onChange={(value) => setHistory(value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  ref={notesRef}
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

export default NewVisit;

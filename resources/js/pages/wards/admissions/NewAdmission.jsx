import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  HotelRounded as AdmitIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationError, validateInteger } from "../../../helpers";

const NewAdmission = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('wards', '/dashboard');

  const [patientId, setPatientId] = useState();
  const [patientOptions, setPatientOptions] = useState([]);
  const [bedId, setBedId] = useState();
  const [bedOptions, setBedOptions] = useState([]);
  const [bedMap, setBedMap] = useState({});
  const [doctorId, setDoctorId] = useState();
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [admissionDate, setAdmissionDate] = useState("");
  const [admissionReason, setAdmissionReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [condition, setCondition] = useState("Stable");
  const [notes, setNotes] = useState("");

  const { data: patientsData } = useFetch(
    "api/patients",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data: bedsData } = useFetch(
    "api/inpatient/beds",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data: usersData } = useFetch(
    "api/users",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/inpatient/admissions");

  useEffect(() => {
    document.title = `New Admission - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patientsData) {
      setPatientOptions(
        patientsData.map((p) => ({
          value: p.id,
          label: p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        }))
      );
    }
  }, [patientsData]);

  useEffect(() => {
    if (bedsData) {
      const available = bedsData.filter((b) => b.status === "Available");
      setBedOptions(
        available.map((b) => ({
          value: b.id,
          label: `${b.ward?.name || "Ward"} — Bed ${b.bed_number}${b.bed_type && b.bed_type !== "Regular" ? ` (${b.bed_type})` : ""}`,
        }))
      );
      const map = {};
      bedsData.forEach((b) => {
        map[b.id] = b;
      });
      setBedMap(map);
    }
  }, [bedsData]);

  useEffect(() => {
    if (usersData) {
      const doctors = usersData.filter((u) =>
        ["Doctor", "Optometrist", "Admin", "Director"].includes(u.role)
      );
      setDoctorOptions(
        doctors.map((u) => ({
          value: u.id,
          label: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        }))
      );
    }
  }, [usersData]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      const admissionId = data.data?.id;
      window.setTimeout(() => {
        navigate(admissionId ? `/wards/admissions/${admissionId}` : "/wards/admissions");
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (!patientId) {
      addToast({ message: getValidationError("Please select a patient.").response.data.message, severity: "error" });
      return;
    }
    if (!bedId) {
      addToast({ message: getValidationError("Please select an available bed.").response.data.message, severity: "error" });
      return;
    }

    handlePost(null, {
      patient_id: patientId,
      bed_id: bedId,
      doctor_id: doctorId || null,
      admission_date: admissionDate || null,
      admission_reason: admissionReason || null,
      diagnosis: diagnosis || null,
      condition: condition || "Stable",
      notes: notes || null,
    });
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Admissions" },
        { title: "New Admission" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="New Admission"
          subtitle="Admit a patient to an available bed"
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/wards/admissions")}>
              <BackIcon fontSize="small" />
            </Button>
          }
        />
        <Divider />
        {loading && <LinearProgress />}
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="h6">Patient</Typography>
                <Select
                  label="Patient"
                  fullWidth
                  required
                  placeholder="Search and select patient"
                  value={patientId}
                  onChange={setPatientId}
                  options={patientOptions}
                />
                <Select
                  label="Bed"
                  fullWidth
                  required
                  placeholder="Select available bed"
                  value={bedId}
                  onChange={setBedId}
                  options={bedOptions}
                />
                {bedId && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: <b>{bedMap[bedId]?.ward?.name || "—"}</b> • Bed{" "}
                    <b>{bedMap[bedId]?.bed_number || "—"}</b>
                    {bedMap[bedId]?.ward?.price_per_day
                      ? ` • ${Number(bedMap[bedId]?.ward?.price_per_day).toLocaleString()} TZS/day`
                      : ""}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="h6">Admission Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Select
                      label="Attending Doctor"
                      fullWidth
                      placeholder="Select doctor"
                      value={doctorId}
                      onChange={setDoctorId}
                      options={doctorOptions}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select
                      label="Condition"
                      fullWidth
                      value={condition}
                      onChange={setCondition}
                      options={["Stable", "Serious", "Critical"]}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Admission Date"
                  fullWidth
                  type="datetime-local"
                  value={admissionDate}
                  onChange={setAdmissionDate}
                />
                <TextField
                  label="Admission Reason"
                  fullWidth
                  value={admissionReason}
                  onChange={setAdmissionReason}
                  placeholder="e.g. Severe pneumonia"
                />
                <TextField
                  label="Diagnosis"
                  fullWidth
                  value={diagnosis}
                  onChange={setDiagnosis}
                />
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  minRows={2}
                  value={notes}
                  onChange={setNotes}
                />
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button color="inherit" onClick={() => navigate("/wards/admissions")} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AdmitIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Admit Patient
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default NewAdmission;

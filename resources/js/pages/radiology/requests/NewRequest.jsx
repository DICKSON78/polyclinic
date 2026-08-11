import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  CheckRounded as CheckIcon,
  RadioRounded as RequestIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationError } from "../../../helpers";

const NewRequest = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('radiology', '/dashboard');

  const [patientId, setPatientId] = useState();
  const [patientOptions, setPatientOptions] = useState([]);
  const [priority, setPriority] = useState("Routine");
  const [contrast, setContrast] = useState("None");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [selectedExams, setSelectedExams] = useState([]);
  const [examOptions, setExamOptions] = useState([]);

  const { data: patientsData, handleFetch: fetchPatients } = useFetch(
    "api/patients",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data: examsData } = useFetch(
    "api/radiology/exams",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/radiology/requests");

  useEffect(() => {
    document.title = `New Radiology Request - ${window.APP_NAME}`;
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
    if (examsData) {
      setExamOptions(examsData.map((e) => ({ value: e.id, label: e.name })));
    }
  }, [examsData]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      const requestId = data.data?.id;
      window.setTimeout(() => {
        navigate(requestId ? `/radiology/requests/${requestId}` : "/radiology/requests");
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (!patientId) {
      addToast({ message: getValidationError("Please select a patient.").response.data.message, severity: "error" });
      return;
    }
    if (selectedExams.length === 0) {
      addToast({ message: getValidationError("Please select at least one exam.").response.data.message, severity: "error" });
      return;
    }

    handlePost(null, {
      patient_id: patientId,
      priority,
      contrast,
      clinical_notes: clinicalNotes || null,
      exams: selectedExams.map((id) => ({ radiology_exam_id: id })),
    });
  };

  const handleToggleExam = (examId) => {
    setSelectedExams((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Radiology" },
        { title: "Imaging Requests" },
        { title: "New Request" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="New Radiology Request"
          subtitle="Select a patient and the exams to perform"
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/radiology/requests")}>
              <BackIcon fontSize="small" />
            </Button>
          }
        />
        <Divider />
        {loading && <LinearProgress />}
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
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
                <TextField
                  label="Clinical Notes"
                  fullWidth
                  multiline
                  minRows={4}
                  value={clinicalNotes}
                  onChange={setClinicalNotes}
                />
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Priority
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {["Routine", "Urgent", "Stat"].map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        clickable
                        color={priority === p ? "primary" : "default"}
                        onClick={() => setPriority(p)}
                      />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Contrast
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {["None", "Oral", "IV"].map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        clickable
                        color={contrast === c ? "primary" : "default"}
                        onClick={() => setContrast(c)}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" mb={1}>
                Select Exams
              </Typography>
              {examOptions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active radiology exams available. Add exams in the{" "}
                  <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/radiology/exams")}>
                    Exam Catalog
                  </Box>{" "}
                  first.
                </Typography>
              ) : (
                <Grid container spacing={1}>
                  {examOptions.map((e) => {
                    const selected = selectedExams.includes(e.value);
                    return (
                      <Grid item key={e.value} xs={12} sm={6} lg={4}>
                        <Card
                          square
                          variant="outlined"
                          onClick={() => handleToggleExam(e.value)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: selected ? "primary.main" : "inherit",
                            color: selected ? "primary.contrastText" : "inherit",
                          }}
                        >
                          <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {selected && <CheckIcon fontSize="small" />}
                              <Typography variant="body2">{e.label}</Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  {selectedExams.length} exam(s) selected
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button color="inherit" onClick={() => navigate("/radiology/requests")} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RequestIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Create Radiology Request
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default NewRequest;

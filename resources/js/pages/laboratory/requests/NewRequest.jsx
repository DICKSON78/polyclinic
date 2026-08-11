import React, { useEffect, useRef, useState } from "react";
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
  PersonSearchRounded as PersonSearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationError } from "../../../helpers";

const NewRequest = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const formRef = useRef();

  usePrivilege('laboratory', '/dashboard');

  const [patientId, setPatientId] = useState();
  const [patientOptions, setPatientOptions] = useState([]);
  const [priority, setPriority] = useState("Routine");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [testOptions, setTestOptions] = useState([]);

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

  const { data: testsData } = useFetch(
    "api/laboratory/tests",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/laboratory/requests");

  useEffect(() => {
    document.title = `New Lab Request - ${window.APP_NAME}`;
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
    if (testsData) {
      setTestOptions(testsData.map((t) => ({ value: t.id, label: t.name })));
    }
  }, [testsData]);

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
        navigate(requestId ? `/laboratory/requests/${requestId}` : "/laboratory/requests");
      }, 1000);
    }
  }, [data]);

  const handleSubmit = () => {
    if (!patientId) {
      addToast({ message: getValidationError("Please select a patient.").response.data.message, severity: "error" });
      return;
    }
    if (selectedTests.length === 0) {
      addToast({ message: getValidationError("Please select at least one lab test.").response.data.message, severity: "error" });
      return;
    }

    handlePost(null, {
      patient_id: patientId,
      priority,
      clinical_notes: clinicalNotes || null,
      tests: selectedTests.map((id) => ({ lab_test_id: id })),
    });
  };

  const handleToggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Laboratory" },
        { title: "Lab Requests" },
        { title: "New Request" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="New Lab Request"
          subtitle="Select a patient and the tests to perform"
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/laboratory/requests")}>
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
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" mb={1}>
                Select Tests
              </Typography>
              {testOptions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active lab tests available. Add lab tests in the{" "}
                  <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => navigate("/laboratory/tests")}>
                    Test Catalog
                  </Box>{" "}
                  first.
                </Typography>
              ) : (
                <Grid container spacing={1}>
                  {testOptions.map((t) => {
                    const selected = selectedTests.includes(t.value);
                    return (
                      <Grid item key={t.value} xs={12} sm={6} lg={4}>
                        <Card
                          square
                          variant="outlined"
                          onClick={() => handleToggleTest(t.value)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: selected ? "primary.main" : "inherit",
                            color: selected ? "primary.contrastText" : "inherit",
                          }}
                        >
                          <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {selected && <CheckIcon fontSize="small" />}
                              <Typography variant="body2">{t.label}</Typography>
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
                  {selectedTests.length} test(s) selected
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button color="inherit" onClick={() => navigate("/laboratory/requests")} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonSearchIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Create Lab Request
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default NewRequest;

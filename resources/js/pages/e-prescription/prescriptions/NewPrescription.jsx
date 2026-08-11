import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  AddRounded as AddItemIcon,
  DeleteRounded as DeleteIcon,
  MedicationRounded as RxIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationError, validateInteger } from "../../../helpers";

const emptyItem = {
  medicine_id: "",
  dosage: "",
  frequency: "",
  duration: "",
  meal: "After",
  instructions: "",
};

const NewPrescription = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('e_prescription', '/dashboard');

  const [patientId, setPatientId] = useState();
  const [patientOptions, setPatientOptions] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [medicineMap, setMedicineMap] = useState({});

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

  const { data: medicinesData } = useFetch(
    "api/e-prescription/medicines",
    { per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/e-prescription");

  useEffect(() => {
    document.title = `New Prescription - ${window.APP_NAME}`;
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
    if (medicinesData) {
      setMedicineOptions(
        medicinesData.map((m) => ({
          value: m.id,
          label: `${m.name}${m.code ? ` (${m.code})` : ""}`,
        }))
      );
      const map = {};
      medicinesData.forEach((m) => {
        map[m.id] = m;
      });
      setMedicineMap(map);
    }
  }, [medicinesData]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      const prescriptionId = data.data?.id;
      window.setTimeout(() => {
        navigate(prescriptionId ? `/e-prescription/prescriptions/${prescriptionId}` : "/e-prescription/prescriptions");
      }, 1000);
    }
  }, [data]);

  const handleItemChange = (index, key) => (value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleMedicineChange = (index) => (value) => {
    setItems((prev) => {
      const next = [...prev];
      const med = medicineMap[value];
      next[index] = {
        ...next[index],
        medicine_id: value,
        unit: med?.unit_of_measure?.name || "",
      };
      return next;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const computeQuantity = (item) => {
    const duration = parseInt(item.duration || "0", 10);
    const freqMatch = (item.frequency || "").match(/(\d+)\s*x/i);
    const perDay = freqMatch ? parseInt(freqMatch[1], 10) : 1;
    return duration * perDay;
  };

  const handleSubmit = () => {
    if (!patientId) {
      addToast({ message: getValidationError("Please select a patient.").response.data.message, severity: "error" });
      return;
    }
    const validItems = items.filter((i) => i.medicine_id);
    if (validItems.length === 0) {
      addToast({ message: getValidationError("Please add at least one medicine.").response.data.message, severity: "error" });
      return;
    }

    handlePost(null, {
      patient_id: patientId,
      diagnosis: diagnosis || null,
      clinical_notes: clinicalNotes || null,
      expires_at: expiresAt || null,
      items: validItems.map((item) => {
        const quantity = computeQuantity(item);
        return {
          medicine_id: item.medicine_id,
          dosage: item.dosage || null,
          frequency: item.frequency || null,
          duration: item.duration || null,
          quantity: quantity > 0 ? quantity : null,
          unit: item.unit || null,
          meal: item.meal || "None",
          instructions: item.instructions || null,
        };
      }),
    });
  };

  return (
    <Page
      breadcrumbs={[
        { title: "E-Prescription" },
        { title: "Prescriptions" },
        { title: "New Prescription" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="New Prescription"
          subtitle="Select a patient and prescribe medicines"
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/e-prescription/prescriptions")}>
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
                <Typography variant="h6">Patient & Prescription</Typography>
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
                  label="Diagnosis"
                  fullWidth
                  value={diagnosis}
                  onChange={setDiagnosis}
                />
                <TextField
                  label="Clinical Notes"
                  fullWidth
                  multiline
                  minRows={3}
                  value={clinicalNotes}
                  onChange={setClinicalNotes}
                />
                <TextField
                  label="Valid Until"
                  fullWidth
                  type="date"
                  value={expiresAt}
                  onChange={setExpiresAt}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Prescription Items</Typography>
                <Button variant="outlined" color="primary" size="small" startIcon={<AddItemIcon />} onClick={addItem}>
                  Add Item
                </Button>
              </Stack>
              {medicineOptions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active medicines available. Add medicines in the Medicine Center first.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {items.map((item, index) => (
                    <Card key={index} square variant="outlined">
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Typography variant="subtitle2" flexGrow={1}>
                            Item {index + 1}
                          </Typography>
                          <IconButton size="small" onClick={() => removeItem(index)} disabled={items.length === 1}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={1}>
                          <Grid item xs={12} sm={6}>
                            <Select
                              label="Medicine"
                              fullWidth
                              required
                              placeholder="Select medicine"
                              value={item.medicine_id || ""}
                              onChange={handleMedicineChange(index)}
                              options={medicineOptions}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Dosage"
                              fullWidth
                              value={item.dosage}
                              onChange={handleItemChange(index, "dosage")}
                              placeholder="e.g. 500mg"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Frequency"
                              fullWidth
                              value={item.frequency}
                              onChange={handleItemChange(index, "frequency")}
                              placeholder="e.g. 3x daily"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              label="Duration (days)"
                              fullWidth
                              valueFilter={validateInteger}
                              value={item.duration}
                              onChange={handleItemChange(index, "duration")}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Select
                              label="Meal"
                              fullWidth
                              value={item.meal}
                              onChange={handleItemChange(index, "meal")}
                              options={["None", "Before", "After"]}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Instructions"
                              fullWidth
                              value={item.instructions}
                              onChange={handleItemChange(index, "instructions")}
                              placeholder="e.g. After meals, drink plenty of water"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Computed quantity:{" "}
                              <b>{computeQuantity(item) > 0 ? computeQuantity(item) : "—"}</b>{" "}
                              {item.unit || ""}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button color="inherit" onClick={() => navigate("/e-prescription/prescriptions")} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RxIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Create Prescription
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default NewPrescription;

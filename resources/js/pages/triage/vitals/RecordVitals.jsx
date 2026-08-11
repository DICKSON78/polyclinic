import React, { useEffect, useRef, useState } from "react";

import {
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { usePost, useToast } from "../../../hooks";
import { formatError, getValidationRules, validateInteger } from "../../../helpers";

const validationRules = getValidationRules();

const triageCategories = [
  { value: "General", label: "General" },
  { value: "Urgent", label: "Urgent" },
  { value: "Emergency", label: "Emergency" },
];

const RecordVitals = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();
  const patient = item?.patient || item;

  const [formData, setFormData] = useState({
    temperature: "",
    systolic_bp: "",
    diastolic_bp: "",
    heart_rate: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    weight_kg: "",
    height_cm: "",
    blood_group: "",
    chief_complaint: "",
    triage_category: "General",
    notes: "",
  });

  const apiUri = "api/triage/vital-signs";

  const { data, loading, error, handlePost } = usePost(apiUri, {
    patient_id: patient?.id,
    ...formData,
  });

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  const handleChange = (key) => (value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const numericOnly = (value) => {
    const cleaned = String(value || "").replace(/[^0-9.]/g, "");
    return cleaned;
  };

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const name = `${patient?.first_name || ""} ${patient?.middle_name || ""} ${patient?.last_name || ""}`.trim();

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Stack spacing={2} mb={2}>
          <Typography variant="h6">{name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Record vital signs and triage category for this patient.
          </Typography>
        </Stack>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Temperature (°C)"
                fullWidth
                valueFilter={numericOnly}
                onChange={handleChange("temperature")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Systolic BP (mmHg)"
                fullWidth
                valueFilter={numericOnly}
                onChange={handleChange("systolic_bp")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Diastolic BP (mmHg)"
                fullWidth
                valueFilter={numericOnly}
                onChange={handleChange("diastolic_bp")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Heart Rate (bpm)"
                fullWidth
                valueFilter={validateInteger}
                onChange={handleChange("heart_rate")}
                rules={[validationRules.integer]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Respiratory Rate"
                fullWidth
                valueFilter={validateInteger}
                onChange={handleChange("respiratory_rate")}
                rules={[validationRules.integer]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Oxygen Saturation (%)"
                fullWidth
                valueFilter={validateInteger}
                onChange={handleChange("oxygen_saturation")}
                rules={[validationRules.integer]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Weight (kg)"
                fullWidth
                valueFilter={numericOnly}
                onChange={handleChange("weight_kg")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Height (cm)"
                fullWidth
                valueFilter={numericOnly}
                onChange={handleChange("height_cm")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Select
                label="Blood Group"
                fullWidth
                clearable
                value={formData.blood_group}
                onChange={handleChange("blood_group")}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Select
                label="Triage Category"
                fullWidth
                required
                value={formData.triage_category}
                onChange={handleChange("triage_category")}
                options={triageCategories}
                optionsValue="value"
                optionsLabel="label"
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Chief Complaint"
                fullWidth
                multiline
                minRows={2}
                onChange={handleChange("chief_complaint")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={2}
                onChange={handleChange("notes")}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1} justifyContent="flex-end" width="100%">
          <Button
            color="inherit"
            onClick={() => modal.close()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            Save
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default RecordVitals;

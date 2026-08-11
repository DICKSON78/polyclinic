import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CHART_TYPES = ["Vital Signs", "Neurological", "Cardiac", "Respiratory", "Renal", "General"];

const NursingChartForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);

  const [formData, setFormData] = useState({
    admission_id: item?.admission_id || "",
    chart_type: item?.chart_type || "Vital Signs",
    charted_at: item?.charted_at || new Date().toISOString().slice(0, 16),
    temp: item?.temp ?? "",
    pulse: item?.pulse ?? "",
    respirations: item?.respirations ?? "",
    bp_systolic: item?.bp_systolic ?? "",
    bp_diastolic: item?.bp_diastolic ?? "",
    spo2: item?.spo2 ?? "",
    gcs: item?.gcs ?? "",
    urine_output_ml: item?.urine_output_ml ?? "",
    notes: item?.notes || "",
  });

  const { data: admissionsData } = useFetch(
    "api/inpatient/admissions",
    { per_page: 500, status: "Admitted" },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost(
    "api/ward-records/nursing-charts",
    formData
  );

  useEffect(() => {
    if (admissionsData) {
      setAdmissionOptions(
        admissionsData.map((a) => ({
          value: a.id,
          label: `${a.admission_no} - ${a.patient?.full_name || "Patient"}`,
        }))
      );
    }
  }, [admissionsData]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  const handleChange = (key) => (value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                label="Admission *"
                fullWidth
                required
                placeholder="Search and select admission"
                value={formData.admission_id}
                onChange={handleChange("admission_id")}
                options={admissionOptions}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Chart Type *"
                fullWidth
                required
                value={formData.chart_type}
                onChange={handleChange("chart_type")}
                options={CHART_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Charted At *"
                fullWidth
                required
                type="datetime-local"
                defaultValue={formData.charted_at}
                onChange={handleChange("charted_at")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Temp (°C)"
                fullWidth
                type="number"
                inputProps={{ step: "0.1", min: 0 }}
                defaultValue={formData.temp}
                onChange={handleChange("temp")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Pulse (bpm)"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.pulse}
                onChange={handleChange("pulse")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Respirations"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.respirations}
                onChange={handleChange("respirations")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="SpO2 (%)"
                fullWidth
                type="number"
                inputProps={{ min: 0, max: 100 }}
                defaultValue={formData.spo2}
                onChange={handleChange("spo2")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="BP Systolic"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.bp_systolic}
                onChange={handleChange("bp_systolic")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="BP Diastolic"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.bp_diastolic}
                onChange={handleChange("bp_diastolic")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="GCS"
                fullWidth
                type="number"
                inputProps={{ min: 3, max: 15 }}
                defaultValue={formData.gcs}
                onChange={handleChange("gcs")}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Urine Output (ml)"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.urine_output_ml}
                onChange={handleChange("urine_output_ml")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.notes}
                onChange={handleChange("notes")}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1} justifyContent="flex-end" width="100%">
          <Button color="inherit" onClick={() => modal.close()} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {item ? "Update Chart" : "Save Chart"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default NursingChartForm;

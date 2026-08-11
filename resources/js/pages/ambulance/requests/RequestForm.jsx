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

const CONDITIONS = ["Stable", "Moderate", "Critical"];
const TRANSPORT_TYPES = ["Emergency", "Routine", "Inter-facility", "Discharge"];

const RequestForm = ({ modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [patientOptions, setPatientOptions] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: "",
    pickup_location: "",
    destination: "",
    pickup_time: "",
    patient_condition: "",
    transport_type: "Emergency",
    special_requirements: "",
    notes: "",
  });

  const { data: patientsData } = useFetch(
    "api/patients",
    { per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/ambulance/requests");

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
                label="Patient"
                fullWidth
                placeholder="Search and select patient"
                value={formData.patient_id}
                onChange={handleChange("patient_id")}
                options={patientOptions}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Transport Type"
                fullWidth
                value={formData.transport_type}
                onChange={handleChange("transport_type")}
                options={TRANSPORT_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Patient Condition"
                fullWidth
                value={formData.patient_condition}
                onChange={handleChange("patient_condition")}
                options={CONDITIONS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pickup Location"
                fullWidth
                required
                defaultValue={formData.pickup_location}
                onChange={handleChange("pickup_location")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination"
                fullWidth
                required
                defaultValue={formData.destination}
                onChange={handleChange("destination")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pickup Time"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.pickup_time}
                onChange={handleChange("pickup_time")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Special Requirements"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.special_requirements}
                onChange={handleChange("special_requirements")}
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
            Create Request
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default RequestForm;

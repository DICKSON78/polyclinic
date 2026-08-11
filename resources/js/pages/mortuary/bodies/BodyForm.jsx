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

import { useFetch, usePost, usePatch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const GENDERS = ["Male", "Female"];

const BodyForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [patientOptions, setPatientOptions] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: item?.patient_id || "",
    deceased_name: item?.deceased_name || "",
    gender: item?.gender || "",
    age: item?.age || "",
    date_of_death: item?.date_of_death || "",
    cause_of_death: item?.cause_of_death || "",
    storage_location: item?.storage_location || "",
    received_by_name: item?.received_by_name || "",
    received_by_phone: item?.received_by_phone || "",
    notes: item?.notes || "",
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

  const { data, loading, error, handlePost } = item
    ? usePatch(`api/mortuary/bodies/${item.id}`, formData)
    : usePost("api/mortuary/bodies", formData);

  useEffect(() => {
    if (patientsData) {
      setPatientOptions([
        ...patientsData.map((p) => ({
          value: p.id,
          label: p.full_name || `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        })),
      ]);
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
                label="Patient (if known)"
                fullWidth
                clearable
                placeholder="Search and select patient"
                value={formData.patient_id}
                onChange={handleChange("patient_id")}
                options={patientOptions}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deceased Name"
                fullWidth
                required
                defaultValue={formData.deceased_name}
                onChange={handleChange("deceased_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Gender"
                fullWidth
                clearable
                value={formData.gender}
                onChange={handleChange("gender")}
                options={GENDERS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Age"
                fullWidth
                valueFilter={(value) => String(value || "").replace(/[^0-9]/g, "")}
                defaultValue={formData.age}
                onChange={handleChange("age")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Death"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.date_of_death}
                onChange={handleChange("date_of_death")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cause of Death"
                fullWidth
                defaultValue={formData.cause_of_death}
                onChange={handleChange("cause_of_death")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Storage Location"
                fullWidth
                defaultValue={formData.storage_location}
                onChange={handleChange("storage_location")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Received By Name"
                fullWidth
                defaultValue={formData.received_by_name}
                onChange={handleChange("received_by_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Received By Phone"
                fullWidth
                defaultValue={formData.received_by_phone}
                onChange={handleChange("received_by_phone")}
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
            {item ? "Update" : "Admit Body"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default BodyForm;

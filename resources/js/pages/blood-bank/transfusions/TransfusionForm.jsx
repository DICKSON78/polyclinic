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

const TransfusionForm = ({ modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [patientOptions, setPatientOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: "",
    unit_id: "",
    indication: "",
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

  const { data: unitsData } = useFetch(
    "api/blood-bank/units",
    { per_page: 500, status: "Available" },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/blood-bank/transfusions");

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
    if (unitsData) {
      setUnitOptions(
        unitsData.map((u) => ({
          value: u.id,
          label: `${u.unit_no} (${u.blood_group}${u.rh_factor === "Negative" ? "-" : "+"}${u.volume_ml ? " - " + u.volume_ml + "ml" : ""})`,
        }))
      );
    }
  }, [unitsData]);

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
                required
                placeholder="Search and select patient"
                value={formData.patient_id}
                onChange={handleChange("patient_id")}
                options={patientOptions}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                label="Blood Unit"
                fullWidth
                required
                placeholder="Select available blood unit"
                value={formData.unit_id}
                onChange={handleChange("unit_id")}
                options={unitOptions}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Indication"
                fullWidth
                defaultValue={formData.indication}
                onChange={handleChange("indication")}
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
            Request Transfusion
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default TransfusionForm;

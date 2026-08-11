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

const ENTRY_TYPES = ["Input", "Output"];

const FluidBalanceForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);

  const [formData, setFormData] = useState({
    admission_id: item?.admission_id || "",
    entry_type: item?.entry_type || "Input",
    amount_ml: item?.amount_ml ?? "",
    route: item?.route || "",
    fluid_type: item?.fluid_type || "",
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
    "api/ward-records/fluid-balances",
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
                label="Entry Type *"
                fullWidth
                required
                value={formData.entry_type}
                onChange={handleChange("entry_type")}
                options={ENTRY_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount (ml) *"
                fullWidth
                required
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={formData.amount_ml}
                onChange={handleChange("amount_ml")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Route"
                fullWidth
                defaultValue={formData.route}
                onChange={handleChange("route")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fluid Type"
                fullWidth
                defaultValue={formData.fluid_type}
                onChange={handleChange("fluid_type")}
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
            {item ? "Update Entry" : "Save Entry"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default FluidBalanceForm;

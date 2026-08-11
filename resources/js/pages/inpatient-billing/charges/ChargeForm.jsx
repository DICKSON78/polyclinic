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

const CHARGE_TYPES = ["Manual", "Medication", "Procedure"];

const ChargeForm = ({ modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);

  const [formData, setFormData] = useState({
    admission_id: "",
    charge_type: "Manual",
    description: "",
    unit_price: "",
    quantity: "1",
    charge_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const { data: admissionsData } = useFetch(
    "api/inpatient/admissions",
    { status: "Admitted", per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost(
    "api/inpatient-billing/charges",
    formData
  );

  useEffect(() => {
    if (admissionsData) {
      setAdmissionOptions(
        admissionsData.map((a) => ({
          value: a.id,
          label: `${a.admission_no} - ${a.patient?.full_name || "Patient"}${
            a.ward?.name ? ` (${a.ward.name})` : ""
          }`,
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
                label="Charge Type"
                fullWidth
                value={formData.charge_type}
                onChange={handleChange("charge_type")}
                options={CHARGE_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Charge Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.charge_date}
                onChange={handleChange("charge_date")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description *"
                fullWidth
                required
                placeholder="e.g. Oxygen therapy"
                defaultValue={formData.description}
                onChange={handleChange("description")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit Price *"
                type="number"
                fullWidth
                required
                defaultValue={formData.unit_price}
                onChange={handleChange("unit_price")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                valueFilter={(value) => String(value || "").replace(/[^0-9.]/g, "")}
                defaultValue={formData.quantity}
                onChange={handleChange("quantity")}
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
            Add Charge
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default ChargeForm;

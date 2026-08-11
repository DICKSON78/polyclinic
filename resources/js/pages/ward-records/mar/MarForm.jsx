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

const ROUTES = ["Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Sublingual", "Rectal", "Other"];
const FREQUENCIES = ["Once", "BD", "TDS", "QID", "Q4H", "Q6H", "Q8H", "OD", "STAT", "PRN", "Other"];
const STATUSES = ["Scheduled", "Given", "Skipped", "Refused", "Withheld"];

const MarForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);
  const [medicationOptions, setMedicationOptions] = useState([]);

  const [formData, setFormData] = useState({
    admission_id: item?.admission_id || "",
    medication_id: item?.medication_id || "",
    dosage: item?.dosage || "",
    route: item?.route || "Oral",
    frequency: item?.frequency || "",
    scheduled_time: item?.scheduled_time || "",
    status: item?.status || "Scheduled",
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

  const { data: medicationsData } = useFetch(
    "api/inventory/medications",
    { per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost(
    "api/ward-records/mar",
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

  useEffect(() => {
    if (medicationsData) {
      setMedicationOptions(
        medicationsData.map((m) => ({
          value: m.id,
          label: m.name || `Medication #${m.id}`,
        }))
      );
    }
  }, [medicationsData]);

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
            <Grid item xs={12}>
              <Select
                label="Medication *"
                fullWidth
                required
                placeholder="Search and select medication"
                value={formData.medication_id}
                onChange={handleChange("medication_id")}
                options={medicationOptions}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dosage"
                fullWidth
                defaultValue={formData.dosage}
                onChange={handleChange("dosage")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Route *"
                fullWidth
                required
                value={formData.route}
                onChange={handleChange("route")}
                options={ROUTES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Frequency"
                fullWidth
                clearable
                value={formData.frequency}
                onChange={handleChange("frequency")}
                options={FREQUENCIES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Scheduled Time"
                fullWidth
                type="datetime-local"
                defaultValue={formData.scheduled_time}
                onChange={handleChange("scheduled_time")}
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
            {item ? "Update MAR" : "Save MAR"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default MarForm;

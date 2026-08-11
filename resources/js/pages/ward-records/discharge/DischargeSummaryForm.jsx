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

const CONDITIONS = ["Stable", "Improved", "Recovered", "Unchanged", "Worsened"];

const DischargeSummaryForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);

  const [formData, setFormData] = useState({
    admission_id: item?.admission_id || "",
    admission_reason: item?.admission_reason || "",
    diagnoses: item?.diagnoses || "",
    procedures: item?.procedures || "",
    medications: item?.medications || "",
    follow_up_instructions: item?.follow_up_instructions || "",
    discharge_condition: item?.discharge_condition || "",
    summary: item?.summary || "",
    doctor_id: item?.doctor_id || "",
    notes: item?.notes || "",
  });

  const { data: admissionsData } = useFetch(
    "api/inpatient/admissions",
    { per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data: staffData } = useFetch(
    "api/ward-records/staff",
    { role: "Doctor" },
    true,
    [],
    (response) => {
      const raw = response.data?.data;
      return Array.isArray(raw) ? raw : [];
    }
  );

  const { data, loading, error, handlePost } = usePost(
    "api/ward-records/discharge-summaries",
    formData
  );

  useEffect(() => {
    if (admissionsData) {
      setAdmissionOptions(
        admissionsData.map((a) => ({
          value: a.id,
          label: `${a.admission_no} - ${a.patient?.full_name || "Patient"}${a.status === "Discharged" ? " (Discharged)" : ""}`,
        }))
      );
    }
  }, [admissionsData]);

  useEffect(() => {
    if (staffData) {
      setDoctorOptions(
        staffData.map((d) => ({
          value: d.id,
          label: d.full_name || `${d.first_name || ""} ${d.last_name || ""}`.trim(),
        }))
      );
    }
  }, [staffData]);

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
              <TextField
                label="Reason for Admission"
                fullWidth
                defaultValue={formData.admission_reason}
                onChange={handleChange("admission_reason")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Diagnoses"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.diagnoses}
                onChange={handleChange("diagnoses")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Procedures Performed"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.procedures}
                onChange={handleChange("procedures")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medications at Discharge"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.medications}
                onChange={handleChange("medications")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Follow-up Instructions"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.follow_up_instructions}
                onChange={handleChange("follow_up_instructions")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Discharge Condition"
                fullWidth
                clearable
                value={formData.discharge_condition}
                onChange={handleChange("discharge_condition")}
                options={CONDITIONS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Doctor"
                fullWidth
                clearable
                value={formData.doctor_id}
                onChange={handleChange("doctor_id")}
                options={doctorOptions}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Summary"
                fullWidth
                multiline
                minRows={3}
                defaultValue={formData.summary}
                onChange={handleChange("summary")}
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
            {item ? "Update Summary" : "Save Summary"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default DischargeSummaryForm;

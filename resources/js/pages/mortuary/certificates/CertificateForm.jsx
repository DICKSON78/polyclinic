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

const GENDERS = ["Male", "Female"];

const CertificateForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [bodyOptions, setBodyOptions] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);

  const [formData, setFormData] = useState({
    body_id: item?.body_id || "",
    patient_id: item?.patient_id || "",
    deceased_name: item?.deceased_name || "",
    gender: item?.gender || "",
    date_of_birth: item?.date_of_birth || "",
    date_of_death: item?.date_of_death || "",
    place_of_death: item?.place_of_death || "",
    cause_of_death: item?.cause_of_death || "",
    doctor_id: item?.doctor_id || "",
    notes: item?.notes || "",
  });

  const { data: bodiesData } = useFetch(
    "api/mortuary/bodies",
    { per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

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

  const { data: doctorsData } = useFetch(
    "api/mortuary/staff",
    { role: "Doctor" },
    true,
    [],
    (response) => {
      const raw = response.data?.data;
      return Array.isArray(raw) ? raw : [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/mortuary/certificates", formData);

  useEffect(() => {
    if (bodiesData) {
      setBodyOptions(
        bodiesData.map((b) => ({
          value: b.id,
          label: `${b.body_no} - ${b.deceased_name}`,
        }))
      );
    }
  }, [bodiesData]);

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

  useEffect(() => {
    if (doctorsData) {
      setDoctorOptions(
        doctorsData.map((d) => ({
          value: d.id,
          label: d.full_name || `${d.first_name || ""} ${d.last_name || ""}`.trim(),
        }))
      );
    }
  }, [doctorsData]);

  useEffect(() => {
    if (item?.body_id) {
      const body = bodiesData?.find((b) => String(b.id) === String(item.body_id));
      if (body) {
        setFormData((prev) => ({
          ...prev,
          deceased_name: prev.deceased_name || body.deceased_name || "",
          gender: prev.gender || body.gender || "",
          date_of_death: prev.date_of_death || body.date_of_death || "",
          cause_of_death: prev.cause_of_death || body.cause_of_death || "",
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.body_id, bodiesData]);

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
                label="Mortuary Body"
                fullWidth
                clearable
                value={formData.body_id}
                onChange={handleChange("body_id")}
                options={bodyOptions}
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
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.date_of_birth}
                onChange={handleChange("date_of_birth")}
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
                label="Place of Death"
                fullWidth
                defaultValue={formData.place_of_death}
                onChange={handleChange("place_of_death")}
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
            <Grid item xs={12}>
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
            Create Certificate
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default CertificateForm;

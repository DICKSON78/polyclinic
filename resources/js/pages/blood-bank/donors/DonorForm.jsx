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

import { usePost, usePatch, useToast } from "../../../hooks";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();
const BLOOD_GROUPS = ["A", "B", "AB", "O"];
const RH_FACTORS = ["Positive", "Negative"];
const GENDERS = ["Male", "Female"];
const STATUSES = ["Active", "Deferred", "Inactive"];

const DonorForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [formData, setFormData] = useState({
    first_name: item?.first_name || "",
    last_name: item?.last_name || "",
    phone: item?.phone || "",
    email: item?.email || "",
    date_of_birth: item?.date_of_birth || "",
    gender: item?.gender || "",
    blood_group: item?.blood_group || "",
    rh_factor: item?.rh_factor || "Positive",
    national_id: item?.national_id || "",
    occupation: item?.occupation || "",
    medical_history: item?.medical_history || "",
    status: item?.status || "Active",
    notes: item?.notes || "",
  });

  const { data, loading, error, handlePost } = item
    ? usePatch(`api/blood-bank/donors/${item.id}`, formData)
    : usePost("api/blood-bank/donors", formData);

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
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                required
                defaultValue={formData.first_name}
                onChange={handleChange("first_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                required
                defaultValue={formData.last_name}
                onChange={handleChange("last_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                defaultValue={formData.phone}
                onChange={handleChange("phone")}
                rules={[validationRules.optionalPhone]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                defaultValue={formData.email}
                onChange={handleChange("email")}
                rules={[validationRules.optionalEmail]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Gender"
                fullWidth
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
              <Select
                label="Blood Group"
                fullWidth
                value={formData.blood_group}
                onChange={handleChange("blood_group")}
                options={BLOOD_GROUPS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="RH Factor"
                fullWidth
                value={formData.rh_factor}
                onChange={handleChange("rh_factor")}
                options={RH_FACTORS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="National ID"
                fullWidth
                defaultValue={formData.national_id}
                onChange={handleChange("national_id")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation"
                fullWidth
                defaultValue={formData.occupation}
                onChange={handleChange("occupation")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medical History"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.medical_history}
                onChange={handleChange("medical_history")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Status"
                fullWidth
                value={formData.status}
                onChange={handleChange("status")}
                options={STATUSES}
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
            {item ? "Update" : "Register Donor"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default DonorForm;

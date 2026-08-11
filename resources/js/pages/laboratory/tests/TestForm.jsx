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
import { formatError, getValidationRules, validateInteger } from "../../../helpers";

const validationRules = getValidationRules();

const TestForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [formData, setFormData] = useState({
    name: item?.name || "",
    code: item?.code || "",
    category: item?.category || "",
    specimen_type: item?.specimen_type || "",
    preparation: item?.preparation || "",
    unit: item?.unit || "",
    reference_range: item?.reference_range || "",
    price: item?.price || "",
    turnaround_time: item?.turnaround_time || "",
    status: item?.status || "Active",
  });

  const { data, loading, error, handlePost } = item
    ? usePatch(`api/laboratory/tests/${item.id}`, formData)
    : usePost("api/laboratory/tests", formData);

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
            <Grid item xs={12} sm={7}>
              <TextField
                label="Name"
                fullWidth
                required
                defaultValue={formData.name}
                onChange={handleChange("name")}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Code"
                fullWidth
                defaultValue={formData.code}
                onChange={handleChange("code")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                fullWidth
                defaultValue={formData.category}
                onChange={handleChange("category")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Specimen Type"
                fullWidth
                defaultValue={formData.specimen_type}
                onChange={handleChange("specimen_type")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit"
                fullWidth
                defaultValue={formData.unit}
                onChange={handleChange("unit")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reference Range"
                fullWidth
                defaultValue={formData.reference_range}
                onChange={handleChange("reference_range")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price (TZS)"
                fullWidth
                valueFilter={(value) => String(value || "").replace(/[^0-9.]/g, "")}
                defaultValue={formData.price}
                onChange={handleChange("price")}
                rules={[validationRules.number]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Turnaround Time (hours)"
                fullWidth
                valueFilter={validateInteger}
                defaultValue={formData.turnaround_time}
                onChange={handleChange("turnaround_time")}
                rules={[validationRules.integer]}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Preparation Instructions"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.preparation}
                onChange={handleChange("preparation")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Status"
                fullWidth
                value={formData.status}
                onChange={handleChange("status")}
                options={["Active", "Inactive"]}
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
            {item ? "Update" : "Save"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default TestForm;

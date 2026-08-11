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
import { formatError } from "../../../helpers";

const VEHICLE_TYPES = ["Ambulance", "Patient Van", "Boat"];
const STATUSES = ["Available", "On-Trip", "Maintenance", "Out-of-Service"];

const VehicleForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [formData, setFormData] = useState({
    registration_no: item?.registration_no || "",
    vehicle_type: item?.vehicle_type || "Ambulance",
    model: item?.model || "",
    capacity: item?.capacity || "",
    driver_name: item?.driver_name || "",
    driver_phone: item?.driver_phone || "",
    attendant_name: item?.attendant_name || "",
    attendant_phone: item?.attendant_phone || "",
    status: item?.status || "Available",
    equipment_notes: item?.equipment_notes || "",
    notes: item?.notes || "",
  });

  const { data, loading, error, handlePost } = item
    ? usePatch(`api/ambulance/vehicles/${item.id}`, formData)
    : usePost("api/ambulance/vehicles", formData);

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
                label="Registration No"
                fullWidth
                required
                defaultValue={formData.registration_no}
                onChange={handleChange("registration_no")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Vehicle Type"
                fullWidth
                value={formData.vehicle_type}
                onChange={handleChange("vehicle_type")}
                options={VEHICLE_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Model"
                fullWidth
                defaultValue={formData.model}
                onChange={handleChange("model")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacity (persons)"
                fullWidth
                valueFilter={(value) => String(value || "").replace(/[^0-9]/g, "")}
                defaultValue={formData.capacity}
                onChange={handleChange("capacity")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Driver Name"
                fullWidth
                defaultValue={formData.driver_name}
                onChange={handleChange("driver_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Driver Phone"
                fullWidth
                defaultValue={formData.driver_phone}
                onChange={handleChange("driver_phone")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Attendant Name"
                fullWidth
                defaultValue={formData.attendant_name}
                onChange={handleChange("attendant_name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Attendant Phone"
                fullWidth
                defaultValue={formData.attendant_phone}
                onChange={handleChange("attendant_phone")}
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
                label="Equipment Notes"
                fullWidth
                multiline
                minRows={2}
                defaultValue={formData.equipment_notes}
                onChange={handleChange("equipment_notes")}
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
            {item ? "Update" : "Add Vehicle"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default VehicleForm;

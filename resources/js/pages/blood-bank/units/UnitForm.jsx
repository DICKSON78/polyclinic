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

const BLOOD_GROUPS = ["A", "B", "AB", "O"];
const RH_FACTORS = ["Positive", "Negative"];
const COMPONENT_TYPES = ["Whole Blood", "Packed Cells", "Plasma", "Platelets", "Cryoprecipitate"];
const STATUSES = ["Available", "Reserved", "Cross-matched", "Issued", "Discarded", "Expired"];

const UnitForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();

  const [formData, setFormData] = useState({
    donor_id: item?.donor_id || "",
    blood_group: item?.blood_group || "",
    rh_factor: item?.rh_factor || "Positive",
    component_type: item?.component_type || "Whole Blood",
    donation_date: item?.donation_date || "",
    expiry_date: item?.expiry_date || "",
    volume_ml: item?.volume_ml || "",
    storage_location: item?.storage_location || "",
    status: item?.status || "Available",
    discard_reason: item?.discard_reason || "",
    notes: item?.notes || "",
  });

  const { data, loading, error, handlePost } = item
    ? usePatch(`api/blood-bank/units/${item.id}`, formData)
    : usePost("api/blood-bank/units", formData);

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
              <Select
                label="Blood Group"
                fullWidth
                required
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
              <Select
                label="Component Type"
                fullWidth
                value={formData.component_type}
                onChange={handleChange("component_type")}
                options={COMPONENT_TYPES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Volume (ml)"
                fullWidth
                valueFilter={(value) => String(value || "").replace(/[^0-9.]/g, "")}
                defaultValue={formData.volume_ml}
                onChange={handleChange("volume_ml")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Donation Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.donation_date}
                onChange={handleChange("donation_date")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Expiry Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={formData.expiry_date}
                onChange={handleChange("expiry_date")}
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
              <Select
                label="Status"
                fullWidth
                value={formData.status}
                onChange={handleChange("status")}
                options={STATUSES}
              />
            </Grid>
            {["Discarded", "Expired"].includes(formData.status) ? (
              <Grid item xs={12}>
                <TextField
                  label="Discard Reason"
                  fullWidth
                  required
                  defaultValue={formData.discard_reason}
                  onChange={handleChange("discard_reason")}
                />
              </Grid>
            ) : null}
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
            {item ? "Update" : "Add Unit"}
          </Button>
        </Stack>
      </CardActions>
    </React.Fragment>
  );
};

export default UnitForm;

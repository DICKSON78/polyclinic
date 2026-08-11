import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  LocalShippingRounded as DispatchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Pending: "warning",
  Assigned: "info",
  "In-Progress": "primary",
  Completed: "success",
  Cancelled: "error",
};

const CONDITION_COLORS = {
  Stable: "success",
  Moderate: "warning",
  Critical: "error",
};

const DispatchForm = ({ item, modal, fetchItem }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);

  const [vehicleId, setVehicleId] = useState();
  const [driverId, setDriverId] = useState();
  const [attendantId, setAttendantId] = useState();
  const [notes, setNotes] = useState("");

  const { data: vehicles } = useFetch(
    "api/ambulance/vehicles",
    { status: "Available", per_page: 500 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: staff } = useFetch(
    "api/ambulance/staff",
    {},
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : [];
    }
  );

  const { data, loading, error, handlePost } = usePost(`api/ambulance/requests/${item.id}/assign`);

  useEffect(() => {
    if (vehicles) {
      setVehicleOptions(
        vehicles.map((v) => ({
          value: v.id,
          label: `${v.registration_no}${v.vehicle_type ? ` - ${v.vehicle_type}` : ""}`,
        }))
      );
    }
  }, [vehicles]);

  useEffect(() => {
    if (staff) {
      setStaffOptions(
        staff.map((s) => ({
          value: s.id,
          label: s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim(),
        }))
      );
    }
  }, [staff]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchItem();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost(null, {
        vehicle_id: vehicleId,
        driver_id: driverId,
        attendant_id: attendantId,
        notes,
      });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Select
                label="Vehicle *"
                fullWidth
                required
                value={vehicleId}
                onChange={setVehicleId}
                options={vehicleOptions}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                label="Driver"
                fullWidth
                value={driverId}
                onChange={setDriverId}
                options={staffOptions}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                label="Attendant"
                fullWidth
                value={attendantId}
                onChange={setAttendantId}
                options={staffOptions}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Dispatch Notes"
                fullWidth
                multiline
                minRows={2}
                value={notes}
                onChange={setNotes}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={() => modal.close()}>
          Cancel
        </Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? "Dispatching..." : "Dispatch Vehicle"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const RequestDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { requestId } = useParams();

  usePrivilege('triage', '/dashboard');

  const modalRef = useRef();

  const {
    data: item,
    loading,
    error,
    handleFetch: fetchItem,
  } = useFetch(
    `api/ambulance/requests/${requestId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  useEffect(() => {
    document.title = `Ambulance Request ${item?.request_no || ""} - ${window.APP_NAME}`;
  }, [item]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const canDispatch = item && ["Pending", "Assigned"].includes(item.status);

  const openDispatch = () => {
    modalRef.current.open(
      "Dispatch Vehicle",
      <DispatchForm item={item} modal={modalRef.current} fetchItem={fetchItem} />,
      "sm"
    );
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ambulance" }, { title: "Requests" }, { title: item?.request_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={item?.request_no || "Ambulance Request"}
          subtitle={item?.patient?.full_name || "Non-patient transport"}
          leading={
            <IconButton onClick={() => navigate("/ambulance/requests")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            item ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {canDispatch ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DispatchIcon />}
                    onClick={openDispatch}
                  >
                    Dispatch Vehicle
                  </Button>
                ) : null}
                <Chip
                  size="small"
                  color={STATUS_COLORS[item.status] || "default"}
                  label={item.status || "-"}
                />
              </Stack>
            ) : null
          }
        />
        <Divider />
        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : !item ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Request not found.</Typography>
          </Stack>
        ) : (
          <CardContent>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader title="Trip Details" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.trip?.vehicle?.registration_no || "Not dispatched"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trip No
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.trip?.trip_no || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trip Status
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.trip?.status || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Requested By
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.requester?.full_name || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Descriptions
              columns={3}
              items={[
                { label: "Transport Type", value: item.transport_type || "-" },
                {
                  label: "Patient Condition",
                  value: item.patient_condition ? (
                    <Chip
                      size="small"
                      color={CONDITION_COLORS[item.patient_condition] || "default"}
                      label={item.patient_condition}
                    />
                  ) : "-",
                },
                { label: "Pickup Location", value: item.pickup_location || "-" },
                { label: "Destination", value: item.destination || "-" },
                { label: "Pickup Time", value: item.pickup_time || "-" },
                { label: "Special Requirements", value: item.special_requirements || "-" },
                { label: "Notes", value: item.notes || "-" },
              ]}
            />
          </CardContent>
        )}
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default RequestDetail;

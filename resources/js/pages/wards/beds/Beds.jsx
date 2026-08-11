import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  RefreshRounded as RefreshIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  BedRounded as BedIcon,
  SingleBedRounded as SingleBedIcon,
  HotelRounded as HotelIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { useFetch, usePost, usePatch, useDelete, useToast } from "../../../hooks";import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationError, validateInteger } from "../../../helpers";
import { green, red, blue, grey } from "@mui/material/colors";

const WardForm = ({ ward, modal, onSuccess }) => {
  const addToast = useToast();
  const isEdit = Boolean(ward);
  const [form, setForm] = useState({
    name: ward?.name || "",
    code: ward?.code || "",
    ward_type: ward?.ward_type || "General",
    floor: ward?.floor || "",
    bed_capacity: ward?.bed_capacity ?? "",
    price_per_day: ward?.price_per_day ?? "",
    description: ward?.description || "",
    status: ward?.status || "Active",
  });

  const { data, loading, error, handlePost } = usePost(isEdit ? `api/inpatient/wards/${ward.id}` : "api/inpatient/wards");
  const { data: patchData, loading: patchLoading, error: patchError, handlePatch } = usePatch(isEdit ? `api/inpatient/wards/${ward.id}` : "api/inpatient/wards");

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (patchError) {
      addToast({ message: formatError(patchError), severity: "error" });
    }
  }, [patchError]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [data]);

  useEffect(() => {
    if (patchData) {
      addToast({ message: patchData.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [patchData]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!form.name.trim() || !form.code.trim()) {
      addToast({ message: getValidationError("Ward name and code are required.").response.data.message, severity: "error" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      ward_type: form.ward_type,
      floor: form.floor || null,
      bed_capacity: form.bed_capacity === "" ? 0 : form.bed_capacity,
      price_per_day: form.price_per_day === "" ? 0 : form.price_per_day,
      description: form.description || null,
      status: form.status,
    };
    if (isEdit) {
      handlePatch(null, payload);
    } else {
      handlePost(null, payload);
    }
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <TextField label="Ward Name" fullWidth required value={form.name} onChange={set("name")} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField label="Code" fullWidth required value={form.code} onChange={set("code")} />
        </Grid>
        <Grid item xs={6}>
          <Select
            label="Ward Type"
            fullWidth
            value={form.ward_type}
            onChange={set("ward_type")}
            options={["General", "Maternity", "Pediatric", "Surgical", "Isolation", "Private"]}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField label="Floor" fullWidth value={form.floor} onChange={set("floor")} />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Bed Capacity"
            fullWidth
            valueFilter={validateInteger}
            value={form.bed_capacity}
            onChange={set("bed_capacity")}
          />
        </Grid>
      </Grid>
      <TextField
        label="Price per Day (TZS)"
        fullWidth
        valueFilter={validateInteger}
        value={form.price_per_day}
        onChange={set("price_per_day")}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        minRows={2}
        value={form.description}
        onChange={set("description")}
      />
      {isEdit && (
        <Select
          label="Status"
          fullWidth
          value={form.status}
          onChange={set("status")}
          options={["Active", "Inactive"]}
        />
      )}
      <Button variant="contained" color="primary" onClick={submit} disabled={loading || patchLoading} fullWidth>
        {isEdit ? "Save Ward" : "Create Ward"}
      </Button>
    </Stack>
  );
};

const BedForm = ({ bed, wardId, modal, onSuccess, wards }) => {
  const addToast = useToast();
  const isEdit = Boolean(bed);
  const [form, setForm] = useState({
    hospital_ward_id: bed?.hospital_ward_id || wardId || "",
    bed_number: bed?.bed_number || "",
    bed_type: bed?.bed_type || "Regular",
  });

  const { data, loading, error, handlePost } = usePost(isEdit ? `api/inpatient/beds/${bed.id}` : "api/inpatient/beds");
  const { data: patchData, loading: patchLoading, error: patchError, handlePatch } = usePatch(isEdit ? `api/inpatient/beds/${bed.id}` : "api/inpatient/beds");

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (patchError) {
      addToast({ message: formatError(patchError), severity: "error" });
    }
  }, [patchError]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [data]);

  useEffect(() => {
    if (patchData) {
      addToast({ message: patchData.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [patchData]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!form.bed_number.trim() || !form.hospital_ward_id) {
      addToast({ message: getValidationError("Bed number and ward are required.").response.data.message, severity: "error" });
      return;
    }
    const payload = {
      hospital_ward_id: form.hospital_ward_id,
      bed_number: form.bed_number.trim(),
      bed_type: form.bed_type,
    };
    if (isEdit) {
      handlePatch(null, payload);
    } else {
      handlePost(null, payload);
    }
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Select
        label="Ward"
        fullWidth
        required
        value={form.hospital_ward_id}
        onChange={set("hospital_ward_id")}
        options={wards.map((w) => ({ value: w.id, label: w.name }))}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField label="Bed Number" fullWidth required value={form.bed_number} onChange={set("bed_number")} />
        </Grid>
        <Grid item xs={6}>
          <Select
            label="Bed Type"
            fullWidth
            value={form.bed_type}
            onChange={set("bed_type")}
            options={["Regular", "Private", "ICU"]}
          />
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={submit} disabled={loading || patchLoading} fullWidth>
        {isEdit ? "Save Bed" : "Add Bed"}
      </Button>
    </Stack>
  );
};

const Beds = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [bedStatusFilter, setBedStatusFilter] = useState(searchParams.get("status") || "");
  const [selectedWardId, setSelectedWardId] = useState();

  const [params, setParams] = useState({
    page: 1,
    per_page: 100,
  });

  const { data: wardsData, loading: wardsLoading, error: wardsError, handleFetch: fetchWards } = useFetch(
    "api/inpatient/wards",
    { per_page: 100 },
    true,
    { data: [], total: 0 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return { data: paginatedData.data || [], total: paginatedData.total || 0 };
    }
  );

  const { data: bedsData, loading: bedsLoading, error: bedsError, handleFetch: fetchBeds } = useFetch(
    "api/inpatient/beds",
    { per_page: 200 },
    true,
    { data: [] },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return { data: paginatedData.data || [] };
    }
  );

  const { data: deleteWardData, error: deleteWardError, handleDelete: deleteWard } = useDelete();
  const { data: deleteBedData, error: deleteBedError, handleDelete: deleteBed } = useDelete();

  useEffect(() => {
    document.title = `Bed Management - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (wardsError) addToast({ message: formatError(wardsError), severity: "error" });
  }, [wardsError]);
  useEffect(() => {
    if (bedsError) addToast({ message: formatError(bedsError), severity: "error" });
  }, [bedsError]);
  useEffect(() => {
    if (deleteWardError) addToast({ message: formatError(deleteWardError), severity: "error" });
  }, [deleteWardError]);
  useEffect(() => {
    if (deleteBedError) addToast({ message: formatError(deleteBedError), severity: "error" });
  }, [deleteBedError]);

  useEffect(() => {
    if (deleteWardData) {
      addToast({ message: deleteWardData.message, severity: "success" });
      fetchWards();
    }
  }, [deleteWardData]);
  useEffect(() => {
    if (deleteBedData) {
      addToast({ message: deleteBedData.message, severity: "success" });
      fetchWards();
      fetchBeds();
    }
  }, [deleteBedData]);

  const wards = wardsData?.data || [];
  const beds = bedsData?.data || [];

  const filteredBeds = beds.filter(
    (b) =>
      (!bedStatusFilter || b.status === bedStatusFilter) &&
      (!selectedWardId || b.hospital_ward_id === selectedWardId)
  );

  const openWardForm = (ward) => {
    modalRef.current.open(
      ward ? `Edit Ward — ${ward.name}` : "New Ward",
      <WardForm ward={ward} modal={modalRef.current} onSuccess={() => { fetchWards(); fetchBeds(); }} />,
      "sm"
    );
  };

  const openBedForm = (bed) => {
    modalRef.current.open(
      bed ? `Edit Bed — ${bed.bed_number}` : "Add Bed",
      <BedForm
        bed={bed}
        wardId={selectedWardId}
        modal={modalRef.current}
        onSuccess={() => { fetchWards(); fetchBeds(); }}
        wards={wards}
      />,
      "sm"
    );
  };

  const handleDeleteWard = (ward) => {
    if (!window.confirm(`Delete ward "${ward.name}"?`)) return;
    deleteWard(`api/inpatient/wards/${ward.id}`);
  };

  const handleDeleteBed = (bed) => {
    if (!window.confirm(`Delete bed "${bed.bed_number}"?`)) return;
    deleteBed(`api/inpatient/beds/${bed.id}`);
  };
  const bedStatusColor = (s) => {
    if (s === "Occupied") return "error";
    if (s === "Available") return "success";
    if (s === "Reserved") return "warning";
    return "default";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Bed Management" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Bed Management"
          subtitle="Wards and bed allocation"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={() => { fetchWards(); fetchBeds(); }} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" size="small" startIcon={<HotelIcon />} onClick={() => openWardForm(null)}>
                New Ward
              </Button>
              <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={() => openBedForm(null)}>
                Add Bed
              </Button>
            </Stack>
          }
        />
        <Divider />
        {(wardsLoading || bedsLoading) && <LinearProgress />}
        <CardContent>
          <Grid container spacing={2} mb={2}>
            {wards.map((ward) => {
              const wardBeds = beds.filter((b) => b.hospital_ward_id === ward.id);
              const occupied = wardBeds.filter((b) => b.status === "Occupied").length;
              const available = wardBeds.filter((b) => b.status === "Available").length;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ward.id}>
                  <Card
                    square
                    variant="outlined"
                    onClick={() => setSelectedWardId(selectedWardId === ward.id ? null : ward.id)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: selectedWardId === ward.id ? "action.selected" : "transparent",
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <BedIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={600} flexGrow={1}>
                          {ward.name}
                        </Typography>
                        <Chip label={ward.code} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {ward.ward_type} • {ward.floor || "No floor"}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1} alignItems="center">
                        <Typography variant="body2">
                          <b>{available}</b> available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color={occupied > 0 ? "error" : "text.secondary"}>
                          <b>{occupied}</b> occupied
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                          <b>{wardBeds.length}</b> beds
                        </Typography>
                        <Box flexGrow={1} />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openWardForm(ward); }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteWard(ward); }}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={2}>
            <Typography variant="h6">Beds</Typography>
            <Box flexGrow={1} />
            <Select
              label="Status"
              size="small"
              value={bedStatusFilter}
              onChange={(v) => {
                setBedStatusFilter(v);
                setSearchParams(v ? { status: v } : {});
              }}
              options={["", "Available", "Occupied", "Reserved", "Maintenance"]}
              renderValue={() => bedStatusFilter || "All statuses"}
            />
          </Stack>
          {filteredBeds.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No beds match the current filters.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {filteredBeds.map((bed) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={bed.id}>
                  <Card
                    square
                    variant="outlined"
                    sx={{
                      borderColor: bed.status === "Occupied" ? red[400] : bed.status === "Available" ? green[400] : grey[400],
                      bgcolor: bed.status === "Occupied" ? red[50] : bed.status === "Available" ? green[50] : grey[50],
                    }}
                  >
                    <CardContent sx={{ py: 1.5, px: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <SingleBedIcon fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={600} flexGrow={1}>
                          {bed.bed_number}
                        </Typography>
                        <IconButton size="small" onClick={() => openBedForm(bed)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteBed(bed)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                      <Chip label={bed.status} size="small" color={bedStatusColor(bed.status)} sx={{ mt: 0.5 }} />
                      {bed.status === "Occupied" && bed.patient && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }} color="text.secondary">
                          {bed.patient.full_name}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Beds;

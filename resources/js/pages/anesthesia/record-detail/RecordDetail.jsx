import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  PlayArrowRounded as StartIcon,
  DoneAllRounded as CompleteIcon,
  CancelRounded as CancelIcon,
  AddRounded as AddVitalIcon,
  DeleteRounded as DeleteVitalIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  "In-Progress": "warning",
  Completed: "success",
  Cancelled: "error",
};

const VitalForm = ({ record, modal, fetchRecord }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [etco2, setEtco2] = useState("");
  const [notes, setNotes] = useState("");

  const { data, loading, error, handlePost } = usePost("api/anesthesia/records");

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchRecord();
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
    handlePost(`api/anesthesia/records/${record.id}/vitals`, {
      recorded_at: recordedAt || undefined,
      heart_rate: heartRate || undefined,
      blood_pressure: bloodPressure || undefined,
      oxygen_saturation: oxygenSaturation || undefined,
      respiratory_rate: respiratoryRate || undefined,
      temperature: temperature || undefined,
      etco2: etco2 || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Recorded At"
                fullWidth
                type="datetime-local"
                value={recordedAt}
                onChange={(value) => setRecordedAt(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Heart Rate"
                fullWidth
                value={heartRate}
                onChange={(value) => setHeartRate(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Blood Pressure"
                fullWidth
                value={bloodPressure}
                onChange={(value) => setBloodPressure(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="O2 Saturation"
                fullWidth
                value={oxygenSaturation}
                onChange={(value) => setOxygenSaturation(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Respiratory Rate"
                fullWidth
                value={respiratoryRate}
                onChange={(value) => setRespiratoryRate(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Temperature"
                fullWidth
                value={temperature}
                onChange={(value) => setTemperature(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="EtCO2"
                fullWidth
                value={etco2}
                onChange={(value) => setEtco2(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={notes}
                onChange={(value) => setNotes(value)}
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
          {loading ? "Saving..." : "Add Reading"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const RecordDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { recordId } = useParams();

  usePrivilege('wards', '/dashboard');

  const modalRef = useRef();

  const {
    data: record,
    loading,
    error,
    handleFetch: fetchRecord,
  } = useFetch(
    `api/anesthesia/records/${recordId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  const { data: actionData, error: actionError, handlePost: handleAction } = usePost("api/anesthesia/records");
  const { data: deleteData, error: deleteError, handleDelete } = useDelete("api/anesthesia/vitals");

  useEffect(() => {
    document.title = `Anesthesia ${record?.record_no || ""} - ${window.APP_NAME}`;
  }, [record]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (actionError) {
      addToast({ message: formatError(actionError), severity: "error" });
    }
  }, [actionError]);

  useEffect(() => {
    if (actionData) {
      addToast({ message: actionData.message, severity: "success" });
      fetchRecord();
    }
  }, [actionData]);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      fetchRecord();
    }
  }, [deleteData]);

  const confirmAction = (title, message, uri) => {
    modalRef.current.open(
      title,
      <ConfirmationDialog
        message={message}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleAction(uri);
        }}
      />,
      "sm"
    );
  };

  const openVitalForm = () => {
    modalRef.current.open(
      "Add Vitals Reading",
      <VitalForm record={record} modal={modalRef.current} fetchRecord={fetchRecord} />,
      "md"
    );
  };

  const confirmDeleteVital = (vital) => {
    modalRef.current.open(
      "Delete Reading",
      <ConfirmationDialog
        message="Delete this vitals reading?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/anesthesia/vitals/${vital.id}`);
        }}
      />,
      "sm"
    );
  };

  const canWorkflow = record && record.status === "In-Progress";

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Anesthesia" }, { title: "Records" }, { title: record?.record_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={record?.record_no || "Anesthesia Record"}
          subtitle={record?.patient?.full_name || ""}
          leading={
            <IconButton onClick={() => navigate("/anesthesia/records")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            record ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {canWorkflow ? (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<StartIcon />}
                      onClick={() =>
                        confirmAction(
                          "Start Induction",
                          "Record anesthesia induction time?",
                          `api/anesthesia/records/${record.id}/start`
                        )
                      }
                    >
                      Induction
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CompleteIcon />}
                      onClick={() =>
                        confirmAction(
                          "Complete Record",
                          "Mark this anesthesia record as completed?",
                          `api/anesthesia/records/${record.id}/complete`
                        )
                      }
                    >
                      Complete
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() =>
                        confirmAction(
                          "Cancel Record",
                          "Cancel this anesthesia record?",
                          `api/anesthesia/records/${record.id}/cancel`
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </React.Fragment>
                ) : null}
                <Button
                  variant="outlined"
                  startIcon={<AddVitalIcon />}
                  onClick={openVitalForm}
                >
                  Add Vitals
                </Button>
                <Chip
                  size="small"
                  color={STATUS_COLORS[record.status] || "default"}
                  label={record.status || "-"}
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
        ) : !record ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Record not found.</Typography>
          </Stack>
        ) : (
          <React.Fragment>
            <CardContent>
              <Descriptions
                columns={3}
                items={[
                  { label: "Anesthesia Type", value: record.anesthesia_type || "-" },
                  { label: "ASA Class", value: record.asa_class || "-" },
                  { label: "Airway", value: record.airway || "-" },
                  { label: "Fasting (h)", value: record.fasting_hours || "-" },
                  { label: "Procedure", value: record.surgery?.procedure_name || "-" },
                  { label: "Admission", value: record.admission?.admission_no || "-" },
                  { label: "Anesthesiologist", value: record.anesthesiologist?.full_name || "-" },
                  { label: "Induction Agent", value: record.induction_agent || "-" },
                  { label: "Induction Time", value: record.induction_time || "-" },
                  { label: "Emergence Time", value: record.emergence_time || "-" },
                  { label: "Recovery Time", value: record.recovery_time || "-" },
                  { label: "Maintenance Agents", value: record.maintenance_agents || "-" },
                  { label: "IV Fluids (ml)", value: record.iv_fluids_ml || "-" },
                  { label: "Blood Transfusion (ml)", value: record.blood_transfusion_ml || "-" },
                  { label: "Urine Output (ml)", value: record.urine_output_ml || "-" },
                  { label: "Blood Loss (ml)", value: record.blood_loss_ml || "-" },
                ]}
              />

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader title="Pre-op & Complications" />
                <Divider />
                <CardContent>
                  <Descriptions
                    columns={2}
                    items={[
                      { label: "Allergies", value: record.allergies || "-" },
                      { label: "Reversal Agents", value: record.reversal_agents || "-" },
                      { label: "Pre-op Assessment", value: record.pre_op_assessment || "-" },
                      { label: "Intra-op Complications", value: record.intraop_complications || "-" },
                      { label: "Post-op Complications", value: record.postop_complications || "-" },
                      { label: "Post-op Instructions", value: record.postop_instructions || "-" },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader
                  title="Vitals Chart"
                  subheader={`${record.vitals?.length || 0} reading(s)`}
                />
                <Divider />
                <CardContent>
                  {!record.vitals?.length ? (
                    <Typography color="text.secondary">No vitals readings yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {record.vitals.map((v) => (
                        <Card variant="outlined" key={v.id}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {v.recorded_at || "-"}
                              </Typography>
                              <Tooltip title="Delete Reading">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => confirmDeleteVital(v)}
                                  >
                                    <DeleteVitalIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  HR
                                </Typography>
                                <Typography variant="body2">{v.heart_rate || "-"}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  BP
                                </Typography>
                                <Typography variant="body2">{v.blood_pressure || "-"}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  SpO2
                                </Typography>
                                <Typography variant="body2">{v.oxygen_saturation || "-"}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  RR
                                </Typography>
                                <Typography variant="body2">{v.respiratory_rate || "-"}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Temp
                                </Typography>
                                <Typography variant="body2">{v.temperature || "-"}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  EtCO2
                                </Typography>
                                <Typography variant="body2">{v.etco2 || "-"}</Typography>
                              </Grid>
                              {v.notes ? (
                                <Grid size={{ xs: 12 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {v.notes}
                                  </Typography>
                                </Grid>
                              ) : null}
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </React.Fragment>
        )}
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default RecordDetail;

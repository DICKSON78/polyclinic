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
  PlayArrowRounded as StartIcon,
  LocalHospitalRounded as AdmitIcon,
  LogoutRounded as DischargeIcon,
  PersonRounded as PatientIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Waiting: "warning",
  "In-Treatment": "info",
  Admitted: "success",
  Discharged: "default",
  Referred: "primary",
  Cancelled: "error",
};

const PRIORITY_COLORS = {
  Stable: "success",
  Serious: "warning",
  Critical: "error",
};

const AdmitForm = ({ visit, modal, fetchVisit }) => {
  const addToast = useToast();
  const formRef = useRef();
  const bedRef = useRef();
  const conditionRef = useRef();

  const [bedId, setBedId] = useState();
  const [condition, setCondition] = useState(visit?.priority || "Stable");
  const [admissionReason, setAdmissionReason] = useState(visit?.chief_complaint || "");

  const { data: beds, loading: loadingBeds } = useFetch(
    "api/inpatient/beds",
    { status: "Available", per_page: 500 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data, loading, error, handlePost } = usePost("api/emergency/visits");

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchVisit();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const bedOptions = (beds || []).map((b) => ({
    value: b.id,
    label: `${b.bed_number || `Bed #${b.id}`}${b.ward?.name ? ` - ${b.ward.name}` : ""}`,
  }));

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost(`api/emergency/visits/${visit.id}/admit`, {
        bed_id: bedId,
        condition,
        admission_reason: admissionReason,
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
                ref={bedRef}
                label="Available Bed *"
                fullWidth
                required
                options={bedOptions}
                value={bedId}
                onChange={(value) => setBedId(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                ref={conditionRef}
                label="Condition *"
                fullWidth
                required
                options={["Stable", "Serious", "Critical"]}
                value={condition}
                onChange={(value) => setCondition(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Admission Reason"
                fullWidth
                multiline
                rows={2}
                value={admissionReason}
                onChange={(value) => setAdmissionReason(value)}
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
          {loading ? "Admitting..." : "Admit Patient"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const DischargeForm = ({ visit, modal, fetchVisit }) => {
  const addToast = useToast();
  const formRef = useRef();
  const outcomeRef = useRef();
  const referralRef = useRef();

  const [outcome, setOutcome] = useState("");
  const [referralTo, setReferralTo] = useState("");

  const { data, loading, error, handlePost } = usePost("api/emergency/visits");

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchVisit();
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
    handlePost(`api/emergency/visits/${visit.id}/discharge`, {
      outcome,
      referral_to: referralTo || undefined,
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
                ref={referralRef}
                label="Referral To (leave empty to discharge)"
                fullWidth
                value={referralTo}
                onChange={(value) => setReferralTo(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                ref={outcomeRef}
                label="Outcome / Discharge Notes"
                fullWidth
                multiline
                rows={3}
                value={outcome}
                onChange={(value) => setOutcome(value)}
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
          {loading ? "Saving..." : referralTo ? "Refer Patient" : "Discharge Patient"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const VisitDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { visitId } = useParams();

  usePrivilege('triage', '/dashboard');

  const modalRef = useRef();

  const {
    data: visit,
    loading,
    error,
    handleFetch: fetchVisit,
  } = useFetch(
    `api/emergency/visits/${visitId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  const { data: startData, error: startError, handlePost: handleStart } = usePost("api/emergency/visits");

  useEffect(() => {
    document.title = `ER Visit ${visit?.visit_no || ""} - ${window.APP_NAME}`;
  }, [visit]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (startError) {
      addToast({ message: formatError(startError), severity: "error" });
    }
  }, [startError]);

  useEffect(() => {
    if (startData) {
      addToast({ message: startData.message, severity: "success" });
      fetchVisit();
    }
  }, [startData]);

  const openAdmitModal = () => {
    modalRef.current.open(
      "Admit to Ward",
      <AdmitForm visit={visit} modal={modalRef.current} fetchVisit={fetchVisit} />,
      "sm"
    );
  };

  const openDischargeModal = () => {
    modalRef.current.open(
      "Discharge / Refer",
      <DischargeForm visit={visit} modal={modalRef.current} fetchVisit={fetchVisit} />,
      "sm"
    );
  };

  const confirmStart = () => {
    modalRef.current.open(
      "Start Treatment",
      <ConfirmationDialog
        message="Mark this visit as in-treatment and assign yourself as attending doctor?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleStart(`api/emergency/visits/${visit.id}/start-treatment`);
        }}
      />,
      "sm"
    );
  };

  const canAct = visit && ["Waiting", "In-Treatment"].includes(visit.status);

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Emergency" }, { title: "Visits" }, { title: visit?.visit_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={visit?.visit_no || "ER Visit"}
          subtitle={visit?.patient?.full_name || ""}
          leading={
            <IconButton onClick={() => navigate("/emergency/visits")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            visit ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {visit.status === "Waiting" ? (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<StartIcon />}
                    onClick={confirmStart}
                  >
                    Start Treatment
                  </Button>
                ) : null}
                {canAct ? (
                  <React.Fragment>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AdmitIcon />}
                      onClick={openAdmitModal}
                    >
                      Admit
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DischargeIcon />}
                      onClick={openDischargeModal}
                    >
                      Discharge / Refer
                    </Button>
                  </React.Fragment>
                ) : null}
                <Chip
                  size="small"
                  color={STATUS_COLORS[visit.status] || "default"}
                  label={visit.status || "-"}
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
        ) : !visit ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Visit not found.</Typography>
          </Stack>
        ) : (
          <React.Fragment>
            <CardContent>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader title="Triage & Priority" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Triage Category
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {visit.triage_category || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Priority
                      </Typography>
                      <Chip
                        size="small"
                        color={PRIORITY_COLORS[visit.priority] || "default"}
                        label={visit.priority || "-"}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Attending Doctor
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {visit.doctor?.full_name || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Attending Nurse
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {visit.nurse?.full_name || "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Descriptions
                columns={3}
                items={[
                  { label: "Arrival Time", value: visit.arrival_time || "-" },
                  { label: "Seen Time", value: visit.seen_time || "-" },
                  { label: "Discharge Time", value: visit.discharge_time || "-" },
                  { label: "Chief Complaint", value: visit.chief_complaint || "-" },
                  { label: "History", value: visit.history || "-" },
                  { label: "Assessment", value: visit.assessment || "-" },
                  { label: "Diagnosis", value: visit.diagnosis || "-" },
                  { label: "Treatment", value: visit.treatment || "-" },
                  { label: "Outcome", value: visit.outcome || "-" },
                  { label: "Disposition", value: visit.disposition || "-" },
                  { label: "Admission", value: visit.admission?.admission_no || "-" },
                  { label: "Referral To", value: visit.referral_to || "-" },
                ]}
              />
            </CardContent>
          </React.Fragment>
        )}
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default VisitDetail;

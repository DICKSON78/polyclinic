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
  CheckRounded as CompleteIcon,
  CancelRounded as CancelIcon,
  BloodtypeRounded as CrossMatchIcon,
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
  Requested: "warning",
  "Cross-matching": "info",
  "In-Progress": "primary",
  Completed: "success",
  Cancelled: "error",
};

const REACTION_COLORS = {
  None: "success",
  Febrile: "warning",
  Allergic: "warning",
  Hemolytic: "error",
  Other: "default",
};

const CrossMatchForm = ({ item, modal, fetchItem }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [result, setResult] = useState();
  const [notes, setNotes] = useState("");

  const { data, loading, error, handlePost } = usePost(`api/blood-bank/transfusions/${item.id}/cross-match`);

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
      handlePost(null, { result, notes });
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
                label="Cross-Match Result *"
                fullWidth
                required
                value={result}
                onChange={setResult}
                options={[
                  { value: "Compatible", label: "Compatible" },
                  { value: "Incompatible", label: "Incompatible" },
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
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
          {loading ? "Saving..." : "Record Result"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const CompleteForm = ({ item, modal, fetchItem }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [vitalsBefore, setVitalsBefore] = useState("");
  const [vitalsAfter, setVitalsAfter] = useState("");
  const [reaction, setReaction] = useState("None");
  const [reactionNotes, setReactionNotes] = useState("");
  const [outcome, setOutcome] = useState("");

  const { data, loading, error, handlePost } = usePost(`api/blood-bank/transfusions/${item.id}/complete`);

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
        vitals_before: vitalsBefore,
        vitals_after: vitalsAfter,
        reaction,
        reaction_notes: reactionNotes,
        outcome,
      });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Vitals Before"
                fullWidth
                value={vitalsBefore}
                onChange={setVitalsBefore}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Vitals After"
                fullWidth
                value={vitalsAfter}
                onChange={setVitalsAfter}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                label="Reaction"
                fullWidth
                value={reaction}
                onChange={setReaction}
                options={Object.keys(REACTION_COLORS)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reaction Notes"
                fullWidth
                multiline
                minRows={2}
                value={reactionNotes}
                onChange={setReactionNotes}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Outcome"
                fullWidth
                multiline
                minRows={2}
                value={outcome}
                onChange={setOutcome}
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
          {loading ? "Saving..." : "Complete Transfusion"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const TransfusionDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { transfusionId } = useParams();

  usePrivilege('laboratory', '/dashboard');

  const modalRef = useRef();

  const {
    data: item,
    loading,
    error,
    handleFetch: fetchItem,
  } = useFetch(
    `api/blood-bank/transfusions/${transfusionId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  const { data: actionData, error: actionError, handlePost: handleAction } = usePost("api/blood-bank/transfusions");

  useEffect(() => {
    document.title = `Transfusion ${item?.transfusion_no || ""} - ${window.APP_NAME}`;
  }, [item]);

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
      fetchItem();
    }
  }, [actionData]);

  const openCrossMatch = () => {
    modalRef.current.open(
      "Cross-Match Result",
      <CrossMatchForm item={item} modal={modalRef.current} fetchItem={fetchItem} />,
      "sm"
    );
  };

  const openComplete = () => {
    modalRef.current.open(
      "Complete Transfusion",
      <CompleteForm item={item} modal={modalRef.current} fetchItem={fetchItem} />,
      "md"
    );
  };

  const confirmStart = () => {
    modalRef.current.open(
      "Start Transfusion",
      <ConfirmationDialog
        message="Mark this transfusion as in-progress and issue the blood unit?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleAction(`api/blood-bank/transfusions/${item.id}/start`);
        }}
      />,
      "sm"
    );
  };

  const confirmCancel = () => {
    modalRef.current.open(
      "Cancel Transfusion",
      <ConfirmationDialog
        message="Are you sure you want to cancel this transfusion and release the blood unit?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleAction(`api/blood-bank/transfusions/${item.id}/cancel`);
        }}
      />,
      "sm"
    );
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Blood Bank" }, { title: "Transfusions" }, { title: item?.transfusion_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={item?.transfusion_no || "Transfusion"}
          subtitle={item?.patient?.full_name || ""}
          leading={
            <IconButton onClick={() => navigate("/blood-bank/transfusions")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            item ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["Requested", "Cross-matching"].includes(item.status) ? (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<CrossMatchIcon />}
                    onClick={openCrossMatch}
                  >
                    Cross-Match
                  </Button>
                ) : null}
                {["Requested", "Cross-matching"].includes(item.status) ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<StartIcon />}
                    onClick={confirmStart}
                  >
                    Start
                  </Button>
                ) : null}
                {item.status === "In-Progress" ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CompleteIcon />}
                    onClick={openComplete}
                  >
                    Complete
                  </Button>
                ) : null}
                {!["Completed", "Cancelled"].includes(item.status) ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={confirmCancel}
                  >
                    Cancel
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
            <Typography color="text.secondary">Transfusion not found.</Typography>
          </Stack>
        ) : (
          <CardContent>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader title="Patient" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Patient
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.patient?.full_name || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Patient No
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.patient?.patient_number || "-"}
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
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Administered By
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.administered_by ? item.administeredBy?.full_name || "-" : "Not assigned"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader title="Blood Unit" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Unit No
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.unit?.unit_no || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Blood Type
                    </Typography>
                    <Chip
                      size="small"
                      color="error"
                      label={item.unit ? `${item.unit.blood_group}${item.unit.rh_factor === "Negative" ? "-" : "+"}` : "-"}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Component
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.unit?.component_type || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Expiry
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {item.unit?.expiry_date || "-"}
                    </Typography>
                  </Grid>
                  {item.unit?.donor ? (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Donor
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {item.unit.donor.full_name || "-"}
                      </Typography>
                    </Grid>
                  ) : null}
                </Grid>
              </CardContent>
            </Card>

            <Descriptions
              columns={3}
              items={[
                { label: "Indication", value: item.indication || "-" },
                { label: "Cross-Match", value: item.cross_match || "Pending" },
                { label: "Cross-Match Time", value: item.cross_match_time || "-" },
                { label: "Started At", value: item.started_at || "-" },
                { label: "Ended At", value: item.ended_at || "-" },
                {
                  label: "Reaction",
                  value: item.reaction ? (
                    <Chip
                      size="small"
                      color={REACTION_COLORS[item.reaction] || "default"}
                      label={item.reaction}
                    />
                  ) : "-",
                },
                { label: "Vitals Before", value: item.vitals_before || "-" },
                { label: "Vitals After", value: item.vitals_after || "-" },
                { label: "Reaction Notes", value: item.reaction_notes || "-" },
                { label: "Outcome", value: item.outcome || "-" },
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

export default TransfusionDetail;

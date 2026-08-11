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
  CheckCircleRounded as ReadyIcon,
  PlayArrowRounded as StartIcon,
  DoneAllRounded as CompleteIcon,
  CancelRounded as CancelIcon,
  NoteAddRounded as NoteIcon,
  DeleteRounded as DeleteNoteIcon,
  PersonRounded as PatientIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Scheduled: "default",
  Ready: "info",
  "In-Progress": "warning",
  Completed: "success",
  Postponed: "secondary",
  Cancelled: "error",
};

const NOTE_TYPE_COLORS = {
  "Pre-op": "info",
  "Intra-op": "warning",
  "Post-op": "success",
  Other: "default",
};

const CompleteForm = ({ surgery, modal, fetchSurgery }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [postOpDiagnosis, setPostOpDiagnosis] = useState("");
  const [intraOpNotes, setIntraOpNotes] = useState("");
  const [postOpNotes, setPostOpNotes] = useState("");
  const [bloodLoss, setBloodLoss] = useState("");
  const [complications, setComplications] = useState("");
  const [outcome, setOutcome] = useState("");

  const { data, loading, error, handlePost } = usePost("api/operating-theatre/surgeries");

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchSurgery();
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
    handlePost(`api/operating-theatre/surgeries/${surgery.id}/complete`, {
      post_op_diagnosis: postOpDiagnosis || undefined,
      intra_op_notes: intraOpNotes || undefined,
      post_op_notes: postOpNotes || undefined,
      blood_loss_ml: bloodLoss || undefined,
      complications: complications || undefined,
      outcome: outcome || undefined,
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
                label="Post-op Diagnosis"
                fullWidth
                value={postOpDiagnosis}
                onChange={(value) => setPostOpDiagnosis(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Blood Loss (ml)"
                fullWidth
                value={bloodLoss}
                onChange={(value) => setBloodLoss(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Outcome"
                fullWidth
                value={outcome}
                onChange={(value) => setOutcome(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Intra-op Notes"
                fullWidth
                multiline
                rows={3}
                value={intraOpNotes}
                onChange={(value) => setIntraOpNotes(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Post-op Notes"
                fullWidth
                multiline
                rows={3}
                value={postOpNotes}
                onChange={(value) => setPostOpNotes(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Complications"
                fullWidth
                multiline
                rows={2}
                value={complications}
                onChange={(value) => setComplications(value)}
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
        <Button variant="contained" color="success" disabled={loading} onClick={handleSubmit}>
          {loading ? "Saving..." : "Complete Surgery"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const NoteForm = ({ surgery, modal, fetchSurgery }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [noteType, setNoteType] = useState("Intra-op");
  const [note, setNote] = useState("");

  const { data, loading, error, handlePost } = usePost("api/operating-theatre/surgeries");

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchSurgery();
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
      handlePost(`api/operating-theatre/surgeries/${surgery.id}/notes`, {
        note_type: noteType,
        note,
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
                label="Note Type *"
                fullWidth
                required
                options={["Pre-op", "Intra-op", "Post-op", "Other"]}
                value={noteType}
                onChange={(value) => setNoteType(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Note *"
                fullWidth
                multiline
                rows={3}
                required
                value={note}
                onChange={(value) => setNote(value)}
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
          {loading ? "Saving..." : "Add Note"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const SurgeryDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { surgeryId } = useParams();

  usePrivilege('wards', '/dashboard');

  const modalRef = useRef();

  const {
    data: surgery,
    loading,
    error,
    handleFetch: fetchSurgery,
  } = useFetch(
    `api/operating-theatre/surgeries/${surgeryId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  const { data: actionData, error: actionError, handlePost: handleAction } = usePost("api/operating-theatre/surgeries");
  const { data: deleteData, error: deleteError, handleDelete } = useDelete("api/operating-theatre/notes");

  useEffect(() => {
    document.title = `Surgery ${surgery?.surgery_no || ""} - ${window.APP_NAME}`;
  }, [surgery]);

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
      fetchSurgery();
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
      fetchSurgery();
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

  const openComplete = () => {
    modalRef.current.open(
      "Complete Surgery",
      <CompleteForm surgery={surgery} modal={modalRef.current} fetchSurgery={fetchSurgery} />,
      "md"
    );
  };

  const openCancel = () => {
    modalRef.current.open(
      "Cancel Surgery",
      <ConfirmationDialog
        message="Cancel this surgery?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleAction(`api/operating-theatre/surgeries/${surgery.id}/cancel`, {
            cancel_reason: "Cancelled by clinician",
          });
        }}
      />,
      "sm"
    );
  };

  const openNote = () => {
    modalRef.current.open(
      "Add Surgical Note",
      <NoteForm surgery={surgery} modal={modalRef.current} fetchSurgery={fetchSurgery} />,
      "sm"
    );
  };

  const confirmDeleteNote = (note) => {
    modalRef.current.open(
      "Delete Note",
      <ConfirmationDialog
        message="Delete this surgical note?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/operating-theatre/notes/${note.id}`);
        }}
      />,
      "sm"
    );
  };

  const canWorkflow = surgery && !["Completed", "Cancelled"].includes(surgery.status);

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Operating Theatre" }, { title: "Surgeries" }, { title: surgery?.surgery_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={surgery?.surgery_no || "Surgery"}
          subtitle={surgery?.patient?.full_name || ""}
          leading={
            <IconButton onClick={() => navigate("/operating-theatre/surgeries")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            surgery ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {surgery.status === "Scheduled" ? (
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<ReadyIcon />}
                    onClick={() =>
                      confirmAction(
                        "Mark Ready",
                        "Mark this surgery as ready for theatre?",
                        `api/operating-theatre/surgeries/${surgery.id}/ready`
                      )
                    }
                  >
                    Mark Ready
                  </Button>
                ) : null}
                {["Scheduled", "Ready"].includes(surgery.status) ? (
                  <Button
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={() =>
                      confirmAction(
                        "Start Surgery",
                        "Start this surgery now?",
                        `api/operating-theatre/surgeries/${surgery.id}/start`
                      )
                    }
                  >
                    Start
                  </Button>
                ) : null}
                {surgery.status === "In-Progress" ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CompleteIcon />}
                    onClick={openComplete}
                  >
                    Complete
                  </Button>
                ) : null}
                {canWorkflow ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={openCancel}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  variant="outlined"
                  startIcon={<NoteIcon />}
                  onClick={openNote}
                >
                  Add Note
                </Button>
                <Chip
                  size="small"
                  color={STATUS_COLORS[surgery.status] || "default"}
                  label={surgery.status || "-"}
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
        ) : !surgery ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Surgery not found.</Typography>
          </Stack>
        ) : (
          <React.Fragment>
            <CardContent>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader title="Team & Schedule" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Surgeon
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {surgery.surgeon?.full_name || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Assistant Surgeon
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {surgery.assistant_surgeon?.full_name || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Anesthesiologist
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {surgery.anesthesiologist?.full_name || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Scrub Nurse
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {surgery.scrub_nurse?.full_name || "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Descriptions
                columns={3}
                items={[
                  { label: "Theatre", value: surgery.theatre?.name || "-" },
                  { label: "Procedure", value: surgery.procedure_name || "-" },
                  { label: "Type", value: surgery.procedure_type || "-" },
                  { label: "Scheduled At", value: surgery.scheduled_at || "-" },
                  { label: "Started At", value: surgery.started_at || "-" },
                  { label: "Ended At", value: surgery.ended_at || "-" },
                  { label: "Duration (min)", value: surgery.duration_minutes ?? "-" },
                  { label: "Admission", value: surgery.admission?.admission_no || "-" },
                  { label: "Pre-op Diagnosis", value: surgery.pre_op_diagnosis || "-" },
                  { label: "Post-op Diagnosis", value: surgery.post_op_diagnosis || "-" },
                  { label: "Blood Loss", value: surgery.blood_loss_ml || "-" },
                  { label: "Outcome", value: surgery.outcome || "-" },
                  { label: "Cancel Reason", value: surgery.cancel_reason || "-" },
                ]}
              />

              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader
                  title="Surgical Notes"
                  subheader={`${surgery.notes?.length || 0} note(s)`}
                />
                <Divider />
                <CardContent>
                  {!surgery.notes?.length ? (
                    <Typography color="text.secondary">No notes yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {surgery.notes.map((note) => (
                        <Card variant="outlined" key={note.id}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  size="small"
                                  color={NOTE_TYPE_COLORS[note.note_type] || "default"}
                                  label={note.note_type || "-"}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {note.author?.full_name || "-"} · {note.created_at || "-"}
                                </Typography>
                              </Stack>
                              <Tooltip title="Delete Note">
                                <span>
                                  <IconButton size="small" color="error" onClick={() => confirmDeleteNote(note)}>
                                    <DeleteNoteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                              {note.note}
                            </Typography>
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

export default SurgeryDetail;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  RefreshRounded as RefreshIcon,
  SwapHorizRounded as TransferIcon,
  LogoutRounded as DischargeIcon,
  HistoryRounded as HistoryIcon,
  NoteAddRounded as NoteIcon,
  StickyNote2Rounded as NotesIcon,
  DeleteRounded as DeleteNoteIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import { useFetch, usePost, useDelete, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge, getValidationError } from "../../../helpers";

const NoteForm = ({ admissionId, modal, onSuccess }) => {
  const addToast = useToast();
  const [noteType, setNoteType] = useState("Progress");
  const [noteText, setNoteText] = useState("");
  const { data, loading, error, handlePost } = usePost("api/inpatient/notes");

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [data]);

  const submit = () => {
    if (!noteText.trim()) {
      addToast({ message: getValidationError("Please enter the note text.").response.data.message, severity: "error" });
      return;
    }
    handlePost(null, {
      admission_id: admissionId,
      note_type: noteType,
      note_text: noteText.trim(),
    });
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Select
        label="Note Type"
        fullWidth
        value={noteType}
        onChange={setNoteType}
        options={["Progress", "Nursing", "Physician", "Procedure", "Other"]}
      />
      <TextField
        label="Note"
        fullWidth
        multiline
        minRows={4}
        required
        value={noteText}
        onChange={setNoteText}
        placeholder="Write the clinical / progress note..."
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<NoteIcon />}
        onClick={submit}
        disabled={loading}
        fullWidth
      >
        Save Note
      </Button>
    </Stack>
  );
};

const TransferForm = ({ admission, modal, onSuccess }) => {
  const addToast = useToast();
  const [bedId, setBedId] = useState();
  const [bedOptions, setBedOptions] = useState([]);
  const { data: bedsData } = useFetch(
    "api/inpatient/beds",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );
  const { data, loading, error, handlePost } = usePost(`api/inpatient/admissions/${admission.id}/transfer`);

  useEffect(() => {
    if (bedsData) {
      const available = bedsData.filter(
        (b) => b.status === "Available" && b.id !== admission.bed_id
      );
      setBedOptions(
        available.map((b) => ({
          value: b.id,
          label: `${b.ward?.name || "Ward"} — Bed ${b.bed_number}${b.bed_type && b.bed_type !== "Regular" ? ` (${b.bed_type})` : ""}`,
        }))
      );
    }
  }, [bedsData]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      modal.close();
      onSuccess();
    }
  }, [data]);

  const submit = () => {
    if (!bedId) {
      addToast({ message: getValidationError("Please select a bed.").response.data.message, severity: "error" });
      return;
    }
    handlePost(null, { bed_id: bedId });
  };

  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Select
        label="New Bed"
        fullWidth
        required
        placeholder="Select available bed"
        value={bedId}
        onChange={setBedId}
        options={bedOptions}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<TransferIcon />}
        onClick={submit}
        disabled={loading}
        fullWidth
      >
        Transfer Patient
      </Button>
    </Stack>
  );
};

const AdmissionDetails = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const { admissionId } = useParams();

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    `api/inpatient/admissions/${admissionId}`,
    null,
    true,
    null,
    (response) => response.data?.data || null
  );

  const { data: dischargeData, loading: dischargeLoading, error: dischargeError, handlePost: dischargePatient } = usePost(`api/inpatient/admissions/${admissionId}/discharge`);
  const { data: noteDeleteData, error: noteDeleteError, handleDelete: deleteNote } = useDelete();

  useEffect(() => {
    document.title = `Admission ${admissionId} - ${window.APP_NAME}`;
  }, []);

  const showError = (err) => {
    if (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  useEffect(() => showError(error), [error]);
  useEffect(() => showError(dischargeError), [dischargeError]);
  useEffect(() => showError(noteDeleteError), [noteDeleteError]);

  useEffect(() => {
    if (dischargeData) {
      addToast({ message: dischargeData.message, severity: "success" });
      handleFetch();
    }
  }, [dischargeData]);

  useEffect(() => {
    if (noteDeleteData) {
      addToast({ message: noteDeleteData.message, severity: "success" });
      handleFetch();
    }
  }, [noteDeleteData]);

  const confirmDischarge = () => {
    const reason = window.prompt("Enter discharge reason:");
    if (reason === null) return;
    const notes = window.prompt("Enter discharge notes (optional):", "");
    if (notes === null) return;
    dischargePatient(null, {
      discharge_reason: reason.trim() || null,
      discharge_notes: notes.trim() || null,
    });
  };

  const openTransfer = () => {
    modalRef.current.open(
      "Transfer to Another Bed",
      <TransferForm
        admission={data}
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "sm"
    );
  };

  const openNote = () => {
    modalRef.current.open(
      "Add Inpatient Note",
      <NoteForm
        admissionId={data.id}
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "sm"
    );
  };

  const handleDeleteNote = (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    deleteNote(`api/inpatient/notes/${noteId}`);
  };

  if (loading) {
    return (
      <Page breadcrumbs={[{ title: "Wards / Inpatient" }, { title: "Loading..." }]}>
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page breadcrumbs={[{ title: "Wards / Inpatient" }, { title: "Admission" }]}>
        <Card square variant="outlined">
          <CardContent>
            <Typography>Admission not found.</Typography>
          </CardContent>
        </Card>
      </Page>
    );
  }

  const patient = data.patient || {};
  const isAdmitted = data.status === "Admitted";
  const conditionColor = (c) => {
    if (c === "Critical") return "error";
    if (c === "Serious") return "warning";
    return "success";
  };
  const noteTypeColor = (t) => {
    if (t === "Physician") return "info";
    if (t === "Nursing") return "secondary";
    if (t === "Procedure") return "warning";
    if (t === "Other") return "default";
    return "primary";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Admissions" },
        { title: data.admission_no },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title={data.admission_no}
          subtitle={`Admitted ${data.admission_date ? new Date(data.admission_date).toLocaleString() : ""}`}
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/wards/admissions")}>
              <BackIcon fontSize="small" />
            </Button>
          }
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Patient Admission History">
                <IconButton size="small" onClick={() => navigate(`/wards/patients/${patient.id}/history`)}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
            <Chip label={data.status} color={isAdmitted ? "success" : "default"} />
            <Chip label={data.condition} color={conditionColor(data.condition)} />
            <Chip
              label={`${data.ward?.name || "No ward"} • ${data.bed?.bed_number || "No bed"}`}
              variant="outlined"
            />
            {data.discharge_date && (
              <Chip
                label={`Discharged ${new Date(data.discharge_date).toLocaleString()}`}
                variant="outlined"
                color="info"
              />
            )}
          </Stack>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
              <Typography variant="body1" fontWeight={500}>
                {patient.full_name || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {getAge(patient.date_of_birth) || "—"} • Gender: {patient.gender || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1" fontWeight={500}>{patient.phone || "—"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Admitted By</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.admitted_by?.full_name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Attending Doctor</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.doctor?.full_name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Admission Reason</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.admission_reason || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.diagnosis || "—"}
              </Typography>
            </Grid>
            {data.status === "Discharged" && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Discharged By</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {data.discharged_by?.full_name || "—"}
                </Typography>
              </Grid>
            )}
            {data.status === "Discharged" && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Discharge Reason</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {data.discharge_reason || "—"}
                </Typography>
              </Grid>
            )}
          </Grid>

          {data.notes && (
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">Admission Notes</Typography>
              <Typography variant="body2">{data.notes}</Typography>
            </Box>
          )}

          {data.discharge_notes && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Discharge Notes</Typography>
              <Typography variant="body2">{data.discharge_notes}</Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">
              <NotesIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
              Inpatient Notes
            </Typography>
            {isAdmitted && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<NoteIcon />}
                onClick={openNote}
              >
                Add Note
              </Button>
            )}
          </Stack>
          {(data.notes_list || data.notes?.length > 0) ? (
            <Stack spacing={1}>
              {(data.notes || []).map((note) => (
                <Card key={note.id} square variant="outlined">
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start" useFlexGap>
                      <Box flexGrow={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={note.note_type} size="small" color={noteTypeColor(note.note_type)} />
                          <Typography variant="body2" color="text.secondary">
                            {note.noted_at ? new Date(note.noted_at).toLocaleString() : ""}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {note.note_text}
                        </Typography>
                        {note.noted_by && (
                          <Typography variant="caption" color="text.secondary">
                            By {note.noted_by.full_name}
                          </Typography>
                        )}
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteNote(note.id)}>
                        <DeleteNoteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No inpatient notes yet.
            </Typography>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            {isAdmitted && (
              <Button
                variant="outlined"
                color="info"
                startIcon={<TransferIcon />}
                onClick={openTransfer}
              >
                Transfer Bed
              </Button>
            )}
            {isAdmitted && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DischargeIcon />}
                onClick={confirmDischarge}
                disabled={dischargeLoading}
              >
                Discharge Patient
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default AdmissionDetails;

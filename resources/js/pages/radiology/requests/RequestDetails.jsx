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
  PhotoCameraRounded as PerformIcon,
  EditNoteRounded as ResultsIcon,
  CancelRounded as CancelIcon,
  HistoryRounded as HistoryIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Modal from "../../../components/Modal";
import ResultForm from "./ResultForm";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const RequestDetails = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const { requestId } = useParams();

  usePrivilege('radiology', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    `api/radiology/requests/${requestId}`,
    null,
    true,
    null,
    (response) => response.data?.data || null
  );

  const { data: performData, loading: performLoading, error: performError, handlePost: markPerformed } = usePost(`api/radiology/requests/${requestId}/performed`);
  const { data: cancelData, loading: cancelLoading, error: cancelError, handlePost: cancelRequest } = usePost(`api/radiology/requests/${requestId}/cancel`);
  const { data: resultData, loading: resultLoading, error: resultError, handlePost: enterResults } = usePost(`api/radiology/requests/${requestId}/results`);

  useEffect(() => {
    document.title = `Radiology Request ${requestId} - ${window.APP_NAME}`;
  }, []);

  const showError = (err) => {
    if (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  useEffect(() => showError(error), [error]);
  useEffect(() => showError(performError), [performError]);
  useEffect(() => showError(cancelError), [cancelError]);
  useEffect(() => showError(resultError), [resultError]);

  useEffect(() => {
    if (performData) {
      addToast({ message: performData.message, severity: "success" });
      handleFetch();
    }
  }, [performData]);

  useEffect(() => {
    if (cancelData) {
      addToast({ message: cancelData.message, severity: "success" });
      handleFetch();
    }
  }, [cancelData]);

  useEffect(() => {
    if (resultData) {
      addToast({ message: resultData.message, severity: "success" });
      handleFetch();
    }
  }, [resultData]);

  const confirmPerformed = () => {
    modalRef.current.open(
      "Mark as Performed",
      <ConfirmationDialog
        message="Mark all exams on this request as performed? This moves the request to 'In Progress'."
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          markPerformed();
        }}
      />,
      "sm"
    );
  };

  const confirmCancel = () => {
    let reason = window.prompt("Enter reason for cancelling this request:");
    if (reason === null) return;
    if (!reason.trim()) {
      addToast({ message: "Cancellation reason is required.", severity: "error" });
      return;
    }
    cancelRequest(null, { cancel_reason: reason.trim() });
  };

  const openResultForm = () => {
    modalRef.current.open(
      "Enter Radiology Results",
      <ResultForm
        item={data}
        modal={modalRef.current}
        onSuccess={(payload) => {
          modalRef.current.close();
          enterResults(null, { results: payload });
        }}
      />,
      "md"
    );
  };

  if (loading) {
    return (
      <Page breadcrumbs={[{ title: "Radiology" }, { title: "Loading..." }]}>
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page breadcrumbs={[{ title: "Radiology" }, { title: "Request" }]}>
        <Card square variant="outlined">
          <CardContent>
            <Typography>Radiology request not found.</Typography>
          </CardContent>
        </Card>
      </Page>
    );
  }

  const patient = data.patient || {};
  const statusColor = (s) => {
    if (s === "Pending") return "warning";
    if (s === "In Progress") return "info";
    if (s === "Completed") return "success";
    return "default";
  };
  const priorityColor = (p) => {
    if (p === "Stat") return "error";
    if (p === "Urgent") return "warning";
    return "default";
  };

  const examStatusColor = (s) => {
    if (s === "Completed") return "success";
    if (s === "Performed") return "info";
    return "warning";
  };

  const completedExams = data.exams?.filter((e) => e.status === "Completed").length || 0;

  return (
    <Page
      breadcrumbs={[
        { title: "Radiology" },
        { title: "Imaging Requests" },
        { title: data.request_no },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title={data.request_no}
          subtitle={`Requested ${new Date(data.created_at).toLocaleString()}`}
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/radiology/requests")}>
              <BackIcon fontSize="small" />
            </Button>
          }
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Patient History">
                <IconButton size="small" onClick={() => navigate(`/radiology/patients/${patient.id}/history`)}>
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
            <Chip label={data.status} color={statusColor(data.status)} />
            <Chip
              label={data.priority || "Routine"}
              color={priorityColor(data.priority)}
              variant="outlined"
            />
            <Chip label={`${data.exams?.length || 0} exams`} variant="outlined" />
            <Chip
              label={`${completedExams}/${data.exams?.length || 0} completed`}
              color={completedExams === data.exams?.length ? "success" : "default"}
              variant="outlined"
            />
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
              <Typography variant="subtitle2" color="text.secondary">Requested By</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.requested_by?.full_name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Performed</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.performed_at ? new Date(data.performed_at).toLocaleString() : "Not yet"}
              </Typography>
              {data.performed_by && (
                <Typography variant="body2" color="text.secondary">
                  by {data.performed_by.full_name}
                </Typography>
              )}
            </Grid>
          </Grid>

          {data.clinical_notes && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Clinical Notes</Typography>
              <Typography variant="body2">{data.clinical_notes}</Typography>
            </Box>
          )}

          {data.contrast && data.contrast !== "None" && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Contrast</Typography>
              <Chip label={data.contrast} size="small" color="info" variant="outlined" />
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={1}>Exams</Typography>
          <Stack spacing={1}>
            {(data.exams || []).map((exam) => (
              <Card key={exam.id} square variant="outlined">
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                    <Box flexGrow={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {exam.radiology_exam?.name || "Exam"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exam.radiology_exam?.code || ""}{" "}
                        {exam.radiology_exam?.category ? `• ${exam.radiology_exam.category}` : ""}
                      </Typography>
                      {exam.findings && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <b>Findings:</b> {exam.findings}
                        </Typography>
                      )}
                      {exam.impression && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <b>Impression:</b> {exam.impression}
                        </Typography>
                      )}
                      {exam.conclusion && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <b>Conclusion:</b> {exam.conclusion}
                        </Typography>
                      )}
                      {exam.result_entered_by && (
                        <Typography variant="body2" color="text.secondary">
                          Entered by {exam.result_entered_by.full_name} •{" "}
                          {exam.result_entered_at ? new Date(exam.result_entered_at).toLocaleString() : ""}
                        </Typography>
                      )}
                    </Box>
                    <Chip label={exam.status} size="small" color={examStatusColor(exam.status)} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            {data.status === "Pending" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PerformIcon />}
                  onClick={confirmPerformed}
                  disabled={performLoading}
                >
                  Mark as Performed
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={confirmCancel}
                  disabled={cancelLoading}
                >
                  Cancel Request
                </Button>
              </>
            )}
            {data.status === "In Progress" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ResultsIcon />}
                  onClick={openResultForm}
                  disabled={resultLoading}
                >
                  Enter Results
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={confirmCancel}
                  disabled={cancelLoading}
                >
                  Cancel Request
                </Button>
              </>
            )}
            {data.status === "Completed" && data.completed_at && (
              <Typography variant="body2" color="text.secondary" alignSelf="center">
                Completed {new Date(data.completed_at).toLocaleString()}
                {data.completed_by ? ` by ${data.completed_by.full_name}` : ""}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default RequestDetails;

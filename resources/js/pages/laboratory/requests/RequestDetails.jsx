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
  ScienceRounded as CollectIcon,
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

  usePrivilege('laboratory', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    `api/laboratory/requests/${requestId}`,
    null,
    true,
    null,
    (response) => response.data?.data || null
  );

  const { data: collectData, loading: collectLoading, error: collectError, handlePost: collectSample } = usePost(`api/laboratory/requests/${requestId}/collect-sample`);
  const { data: cancelData, loading: cancelLoading, error: cancelError, handlePost: cancelRequest } = usePost(`api/laboratory/requests/${requestId}/cancel`);
  const { data: resultData, loading: resultLoading, error: resultError, handlePost: enterResults } = usePost(`api/laboratory/requests/${requestId}/results`);

  useEffect(() => {
    document.title = `Lab Request ${requestId} - ${window.APP_NAME}`;
  }, []);

  const showError = (err) => {
    if (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  useEffect(() => showError(error), [error]);
  useEffect(() => showError(collectError), [collectError]);
  useEffect(() => showError(cancelError), [cancelError]);
  useEffect(() => showError(resultError), [resultError]);

  useEffect(() => {
    if (collectData) {
      addToast({ message: collectData.message, severity: "success" });
      handleFetch();
    }
  }, [collectData]);

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

  const confirmCollect = () => {
    modalRef.current.open(
      "Collect Samples",
      <ConfirmationDialog
        message="Mark all samples as collected for this request? This moves the request to 'In Progress'."
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          collectSample();
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
      "Enter Results",
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
      <Page breadcrumbs={[{ title: "Laboratory" }, { title: "Loading..." }]}>
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page breadcrumbs={[{ title: "Laboratory" }, { title: "Lab Request" }]}>
        <Card square variant="outlined">
          <CardContent>
            <Typography>Lab request not found.</Typography>
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

  const testStatusColor = (s) => {
    if (s === "Completed") return "success";
    if (s === "Collected") return "info";
    return "warning";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Laboratory" },
        { title: "Lab Requests" },
        { title: data.request_no },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title={data.request_no}
          subtitle={`Requested ${new Date(data.created_at).toLocaleString()}`}
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/laboratory/requests")}>
              <BackIcon fontSize="small" />
            </Button>
          }
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Patient History">
                <IconButton size="small" onClick={() => navigate(`/laboratory/patients/${patient.id}/history`)}>
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
            <Chip label={`${data.tests?.length || 0} tests`} variant="outlined" />
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
              <Typography variant="subtitle2" color="text.secondary">Sample Collected</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.sample_collected_at ? new Date(data.sample_collected_at).toLocaleString() : "Not yet"}
              </Typography>
              {data.sample_collected_by && (
                <Typography variant="body2" color="text.secondary">
                  by {data.sample_collected_by.full_name}
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

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={1}>Tests</Typography>
          <Stack spacing={1}>
            {(data.tests || []).map((test) => (
              <Card key={test.id} square variant="outlined">
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                    <Box flexGrow={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {test.lab_test?.name || "Test"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {test.lab_test?.code || ""} {test.reference_range ? `• Ref: ${test.reference_range} ${test.unit || ""}` : ""}
                      </Typography>
                      {test.result && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <b>Result:</b> {test.result} {test.unit || ""}
                          {test.is_abnormal ? (
                            <Chip label="Abnormal" size="small" color="error" sx={{ ml: 1 }} />
                          ) : null}
                        </Typography>
                      )}
                      {test.interpretation && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <b>Interpretation:</b> {test.interpretation}
                        </Typography>
                      )}
                      {test.result_entered_by && (
                        <Typography variant="body2" color="text.secondary">
                          Entered by {test.result_entered_by.full_name} •{" "}
                          {test.result_entered_at ? new Date(test.result_entered_at).toLocaleString() : ""}
                        </Typography>
                      )}
                    </Box>
                    <Chip label={test.status} size="small" color={testStatusColor(test.status)} />
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
                  startIcon={<CollectIcon />}
                  onClick={confirmCollect}
                  disabled={collectLoading}
                >
                  Collect Samples
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

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
  MedicationRounded as DispenseIcon,
  CancelRounded as CancelIcon,
  HistoryRounded as HistoryIcon,
  PrintRounded as PrintIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Modal from "../../../components/Modal";
import DispenseForm from "./DispenseForm";
import PrescriptionPDF from "./PrescriptionPDF";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const PrescriptionDetails = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const { prescriptionId } = useParams();

  usePrivilege('e_prescription', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    `api/e-prescription/${prescriptionId}`,
    null,
    true,
    null,
    (response) => response.data?.data || null
  );

  const { data: dispenseData, loading: dispenseLoading, error: dispenseError, handlePost: dispenseItems } = usePost(`api/e-prescription/${prescriptionId}/dispense`);
  const { data: cancelData, loading: cancelLoading, error: cancelError, handlePost: cancelPrescription } = usePost(`api/e-prescription/${prescriptionId}/cancel`);

  useEffect(() => {
    document.title = `Prescription ${prescriptionId} - ${window.APP_NAME}`;
  }, []);

  const showError = (err) => {
    if (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  useEffect(() => showError(error), [error]);
  useEffect(() => showError(dispenseError), [dispenseError]);
  useEffect(() => showError(cancelError), [cancelError]);

  useEffect(() => {
    if (dispenseData) {
      addToast({ message: dispenseData.message, severity: "success" });
      handleFetch();
    }
  }, [dispenseData]);

  useEffect(() => {
    if (cancelData) {
      addToast({ message: cancelData.message, severity: "success" });
      handleFetch();
    }
  }, [cancelData]);

  const confirmCancel = () => {
    let reason = window.prompt("Enter reason for cancelling this prescription:");
    if (reason === null) return;
    if (!reason.trim()) {
      addToast({ message: "Cancellation reason is required.", severity: "error" });
      return;
    }
    cancelPrescription(null, { cancel_reason: reason.trim() });
  };

  const openDispenseForm = () => {
    modalRef.current.open(
      "Dispense Items",
      <DispenseForm
        item={data}
        modal={modalRef.current}
        onSuccess={(payload) => {
          modalRef.current.close();
          dispenseItems(null, { items: payload });
        }}
      />,
      "md"
    );
  };

  if (loading) {
    return (
      <Page breadcrumbs={[{ title: "E-Prescription" }, { title: "Loading..." }]}>
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page breadcrumbs={[{ title: "E-Prescription" }, { title: "Prescription" }]}>
        <Card square variant="outlined">
          <CardContent>
            <Typography>Prescription not found.</Typography>
          </CardContent>
        </Card>
      </Page>
    );
  }

  const patient = data.patient || {};
  const statusColor = (s) => {
    if (s === "Active") return "warning";
    if (s === "Partially Dispensed") return "info";
    if (s === "Dispensed") return "success";
    return "default";
  };
  const itemStatusColor = (s) => {
    if (s === "Dispensed") return "success";
    if (s === "Partially Dispensed") return "info";
    return "warning";
  };
  const canDispense = data.status === "Active" || data.status === "Partially Dispensed";
  const canCancel = data.status === "Active";

  return (
    <Page
      breadcrumbs={[
        { title: "E-Prescription" },
        { title: "Prescriptions" },
        { title: data.prescription_no },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title={data.prescription_no}
          subtitle={`Prescribed ${data.date_prescribed ? new Date(data.date_prescribed).toLocaleString() : ""}`}
          leading={
            <Button variant="outlined" size="small" onClick={() => navigate("/e-prescription/prescriptions")}>
              <BackIcon fontSize="small" />
            </Button>
          }
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Patient History">
                <IconButton size="small" onClick={() => navigate(`/e-prescription/patients/${patient.id}/history`)}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <PrescriptionPDF prescriptionId={data.id} prescription={data} patient={patient} />
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
              label={`${data.items?.length || 0} items`}
              variant="outlined"
            />
            {data.expires_at && (
              <Chip
                label={`Valid until ${new Date(data.expires_at).toLocaleDateString()}`}
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
              <Typography variant="subtitle2" color="text.secondary">Prescribed By</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.prescribed_by?.full_name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
              <Typography variant="body1" fontWeight={500}>
                {data.diagnosis || "—"}
              </Typography>
            </Grid>
          </Grid>

          {data.clinical_notes && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">Clinical Notes</Typography>
              <Typography variant="body2">{data.clinical_notes}</Typography>
            </Box>
          )}

          {data.status === "Cancelled" && data.cancel_reason && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="error">Cancellation Reason</Typography>
              <Typography variant="body2" color="error.main">{data.cancel_reason}</Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" mb={1}>Medicines</Typography>
          <Stack spacing={1}>
            {(data.items || []).map((prescriptionItem) => (
              <Card key={prescriptionItem.id} square variant="outlined">
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                    <Box flexGrow={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {prescriptionItem.medicine_name || prescriptionItem.medicine?.name || "Medicine"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[
                          prescriptionItem.dosage,
                          prescriptionItem.frequency,
                          prescriptionItem.duration ? `${prescriptionItem.duration} days` : "",
                          prescriptionItem.meal && prescriptionItem.meal !== "None" ? prescriptionItem.meal : "",
                        ].filter(Boolean).join(" • ") || "—"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {prescriptionItem.quantity} {prescriptionItem.unit || ""}
                        {Number(prescriptionItem.dispensed_qty) > 0
                          ? ` • Dispensed: ${prescriptionItem.dispensed_qty}`
                          : ""}
                      </Typography>
                      {prescriptionItem.instructions && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <b>Instructions:</b> {prescriptionItem.instructions}
                        </Typography>
                      )}
                      {prescriptionItem.dispensed_by && (
                        <Typography variant="body2" color="text.secondary">
                          Dispensed by {prescriptionItem.dispensed_by.full_name} •{" "}
                          {prescriptionItem.dispensed_at ? new Date(prescriptionItem.dispensed_at).toLocaleString() : ""}
                        </Typography>
                      )}
                    </Box>
                    <Chip label={prescriptionItem.status} size="small" color={itemStatusColor(prescriptionItem.status)} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            {canDispense && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<DispenseIcon />}
                onClick={openDispenseForm}
                disabled={dispenseLoading}
              >
                Dispense Items
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={confirmCancel}
                disabled={cancelLoading}
              >
                Cancel Prescription
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PrescriptionDetails;

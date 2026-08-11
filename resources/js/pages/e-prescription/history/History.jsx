import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  RefreshRounded as RefreshIcon,
  MedicationRounded as RxIcon,
  ArrowBackRounded as BackIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const History = () => {
  const addToast = useToast();
  const { patientId } = useParams();

  usePrivilege('e_prescription', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });

  const { data, loading, error, handleFetch } = useFetch(
    `api/e-prescription/patients/${patientId}/history`,
    params,
    true,
    { data: [], total: 0, current_page: 1, per_page: 20 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        per_page: paginatedData.per_page || 20,
      };
    }
  );

  useEffect(() => {
    document.title = `Prescription History - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const statusColor = (s) => {
    if (s === "Dispensed") return "success";
    if (s === "Partially Dispensed") return "info";
    if (s === "Active") return "warning";
    return "default";
  };

  const columns = [
    {
      field: "prescription_no",
      headerName: "No.",
      valueGetter: (item) => item.prescription_no,
      minWidth: { xs: 110, sm: 150 },
      flex: 1,
    },
    {
      field: "diagnosis",
      headerName: "Diagnosis",
      valueGetter: (item) => item.diagnosis || "—",
      minWidth: { xs: 90, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "items",
      headerName: "Medicines",
      minWidth: { xs: 140, sm: 220 },
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(item.items || []).map((prescriptionItem) => (
            <Chip
              key={prescriptionItem.id}
              label={prescriptionItem.medicine_name || prescriptionItem.medicine?.name || "?"}
              size="small"
              variant="outlined"
              color={prescriptionItem.status === "Dispensed" ? "success" : "default"}
            />
          ))}
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: { xs: 90, sm: 130 },
      renderCell: (item) => (
        <Chip label={item.status} size="small" color={statusColor(item.status)} />
      ),
    },
    {
      field: "date_prescribed",
      headerName: "Prescribed At",
      valueGetter: (item) => (item.date_prescribed ? new Date(item.date_prescribed).toLocaleString() : "—"),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "prescribed_by",
      headerName: "Prescribed By",
      valueGetter: (item) => item.prescribed_by?.full_name || "—",
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
  ];

  const handleGoBack = () => {
    window.history.length > 2
      ? window.history.back()
      : (window.location.href = "/e-prescription/prescriptions");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "E-Prescription" },
        { title: "Patient Prescription History" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Patient Prescription History"
          subtitle={`Patient #${patientId}`}
          leading={
            <Tooltip title="Back">
              <IconButton onClick={handleGoBack} size="small">
                <BackIcon />
              </IconButton>
            </Tooltip>
          }
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <RxIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              All prescriptions and dispensing history for this patient.
            </Typography>
          </Stack>
          {loading && data.data.length === 0 ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : (
            <Table
              loading={loading}
              columns={columns}
              items={data.data}
              itemCount={data.total}
              page={data.current_page - 1}
              pageSize={data.per_page}
              onPageChange={(event, newPage) =>
                setParams((prev) => ({ ...prev, page: newPage + 1 }))
              }
              onPageSizeChange={(event) =>
                setParams((prev) => ({
                  ...prev,
                  per_page: parseInt(event.target.value, 10),
                  page: 1,
                }))
              }
              noItemsOverlayMessage="No prescriptions for this patient."
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default History;

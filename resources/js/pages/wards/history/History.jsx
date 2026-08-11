import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  HotelRounded as AdmitIcon,
  ArrowBackRounded as BackIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const History = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { patientId } = useParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });

  const { data, loading, error, handleFetch } = useFetch(
    `api/inpatient/patients/${patientId}/history`,
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
    document.title = `Admission History - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const conditionColor = (c) => {
    if (c === "Critical") return "error";
    if (c === "Serious") return "warning";
    return "success";
  };

  const columns = [
    {
      field: "admission_no",
      headerName: "Admission No.",
      valueGetter: (item) => item.admission_no,
      minWidth: { xs: 110, sm: 170 },
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
      field: "ward",
      headerName: "Ward / Bed",
      valueGetter: (item) => `${item.ward?.name || "—"} / ${item.bed?.bed_number || "—"}`,
      minWidth: { xs: 100, sm: 150 },
      hideOnMobile: true,
    },
    {
      field: "condition",
      headerName: "Condition",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip label={item.condition} size="small" color={conditionColor(item.condition)} />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip label={item.status} size="small" color={item.status === "Admitted" ? "success" : "default"} />
      ),
    },
    {
      field: "admission_date",
      headerName: "Admitted At",
      valueGetter: (item) => (item.admission_date ? new Date(item.admission_date).toLocaleString() : "—"),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "admitted_by",
      headerName: "Admitted By",
      valueGetter: (item) => item.admitted_by?.full_name || "—",
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (item) => (
        <IconButton
          size="small"
          onClick={() => navigate(`/wards/admissions/${item.id}`)}
          color="primary"
        >
          <AdmitIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const handleGoBack = () => {
    window.history.length > 2
      ? window.history.back()
      : (window.location.href = "/wards/admissions");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Patient Admission History" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Patient Admission History"
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
            <AdmitIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              All admissions and discharge history for this patient.
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
              noItemsOverlayMessage="No admissions for this patient."
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default History;

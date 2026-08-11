import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
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
  FavoriteRounded as VitalsIcon,
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

  usePrivilege('triage', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });

  const { data, loading, error, handleFetch } = useFetch(
    `api/triage/patients/${patientId}/vital-signs`,
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
    document.title = `Vital Signs History - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const triageColor = (category) => {
    if (category === "Emergency") return "error";
    if (category === "Urgent") return "warning";
    return "success";
  };

  const columns = [
    {
      field: "created_at",
      headerName: "Date",
      valueGetter: (item) => new Date(item.created_at).toLocaleString(),
      minWidth: { xs: 110, sm: 140 },
      flex: 1,
    },
    {
      field: "temperature",
      headerName: "Temp (°C)",
      valueGetter: (item) => item.temperature ?? "—",
      minWidth: { xs: 70, sm: 90 },
      hideOnMobile: true,
    },
    {
      field: "bp",
      headerName: "BP (mmHg)",
      valueGetter: (item) =>
        item.systolic_bp && item.diastolic_bp
          ? `${item.systolic_bp}/${item.diastolic_bp}`
          : "—",
      minWidth: { xs: 80, sm: 110 },
    },
    {
      field: "heart_rate",
      headerName: "HR (bpm)",
      valueGetter: (item) => item.heart_rate ?? "—",
      minWidth: { xs: 70, sm: 90 },
      hideOnMobile: true,
    },
    {
      field: "oxygen_saturation",
      headerName: "SpO2 (%)",
      valueGetter: (item) => item.oxygen_saturation ?? "—",
      minWidth: { xs: 70, sm: 90 },
      hideOnMobile: true,
    },
    {
      field: "bmi",
      headerName: "BMI",
      valueGetter: (item) => item.bmi ?? item.bmi_calculated ?? "—",
      minWidth: { xs: 60, sm: 80 },
      hideOnMobile: true,
    },
    {
      field: "blood_group",
      headerName: "Blood Group",
      valueGetter: (item) => item.blood_group || "—",
      minWidth: { xs: 70, sm: 110 },
      hideOnMobile: true,
    },
    {
      field: "triage_category",
      headerName: "Category",
      valueGetter: (item) => item.triage_category || "—",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip
          label={item.triage_category || "—"}
          size="small"
          color={triageColor(item.triage_category)}
        />
      ),
    },
    {
      field: "chief_complaint",
      headerName: "Chief Complaint",
      valueGetter: (item) => item.chief_complaint || "—",
      minWidth: { xs: 140, sm: 220 },
      flex: 1,
    },
    {
      field: "triaged_by",
      headerName: "Triaged By",
      valueGetter: (item) => item.triaged_by?.full_name || "—",
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
  ];

  const handleGoBack = () => {
    window.history.length > 2
      ? window.history.back()
      : (window.location.href = "/triage/queue");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Triage" },
        { title: "Vital Signs History" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Vital Signs History"
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
            <VitalsIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              All vital sign records captured during triage for this patient.
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
              noItemsOverlayMessage="No vital signs recorded for this patient."
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default History;

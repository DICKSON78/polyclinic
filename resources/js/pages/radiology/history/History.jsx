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
  RadioRounded as RadiologyIcon,
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

  usePrivilege('radiology', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 20,
  });

  const { data, loading, error, handleFetch } = useFetch(
    `api/radiology/patients/${patientId}/history`,
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
    document.title = `Radiology History - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const statusColor = (s) => {
    if (s === "Completed") return "success";
    if (s === "In Progress") return "info";
    if (s === "Pending") return "warning";
    return "default";
  };

  const columns = [
    {
      field: "request_no",
      headerName: "Request No.",
      valueGetter: (item) => item.request_no,
      minWidth: { xs: 110, sm: 150 },
      flex: 1,
    },
    {
      field: "exams",
      headerName: "Exams",
      minWidth: { xs: 120, sm: 200 },
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(item.exams || []).map((e) => (
            <Chip
              key={e.id}
              label={`${e.radiology_exam?.name || "?"}${e.findings ? ": reported" : ""}`}
              size="small"
              variant="outlined"
              color={e.conclusion ? "success" : "default"}
            />
          ))}
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip label={item.status} size="small" color={statusColor(item.status)} />
      ),
    },
    {
      field: "created_at",
      headerName: "Requested At",
      valueGetter: (item) => new Date(item.created_at).toLocaleString(),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "requested_by",
      headerName: "Requested By",
      valueGetter: (item) => item.requested_by?.full_name || "—",
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
  ];

  const handleGoBack = () => {
    window.history.length > 2
      ? window.history.back()
      : (window.location.href = "/radiology/requests");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Radiology" },
        { title: "Patient Radiology History" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Patient Radiology History"
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
            <RadiologyIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              All imaging requests and reports for this patient.
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
              noItemsOverlayMessage="No radiology requests for this patient."
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default History;

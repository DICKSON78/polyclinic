import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
  CheckCircleRounded as CompletedIcon,
  PendingRounded as PendingIcon,
  HourglassTopRounded as InProgressIcon,
  CancelRounded as CancelledIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const Requests = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('radiology', '/dashboard');

  const [status, setStatus] = useState(searchParams.get("status") || "Pending");
  const [searchText, setSearchText] = useState("");

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    priority: searchParams.get("priority") || undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/radiology/requests",
    params,
    true,
    { data: [], total: 0, current_page: 1, per_page: 25 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `Radiology Requests - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
    setParams((prev) => ({ ...prev, status: newValue, page: 1 }));
    setSearchParams(newValue === "Pending" ? {} : { status: newValue });
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

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

  const columns = [
    {
      field: "request_no",
      headerName: "Request No.",
      valueGetter: (item) => item.request_no,
      minWidth: { xs: 110, sm: 150 },
      renderCell: (item) => (
        <Typography variant="body2" fontWeight={600}>
          {item.request_no}
        </Typography>
      ),
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "—",
      minWidth: { xs: 130, sm: 180 },
      flex: 1,
    },
    {
      field: "age",
      headerName: "Age",
      valueGetter: (item) => getAge(item.patient?.date_of_birth) || "—",
      minWidth: { xs: 60, sm: 70 },
      hideOnMobile: true,
    },
    {
      field: "exams_count",
      headerName: "Exams",
      valueGetter: (item) => item.exams?.length || 0,
      minWidth: { xs: 50, sm: 60 },
      renderCell: (item) => (
        <Chip
          label={`${item.exams?.length || 0} exams`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      minWidth: { xs: 70, sm: 100 },
      renderCell: (item) => (
        <Chip
          label={item.priority || "Routine"}
          size="small"
          color={priorityColor(item.priority)}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip
          label={item.status}
          size="small"
          color={statusColor(item.status)}
        />
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
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (item) => (
        <IconButton size="small" onClick={() => navigate(`/radiology/requests/${item.id}`)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Radiology" },
        { title: "Imaging Requests" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Imaging Requests"
          subtitle="Patient imaging requests and workflow"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate("/radiology/requests/new")}
              >
                New Request
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Tabs value={status} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab value="Pending" label="Pending" icon={<PendingIcon fontSize="small" />} iconPosition="start" />
          <Tab value="In Progress" label="In Progress" icon={<InProgressIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Completed" label="Completed" icon={<CompletedIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Cancelled" label="Cancelled" icon={<CancelledIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5}>
          <SearchTextField
            placeholder="Search request no. or patient..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            Search
          </Button>
        </Stack>
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
          noItemsOverlayMessage="No radiology requests found."
        />
      </Card>
    </Page>
  );
};

export default Requests;

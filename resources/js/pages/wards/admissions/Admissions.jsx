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
  PersonRounded as AdmittedIcon,
  LogoutRounded as DischargedIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const Admissions = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [status, setStatus] = useState(searchParams.get("status") || "Admitted");
  const [searchText, setSearchText] = useState("");

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient/admissions",
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
    document.title = `Admissions - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
    setParams((prev) => ({ ...prev, status: newValue, page: 1 }));
    setSearchParams(newValue === "Admitted" ? {} : { status: newValue });
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const statusColor = (s) => (s === "Admitted" ? "success" : "default");
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
      renderCell: (item) => (
        <Typography variant="body2" fontWeight={600}>
          {item.admission_no}
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
      field: "ward",
      headerName: "Ward / Bed",
      valueGetter: (item) => `${item.ward?.name || "—"} / ${item.bed?.bed_number || "—"}`,
      minWidth: { xs: 110, sm: 160 },
      hideOnMobile: true,
    },
    {
      field: "diagnosis",
      headerName: "Diagnosis",
      valueGetter: (item) => item.diagnosis || "—",
      minWidth: { xs: 100, sm: 160 },
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
      minWidth: { xs: 90, sm: 110 },
      renderCell: (item) => (
        <Chip label={item.status} size="small" color={statusColor(item.status)} />
      ),
    },
    {
      field: "admission_date",
      headerName: "Admitted",
      valueGetter: (item) => (item.admission_date ? new Date(item.admission_date).toLocaleString() : "—"),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (item) => (
        <IconButton size="small" onClick={() => navigate(`/wards/admissions/${item.id}`)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Admissions" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Admissions"
          subtitle="Inpatient admissions and discharge workflow"
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
                onClick={() => navigate("/wards/admissions/new")}
              >
                New Admission
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Tabs value={status} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab value="Admitted" label="Admitted" icon={<AdmittedIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Discharged" label="Discharged" icon={<DischargedIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5}>
          <SearchTextField
            placeholder="Search by admission no., patient or diagnosis..."
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
          noItemsOverlayMessage="No admissions found."
        />
      </Card>
    </Page>
  );
};

export default Admissions;

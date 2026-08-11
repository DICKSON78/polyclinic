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
  MedicationRounded as ActiveIcon,
  Inventory2Rounded as PartiallyIcon,
  CheckCircleRounded as DispensedIcon,
  CancelRounded as CancelledIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const Prescriptions = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('e_prescription', '/dashboard');

  const [status, setStatus] = useState(searchParams.get("status") || "Active");
  const [searchText, setSearchText] = useState("");

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/e-prescription",
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
    document.title = `Prescriptions - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
    setParams((prev) => ({ ...prev, status: newValue, page: 1 }));
    setSearchParams(newValue === "Active" ? {} : { status: newValue });
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const statusColor = (s) => {
    if (s === "Active") return "warning";
    if (s === "Partially Dispensed") return "info";
    if (s === "Dispensed") return "success";
    return "default";
  };

  const columns = [
    {
      field: "prescription_no",
      headerName: "No.",
      valueGetter: (item) => item.prescription_no,
      minWidth: { xs: 110, sm: 150 },
      renderCell: (item) => (
        <Typography variant="body2" fontWeight={600}>
          {item.prescription_no}
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
      field: "diagnosis",
      headerName: "Diagnosis",
      valueGetter: (item) => item.diagnosis || "—",
      minWidth: { xs: 100, sm: 160 },
      hideOnMobile: true,
    },
    {
      field: "items_count",
      headerName: "Items",
      valueGetter: (item) => item.items?.length || 0,
      minWidth: { xs: 50, sm: 60 },
      renderCell: (item) => (
        <Chip label={`${item.items?.length || 0} items`} size="small" variant="outlined" />
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
      headerName: "Prescribed",
      valueGetter: (item) => (item.date_prescribed ? new Date(item.date_prescribed).toLocaleString() : "—"),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (item) => (
        <IconButton size="small" onClick={() => navigate(`/e-prescription/prescriptions/${item.id}`)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "E-Prescription" },
        { title: "Prescriptions" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Prescriptions"
          subtitle="Electronic prescriptions and dispensing workflow"
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
                onClick={() => navigate("/e-prescription/prescriptions/new")}
              >
                New Prescription
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Tabs value={status} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab value="Active" label="Active" icon={<ActiveIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Partially Dispensed" label="Partially Dispensed" icon={<PartiallyIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Dispensed" label="Dispensed" icon={<DispensedIcon fontSize="small" />} iconPosition="start" />
          <Tab value="Cancelled" label="Cancelled" icon={<CancelledIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5}>
          <SearchTextField
            placeholder="Search by no., patient or diagnosis..."
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
          noItemsOverlayMessage="No prescriptions found."
        />
      </Card>
    </Page>
  );
};

export default Prescriptions;

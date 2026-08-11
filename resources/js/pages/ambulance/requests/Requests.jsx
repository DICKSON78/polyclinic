import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import RequestForm from "./RequestForm";

const STATUS_COLORS = {
  Pending: "warning",
  Assigned: "info",
  "In-Progress": "primary",
  Completed: "success",
  Cancelled: "error",
};

const CONDITION_COLORS = {
  Stable: "success",
  Moderate: "warning",
  Critical: "error",
};

const Requests = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('triage', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/ambulance/requests",
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
    document.title = `Ambulance Requests - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openForm();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    modalRef.current.open(
      "New Ambulance Request",
      <RequestForm
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "md"
    );
  };

  const columns = [
    {
      field: "request_no",
      headerName: "Request No",
      valueGetter: (item) => item.request_no || "-",
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "Non-patient transport",
    },
    {
      field: "transport_type",
      headerName: "Type",
      valueGetter: (item) => item.transport_type || "-",
      hideOnMobile: true,
    },
    {
      field: "pickup_location",
      headerName: "Pickup",
      valueGetter: (item) => item.pickup_location || "-",
      hideOnMobile: true,
    },
    {
      field: "destination",
      headerName: "Destination",
      valueGetter: (item) => item.destination || "-",
      hideOnMobile: true,
    },
    {
      field: "patient_condition",
      headerName: "Condition",
      renderCell: (item) => (
        <Chip
          size="small"
          color={CONDITION_COLORS[item.patient_condition] || "default"}
          label={item.patient_condition || "-"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (item) => (
        <Chip
          size="small"
          color={STATUS_COLORS[item.status] || "default"}
          label={item.status || "-"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Request">
            <IconButton
              size="small"
              onClick={() => navigate(`/ambulance/requests/${item.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ambulance" }, { title: "Requests" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Ambulance Requests"
          subtitle="Manage patient transport requests"
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
                onClick={openForm}
              >
                New Request
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} alignItems="center">
          <Select
            label="Status"
            sx={{ minWidth: 180 }}
            clearable
            value={params.status}
            onChange={(value) =>
              setParams((prev) => ({ ...prev, status: value || undefined, page: 1 }))
            }
            options={Object.keys(STATUS_COLORS)}
          />
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
          noItemsOverlayMessage="No ambulance requests found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Requests;

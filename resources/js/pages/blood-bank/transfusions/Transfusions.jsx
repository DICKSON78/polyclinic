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

import TransfusionForm from "./TransfusionForm";

const STATUS_COLORS = {
  Requested: "warning",
  "Cross-matching": "info",
  "In-Progress": "primary",
  Completed: "success",
  Cancelled: "error",
};

const Transfusions = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('laboratory', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/blood-bank/transfusions",
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
    document.title = `Transfusions - ${window.APP_NAME}`;
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
      "Request Transfusion",
      <TransfusionForm
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "sm"
    );
  };

  const columns = [
    {
      field: "transfusion_no",
      headerName: "Transfusion No",
      valueGetter: (item) => item.transfusion_no || "-",
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "-",
    },
    {
      field: "unit",
      headerName: "Blood Unit",
      valueGetter: (item) =>
        item.unit ? `${item.unit.unit_no} (${item.unit.blood_group}${item.unit.rh_factor === "Negative" ? "-" : "+"})` : "-",
      hideOnMobile: true,
    },
    {
      field: "indication",
      headerName: "Indication",
      valueGetter: (item) => item.indication || "-",
      hideOnMobile: true,
    },
    {
      field: "cross_match",
      headerName: "Cross-Match",
      renderCell: (item) => (
        <Chip
          size="small"
          color={
            item.cross_match === "Compatible"
              ? "success"
              : item.cross_match === "Incompatible"
                ? "error"
                : "default"
          }
          label={item.cross_match || "Pending"}
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
          <Tooltip title="View Transfusion">
            <IconButton
              size="small"
              onClick={() => navigate(`/blood-bank/transfusions/${item.id}`)}
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
      breadcrumbs={[{ title: "Home" }, { title: "Blood Bank" }, { title: "Transfusions" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Transfusions"
          subtitle="Manage blood transfusion requests and administration"
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
                Request Transfusion
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
          noItemsOverlayMessage="No transfusions found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Transfusions;

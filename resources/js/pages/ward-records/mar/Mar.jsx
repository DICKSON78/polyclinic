import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField as MuiTextField,
  Tooltip,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  DeleteRounded as DeleteIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
  CheckCircleRounded as GivenIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useConfirm, useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import MarForm from "./MarForm";

const STATUS_COLORS = {
  Scheduled: "warning",
  Given: "success",
  Skipped: "default",
  Refused: "error",
  Withheld: "info",
};

const STATUSES = ["Scheduled", "Given", "Skipped", "Refused", "Withheld"];

const Mar = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const confirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/ward-records/mar",
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

  const { data: statusData, handlePost: postStatus } = usePost();
  const { data: deleteData, handlePost: deleteItem } = usePost();

  useEffect(() => {
    document.title = `Medication Administration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (statusData) {
      addToast({ message: statusData.message, severity: "success" });
      handleFetch();
    }
  }, [statusData]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      handleFetch();
    }
  }, [deleteData]);

  const openForm = () => {
    modalRef.current.open(
      "Medication Administration Record",
      <MarForm modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleStatusChange = (item, value) => {
    if (!value) {
      return;
    }
    setStatusUpdate(value);
    postStatus(`api/ward-records/mar/${item.id}/status`, { status: value });
  };

  const handleDelete = (item) => {
    confirm.open({
      title: "Delete MAR Entry?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: () => deleteItem(`api/ward-records/mar/${item.id}/delete`, {}),
    });
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "admission_no",
      headerName: "Admission",
      valueGetter: (item) => item.admission?.admission_no || "-",
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "-",
    },
    {
      field: "medication",
      headerName: "Medication",
      valueGetter: (item) => item.medication?.name || "-",
    },
    {
      field: "dosage",
      headerName: "Dosage",
      valueGetter: (item) => item.dosage || "-",
      hideOnMobile: true,
    },
    {
      field: "route",
      headerName: "Route",
      valueGetter: (item) => item.route || "-",
      hideOnMobile: true,
    },
    {
      field: "scheduled_time",
      headerName: "Scheduled Time",
      valueGetter: (item) => item.scheduled_time || "-",
      hideOnMobile: true,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            size="small"
            color={STATUS_COLORS[item.status] || "default"}
            label={item.status || "-"}
          />
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {item.status !== "Given" ? (
            <Tooltip title="Mark as Given">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleStatusChange(item, "Given")}
              >
                <GivenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <MuiTextField
            select
            size="small"
            value={statusUpdate || item.status || ""}
            onChange={(e) => handleStatusChange(item, e.target.value)}
            sx={{ width: 120 }}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </MuiTextField>
          <Tooltip title="Delete Entry">
            <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ward Records" }, { title: "Medication Administration" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Medication Administration Record"
          subtitle="Schedule, administer and track patient medications"
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
                New MAR Entry
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by patient, medication..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            <SearchIcon />
          </Button>
          <Select
            label="Status"
            sx={{ minWidth: 160 }}
            clearable
            value={params.status}
            onChange={(value) =>
              setParams((prev) => ({ ...prev, status: value || undefined, page: 1 }))
            }
            options={STATUSES}
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
          noItemsOverlayMessage="No medication administration records found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Mar;

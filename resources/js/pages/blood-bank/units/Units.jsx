import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import UnitForm from "./UnitForm";

const STATUS_COLORS = {
  Available: "success",
  Reserved: "warning",
  "Cross-matched": "info",
  Issued: "primary",
  Discarded: "error",
  Expired: "default",
};

const Units = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('laboratory', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    blood_group: undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/blood-bank/units",
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
    document.title = `Blood Bank Units - ${window.APP_NAME}`;
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

  const openForm = (item) => {
    modalRef.current.open(
      item ? "Edit Blood Unit" : "Add Blood Unit",
      <UnitForm
        item={item}
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "md"
    );
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "unit_no",
      headerName: "Unit No",
      valueGetter: (item) => item.unit_no || "-",
    },
    {
      field: "blood_group",
      headerName: "Blood Type",
      renderCell: (item) => (
        <Chip
          size="small"
          color="error"
          label={`${item.blood_group}${item.rh_factor === "Negative" ? "-" : "+"}`}
        />
      ),
    },
    {
      field: "component_type",
      headerName: "Component",
      valueGetter: (item) => item.component_type || "-",
      hideOnMobile: true,
    },
    {
      field: "expiry_date",
      headerName: "Expiry",
      valueGetter: (item) => item.expiry_date || "-",
      hideOnMobile: true,
    },
    {
      field: "storage_location",
      headerName: "Location",
      valueGetter: (item) => item.storage_location || "-",
      hideOnMobile: true,
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || item.patient?.patient_number || "-",
      hideOnMobile: true,
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
      headerName: "",
      width: 90,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => openForm(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Blood Bank" }, { title: "Units" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Blood Inventory"
          subtitle="Manage blood units in stock"
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
                onClick={() => openForm()}
              >
                Add Unit
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by unit no..."
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
            options={Object.keys(STATUS_COLORS)}
          />
          <Typography variant="caption" color="text.secondary">
            {data.total || 0} unit(s)
          </Typography>
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
          noItemsOverlayMessage="No blood units found. Add your first unit."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Units;

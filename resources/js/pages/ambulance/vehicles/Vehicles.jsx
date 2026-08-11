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

import VehicleForm from "./VehicleForm";

const STATUS_COLORS = {
  Available: "success",
  "On-Trip": "info",
  Maintenance: "warning",
  "Out-of-Service": "error",
};

const Vehicles = () => {
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
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/ambulance/vehicles",
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
    document.title = `Ambulance Vehicles - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openForm = (item) => {
    modalRef.current.open(
      item ? "Edit Vehicle" : "Add Vehicle",
      <VehicleForm
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
      field: "registration_no",
      headerName: "Registration",
      valueGetter: (item) => item.registration_no || "-",
    },
    {
      field: "vehicle_type",
      headerName: "Type",
      valueGetter: (item) => item.vehicle_type || "-",
    },
    {
      field: "model",
      headerName: "Model",
      valueGetter: (item) => item.model || "-",
      hideOnMobile: true,
    },
    {
      field: "driver_name",
      headerName: "Driver",
      valueGetter: (item) => item.driver_name || "-",
      hideOnMobile: true,
    },
    {
      field: "driver_phone",
      headerName: "Driver Phone",
      valueGetter: (item) => item.driver_phone || "-",
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
      breadcrumbs={[{ title: "Home" }, { title: "Ambulance" }, { title: "Vehicles" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Ambulance Fleet"
          subtitle="Manage ambulance vehicles and crew"
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
                Add Vehicle
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by registration, driver..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            <SearchIcon />
          </Button>
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
          noItemsOverlayMessage="No ambulance vehicles found. Add your first vehicle."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Vehicles;

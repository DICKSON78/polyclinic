import React, { useEffect, useRef, useState } from "react";

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

import DonorForm from "./DonorForm";

const STATUS_COLORS = {
  Active: "success",
  Deferred: "warning",
  Inactive: "default",
};

const Donors = () => {
  const addToast = useToast();
  const modalRef = useRef();

  usePrivilege('laboratory', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/blood-bank/donors",
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
    document.title = `Blood Donors - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openForm = (item) => {
    modalRef.current.open(
      item ? "Edit Blood Donor" : "Register Blood Donor",
      <DonorForm
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
      field: "donor_no",
      headerName: "Donor No",
      valueGetter: (item) => item.donor_no || "-",
    },
    {
      field: "full_name",
      headerName: "Name",
      valueGetter: (item) => item.full_name || item.first_name || "-",
    },
    {
      field: "blood_group",
      headerName: "Blood Type",
      renderCell: (item) => (
        <Chip
          size="small"
          color="error"
          label={item.blood_group ? `${item.blood_group}${item.rh_factor === "Negative" ? "-" : "+"}` : "-"}
        />
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      valueGetter: (item) => item.phone || "-",
      hideOnMobile: true,
    },
    {
      field: "gender",
      headerName: "Gender",
      valueGetter: (item) => item.gender || "-",
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
      breadcrumbs={[{ title: "Home" }, { title: "Blood Bank" }, { title: "Donors" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Blood Donors"
          subtitle="Manage registered blood donors"
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
                Register Donor
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by name, phone or donor no..."
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
          noItemsOverlayMessage="No blood donors found. Register your first donor."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Donors;

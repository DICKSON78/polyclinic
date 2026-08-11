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
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import BodyForm from "./BodyForm";

const STATUS_COLORS = {
  "In-Storage": "info",
  Transferred: "warning",
  Released: "success",
  Cremated: "secondary",
};

const Bodies = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/mortuary/bodies",
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
    document.title = `Mortuary Bodies - ${window.APP_NAME}`;
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
      item ? "Edit Mortuary Body" : "Admit Body",
      <BodyForm item={item} modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "body_no",
      headerName: "Body No",
      valueGetter: (item) => item.body_no || "-",
    },
    {
      field: "deceased_name",
      headerName: "Deceased",
      valueGetter: (item) => item.deceased_name || "-",
    },
    {
      field: "gender",
      headerName: "Gender",
      valueGetter: (item) => item.gender || "-",
      hideOnMobile: true,
    },
    {
      field: "age",
      headerName: "Age",
      valueGetter: (item) => item.age || "-",
      hideOnMobile: true,
    },
    {
      field: "cause_of_death",
      headerName: "Cause of Death",
      valueGetter: (item) => item.cause_of_death || "-",
      hideOnMobile: true,
    },
    {
      field: "storage_location",
      headerName: "Location",
      valueGetter: (item) => item.storage_location || "-",
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
      headerName: "Actions",
      width: 90,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Body">
            <IconButton
              size="small"
              onClick={() => navigate(`/mortuary/bodies/${item.id}`)}
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
      breadcrumbs={[{ title: "Home" }, { title: "Mortuary" }, { title: "Bodies" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Mortuary Bodies"
          subtitle="Manage bodies in storage"
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
                Admit Body
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by body no, name..."
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
          noItemsOverlayMessage="No mortuary bodies found. Admit your first body."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Bodies;

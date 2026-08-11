import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, useDelete, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, numberFormat } from "../../../helpers";

import TestForm from "./TestForm";

const Tests = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const searchRef = useRef();

  usePrivilege('laboratory', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");
  const [deleting, setDeleting] = useState();

  const { data, loading, error, handleFetch } = useFetch(
    "api/laboratory/tests",
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

  const { data: deleteData, handleDelete, loading: deletingLoading, error: deleteError } = useDelete();

  useEffect(() => {
    document.title = `Lab Tests - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  const openForm = (item) => {
    modalRef.current.open(
      item ? "Edit Lab Test" : "Add Lab Test",
      <TestForm
        item={item}
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "sm"
    );
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const openDeleteDialog = (item) => {
    setDeleting(item);
    modalRef.current.open(
      "Delete Lab Test",
      <ConfirmationDialog
        message={`Are you sure you want to delete "${item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/laboratory/tests/${item.id}`);
        }}
      />,
      "sm"
    );
  };

  useEffect(() => {
    if (deleteData) {
      addToast({ message: "Lab test deleted successfully.", severity: "success" });
      handleFetch();
      setDeleting(undefined);
    }
  }, [deleteData]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      valueGetter: (item) => item.name,
      minWidth: { xs: 120, sm: 180 },
      flex: 1,
    },
    {
      field: "code",
      headerName: "Code",
      valueGetter: (item) => item.code || "—",
      minWidth: { xs: 60, sm: 90 },
      hideOnMobile: true,
    },
    {
      field: "category",
      headerName: "Category",
      valueGetter: (item) => item.category || "—",
      minWidth: { xs: 80, sm: 120 },
      hideOnMobile: true,
    },
    {
      field: "specimen_type",
      headerName: "Specimen",
      valueGetter: (item) => item.specimen_type || "—",
      minWidth: { xs: 70, sm: 100 },
      hideOnMobile: true,
    },
    {
      field: "reference_range",
      headerName: "Reference Range",
      valueGetter: (item) => item.reference_range || "—",
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "price",
      headerName: "Price (TZS)",
      valueGetter: (item) => numberFormat(item.price),
      minWidth: { xs: 90, sm: 120 },
      hideOnMobile: true,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: { xs: 70, sm: 100 },
      renderCell: (item) => (
        <Chip
          label={item.status || "Active"}
          size="small"
          color={item.status === "Active" ? "success" : "default"}
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
          <IconButton size="small" onClick={() => openDeleteDialog(item)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Laboratory" },
        { title: "Test Catalog" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Lab Test Catalog"
          subtitle="Manage laboratory test definitions"
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
                Add Test
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5}>
          <SearchTextField
            placeholder="Search by name, code or category..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            <SearchIcon />
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
          noItemsOverlayMessage="No lab tests found. Add your first lab test."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Tests;

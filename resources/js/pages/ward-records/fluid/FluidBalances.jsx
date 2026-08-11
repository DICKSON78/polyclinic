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
  DeleteRounded as DeleteIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";
import { blue, green, red } from "@mui/material/colors";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";

import { useConfirm, useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import FluidBalanceForm from "./FluidBalanceForm";

const FluidBalances = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const confirm = useConfirm();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({ page: 1, per_page: 25, q: undefined });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/ward-records/fluid-balances",
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

  const { data: deleteData, handlePost: deleteItem } = usePost();

  useEffect(() => {
    document.title = `Fluid Balance - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      handleFetch();
    }
  }, [deleteData]);

  const openForm = () => {
    modalRef.current.open(
      "Fluid Balance Entry",
      <FluidBalanceForm modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleDelete = (item) => {
    confirm.open({
      title: "Delete Fluid Balance Entry?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: () => deleteItem(`api/ward-records/fluid-balances/${item.id}/delete`, {}),
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
      field: "entry_type",
      headerName: "Type",
      renderCell: (item) => (
        <Chip
          size="small"
          sx={{ color: "#fff", backgroundColor: item.entry_type === "Input" ? blue[600] : red[600] }}
          label={item.entry_type || "-"}
        />
      ),
    },
    {
      field: "amount_ml",
      headerName: "Amount (ml)",
      valueGetter: (item) => (item.amount_ml != null ? `${item.amount_ml} ml` : "-"),
    },
    {
      field: "route",
      headerName: "Route",
      valueGetter: (item) => item.route || "-",
      hideOnMobile: true,
    },
    {
      field: "fluid_type",
      headerName: "Fluid Type",
      valueGetter: (item) => item.fluid_type || "-",
      hideOnMobile: true,
    },
    {
      field: "recorded_by",
      headerName: "Recorded By",
      valueGetter: (item) => item.recorded_by?.full_name || "-",
      hideOnMobile: true,
    },
    {
      field: "recorded_at",
      headerName: "Recorded At",
      valueGetter: (item) => item.recorded_at || "-",
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (item) => (
        <Tooltip title="Delete Entry">
          <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ward Records" }, { title: "Fluid Balance" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Fluid Balance"
          subtitle="Track fluid input and output for admitted patients"
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
                New Entry
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by patient, admission..."
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
          noItemsOverlayMessage="No fluid balance entries found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default FluidBalances;

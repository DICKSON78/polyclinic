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

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";

import { useConfirm, useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import NursingChartForm from "./NursingChartForm";

const TYPE_COLORS = {
  "Vital Signs": "info",
  Neurological: "warning",
  Cardiac: "error",
  Respiratory: "secondary",
  Renal: "primary",
  General: "default",
};

const NursingCharts = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const confirm = useConfirm();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({ page: 1, per_page: 25, q: undefined });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/ward-records/nursing-charts",
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
    document.title = `Nursing Charts - ${window.APP_NAME}`;
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
      "Nursing Chart",
      <NursingChartForm modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleDelete = (item) => {
    confirm.open({
      title: "Delete Nursing Chart?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: () => deleteItem(`api/ward-records/nursing-charts/${item.id}/delete`, {}),
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
      field: "chart_type",
      headerName: "Type",
      renderCell: (item) => (
        <Chip
          size="small"
          color={TYPE_COLORS[item.chart_type] || "default"}
          label={item.chart_type || "-"}
        />
      ),
    },
    {
      field: "vitals",
      headerName: "Vitals",
      valueGetter: (item) =>
        item.temp != null || item.pulse != null
          ? `${item.temp ?? "-"}°C / ${item.pulse ?? "-"}bpm / BP ${item.bp_systolic ?? "-"}/${item.bp_diastolic ?? "-"}`
          : "-",
      hideOnMobile: true,
    },
    {
      field: "charted_by",
      headerName: "Charted By",
      valueGetter: (item) => item.charted_by?.full_name || "-",
      hideOnMobile: true,
    },
    {
      field: "charted_at",
      headerName: "Charted At",
      valueGetter: (item) => item.charted_at || "-",
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (item) => (
        <Tooltip title="Delete Chart">
          <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ward Records" }, { title: "Nursing Charts" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Nursing Charts"
          subtitle="Record and review patient observations"
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
                New Chart
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
          noItemsOverlayMessage="No nursing charts found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default NursingCharts;

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
  VerifiedRounded as FinalizeIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import DischargeSummaryForm from "./DischargeSummaryForm";

const STATUS_COLORS = {
  Draft: "warning",
  Finalized: "success",
};

const DischargeSummaries = () => {
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
    "api/ward-records/discharge-summaries",
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

  const { data: finalizeData, handlePost: postFinalize } = usePost();

  useEffect(() => {
    document.title = `Discharge Summaries - ${window.APP_NAME}`;
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
      item ? `Edit Summary - ${item.admission?.admission_no || ""}` : "Discharge Summary",
      <DischargeSummaryForm item={item} modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleFinalize = (item) => {
    postFinalize(`api/ward-records/discharge-summaries/${item.id}/finalize`, {});
  };

  useEffect(() => {
    if (finalizeData) {
      addToast({ message: finalizeData.message, severity: "success" });
      handleFetch();
    }
  }, [finalizeData]);

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
      field: "diagnoses",
      headerName: "Diagnoses",
      valueGetter: (item) => item.diagnoses || "-",
      hideOnMobile: true,
    },
    {
      field: "doctor",
      headerName: "Doctor",
      valueGetter: (item) => item.doctor?.full_name || "-",
      hideOnMobile: true,
    },
    {
      field: "prepared_at",
      headerName: "Prepared At",
      valueGetter: (item) => item.prepared_at || "-",
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
      width: 120,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Summary">
            <IconButton size="small" onClick={() => openForm(item)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {item.status === "Draft" ? (
            <Tooltip title="Finalize">
              <IconButton size="small" color="success" onClick={() => handleFinalize(item)}>
                <FinalizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ward Records" }, { title: "Discharge Summaries" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Discharge Summaries"
          subtitle="Structured discharge documentation"
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
                New Summary
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by diagnosis, patient..."
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
          noItemsOverlayMessage="No discharge summaries found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default DischargeSummaries;

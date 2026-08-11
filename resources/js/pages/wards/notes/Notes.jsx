import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
  StickyNote2Rounded as NotesIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const Notes = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('wards', '/dashboard');

  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState({ page: 1, per_page: 25 });

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient/notes",
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
    document.title = `Inpatient Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const noteTypeColor = (t) => {
    if (t === "Physician") return "info";
    if (t === "Nursing") return "secondary";
    if (t === "Procedure") return "warning";
    if (t === "Other") return "default";
    return "primary";
  };

  const columns = [
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "—",
      minWidth: { xs: 130, sm: 180 },
      flex: 1,
    },
    {
      field: "note_type",
      headerName: "Type",
      minWidth: { xs: 80, sm: 110 },
      renderCell: (item) => (
        <Chip label={item.note_type} size="small" color={noteTypeColor(item.note_type)} />
      ),
    },
    {
      field: "admission",
      headerName: "Admission",
      valueGetter: (item) => item.admission?.admission_no || "—",
      minWidth: { xs: 110, sm: 170 },
      hideOnMobile: true,
    },
    {
      field: "note_text",
      headerName: "Note",
      valueGetter: (item) => item.note_text || "—",
      minWidth: { xs: 150, sm: 260 },
      hideOnMobile: true,
    },
    {
      field: "noted_by",
      headerName: "Noted By",
      valueGetter: (item) => item.noted_by?.full_name || "—",
      minWidth: { xs: 100, sm: 150 },
      hideOnMobile: true,
    },
    {
      field: "noted_at",
      headerName: "Date",
      valueGetter: (item) => (item.noted_at ? new Date(item.noted_at).toLocaleString() : "—"),
      minWidth: { xs: 100, sm: 140 },
      hideOnMobile: true,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: (item) => (
        <IconButton
          size="small"
          onClick={() => navigate(`/wards/admissions/${item.admission_id}`)}
          disabled={!item.admission_id}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Wards / Inpatient" },
        { title: "Inpatient Notes" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Inpatient Notes"
          subtitle="All clinical and nursing notes recorded during admissions"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5}>
          <SearchTextField
            placeholder="Search notes..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            Search
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
          noItemsOverlayMessage="No notes found."
        />
      </Card>
    </Page>
  );
};

export default Notes;

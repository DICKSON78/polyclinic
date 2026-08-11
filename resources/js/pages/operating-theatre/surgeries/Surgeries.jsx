import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
  PersonRounded as PatientIcon,
  MeetingRoomRounded as TheatreIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Filters from "./Filters";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Scheduled: "default",
  Ready: "info",
  "In-Progress": "warning",
  Completed: "success",
  Postponed: "secondary",
  Cancelled: "error",
};

const TYPE_COLORS = {
  Elective: "default",
  Emergency: "error",
  Urgent: "warning",
};

const Surgeries = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    procedure_type: searchParams.get("procedure_type") || undefined,
    date: searchParams.get("date") || undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/operating-theatre/surgeries",
    {
      ...params,
      date: params.date === "today" ? new Date().toISOString().slice(0, 10) : undefined,
    },
    true,
    { data: [], total: 0 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
      };
    }
  );

  useEffect(() => {
    document.title = `Surgeries - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Operating Theatre" }, { title: "Surgeries" }]}
    >
      <Card>
        <PageHeader
          title="Surgeries"
          subtitle="Manage the surgical list"
          trailing={
            <React.Fragment>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/operating-theatre/surgeries/new")}
              >
                Schedule Surgery
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
            <SearchTextField
              placeholder="Search patient, procedure..."
              onChange={(value) => setParams({ ...params, q: value || undefined, page: 1 })}
            />
          </Stack>
          <Filters params={params} setParams={setParams} />
          <Table
            loading={loading}
            columns={[
              {
                field: "surgery_no",
                headerName: "Surgery No",
                valueGetter: (item) => item.surgery_no || "-",
              },
              {
                field: "patient",
                headerName: "Patient",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PatientIcon fontSize="small" color="action" />
                    <Typography variant="body2">{item.patient?.full_name || "-"}</Typography>
                  </Stack>
                ),
              },
              {
                field: "procedure_name",
                headerName: "Procedure",
                valueGetter: (item) => item.procedure_name || "-",
                hideOnMobile: true,
              },
              {
                field: "procedure_type",
                headerName: "Type",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={TYPE_COLORS[item.procedure_type] || "default"}
                    label={item.procedure_type || "-"}
                  />
                ),
                hideOnMobile: true,
              },
              {
                field: "scheduled_at",
                headerName: "Scheduled",
                valueGetter: (item) => item.scheduled_at || "-",
                hideOnMobile: true,
              },
              {
                field: "surgeon",
                headerName: "Surgeon",
                valueGetter: (item) => item.surgeon?.full_name || "-",
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
                renderCell: (item) => (
                  <Tooltip title="View Surgery">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/operating-theatre/surgeries/${item.id}`)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                ),
              },
            ]}
            items={Array.isArray(data.data) ? data.data : []}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default Surgeries;

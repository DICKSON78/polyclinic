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
  SpeedRounded as PriorityIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Filters from "./Filters";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Waiting: "warning",
  "In-Treatment": "info",
  Admitted: "success",
  Discharged: "default",
  Referred: "primary",
  Cancelled: "error",
};

const PRIORITY_COLORS = {
  Stable: "success",
  Serious: "warning",
  Critical: "error",
};

const ErVisits = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams] = useSearchParams();

  usePrivilege('triage', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    priority: searchParams.get("priority") || undefined,
    date: searchParams.get("date") || undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/emergency/visits",
    {
      ...params,
      date: params.date === "today" ? new Date().toISOString().slice(0, 10) : params.date,
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
    document.title = `ER Visits - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Emergency" }, { title: "Visits" }]}
    >
      <Card>
        <PageHeader
          title="ER Visits"
          subtitle="Manage emergency visits"
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
                onClick={() => navigate("/emergency/new-visit")}
              >
                New Visit
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Filters params={params} setParams={setParams} sx={{ mb: 2 }} />
          <Table
            loading={loading}
            columns={[
              {
                field: "visit_no",
                headerName: "Visit No",
                valueGetter: (item) => item.visit_no || "-",
              },
              {
                field: "patient",
                headerName: "Patient",
                valueGetter: (item) => item.patient?.full_name || "-",
              },
              {
                field: "arrival_time",
                headerName: "Arrival",
                valueGetter: (item) => item.arrival_time || "-",
                hideOnMobile: true,
              },
              {
                field: "triage_category",
                headerName: "Triage",
                valueGetter: (item) => item.triage_category || "-",
                hideOnMobile: true,
              },
              {
                field: "priority",
                headerName: "Priority",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={PRIORITY_COLORS[item.priority] || "default"}
                    label={item.priority || "-"}
                  />
                ),
              },
              {
                field: "chief_complaint",
                headerName: "Complaint",
                valueGetter: (item) => item.chief_complaint || "-",
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
                  <Tooltip title="View Visit">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/emergency/visits/${item.id}`)}
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

export default ErVisits;

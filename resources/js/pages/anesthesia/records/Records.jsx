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
} from "@mui/material";
import {
  AddRounded as AddIcon,
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
  PersonRounded as PatientIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  "In-Progress": "warning",
  Completed: "success",
  Cancelled: "error",
};

const Records = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [searchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/anesthesia/records",
    { ...params },
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
    document.title = `Anesthesia Records - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Anesthesia" }, { title: "Records" }]}
    >
      <Card>
        <PageHeader
          title="Anesthesia Records"
          subtitle="Manage anesthesia records"
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
                onClick={() => navigate("/anesthesia/records/new")}
              >
                New Record
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
          <Table
            loading={loading}
            columns={[
              {
                field: "record_no",
                headerName: "Record No",
                valueGetter: (item) => item.record_no || "-",
              },
              {
                field: "patient",
                headerName: "Patient",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PatientIcon fontSize="small" color="action" />
                    <span>{item.patient?.full_name || "-"}</span>
                  </Stack>
                ),
              },
              {
                field: "procedure",
                headerName: "Procedure",
                valueGetter: (item) => item.surgery?.procedure_name || "-",
                hideOnMobile: true,
              },
              {
                field: "anesthesia_type",
                headerName: "Type",
                valueGetter: (item) => item.anesthesia_type || "-",
                hideOnMobile: true,
              },
              {
                field: "asa_class",
                headerName: "ASA",
                valueGetter: (item) => item.asa_class || "-",
                hideOnMobile: true,
              },
              {
                field: "anesthesiologist",
                headerName: "Anesthesiologist",
                valueGetter: (item) => item.anesthesiologist?.full_name || "-",
                hideOnMobile: true,
              },
              {
                field: "induction_time",
                headerName: "Induction",
                valueGetter: (item) => item.induction_time || "-",
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
                  <Tooltip title="View Record">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/anesthesia/records/${item.id}`)}
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

export default Records;

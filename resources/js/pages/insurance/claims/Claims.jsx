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
import AddIcon from "@mui/icons-material/AddRounded";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Filters from "./Filters";

import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDateForDb, numberFormat } from "../../../helpers";

const STATUS_COLORS = {
  Draft: "default",
  Submitted: "info",
  Approved: "success",
  Rejected: "error",
  Paid: "primary",
};

const Claims = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    insurance_company_id: undefined,
    start_date: undefined,
    end_date: undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/insurance-claim",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    { data: [], total: 0 },
    (response) => {
      const raw = response?.data?.data;
      if (!raw || typeof raw !== "object") return { data: [], total: 0 };
      return {
        data: Array.isArray(raw.data) ? raw.data : [],
        total: parseInt(raw.total, 10) || 0,
      };
    }
  );

  useEffect(() => {
    document.title = `Insurance Claims - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Claims" },
      ]}
    >
      <Card>
        <PageHeader
          title="Insurance Claims"
          subtitle="Submit, approve and track insurance claims"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/insurance/claims/new")}
              >
                New Claim
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "claim_no",
                headerName: "Claim No",
              },
              {
                field: "service_date",
                headerName: "Service Date",
              },
              {
                field: "patient_id",
                headerName: "Patient",
                valueGetter: (item, index) => item.patient?.full_name || "-",
              },
              {
                field: "insurance_company_id",
                headerName: "Insurance Company",
                valueGetter: (item, index) => item.insurance_company?.name || "-",
              },
              {
                field: "claim_amount",
                headerName: "Claim Amount",
                valueGetter: (item, index) => numberFormat(item.claim_amount || 0),
              },
              {
                field: "approved_amount",
                headerName: "Approved",
                valueGetter: (item, index) => numberFormat(item.approved_amount || 0),
              },
              {
                field: "paid_amount",
                headerName: "Paid",
                valueGetter: (item, index) => numberFormat(item.paid_amount || 0),
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="View Claim">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/insurance/claims/${item.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
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

export default Claims;

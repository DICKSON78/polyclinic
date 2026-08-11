import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import GlassPatientFilters from "../../reception/glass-patients/GlassPatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";

const MarketingGlassPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Sent to Optician",
    require_glass: "Yes",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end_date: new Date(),
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      ...params,
      require_glass: "Yes",
      status: params.status || undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date
        ? formatDateForDb(params.end_date)
        : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        page: paginatedData.current_page || paginatedData.page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `List of Dispensing Patients - ${window.APP_NAME}`;
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
        { title: "Marketing" },
        { title: "List of Dispensing Patients" },
      ]}
    >
      <Card>
        <PageHeader
          title="List of Dispensing Patients"
          subtitle={`${(data && typeof data.total === "number") ? data.total : 0} patients`}
          trailing={
            <Tooltip title="Refresh List">
              <IconButton onClick={handleFetch} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                label="Status"
                fullWidth
                options={[
                  { id: "", name: "All" },
                  { id: "Awaiting Glass", name: "Awaiting Glass" },
                  { id: "Sent to Optician", name: "Sent to Optician" },
                ]}
                optionsLabel="name"
                optionsValue="id"
                value={params.status ?? ""}
                onChange={(value) =>
                  setParams({ ...params, status: value || undefined, page: 1 })
                }
              />
            </Grid>
          </Grid>
          <GlassPatientFilters
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
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item) =>
                  item.payment_cache_item?.payment_cache?.check_in?.patient
                    ?.full_name ?? "—",
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item) =>
                  item.payment_cache_item?.payment_cache?.check_in?.patient_id ??
                  "—",
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item) =>
                  getAge(
                    item.payment_cache_item?.payment_cache?.check_in?.patient
                      ?.date_of_birth
                  ),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item) =>
                  item.payment_cache_item?.payment_cache?.check_in?.patient
                    ?.gender ?? "—",
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item) =>
                  item.payment_cache_item?.payment_cache?.check_in?.patient
                    ?.phone ?? "—",
              },
              {
                field: "require_glass",
                headerName: "Item Required",
                renderCell: (item) => {
                  const requireGlass = item.require_glass;
                  if (requireGlass === "Yes") {
                    return (
                      <Chip
                        label="Yes"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    );
                  }
                  return (
                    <Chip
                      label="No"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  );
                },
              },
              {
                field: "patient_direction",
                headerName: "Direction",
                valueGetter: (item) => item.patient_direction ?? "—",
              },
              {
                field: "created_at",
                headerName: "Date",
                valueGetter: (item) => {
                  if (item.patient_direction === "Direct to Doctor") {
                    return (
                      item.payment_cache_item?.served_at || item.updated_at || "—"
                    );
                  }
                  return item.created_at ?? "—";
                },
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => {
                  const patientId =
                    item.payment_cache_item?.payment_cache?.check_in
                      ?.patient_id;
                  if (!patientId) return null;
                  return (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/reception/patients/${patientId}/records/patient-file`)
                      }
                    >
                      View patient
                    </Button>
                  );
                },
              },
            ]}
            items={data?.data ?? []}
            itemCount={data?.total ?? 0}
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

export default MarketingGlassPatients;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import GlassPatientFilters from "./GlassPatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";

// Helper functions for weekly date ranges
const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const getWeekEndDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const GlassPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Awaiting Glass",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
    end_date: new Date(),   // Today
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Handle paginated response from Laravel
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
    document.title = `Dispensing Patients - ${window.APP_NAME}`;
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
        { title: "Sales Table" },
        { title: "Dispensing Patients" },
      ]}
    >
      <Card>
        <PageHeader 
          title="Dispensing Patients"
          trailing={
            <Tooltip title="Refresh List">
              <IconButton
                onClick={handleFetch}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
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
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient
                    .full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(
                    item.payment_cache_item.payment_cache.check_in.patient
                      .date_of_birth
                  ),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient.phone,
              },
              {
                field: "require_glass",
                headerName: "Item Required",
                renderCell: (item) => {
                  const requireGlass = item.require_glass;
                  if (requireGlass === 'Yes') {
                    return (
                      <Chip
                        label="Yes"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    );
                  } else {
                    return (
                      <Chip
                        label="No"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    );
                  }
                },
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) =>
                  item.patient_direction === "Direct to Doctor"
                    ? item.payment_cache_item.consultant?.full_name
                    : item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Sent",
                valueGetter: (item, index) => {
                  if (item.patient_direction === "Direct to Doctor") {
                    // For Direct to Doctor patients, show when consultation was completed
                    // If served_at is available, use it, otherwise use consultation updated_at
                    return item.payment_cache_item.served_at || item.updated_at;
                  } else {
                    // For Direct to Optician patients, show when consultation was created
                    return item.created_at;
                  }
                },
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={
                      <Divider
                        orientation="vertical"
                        sx={{ height: 16 }}
                      />
                    }
                    spacing={1}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(
                          `/sales-management/glass-patients/${item.payment_cache_item.payment_cache.check_in.patient_id}/${item.id}/clinical-notes`
                        )
                      }
                    >
                      Manage
                    </Button>
                  </Stack>
                ),
              },
            ]}
            items={data.data}
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
      <Modal ref={modalRef} />
    </Page>
  );
};

export default GlassPatients;

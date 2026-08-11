import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Filters from "../consultation-room/PatientFilters";

import { useFetch, useToast } from "../../hooks";
import { formatDateForDb, formatError, getAge } from "../../helpers";

const ConsultationPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef();
  // Notification context removed - using stable useDynamicNotifications in Menu component

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Sent to Optician",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
    end_date: new Date(), // Today
    // Add consultation-specific filters for proper backend filtering
    require_glass: "Yes",
    patient_direction: undefined, // Will be set to "Direct to Optician" if needed
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
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patients Sent for Dispensing - ${window.APP_NAME}`;
  }, []);

  // Lock/unlock functionality removed - using stable useDynamicNotifications in Menu component

  // Refresh data only when filters/params change (manual or via filter UI)
  useEffect(() => {
    handleFetch();
  }, [params]);

  // Removed auto-refresh to avoid page flicker; rely on manual/user actions

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Notification badges are now handled by the stable useDynamicNotifications hook in Menu component

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Outpatient Dispensing" },
        { title: "Patients Sent for Dispensing" },
      ]}
    >
      <Card>
        <PageHeader
          title="Patients Sent for Dispensing"
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} sent`}
          trailing={
            <React.Fragment>
              <Tooltip title="Refresh List">
                <IconButton
                  onClick={handleFetch}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!params.consultant_id}
                    onChange={(event) =>
                      setParams({
                        ...params,
                        consultant_id: event.target.checked
                          ? window.user.id
                          : undefined,
                      })
                    }
                  />
                }
                label="My Patients Only"
              />
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
                  item.patient_direction === "Direct to Optician"
                    ? item.creator?.full_name
                    : item.to_optician_sender?.full_name,
              },
              {
                field: "sent_to_optician_at",
                headerName: "Date Sent",
                valueGetter: (item, index) => {
                  if (item.patient_direction === "Direct to Optician") {
                    return item.created_at;
                  } else {
                    return item.sent_to_optician_at;
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
                          `/optician-center/glass-patients/${item.payment_cache_item.payment_cache.check_in.patient_id}/${item.id}/clinical-notes`
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

export default ConsultationPatients;

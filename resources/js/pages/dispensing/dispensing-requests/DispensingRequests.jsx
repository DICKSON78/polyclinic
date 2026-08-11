import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Divider, Stack, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge } from "../../../helpers";

const DispensingRequests = ({ consultationType, stockItem }) => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  // Notification context removed - using stable useDynamicNotifications in Menu component

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending,Paid,Billed", // Only show items awaiting dispensing, not already served
    item_consultation_type: undefined,
    is_stock_item: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    end_date: new Date(), // today
    // Add consultation-specific filters for Glass items
    consultation_require_glass: consultationType === "Glass" ? "Yes" : undefined,
    consultation_sent_to_optician: consultationType === "Glass" ? true : undefined,
  });

  // Use separate state for actual query params to avoid auto-refetch on every params change
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending,Paid,Billed", // Only show items awaiting dispensing, not already served
    item_consultation_type: undefined,
    is_stock_item: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    end_date: new Date(),
    consultation_require_glass: consultationType === "Glass" ? "Yes" : undefined,
    consultation_sent_to_optician: consultationType === "Glass" ? true : undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-payment-cache",
    {
      ...queryParams,
      item_consultation_type: consultationType,
      is_stock_item: stockItem,
      start_date: queryParams.start_date
        ? formatDateForDb(queryParams.start_date)
        : undefined,
      end_date: queryParams.end_date ? formatDateForDb(queryParams.end_date) : undefined,
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
    document.title = `Dispensing Requests - ${window.APP_NAME}`;
  }, []);

  // Lock appropriate badge while on this page - removed as notification context is no longer used
  // useEffect(() => {
  //   const key = consultationType === 'Glass'
  //     ? 'glass_dispensing_requests'
  //     : (consultationType === 'Others' ? 'other_dispensing_requests' : 'dispensing_requests');
  //   lockNotificationKey(key);
  //   return () => unlockNotificationKey(key);
  // }, [consultationType, lockNotificationKey, unlockNotificationKey]);

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
        {
          title:
            consultationType === "Others"
              ? "Other Dispensing"
              : consultationType === "Glass"
                ? "Outpatient Dispensing"
                : "Medicine Center",
        },
        { title: "Dispensing Requests" },
      ]}
    >
      <Card>
        <PageHeader 
          title="Dispensing Requests" 
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} pending`} 
          trailing={
            <Tooltip title="Refresh List">
              <IconButton onClick={() => { setQueryParams({ ...params }); handleFetch(); }} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
                valueGetter: (item, index) => item.check_in.patient.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(item.check_in.patient.date_of_birth),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.check_in.patient.phone,
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Sent",
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
                          `/${consultationType === "Others" ? "other-dispensing" : consultationType === "Glass" ? "optician-center" : "medicine-center"}/dispensing-requests/${item.check_in.patient_id}/${item.id}`
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
            onPageChange={(page) => { setParams({ ...params, page }); setQueryParams((prev) => ({ ...prev, page })); handleFetch(); }}
            onPageSizeChange={(value) => { const next = { ...params, per_page: value, page: 1 }; setParams(next); setQueryParams((prev) => ({ ...prev, per_page: value, page: 1 })); handleFetch(); }}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default DispensingRequests;

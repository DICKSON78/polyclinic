import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack, Badge, Box, IconButton, Tooltip } from "@mui/material";
import {
  VisibilityRounded as VisibilityIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge, getWeekStartDate } from "../../../helpers";
import { useNotificationContext } from "../../../contexts/NotificationContext";
import notificationEvents from "../../../utils/notificationEvents";

const PendingCashPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, loading: notificationsLoading } = useNotificationContext();
  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending,Billed,Served", // Include pending/billed/served items routed to cashier
    item_transaction_type: "Cash",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: new Date(), // Default to current day
    end_date: new Date(), // Default to current day
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-payment-cache",
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
      // Response structure: { data: { data: [...], total: X, current_page: Y, ... }, message: "..." }
      const paginatedData = response?.data?.data || response?.data || {};
      
      // Debug logging
      console.log('PendingCashPatients API Response:', {
        fullResponse: response,
        responseData: response?.data,
        paginatedData: paginatedData,
        itemsArray: paginatedData?.data,
        total: paginatedData?.total,
      });
      
      // Ensure we return the correct structure
      const result = {
        data: paginatedData?.data || paginatedData || [],
        total: paginatedData?.total || 0,
        page: paginatedData?.current_page || paginatedData?.page || 1,
        per_page: paginatedData?.per_page || 25,
      };
      
      console.log('PendingCashPatients Parsed Result:', result);
      return result;
    }
  );

  useEffect(() => {
    document.title = `Cash Patients - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error('PendingCashPatients Error:', error);
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Debug: Log data changes
  useEffect(() => {
    if (data) {
      console.log('PendingCashPatients Data Updated:', {
        itemsCount: data.data?.length || 0,
        total: data.total,
        page: data.page,
        hasData: !!data.data,
      });
    }
  }, [data]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize refresh handler
  const handleRefresh = useCallback(() => {
    if (!loading) {
      setIsRefreshing(true);
      handleFetch();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [handleFetch, loading]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        handleFetch();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [handleFetch, loading]);

  // Listen to notification events to refresh data
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      setTimeout(() => {
        if (!loading) {
          handleFetch();
        }
      }, 500);
    });

    return () => unsubscribe();
  }, [handleFetch, loading]);

  // Refresh data when notifications change to ensure real-time updates
  useEffect(() => {
    if (notifications && !notificationsLoading && handleFetch) {
      // Small delay to avoid too frequent refreshes
      const timeoutId = setTimeout(() => {
        handleFetch();
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications?.patients_sent_to_cashier, notificationsLoading]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Cash Patients" },
      ]}
    >
      <Card>
        <PageHeader
          title="Cash Patients"
          subtitle={
            <Badge
              badgeContent={notifications && typeof notifications.patients_sent_to_cashier !== 'undefined' && notifications.patients_sent_to_cashier != null ? (Number(notifications.patients_sent_to_cashier) || 0) : 0}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: '20px',
                  minWidth: '20px',
                  padding: '0 6px',
                },
              }}
            >
              <span>{`${(data && typeof data.total === 'number') ? data.total : 0} total`}</span>
            </Badge>
          }
          trailing={
            <Tooltip title={loading || isRefreshing ? "Refreshing..." : "Refresh data"}>
              <span>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={loading || isRefreshing}
                  sx={{
                    animation: (loading || isRefreshing) ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
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
                renderCell: (item) => {
                  const patient = item?.check_in?.patient;
                  const fullName = patient?.full_name || 'N/A';
                  const isVip = patient?.is_vip;
                  const isBusinessperson = patient?.is_businessperson;
                  
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <span>{fullName}</span>
                      {isVip === true && (
                        <Chip
                          icon={<StarIcon />}
                          label="VIP"
                          color="warning"
                          size="small"
                        />
                      )}
                      {isBusinessperson === true && (
                        <Chip
                          icon={<BusinessIcon />}
                          label="Business"
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>
                  );
                },
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item?.check_in?.patient_id || 'N/A',
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  item?.check_in?.patient?.date_of_birth ? getAge(item.check_in.patient.date_of_birth) : 'N/A',
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item?.check_in?.patient?.gender || 'N/A',
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item?.check_in?.patient?.phone || 'N/A',
              },
              {
                field: "require_glass",
                headerName: "Item Required",
                renderCell: (item) => {
                  const requireGlass = item.consultation?.require_glass;
                  if (requireGlass === 'Yes') {
                    return (
                      <Chip
                        label="Yes"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    );
                  }
                  return requireGlass === 'No' ? (
                    <Chip
                      label="No"
                      color="default"
                      size="small"
                    />
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>
                  );
                },
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
                tableCellProps: {
                  sx: {
                    minWidth: { xs: 150, sm: 250 },
                    maxWidth: { xs: 200, sm: 'none' },
                  },
                },
                renderCell: (item) => {
                  // Check if any items are served (dispensed) - this determines the workflow
                  const hasServedItems = item.items?.some(it => it.status === 'Served');
                  const hasPendingItems = item.items?.some(it => it.status === 'Pending');

                  return (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 0.75, sm: 1 },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                        flexWrap: 'wrap',
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 'none' },
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          const patientId = item.check_in?.patient_id;
                          const paymentCacheId = item.id;
                          if (patientId && paymentCacheId) {
                            navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
                          }
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: { xs: "100%", sm: 100 },
                          maxWidth: { xs: "100%", sm: 'none' },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          px: { xs: 1.5, sm: 2 },
                          py: { xs: 0.75, sm: 0.5 },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Manage
                      </Button>
                      {hasServedItems && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            const patientId = item.check_in?.patient_id;
                            const paymentCacheId = item.id;
                            if (patientId && paymentCacheId) {
                              navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
                            }
                          }}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { xs: "100%", sm: 120 },
                            maxWidth: { xs: "100%", sm: 'none' },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.75, sm: 0.5 },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Bill Patient
                        </Button>
                      )}
                    </Box>
                  );
                },
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

export default PendingCashPatients;

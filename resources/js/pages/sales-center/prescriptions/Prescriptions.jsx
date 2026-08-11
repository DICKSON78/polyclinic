import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
  Box,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Stack,
} from "@mui/material";
import {
  AssignmentRounded as PrescriptionIcon,
  PersonRounded as PersonIcon,
  CalendarTodayRounded as CalendarIcon,
  PhoneRounded as PhoneIcon,
  EmailRounded as EmailIcon,
  RefreshRounded as RefreshIcon,
  AccessTimeRounded as TimeIcon,
  WarningRounded as WarningIcon,
  CheckCircleRounded as CheckIcon,
} from "@mui/icons-material";
import { blue, green, orange, red, purple, teal } from "@mui/material/colors";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import InfoCard from "../../../pages/dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const Prescriptions = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    start_date: undefined,
    end_date: undefined,
    patient_name: undefined,
    patient_number: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/sales-center/prescriptions",
    {
      ...params,
      start_date: params.start_date ? params.start_date.toISOString().split('T')[0] : undefined,
      end_date: params.end_date ? params.end_date.toISOString().split('T')[0] : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { data: summaryData, loading: summaryLoading, handleFetch: fetchSummary } = useFetch(
    "api/sales-center/prescriptions/summary",
    {},
    true,
    {
      total: 0,
      by_days: {
        today: 0,
        last_7_days: 0,
        last_30_days: 0,
        over_30_days: 0,
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Prescriptions Without Purchases - ${window.APP_NAME}`;
    fetchSummary();
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    fetchSummary();
    addToast({ message: "Data refreshed", severity: "success" });
  };

  const getDaysColor = (days) => {
    if (days <= 7) return "success";
    if (days <= 30) return "warning";
    return "error";
  };

  return (
    <Page
      title="Prescriptions Without Purchases"
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Prescriptions Without Purchases" },
      ]}
    >
      {/* Header with Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Prescriptions Without Purchases
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track clients with prescriptions not yet converted to sales
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={loading || summaryLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards - Matching Director Dashboard Style */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Total Pending"
            count={numberFormat(summaryData?.total || 0)}
            icon={<PrescriptionIcon />}
            color={purple[500]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Today"
            count={numberFormat(summaryData?.by_days?.today || 0)}
            icon={<CalendarIcon />}
            color={green[500]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Last 7 Days"
            count={numberFormat(summaryData?.by_days?.last_7_days || 0)}
            icon={<TimeIcon />}
            color={orange[500]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Over 30 Days"
            count={numberFormat(summaryData?.by_days?.over_30_days || 0)}
            icon={<WarningIcon />}
            color={red[500]}
          />
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card
        sx={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '16px',
        }}
      >
        <PageHeader
          title="Clients with Prescriptions (Not Purchased)"
          trailing={
            <Alert 
              severity="info" 
              sx={{ 
                maxWidth: { xs: '100%', md: 600 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              This list shows clients who have been prescribed items but have not yet made a purchase. Salespersons can follow up with these clients to convert prescriptions into sales.
            </Alert>
          }
        />
        <Divider />
        <CardContent>
          {/* Filters */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              bgcolor: 'grey.50',
              borderRadius: '12px',
            }}
          >
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Patient Name"
                  fullWidth
                  value={params.patient_name || ""}
                  onChange={(value) =>
                    setParams({ ...params, patient_name: value || undefined, page: 1 })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Patient Number"
                  fullWidth
                  value={params.patient_number || ""}
                  onChange={(value) =>
                    setParams({ ...params, patient_number: value || undefined, page: 1 })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="Start Date"
                  value={params.start_date || null}
                  onChange={(value) =>
                    setParams({
                      ...params,
                      start_date: value instanceof Date && !isNaN(value) ? value : null,
                      page: 1,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="End Date"
                  value={params.end_date || null}
                  onChange={(value) =>
                    setParams({
                      ...params,
                      end_date: value instanceof Date && !isNaN(value) ? value : null,
                      page: 1,
                    })
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
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
                field: "patient_name",
                headerName: "Patient Name",
                renderCell: (item) => (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {item.patient_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{item.patient_number}
                    </Typography>
                  </Box>
                ),
              },
              {
                field: "patient_contact",
                headerName: "Contact",
                renderCell: (item) => (
                  <Box>
                    {item.patient_phone && (
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {item.patient_phone}
                        </Typography>
                      </Stack>
                    )}
                    {item.patient_email && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {item.patient_email}
                        </Typography>
                      </Stack>
                    )}
                    {!item.patient_phone && !item.patient_email && (
                      <Typography variant="caption" color="text.secondary">
                        No contact info
                      </Typography>
                    )}
                  </Box>
                ),
                hideOnMobile: true,
              },
              {
                field: "consultation_date",
                headerName: "Prescription Date",
                valueGetter: (item) => item.consultation_date_formatted || "N/A",
                hideOnMobile: true,
              },
              {
                field: "days_since_prescription",
                headerName: "Days Since",
                renderCell: (item) => (
                  <Chip
                    label={`${item.days_since_prescription} days`}
                    color={getDaysColor(item.days_since_prescription)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                ),
              },
              {
                field: "consulted_by",
                headerName: "Prescribed By",
                valueGetter: (item) => item.consulted_by || "N/A",
                hideOnMobile: true,
              },
              {
                field: "patient_gender",
                headerName: "Gender",
                valueGetter: (item) => item.patient_gender || "N/A",
                hideOnMobile: true,
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
    </Page>
  );
};

export default Prescriptions;

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  alpha,
} from "@mui/material";
import {
  AccountBalanceRounded as SalesIcon,
  CenterFocusStrongRounded as GlassIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  MedicalInformationRounded as PharmacyIcon,
  MeetingRoomRounded as ConsultationsIcon,
  MoneyRounded as NetProfitIcon,
  TrendingDownRounded as ExpensesIcon,
  ReceiptRounded as BillsIcon,
  RefreshRounded as RefreshIcon,
  AttachMoneyRounded as RevenueIcon,
  HourglassEmptyRounded as PendingIcon,
  Person2Rounded as PatientIcon,
  PeopleRounded as PeopleIcon,
  LocalHospitalRounded as DoctorIcon,
  ScheduleRounded as ScheduleIcon,
  ShoppingCartRounded as PurchaseIcon,
  BiotechRounded as LabIcon,
  RadioRounded as RadiologyIcon,
  BloodtypeRounded as BloodIcon,
  MedicationRounded as PrescriptionIcon,
  BedRounded as WardsIcon,
  EmergencyRounded as EmergencyIcon,
  LocalTaxiRounded as AmbulanceIcon,
  MeetingRoomRounded as SurgeryIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
import StockAlertsNotification from "../../components/StockAlertsNotification";
import ChartWrapper from "../../components/ChartWrapper";
import Select from "../../components/Select";
import PatientReturnSidebar from "./PatientReturnSidebar";
import notificationEvents from "../../utils/notificationEvents";

import { useTheme } from "@mui/material/styles";
import {
  blue,
  cyan,
  deepOrange,
  green,
  grey,
  indigo,
  lightBlue,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
  amber,
} from "@mui/material/colors";
import { useFetch, useToast } from "../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
  round,
  getWeekStartDate,
  getWeekEndDate,
} from "../../helpers";

// Default payloads so API callback never reads .data from undefined and state is never set to undefined
const DEFAULT_DIRECTOR_DATA = {
  summary: {
    today_patients: 0,
    total_patients_registered: 0,
    web_appointment_bookings: 0,
    total_sales: 0,
    total_revenue: 0,
    total_expenses: 0,
    total_purchases: 0,
    net_profit: 0,
    daily_collections: 0,
    pending_bills: 0,
    running_cost: 0,
    improvement_cost: 0,
    expense_payments: 0,
    revenue_new_consultation: 0,
    revenue_return_consultation: 0,
    revenue_all_consultations: 0,
    discount: 0,
    consultation: 0,
    consultation_purchases: 0,
    consultation_profit: 0,
    pharmacy: 0,
    pharmacy_purchases: 0,
    pharmacy_profit: 0,
    glass: 0,
    glass_purchases: 0,
    glass_profit: 0,
    frame: 0,
    frame_purchases: 0,
    frame_profit: 0,
    consulted_patients: 0,
    lab_requests: 0,
    lab_results: 0,
    radiology_requests: 0,
    blood_donations: 0,
    blood_units: 0,
    prescriptions: 0,
    admissions: 0,
    active_admissions: 0,
    surgeries: 0,
    mortuary_bodies: 0,
    inpatient_bills: 0,
    er_visits: 0,
    ambulance_requests: 0,
    ambulance_trips: 0,
  },
  statistics: {
    sales_by_category: [],
    top_selling_items: [],
  },
};

const DEFAULT_FINANCIAL_DATA = {
  summary: {
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    pending_bills: 0,
    expense_payments: 0,
  },
  statistics: {
    top_expense_categories: [],
    payment_trends: [],
    expense_trends: [],
  },
};

const DEFAULT_CONSULTATION_DATA = {
  summary: {
    total_consultations: 0,
    consultations_today: 0,
    total_patients_seen: 0,
    total_patients_waiting: 0,
  },
  statistics: {
    consultations_by_doctor: [],
    top_diagnosis: [],
  },
};

const Dashboard = ({ setSmsBalance }) => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: window.user?.clinic_id || 1, // Use actual user's clinic_id with fallback
    start_date: new Date(), // Default to today for daily view
    end_date: new Date(),   // Default to today for daily view
  });

  const [salesExpensesPeriod, setSalesExpensesPeriod] = useState('yearly');
  const [patientRegistrationPeriod, setPatientRegistrationPeriod] = useState('yearly');

  // Director Dashboard Data
  const { data: directorData, loading: directorLoading, error: directorError, handleFetch: fetchDirector } = useFetch(
    "api/director/dashboard",
    {
      clinic_id: params.clinic_id,
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    null,
    (response) => {
      console.log('Director Dashboard API Response:', response);
      console.log('Director Dashboard API Data:', response.data);
      console.log('Director Dashboard API Data Data:', response.data?.data);
      console.log('Director Dashboard Summary:', response.data?.data?.summary);
      console.log('Director Dashboard Revenue New:', response.data?.data?.summary?.revenue_new_consultation);
      console.log('Director Dashboard Revenue Return:', response.data?.data?.summary?.revenue_return_consultation);
      console.log('Director Dashboard Consulted Patients:', response.data?.data?.summary?.consulted_patients);
      console.log('All Summary Keys:', Object.keys(response.data?.data?.summary || {}));
      return response.data?.data;
    }
  );

  // Financial Management Dashboard Data
  const dateParams = {
    start_date: params.start_date ? formatDateForDb(params.start_date) : formatDateForDb(new Date()),
    end_date: params.end_date ? formatDateForDb(params.end_date) : formatDateForDb(new Date()),
    sales_expenses_period: salesExpensesPeriod,
    patient_registration_period: patientRegistrationPeriod,
  };

  const { data: financialData, loading: financialLoading, error: financialError, handleFetch: fetchFinancial } = useFetch(
    "api/financial-management/dashboard",
    dateParams,
    true,
    DEFAULT_FINANCIAL_DATA,
    (response) => (response?.data?.data !== undefined && response?.data?.data !== null)
      ? response.data.data
      : DEFAULT_FINANCIAL_DATA
  );

  // Consultation Room Dashboard Data
  const consultationDateParams = {
    start_date: params.start_date ? formatDateForDb(params.start_date) : formatDateForDb(new Date()),
    end_date: params.end_date ? formatDateForDb(params.end_date) : formatDateForDb(new Date()),
  };

  const { data: consultationData, loading: consultationLoading, error: consultationError, handleFetch: fetchConsultation } = useFetch(
    "api/consultation-room/dashboard",
    consultationDateParams,
    true,
    null,
    (response) => {
      console.log('Consultation Dashboard API Response:', response);
      console.log('Consultation Dashboard API Data:', response.data);
      console.log('Consultation Dashboard API Data Data:', response.data?.data);
      console.log('Consultation Dashboard Summary:', response.data?.data?.summary);
      console.log('Consultation Dashboard Summary ALL FIELDS:', Object.keys(response.data?.data?.summary || {}));
      console.log('Consultation Dashboard Total Patients Seen:', response.data?.data?.summary?.total_patients_seen);
      console.log('Consultation Dashboard Patients Waiting:', response.data?.data?.summary?.total_patients_waiting);
      console.log('Consultation Dashboard Consultations Today:', response.data?.data?.summary?.consultations_today);
      console.log('Consultation Dashboard Total Consultations:', response.data?.data?.summary?.total_consultations);
      console.log('Consultation Dashboard Pending Consultations:', response.data?.data?.summary?.pending_consultations);
      console.log('Consultation Dashboard Completed Consultations:', response.data?.data?.summary?.completed_consultations);
      return response.data.data;
    }
  );

  // Update SMS balance when director data changes
  useEffect(() => {
    if (directorData && directorData.summary && directorData.summary.sms_balance !== undefined) {
      setSmsBalance(directorData.summary.sms_balance);
    }
  }, [directorData, setSmsBalance]);

  useEffect(() => {
    fetchDirector();
    fetchFinancial();
    fetchConsultation();
  }, [params.start_date, params.end_date, salesExpensesPeriod, patientRegistrationPeriod]);

  useEffect(() => {
    console.log('=== DIRECTOR DATA DEBUG ===');
    console.log('Director Data:', directorData);
    console.log('Director Summary:', directorData?.summary);
    console.log('Revenue New Consultation:', directorData?.summary?.revenue_new_consultation);
    console.log('Revenue Return Consultation:', directorData?.summary?.revenue_return_consultation);
    console.log('Total Patients Consulted:', directorData?.summary?.total_patients_consulted);
    console.log('Director Loading:', directorLoading);
    console.log('Director Error:', directorError);
    console.log('=== END DEBUG ===');
  }, [directorData, directorLoading, directorError]);

  const loading = directorLoading || financialLoading;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const openFiltersModal = () => {
    const component = (
      <Filters
        modal={modalRef.current}
        params={params}
        setParams={setParams}
      />
    );
    modalRef.current.open("Filter", component, "sm");
  };

  const handleRefresh = useCallback(() => {
    if (!loading) {
      setIsRefreshing(true);
      fetchDirector();
      fetchFinancial();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [fetchDirector, fetchFinancial, loading]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchDirector();
        fetchFinancial();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDirector, fetchFinancial, loading]);

  // Listen to notification events to refresh data
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      setTimeout(() => {
        if (!loading) {
          fetchDirector();
          fetchFinancial();
        }
      }, 500);
    });

    return () => unsubscribe();
  }, [fetchDirector, fetchFinancial, loading]);

  const navigateToFinancialManagement = () => navigate('/financial-management/dashboard');
  const navigateToConsultationRoom = () => navigate('/consultation-room/dashboard');
  const navigateToSalesExpenses = () => navigate(`/dashboard/sales-expenses?period=${salesExpensesPeriod}`);
  const navigateToPatientRegistration = () => {
    const periodValue = typeof patientRegistrationPeriod === 'string' ? patientRegistrationPeriod : 'yearly';
    navigate(`/dashboard/patient-registration?period=${periodValue}`);
  };
  const navigateToClientStatistics = () => navigate('/dashboard/client-statistics');

  if (loading && !directorData && !financialData) {
    return (
      <Page title="Director Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[{ title: "Home" }, { title: "Dashboard" }]}
    >
      <CardHeader
        title="Dashboard"
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Show filters">
              <IconButton onClick={openFiltersModal}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2, height: 6 }} />}

      {(directorError || financialError) && !directorData && !financialData && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            Failed to Load Dashboard Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {formatError(directorError || financialError || consultationError) || "An error occurred while loading the dashboard. Please try refreshing the page."}
          </Typography>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Card>
      )}

      {(directorData || financialData) && (
        <>
          <StockAlertsNotification />

          {/* Key Performance Metrics - Financial Overview (Replica of Financial Management) */}
          <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SalesIcon /> Financial Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Collections"
                    count={numberFormat(directorData?.summary?.daily_collections || 0)}
                    icon={<RevenueIcon />}
                    color={cyan[500]}
                    onClick={() => navigate('/financial-management/reports/cash-collection')}
                  />
                </Grid>
                {/* Commented out: Total Revenue card
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Total Revenue"
                    count={numberFormat(directorData?.summary?.total_revenue || 0)}
                    icon={<SalesIcon />}
                    color={green[500]}
                    onClick={() => navigate('/financial-management/reports/cash-collection')}
                  />
                </Grid>
                */}
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Total Expenses"
                    count={numberFormat(directorData?.summary?.total_expenses || 0)}
                    icon={<ExpensesIcon />}
                    color={red[500]}
                    onClick={() => navigate('/financial-management/expenses')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Net Profit"
                    count={numberFormat(directorData?.summary?.net_profit || 0)}
                    icon={<NetProfitIcon />}
                    color={directorData?.summary?.net_profit >= 0 ? teal[500] : orange[500]}
                    onClick={() => navigate('/financial-management/reports/balance-sheet')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Pending Bills"
                    count={numberFormat(directorData?.summary?.pending_bills || 0)}
                    icon={<PendingIcon />}
                    color={orange[500]}
                    onClick={() => navigate('/financial-management/reports/pending-patient-bills')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Running Cost"
                    count={numberFormat(directorData?.summary?.running_cost || 0)}
                    icon={<ExpensesIcon />}
                    color={pink[500]}
                    onClick={() => navigate('/financial-management/expenses')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <InfoCard
                    title="Improvement Cost"
                    count={numberFormat(directorData?.summary?.improvement_cost || 0)}
                    icon={<PurchaseIcon />}
                    color={purple[500]}
                    onClick={() => navigate('/financial-management/expenses')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Reception Department */}
          <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PeopleIcon /> Reception Department
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    title="Today's Patients"
                    count={numberFormat(directorData?.summary?.today_patients || 0)}
                    icon={<PatientIcon />}
                    color={blue[500]}
                    onClick={() => navigate('/reception/patients')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    title="Total Patients Registered"
                    count={numberFormat(directorData?.summary?.total_patients_registered || 0)}
                    icon={<PeopleIcon />}
                    color={green[500]}
                    onClick={() => navigate('/reception/patients')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoCard
                    title="Web Appointment Bookings"
                    count={numberFormat(directorData?.summary?.web_appointment_bookings || 0)}
                    icon={<ScheduleIcon />}
                    color={orange[500]}
                    onClick={() => navigate('/appointments')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Consultation Room Department */}
          {(directorData || consultationData) && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <DoctorIcon /> Consultation Room Department
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                {directorData && (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <InfoCard
                        title="Revenue from New Consultations"
                        count={numberFormat(directorData?.summary?.revenue_new_consultation || 0)}
                        icon={<ConsultationsIcon />}
                        color={indigo[500]}
                        onClick={() => navigate('/consultation-room/dashboard')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <InfoCard
                        title="Revenue from Return Consultations"
                        count={numberFormat(directorData?.summary?.revenue_return_consultation || 0)}
                        icon={<ConsultationsIcon />}
                        color={indigo[500]}
                        onClick={() => navigate('/consultation-room/dashboard')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <InfoCard
                        title="Total Revenue from All Consultations"
                        count={numberFormat(directorData?.summary?.revenue_all_consultations || 0)}
                        icon={<ConsultationsIcon />}
                        color={indigo[500]}
                        onClick={() => navigate('/consultation-room/dashboard')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      {/* <InfoCard
                        title="Consulted Patients"
                        count={numberFormat(directorData?.summary?.total_patients_consulted || 0)}
                        icon={<ConsultationsIcon />}
                        color={indigo[500]}
                        onClick={() => navigate('/consultation-room/dashboard')}
                      /> */}
                    </Grid>
                    {/* Commented out: Duplicate Consultations Today card
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <InfoCard
                        title="Consultations Today"
                        count={numberFormat(directorData?.summary?.consultations_today || 0)}
                        icon={<ConsultationsIcon />}
                        color={indigo[500]}
                        onClick={() => navigate('/consultation-room/dashboard')}
                      />
                    </Grid>
                    */}
                  </>
                )}
                {consultationData && (
                  <>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <InfoCard
                        title="Consultations Today"
                        count={numberFormat(consultationData.summary?.consultations_today || 0)}
                        icon={<ConsultationsIcon />}
                        color={cyan[400]}
                        onClick={navigateToConsultationRoom}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {/* Financial Management Additional Metrics */}
          {financialData && (
            <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <SalesIcon /> Additional Financial Metrics
                </Typography>
                <Grid container spacing={3}>
                  {/* Commented out: Total Revenue card
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                      title="Total Revenue"
                      count={numberFormat(financialData.summary?.total_revenue || 0)}
                      icon={<RevenueIcon />}
                      color={green[500]}
                      onClick={() => navigate('/financial-management/reports/cash-collection')}
                    />
                  </Grid>
                  */}
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                      title="Total Discount"
                      count={numberFormat(directorData?.summary?.discount || 0)}
                      icon={<DiscountIcon />}
                      color={purple[500]}
                      onClick={() => navigate('/financial-management/reports/discount')}
                    />
                  </Grid>
                  {/* Commented out: Pending Bills card
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoCard
                      title="Pending Bills"
                      count={numberFormat(financialData.summary?.pending_bills || 0)}
                      icon={<PendingIcon />}
                      color={orange[500]}
                      onClick={() => navigate('/financial-management/reports/pending-patient-bills')}
                    />
                  </Grid>
                  */}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Sales by Department & Performance */}
          {directorData && (
            <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BillsIcon /> Sales by Department
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Consultation"
                      count={numberFormat(directorData.summary?.consultation || 0)}
                      icon={<ConsultationsIcon />}
                      color={green[400]}
                      onClick={navigateToConsultationRoom}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Pharmacy"
                      count={numberFormat(directorData.summary?.pharmacy || 0)}
                      icon={<PharmacyIcon />}
                      color={teal[400]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Outpatient Dispensing"
                      count={numberFormat(directorData.summary?.glass || 0, 0)}
                      icon={<GlassIcon />}
                      color={purple[300]}
                    />
                  </Grid>
                     <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Accessory Sales"
                      count={numberFormat(directorData.summary?.frame || 0, 0)}
                      icon={<RevenueIcon />}
                      color={cyan[500]}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Pharmacy Performance */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <PharmacyIcon /> Pharmacy Performance
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Medicine Sales"
                      count={numberFormat(directorData.summary?.pharmacy || 0, 0)}
                      icon={<RevenueIcon />}
                      color={teal[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Medicine Purchases (COGS)"
                      count={numberFormat(directorData.summary?.pharmacy_purchases || 0, 0)}
                      icon={<ExpensesIcon />}
                      color={orange[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InfoCard
                      title="Profit from Medicine"
                      count={numberFormat(directorData.summary?.pharmacy_profit || 0, 0)}
                      icon={<NetProfitIcon />}
                      color={directorData.summary?.pharmacy_profit >= 0 ? green[500] : red[500]}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Outpatient Dispensing Performance */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <GlassIcon /> Outpatient Dispensing Performance
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Item Sales"
                      count={numberFormat(directorData.summary?.glass || 0, 0)}
                      icon={<RevenueIcon />}
                      color={purple[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Item Purchases (COGS)"
                      count={numberFormat(directorData.summary?.glass_purchases || 0, 0)}
                      icon={<ExpensesIcon />}
                      color={orange[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Profit from Items"
                      count={numberFormat(directorData.summary?.glass_profit || 0, 0)}
                      icon={<NetProfitIcon />}
                      color={directorData.summary?.glass_profit >= 0 ? green[500] : red[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Accessory Purchases (COGS)"
                      count={numberFormat(directorData.summary?.frame_purchases || 0, 0)}
                      icon={<ExpensesIcon />}
                      color={deepOrange[500]}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Profit from Accessories"
                      count={numberFormat(directorData.summary?.frame_profit || 0, 0)}
                      icon={<NetProfitIcon />}
                      color={directorData.summary?.frame_profit >= 0 ? green[500] : red[500]}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Clinical & Support Departments */}
          {directorData && (
            <Card sx={{ mb: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <DoctorIcon /> Clinical & Support Departments
                </Typography>
                <Grid container spacing={3}>
                  {/* Laboratory */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Lab Requests"
                      count={numberFormat(directorData.summary?.lab_requests || 0)}
                      icon={<LabIcon />}
                      color={purple[500]}
                      onClick={() => navigate('/laboratory/requests')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Lab Results Completed"
                      count={numberFormat(directorData.summary?.lab_results || 0)}
                      icon={<DoneIcon />}
                      color={green[500]}
                      onClick={() => navigate('/laboratory/results')}
                    />
                  </Grid>
                  {/* Radiology */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Radiology Requests"
                      count={numberFormat(directorData.summary?.radiology_requests || 0)}
                      icon={<RadiologyIcon />}
                      color={cyan[500]}
                      onClick={() => navigate('/radiology/requests')}
                    />
                  </Grid>
                  {/* Blood Bank */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Blood Donations"
                      count={numberFormat(directorData.summary?.blood_donations || 0)}
                      icon={<BloodIcon />}
                      color={red[500]}
                      onClick={() => navigate('/blood-bank/donors')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Available Blood Units"
                      count={numberFormat(directorData.summary?.blood_units || 0)}
                      icon={<BloodIcon />}
                      color={pink[500]}
                      onClick={() => navigate('/blood-bank/units')}
                    />
                  </Grid>
                  {/* E-Prescription */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Prescriptions"
                      count={numberFormat(directorData.summary?.prescriptions || 0)}
                      icon={<PrescriptionIcon />}
                      color={indigo[500]}
                      onClick={() => navigate('/e-prescription/prescriptions')}
                    />
                  </Grid>
                  {/* Wards/Inpatient */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Admissions"
                      count={numberFormat(directorData.summary?.admissions || 0)}
                      icon={<WardsIcon />}
                      color={orange[500]}
                      onClick={() => navigate('/wards/admissions')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Active Admissions"
                      count={numberFormat(directorData.summary?.active_admissions || 0)}
                      icon={<WardsIcon />}
                      color={deepOrange[500]}
                      onClick={() => navigate('/wards/admissions')}
                    />
                  </Grid>
                  {/* Operating Theatre */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Surgeries"
                      count={numberFormat(directorData.summary?.surgeries || 0)}
                      icon={<SurgeryIcon />}
                      color={teal[500]}
                      onClick={() => navigate('/operating-theatre/surgeries')}
                    />
                  </Grid>
                  {/* Mortuary */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Bodies in Mortuary"
                      count={numberFormat(directorData.summary?.mortuary_bodies || 0)}
                      icon={<WardsIcon />}
                      color={grey[500]}
                      onClick={() => navigate('/mortuary/bodies')}
                    />
                  </Grid>
                  {/* Inpatient Billing */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Inpatient Bills"
                      count={numberFormat(directorData.summary?.inpatient_bills || 0)}
                      icon={<BillsIcon />}
                      color={amber[500]}
                      onClick={() => navigate('/inpatient-billing/bills')}
                    />
                  </Grid>
                  {/* Emergency */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="ER Visits"
                      count={numberFormat(directorData.summary?.er_visits || 0)}
                      icon={<EmergencyIcon />}
                      color={red[600]}
                      onClick={() => navigate('/emergency/visits')}
                    />
                  </Grid>
                  {/* Ambulance */}
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Ambulance Requests"
                      count={numberFormat(directorData.summary?.ambulance_requests || 0)}
                      icon={<AmbulanceIcon />}
                      color={orange[600]}
                      onClick={() => navigate('/ambulance/requests')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoCard
                      title="Ambulance Trips"
                      count={numberFormat(directorData.summary?.ambulance_trips || 0)}
                      icon={<AmbulanceIcon />}
                      color={deepOrange[600]}
                      onClick={() => navigate('/ambulance/trips')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Main Content - Charts and Statistics */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: 2 }}
          >
            {/* Sales vs Expenses */}
            {financialData && (
              <Grid size={{ xs: 12 }}>
                    <Card>
                      <CardHeader
                        title="Sales vs Expenses"
                        action={
                          <Select
                            label="Period"
                            options={[
                              { label: "Daily", value: "daily" },
                              { label: "Monthly", value: "monthly" },
                              { label: "Yearly", value: "yearly" },
                            ]}
                            optionsLabel="label"
                            optionsValue="value"
                            value={salesExpensesPeriod}
                            onChange={(value) => {
                              setSalesExpensesPeriod(value);
                              fetchFinancial();
                            }}
                            containerProps={{ minWidth: 120 }}
                          />
                        }
                      />
                      <Divider />
                      <Box sx={{ overflowX: 'auto', width: '100%' }}>
                        <Box sx={{ minWidth: salesExpensesPeriod === 'monthly' ? 900 : 'auto' }}>
                          <ChartWrapper
                            options={{
                              chart: {
                                fontFamily: theme.typography.fontFamily,
                                foreColor: theme.palette.text.primary,
                                background: "transparent",
                                toolbar: { show: false },
                              },
                              plotOptions: {
                                bar: {
                                  borderRadius: 0,
                                  columnWidth: '70%',
                                },
                              },
                              colors: [blue[700], yellow[600]],
                              stroke: { show: false },
                              dataLabels: { enabled: false },
                              grid: { show: false, borderColor: theme.palette.divider },
                              xaxis: {
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                                labels: {
                                  rotate: salesExpensesPeriod === 'monthly' ? -45 : 0,
                                  rotateAlways: salesExpensesPeriod === 'monthly',
                                },
                              },
                              yaxis: {
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                                labels: { formatter: (val) => numberFormat(val) },
                              },
                              tooltip: { theme: "dark", fillSeriesColor: true },
                              legend: { markers: { width: 14, height: 8, radius: 0 } },
                            }}
                            series={[
                              {
                                name: "Sales",
                                data: (financialData.statistics?.sales_expenses || []).map((e) => ({
                                  x: e.period,
                                  y: e.sales || 0,
                                })),
                              },
                              {
                                name: "Expenses",
                                data: (financialData.statistics?.sales_expenses || []).map((e) => ({
                                  x: e.period,
                                  y: e.expenses || 0,
                                })),
                              },
                            ]}
                            type="bar"
                            height="320"
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}

            {/* Sales by Category */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader title="Sales by Category" />
                      <Divider />
                      <ChartWrapper
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            toolbar: { show: false },
                          },
                          plotOptions: {
                            bar: {
                              borderRadius: 0,
                              borderRadiusApplication: "end",
                              borderRadiusWhenStacked: "last",
                              distributed: true,
                            },
                          },
                          colors: [purple[600], teal[400], orange[300], blue[300], pink[300], green[400]],
                          stroke: { show: false },
                          dataLabels: { enabled: false },
                          grid: { show: false, borderColor: theme.palette.divider },
                          xaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                          },
                          yaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                            labels: { formatter: (val) => numberFormat(val) },
                          },
                          tooltip: { theme: "dark", fillSeriesColor: true },
                          legend: { show: false },
                        }}
                        series={[{
                          name: "Sales",
                          data: [
                            { x: "Consultation", y: financialData.summary?.consultation || 0 },
                            { x: "Pharmacy", y: financialData.summary?.pharmacy || 0 },
                            { x: "Outpatient Dispensing", y: financialData.summary?.glass || 0 },
                            { x: "Others", y: financialData.summary?.others || 0 },
                          ],
                        }]}
                        type="bar"
                        height="272"
                      />
                    </Card>
                  </Grid>
                )}

            {/* Patient Registration */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader
                        title="Patient Registration"
                        action={
                          <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={patientRegistrationPeriod === "daily"}
                                    onChange={(e) => {
                                      setPatientRegistrationPeriod("daily");
                                      fetchFinancial();
                                    }}
                                    size="small"
                                  />
                                }
                                label="Day"
                                sx={{ margin: 0 }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={patientRegistrationPeriod === "monthly"}
                                    onChange={(e) => {
                                      setPatientRegistrationPeriod("monthly");
                                      fetchFinancial();
                                    }}
                                    size="small"
                                  />
                                }
                                label="Month"
                                sx={{ margin: 0 }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={patientRegistrationPeriod === "yearly"}
                                    onChange={(e) => {
                                      setPatientRegistrationPeriod("yearly");
                                      fetchFinancial();
                                    }}
                                    size="small"
                                  />
                                }
                                label="Year"
                                sx={{ margin: 0 }}
                              />
                            </Stack>
                          </Box>
                        }
                      />
                      <Divider />
                      <ChartWrapper
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            toolbar: { show: false },
                          },
                          colors: [blue[500], red[500], green[500]],
                          stroke: { show: true, width: [3, 3, 3], curve: "smooth" },
                          dataLabels: { enabled: false },
                          grid: { show: false, borderColor: theme.palette.divider },
                          xaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                          },
                          yaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                            labels: { formatter: (val) => numberFormat(val) },
                          },
                          tooltip: { theme: "dark", fillSeriesColor: true },
                          legend: { markers: { width: 14, height: 8, radius: 4 } },
                        }}
                        series={[
                          {
                            name: "Male",
                            data: (financialData.statistics?.patient_registration || []).map((e) => ({
                              x: e.period,
                              y: e.male || 0,
                            })),
                          },
                          {
                            name: "Female",
                            data: (financialData.statistics?.patient_registration || []).map((e) => ({
                              x: e.period,
                              y: e.female || 0,
                            })),
                          },
                          {
                            name: "Total",
                            data: (financialData.statistics?.patient_registration || []).map((e) => ({
                              x: e.period,
                              y: (e.male || 0) + (e.female || 0),
                            })),
                          },
                        ]}
                        type="line"
                        height="272"
                      />
                    </Card>
                  </Grid>
                )}

            {/* Payments by Channel */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader title="Payments by Channel" />
                      <Divider />
                      <CardContent>
                        <ChartWrapper
                          options={{
                            labels: (financialData.statistics?.payments_by_channel || []).map((e) => e.name),
                            chart: {
                              fontFamily: theme.typography.fontFamily,
                              background: "transparent",
                              toolbar: { show: false },
                            },
                            plotOptions: {
                              pie: {
                                dataLabels: { offset: -16 },
                              },
                            },
                            colors: [blue[400], red[400], cyan[500], green[500], indigo[400], teal[400], purple[400], lime[600], pink[400], yellow[500]],
                            stroke: { show: false },
                            dataLabels: {
                              style: { fontSize: 10, fontWeight: 400 },
                              dropShadow: { enabled: false },
                            },
                            tooltip: {
                              y: {
                                formatter: (val) => numberFormat(val),
                              },
                            },
                            legend: {
                              position: "bottom",
                              labels: {
                                colors: (financialData.statistics?.payments_by_channel || []).map(() => theme.palette.text.secondary),
                                useSeriesColors: false,
                              },
                              markers: { width: 14, height: 8, radius: 4 },
                            },
                          }}
                          series={(financialData.statistics?.payments_by_channel || []).map((e) => e.amount)}
                          type="pie"
                          height={(financialData.statistics?.payments_by_channel || []).length ? 288 : 256}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

            {/* Expenses by Category */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader title="Expenses by Category" />
                      <Divider />
                      <CardContent>
                        <ChartWrapper
                          options={{
                            labels: (financialData.statistics?.expenses_by_category || []).map((e) => e.name),
                            chart: {
                              fontFamily: theme.typography.fontFamily,
                              background: "transparent",
                              toolbar: { show: false },
                            },
                            plotOptions: {
                              pie: {
                                dataLabels: { offset: -16 },
                              },
                            },
                            colors: [teal[400], red[400], lightBlue[400], deepOrange[300], lime[600], pink[400], cyan[500], purple[400], green[500], yellow[500]],
                            stroke: { show: false },
                            dataLabels: {
                              style: { fontSize: 10, fontWeight: 400 },
                              dropShadow: { enabled: false },
                            },
                            tooltip: {
                              y: {
                                formatter: (val) => numberFormat(val),
                              },
                            },
                            legend: {
                              position: "bottom",
                              labels: {
                                colors: (financialData.statistics?.expenses_by_category || []).map(() => theme.palette.text.secondary),
                                useSeriesColors: false,
                              },
                              markers: { width: 14, height: 8, radius: 4 },
                            },
                          }}
                          series={(financialData.statistics?.expenses_by_category || []).map((e) => Number(e?.amount ?? e?.total_amount ?? 0))}
                          type="pie"
                          height={(financialData.statistics?.expenses_by_category || []).length ? 288 : 256}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

            {/* Client Statistics */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader title="Client Statistics" />
                      <Divider />
                      <CardContent>
                        <ChartWrapper
                          options={{
                            labels: (financialData.statistics?.client_statistics || []).map((e) => e.name),
                            chart: {
                              fontFamily: theme.typography.fontFamily,
                              background: "transparent",
                              toolbar: { show: false },
                            },
                            plotOptions: {
                              pie: {
                                dataLabels: { offset: -16 },
                              },
                            },
                            colors: [pink[400], blue[400], cyan[500]],
                            stroke: { show: false },
                            dataLabels: {
                              style: { fontSize: 10, fontWeight: 400 },
                              dropShadow: { enabled: false },
                            },
                            tooltip: {
                              y: {
                                formatter: (val) => numberFormat(val),
                              },
                            },
                            legend: {
                              position: "bottom",
                              labels: {
                                colors: (financialData.statistics?.client_statistics || []).map(() => theme.palette.text.secondary),
                                useSeriesColors: false,
                              },
                              markers: { width: 14, height: 8, radius: 4 },
                            },
                          }}
                          series={(financialData.statistics?.client_statistics || []).map((e) => e.count)}
                          type="pie"
                          height={(financialData.statistics?.client_statistics || []).length ? 288 : 256}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

            {/* Return vs New Patient */}
            {financialData && (
              <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardHeader title="Return vs New Patient" />
                      <Divider />
                      <ChartWrapper
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            toolbar: { show: false },
                          },
                          plotOptions: {
                            bar: {
                              borderRadius: 8,
                              borderRadiusApplication: "around",
                              borderRadiusWhenStacked: "all",
                              distributed: true,
                            },
                          },
                          colors: [yellow[600], blue[900]],
                          stroke: { show: false },
                          dataLabels: {
                            enabled: true,
                            style: { fontSize: 10, fontWeight: 400 },
                            dropShadow: { enabled: false },
                            formatter: (val) => numberFormat(val),
                          },
                          grid: { show: false, borderColor: theme.palette.divider },
                          xaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                          },
                          yaxis: {
                            axisBorder: { show: false, color: theme.palette.divider },
                            axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                            labels: { formatter: (val) => numberFormat(val) },
                          },
                          tooltip: { theme: "dark", fillSeriesColor: true },
                          legend: {
                            show: true,
                            position: "top",
                            markers: { width: 14, height: 8, radius: 4 },
                          },
                        }}
                        series={[{
                          name: "Patients",
                          data: [
                            {
                              x: "New Patient",
                              y: (financialData.statistics?.client_statistics || []).find((e) => e.name === "New Client" || e.name === "New Patient")?.count || 0,
                            },
                            {
                              x: "Return Patient",
                              y: (financialData.statistics?.client_statistics || []).find((e) => e.name === "Returning Client" || e.name === "Return Client" || e.name === "Return Patient")?.count || 0,
                            },
                          ],
                        }]}
                        type="bar"
                        height="272"
                      />
                    </Card>
                  </Grid>
                )}

                {/* Financial Management: Revenue vs Expenses Trend */}
                {financialData && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
                      <CardHeader
                        title="Revenue vs Expenses Trend"
                        subheader="Last 7 days comparison"
                        titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                      />
                      <Divider />
                      <CardContent>
                        <ChartWrapper
                          options={{
                            chart: {
                              fontFamily: theme.typography.fontFamily,
                              foreColor: theme.palette.text.primary,
                              background: "transparent",
                              toolbar: { show: false },
                              type: 'line',
                            },
                            stroke: { width: [3, 3], curve: "smooth" },
                            colors: [green[500], red[500]],
                            dataLabels: { enabled: false },
                            grid: { show: true, borderColor: theme.palette.divider },
                            xaxis: {
                              categories: (financialData.statistics?.payment_trends || []).map((e) =>
                                new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              ),
                              axisBorder: { show: false, color: theme.palette.divider },
                              axisTicks: { show: true, color: theme.palette.divider },
                            },
                            yaxis: {
                              title: { text: "Amount (TZS)" },
                              labels: { formatter: (val) => numberFormat(Math.round(val)) }
                            },
                            tooltip: {
                              theme: "dark",
                              shared: true,
                              y: { formatter: (val) => `${numberFormat(Math.round(val))} TZS` }
                            },
                            legend: {
                              position: "top",
                              markers: { width: 14, height: 8, radius: 4 }
                            },
                          }}
                          series={[
                            {
                              name: "Revenue",
                              data: (financialData.statistics?.payment_trends || []).map((e) => parseFloat(e.revenue || 0))
                            },
                            {
                              name: "Expenses",
                              data: (financialData.statistics?.expense_trends || []).map((e) => parseFloat(e.expenses || 0))
                            },
                          ]}
                          type="line"
                          height={350}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Financial Management: Expense Categories */}
                {financialData && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
                      <CardHeader
                        title="Expense Categories"
                        subheader="Top categories breakdown"
                        titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                      />
                      <Divider />
                      <CardContent>
                        <ChartWrapper
                          options={{
                            labels: (financialData.statistics?.top_expense_categories || []).map((e) => e.name) || [],
                            chart: {
                              fontFamily: theme.typography.fontFamily,
                              background: "transparent",
                              toolbar: { show: false },
                              type: 'donut',
                            },
                            plotOptions: { pie: { donut: { size: "60%" } } },
                            colors: [purple[400], pink[400], orange[400], teal[400]],
                            dataLabels: {
                              enabled: true,
                              style: { fontSize: "11px", colors: [theme.palette.text.primary] },
                              formatter: function(val, opts) {
                                return opts.w.globals.labels[opts.seriesIndex] + '\n' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
                              },
                            },
                            tooltip: { y: { formatter: (val) => `${numberFormat(val)} TZS` } },
                            legend: {
                              position: "bottom",
                              labels: { colors: [theme.palette.text.secondary] },
                              markers: { width: 14, height: 8, radius: 4 },
                            },
                          }}
                          series={(financialData.statistics?.top_expense_categories || []).map((e) => parseFloat(e.total_amount || 0)) || []}
                          type="donut"
                          height={350}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Doctor Performance Section */}
                {consultationData && (
                  <Grid item xs={12}>
                    <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px' }}>
                      <CardHeader
                        title="Doctor Performance"
                        subheader="Consultations by doctor"
                        titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                      />
                      <Divider />
                      <CardContent>
                        {consultationData.statistics?.consultations_by_doctor && consultationData.statistics.consultations_by_doctor.length > 0 ? (
                          <Grid container spacing={2}>
                            {consultationData.statistics.consultations_by_doctor.map((doctor, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    border: `2px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: blue[300],
                                      boxShadow: `0 4px 12px ${alpha(blue[500], 0.2)}`,
                                      transform: 'translateY(-2px)',
                                    },
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        bgcolor: blue[100],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <DoctorIcon sx={{ fontSize: 24, color: blue[600] }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        {doctor.doctor_name || 'Unknown Doctor'}
                                      </Typography>
                                      <Typography variant="h5" fontWeight={700} color="primary">
                                        {numberFormat(doctor.count || 0)}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Consultations
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No doctor performance data available
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Consultations by Item */}
                {financialData && (
                  <Grid size={{ xs: 12 }}>
                    <Card>
                      <CardHeader title="Consultations by Item" />
                      <Divider />
                      <CardContent>
                        {(financialData.statistics?.consultations_by_item || []).map((e, i, a) => (
                          <ChartWrapper
                            key={e.id}
                            options={{
                              chart: {
                                fontFamily: theme.typography.fontFamily,
                                foreColor: theme.palette.text.primary,
                                background: "transparent",
                                stacked: true,
                                sparkline: { enabled: true },
                                toolbar: { show: false },
                              },
                              plotOptions: {
                                bar: {
                                  horizontal: true,
                                  barHeight: 12,
                                  borderRadius: 6,
                                  borderRadiusApplication: "around",
                                  borderRadiusWhenStacked: "all",
                                  colors: {
                                    backgroundBarColors: [theme.palette.background.default],
                                    backgroundBarRadius: 6,
                                  },
                                },
                              },
                              title: {
                                floating: true,
                                offsetX: -8,
                                offsetY: 6,
                                text: e.name,
                                style: { fontSize: 12, fontWeight: 400 },
                              },
                              subtitle: {
                                floating: true,
                                align: "right",
                                offsetX: 8,
                                offsetY: 6,
                                text: numberFormat(e.consultations),
                                style: { fontSize: 12 },
                              },
                              colors: [[cyan[500], pink[400], blue[400], green[500], yellow[600]][i % 5]],
                              stroke: { show: false },
                              dataLabels: { enabled: false },
                              grid: { show: false, borderColor: theme.palette.divider },
                              xaxis: {
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                              },
                              yaxis: {
                                max: 100,
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                                labels: { formatter: (val) => numberFormat(val) },
                              },
                              tooltip: { theme: "dark", fillSeriesColor: true },
                              legend: { markers: { width: 14, height: 8, radius: 4 } },
                            }}
                            series={[{
                              name: "Percentage",
                              data: [
                                round(
                                  (e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100,
                                  2
                                ),
                              ],
                            }]}
                            type="bar"
                            height="64"
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Top Diagnosis */}
                {consultationData && (
                  <Grid size={{ xs: 12 }}>
                    <Card>
                      <CardHeader title="Top Diagnosis" />
                      <Divider />
                      <CardContent>
                        {(consultationData.statistics?.top_diagnosis || []).map((e, i, a) => (
                          <ChartWrapper
                            key={e.id}
                            options={{
                              chart: {
                                fontFamily: theme.typography.fontFamily,
                                foreColor: theme.palette.text.primary,
                                background: "transparent",
                                stacked: true,
                                sparkline: { enabled: true },
                                toolbar: { show: false },
                              },
                              plotOptions: {
                                bar: {
                                  horizontal: true,
                                  barHeight: 12,
                                  borderRadius: 6,
                                  borderRadiusApplication: "around",
                                  borderRadiusWhenStacked: "all",
                                  colors: {
                                    backgroundBarColors: [theme.palette.background.default],
                                    backgroundBarRadius: 6,
                                  },
                                },
                              },
                              title: {
                                floating: true,
                                offsetX: -8,
                                offsetY: 6,
                                text: `${e.code} ${e.name}`.trim(),
                                style: { fontSize: 12, fontWeight: 400 },
                              },
                              subtitle: {
                                floating: true,
                                align: "right",
                                offsetX: 8,
                                offsetY: 6,
                                text: numberFormat(e.consultations),
                                style: { fontSize: 12 },
                              },
                              colors: [[lightBlue[400], purple[400], cyan[500], pink[400], indigo[400], lime[600], blue[400], red[400], green[500], yellow[600]][i % 10]],
                              stroke: { show: false },
                              dataLabels: { enabled: false },
                              grid: { show: false, borderColor: theme.palette.divider },
                              xaxis: {
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                              },
                              yaxis: {
                                max: 100,
                                axisBorder: { show: false, color: theme.palette.divider },
                                axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                                labels: { formatter: (val) => numberFormat(val) },
                              },
                              tooltip: { theme: "dark", fillSeriesColor: true },
                              legend: { markers: { width: 14, height: 8, radius: 4 } },
                            }}
                            series={[{
                              name: "Percentage",
                              data: [
                                round(
                                  (e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100,
                                  2
                                ),
                              ],
                            }]}
                            type="bar"
                            height="64"
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
          </Grid>

          {/* Patient Return Sidebar - Bottom Section */}
          {financialData && (
            <Box sx={{ mt: 4 }}>
              <PatientReturnSidebar />
            </Box>
          )}
        </>
      )}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Stack,
} from "@mui/material";
import {
  VisibilityRounded as OpticianIcon,
  Person2Rounded as PatientIcon,
  AddRounded as LensIcon,
  AssessmentRounded as RefractionIcon,
  MedicalServicesRounded as EyeExamIcon,
  LibraryBooksRounded as ReportsIcon,
  ScheduleRounded as ScheduleIcon,
  InventoryRounded as InventoryIcon,
  AttachMoneyRounded as AttachMoneyIcon,
  LocalPharmacyRounded as GlassIcon,
  ContactsRounded as ContactLensIcon,
  ShoppingCartRounded as FrameIcon,
  RemoveRedEyeRounded as SpectaclesIcon,
  AccessTimeRounded as HourglassIcon,
  LensRounded as ProgressiveIcon,
  VisibilityRounded as BifocalIcon,
  FilterVintageRounded as BlueCutIcon,
  AutoAwesomeRounded as TransitionIcon,
  StarRounded as PGXIcon,
  RefreshRounded as RefreshIcon,
  FilterAltRounded as FilterIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  lime,
  pink,
  purple,
  teal,
  orange,
} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import InfoCard from "../../dashboard/InfoCard";
import Filters from "../../dashboard/Filters";
import DatePicker from "../../../components/DatePicker";
import PDFReport from "../../../components/reports/PDFReport";
import SpreadsheetReport from "../../../components/reports/SpreadsheetReport";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();
  const modalRef = useRef();

  // Set up date parameters for daily filtering (default to today)
  const [dateParams, setDateParams] = useState({
    start_date: new Date(),
    end_date: new Date(),
    clinic_id: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/optician-center/dashboard",
    {
      ...dateParams,
      start_date: dateParams.start_date ? formatDateForDb(dateParams.start_date) : undefined,
      end_date: dateParams.end_date ? formatDateForDb(dateParams.end_date) : undefined,
      clinic: undefined,
    },
    true,
    {
      summary: {
        total_glass_patients: 0,
        glass_patients_today: 0,
        refractions_today: 0,
        lens_fittings: 0,
        scheduled_appointments: 0,
        completed_appointments: 0,
        pending_appointments: 0,
        total_revenue: 0,
        items_dispensed: 0,
        total_spectacles_dispensed: 0,
        total_waiting_spectacles: 0,
        progressive_lenses_dispensed: 0,
        bifocal_lenses_dispensed: 0,
        blue_cut_lenses_dispensed: 0,
        transition_lenses_dispensed: 0,
        pgx_lenses_dispensed: 0,
      },
      statistics: {
        appointments_by_status: [],
        revenue_trend: [],
        top_items_dispensed: [],
        appointments_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dispensing Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openFiltersModal = () => {
    const component = (
      <Filters
        modal={modalRef.current}
        params={dateParams}
        setParams={setDateParams}
      />
    );
    modalRef.current.open("Filter Dashboard", component, "sm");
  };

  if (loading) {
    return (
        <Page title="Dispensing Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Dispensing Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Outpatient Dispensing" },
        { title: "Dispensing Dashboard" },
      ]}
    >
      <Card sx={{ mb: 2 }}>
        <PageHeader
          title="Dispensing Dashboard"
          trailing={
            <Stack direction="row" spacing={1} alignItems="center">
              {data && (
                <>
                  <PDFReport
                    title="Dispensing Dashboard Report"
                    subtitle={`From ${dateParams.start_date ? formatDateForDb(dateParams.start_date) : 'N/A'} to ${dateParams.end_date ? formatDateForDb(dateParams.end_date) : 'N/A'}`}
                    columns={[
                      { field: "metric", headerName: "Metric" },
                      { field: "value", headerName: "Value" },
                    ]}
                    items={[
                      { metric: "Total Items Dispensed", value: numberFormat(data.summary?.total_spectacles_dispensed || 0) },
                      { metric: "Total Items Waiting", value: numberFormat(data.summary?.total_waiting_spectacles || 0) },
                      { metric: "Progressive Items Dispensed", value: numberFormat(data.summary?.progressive_lenses_dispensed || 0) },
                      { metric: "Bifocal Items Dispensed", value: numberFormat(data.summary?.bifocal_lenses_dispensed || 0) },
                      { metric: "Blue-cut Items Dispensed", value: numberFormat(data.summary?.blue_cut_lenses_dispensed || 0) },
                      { metric: "Transition Items Dispensed", value: numberFormat(data.summary?.transition_lenses_dispensed || 0) },
                      { metric: "PGX Items Dispensed", value: numberFormat(data.summary?.pgx_lenses_dispensed || 0) },
                    ]}
                  />
                  <SpreadsheetReport
                    title="Dispensing Dashboard Report"
                    format="xlsx"
                    columns={[
                      { field: "metric", headerName: "Metric" },
                      { field: "value", headerName: "Value" },
                    ]}
                    items={[
                      { metric: "Total Items Dispensed", value: numberFormat(data.summary?.total_spectacles_dispensed || 0) },
                      { metric: "Total Items Waiting", value: numberFormat(data.summary?.total_waiting_spectacles || 0) },
                      { metric: "Progressive Items Dispensed", value: numberFormat(data.summary?.progressive_lenses_dispensed || 0) },
                      { metric: "Bifocal Items Dispensed", value: numberFormat(data.summary?.bifocal_lenses_dispensed || 0) },
                      { metric: "Blue-cut Items Dispensed", value: numberFormat(data.summary?.blue_cut_lenses_dispensed || 0) },
                      { metric: "Transition Items Dispensed", value: numberFormat(data.summary?.transition_lenses_dispensed || 0) },
                      { metric: "PGX Items Dispensed", value: numberFormat(data.summary?.pgx_lenses_dispensed || 0) },
                    ]}
                  />
                </>
              )}
              <Tooltip title="Refresh Dashboard">
                <IconButton onClick={handleFetch} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show Filters">
                <IconButton onClick={openFiltersModal} size="small">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
      </Card>
      {!loading && data ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Dispensing Patients"
                count={numberFormat(data.summary?.total_glass_patients || 0)}
                icon={<GlassIcon />}
                color={purple[300]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Dispensing Patients Today"
                count={numberFormat(data.summary?.glass_patients_today || 0)}
                icon={<PatientIcon />}
                color={blue[400]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Examinations Today"
                count={numberFormat(data.summary?.refractions_today || 0)}
                icon={<RefractionIcon />}
                color={green[400]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Item Fittings"
                count={numberFormat(data.summary?.lens_fittings || 0)}
                icon={<LensIcon />}
                color={teal[400]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Scheduled Appointments"
                count={numberFormat(data.summary?.scheduled_appointments || 0)}
                icon={<ScheduleIcon />}
                color={orange[400]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Completed Appointments"
                count={numberFormat(data.summary?.completed_appointments || 0)}
                icon={<EyeExamIcon />}
                color={cyan[500]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Pending Appointments"
                count={numberFormat(data.summary?.pending_appointments || 0)}
                icon={<ReportsIcon />}
                color={pink[400]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Items Dispensed"
                count={numberFormat(data.summary?.items_dispensed || 0)}
                icon={<InventoryIcon />}
                color={lime[600]}
                onClick={() => navigate('/optician-center/reports/items-dispensed')}
              />
            </Grid>
          </Grid>

          {/* Lens Cards Section */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              mt: 4,
              color: theme.palette.text.primary,
            }}
          >
            Item Dispensing Summary
          </Typography>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Bluecut Dispensed"
                count={numberFormat(data.summary?.blue_cut_lenses_dispensed || 0)}
                icon={<BlueCutIcon />}
                color={blue[500]}
                onClick={() => navigate('/optician-center/reports/items-dispensed')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Transitions Dispensed"
                count={numberFormat(data.summary?.transition_lenses_dispensed || 0)}
                icon={<TransitionIcon />}
                color={purple[500]}
                onClick={() => navigate('/optician-center/reports/items-dispensed')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="PGX Dispensed"
                count={numberFormat(data.summary?.pgx_lenses_dispensed || 0)}
                icon={<PGXIcon />}
                color={pink[500]}
                onClick={() => navigate('/optician-center/reports/items-dispensed')}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            justifyContent="stretch"
            sx={{
              "& .MuiCard-root": {
                minHeight: "100%",
              },
            }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Items Dispensed"
                count={numberFormat(data.summary?.total_spectacles_dispensed || 0)}
                icon={<SpectaclesIcon />}
                color={green[500]}
                onClick={() => navigate('/optician-center/reports/items-dispensed')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Items Waiting"
                count={numberFormat(data.summary?.total_waiting_spectacles || 0)}
                icon={<HourglassIcon />}
                color={orange[500]}
                onClick={() => navigate('/optician-center/glass-patients')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Progressive Items Dispensed"
                count={numberFormat(data.summary?.progressive_lenses_dispensed || 0)}
                icon={<ProgressiveIcon />}
                color={blue[500]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Bifocal Items Dispensed"
                count={numberFormat(data.summary?.bifocal_lenses_dispensed || 0)}
                icon={<BifocalIcon />}
                color={purple[500]}
              />
            </Grid>
          </Grid>


        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;

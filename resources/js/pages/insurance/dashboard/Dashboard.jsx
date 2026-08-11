import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  AssignmentRounded as DraftIcon,
  SendRounded as SubmittedIcon,
  CheckCircleRounded as ApprovedIcon,
  CancelRounded as RejectedIcon,
  PaymentRounded as PaidIcon,
  ReceiptRounded as TotalIcon,
  AttachMoneyRounded as ClaimAmountIcon,
  CheckCircleRounded as ApprovedAmountIcon,
  AccountBalanceWalletRounded as PaidAmountIcon,
  RefreshRounded as RefreshIcon,
  DateRangeRounded as DateRangeIcon,
  LibraryBooksRounded as ReportsIcon,
  AddRounded as AddIcon,
  BusinessRounded as CompaniesIcon,
} from "@mui/icons-material";
import { blue, cyan, green, orange, purple, red, teal } from "@mui/material/colors";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb } from "../../../helpers";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateParams, setDateParams] = useState({
    start_date: formatDateForDb(new Date()),
    end_date: formatDateForDb(new Date()),
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/insurance-claim/dashboard",
    dateParams,
    true,
    {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
      total: 0,
      claim_amount: 0,
      approved_amount: 0,
      paid_amount: 0,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Insurance Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleDateChange = () => {
    if (startDate && endDate && startDate <= endDate) {
      setDateParams({
        start_date: formatDateForDb(startDate),
        end_date: formatDateForDb(endDate),
      });
      handleFetch();
    } else {
      addToast({ message: "Please select a valid date range", severity: "warning" });
    }
  };

  const handleResetDates = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setDateParams({
      start_date: formatDateForDb(today),
      end_date: formatDateForDb(today),
    });
    handleFetch();
  };

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  if (loading && !data) {
    return (
      <Page title="Insurance Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Dashboard" },
      ]}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Insurance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track insurance claims and company performance
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: "small", sx: { width: { xs: "100%", sm: 140 } } } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: "small", sx: { width: { xs: "100%", sm: 140 } } } }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            size="small"
            startIcon={<DateRangeIcon />}
            onClick={handleDateChange}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #653a8f 100%)" },
            }}
          >
            Apply
          </Button>
          <Button variant="outlined" size="small" onClick={handleResetDates}>
            Reset
          </Button>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {data ? (
        <React.Fragment>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Draft Claims"
                count={numberFormat(data.draft || 0)}
                icon={<DraftIcon />}
                color={orange[500]}
                onClick={() => navigate("/insurance/claims?status=Draft")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Submitted"
                count={numberFormat(data.submitted || 0)}
                icon={<SubmittedIcon />}
                color={blue[500]}
                onClick={() => navigate("/insurance/claims?status=Submitted")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Approved"
                count={numberFormat(data.approved || 0)}
                icon={<ApprovedIcon />}
                color={green[500]}
                onClick={() => navigate("/insurance/claims?status=Approved")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Rejected"
                count={numberFormat(data.rejected || 0)}
                icon={<RejectedIcon />}
                color={red[500]}
                onClick={() => navigate("/insurance/claims?status=Rejected")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Paid"
                count={numberFormat(data.paid || 0)}
                icon={<PaidIcon />}
                color={teal[500]}
                onClick={() => navigate("/insurance/claims?status=Paid")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <InfoCard
                title="Total Claims"
                count={numberFormat(data.total || 0)}
                icon={<TotalIcon />}
                color={purple[400]}
                onClick={() => navigate("/insurance/claims")}
              />
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Claim Amount
                    </Typography>
                    <ClaimAmountIcon sx={{ color: cyan[500], fontSize: 28 }} />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: cyan[600], mb: 0.5 }}>
                    {numberFormat(data.claim_amount || 0)}
                  </Typography>
                  <Chip label="Total billed on claims" size="small" color="info" />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #FFF9E6 0%, #FFEDD8 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Approved Amount
                    </Typography>
                    <ApprovedAmountIcon sx={{ color: green[500], fontSize: 28 }} />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: green[600], mb: 0.5 }}>
                    {numberFormat(data.approved_amount || 0)}
                  </Typography>
                  <Chip label="Amount approved by insurers" size="small" color="success" />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #F0E8FF 0%, #E8F4F8 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Paid Amount
                    </Typography>
                    <PaidAmountIcon sx={{ color: purple[500], fontSize: 28 }} />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: purple[600], mb: 0.5 }}>
                    {numberFormat(data.paid_amount || 0)}
                  </Typography>
                  <Chip label="Amount received" size="small" color="secondary" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
            }}
          >
            <CardHeader
              title="Quick Actions"
              subheader="Common insurance tasks"
              titleTypographyProps={{ variant: "h6", fontWeight: 700, color: "#1C1C1C" }}
              subheaderTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      bgcolor: "white",
                      "&:hover": { borderColor: blue[300], transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(33, 150, 243, 0.2)" },
                    }}
                    onClick={() => navigate("/insurance/claims/new")}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: blue[100], display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                      <AddIcon sx={{ fontSize: 28, color: blue[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Create Claim
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      From billed items
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      bgcolor: "white",
                      "&:hover": { borderColor: green[300], transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(76, 175, 80, 0.2)" },
                    }}
                    onClick={() => navigate("/insurance/companies")}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: green[100], display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                      <CompaniesIcon sx={{ fontSize: 28, color: green[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Insurance Companies
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Manage companies
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      bgcolor: "white",
                      "&:hover": { borderColor: purple[300], transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(156, 39, 176, 0.2)" },
                    }}
                    onClick={() => navigate("/insurance/claims")}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: purple[100], display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                      <ReportsIcon sx={{ fontSize: 28, color: purple[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      All Claims
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      View and manage
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      bgcolor: "white",
                      "&:hover": { borderColor: teal[300], transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(0, 150, 136, 0.2)" },
                    }}
                    onClick={() => navigate("/insurance/patient-insurance")}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: teal[100], display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                      <ApprovedAmountIcon sx={{ fontSize: 28, color: teal[600] }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      Patient Insurance
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Manage memberships
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6" color="text.secondary">
            No data available.
          </Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;

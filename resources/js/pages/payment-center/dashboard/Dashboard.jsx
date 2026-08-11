import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  CircularProgress,
  Stack,
  alpha,
} from "@mui/material";
import {
  PaymentRounded as PaymentIcon,
  AttachMoneyRounded as CashIcon,
  CreditCardRounded as CreditIcon,
  ReceiptRounded as BillsIcon,
  TrendingUpRounded as RevenueIcon,
  PeopleRounded as PeopleIcon,
  AddRounded as NewExpenseIcon,
  AccountBalanceWalletRounded as WalletIcon,
  CheckCircleRounded as ClearedIcon,
  PendingRounded as PendingIcon,
  TrendingDownRounded as ExpenseIcon,
  PhoneAndroidRounded as MobileIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import { useNotificationContext } from "../../../contexts/NotificationContext";

import { useTheme } from "@mui/material/styles";
import {
  blue,
  cyan,
  green,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb, getWeekStartDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();
  const { notifications } = useNotificationContext();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: new Date(), // Default to today for daily view
    end_date: new Date(),   // Default to today for daily view
  });

  useEffect(() => {
    document.title = `Payment Center Dashboard - ${window.APP_NAME}`;
    
    // Debug: Log when component mounts
    console.log('Payment Center Dashboard mounted');
    console.log('Initial params:', params);
  }, []);

  const { data, loading, error, handleFetch } = useFetch(
    "api/payment-center/dashboard",
    {
      ...params,
      clinic: undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      summary: {
        total_revenue: 0,
        cash_payments: 0,
        credit_payments: 0,
        cash_available: 0,
        pending_bills: 0,
        pending_payment_cache: 0,
        cleared_bills: 0,
        total_expenses: 0,
        net_profit: 0,
        today_collections: 0,
        new_expenses: 0,
        new_expenses_count: 0,
      },
      statistics: {
        payment_trends: [],
        revenue_by_payment_mode: [],
        mobile_payments_by_channel: [],
        top_paying_patients: [],
        pending_bills_summary: [],
      },
    },
    (response) => {
      try {
        console.log('Payment Center Dashboard API Response:', response);
        console.log('Response data:', response?.data);
        console.log('Response data.data:', response?.data?.data);
        
        // Handle different response structures
        let result = null;
        if (response?.data?.data) {
          result = response.data.data;
        } else if (response?.data) {
          result = response.data;
        } else {
          result = {};
        }
        
        console.log('Extracted result:', result);
        console.log('Summary:', result?.summary);
        console.log('Statistics:', result?.statistics);
        
        // Ensure we have the expected structure with proper defaults
        const finalResult = {
          summary: {
            total_revenue: result?.summary?.total_revenue ?? 0,
            cash_payments: result?.summary?.cash_payments ?? 0,
            credit_payments: result?.summary?.credit_payments ?? 0,
            cash_available: result?.summary?.cash_available ?? 0,
            pending_bills: result?.summary?.pending_bills ?? 0,
            pending_payment_cache: result?.summary?.pending_payment_cache ?? 0,
            cleared_bills: result?.summary?.cleared_bills ?? 0,
            total_expenses: result?.summary?.total_expenses ?? 0,
            net_profit: result?.summary?.net_profit ?? 0,
            today_collections: result?.summary?.today_collections ?? 0,
            new_expenses: result?.summary?.new_expenses ?? 0,
            new_expenses_count: result?.summary?.new_expenses_count ?? 0,
          },
          statistics: {
            payment_trends: Array.isArray(result?.statistics?.payment_trends) 
              ? result.statistics.payment_trends 
              : [],
            revenue_by_payment_mode: Array.isArray(result?.statistics?.revenue_by_payment_mode)
              ? result.statistics.revenue_by_payment_mode
              : [],
            mobile_payments_by_channel: Array.isArray(result?.statistics?.mobile_payments_by_channel)
              ? result.statistics.mobile_payments_by_channel
              : [],
            top_paying_patients: Array.isArray(result?.statistics?.top_paying_patients)
              ? result.statistics.top_paying_patients
              : [],
            pending_bills_summary: Array.isArray(result?.statistics?.pending_bills_summary)
              ? result.statistics.pending_bills_summary
              : [],
          },
        };
        
        console.log('Final result to return:', finalResult);
        return finalResult;
      } catch (err) {
        console.error('Error processing dashboard response:', err);
        // Return safe defaults on error
        return {
          summary: {
            total_revenue: 0,
            cash_payments: 0,
            credit_payments: 0,
            cash_available: 0,
            pending_bills: 0,
            pending_payment_cache: 0,
            cleared_bills: 0,
            total_expenses: 0,
            net_profit: 0,
            today_collections: 0,
            new_expenses: 0,
            new_expenses_count: 0,
          },
          statistics: {
            payment_trends: [],
            revenue_by_payment_mode: [],
            mobile_payments_by_channel: [],
            top_paying_patients: [],
            pending_bills_summary: [],
          },
        };
      }
    }
  );

  // Debug: Log data changes
  useEffect(() => {
    if (data) {
      console.log('Dashboard data updated:', data);
      console.log('Summary values:', {
        total_revenue: data.summary?.total_revenue,
        cash_payments: data.summary?.cash_payments,
        credit_payments: data.summary?.credit_payments,
        pending_bills: data.summary?.pending_bills,
        total_expenses: data.summary?.total_expenses,
      });
      console.log('Statistics:', {
        payment_trends_count: data.statistics?.payment_trends?.length || 0,
        revenue_by_mode_count: data.statistics?.revenue_by_payment_mode?.length || 0,
        mobile_payments_count: data.statistics?.mobile_payments_by_channel?.length || 0,
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  // Safety check: ensure data structure is valid
  const isValidData = !loading && 
    data && 
    typeof data === 'object' && 
    data.summary && 
    typeof data.summary === 'object' && 
    data.statistics && 
    typeof data.statistics === 'object';

  if (loading) {
    return (
      <Page title="Payment Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  if (error && !data) {
    return (
      <Page title="Payment Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" color="error">
            Failed to Load Dashboard Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatError(error) || "An error occurred while loading the dashboard. Please try refreshing the page."}
          </Typography>
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Payment Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Payment Center Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {!loading && isValidData ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <InfoCard
                  title="Pending Patients"
                  count={numberFormat(data.summary.pending_payment_cache || 0)}
                  icon={<PeopleIcon />}
                  color={orange[500]}
                  onClick={() => navigate('/payment-center/pending-cash-patients')}
                />
              </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Cash Available"
                count={numberFormat(data.summary.cash_payments || 0)}
                icon={<WalletIcon />}
                color={green[500]}
                onClick={() => navigate('/payment-center/reports/daily-cash-collection')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Expenses"
                count={numberFormat(data.summary.total_expenses || 0)}
                icon={<ExpenseIcon />}
                color={red[500]}
                onClick={() => navigate('/payment-center/expenses')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="New Expenses"
                count={numberFormat(data.summary.new_expenses || 0)}
                icon={<NewExpenseIcon />}
                color={pink[500]}
                onClick={() => navigate('/payment-center/expenses')}
                badge={data.summary.new_expenses_count || 0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Cash Payments"
                count={numberFormat(
                  (data?.statistics?.revenue_by_payment_mode?.find(item => 
                    item?.payment_mode?.toLowerCase().includes('cash-in-hand')
                  )?.total_amount || 0)
                )}
                icon={<CashIcon />}
                color={blue[500]}
                onClick={() => navigate('/payment-center/pending-cash-patients')}
              />
            </Grid>
            {/* Commented out: Credit Payments card
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Credit Payments"
                count={numberFormat(data.summary.credit_payments || 0)}
                icon={<CreditIcon />}
                color={cyan[500]}
                onClick={() => navigate('/payment-center/pending-credit-patients')}
              />
            </Grid>
            */}
            {/* Commented out: Total Revenue card
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Total Revenue"
                count={numberFormat(data.summary.total_revenue || 0)}
                icon={<RevenueIcon />}
                color={purple[500]}
                onClick={() => navigate('/payment-center/reports/daily-cash-collection')}
              />
            </Grid>
            */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Today's Collections"
                count={numberFormat(data.summary.today_collections || 0)}
                icon={<PaymentIcon />}
                color={teal[500]}
                onClick={() => navigate('/payment-center/reports/daily-cash-collection')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Pending Bills"
                count={numberFormat(data.summary.pending_bills || 0)}
                icon={<PendingIcon />}
                color={yellow[600]}
                onClick={() => navigate('/payment-center/patient-bills/pending')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard
                title="Cleared Bills"
                count={numberFormat(data.summary.cleared_bills || 0)}
                icon={<ClearedIcon />}
                color={green[500]}
                onClick={() => navigate('/payment-center/patient-bills/cleared')}
              />
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: 2 }}
          >
            {/* Payment Trends chart removed per request */}

            {/* Revenue by Payment Mode Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    title="Revenue by Payment Mode"
                    titleTypographyProps={{
                      variant: "h6",
                      fontWeight: 600,
                      sx: { fontSize: { xs: '1rem', sm: '1.25rem' } },
                    }}
                    sx={{
                      pb: 1,
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                    }}
                  />
                  <Divider />
                  <CardContent sx={{ flex: 1, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
                    <ChartWrapper
                      options={{
                        labels: (Array.isArray(data?.statistics?.revenue_by_payment_mode) && data.statistics.revenue_by_payment_mode.length > 0
                          ? data.statistics.revenue_by_payment_mode
                          : [{ payment_mode: 'Cash', total_amount: 0 }, { payment_mode: 'Credit', total_amount: 0 }]
                        ).map((e) => {
                          if (!e) return 'Unknown';
                          return e?.payment_mode || 'Unknown';
                        }) || [],
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: {
                            show: false,
                          },
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "60%",
                            },
                          },
                        },
                        colors: [purple[500], blue[500], cyan[500], green[500], orange[500], teal[500]],
                        stroke: {
                          show: true,
                          width: 2,
                          colors: [theme.palette.background.paper],
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontWeight: 500,
                            fontSize: "11px",
                            colors: [theme.palette.text.primary],
                          },
                          formatter: function(val, opts) {
                            return opts.w.globals.labels[opts.seriesIndex] + '\n' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
                          },
                          dropShadow: {
                            enabled: false,
                          },
                        },
                        tooltip: {
                          y: {
                            formatter: (val) => `${numberFormat(val)} TZS`,
                          },
                        },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: (data?.statistics?.revenue_by_payment_mode || []).map(
                              () => theme.palette.text.secondary
                            ) || [],
                            useSeriesColors: false,
                          },
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 6,
                          },
                        },
                      }}
                      series={(Array.isArray(data?.statistics?.revenue_by_payment_mode) && data.statistics.revenue_by_payment_mode.length > 0
                        ? data.statistics.revenue_by_payment_mode
                        : [{ payment_mode: 'Cash', total_amount: 0 }, { payment_mode: 'Credit', total_amount: 0 }]
                      ).map(
                        (e) => {
                          if (!e) return 0;
                          const amount = e?.total_amount ?? e ?? 0;
                          return typeof amount === 'number' ? amount : parseFloat(amount) || 0;
                        }
                      ) || []}
                      type="donut"
                      height={320}
                    />
                  </CardContent>
                </Card>
              </Grid>

            {/* Mobile Payments by Channel Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    title="Mobile Payments by Channel"
                    titleTypographyProps={{
                      variant: "h6",
                      fontWeight: 600,
                      sx: { fontSize: { xs: '1rem', sm: '1.25rem' } },
                    }}
                    sx={{
                      pb: 1,
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                    }}
                  />
                  <Divider />
                  <CardContent sx={{ flex: 1, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
                    <ChartWrapper
                      options={{
                        labels: (Array.isArray(data?.statistics?.mobile_payments_by_channel) && data.statistics.mobile_payments_by_channel.length > 0
                          ? data.statistics.mobile_payments_by_channel
                          : [{ channel: 'M-Pesa', amount: 0 }, { channel: 'Airtel Money', amount: 0 }]
                        ).map((e) => {
                          if (!e) return 'Unknown';
                          return e?.channel || 'Unknown';
                        }) || [],
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: {
                            show: false,
                          },
                          type: 'pie',
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "60%",
                            },
                          },
                        },
                        colors: [purple[500], blue[500], cyan[500], green[500], orange[500], teal[500], pink[500]],
                        stroke: {
                          show: true,
                          width: 2,
                          colors: [theme.palette.background.paper],
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontWeight: 500,
                            fontSize: "11px",
                            colors: [theme.palette.text.primary],
                          },
                          formatter: function(val, opts) {
                            return opts.w.globals.labels[opts.seriesIndex] + '\n' + numberFormat(opts.w.globals.series[opts.seriesIndex]);
                          },
                          dropShadow: {
                            enabled: false,
                          },
                        },
                        tooltip: {
                          y: {
                            formatter: (val) => `${numberFormat(val)} TZS`,
                          },
                        },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: (data?.statistics?.mobile_payments_by_channel || []).map(
                              () => theme.palette.text.secondary
                            ) || [],
                            useSeriesColors: false,
                          },
                          markers: {
                            width: 12,
                            height: 12,
                            radius: 6,
                          },
                        },
                      }}
                      series={(Array.isArray(data?.statistics?.mobile_payments_by_channel) && data.statistics.mobile_payments_by_channel.length > 0
                        ? data.statistics.mobile_payments_by_channel
                        : [{ channel: 'M-Pesa', amount: 0 }, { channel: 'Airtel Money', amount: 0 }]
                      ).map(
                        (e) => {
                          if (!e) return 0;
                          const amount = e?.amount ?? e ?? 0;
                          return typeof amount === 'number' ? amount : parseFloat(amount) || 0;
                        }
                      ) || []}
                      type="pie"
                      height={320}
                    />
                  </CardContent>
                </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;

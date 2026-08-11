import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, CardHeader, Divider, Grid,
  Typography, CircularProgress, IconButton, Tooltip,
} from "@mui/material";
import {
  InventoryRounded as InventoryIcon,
  WarningRounded as LowStockIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  RefreshRounded as RefreshIcon,
  MedicationRounded as PharmacyIcon,
  VisibilityRounded as LensIcon,
  CenterFocusStrongRounded as FrameIcon,
} from "@mui/icons-material";
import {
  blue, cyan, green, orange, purple, teal, pink, red, yellow, indigo, lime,
} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  const { data, loading, error, handleFetch } = useFetch(
    "api/inventory-management/dashboard",
    {
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
    },
    true,
    {
      summary: {
        total_items: 0, low_stock_items: 0, stock_in_today: 0,
        stock_out_today: 0, total_lens: 0, total_medicine: 0, total_frame: 0,
      },
      statistics: {
        frame_categories: [], pharmacy_categories: [],
        sold_frames_pie_chart: [], sold_medicine_pie_chart: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Stock Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) addToast({ message: formatError(error), severity: "error" });
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  if (loading) {
    return (
      <Page title="Stock Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  const COLORS = [purple[400], blue[400], green[400], orange[400], pink[400], cyan[400], teal[400], indigo[400], yellow[600], red[400], lime[600]];
  const MEDICINE_COLORS = [teal[400], green[500], cyan[500], blue[400], purple[400], orange[400], pink[400], yellow[500], red[400], indigo[400], lime[500]];

  return (
    <Page
      title="Stock Management Dashboard"
      breadcrumbs={[{ title: "Home" }, { title: "Stock Management" }, { title: "Dashboard" }]}
    >
      <CardHeader
        title="Stock Management Dashboard"
        titleTypographyProps={{ variant: "h4", fontWeight: 700 }}
        action={
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}><RefreshIcon /></IconButton>
          </Tooltip>
        }
        sx={{ p: 0, mb: 2 }}
      />

      {!loading && data ? (
        <React.Fragment>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Total Items" count={numberFormat(data.summary?.total_items || 0)} icon={<InventoryIcon />} color={purple[400]} onClick={() => navigate("/inventory-management/stocktaking")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Low Stock Items" count={numberFormat(data.summary?.low_stock_items || 0)} icon={<LowStockIcon />} color={red[400]} onClick={() => navigate("/inventory-management/stock-alerts")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Stock In Today" count={numberFormat(data.summary?.stock_in_today || 0)} icon={<StockInIcon />} color={green[400]} onClick={() => navigate("/inventory-management/stocktaking")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Stock Out Today" count={numberFormat(data.summary?.stock_out_today || 0)} icon={<StockOutIcon />} color={orange[400]} onClick={() => navigate("/inventory-management/stock-alerts")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Total Dispensing Items" count={numberFormat(data.summary?.total_lens || 0)} icon={<LensIcon />} color={blue[500]} onClick={() => navigate("/inventory-management/lens-list")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Total Medicine" count={numberFormat(data.summary?.total_medicine || 0)} icon={<PharmacyIcon />} color={teal[500]} onClick={() => navigate("/inventory-management/stocktaking")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <InfoCard title="Total Accessories" count={numberFormat(data.summary?.total_frame || 0)} icon={<FrameIcon />} color={purple[500]} onClick={() => navigate("/inventory-management/stocktaking")} />
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Accessory Categories */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Accessory Categories" />
                <Divider />
                <CardContent>
                  {(data.statistics?.frame_categories || []).length > 0 ? (
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.frame_categories).map(e => `${e.category || "Unknown"} (${numberFormat(e.total_quantity || 0)})`),
                        colors: COLORS,
                        dataLabels: { formatter: (val, opts) => numberFormat(opts.w.globals.series[opts.seriesIndex]) },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: { position: "bottom" },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                      }}
                      series={(data.statistics.frame_categories).map(e => Math.max(0, parseFloat(e.total_quantity) || 0))}
                      type="pie"
                      height={400}
                    />
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
                      <Typography color="textSecondary">No data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Sold Accessories */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Top Sold Accessories (Quantity)" />
                <Divider />
                <CardContent>
                  {(data.statistics?.sold_frames_pie_chart || []).length > 0 ? (
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.sold_frames_pie_chart).map(e => `${e.frame_name} (${numberFormat(e.quantity_sold)})`),
                        colors: COLORS,
                        dataLabels: { formatter: (val, opts) => numberFormat(opts.w.globals.series[opts.seriesIndex]) },
                        tooltip: { y: { formatter: (val) => `${numberFormat(val)} Units` } },
                        legend: { position: "bottom" },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                        stroke: { show: true, width: 2, colors: [theme.palette.background.paper] },
                      }}
                      series={(data.statistics.sold_frames_pie_chart).map(e => e.quantity_sold)}
                      type="pie"
                      height={400}
                    />
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
                      <Typography color="textSecondary">No sales data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Sold Medicines */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Top Sold Medicines (Quantity)" />
                <Divider />
                <CardContent>
                  {(data.statistics?.sold_medicine_pie_chart || []).length > 0 ? (
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.sold_medicine_pie_chart).map(e => `${e.medicine_name} (${numberFormat(e.quantity_sold)})`),
                        colors: MEDICINE_COLORS,
                        dataLabels: { formatter: (val, opts) => numberFormat(opts.w.globals.series[opts.seriesIndex]) },
                        tooltip: { y: { formatter: (val) => `${numberFormat(val)} Units` } },
                        legend: { position: "bottom" },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                        stroke: { show: true, width: 2, colors: [theme.palette.background.paper] },
                      }}
                      series={(data.statistics.sold_medicine_pie_chart).map(e => e.quantity_sold)}
                      type="pie"
                      height={400}
                    />
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
                      <Typography color="textSecondary">No sales data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Pharmacy Categories */}
            <Grid size={{ md: 6, sm: 12, xs: 12 }}>
              <Card>
                <CardHeader title="Pharmacy Items by Category" />
                <Divider />
                <CardContent>
                  {(data.statistics?.pharmacy_categories || []).length > 0 ? (
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.pharmacy_categories).map(e => `${e.category || "Unknown"} (${numberFormat(e.total_quantity || 0)})`),
                        colors: MEDICINE_COLORS,
                        dataLabels: { formatter: (val, opts) => numberFormat(opts.w.globals.series[opts.seriesIndex]) },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: { position: "bottom" },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                      }}
                      series={(data.statistics.pharmacy_categories).map(e => Math.max(0, parseFloat(e.total_quantity) || 0))}
                      type="pie"
                      height={400}
                    />
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
                      <Typography color="textSecondary">No data available</Typography>
                    </Box>
                  )}
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

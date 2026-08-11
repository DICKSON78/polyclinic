import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  TrendingUpRounded as FastMovingIcon,
  InventoryRounded as InStockIcon,
  WarningRounded as LowStockIcon,
} from "@mui/icons-material";
import {
  blue,
  green,
  orange,
} from "@mui/material/colors";
import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import Table from "../../../components/Table";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const LensTracking = () => {
  const addToast = useToast();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const { data, loading, error, handleFetch } = useFetch(
    "api/inventory-management/dashboard",
    {},
    true,
    {
      statistics: {
        fast_moving_lenses: [],
        in_stock_lenses: [],
        low_stock_lenses: [],
        lens_sales_trends: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Item Tracking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const fastMovingLenses = data?.statistics?.fast_moving_lenses || [];
  const inStockLenses = data?.statistics?.in_stock_lenses || [];
  const lowStockLenses = data?.statistics?.low_stock_lenses || [];
  const salesTrends = data?.statistics?.lens_sales_trends || [];

  const getStockStatusColor = (status) => {
    switch (status) {
      case "Out of Stock":
        return "error";
      case "Low Stock":
        return "warning";
      default:
        return "success";
    }
  };

  const salesTrendsChartOptions = {
    chart: {
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.primary,
      background: "transparent",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: salesTrends.map((t) => {
        const date = new Date(t.date);
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }),
      axisBorder: {
        show: false,
        color: theme.palette.divider,
      },
      axisTicks: {
        show: true,
        color: theme.palette.divider,
        height: 6,
      },
    },
    yaxis: {
      title: {
        text: "Quantity Sold",
      },
      axisBorder: {
        show: false,
        color: theme.palette.divider,
      },
      axisTicks: {
        show: true,
        color: theme.palette.divider,
        width: 6,
      },
      labels: {
        formatter: (val) => numberFormat(val),
      },
    },
    grid: {
      show: false,
      borderColor: theme.palette.divider,
    },
    colors: [blue[400]],
    tooltip: {
      theme: "dark",
      fillSeriesColor: true,
    },
  };

  const salesTrendsChartSeries = [
    {
      name: "Quantity Sold",
      data: salesTrends.map((t) => t.quantity_sold || 0),
    },
  ];

  return (
    <Page
      title="Item Tracking"
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Item Tracking" },
      ]}
    >
      <CardHeader
        title="Item Tracking"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 3,
        }}
      />

      {/* Summary Cards Section */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title="Fast-Moving Items"
            count={numberFormat(fastMovingLenses.length)}
            icon={<FastMovingIcon />}
            color={blue[400]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title="In Stock Items"
            count={numberFormat(inStockLenses.length)}
            icon={<InStockIcon />}
            color={green[400]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title="Low Stock Alerts"
            count={numberFormat(lowStockLenses.length)}
            icon={<LowStockIcon />}
            color={orange[400]}
            badge={lowStockLenses.length > 0 ? lowStockLenses.length : 0}
          />
        </Grid>
      </Grid>

      {/* Sales Trends Chart */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Item Sales Trends (Last 7 Days)" />
            <Divider />
            <CardContent>
              <ChartWrapper
                options={salesTrendsChartOptions}
                series={salesTrendsChartSeries}
                type="line"
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
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
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Item Tracking Details" />
            <Divider />
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
            >
              <Tab label="Fast-Moving Items" icon={<FastMovingIcon />} iconPosition="start" />
              <Tab label="In Stock Items" icon={<InStockIcon />} iconPosition="start" />
              <Tab label="Low Stock Alerts" icon={<LowStockIcon />} iconPosition="start" />
            </Tabs>

            <CardContent>
              {activeTab === 0 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    These are the top-selling items based on sales volume in the last 30 days. 
                    Fast-moving items indicate high customer demand.
                  </Alert>
                  <Table
                    loading={loading}
                    columns={[
                      {
                        field: "index",
                        headerName: "Rank",
                        valueGetter: (item, index) => index + 1,
                      },
                      {
                        field: "name",
                        headerName: "Item Name",
                      },
                      {
                        field: "code",
                        headerName: "Code",
                      },
                      {
                        field: "lens_type",
                        headerName: "Item Type",
                        valueGetter: (item) => item.lens_type || "Unspecified",
                      },
                      {
                        field: "category",
                        headerName: "Category",
                        valueGetter: (item) => item.category || "Uncategorized",
                      },
                      {
                        field: "total_sold",
                        headerName: "Total Sold (30 days)",
                        valueGetter: (item) => numberFormat(item.total_sold || 0),
                      },
                      {
                        field: "total_transactions",
                        headerName: "Transactions",
                        valueGetter: (item) => numberFormat(item.total_transactions || 0),
                      },
                      {
                        field: "balance",
                        headerName: "Current Stock",
                        valueGetter: (item) => numberFormat(Math.max(0, item.balance || 0)),
                      },
                      {
                        field: "unit_of_measure",
                        headerName: "Unit",
                        valueGetter: (item) => item.unit_of_measure || "-",
                      },
                    ]}
                    items={fastMovingLenses}
                    hidePaginationFooter={fastMovingLenses.length <= 25}
                  />
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    All items currently available in stock with their quantities.
                  </Alert>
                  <Table
                    loading={loading}
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => index + 1,
                      },
                      {
                        field: "name",
                        headerName: "Item Name",
                      },
                      {
                        field: "code",
                        headerName: "Code",
                      },
                      {
                        field: "lens_type",
                        headerName: "Item Type",
                        valueGetter: (item) => item.lens_type || "Unspecified",
                      },
                      {
                        field: "category",
                        headerName: "Category",
                        valueGetter: (item) => item.category || "Uncategorized",
                      },
                      {
                        field: "balance",
                        headerName: "Current Stock",
                        valueGetter: (item) => numberFormat(Math.max(0, item.balance || 0)),
                      },
                      {
                        field: "minimum_stock",
                        headerName: "Min. Stock",
                        valueGetter: (item) => numberFormat(item.minimum_stock || 0),
                      },
                      {
                        field: "unit_of_measure",
                        headerName: "Unit",
                        valueGetter: (item) => item.unit_of_measure || "-",
                      },
                      {
                        field: "unit_buying_price",
                        headerName: "Buying Price",
                        valueGetter: (item) => numberFormat(item.unit_buying_price || 0),
                      },
                    ]}
                    items={inStockLenses}
                    hidePaginationFooter={inStockLenses.length <= 25}
                  />
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    These items are running low on stock and need to be restocked soon.
                  </Alert>
                  <Table
                    loading={loading}
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => index + 1,
                      },
                      {
                        field: "name",
                        headerName: "Item Name",
                      },
                      {
                        field: "code",
                        headerName: "Code",
                      },
                      {
                        field: "lens_type",
                        headerName: "Item Type",
                        valueGetter: (item) => item.lens_type || "Unspecified",
                      },
                      {
                        field: "category",
                        headerName: "Category",
                        valueGetter: (item) => item.category || "Uncategorized",
                      },
                      {
                        field: "stock_status",
                        headerName: "Status",
                        renderCell: (item) => (
                          <Chip
                            label={item.stock_status || "Low Stock"}
                            color={getStockStatusColor(item.stock_status)}
                            size="small"
                          />
                        ),
                      },
                      {
                        field: "balance",
                        headerName: "Current Stock",
                        valueGetter: (item) => numberFormat(Math.max(0, item.balance || 0)),
                      },
                      {
                        field: "minimum_stock",
                        headerName: "Min. Stock",
                        valueGetter: (item) => numberFormat(item.minimum_stock || 0),
                      },
                      {
                        field: "unit_of_measure",
                        headerName: "Unit",
                        valueGetter: (item) => item.unit_of_measure || "-",
                      },
                    ]}
                    items={lowStockLenses}
                    hidePaginationFooter={lowStockLenses.length <= 25}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default LensTracking;


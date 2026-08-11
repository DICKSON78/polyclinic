import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
  InventoryRounded as InventoryIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, safeExtractArray, safeExtractPaginatedData } from "../../../helpers";

const LensStock = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    lens_type: undefined,
    sph: undefined,
    cyl: undefined,
    q: undefined,
  });

  const { data: lensTypes, loading: loadingLensTypes } = useFetch(
    "api/lens-types",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => {
      // safeExtractArray starts at response.data internally, so path is 'data.data' not 'data.data.data'
      const extracted = safeExtractArray(response, 'data.data', []);
      return extracted;
    }
  );

  const { data, loading, error, handleFetch } = useFetch(
    "api/lens-stock",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => safeExtractPaginatedData(response, 'data.data')
  );

  useEffect(() => {
    document.title = `Item Stock - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSearch = () => {
    setParams({ ...params, page: 1 });
    handleFetch();
  };

  const handleClear = () => {
    setParams({
      page: 1,
      per_page: 25,
      lens_type: undefined,
      sph: undefined,
      cyl: undefined,
      q: undefined,
    });
  };

  // Extract SV lens types and Multifocal lens types
  // Ensure lensTypes is always an array before filtering
  const safeLensTypes = Array.isArray(lensTypes) ? lensTypes : [];

  // Build lens type options dynamically from database
  const lensTypeOptions = [
    { label: "All Item Types", value: "" },
    ...safeLensTypes.map((lt) => ({
      label: lt.name,
      value: lt.name,
    })),
  ];

  // Determine if current lens type is Single Vision (for SPH/CYL fields)
  const isSingleVision = params.lens_type &&
    (params.lens_type === "Single Vision" || params.lens_type === "SV");

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Outpatient Dispensing" },
        { title: "Item Stock" },
      ]}
    >
      <Card>
        <PageHeader
          title="Item Stock"
          subtitle={`${data.total || 0} items available`}
          trailing={
            <Tooltip title="Refresh List">
              <IconButton onClick={handleFetch} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          {/* Search Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Select
                fullWidth
                label="Item Type"
                value={params.lens_type || ""}
                onChange={(value) =>
                  setParams({ ...params, lens_type: value || undefined, page: 1 })
                }
                clearable
                options={lensTypeOptions}
                optionsLabel="label"
                optionsValue="value"
              />
            </Grid>
            {isSingleVision && (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Sphere (Sph)"
                    value={params.sph || ""}
                    onChange={(e) =>
                      setParams({ ...params, sph: e.target.value || undefined })
                    }
                    placeholder="e.g., -2.00, +1.50"
                    helperText="Search by sphere value"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Cylinder (Cyl)"
                    value={params.cyl || ""}
                    onChange={(e) =>
                      setParams({ ...params, cyl: e.target.value || undefined })
                    }
                    placeholder="e.g., -0.50, +1.00"
                    helperText="Search by cylinder value"
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, md: isSingleVision ? 3 : 9 }}>
              <TextField
                fullWidth
                label="Search by Name or Code"
                value={params.q || ""}
                onChange={(e) =>
                  setParams({ ...params, q: e.target.value || undefined })
                }
                placeholder="Search item name, code, or specifications"
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch} size="small">
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Tooltip title="Search">
                  <IconButton
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear Filters">
                  <IconButton onClick={handleClear} disabled={loading}>
                    Clear
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
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
                  valueGetter: (item) => item.lens_type?.name || "N/A",
                  renderCell: (item) => {
                    const lensTypeName = item.lens_type?.name || "N/A";
                    const isSV = lensTypeName === "Single Vision";
                    const isMultifocal = ["Bifocal", "Progressive"].includes(
                      lensTypeName
                    );
                    return (
                      <Chip
                        label={lensTypeName}
                        size="small"
                        color={
                          isSV
                            ? "primary"
                            : isMultifocal
                            ? "secondary"
                            : "default"
                        }
                        variant="outlined"
                      />
                    );
                  },
                },
                {
                  field: "balance",
                  headerName: "Stock Balance",
                  valueGetter: (item) => numberFormat(item.balance || 0),
                },
                {
                  field: "unit_buying_price",
                  headerName: "Buying Price",
                  valueGetter: (item) =>
                    item.unit_buying_price
                      ? numberFormat(item.unit_buying_price)
                      : "N/A",
                },
                {
                  field: "unit_of_measure",
                  headerName: "Unit",
                  valueGetter: (item) => item.unit_of_measure?.name || "N/A",
                },
                {
                  field: "templates",
                  headerName: "Specifications",
                  valueGetter: (item) => item.templates || "N/A",
                  show: false,
                },
              ]}
              items={Array.isArray(data?.data) ? data.data : []}
              itemCount={data?.total ?? 0}
              page={params.page}
              pageSize={params.per_page}
              onPageChange={(page) => setParams({ ...params, page })}
              onPageSizeChange={(value) =>
                setParams({ ...params, per_page: value, page: 1 })
              }
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default LensStock;


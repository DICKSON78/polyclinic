import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const LensList = () => {
  const addToast = useToast();
  const [lensTypeFilter, setLensTypeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: lensTypes, loading: loadingLensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handleFetch } = useFetch(
    "api/inventory-management/dashboard",
    {},
    true,
    {
      statistics: {
        lens_list: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Item List - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const lensList = data?.statistics?.lens_list || [];

  // Filter lenses
  const filteredLenses = lensList.filter((lens) => {
    // Normalizing values to ensure robust comparison (trim and handle potential minor differences)
    const normalizedFilter = lensTypeFilter ? String(lensTypeFilter).trim() : null;
    const normalizedLensType = lens.lens_type ? String(lens.lens_type).trim() : null;

    const matchesLensType = !normalizedFilter ||
      (normalizedLensType && normalizedLensType.toLowerCase() === normalizedFilter.toLowerCase());
    const matchesSearch = !searchQuery ||
      lens.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lens.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lens.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLensType && matchesSearch;
  });

  return (
    <Page
      title="Item List"
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Item List" },
      ]}
    >
      <Card>
        <PageHeader title="Item List" />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SearchTextField
                placeholder="Search by name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                label="Filter by Item Type"
                fullWidth
                options={[
                  { label: "All Types", value: null },
                  ...(lensTypes || []).map((lt) => ({
                    label: lt.name,
                    value: lt.name,
                  })),
                ]}
                optionsLabel="label"
                optionsValue="value"
                value={lensTypeFilter}
                onChange={(value) => setLensTypeFilter(value || null)}
                clearable
              />
            </Grid>
          </Grid>

          <Table
            loading={loading || loadingLensTypes}
            columns={[
              {
                field: "name",
                headerName: "Item Name",
              },
              {
                field: "code",
                headerName: "Code",
              },
              {
                field: "category",
                headerName: "Category",
                valueGetter: (item) => item.category || "Uncategorized",
              },
              {
                field: "lens_type",
                headerName: "Item Type",
                valueGetter: (item) => item.lens_type || "Unspecified",
              },
              {
                field: "balance",
                headerName: "Quantity",
                valueGetter: (item) => numberFormat(Math.max(0, item.balance || 0)),
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
              {
                field: "minimum_stock",
                headerName: "Min Stock",
                valueGetter: (item) => numberFormat(item.minimum_stock || 0),
              },
            ]}
            items={filteredLenses}
            hidePaginationFooter={filteredLenses.length <= 25}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default LensList;


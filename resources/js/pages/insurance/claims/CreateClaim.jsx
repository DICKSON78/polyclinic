import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import Table from "../../../components/Table";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError, numberFormat } from "../../../helpers";

const STATUS_COLORS = {
  Pending: "warning",
  Billed: "info",
  Paid: "success",
};

const CreateClaim = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const formRef = useRef();
  const patientRef = useRef();
  const companyRef = useRef();
  const serviceDateRef = useRef();

  const [patientId, setPatientId] = useState();
  const [companyId, setCompanyId] = useState();
  const [serviceDate, setServiceDate] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: patients, loading: loadingPatients } = useFetch(
    "api/patients",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: companies, loading: loadingCompanies } = useFetch(
    "api/insurance-company",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => response?.data?.data?.data ?? []
  );

  const {
    data: items,
    loading: loadingItems,
    error: itemsError,
    handleFetch: fetchItems,
  } = useFetch(
    patientId ? "api/patient-payment-cache-items" : null,
    patientId ? { patient_id: patientId, status: "Pending,Billed", per_page: 500 } : null,
    !!patientId,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data, loading: saving, error: saveError, handlePost } = usePost("api/insurance-claim");

  useEffect(() => {
    document.title = `New Insurance Claim - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setSelectedItems([]);
  }, [patientId]);

  useEffect(() => {
    if (itemsError) {
      addToast({ message: formatError(itemsError), severity: "error" });
    }
  }, [itemsError]);

  useEffect(() => {
    if (saveError) {
      addToast({ message: formatError(saveError), severity: "error" });
    }
  }, [saveError]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => navigate("/insurance/claims"), 1200);
    }
  }, [data]);

  const getPatientLabel = (p) =>
    `${p?.full_name || `Patient #${p?.id}`}${p?.phone ? ` - ${p.phone}` : ""}`;

  const claimableItems = useMemo(
    () => (items || []).filter((i) => ["Pending", "Billed"].includes(i.status)),
    [items]
  );

  const selectedIds = selectedItems.map((i) => i.id);

  const totalAmount = useMemo(
    () =>
      selectedItems.reduce(
        (sum, i) => sum + (parseFloat(i.amount) || 0),
        0
      ),
    [selectedItems]
  );

  const getItemName = (item) => item.item?.name || item.comments || "Item";

  const handleSave = () => {
    if (!patientId) {
      addToast({ message: "Please select a patient.", severity: "warning" });
      return;
    }
    if (!companyId) {
      addToast({ message: "Please select an insurance company.", severity: "warning" });
      return;
    }
    if (selectedItems.length === 0) {
      addToast({ message: "Please select at least one item.", severity: "warning" });
      return;
    }
    if (!serviceDate) {
      addToast({ message: "Please select a service date.", severity: "warning" });
      return;
    }

    handlePost("api/insurance-claim", {
      patient_id: patientId,
      insurance_company_id: companyId,
      service_date: formatDateForDb(serviceDate),
      payment_cache_item_ids: selectedIds,
    });
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Claims" },
        { title: "New Claim" },
      ]}
    >
      <Card>
        <PageHeader
          title="New Insurance Claim"
          subtitle="Create a claim from a patient's billed items"
          leading={
            <IconButton onClick={() => navigate("/insurance/claims")}>
              <ArrowBackRounded />
            </IconButton>
          }
          trailing={
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Create Claim"}
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {saving && <LinearProgress />}
          <Form ref={formRef}>
            <Grid
              container
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Grid size={{ xs: 12, md: 4 }}>
                <Select
                  ref={patientRef}
                  label="Patient *"
                  fullWidth
                  required
                  optionsLabel="full_name"
                  optionsValue="id"
                  placeholder="Search patient..."
                  loading={loadingPatients}
                  options={patients || []}
                  value={patientId}
                  onChange={(value) => setPatientId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Select
                  ref={companyRef}
                  label="Insurance Company *"
                  fullWidth
                  required
                  optionsLabel="name"
                  optionsValue="id"
                  loading={loadingCompanies}
                  options={companies || []}
                  value={companyId}
                  onChange={(value) => setCompanyId(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  ref={serviceDateRef}
                  label="Service Date *"
                  fullWidth
                  required
                  value={serviceDate}
                  onChange={(value) => setServiceDate(value)}
                />
              </Grid>
            </Grid>
          </Form>

          <Card variant="outlined">
            <CardHeader
              title={`Billed Items (${claimableItems.length})`}
              subheader={
                patientId
                  ? "Select the items to include in this claim (Pending / Billed only)"
                  : "Select a patient to load their billed items"
              }
              action={
                selectedItems.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip
                      size="small"
                      color="primary"
                      label={`${selectedItems.length} selected`}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {numberFormat(totalAmount)}
                    </Typography>
                  </Stack>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Table
                loading={loadingItems}
                checkboxSelection
                checked={selectedItems}
                setChecked={setSelectedItems}
                hidePaginationFooter
                columns={[
                  {
                    field: "item",
                    headerName: "Item",
                    valueGetter: (item) => getItemName(item),
                  },
                  {
                    field: "quantity",
                    headerName: "Qty",
                    valueGetter: (item) => item.quantity ?? 0,
                    hideOnMobile: true,
                  },
                  {
                    field: "unit_price",
                    headerName: "Unit Price",
                    valueGetter: (item) => numberFormat(item.unit_price || 0),
                    hideOnMobile: true,
                  },
                  {
                    field: "amount",
                    headerName: "Amount",
                    valueGetter: (item) => numberFormat(item.amount || 0),
                  },
                  {
                    field: "status",
                    headerName: "Status",
                    renderCell: (item) => (
                      <Chip
                        size="small"
                        color={STATUS_COLORS[item.status] || "default"}
                        label={item.status || "-"}
                      />
                    ),
                    hideOnMobile: true,
                  },
                ]}
                items={claimableItems}
                noItemsOverlayMessage={
                  patientId
                    ? "No Pending/Billed items found for this patient."
                    : "Select a patient above to load their billed items."
                }
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </Page>
  );
};

export default CreateClaim;

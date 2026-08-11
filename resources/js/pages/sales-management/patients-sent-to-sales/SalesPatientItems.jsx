import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  Skeleton,
  Box,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  SendRounded as SendToCashierIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import ConsultationItemsCard from "../../consultation-room/clinical-notes/ConsultationItemsCard";
import SelectItems from "../../consultation-room/clinical-notes/SelectItems";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const SalesPatientItems = () => {
  const { patientId, paymentCacheId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [loadingPatient, setLoadingPatient] = useState(true);

  const {
    data: paymentCache,
    loading: loadingCache,
    error,
    handleFetch,
  } = useFetch(
    paymentCacheId ? `api/patient-payment-cache/${paymentCacheId}` : null,
    null,
    !!paymentCacheId,
    null,
    (response) => {
      const raw = response?.data?.data ?? response?.data;
      return raw ?? null;
    }
  );

  // Fetch items separately so we can refresh after adding glass
  const {
    data: items,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    { consultation_id: paymentCache?.consultation?.id },
    !!paymentCache?.consultation?.id,
    [],
    (response) => {
      const payload = response?.data?.data;
      return Array.isArray(payload) ? payload : (payload?.data ?? []);
    }
  );

  const patient = paymentCache?.check_in?.patient;
  const consultation = paymentCache?.consultation;
  const allItems = items?.length > 0 ? items : (paymentCache?.items ?? []);

  useEffect(() => {
    document.title = `Manage Patient - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  useEffect(() => {
    if (paymentCache?.consultation?.id) {
      fetchItems();
    }
  }, [paymentCache?.consultation?.id]);

  const handleBack = () => {
    navigate("/sales-management/patients-sent-to-sales");
  };

  const hasUnpaidItems = allItems.some(
    (item) => item?.status === "Pending" || item?.status === "Billed"
  );

  const handleSendToCashier = () => {
    navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
  };

  const openSelectItemsModal = (title, type) => {
    if (!consultation) {
      addToast({ message: "No consultation found for this patient", severity: "error" });
      return;
    }
    const component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={Array.isArray(allItems) ? allItems.filter((e) => e.consultation_type?.name === type) : []}
        fetchItems={() => { fetchItems(); handleFetch(); }}
      />
    );
    modalRef.current.open(title, component, "md");
  };

  if (!paymentCacheId) {
    return (
      <Page
        title="Manage Patient"
        breadcrumbs={[
          { title: "Home" },
          { title: "Sales Table" },
          { title: "Patients Sent to Sales" },
          { title: "Manage" },
        ]}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Missing payment cache. Please go back and try again.
            </Typography>
            <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
              Back to list
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Table" },
        { title: "Patients Sent to Sales", onClick: handleBack },
        {
          title: patient
            ? (patient.full_name || `${patient.first_name || ""} ${patient.last_name || ""}`).trim() || "Manage"
            : "Manage",
        },
      ]}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={handleBack} variant="outlined">
          Back to list
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SendToCashierIcon />}
            onClick={handleSendToCashier}
            disabled={loadingCache || !paymentCache}
          >
            {hasUnpaidItems ? "Send to Cashier" : "Complete"}
          </Button>
        </Stack>
      </Stack>

      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={() => {}}
      />

      {loadingPatient ? <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} /> : null}

      {/* Glass & Others Cards with Add functionality */}
      {consultation && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ConsultationItemsCard
                title="Dispensing"
                consultationType="Glass"
                loading={loadingItems}
                items={allItems}
                consultation={consultation}
                onClickAdd={(title, consultationType) =>
                  openSelectItemsModal(title, consultationType)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ConsultationItemsCard
                title="Others"
                consultationType="Others"
                loading={loadingItems}
                items={allItems}
                consultation={consultation}
                onClickAdd={(title, consultationType) =>
                  openSelectItemsModal(title, consultationType)
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* All Items Summary Table */}
      <Card sx={{ mt: 2 }}>
        <PageHeader
          title="Items in this visit"
          subtitle={paymentCache ? `${allItems.length} item(s)` : "Loading…"}
        />
        <Divider />
        <CardContent>
          {loadingCache && !paymentCache ? (
            <Skeleton variant="rounded" height={200} />
          ) : error && !paymentCache ? (
            <Typography color="error">
              Failed to load items. {formatError(error)}
            </Typography>
          ) : !Array.isArray(allItems) || allItems.length === 0 ? (
            <Typography color="text.secondary">No items in this visit.</Typography>
          ) : (
            <Table
              loading={false}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_name",
                  headerName: "Item",
                  valueGetter: (item) => item?.item?.name ?? "—",
                },
                {
                  field: "consultation_type",
                  headerName: "Type",
                  valueGetter: (item) => item?.consultation_type?.name ?? "—",
                },
                {
                  field: "payment_mode",
                  headerName: "Payment Mode",
                  valueGetter: (item) => item?.payment_mode?.name ?? "—",
                },
                {
                  field: "unit_price",
                  headerName: "Unit Price",
                  valueGetter: (item) => numberFormat(item?.unit_price ?? 0),
                },
                {
                  field: "quantity",
                  headerName: "Qty",
                  valueGetter: (item) => numberFormat(item?.quantity ?? 0),
                },
                {
                  field: "subtotal",
                  headerName: "Subtotal",
                  valueGetter: (item) =>
                    numberFormat((item?.unit_price ?? 0) * (item?.quantity ?? 0)),
                },
                {
                  field: "status",
                  headerName: "Status",
                  valueGetter: (item) => item?.status ?? "—",
                },
              ]}
              items={allItems}
              itemCount={allItems.length}
              page={1}
              pageSize={allItems.length || 25}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              hidePaginationFooter
            />
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default SalesPatientItems;

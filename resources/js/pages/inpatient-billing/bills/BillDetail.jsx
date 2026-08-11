import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  PaymentsRounded as PayIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Open: "warning",
  Partial: "info",
  Paid: "success",
  Void: "error",
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PaymentForm = ({ item, modal, fetchItem }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [paymentModes, setPaymentModes] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentModeId, setPaymentModeId] = useState();
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const { data: modesData } = useFetch(
    "api/inpatient-billing/payment-modes",
    {},
    true,
    [],
    (response) => {
      const raw = response.data?.data;
      return Array.isArray(raw) ? raw : [];
    }
  );

  const { data, loading, error, handlePost } = usePost(
    `api/inpatient-billing/bills/${item.id}/payments`
  );

  useEffect(() => {
    if (modesData) {
      setPaymentModes(
        modesData.map((m) => ({ value: m.id, label: m.name }))
      );
    }
  }, [modesData]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost(null, {
        amount,
        payment_mode_id: paymentModeId,
        payment_date: paymentDate,
        reference,
        notes,
      });
    }
  };

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchItem();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const balance = Math.max(
    (Number(item.total) || 0) - (Number(item.amount_paid) || 0),
    0
  );

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Outstanding balance: <strong>{formatMoney(balance)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount *"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={setAmount}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={paymentDate}
                onChange={setPaymentDate}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                label="Payment Mode"
                fullWidth
                clearable
                value={paymentModeId}
                onChange={setPaymentModeId}
                options={paymentModes}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reference"
                fullWidth
                value={reference}
                onChange={setReference}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={2}
                value={notes}
                onChange={setNotes}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={() => modal.close()}>
          Cancel
        </Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? "Recording..." : "Record Payment"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const BillDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { billId } = useParams();

  usePrivilege('wards', '/dashboard');

  const modalRef = useRef();

  const {
    data: item,
    loading,
    error,
    handleFetch: fetchItem,
  } = useFetch(
    `api/inpatient-billing/bills/${billId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  useEffect(() => {
    document.title = `Inpatient Bill ${item?.bill_no || ""} - ${window.APP_NAME}`;
  }, [item]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const canPay = item && !["Paid", "Void"].includes(item.status);
  const balance = Math.max(
    (Number(item?.total) || 0) - (Number(item?.amount_paid) || 0),
    0
  );

  const openPay = () => {
    modalRef.current.open(
      `Record Payment - ${item.bill_no}`,
      <PaymentForm item={item} modal={modalRef.current} fetchItem={fetchItem} />,
      "sm"
    );
  };

  const chargeColumns = [
    {
      field: "charge_date",
      headerName: "Date",
      valueGetter: (c) => c.charge_date || "-",
    },
    {
      field: "charge_type",
      headerName: "Type",
      valueGetter: (c) => c.charge_type || "-",
    },
    {
      field: "description",
      headerName: "Description",
      valueGetter: (c) => c.description || "-",
    },
    {
      field: "quantity",
      headerName: "Qty",
      valueGetter: (c) => c.quantity ?? "-",
    },
    {
      field: "unit_price",
      headerName: "Unit Price",
      valueGetter: (c) => formatMoney(c.unit_price),
    },
    {
      field: "amount",
      headerName: "Amount",
      valueGetter: (c) => formatMoney(c.amount),
    },
  ];

  const paymentColumns = [
    {
      field: "payment_date",
      headerName: "Date",
      valueGetter: (p) => p.payment_date || "-",
    },
    {
      field: "amount",
      headerName: "Amount",
      valueGetter: (p) => formatMoney(p.amount),
    },
    {
      field: "mode",
      headerName: "Mode",
      valueGetter: (p) => p.payment_mode?.name || "-",
    },
    {
      field: "reference",
      headerName: "Reference",
      valueGetter: (p) => p.reference || "-",
      hideOnMobile: true,
    },
    {
      field: "recorded_by",
      headerName: "Recorded By",
      valueGetter: (p) => p.recorded_by?.full_name || "-",
      hideOnMobile: true,
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Inpatient Billing" }, { title: "Bills" }, { title: item?.bill_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={item?.bill_no || "Inpatient Bill"}
          subtitle={item?.patient?.full_name || "Patient bill"}
          leading={
            <IconButton onClick={() => navigate("/inpatient-billing/bills")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            item ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {canPay ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PayIcon />}
                    onClick={openPay}
                  >
                    Record Payment
                  </Button>
                ) : null}
                <Chip
                  size="small"
                  color={STATUS_COLORS[item.status] || "default"}
                  label={item.status || "-"}
                />
              </Stack>
            ) : null
          }
        />
        <Divider />
        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : !item ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Bill not found.</Typography>
          </Stack>
        ) : (
          <React.Fragment>
            <CardContent>
              <Descriptions
                columns={3}
                items={[
                  { label: "Admission", value: item.admission?.admission_no || "-" },
                  { label: "Ward", value: item.admission?.ward?.name || "-" },
                  { label: "Issued At", value: item.issued_at || "-" },
                  { label: "Issued By", value: item.issuedBy?.full_name || "-" },
                  { label: "Total Amount", value: formatMoney(item.amount) },
                  { label: "Discount", value: formatMoney(item.discount) },
                  { label: "Total", value: formatMoney(item.total) },
                  { label: "Paid", value: formatMoney(item.amount_paid) },
                  { label: "Balance", value: formatMoney(balance) },
                  { label: "Settled At", value: item.settled_at || "-" },
                  { label: "Notes", value: item.notes || "-" },
                ]}
              />
            </CardContent>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Charges ({item.charges?.length || 0})
              </Typography>
              <Table
                columns={chargeColumns}
                items={item.charges || []}
                noItemsOverlayMessage="No charges on this bill."
              />
            </CardContent>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payments ({item.payments?.length || 0})
              </Typography>
              <Table
                columns={paymentColumns}
                items={item.payments || []}
                noItemsOverlayMessage="No payments recorded yet."
              />
            </CardContent>
          </React.Fragment>
        )}
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default BillDetail;

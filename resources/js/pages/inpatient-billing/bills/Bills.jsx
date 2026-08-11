import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  VisibilityRounded as ViewIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
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

const CreateBillForm = ({ modal, onSuccess }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [admissionOptions, setAdmissionOptions] = useState([]);
  const [admissionId, setAdmissionId] = useState();
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [pendingSummary, setPendingSummary] = useState({ count: 0, amount: 0 });

  const { data: admissionsData } = useFetch(
    "api/inpatient/admissions",
    { status: "Admitted", per_page: 500 },
    true,
    [],
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data: pendingData } = useFetch(
    admissionId ? "api/inpatient-billing/charges" : null,
    { admission_id: admissionId, status: "Pending", per_page: 500 },
    true,
    null,
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return paginatedData.data || [];
    }
  );

  const { data, loading, error, handlePost } = usePost("api/inpatient-billing/bills");

  useEffect(() => {
    if (admissionsData) {
      setAdmissionOptions(
        admissionsData.map((a) => ({
          value: a.id,
          label: `${a.admission_no} - ${a.patient?.full_name || "Patient"}${
            a.ward?.name ? ` (${a.ward.name})` : ""
          }`,
        }))
      );
    }
  }, [admissionsData]);

  useEffect(() => {
    if (pendingData) {
      const amount = (pendingData || []).reduce(
        (sum, c) => sum + Number(c.amount || 0),
        0
      );
      setPendingSummary({ count: (pendingData || []).length, amount });
    }
  }, [pendingData]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost(null, {
        admission_id: admissionId,
        discount: discount || 0,
        notes,
      });
    }
  };

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const gross = pendingSummary.amount;
  const disc = Number(discount || 0);
  const total = Math.max(gross - disc, 0);

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                label="Admission *"
                fullWidth
                required
                placeholder="Search and select admission"
                value={admissionId}
                onChange={setAdmissionId}
                options={admissionOptions}
              />
            </Grid>
            {admissionId ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Pending charges: <strong>{pendingSummary.count}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total amount: <strong>{formatMoney(gross)}</strong>
                </Typography>
              </Grid>
            ) : null}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount"
                type="number"
                fullWidth
                defaultValue={discount}
                onChange={setDiscount}
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
            {admissionId ? (
              <Grid item xs={12}>
                <Typography variant="h6">
                  Bill Total: {formatMoney(total)}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={() => modal.close()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading || pendingSummary.count === 0}
          onClick={handleSubmit}
        >
          {loading ? "Creating..." : "Create Bill"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const Bills = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient-billing/bills",
    params,
    true,
    { data: [], total: 0, current_page: 1, per_page: 25 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `Inpatient Bills - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreate = () => {
    modalRef.current.open(
      "Create Inpatient Bill",
      <CreateBillForm modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "bill_no",
      headerName: "Bill No",
      valueGetter: (item) => item.bill_no || "-",
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.patient?.full_name || "-",
    },
    {
      field: "admission_no",
      headerName: "Admission",
      valueGetter: (item) => item.admission?.admission_no || "-",
      hideOnMobile: true,
    },
    {
      field: "total",
      headerName: "Total",
      renderCell: (item) => (
        <Typography variant="body2">{formatMoney(item.total)}</Typography>
      ),
    },
    {
      field: "amount_paid",
      headerName: "Paid",
      renderCell: (item) => (
        <Typography variant="body2">{formatMoney(item.amount_paid)}</Typography>
      ),
    },
    {
      field: "balance",
      headerName: "Balance",
      renderCell: (item) => (
        <Typography variant="body2" color={item.amount_paid >= item.total ? "success" : "error"}>
          {formatMoney((Number(item.total) || 0) - (Number(item.amount_paid) || 0))}
        </Typography>
      ),
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
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Bill">
            <IconButton
              size="small"
              onClick={() => navigate(`/inpatient-billing/bills/${item.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Inpatient Billing" }, { title: "Bills" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Inpatient Bills"
          subtitle="Manage inpatient invoices and payments"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={openCreate}
              >
                Create Bill
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by bill no, patient..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            <SearchIcon />
          </Button>
          <Select
            label="Status"
            sx={{ minWidth: 160 }}
            clearable
            value={params.status}
            onChange={(value) =>
              setParams((prev) => ({ ...prev, status: value || undefined, page: 1 }))
            }
            options={Object.keys(STATUS_COLORS)}
          />
        </Stack>
        <Table
          loading={loading}
          columns={columns}
          items={data.data}
          itemCount={data.total}
          page={data.current_page - 1}
          pageSize={data.per_page}
          onPageChange={(event, newPage) =>
            setParams((prev) => ({ ...prev, page: newPage + 1 }))
          }
          onPageSizeChange={(event) =>
            setParams((prev) => ({
              ...prev,
              per_page: parseInt(event.target.value, 10),
              page: 1,
            }))
          }
          noItemsOverlayMessage="No inpatient bills found. Create a bill from pending charges."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Bills;

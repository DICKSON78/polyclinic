import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  BlockRounded as VoidIcon,
  CalendarMonthRounded as AccrueIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import ChargeForm from "./ChargeForm";

const STATUS_COLORS = {
  Pending: "warning",
  Billed: "info",
  Void: "error",
};

const TYPE_COLORS = {
  "Bed Day": "primary",
  Manual: "secondary",
  Medication: "info",
  Procedure: "warning",
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Charges = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    charge_type: undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient-billing/charges",
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

  const { data: accrueData, loading: accruing, handlePost: postAccrue } = usePost();
  const { data: voidData, handlePost: postVoid } = usePost();

  useEffect(() => {
    document.title = `Inpatient Charges - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openForm();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    modalRef.current.open(
      "Add Manual Charge",
      <ChargeForm modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleAccrue = () => {
    postAccrue("api/inpatient-billing/charges/accrue", {});
  };

  const handleVoid = (item) => {
    postVoid(`api/inpatient-billing/charges/${item.id}/void`, {});
  };

  useEffect(() => {
    if (accrueData) {
      addToast({ message: accrueData.message, severity: "success" });
      handleFetch();
    }
  }, [accrueData]);

  useEffect(() => {
    if (voidData) {
      addToast({ message: voidData.message, severity: "success" });
      handleFetch();
    }
  }, [voidData]);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "charge_date",
      headerName: "Date",
      valueGetter: (item) => item.charge_date || "-",
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
    },
    {
      field: "description",
      headerName: "Description",
      valueGetter: (item) => item.description || "-",
    },
    {
      field: "charge_type",
      headerName: "Type",
      renderCell: (item) => (
        <Chip
          size="small"
          color={TYPE_COLORS[item.charge_type] || "default"}
          label={item.charge_type || "-"}
        />
      ),
    },
    {
      field: "quantity",
      headerName: "Qty",
      valueGetter: (item) => item.quantity ?? "-",
      hideOnMobile: true,
    },
    {
      field: "amount",
      headerName: "Amount",
      renderCell: (item) => (
        <Typography variant="body2">{formatMoney(item.amount)}</Typography>
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
      width: 70,
      renderCell: (item) =>
        item.status === "Pending" ? (
          <Tooltip title="Void Charge">
            <IconButton size="small" color="error" onClick={() => handleVoid(item)}>
              <VoidIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Inpatient Billing" }, { title: "Charges" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Inpatient Charges"
          subtitle="Bed-day accruals and manual charges"
          trailing={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<AccrueIcon />}
                onClick={handleAccrue}
                disabled={accruing}
              >
                {accruing ? "Accruing..." : "Run Accrual"}
              </Button>
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
                onClick={openForm}
              >
                Add Charge
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by description, patient..."
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
          <Select
            label="Charge Type"
            sx={{ minWidth: 160 }}
            clearable
            value={params.charge_type}
            onChange={(value) =>
              setParams((prev) => ({ ...prev, charge_type: value || undefined, page: 1 }))
            }
            options={Object.keys(TYPE_COLORS)}
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
          noItemsOverlayMessage="No inpatient charges found. Run the accrual or add a manual charge."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Charges;

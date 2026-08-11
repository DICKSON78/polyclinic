import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  ArrowForwardRounded as AdvanceIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  Dispatched: "info",
  "En-Route": "primary",
  "On-Scene": "warning",
  Transporting: "secondary",
  Completed: "success",
  Cancelled: "error",
};

const NEXT_STATUSES = {
  Dispatched: ["En-Route", "On-Scene", "Transporting", "Completed", "Cancelled"],
  "En-Route": ["On-Scene", "Transporting", "Completed", "Cancelled"],
  "On-Scene": ["Transporting", "Completed", "Cancelled"],
  Transporting: ["Completed", "Cancelled"],
};

const AdvanceForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [status, setStatus] = useState();
  const [notes, setNotes] = useState("");

  const { data, loading, error, handlePost } = usePost(
    `api/ambulance/trips/${item.id}/advance`
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        onSuccess();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost(null, { status, notes });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Select
                label="Update Status *"
                fullWidth
                required
                value={status}
                onChange={setStatus}
                options={NEXT_STATUSES[item.status] || []}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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
          {loading ? "Updating..." : "Update Trip"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const Trips = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  usePrivilege('triage', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, loading, error, handleFetch } = useFetch(
    "api/ambulance/trips",
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
    document.title = `Ambulance Trips - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openAdvance = (item) => {
    setSelected(item);
    modalRef.current.open(
      `Update Trip ${item.trip_no || ""}`,
      <AdvanceForm item={item} modal={modalRef.current} onSuccess={handleFetch} />,
      "sm"
    );
  };

  const columns = [
    {
      field: "trip_no",
      headerName: "Trip No",
      valueGetter: (item) => item.trip_no || "-",
    },
    {
      field: "request_no",
      headerName: "Request No",
      valueGetter: (item) => item.request?.request_no || "-",
    },
    {
      field: "vehicle",
      headerName: "Vehicle",
      valueGetter: (item) => item.vehicle?.registration_no || "-",
    },
    {
      field: "driver",
      headerName: "Driver",
      valueGetter: (item) => item.driver?.full_name || "-",
      hideOnMobile: true,
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
      width: 110,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          {NEXT_STATUSES[item.status]?.length ? (
            <IconButton size="small" onClick={() => openAdvance(item)}>
              <AdvanceIcon fontSize="small" color="primary" />
            </IconButton>
          ) : null}
          <IconButton
            size="small"
            onClick={() => navigate(`/ambulance/requests/${item.request_id}`)}
          >
            <BackIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ambulance" }, { title: "Trips" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Ambulance Trips"
          subtitle="Track live ambulance trips"
          trailing={
            <IconButton onClick={handleFetch} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by trip no, request no..."
            onChange={setSearchText}
          />
          <Button
            variant="contained"
            color="info"
            size="small"
            onClick={() =>
              setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }))
            }
          >
            Search
          </Button>
          <Select
            label="Status"
            sx={{ minWidth: 180 }}
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
          noItemsOverlayMessage="No ambulance trips found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Trips;

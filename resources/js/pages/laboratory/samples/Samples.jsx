import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ScienceRounded as CollectIcon,
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
  BloodtypeRounded as SamplesIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Modal from "../../../components/Modal";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const priorityColor = (p) => {
  if (p === "Stat") return "error";
  if (p === "Urgent") return "warning";
  return "default";
};

const SampleRow = ({ item, onUpdated }) => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();

  const { data, loading, error, handlePost } = usePost(
    `api/laboratory/requests/${item.id}/collect-sample`
  );

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      onUpdated();
    }
  }, [data]);

  const confirmCollect = () => {
    modalRef.current.open(
      "Collect Samples",
      <ConfirmationDialog
        message="Mark all samples as collected for this request? This moves the request to 'In Progress'."
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />,
      "sm"
    );
  };

  return (
    <Card square variant="outlined">
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
          <Stack flexGrow={1}>
            <Typography variant="body1" fontWeight={600}>
              {item.request_no}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.patient?.full_name || "—"} • {item.tests?.length || 0} tests • Requested{" "}
              {new Date(item.created_at).toLocaleString()}
            </Typography>
          </Stack>
          <Chip
            label={item.priority || "Routine"}
            size="small"
            color={priorityColor(item.priority)}
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CollectIcon />}
            onClick={confirmCollect}
            disabled={loading}
          >
            Collect Samples
          </Button>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/laboratory/requests/${item.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
      <Modal ref={modalRef} />
    </Card>
  );
};

const Samples = () => {
  const addToast = useToast();

  usePrivilege('laboratory', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/laboratory/requests",
    { page: 1, per_page: 50, status: "Pending" },
    true,
    { data: [], total: 0 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
      };
    }
  );

  useEffect(() => {
    document.title = `Sample Collection - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[
        { title: "Laboratory" },
        { title: "Sample Collection" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Sample Collection"
          subtitle="Requests awaiting sample collection"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : data.data.length === 0 ? (
            <Stack alignItems="center" py={4}>
              <SamplesIcon color="disabled" fontSize="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                No requests awaiting sample collection.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1}>
              {data.data.map((item) => (
                <SampleRow key={item.id} item={item} onUpdated={handleFetch} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default Samples;

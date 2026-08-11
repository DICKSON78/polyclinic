import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  RefreshRounded as RefreshIcon,
  HistoryRounded as HistoryIcon,
  FavoriteRounded as VitalsIcon,
  PersonRounded as PersonIcon,
  PhoneRounded as PhoneIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import RecordVitals from "../vitals/RecordVitals";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const Queue = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('triage', '/dashboard');

  const [status, setStatus] = useState(searchParams.get("status") === "triaged" ? "triaged" : "awaiting");

  const { data, loading, error, handleFetch } = useFetch(
    "api/triage/queue",
    { status },
    true,
    [],
    (response) => response.data?.data || []
  );

  useEffect(() => {
    document.title = `Triage Queue - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => {
    setStatus(newValue);
    setSearchParams(newValue === "triaged" ? { status: "triaged" } : {});
  };

  const handleRecordVitals = (checkIn) => {
    modalRef.current.open(
      "Record Vital Signs",
      <RecordVitals
        item={checkIn}
        modal={modalRef.current}
        onSuccess={handleFetch}
      />,
      "md"
    );
  };

  const renderPatient = (checkIn) => {
    const patient = checkIn.patient || {};
    const triagedToday = checkIn?.patient?.vital_signs_today;

    return (
      <Card key={checkIn.id} square variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" useFlexGap>
            <Box flexGrow={1}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6">
                  {patient.full_name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim()}
                </Typography>
                {triagedToday ? (
                  <Chip label="Triaged" color="success" size="small" />
                ) : (
                  <Chip label="Awaiting" color="warning" size="small" />
                )}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" mt={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Age: {getAge(patient.date_of_birth) || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" color="text.secondary">
                  Gender: {patient.gender || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {patient.phone || "N/A"}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<VitalsIcon />}
                onClick={() => handleRecordVitals(checkIn)}
              >
                Record Vitals
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={() => navigate(`/triage/patients/${patient.id}/vital-signs`)}
              >
                History
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Triage" },
        { title: "Queue" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Triage Queue"
          subtitle="Patients checked in today"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <Tabs value={status} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab value="awaiting" label="Awaiting Triage" />
          <Tab value="triaged" label="Triaged" />
        </Tabs>
        <Divider />
        <CardContent>
          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : data.length === 0 ? (
            <Stack alignItems="center" py={4} spacing={1}>
              <PersonIcon color="disabled" fontSize="large" />
              <Typography variant="body2" color="text.secondary">
                No patients {status === "triaged" ? "triaged" : "awaiting triage"} today.
              </Typography>
            </Stack>
          ) : (
            data.map(renderPatient)
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Queue;

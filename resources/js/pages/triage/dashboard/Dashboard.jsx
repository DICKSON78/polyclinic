import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  LocalHospitalRounded as TriagedIcon,
  HourglassEmptyRounded as AwaitingIcon,
  EmergencyRounded as UrgentIcon,
  ScheduleRounded as QueueIcon,
  RefreshRounded as RefreshIcon,
  ChecklistRounded as TriageQueueIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";
import { green, indigo, orange, purple, red } from "@mui/material/colors";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('triage', '/dashboard');

  const [params, setParams] = useState({});

  const { data, loading, error, handleFetch } = useFetch(
    "api/triage/dashboard",
    params,
    true,
    {
      queued_patients: 0,
      awaiting_triage: 0,
      triaged_today: 0,
      urgent_cases: 0,
      average_wait_minutes: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Triage Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const stats = data || {};

  return (
    <Page
      breadcrumbs={[
        { title: "Triage" },
        { title: "Dashboard" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Triage Dashboard"
          subtitle="Overview of today's triage activity"
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="In Queue"
                count={stats.queued_patients}
                color={indigo[500]}
                icon={<QueueIcon />}
                onClick={() => navigate("/triage/queue")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Awaiting Triage"
                count={stats.awaiting_triage}
                color={orange[500]}
                icon={<AwaitingIcon />}
                onClick={() => navigate("/triage/queue")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Triaged Today"
                count={stats.triaged_today}
                color={green[500]}
                icon={<TriagedIcon />}
                onClick={() => navigate("/triage/queue?status=triaged")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Urgent Cases"
                count={stats.urgent_cases}
                color={red[500]}
                icon={<UrgentIcon />}
                onClick={() => navigate("/triage/queue")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Avg. Wait (min)"
                count={stats.average_wait_minutes}
                color={purple[500]}
                icon={<QueueIcon />}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              useFlexGap
            >
              <TriageQueueIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Date: <b>{stats.date}</b>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a patient from the queue to record vital signs and start the clinical workflow.
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

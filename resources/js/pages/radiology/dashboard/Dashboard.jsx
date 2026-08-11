import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
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
  PendingRounded as PendingIcon,
  HourglassTopRounded as InProgressIcon,
  CheckCircleRounded as CompletedIcon,
  EmergencyRounded as UrgentIcon,
  RadioRounded as ExamsIcon,
  RefreshRounded as RefreshIcon,
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

  usePrivilege('radiology', '/dashboard');

  const [params, setParams] = useState({});

  const { data, loading, error, handleFetch } = useFetch(
    "api/radiology/dashboard",
    params,
    true,
    {
      pending_requests: 0,
      in_progress: 0,
      completed_today: 0,
      urgent_requests: 0,
      active_exams: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Radiology Dashboard - ${window.APP_NAME}`;
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
        { title: "Radiology" },
        { title: "Dashboard" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Radiology Dashboard"
          subtitle="Overview of imaging workload"
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
                title="Pending Requests"
                count={stats.pending_requests}
                color={orange[500]}
                icon={<PendingIcon />}
                onClick={() => navigate("/radiology/requests?status=Pending")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="In Progress"
                count={stats.in_progress}
                color={indigo[500]}
                icon={<InProgressIcon />}
                onClick={() => navigate("/radiology/requests?status=In Progress")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Completed Today"
                count={stats.completed_today}
                color={green[500]}
                icon={<CompletedIcon />}
                onClick={() => navigate("/radiology/requests?status=Completed")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Urgent / Stat"
                count={stats.urgent_requests}
                color={red[500]}
                icon={<UrgentIcon />}
                onClick={() => navigate("/radiology/requests?priority=Stat")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Active Exams"
                count={stats.active_exams}
                color={purple[500]}
                icon={<ExamsIcon />}
                onClick={() => navigate("/radiology/exams")}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} alignItems="center" mt={3}>
            <ExamsIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Date: <b>{stats.date}</b> — Manage imaging requests, mark exams as performed and enter results from the queue.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

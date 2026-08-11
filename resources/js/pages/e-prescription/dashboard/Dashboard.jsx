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
  MedicationRounded as ActiveIcon,
  Inventory2Rounded as PartiallyIcon,
  CheckCircleRounded as DispensedIcon,
  CancelRounded as CancelledIcon,
  AssignmentRounded as TodayIcon,
  PendingActionsRounded as PendingIcon,
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

  usePrivilege('e_prescription', '/dashboard');

  const [params, setParams] = useState({});

  const { data, loading, error, handleFetch } = useFetch(
    "api/e-prescription/dashboard",
    params,
    true,
    {
      active_prescriptions: 0,
      partially_dispensed: 0,
      dispensed_today: 0,
      cancelled: 0,
      prescriptions_today: 0,
      items_pending: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `E-Prescription Dashboard - ${window.APP_NAME}`;
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
        { title: "E-Prescription" },
        { title: "Dashboard" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="E-Prescription Dashboard"
          subtitle="Overview of prescriptions and dispensing"
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
                title="Active"
                count={stats.active_prescriptions}
                color={orange[500]}
                icon={<ActiveIcon />}
                onClick={() => navigate("/e-prescription/prescriptions?status=Active")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Partially Dispensed"
                count={stats.partially_dispensed}
                color={indigo[500]}
                icon={<PartiallyIcon />}
                onClick={() => navigate("/e-prescription/prescriptions?status=Partially Dispensed")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Dispensed Today"
                count={stats.dispensed_today}
                color={green[500]}
                icon={<DispensedIcon />}
                onClick={() => navigate("/e-prescription/prescriptions?status=Dispensed")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Prescribed Today"
                count={stats.prescriptions_today}
                color={purple[500]}
                icon={<TodayIcon />}
                onClick={() => navigate("/e-prescription/prescriptions")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Pending Items"
                count={stats.items_pending}
                color={red[500]}
                icon={<PendingIcon />}
                onClick={() => navigate("/e-prescription/prescriptions?status=Active")}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} alignItems="center" mt={3}>
            <ActiveIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Date: <b>{stats.date}</b> — Create prescriptions, track dispensing and print patient prescriptions.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

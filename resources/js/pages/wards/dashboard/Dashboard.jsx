import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  HotelRounded as WardsIcon,
  BedRounded as BedsIcon,
  SingleBedRounded as OccupiedIcon,
  BedroomParentRounded as AvailableIcon,
  PersonRounded as AdmittedIcon,
  EventAvailableRounded as TodayIcon,
  LogoutRounded as DischargedIcon,
  ReportRounded as CriticalIcon,
  RefreshRounded as RefreshIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";
import { blue, green, indigo, orange, purple, red, teal } from "@mui/material/colors";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient/dashboard",
    {},
    true,
    {
      total_wards: 0,
      total_beds: 0,
      occupied_beds: 0,
      available_beds: 0,
      occupancy_rate: 0,
      admitted: 0,
      admissions_today: 0,
      discharged_today: 0,
      critical: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Wards / Inpatient Dashboard - ${window.APP_NAME}`;
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
        { title: "Wards / Inpatient" },
        { title: "Dashboard" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Wards / Inpatient Dashboard"
          subtitle="Overview of ward admissions, bed occupancy and discharges"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        {loading && <LinearProgress />}
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Wards"
                count={stats.total_wards}
                color={purple[500]}
                icon={<WardsIcon />}
                onClick={() => navigate("/wards/beds")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Total Beds"
                count={stats.total_beds}
                color={indigo[500]}
                icon={<BedsIcon />}
                onClick={() => navigate("/wards/beds")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Occupied"
                count={stats.occupied_beds}
                color={red[500]}
                icon={<OccupiedIcon />}
                onClick={() => navigate("/wards/beds?status=Occupied")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Available Beds"
                count={stats.available_beds}
                color={green[500]}
                icon={<AvailableIcon />}
                onClick={() => navigate("/wards/beds?status=Available")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Admitted Patients"
                count={stats.admitted}
                color={blue[500]}
                icon={<AdmittedIcon />}
                onClick={() => navigate("/wards/admissions?status=Admitted")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Admissions Today"
                count={stats.admissions_today}
                color={teal[500]}
                icon={<TodayIcon />}
                onClick={() => navigate("/wards/admissions")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Discharged Today"
                count={stats.discharged_today}
                color={orange[500]}
                icon={<DischargedIcon />}
                onClick={() => navigate("/wards/discharges")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <InfoCard
                title="Serious / Critical"
                count={stats.critical}
                color={red[900]}
                icon={<CriticalIcon />}
                onClick={() => navigate("/wards/admissions?status=Admitted")}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} alignItems="center" mt={3}>
            <OccupiedIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Date: <b>{stats.date}</b> — Bed occupancy rate: <b>{stats.occupancy_rate}%</b>. Manage admissions, bed allocation and inpatient care.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

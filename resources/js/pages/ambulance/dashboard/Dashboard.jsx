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
} from "@mui/material";
import {
  RefreshRounded as RefreshIcon,
  AddRounded as AddIcon,
  DirectionsCarRounded as AvailableIcon,
  LocalShippingRounded as OnTripIcon,
  BuildRounded as MaintenanceIcon,
  HourglassTopRounded as PendingIcon,
  AssignmentTurnedInRounded as AssignedIcon,
  PendingRounded as InProgressIcon,
  EventAvailableRounded as TodayIcon,
  RouteRounded as TripsIcon,
} from "@mui/icons-material";
import { blue, green, indigo, orange, purple, red } from "@mui/material/colors";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('triage', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/ambulance/dashboard",
    {},
    true,
    {
      available_vehicles: 0,
      on_trip: 0,
      in_maintenance: 0,
      pending_requests: 0,
      assigned: 0,
      in_progress: 0,
      today_requests: 0,
      today_trips: 0,
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Ambulance Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "Available Vehicles",
      value: data.available_vehicles,
      icon: <AvailableIcon />,
      color: green.main,
      onClick: () => navigate("/ambulance/vehicles?status=Available"),
    },
    {
      title: "On Trip",
      value: data.on_trip,
      icon: <OnTripIcon />,
      color: blue.main,
      onClick: () => navigate("/ambulance/vehicles?status=On-Trip"),
    },
    {
      title: "In Maintenance",
      value: data.in_maintenance,
      icon: <MaintenanceIcon />,
      color: orange.main,
      onClick: () => navigate("/ambulance/vehicles?status=Maintenance"),
    },
    {
      title: "Pending Requests",
      value: data.pending_requests,
      icon: <PendingIcon />,
      color: red.main,
      onClick: () => navigate("/ambulance/requests?status=Pending"),
    },
    {
      title: "Assigned",
      value: data.assigned,
      icon: <AssignedIcon />,
      color: indigo.main,
      onClick: () => navigate("/ambulance/requests?status=Assigned"),
    },
    {
      title: "In Progress",
      value: data.in_progress,
      icon: <InProgressIcon />,
      color: purple.main,
      onClick: () => navigate("/ambulance/requests?status=In-Progress"),
    },
    {
      title: "Requests Today",
      value: data.today_requests,
      icon: <TodayIcon />,
      color: blue.main,
      onClick: () => navigate("/ambulance/requests"),
    },
    {
      title: "Trips Today",
      value: data.today_trips,
      icon: <TripsIcon />,
      color: green.main,
      onClick: () => navigate("/ambulance/trips"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ambulance" }]}
    >
      <Card>
        <PageHeader
          title="Ambulance Dashboard"
          subtitle="Patient transport and ambulance fleet management"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Request">
                <IconButton
                  color="primary"
                  onClick={() => navigate("/ambulance/requests?new=1")}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {cards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.title}>
                <InfoCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  onClick={card.onClick}
                  loading={loading}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

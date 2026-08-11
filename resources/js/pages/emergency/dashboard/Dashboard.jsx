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
  RefreshRounded as RefreshIcon,
  AddRounded as AddIcon,
  HourglassTopRounded as WaitingIcon,
  MedicalServicesRounded as TreatmentIcon,
  EventAvailableRounded as TodayIcon,
  LocalHospitalRounded as AdmittedIcon,
  WarningRounded as CriticalIcon,
  HistoryRounded as TotalIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";
import { blue, green, indigo, orange, purple, red } from "@mui/material/colors";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('triage', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/emergency/dashboard",
    {},
    true,
    {
      waiting: 0,
      in_treatment: 0,
      today_visits: 0,
      admitted_today: 0,
      critical: 0,
      total: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Emergency Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "Waiting",
      value: data.waiting,
      icon: <WaitingIcon />,
      color: orange,
      onClick: () => navigate("/emergency/visits?status=Waiting"),
    },
    {
      title: "In Treatment",
      value: data.in_treatment,
      icon: <TreatmentIcon />,
      color: blue,
      onClick: () => navigate("/emergency/visits?status=In-Treatment"),
    },
    {
      title: "Visits Today",
      value: data.today_visits,
      icon: <TodayIcon />,
      color: green,
      onClick: () => navigate("/emergency/visits?date=today"),
    },
    {
      title: "Admitted Today",
      value: data.admitted_today,
      icon: <AdmittedIcon />,
      color: indigo,
      onClick: () => navigate("/emergency/visits?disposition=Admitted"),
    },
    {
      title: "Critical",
      value: data.critical,
      icon: <CriticalIcon />,
      color: red,
      onClick: () => navigate("/emergency/visits?priority=Critical"),
    },
    {
      title: "Total Visits",
      value: data.total,
      icon: <TotalIcon />,
      color: purple,
      onClick: () => navigate("/emergency/visits"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Emergency" }]}
    >
      <Card>
        <PageHeader
          title="Emergency Dashboard"
          subtitle={`ER activity for ${data.date || "today"}`}
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                color="primary"
                onClick={() => navigate("/emergency/new-visit")}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {cards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={card.title}>
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

          <Card
            variant="outlined"
            sx={{ mt: 3, p: 2, bgcolor: "background.default" }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <IconButton
                color="primary"
                onClick={() => navigate("/emergency/new-visit")}
              >
                <AddIcon />
              </IconButton>
            </Stack>
          </Card>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

import React, { useEffect } from "react";
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
  EventBusyRounded as ScheduledIcon,
  CheckCircleRounded as ReadyIcon,
  MedicalServicesRounded as InProgressIcon,
  TaskAltRounded as CompletedIcon,
  TodayRounded as TodayIcon,
  MeetingRoomRounded as TheatresIcon,
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

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/operating-theatre/dashboard",
    {},
    true,
    {
      scheduled: 0,
      ready: 0,
      in_progress: 0,
      completed_today: 0,
      upcoming_today: 0,
      total: 0,
      theatres: 0,
      active_theatres: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Operating Theatre - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "Scheduled",
      value: data.scheduled,
      icon: <ScheduledIcon />,
      color: orange,
      onClick: () => navigate("/operating-theatre/surgeries?status=Scheduled"),
    },
    {
      title: "Ready",
      value: data.ready,
      icon: <ReadyIcon />,
      color: indigo,
      onClick: () => navigate("/operating-theatre/surgeries?status=Ready"),
    },
    {
      title: "In Progress",
      value: data.in_progress,
      icon: <InProgressIcon />,
      color: blue,
      onClick: () => navigate("/operating-theatre/surgeries?status=In-Progress"),
    },
    {
      title: "Completed Today",
      value: data.completed_today,
      icon: <CompletedIcon />,
      color: green,
      onClick: () => navigate("/operating-theatre/surgeries?status=Completed"),
    },
    {
      title: "Upcoming Today",
      value: data.upcoming_today,
      icon: <TodayIcon />,
      color: purple,
      onClick: () => navigate("/operating-theatre/surgeries?date=today"),
    },
    {
      title: "Active Theatres",
      value: data.active_theatres,
      icon: <TheatresIcon />,
      color: red,
      onClick: () => navigate("/operating-theatre/theatres"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Operating Theatre" }]}
    >
      <Card>
        <PageHeader
          title="Operating Theatre Dashboard"
          subtitle={`Surgical activity for ${data.date || "today"}`}
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                color="primary"
                onClick={() => navigate("/operating-theatre/surgeries/new")}
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
                onClick={() => navigate("/operating-theatre/surgeries/new")}
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

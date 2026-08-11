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
  MedicalServicesRounded as InProgressIcon,
  TaskAltRounded as CompletedIcon,
  EventAvailableRounded as CompletedTodayIcon,
  HistoryRounded as TotalIcon,
  EventBusyRounded as AwaitingIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";
import { blue, green, indigo, orange, purple } from "@mui/material/colors";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/anesthesia/dashboard",
    {},
    true,
    {
      in_progress: 0,
      completed_today: 0,
      completed_total: 0,
      total: 0,
      surgeries_awaiting_anesthesia: 0,
      date: "",
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Anesthesia - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "In Progress",
      value: data.in_progress,
      icon: <InProgressIcon />,
      color: blue,
      onClick: () => navigate("/anesthesia/records?status=In-Progress"),
    },
    {
      title: "Completed Today",
      value: data.completed_today,
      icon: <CompletedTodayIcon />,
      color: green,
      onClick: () => navigate("/anesthesia/records?status=Completed"),
    },
    {
      title: "Completed Total",
      value: data.completed_total,
      icon: <CompletedIcon />,
      color: indigo,
      onClick: () => navigate("/anesthesia/records?status=Completed"),
    },
    {
      title: "Awaiting Anesthesia",
      value: data.surgeries_awaiting_anesthesia,
      icon: <AwaitingIcon />,
      color: orange,
      onClick: () => navigate("/operating-theatre/surgeries"),
    },
    {
      title: "Total Records",
      value: data.total,
      icon: <TotalIcon />,
      color: purple,
      onClick: () => navigate("/anesthesia/records"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Anesthesia" }]}
    >
      <Card>
        <PageHeader
          title="Anesthesia Dashboard"
          subtitle={`Anesthesia activity for ${data.date || "today"}`}
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                color="primary"
                onClick={() => navigate("/anesthesia/records/new")}
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
                onClick={() => navigate("/anesthesia/records/new")}
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

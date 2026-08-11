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
  BedRounded as ActiveIcon,
  DescriptionRounded as DraftIcon,
  VerifiedRounded as FinalizedIcon,
  MonitorHeartRounded as ChartsIcon,
  WaterDropRounded as FluidIcon,
  MedicationRounded as DueIcon,
  CheckCircleRounded as GivenIcon,
  EventAvailableRounded as TodayIcon,
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

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/ward-records/dashboard",
    {},
    true,
    {
      active_admissions: 0,
      draft_summaries: 0,
      finalized_summaries: 0,
      charts_today: 0,
      fluid_entries_today: 0,
      mar_due_today: 0,
      mar_given_today: 0,
      missing_charts: 0,
      missing_mar: 0,
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Ward Records - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "Active Admissions",
      value: data.active_admissions,
      icon: <ActiveIcon />,
      color: blue,
      onClick: () => navigate("/wards/admissions?status=Admitted"),
    },
    {
      title: "Draft Discharge Summaries",
      value: data.draft_summaries,
      icon: <DraftIcon />,
      color: orange,
      onClick: () => navigate("/ward-records/discharge?status=Draft"),
    },
    {
      title: "Finalized Summaries",
      value: data.finalized_summaries,
      icon: <FinalizedIcon />,
      color: green,
      onClick: () => navigate("/ward-records/discharge?status=Finalized"),
    },
    {
      title: "Nursing Charts Today",
      value: data.charts_today,
      icon: <ChartsIcon />,
      color: indigo,
      onClick: () => navigate("/ward-records/nursing"),
    },
    {
      title: "Fluid Balance Entries",
      value: data.fluid_entries_today,
      icon: <FluidIcon />,
      color: purple,
      onClick: () => navigate("/ward-records/fluid-balance"),
    },
    {
      title: "MAR Due Today",
      value: data.mar_due_today,
      icon: <DueIcon />,
      color: red,
      onClick: () => navigate("/ward-records/mar?status=Scheduled"),
    },
    {
      title: "MAR Given Today",
      value: data.mar_given_today,
      icon: <GivenIcon />,
      color: green,
      onClick: () => navigate("/ward-records/mar?status=Given"),
    },
    {
      title: "Admissions Today",
      value: data.missing_charts,
      icon: <TodayIcon />,
      color: blue,
      onClick: () => navigate("/ward-records/nursing"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Ward Records" }]}
    >
      <Card>
        <PageHeader
          title="Ward Clinical Records"
          subtitle="Discharge summaries, nursing charts, fluid balance and medication administration"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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

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
  BloodtypeRounded as AvailableIcon,
  PendingActionsRounded as ReservedIcon,
  SyncRounded as CrossMatchedIcon,
  LocalShippingRounded as IssuedIcon,
  WarningRounded as ExpiringIcon,
  Inventory2Rounded as TotalIcon,
  VolunteerActivismRounded as DonorIcon,
  PendingRounded as PendingIcon,
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

  usePrivilege('laboratory', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/blood-bank/dashboard",
    {},
    true,
    {
      available: 0,
      reserved: 0,
      cross_matched: 0,
      issued: 0,
      expiring_soon: 0,
      total_units: 0,
      donors: 0,
      pending_transfusions: 0,
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Blood Bank Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "Available Units",
      value: data.available,
      icon: <AvailableIcon />,
      color: green,
      onClick: () => navigate("/blood-bank/units?status=Available"),
    },
    {
      title: "Reserved",
      value: data.reserved,
      icon: <ReservedIcon />,
      color: orange,
      onClick: () => navigate("/blood-bank/units?status=Reserved"),
    },
    {
      title: "Cross-Matched",
      value: data.cross_matched,
      icon: <CrossMatchedIcon />,
      color: indigo,
      onClick: () => navigate("/blood-bank/units?status=Cross-matched"),
    },
    {
      title: "Issued",
      value: data.issued,
      icon: <IssuedIcon />,
      color: blue,
      onClick: () => navigate("/blood-bank/units?status=Issued"),
    },
    {
      title: "Expiring Soon",
      value: data.expiring_soon,
      icon: <ExpiringIcon />,
      color: red,
      onClick: () => navigate("/blood-bank/units?status=Available"),
    },
    {
      title: "Total Units",
      value: data.total_units,
      icon: <TotalIcon />,
      color: purple,
      onClick: () => navigate("/blood-bank/units"),
    },
    {
      title: "Active Donors",
      value: data.donors,
      icon: <DonorIcon />,
      color: blue,
      onClick: () => navigate("/blood-bank/donors"),
    },
    {
      title: "Pending Transfusions",
      value: data.pending_transfusions,
      icon: <PendingIcon />,
      color: orange,
      onClick: () => navigate("/blood-bank/transfusions"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Blood Bank" }]}
    >
      <Card>
        <PageHeader
          title="Blood Bank Dashboard"
          subtitle="Blood inventory and transfusion management"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Blood Unit">
                <IconButton
                  color="primary"
                  onClick={() => navigate("/blood-bank/units?new=1")}
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

          <Card
            variant="outlined"
            sx={{ mt: 3, p: 2, bgcolor: "background.default" }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Tooltip title="Add Blood Unit">
                <IconButton color="primary" onClick={() => navigate("/blood-bank/units?new=1")}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Request Transfusion">
                <IconButton color="secondary" onClick={() => navigate("/blood-bank/transfusions?new=1")}>
                  <PendingIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Card>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Dashboard;

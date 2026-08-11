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
  AcUnitRounded as InStorageIcon,
  LogoutRounded as ReleasedIcon,
  LocalFireDepartmentRounded as CrematedIcon,
  SwapHorizRounded as TransferredIcon,
  Inventory2Rounded as TotalIcon,
  DescriptionRounded as DraftIcon,
  VerifiedRounded as IssuedIcon,
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
    "api/mortuary/dashboard",
    {},
    true,
    {
      in_storage: 0,
      released: 0,
      cremated: 0,
      transferred: 0,
      total_bodies: 0,
      draft_certificates: 0,
      issued_certificates: 0,
      today_admissions: 0,
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Mortuary Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const cards = [
    {
      title: "In Storage",
      value: data.in_storage,
      icon: <InStorageIcon />,
      color: blue,
      onClick: () => navigate("/mortuary/bodies?status=In-Storage"),
    },
    {
      title: "Released",
      value: data.released,
      icon: <ReleasedIcon />,
      color: green,
      onClick: () => navigate("/mortuary/bodies?status=Released"),
    },
    {
      title: "Cremated",
      value: data.cremated,
      icon: <CrematedIcon />,
      color: orange,
      onClick: () => navigate("/mortuary/bodies?status=Cremated"),
    },
    {
      title: "Transferred",
      value: data.transferred,
      icon: <TransferredIcon />,
      color: indigo,
      onClick: () => navigate("/mortuary/bodies?status=Transferred"),
    },
    {
      title: "Total Bodies",
      value: data.total_bodies,
      icon: <TotalIcon />,
      color: purple,
      onClick: () => navigate("/mortuary/bodies"),
    },
    {
      title: "Draft Certificates",
      value: data.draft_certificates,
      icon: <DraftIcon />,
      color: orange,
      onClick: () => navigate("/mortuary/certificates?status=Draft"),
    },
    {
      title: "Issued Certificates",
      value: data.issued_certificates,
      icon: <IssuedIcon />,
      color: green,
      onClick: () => navigate("/mortuary/certificates?status=Issued"),
    },
    {
      title: "Admissions Today",
      value: data.today_admissions,
      icon: <TodayIcon />,
      color: red,
      onClick: () => navigate("/mortuary/bodies"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Mortuary" }]}
    >
      <Card>
        <PageHeader
          title="Mortuary Dashboard"
          subtitle="Body storage and death certificate management"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Admit Body">
                <IconButton
                  color="primary"
                  onClick={() => navigate("/mortuary/bodies?new=1")}
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

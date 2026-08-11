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
  BedRounded as ActiveIcon,
  ReceiptLongRounded as PendingChargesIcon,
  PaymentsRounded as PendingAmountIcon,
  DescriptionRounded as OpenBillsIcon,
  AccountBalanceWalletRounded as BalanceIcon,
  TrendingUpRounded as CollectedTodayIcon,
  EventAvailableRounded as CollectedMonthIcon,
} from "@mui/icons-material";
import { blue, green, indigo, orange, purple, red } from "@mui/material/colors";

import Page, { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('wards', '/dashboard');

  const { data, loading, error, handleFetch } = useFetch(
    "api/inpatient-billing/dashboard",
    {},
    true,
    {
      active_admissions: 0,
      pending_charges: 0,
      pending_amount: 0,
      open_bills: 0,
      open_bills_total: 0,
      open_bills_balance: 0,
      collected_today: 0,
      collected_month: 0,
    },
    (response) => response.data?.data || {}
  );

  useEffect(() => {
    document.title = `Inpatient Billing - ${window.APP_NAME}`;
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
      onClick: () => navigate("/inpatient-billing/charges"),
    },
    {
      title: "Pending Charges",
      value: data.pending_charges,
      icon: <PendingChargesIcon />,
      color: orange,
      onClick: () => navigate("/inpatient-billing/charges?status=Pending"),
    },
    {
      title: "Pending Amount",
      value: formatMoney(data.pending_amount),
      icon: <PendingAmountIcon />,
      color: red,
      onClick: () => navigate("/inpatient-billing/charges?status=Pending"),
    },
    {
      title: "Open Bills",
      value: data.open_bills,
      icon: <OpenBillsIcon />,
      color: indigo,
      onClick: () => navigate("/inpatient-billing/bills?status=Open"),
    },
    {
      title: "Outstanding Balance",
      value: formatMoney(data.open_bills_balance),
      icon: <BalanceIcon />,
      color: red,
      onClick: () => navigate("/inpatient-billing/bills"),
    },
    {
      title: "Collected Today",
      value: formatMoney(data.collected_today),
      icon: <CollectedTodayIcon />,
      color: green,
      onClick: () => navigate("/inpatient-billing/bills"),
    },
    {
      title: "Collected This Month",
      value: formatMoney(data.collected_month),
      icon: <CollectedMonthIcon />,
      color: purple,
      onClick: () => navigate("/inpatient-billing/bills"),
    },
    {
      title: "Open Bills Value",
      value: formatMoney(data.open_bills_total),
      icon: <OpenBillsIcon />,
      color: blue,
      onClick: () => navigate("/inpatient-billing/bills?status=Partial"),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Inpatient Billing" }]}
    >
      <Card>
        <PageHeader
          title="Inpatient Billing"
          subtitle="Bed-day accruals, charges and bill management"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Charge">
                <IconButton
                  color="primary"
                  onClick={() => navigate("/inpatient-billing/charges?new=1")}
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

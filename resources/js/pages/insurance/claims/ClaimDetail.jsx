import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
} from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Table from "../../../components/Table";
import Descriptions from "../../../components/Descriptions";
import ClaimAction from "./ClaimAction";

import { formatError, numberFormat } from "../../../helpers";
import { useFetch, useToast } from "../../../hooks";

const STATUS_COLORS = {
  Draft: "default",
  Submitted: "info",
  Approved: "success",
  Rejected: "error",
  Paid: "primary",
};

const ClaimDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { claimId } = useParams();

  const modalRef = useRef();

  const {
    data: claim,
    loading: loadingClaim,
    error,
    handleFetch: fetchClaim,
  } = useFetch(
    `api/insurance-claim/${claimId}`,
    null,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (!claimId) {
      return navigate("/insurance/claims");
    }

    document.title = `Claim ${claim?.claim_no || ""} - ${window.APP_NAME}`;
  }, [claimId, claim?.claim_no]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openAction = (action) => {
    let component = (
      <ClaimAction
        claim={claim}
        action={action}
        modal={modalRef.current}
        fetchClaim={fetchClaim}
      />
    );

    modalRef.current.open("Claim Action", component, "sm");
  };

  const getTotal = () => {
    return (claim?.items || []).reduce(
      (acc, e) => acc + (parseFloat(e.amount) || 0),
      0
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Claims" },
        { title: claim?.claim_no || claimId },
      ]}
    >
      {loadingClaim ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {claim ? (
        <Card>
          <PageHeader
            title={`Claim ${claim.claim_no}`}
            trailing={
              claim.status === "Draft" ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => openAction("submit")}
                >
                  Submit Claim
                </Button>
              ) : claim.status === "Submitted" ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => openAction("reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => openAction("approve")}
                  >
                    Approve
                  </Button>
                </Stack>
              ) : claim.status === "Approved" ? (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => openAction("pay")}
                >
                  Record Payment
                </Button>
              ) : null
            }
          />
          <Divider />
          <CardContent>
            <Descriptions
              columns={4}
              items={[
                { label: "Claim No", value: claim.claim_no },
                { label: "Service Date", value: claim.service_date },
                {
                  label: "Insurance Company",
                  value: claim.insurance_company?.name,
                },
                {
                  label: "Status",
                  value: (
                    <Chip
                      size="small"
                      color={STATUS_COLORS[claim.status] || "default"}
                      label={claim.status || "-"}
                    />
                  ),
                },
                {
                  label: "Claim Amount",
                  value: numberFormat(claim.claim_amount || 0),
                },
                {
                  label: "Approved Amount",
                  value: numberFormat(claim.approved_amount || 0),
                },
                {
                  label: "Paid Amount",
                  value: numberFormat(claim.paid_amount || 0),
                },
                {
                  label: "Created By",
                  value: claim.creator?.full_name,
                },
                {
                  label: "Submitted By",
                  value: claim.submittedBy?.full_name,
                },
                {
                  label: "Submitted At",
                  value: claim.submitted_at,
                },
                {
                  label: "Approved By",
                  value: claim.approvedBy?.full_name,
                },
                {
                  label: "Approved At",
                  value: claim.approved_at,
                },
                {
                  label: "Paid By",
                  value: claim.paidBy?.full_name,
                },
                {
                  label: "Paid At",
                  value: claim.paid_at,
                },
              ]}
              containerProps={{
                variant: "outlined",
                sx: {
                  mb: 2,
                  p: 2,
                },
              }}
              itemSpacing={1}
            />

            {claim.reject_reason ? (
              <Card
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <strong>Reject Reason:</strong> {claim.reject_reason}
              </Card>
            ) : null}

            <Card variant="outlined">
              <CardHeader
                title={`Claim Items (${(claim.items || []).length})`}
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
              />
              <Divider />
              <CardContent>
                <Table
                  loading={loadingClaim}
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    {
                      field: "item_name",
                      headerName: "Item Name",
                      valueGetter: (item, index) => item.item_name || "-",
                    },
                    {
                      field: "quantity",
                      headerName: "Quantity",
                      valueGetter: (item, index) => numberFormat(item.quantity || 0),
                    },
                    {
                      field: "unit_price",
                      headerName: "Unit Price",
                      valueGetter: (item, index) => numberFormat(item.unit_price || 0),
                    },
                    {
                      field: "amount",
                      headerName: "Amount",
                      valueGetter: (item, index) => numberFormat(item.amount || 0),
                    },
                  ]}
                  items={claim.items || []}
                  hidePaginationFooter
                  footerItems={[
                    [
                      { value: "TOTAL", tableCellProps: { colSpan: 4 } },
                      { value: numberFormat(getTotal() || 0) },
                    ],
                  ]}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ClaimDetail;

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CardActions,
  CardContent,
  Divider,
  LinearProgress,
} from "@mui/material";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { usePost, useToast } from "../../../hooks";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const ClaimAction = ({ claim, action, modal, fetchClaim }) => {
  const addToast = useToast();
  const amountRef = useRef();
  const reasonRef = useRef();

  const [amount, setAmount] = useState(() => {
    if (action === "approve") return claim.approved_amount ?? claim.claim_amount;
    if (action === "pay") return claim.paid_amount ?? claim.approved_amount ?? claim.claim_amount;
    return undefined;
  });
  const [reason, setReason] = useState("");

  const endpoint =
    action === "submit"
      ? `api/insurance-claim/${claim.id}/submit`
      : action === "approve"
      ? `api/insurance-claim/${claim.id}/approve`
      : action === "reject"
      ? `api/insurance-claim/${claim.id}/reject`
      : `api/insurance-claim/${claim.id}/pay`;

  const payload = {
    ...(action === "approve" || action === "pay" ? { [action === "approve" ? "approved_amount" : "paid_amount"]: amount } : {}),
    ...(action === "reject" ? { reject_reason: reason } : {}),
  };

  const { data, loading, error, handlePost } = usePost(endpoint, payload);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchClaim();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getTitle = () => {
    switch (action) {
      case "submit":
        return "Submit Claim";
      case "approve":
        return "Approve Claim";
      case "reject":
        return "Reject Claim";
      case "pay":
        return "Record Payment";
      default:
        return "";
    }
  };

  const getMessage = () => {
    switch (action) {
      case "submit":
        return "Are you sure you want to submit this claim to the insurer? It will be locked from further edits.";
      case "approve":
        return "Are you sure you want to approve this claim?";
      case "reject":
        return "Are you sure you want to reject this claim?";
      case "pay":
        return "Record the payment received for this claim?";
      default:
        return "";
    }
  };

  const handleSubmit = () => {
    if (action === "submit") {
      let component = (
        <ConfirmationDialog
          message={getMessage()}
          onCancel={() => modal.close()}
          onOk={() => {
            modal.close();
            handlePost(endpoint, payload);
          }}
        />
      );

      modal.open("Submit Claim", component, "sm");
      return;
    }

    if (action === "approve" || action === "pay") {
      if (amountRef.current && !amountRef.current.validate()) {
        return;
      }
    }

    if (action === "reject" && reasonRef.current && !reasonRef.current.validate()) {
      return;
    }

    let component = (
      <ConfirmationDialog
        message={getMessage()}
        onCancel={() => modal.close()}
        onOk={() => {
          modal.close();
          handlePost(endpoint, payload);
        }}
      />
    );

    modal.open(getTitle(), component, "sm");
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        {action === "approve" || action === "pay" ? (
          <TextField
            ref={amountRef}
            label={
              action === "approve"
                ? "Approved Amount (TZS) *"
                : "Paid Amount (TZS) *"
            }
            fullWidth
            required
            type="number"
            value={amount}
            rules={[
              validationRules.number,
              (value) => value >= 0 || "Amount cannot be negative.",
            ]}
            onChange={(value) => setAmount(value)}
          />
        ) : null}
        {action === "reject" ? (
          <TextField
            ref={reasonRef}
            label="Reject Reason *"
            fullWidth
            required
            multiline
            rows={4}
            rules={[validationRules.required]}
            value={reason}
            onChange={(value) => setReason(value)}
          />
        ) : null}
        {action === "submit" ? (
          <span>Submitting this claim will send it to the insurer for review.</span>
        ) : null}
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => modal.close()}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Saving..." : getTitle()}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default ClaimAction;

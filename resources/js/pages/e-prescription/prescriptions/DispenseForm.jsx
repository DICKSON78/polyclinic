import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import TextField from "../../../components/TextField";

import { useToast } from "../../../hooks";
import { validateInteger } from "../../../helpers";

const DispenseForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const [dispense, setDispense] = useState({});

  useEffect(() => {
    const initial = {};
    (item?.items || []).forEach((prescriptionItem) => {
      initial[prescriptionItem.id] = {
        dispensed_qty: "0",
      };
    });
    setDispense(initial);
  }, [item]);

  const pendingItems = (item?.items || []).filter(
    (prescriptionItem) => prescriptionItem.status !== "Dispensed"
  );

  const handleChange = (id) => (value) => {
    setDispense((prev) => ({
      ...prev,
      [id]: { dispensed_qty: value },
    }));
  };

  const remaining = (prescriptionItem) => {
    return Math.max(0, Number(prescriptionItem.quantity) - Number(prescriptionItem.dispensed_qty || 0));
  };

  const handleSubmit = () => {
    if (pendingItems.length === 0) {
      return;
    }
    const payload = pendingItems.map((prescriptionItem) => {
      const qty = Math.max(0, Number(dispense[prescriptionItem.id]?.dispensed_qty || 0));
      return {
        id: prescriptionItem.id,
        dispensed_qty: qty,
      };
    });

    onSuccess(payload);
  };

  if (!item) {
    return null;
  }

  return (
    <React.Fragment>
      <CardContent>
        {pendingItems.length === 0 ? (
          <Typography color="text.secondary">
            All items on this prescription are already dispensed.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {pendingItems.map((prescriptionItem) => (
              <Box key={prescriptionItem.id}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {prescriptionItem.medicine_name || prescriptionItem.medicine?.name || "Medicine"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {prescriptionItem.dosage ? `${prescriptionItem.dosage} • ` : ""}
                  {prescriptionItem.frequency ? `${prescriptionItem.frequency} • ` : ""}
                  {prescriptionItem.duration ? `${prescriptionItem.duration} days • ` : ""}
                  Qty: {prescriptionItem.quantity} {prescriptionItem.unit || ""}
                  {remaining(prescriptionItem) > 0
                    ? ` • Remaining: ${remaining(prescriptionItem)}`
                    : ""}
                </Typography>
                <TextField
                  label="Quantity to Dispense"
                  fullWidth
                  valueFilter={validateInteger}
                  value={dispense[prescriptionItem.id]?.dispensed_qty || ""}
                  onChange={handleChange(prescriptionItem.id)}
                />
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
      {pendingItems.length > 0 && (
        <CardActions>
          <Stack direction="row" spacing={1} justifyContent="flex-end" width="100%">
            <Button color="inherit" onClick={() => modal.close()}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Save Dispensing
            </Button>
          </Stack>
        </CardActions>
      )}
    </React.Fragment>
  );
};

export default DispenseForm;

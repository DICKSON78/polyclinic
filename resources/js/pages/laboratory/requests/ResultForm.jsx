import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import TextField from "../../../components/TextField";

import { useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const ResultForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const [results, setResults] = useState({});
  const [error, setError] = useState();

  useEffect(() => {
    const initial = {};
    (item?.tests || []).forEach((test) => {
      initial[test.id] = {
        result: test.result || "",
        is_abnormal: test.is_abnormal || false,
        interpretation: test.interpretation || "",
      };
    });
    setResults(initial);
  }, [item]);

  const pendingTests = (item?.tests || []).filter(
    (t) => t.status === "Pending" || t.status === "Collected"
  );

  const handleChange = (testId, key) => (value) => {
    setResults((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], [key]: value },
    }));
  };

  const handleSubmit = () => {
    if (pendingTests.length === 0) {
      return;
    }
    const payload = pendingTests.map((test) => ({
      id: test.id,
      result: results[test.id]?.result || null,
      is_abnormal: results[test.id]?.is_abnormal || false,
      interpretation: results[test.id]?.interpretation || null,
    }));

    onSuccess(payload);
    setError(null);
  };

  if (!item) {
    return null;
  }

  return (
    <React.Fragment>
      <CardContent>
        {pendingTests.length === 0 ? (
          <Typography color="text.secondary">
            All tests on this request already have results.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {pendingTests.map((test) => (
              <Box key={test.id}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {test.lab_test?.name || "Test"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {test.reference_range ? `Reference: ${test.reference_range} ${test.unit || ""}` : ""}
                </Typography>
                <TextField
                  label="Result"
                  fullWidth
                  value={results[test.id]?.result || ""}
                  onChange={handleChange(test.id, "result")}
                />
                <TextField
                  label="Interpretation / Comments"
                  fullWidth
                  multiline
                  minRows={2}
                  value={results[test.id]?.interpretation || ""}
                  onChange={handleChange(test.id, "interpretation")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={results[test.id]?.is_abnormal || false}
                      onChange={(e) => handleChange(test.id, "is_abnormal")(e.target.checked)}
                    />
                  }
                  label="Mark as abnormal"
                />
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
      {pendingTests.length > 0 && (
        <CardActions>
          <Stack direction="row" spacing={1} justifyContent="flex-end" width="100%">
            <Button color="inherit" onClick={() => modal.close()}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Save Results
            </Button>
          </Stack>
        </CardActions>
      )}
    </React.Fragment>
  );
};

export default ResultForm;

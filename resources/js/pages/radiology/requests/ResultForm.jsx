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
import { formatError } from "../../../helpers";

const ResultForm = ({ item, modal, onSuccess }) => {
  const addToast = useToast();

  const [results, setResults] = useState({});
  const [error, setError] = useState();

  useEffect(() => {
    const initial = {};
    (item?.exams || []).forEach((exam) => {
      initial[exam.id] = {
        findings: exam.findings || "",
        impression: exam.impression || "",
        conclusion: exam.conclusion || "",
      };
    });
    setResults(initial);
  }, [item]);

  const pendingExams = (item?.exams || []).filter(
    (e) => e.status === "Pending" || e.status === "Performed"
  );

  const handleChange = (examId, key) => (value) => {
    setResults((prev) => ({
      ...prev,
      [examId]: { ...prev[examId], [key]: value },
    }));
  };

  const handleSubmit = () => {
    if (pendingExams.length === 0) {
      return;
    }
    const payload = pendingExams.map((exam) => ({
      id: exam.id,
      findings: results[exam.id]?.findings || null,
      impression: results[exam.id]?.impression || null,
      conclusion: results[exam.id]?.conclusion || null,
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
        {pendingExams.length === 0 ? (
          <Typography color="text.secondary">
            All exams on this request already have results.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {pendingExams.map((exam) => (
              <Box key={exam.id}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {exam.radiology_exam?.name || "Exam"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {exam.radiology_exam?.category || ""}
                  {exam.radiology_exam?.preparation
                    ? ` • Prep: ${exam.radiology_exam.preparation}`
                    : ""}
                </Typography>
                <TextField
                  label="Findings"
                  fullWidth
                  multiline
                  minRows={2}
                  value={results[exam.id]?.findings || ""}
                  onChange={handleChange(exam.id, "findings")}
                />
                <TextField
                  label="Impression"
                  fullWidth
                  multiline
                  minRows={2}
                  value={results[exam.id]?.impression || ""}
                  onChange={handleChange(exam.id, "impression")}
                />
                <TextField
                  label="Conclusion"
                  fullWidth
                  multiline
                  minRows={2}
                  value={results[exam.id]?.conclusion || ""}
                  onChange={handleChange(exam.id, "conclusion")}
                />
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
      {pendingExams.length > 0 && (
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

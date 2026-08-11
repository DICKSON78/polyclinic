import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  EditNoteRounded as ResultsIcon,
  RefreshRounded as RefreshIcon,
  VisibilityRounded as ViewIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const Results = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  usePrivilege('radiology', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "In Progress",
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/radiology/requests",
    params,
    true,
    { data: [], total: 0, current_page: 1, per_page: 25 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `Radiology Results Entry - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const priorityColor = (p) => {
    if (p === "Stat") return "error";
    if (p === "Urgent") return "warning";
    return "default";
  };

  const completedExams = (item) =>
    item.exams?.filter((e) => e.status === "Completed").length || 0;

  return (
    <Page
      breadcrumbs={[
        { title: "Radiology" },
        { title: "Results Entry" },
      ]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Results Entry"
          subtitle="Requests awaiting results (exams performed)"
          trailing={
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : data.data.length === 0 ? (
            <Stack alignItems="center" py={4}>
              <ResultsIcon color="disabled" fontSize="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                No requests awaiting results.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1}>
              {data.data.map((item) => (
                <Card key={item.id} square variant="outlined">
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
                      <Stack flexGrow={1}>
                        <Typography variant="body1" fontWeight={600}>
                          {item.request_no}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.patient?.full_name || "—"} •{" "}
                          {completedExams(item)}/{item.exams?.length || 0} results entered
                        </Typography>
                      </Stack>
                      <Chip
                        label={item.priority || "Routine"}
                        size="small"
                        color={priorityColor(item.priority)}
                        variant="outlined"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ResultsIcon />}
                        onClick={() => navigate(`/radiology/requests/${item.id}`)}
                      >
                        Enter Results
                      </Button>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => navigate(`/radiology/requests/${item.id}`)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default Results;

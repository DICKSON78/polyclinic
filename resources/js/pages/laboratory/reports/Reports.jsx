import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  PrintRounded as PrintIcon,
  RefreshRounded as RefreshIcon,
  DescriptionRounded as ReportIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";

import { useFetch, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getAge } from "../../../helpers";

const printStyles = `
@media print {
  body * { visibility: hidden; }
  .lab-report-print, .lab-report-print * { visibility: visible; }
  .lab-report-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    box-shadow: none !important;
  }
}
`;

const ReportView = ({ item }) => {
  const patient = item.patient || {};

  const abnormalCount = (item.tests || []).filter((t) => t.is_abnormal).length;

  return (
    <Stack spacing={1.5} className="lab-report-print">
      <Stack alignItems="center" spacing={0.5}>
        <Typography variant="h6" fontWeight={700}>
          {window.APP_NAME}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          LABORATORY REPORT
        </Typography>
      </Stack>
      <Divider />
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
          <Typography variant="body1" fontWeight={500}>{patient.full_name || "—"}</Typography>
          <Typography variant="body2" color="text.secondary">
            Age: {getAge(patient.date_of_birth) || "—"} • Gender: {patient.gender || "—"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">Request No.</Typography>
          <Typography variant="body1" fontWeight={500}>{item.request_no}</Typography>
          <Typography variant="body2" color="text.secondary">
            Priority: {item.priority || "Routine"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">Requested By</Typography>
          <Typography variant="body1" fontWeight={500}>
            {item.requested_by?.full_name || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(item.created_at).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">Sample Collected</Typography>
          <Typography variant="body1" fontWeight={500}>
            {item.sample_collected_at ? new Date(item.sample_collected_at).toLocaleString() : "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.sample_collected_by ? `by ${item.sample_collected_by.full_name}` : ""}
          </Typography>
        </Grid>
      </Grid>

      {(item.tests || []).map((test) => (
        <Card key={test.id} square variant="outlined">
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
              <Box flexGrow={1}>
                <Typography variant="body1" fontWeight={500}>
                  {test.lab_test?.name || "Test"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {test.lab_test?.code || ""}
                  {test.reference_range ? ` • Ref: ${test.reference_range} ${test.unit || ""}` : ""}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <b>Result:</b> {test.result || "—"} {test.unit || ""}
                </Typography>
                {test.interpretation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <b>Interpretation:</b> {test.interpretation}
                  </Typography>
                )}
              </Box>
              {test.is_abnormal && (
                <Chip label="Abnormal" size="small" color="error" />
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}

      {abnormalCount > 0 && (
        <Typography variant="body2" color="error">
          Note: {abnormalCount} abnormal result{abnormalCount > 1 ? "s" : ""} flagged.
        </Typography>
      )}

      <Divider />
      <Typography variant="body2" color="text.secondary" align="center">
        Completed {item.completed_at ? new Date(item.completed_at).toLocaleString() : "—"}
        {item.completed_by ? ` by ${item.completed_by.full_name}` : ""}
      </Typography>
    </Stack>
  );
};

const Reports = () => {
  const addToast = useToast();
  const modalRef = useRef();

  usePrivilege('laboratory', '/dashboard');

  const [activeReport, setActiveReport] = useState(null);

  const { data, loading, error, handleFetch } = useFetch(
    "api/laboratory/requests",
    { page: 1, per_page: 50, status: "Completed" },
    true,
    { data: [], total: 0 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
      };
    }
  );

  useEffect(() => {
    document.title = `Lab Reports - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openReport = (item) => {
    setActiveReport(item);
    modalRef.current.open(
      "Laboratory Report",
      <Stack spacing={1.5}>
        <ReportView item={item} />
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </Stack>
      </Stack>,
      "md"
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Laboratory" },
        { title: "Lab Reports" },
      ]}
    >
      <style>{printStyles}</style>
      <Card square variant="outlined">
        <PageHeader
          title="Lab Reports"
          subtitle="Completed laboratory reports"
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
              <ReportIcon color="disabled" fontSize="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                No completed reports yet.
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
                          {item.patient?.full_name || "—"} • {item.tests?.length || 0} tests • Completed{" "}
                          {item.completed_at ? new Date(item.completed_at).toLocaleString() : "—"}
                        </Typography>
                      </Stack>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ReportIcon />}
                        onClick={() => openReport(item)}
                      >
                        View Report
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Reports;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Table from "../../../components/Table";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Refraction from "./Refraction";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationError,
  numberFormat,
} from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
      variant="elevation"
      sx={{
        bgcolor: "info.main",
        my: 2,
        ...sx,
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="500"
        px={2}
        py={1}
        color="info.contrastText"
      >
        {title}
      </Typography>
    </Paper>
  );
};

// Read-only field display component
const ReadOnlyField = ({ label, value, multiline = false }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" fontWeight="500">
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        mt: 0.5,
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        minHeight: multiline ? 60 : 'auto',
        p: 1,
        bgcolor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

const ClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      consultation_id: consultation.id,
      consultation_type: "Glass",
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: dataDispense,
    loading: loadingDispense,
    error: errorDispense,
    handlePost: handleDispense,
  } = usePost();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataDispense) {
      setData(dataDispense);

      window.setTimeout(() => {
        navigate("/optician-center/glass-patients");
      }, 1500);
    }
  }, [dataDispense]);

  useEffect(() => {
    if (errorDispense) {
      setError(errorDispense);
    }
  }, [errorDispense]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const confirmDispense = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDispense("api/patient-payment-cache-items/dispense", {
            payment_cache_id: consultation.payment_cache_item.payment_cache_id,
            items: selectedItems.map((e) => e.id),
          });
        }}
      />
    );

    modalRef.current.open("Confirm Dispense", component, "sm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Not Paid";
      case "Served":
        return "Dispensed";
    }

    return status;
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader
          title="Clinical Notes"
          trailing={
            <PatientFilePDF
              consultationId={consultation.id}
              patient={patient}
            />
          }
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent>
            {/* History Taking removed for workshop clinical notes */}

            {/* Diagnosis - Read-only display */}
            {consultation.diagnoses && consultation.diagnoses.length > 0 && (
              <>
                <Subheader title="Diagnosis" />
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {consultation.diagnoses.map((diagnosis, index) => (
                      <Chip
                        key={index}
                        label={`${diagnosis.disease?.name || 'Unknown'} ${diagnosis.disease?.code ? `(${diagnosis.disease.code})` : ''}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            <Subheader title="Examination Details" />
            <Refraction consultation={consultation} />

            {/* Recommendations & Remarks */}
            <Subheader title="Doctor's Notes" />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ReadOnlyField
                  label="Doctor Recommendations"
                  value={consultation.doctor_recommendations}
                  multiline
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ReadOnlyField
                  label="Remarks"
                  value={consultation.doctor_comments_remarks}
                  multiline
                />
              </Grid>
            </Grid>

            <Subheader title="Management" />
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_id",
                  headerName: "Item Name",
                  valueGetter: (item, index) => item.item.name,
                },
                {
                  field: "unit_of_measure_id",
                  headerName: "UoM",
                  valueGetter: (item, index) => item.item.unit_of_measure?.name,
                },
                {
                  field: "balance",
                  headerName: "Item Balance",
                  valueGetter: (item, index) =>
                    numberFormat(item.item.balance || 0),
                },
                {
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => item.payment_mode.name,
                },
                {
                  field: "quantity",
                  headerName: "Quantity",
                  valueGetter: (item, index) =>
                    numberFormat(item.quantity || 0),
                },
                {
                  field: "comments",
                  headerName: "Comments",
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item, index) => (
                    <Chip
                      size="small"
                      color={getStatusColor(item.status)}
                      label={getStatusLabel(item.status)}
                    />
                  ),
                },
              ]}
              items={items}
              hidePaginationFooter
              checkboxSelection={(item, index) =>
                item.status === "Paid" || item.status === "Billed" || item.status === "Pending"
              }
              checked={selectedItems}
              setChecked={setSelectedItems}
            />

            {/* Lens Types Display */}
            {consultation.lens_types && (
              <Box sx={{ mb: 2 }}>
                <Subheader title="Item Selection" />
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(typeof consultation.lens_types === 'string'
                      ? JSON.parse(consultation.lens_types)
                      : Array.isArray(consultation.lens_types)
                        ? consultation.lens_types
                        : []
                    ).map((lensType, index) => (
                      <Chip
                        key={index}
                        label={lensType}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}
          </CardContent>
        </Form>
        <Divider />
        {loadingDispense && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loadingDispense}
            variant="contained"
            onClick={confirmDispense}
          >
            Dispense
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;

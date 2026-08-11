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

import { Header as PageHeader } from "../../../../components/Page";
import Modal from "../../../../components/Modal";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import Refraction from "./Refraction";
import ConsultationItemsCard from "../../../consultation-room/clinical-notes/ConsultationItemsCard";
import SelectItems from "../../../consultation-room/clinical-notes/SelectItems";
import PatientFilePDF from "../../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, useToast } from "../../../../hooks";
import { formatError, getValidationError } from "../../../../helpers";

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

const ClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const refractionRef = useRef();
  const remarksRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState(consultation);

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
    },
    false,
    [],
    (response) => {
      // Safely extract data with fallback
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );

  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataSendToOptician,
    loading: loadingSendToOptician,
    error: errorSendToOptician,
    handlePatch: handleSendToOptician,
  } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataSendToOptician) {
      setData(dataSendToOptician);

      window.setTimeout(() => {
        navigate("/sales-management/glass-patients");
      }, 1500);
    }
  }, [dataSendToOptician]);

  useEffect(() => {
    if (errorSendToOptician) {
      setError(errorSendToOptician);
      // Show error message if unauthorized
      if (errorSendToOptician?.response?.status === 403) {
        addToast({
          message: errorSendToOptician?.response?.data?.message || "Only cashiers are authorized to send clients to the cashier.",
          severity: "error",
        });
      }
    }
  }, [errorSendToOptician, addToast]);

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

  const autoSave = (field, value) => {
    if (value !== consultation[field]) {
      handleAutoSave(
        `api/consultations/${consultation.id}/auto-save-clinical-notes`,
        {
          what: "Consultation",
          [field]: value,
        }
      );
    }
  };

  const openSelectItemsModal = (title, type) => {
    console.log('Opening SelectItems modal:', { title, type, consultation, items });
    
    let component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={Array.isArray(items) ? items.filter((e) => e.consultation_type?.name === type) : []}
        fetchItems={fetchItems}
      />
    );

    console.log('Modal ref:', modalRef.current);
    console.log('Calling modal.open...');
    modalRef.current.open(title, component, "lg");
  };

  const confirmSendToCashier = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to send this patient to the cashier?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleSendToOptician(`api/consultations/${consultation.id}`, {
            send_to_optician: "Yes",
            ...formData,
            refraction: refractionRef.current.getFormData(),
          });
        }}
      />
    );

    modalRef.current.open("Confirm Send to Cashier", component, "sm");
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
            <Subheader
              title="Examination Details"
              sx={{ mt: 0 }}
            />
            <Refraction
              ref={refractionRef}
              consultation={consultation}
            />

            <Subheader title="Management" />
            <Grid
              container
              spacing={2}
              sx={{ width: '100%', maxWidth: '100%' }}
            >
              <Grid
                item
                md={6}
                lg={6}
                xl={6}
                sm={12}
                xs={12}
                sx={{ width: '100%' }}
              >
                <ConsultationItemsCard
                  title="Dispensing"
                  consultationType="Glass"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
                />
              </Grid>
              <Grid
                item
                md={6}
                lg={6}
                xl={6}
                sm={12}
                xs={12}
                sx={{ width: '100%' }}
              >
                <ConsultationItemsCard
                  title="Others"
                  consultationType="Others"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
                />
              </Grid>
            </Grid>

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

            {/* Doctor Recommendations - Show recommendations instead of remarks (remarks is exclusive to doctor) */}
            <Subheader title="Doctor Recommendations" />
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.200',
              minHeight: 100
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {consultation.doctor_comments_remarks || 'No recommendations provided'}
              </Typography>
            </Box>
          </CardContent>
        </Form>
        <Divider />
        {loadingSendToOptician && <LinearProgress />}
        {/* Only show "Send to Cashier" button if user has payment_center privilege (cashier) */}
        {window.user?.privileges?.payment_center && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loadingSendToOptician}
            variant="contained"
            onClick={confirmSendToCashier}
          >
            Send to Cashier
          </Button>
        </Stack>
        )}
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;

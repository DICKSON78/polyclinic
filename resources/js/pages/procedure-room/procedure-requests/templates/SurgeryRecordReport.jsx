import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Radio,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

import { Header as PageHeader } from "../../../../components/Page";
import Modal from "../../../../components/Modal";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import SurgeryRecordReportPDF from "../../../patient-records/patient-file/SurgeryRecordReportPDF";

import { usePost, useToast } from "../../../../hooks";
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

const SurgeryRecordReport = ({ patient, paymentCacheitem }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const unaidedReVaRef = useRef();
  const unaidedLeVaRef = useRef();
  const aidedReVaRef = useRef();
  const aidedLeVaRef = useRef();
  const surgeonRef = useRef();
  const assistantSurgeonRef = useRef();
  const scrubNurseRef = useRef();
  const operationTypeRef = useRef();
  const intraoperativeNotesRef = useRef();
  const postoperativeManagementRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    payment_cache_item_id: paymentCacheitem.id,
  });

  const {
    data: dataFetch,
    setData: setDataFetch,
    loading: loadingFetch,
    error: errorFetch,
    handlePost: handleFetch,
  } = usePost("api/surgery-record-reports", {
    payment_cache_item_id: paymentCacheitem.id,
  });

  const { handlePost: handleAutoSave } = usePost();

  const {
    data: dataComplete,
    loading: loadingComplete,
    error: errorComplete,
    handlePost: handleComplete,
  } = usePost("api/surgery-record-reports", { ...formData, status: "Saved" });

  useEffect(() => {
    document.title = `Surgery Record Report - ${window.APP_NAME}`;
    handleFetch();
  }, []);

  useEffect(() => {
    if (dataFetch) {
      setFormData({ ...formData, ...dataFetch.data });
    }
  }, [dataFetch]);

  useEffect(() => {
    if (dataComplete) {
      setData(dataComplete);

      window.setTimeout(() => {
        navigate(
          `/procedure-room/procedure-requests/${patient.id}/${paymentCacheitem.payment_cache_id}`
        );
      }, 1000);
    }
  }, [dataComplete]);

  useEffect(() => {
    if (errorFetch) {
      setError(errorFetch);
    }
  }, [errorFetch]);

  useEffect(() => {
    if (errorComplete) {
      setError(errorComplete);
    }
  }, [errorComplete]);

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
    if (value !== formData[field]) {
      handleAutoSave("api/surgery-record-reports", {
        payment_cache_item_id: paymentCacheitem.id,
        [field]: value,
      });
    }
  };

  const confirmComplete = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleComplete();
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader
          title="Surgery Record Report"
          trailing={
            formData ? (
              <SurgeryRecordReportPDF
                surgeryRecordReportId={formData.id}
                patient={patient}
              />
            ) : null
          }
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent
            sx={{
              ".table-wrapper": {
                minWidth: 300,
                overflowX: "auto",
              },
            }}
          >
            {loadingFetch ? (
              <Skeleton
                variant="rounded"
                height={512}
              />
            ) : null}
            {formData ? (
              <React.Fragment>
                <Subheader
                  title="Preoperative"
                  sx={{ mt: 0 }}
                />

                <Box className="table-wrapper">
                  <Table className="no-hover-highlight">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th">Clinical Assessment</TableCell>
                        <TableCell>RE</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <TextField
                              ref={unaidedReVaRef}
                              fullWidth
                              value={formData.unaided_re_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  unaided_re_va: value,
                                });
                                autoSave("unaided_re_va", value);
                              }}
                              containerProps={{
                                width: 72,
                              }}
                            />
                            <Typography variant="body2">
                              {"With Pinhole"}
                            </Typography>
                            <TextField
                              ref={aidedReVaRef}
                              fullWidth
                              value={formData.aided_re_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  aided_re_va: value,
                                });
                                autoSave("aided_re_va", value);
                              }}
                              containerProps={{
                                width: 72,
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>RE</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <TextField
                              ref={unaidedLeVaRef}
                              fullWidth
                              value={formData.unaided_le_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  unaided_le_va: value,
                                });
                                autoSave("unaided_le_va", value);
                              }}
                              containerProps={{
                                width: 72,
                              }}
                            />
                            <Typography variant="body2">
                              {"With Pinhole"}
                            </Typography>
                            <TextField
                              ref={aidedLeVaRef}
                              fullWidth
                              value={formData.aided_le_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  aided_le_va: value,
                                });
                                autoSave("aided_le_va", value);
                              }}
                              containerProps={{
                                width: 72,
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Name of Surgeon</TableCell>
                        <TableCell colSpan={2}>
                          <TextField
                            ref={surgeonRef}
                            fullWidth
                            value={formData.surgeon || ""}
                            onChange={(value) => {
                              setFormData({ ...formData, surgeon: value });
                              autoSave("surgeon", value);
                            }}
                          />
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">
                          Name of Assistant Surgeon
                        </TableCell>
                        <TableCell colSpan={2}>
                          <TextField
                            ref={assistantSurgeonRef}
                            fullWidth
                            value={formData.assistant_surgeon || ""}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                assistant_surgeon: value,
                              });
                              autoSave("assistant_surgeon", value);
                            }}
                          />
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">
                          Name of Scrub Nurse
                        </TableCell>
                        <TableCell colSpan={2}>
                          <TextField
                            ref={scrubNurseRef}
                            fullWidth
                            value={formData.scrub_nurse || ""}
                            onChange={(value) => {
                              setFormData({ ...formData, scrub_nurse: value });
                              autoSave("scrub_nurse", value);
                            }}
                          />
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>

                <Subheader title="Clinical Data" />

                <Box className="table-wrapper">
                  <Table className="no-hover-highlight">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th">Type of Operation</TableCell>
                        <TableCell>
                          <TextField
                            ref={operationTypeRef}
                            fullWidth
                            value={formData.operation_type || ""}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                operation_type: value,
                              });
                              autoSave("operation_type", value);
                            }}
                          />
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">
                          Type of Anaesthesia
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                          >
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={formData.anaesthesia_type === "GA"}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      anaesthesia_type: "GA",
                                    });
                                    autoSave("anaesthesia_type", "GA");
                                  }}
                                />
                              }
                              label="GA"
                            />
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={formData.anaesthesia_type === "LA"}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      anaesthesia_type: "LA",
                                    });
                                    autoSave("anaesthesia_type", "LA");
                                  }}
                                />
                              }
                              label="LA"
                            />
                          </Stack>
                        </TableCell>
                        <TableCell component="th">Eye to be Operated</TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                          >
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={formData.operated_eye === "RE"}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      operated_eye: "RE",
                                    });
                                    autoSave("operated_eye", "RE");
                                  }}
                                />
                              }
                              label="RE"
                            />
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={formData.operated_eye === "LE"}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      operated_eye: "LE",
                                    });
                                    autoSave("operated_eye", "LE");
                                  }}
                                />
                              }
                              label="LE"
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>

                <Subheader title="Preoperative Notes" />

                <TextField
                  ref={intraoperativeNotesRef}
                  fullWidth
                  multiline
                  rows={3}
                  horizontal
                  value={formData.intraoperative_notes || ""}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      intraoperative_notes: value,
                    });
                    autoSave("intraoperative_notes", value);
                  }}
                />

                <Subheader title="Postoperative Management" />

                <TextField
                  ref={postoperativeManagementRef}
                  fullWidth
                  multiline
                  rows={3}
                  horizontal
                  value={formData.postoperative_management || ""}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      postoperative_management: value,
                    });
                    autoSave("postoperative_management", value);
                  }}
                />
              </React.Fragment>
            ) : null}
          </CardContent>
        </Form>
        {formData?.status === "Draft" ? (
          <React.Fragment>
            <Divider />
            {loadingComplete && <LinearProgress />}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              p={2}
            >
              <Button
                disabled={loadingComplete}
                variant="contained"
                onClick={confirmComplete}
              >
                Save Notes
              </Button>
            </Stack>
          </React.Fragment>
        ) : null}
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default SurgeryRecordReport;

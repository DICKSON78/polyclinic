import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Radio,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Header as PageHeader } from "../../../../components/Page";
import Modal from "../../../../components/Modal";
import TextField from "../../../../components/TextField";
import FormLabelControl from "../../../../components/FormLabelControl";
import DatePicker from "../../../../components/DatePicker";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import CataractSurgeryRecordPDF from "../../../patient-records/patient-file/CataractSurgeryRecordPDF";

import { usePost, useToast } from "../../../../hooks";
import { formatDateForDb, formatError } from "../../../../helpers";
import { CATARACT_SURGERY_RECORD_OPTIONS } from "../../../../constants";

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

const CataractSurgeryRecord = ({ patient, paymentCacheitem }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    payment_cache_item_id: paymentCacheitem.id,
    postoperative_data: [],
  });

  const {
    data: dataFetch,
    setData: setDataFetch,
    loading: loadingFetch,
    error: errorFetch,
    handlePost: handleFetch,
  } = usePost("api/cataract-surgery-records", {
    payment_cache_item_id: paymentCacheitem.id,
  });

  const { handlePost: handleAutoSave } = usePost();

  const {
    data: dataComplete,
    loading: loadingComplete,
    error: errorComplete,
    handlePost: handleComplete,
  } = usePost("api/cataract-surgery-records", {
    ...formData,
    postoperative_data: formData.postoperative_data.join("||"),
    operation_date: formData.operation_date
      ? formatDateForDb(formData.operation_date)
      : null,
    status: "Saved",
  });

  useEffect(() => {
    document.title = `Surgical Record - ${window.APP_NAME}`;
    handleFetch();
  }, []);

  useEffect(() => {
    if (dataFetch) {
      setFormData({
        ...formData,
        ...dataFetch.data,
        operation_date: dataFetch.data.operation_date
          ? new Date(dataFetch.data.operation_date)
          : null,
        postoperative_data: (dataFetch.data.postoperative_data || "").split(
          "||"
        ),
      });
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
      handleAutoSave("api/cataract-surgery-records", {
        payment_cache_item_id: paymentCacheitem.id,
        [field]: value,
      });
    }
  };

  const updatePostoperativeData = (index, value) => {
    let tmp = formData.postoperative_data;
    tmp[index] = value;
    setFormData({ ...formData, postoperative_data: tmp });
    autoSave("postoperative_data", tmp.join("||"));
  };

  const confirmComplete = () => {
    setData(null);
    setError(null);

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
          title="Surgical Record"
          trailing={
            formData ? (
              <CataractSurgeryRecordPDF
                cataractSurgeryRecordId={formData.id}
                patient={patient}
              />
            ) : null
          }
        />
        <Divider />
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
                title="Preoperative Examination"
                sx={{ mt: 0 }}
              />

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  md={7}
                  sm={12}
                  xs={12}
                >
                  <Box className="table-wrapper">
                    <Table className="no-hover-highlight">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            colSpan={2}
                          />
                          <TableCell component="th">RE</TableCell>
                          <TableCell component="th">LE</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            component="th"
                            rowSpan={2}
                          >
                            Clinical Assessment
                          </TableCell>
                          <TableCell component="th">Presenting VA</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={formData.unaided_re_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  unaided_re_va: value,
                                });
                                autoSave("unaided_re_va", value);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={formData.unaided_le_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  unaided_le_va: value,
                                });
                                autoSave("unaided_le_va", value);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">
                            Best or Pinhole VA
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={formData.aided_re_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  aided_re_va: value,
                                });
                                autoSave("aided_re_va", value);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={formData.aided_le_va || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  aided_le_va: value,
                                });
                                autoSave("aided_le_va", value);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>

                  <Box
                    className="table-wrapper"
                    sx={{ mt: 2 }}
                  >
                    <Table className="no-hover-highlight">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            component="th"
                            rowSpan={
                              CATARACT_SURGERY_RECORD_OPTIONS.lensExamination
                                .length + 1
                            }
                          >
                            Examination
                          </TableCell>
                          <TableCell component="th" />
                          <TableCell component="th">RE</TableCell>
                          <TableCell component="th">LE</TableCell>
                        </TableRow>
                        {CATARACT_SURGERY_RECORD_OPTIONS.lensExamination.map(
                          (e, i) => (
                            <TableRow key={e.value}>
                              <TableCell component="th">{e.label}</TableCell>
                              <TableCell>
                                <Radio
                                  checked={
                                    formData.lens_examination_re === e.value
                                  }
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      lens_examination_re: e.value,
                                    });
                                    autoSave("lens_examination_re", e.value);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Radio
                                  checked={
                                    formData.lens_examination_le === e.value
                                  }
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      lens_examination_le: e.value,
                                    });
                                    autoSave("lens_examination_le", e.value);
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </Box>

                  <Box
                    className="table-wrapper"
                    sx={{ mt: 2 }}
                  >
                    <Table className="no-hover-highlight">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Other ocular pathology in the eye to be operated,
                            likely to affect outcome
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Stack
                              direction="column"
                              spacing={0}
                            >
                              {CATARACT_SURGERY_RECORD_OPTIONS.otherOcularPathology.map(
                                (e) => (
                                  <FormControlLabel
                                    key={e.value}
                                    control={
                                      <Radio
                                        checked={
                                          formData.other_ocular_pathology ===
                                          e.value
                                        }
                                        onChange={(event) => {
                                          setFormData({
                                            ...formData,
                                            other_ocular_pathology: e.value,
                                          });
                                          autoSave(
                                            "other_ocular_pathology",
                                            e.value
                                          );
                                        }}
                                      />
                                    }
                                    label={e.label}
                                  />
                                )
                              )}
                            </Stack>

                            <TextField
                              fullWidth
                              placeholder="Specify here..."
                              value={
                                formData.other_ocular_pathology_specify || ""
                              }
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  other_ocular_pathology_specify: value,
                                });
                                autoSave(
                                  "other_ocular_pathology_specify",
                                  value
                                );
                              }}
                              containerProps={{ mt: 2 }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Grid>
                <Grid
                  item
                  md={5}
                  sm={12}
                  xs={12}
                >
                  <Box className="table-wrapper">
                    <Table className="no-hover-highlight">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th">
                            Category of Clinical Assessment (Snellen 6 m)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Grid
                              container
                              spacing={1}
                            >
                              {CATARACT_SURGERY_RECORD_OPTIONS.vaCategories.map(
                                (e, i) => (
                                  <Grid
                                    key={e.value}
                                    item
                                    md={6}
                                    sm={12}
                                    xs={12}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={2}
                                      flexWrap="nowrap"
                                    >
                                      <Typography fontWeight="bold">
                                        {i + 1}
                                      </Typography>
                                      <Typography>{e.label}</Typography>
                                    </Stack>
                                  </Grid>
                                )
                              )}
                            </Grid>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>

                  <Box
                    className="table-wrapper"
                    sx={{ mt: 2 }}
                  >
                    <Table className="no-hover-highlight">
                      <TableHead>
                        <TableRow>
                          <TableCell>Clinical Data</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <TextField
                              fullWidth
                              multiline
                              rows={9}
                              horizontal
                              value={formData.clinical_data || ""}
                              onChange={(value) => {
                                setFormData({
                                  ...formData,
                                  clinical_data: value,
                                });
                                autoSave("clinical_data", value);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Grid>
              </Grid>

              <Box
                className="table-wrapper"
                sx={{ mt: 2 }}
              >
                <Table className="no-hover-highlight">
                  <TableHead>
                    <TableRow>
                      <TableCell>Optional</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Grid
                          container
                          spacing={2}
                        >
                          <Grid
                            item
                            md={6}
                            sm={12}
                            xs={12}
                          >
                            <FormLabelControl
                              label="Eye to be operated:"
                              horizontal
                              containerProps={{ alignItems: "center", mb: 2 }}
                              control={
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  flexWrap="wrap"
                                  ml={2}
                                >
                                  {["RE", "LE"].map((e) => (
                                    <FormControlLabel
                                      key={e}
                                      control={
                                        <Radio
                                          checked={formData.operated_eye === e}
                                          onChange={(event) => {
                                            setFormData({
                                              ...formData,
                                              operated_eye: e,
                                            });
                                            autoSave("operated_eye", e);
                                          }}
                                        />
                                      }
                                      label={e}
                                    />
                                  ))}
                                </Stack>
                              }
                            />

                            <FormLabelControl
                              label="Examination:"
                              horizontal
                              containerProps={{ alignItems: "center", mb: 2 }}
                              control={
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  flexWrap="wrap"
                                  ml={2}
                                >
                                  <TextField
                                    fullWidth
                                    label="SPH"
                                    horizontal
                                    value={
                                      formData.operated_eye_refraction_sph || ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_refraction_sph: value,
                                      });
                                      autoSave(
                                        "operated_eye_refraction_sph",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="CYL"
                                    horizontal
                                    value={
                                      formData.operated_eye_refraction_cyl || ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_refraction_cyl: value,
                                      });
                                      autoSave(
                                        "operated_eye_refraction_cyl",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="AXIS"
                                    horizontal
                                    value={
                                      formData.operated_eye_refraction_axis ||
                                      ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_refraction_axis: value,
                                      });
                                      autoSave(
                                        "operated_eye_refraction_axis",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                </Stack>
                              }
                            />

                            <FormLabelControl
                              label="Targeted postop. spherical equivalent:"
                              horizontal
                              containerProps={{ alignItems: "center", mb: 2 }}
                              control={
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  flexWrap="wrap"
                                  ml={2}
                                >
                                  <TextField
                                    fullWidth
                                    label="SPH"
                                    horizontal
                                    value={
                                      formData.operated_eye_refraction_sph_postop ||
                                      ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_refraction_sph_postop:
                                          value,
                                      });
                                      autoSave(
                                        "operated_eye_refraction_sph_postop",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                </Stack>
                              }
                            />
                          </Grid>
                          <Grid
                            item
                            md={6}
                            sm={12}
                            xs={12}
                          >
                            <FormLabelControl
                              label="Biometry:"
                              horizontal
                              containerProps={{ alignItems: "center", mb: 2 }}
                              control={
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  flexWrap="wrap"
                                  ml={2}
                                >
                                  <TextField
                                    fullWidth
                                    label="K1"
                                    horizontal
                                    value={
                                      formData.operated_eye_biometry_k1 || ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_biometry_k1: value,
                                      });
                                      autoSave(
                                        "operated_eye_biometry_k1",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="K2"
                                    horizontal
                                    value={
                                      formData.operated_eye_biometry_k2 || ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_biometry_k2: value,
                                      });
                                      autoSave(
                                        "operated_eye_biometry_k2",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="Axial length"
                                    horizontal
                                    value={
                                      formData.operated_eye_biometry_axial_length ||
                                      ""
                                    }
                                    onChange={(value) => {
                                      setFormData({
                                        ...formData,
                                        operated_eye_biometry_axial_length:
                                          value,
                                      });
                                      autoSave(
                                        "operated_eye_biometry_axial_length",
                                        value
                                      );
                                    }}
                                    containerProps={{
                                      width: 144,
                                      alignItems: "center",
                                    }}
                                  />
                                </Stack>
                              }
                            />
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Subheader title="Surgery" />

              <Box className="table-wrapper">
                <Table className="no-hover-highlight">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Grid
                          container
                          spacing={2}
                        >
                          <Grid
                            item
                            md={6}
                            sm={12}
                            xs={12}
                          >
                            <Box className="table-wrapper">
                              <Table className="no-hover-highlight">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date of operation</TableCell>
                                    <TableCell>Place of operation</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <DatePicker
                                        fullWidth
                                        value={formData.operation_date || null}
                                        onChange={(value) => {
                                          if (!isNaN(value)) {
                                            setFormData({
                                              ...formData,
                                              operation_date: value,
                                            });
                                            autoSave(
                                              "operation_date",
                                              formatDateForDb(value)
                                            );
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Stack
                                        direction="column"
                                        spacing={0}
                                      >
                                        {CATARACT_SURGERY_RECORD_OPTIONS.placeOfOperation.map(
                                          (e) => (
                                            <FormControlLabel
                                              key={e.value}
                                              control={
                                                <Radio
                                                  checked={
                                                    formData.operation_place ===
                                                    e.value
                                                  }
                                                  onChange={(event) => {
                                                    setFormData({
                                                      ...formData,
                                                      operation_place: e.value,
                                                    });
                                                    autoSave(
                                                      "operation_place",
                                                      e.value
                                                    );
                                                  }}
                                                />
                                              }
                                              label={e.label}
                                            />
                                          )
                                        )}
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>

                            <Box
                              className="table-wrapper"
                              sx={{ mt: 2 }}
                            >
                              <Table className="no-hover-highlight">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Type of surgery</TableCell>
                                    <TableCell>IOL</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <Stack
                                        direction="column"
                                        spacing={0}
                                      >
                                        {CATARACT_SURGERY_RECORD_OPTIONS.typeOfSurgery.map(
                                          (e) => (
                                            <FormControlLabel
                                              key={e.value}
                                              control={
                                                <Radio
                                                  checked={
                                                    formData.surgery_type ===
                                                    e.value
                                                  }
                                                  onChange={(event) => {
                                                    setFormData({
                                                      ...formData,
                                                      surgery_type: e.value,
                                                    });
                                                    autoSave(
                                                      "surgery_type",
                                                      e.value
                                                    );
                                                  }}
                                                />
                                              }
                                              label={e.label}
                                            />
                                          )
                                        )}
                                      </Stack>
                                    </TableCell>
                                    <TableCell>
                                      <Stack
                                        direction="column"
                                        spacing={0}
                                      >
                                        {CATARACT_SURGERY_RECORD_OPTIONS.iol.map(
                                          (e) => (
                                            <FormControlLabel
                                              key={e.value}
                                              control={
                                                <Radio
                                                  checked={
                                                    formData.iol === e.value
                                                  }
                                                  onChange={(event) => {
                                                    setFormData({
                                                      ...formData,
                                                      iol: e.value,
                                                    });
                                                    autoSave("iol", e.value);
                                                  }}
                                                />
                                              }
                                              label={e.label}
                                            />
                                          )
                                        )}
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Grid>
                          <Grid
                            item
                            md={6}
                            sm={12}
                            xs={12}
                          >
                            <Box className="table-wrapper">
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Hospital / Camp ID</TableCell>
                                    <TableCell>Surgeon ID</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <TextField
                                        fullWidth
                                        value={formData.hospital_id || ""}
                                        onChange={(value) => {
                                          setFormData({
                                            ...formData,
                                            hospital_id: value,
                                          });
                                          autoSave("hospital_id", value);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        fullWidth
                                        value={formData.surgeon_id || ""}
                                        onChange={(value) => {
                                          setFormData({
                                            ...formData,
                                            surgeon_id: value,
                                          });
                                          autoSave("surgeon_id", value);
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>

                            <Box
                              className="table-wrapper"
                              sx={{ mt: 2 }}
                            >
                              <Table className="no-hover-highlight">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Training</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <Stack
                                        direction="column"
                                        spacing={0}
                                      >
                                        {CATARACT_SURGERY_RECORD_OPTIONS.training.map(
                                          (e) => (
                                            <FormControlLabel
                                              key={e.value}
                                              control={
                                                <Radio
                                                  checked={
                                                    formData.training ===
                                                    e.value
                                                  }
                                                  onChange={(event) => {
                                                    setFormData({
                                                      ...formData,
                                                      training: e.value,
                                                    });
                                                    autoSave(
                                                      "training",
                                                      e.value
                                                    );
                                                  }}
                                                />
                                              }
                                              label={e.label}
                                            />
                                          )
                                        )}
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>

                            <Box
                              className="table-wrapper"
                              sx={{ mt: 2 }}
                            >
                              <Table className="no-hover-highlight">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>
                                      Operative complications in operated eye
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>
                                      <Grid
                                        container
                                        spacing={0}
                                      >
                                        {CATARACT_SURGERY_RECORD_OPTIONS.operativeComplications.map(
                                          (e) => (
                                            <Grid
                                              key={e.value}
                                              item
                                              md={6}
                                              sm={12}
                                              xs={12}
                                            >
                                              <FormControlLabel
                                                control={
                                                  <Radio
                                                    checked={
                                                      formData.operative_complications ===
                                                      e.value
                                                    }
                                                    onChange={(event) => {
                                                      setFormData({
                                                        ...formData,
                                                        operative_complications:
                                                          e.value,
                                                      });
                                                      autoSave(
                                                        "operative_complications",
                                                        e.value
                                                      );
                                                    }}
                                                  />
                                                }
                                                label={e.label}
                                              />
                                            </Grid>
                                          )
                                        )}
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Box
                className="table-wrapper"
                sx={{ mt: 2 }}
              >
                <Table className="no-hover-highlight">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={5}>Optional</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Section</TableCell>
                      <TableCell>Capsulotomy</TableCell>
                      <TableCell>Type IOL</TableCell>
                      <TableCell>IOL Power</TableCell>
                      <TableCell>Suture</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Stack
                          direction="column"
                          spacing={0}
                        >
                          {CATARACT_SURGERY_RECORD_OPTIONS.section.map((e) => (
                            <FormControlLabel
                              key={e.value}
                              control={
                                <Radio
                                  checked={formData.section === e.value}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      section: e.value,
                                    });
                                    autoSave("section", e.value);
                                  }}
                                />
                              }
                              label={e.label}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="column"
                          spacing={0}
                        >
                          {CATARACT_SURGERY_RECORD_OPTIONS.capsulotomy.map(
                            (e) => (
                              <FormControlLabel
                                key={e.value}
                                control={
                                  <Radio
                                    checked={formData.capsulotomy === e.value}
                                    onChange={(event) => {
                                      setFormData({
                                        ...formData,
                                        capsulotomy: e.value,
                                      });
                                      autoSave("capsulotomy", e.value);
                                    }}
                                  />
                                }
                                label={e.label}
                              />
                            )
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.iol_type || ""}
                          onChange={(value) => {
                            setFormData({
                              ...formData,
                              iol_type: value,
                            });
                            autoSave("iol_type", value);
                          }}
                          containerProps={{
                            width: 160,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.iol_power || ""}
                          onChange={(value) => {
                            setFormData({
                              ...formData,
                              iol_power: value,
                            });
                            autoSave("iol_power", value);
                          }}
                          containerProps={{
                            width: 160,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="column"
                          spacing={0}
                        >
                          {CATARACT_SURGERY_RECORD_OPTIONS.suture.map((e) => (
                            <FormControlLabel
                              key={e.value}
                              control={
                                <Radio
                                  checked={formData.suture === e.value}
                                  onChange={(event) => {
                                    setFormData({
                                      ...formData,
                                      suture: e.value,
                                    });
                                    autoSave("suture", e.value);
                                  }}
                                />
                              }
                              label={e.label}
                            />
                          ))}
                        </Stack>

                        <TextField
                          fullWidth
                          label="Number of Sutures"
                          horizontal
                          value={formData.number_of_sutures || ""}
                          onChange={(value) => {
                            setFormData({
                              ...formData,
                              number_of_sutures: value,
                            });
                            autoSave("number_of_sutures", value);
                          }}
                          containerProps={{ alignItems: "center", mt: 2 }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Subheader title="Postoperative Management" />

              <Box className="table-wrapper">
                <Table className="no-hover-highlight">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={3}>
                        Clinical assessment of operated eye postoperation
                      </TableCell>
                      <TableCell colSpan={4}>
                        {
                          "Cause of presenting vision <6/60 (Key 8, 9, 10, 11, 12)"
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Follow-up visit</TableCell>
                      <TableCell>Presenting VA</TableCell>
                      <TableCell>Best VA</TableCell>
                      <TableCell>Select.</TableCell>
                      <TableCell>Surg.</TableCell>
                      <TableCell>Specs.</TableCell>
                      <TableCell>Sequel.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <TextField
                          fullWidth
                          label="Days postop. at discharge"
                          horizontal
                          value={formData.postoperative_data[0] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(0, value)
                          }
                          containerProps={{ alignItems: "center" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[1] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(1, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[2] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(2, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[3] === "Select"}
                          onChange={(event) =>
                            updatePostoperativeData(3, "Select")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[3] === "Surg"}
                          onChange={(event) =>
                            updatePostoperativeData(3, "Surg")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[3] === "Specs"}
                          onChange={(event) =>
                            updatePostoperativeData(3, "Specs")
                          }
                        />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <DatePicker
                          fullWidth
                          label="1-3 wks postop."
                          horizontal
                          value={
                            formData.postoperative_data[4]
                              ? new Date(formData.postoperative_data[4])
                              : null
                          }
                          onChange={(value) => {
                            if (!isNaN(value)) {
                              updatePostoperativeData(
                                4,
                                formatDateForDb(value)
                              );
                            }
                          }}
                          containerProps={{ alignItems: "center" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[5] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(5, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[6] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(6, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[7] === "Select"}
                          onChange={(event) =>
                            updatePostoperativeData(7, "Select")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[7] === "Surg"}
                          onChange={(event) =>
                            updatePostoperativeData(7, "Surg")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[7] === "Specs"}
                          onChange={(event) =>
                            updatePostoperativeData(7, "Specs")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[7] === "Sequel"}
                          onChange={(event) =>
                            updatePostoperativeData(7, "Sequel")
                          }
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <DatePicker
                          fullWidth
                          label="4-11 wks postop."
                          horizontal
                          value={
                            formData.postoperative_data[8]
                              ? new Date(formData.postoperative_data[8])
                              : null
                          }
                          onChange={(value) => {
                            if (!isNaN(value)) {
                              updatePostoperativeData(
                                8,
                                formatDateForDb(value)
                              );
                            }
                          }}
                          containerProps={{ alignItems: "center" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[9] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(9, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[10] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(10, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[11] === "Select"}
                          onChange={(event) =>
                            updatePostoperativeData(11, "Select")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[11] === "Surg"}
                          onChange={(event) =>
                            updatePostoperativeData(11, "Surg")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[11] === "Specs"}
                          onChange={(event) =>
                            updatePostoperativeData(11, "Specs")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[11] === "Sequel"}
                          onChange={(event) =>
                            updatePostoperativeData(11, "Sequel")
                          }
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <DatePicker
                          fullWidth
                          label="12+ wks postop."
                          horizontal
                          value={
                            formData.postoperative_data[12]
                              ? new Date(formData.postoperative_data[12])
                              : null
                          }
                          onChange={(value) => {
                            if (!isNaN(value)) {
                              updatePostoperativeData(
                                12,
                                formatDateForDb(value)
                              );
                            }
                          }}
                          containerProps={{ alignItems: "center" }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[13] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(13, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={formData.postoperative_data[14] || ""}
                          onChange={(value) =>
                            updatePostoperativeData(14, value)
                          }
                          containerProps={{ width: 144 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[15] === "Select"}
                          onChange={(event) =>
                            updatePostoperativeData(15, "Select")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[15] === "Surg"}
                          onChange={(event) =>
                            updatePostoperativeData(15, "Surg")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[15] === "Specs"}
                          onChange={(event) =>
                            updatePostoperativeData(15, "Specs")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Radio
                          checked={formData.postoperative_data[15] === "Sequel"}
                          onChange={(event) =>
                            updatePostoperativeData(15, "Sequel")
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Box
                className="table-wrapper"
                sx={{ mt: 2 }}
              >
                <Table className="no-hover-highlight">
                  <TableHead>
                    <TableRow>
                      <TableCell>Optional</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <FormLabelControl
                          label="Postop. Examination:"
                          horizontal
                          containerProps={{ alignItems: "center", mb: 2 }}
                          control={
                            <Stack
                              direction="row"
                              spacing={2}
                              flexWrap="wrap"
                              ml={2}
                            >
                              <TextField
                                fullWidth
                                label="SPH"
                                horizontal
                                value={formData.postoperative_data[16] || ""}
                                onChange={(value) =>
                                  updatePostoperativeData(16, value)
                                }
                                containerProps={{
                                  width: 144,
                                  alignItems: "center",
                                }}
                              />
                              <TextField
                                fullWidth
                                label="CYL"
                                horizontal
                                value={formData.postoperative_data[17] || ""}
                                onChange={(value) =>
                                  updatePostoperativeData(17, value)
                                }
                                containerProps={{
                                  width: 144,
                                  alignItems: "center",
                                }}
                              />
                              <TextField
                                fullWidth
                                label="AXIS"
                                horizontal
                                value={formData.postoperative_data[18] || ""}
                                onChange={(value) =>
                                  updatePostoperativeData(18, value)
                                }
                                containerProps={{
                                  width: 144,
                                  alignItems: "center",
                                }}
                              />
                            </Stack>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </React.Fragment>
          ) : null}
        </CardContent>
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

export default CataractSurgeryRecord;

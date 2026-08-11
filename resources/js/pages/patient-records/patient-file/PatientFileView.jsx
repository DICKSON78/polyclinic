import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { getAge } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

const Subheader = ({ title, style }) => {
  return (
    <Typography
      variant="subtitle1"
      sx={{
        paddingVertical: { xs: 0.75, sm: 1 },
        paddingHorizontal: { xs: 1.5, sm: 2 },
        color: "#fff",
        backgroundColor: "#039be5",
        borderRadius: 2,
        fontWeight: "bold",
        fontSize: { xs: "0.875rem", sm: "1rem" },
        wordBreak: "break-word",
        ...style,
      }}
    >
      {title}
    </Typography>
  );
};

const DiagnosisCard = ({ title, diagnosisType, items }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {title}
        </Typography>
        <TableContainer
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 400,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Disease Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Disease Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(items || [])
                .filter((e) => e.diagnosis_type === diagnosisType)
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{item.disease?.name}</TableCell>
                    <TableCell>{item.disease?.code}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const ConsultationItemsCard = ({ title, consultationType, items }) => {
  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }

    if (consultationType === "Pharmacy" || consultationType === "Glass") {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {title}
        </Typography>
        <TableContainer
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 500,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>S/N</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                {consultationType === "Pharmacy" && (
                  <TableCell sx={{ fontWeight: "bold" }}>Dosage</TableCell>
                )}
                {consultationType !== "Pharmacy" && (
                  <TableCell sx={{ fontWeight: "bold" }}>Comments</TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(items || [])
                .filter((e) => e.consultation_type && e.consultation_type.name === consultationType)
                .map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{item.item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    {consultationType === "Pharmacy" && (
                      <TableCell sx={{ wordBreak: 'break-word' }}>{item.dosage}</TableCell>
                    )}
                    {consultationType !== "Pharmacy" && (
                      <TableCell sx={{ wordBreak: 'break-word' }}>{item.comments}</TableCell>
                    )}
                    <TableCell>
                      <Chip
                        size="small"
                        label={getStatusLabel(item.status)}
                        color={item.status === "Served" ? "success" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const PatientFileView = ({ consultationId, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const {
    data: consultation,
    loading: loadingConsultation,
    error: consultationError,
    handleFetch,
  } = useFetch(
    `api/consultations/${consultationId}`,
    {
      with_diagnoses: "Yes",
      with_items: "Yes",
      with_item_templates: "Yes",
      with_visual_acuity: "Yes",
      with_external_examination: "Yes",
      with_refraction: "Yes",
      with_fundoscopy: "Yes",
      with_referral: "Yes",
      with_lab_results: "Yes",
      with_radiology_results: "Yes",
      with_vital_signs: "Yes",
    },
    false,
    null,
    (response) => {
      console.log('PatientFileView API Response:', response);
      const result = response?.data?.data ?? response?.data;
      console.log('PatientFileView Consultation Data:', result);
      return result;
    }
  );

  // Auto-fetch consultation data when component mounts
  useEffect(() => {
    console.log('PatientFileView - useEffect triggered', { consultationId, patientId: patient?.id, consultation, loadingConsultation, consultationError });
    if (consultationId && !consultation && !loadingConsultation) {
      console.log('PatientFileView - Calling handleFetch');
      handleFetch();
    }
  }, [consultationId, patient?.id, consultation, loadingConsultation, handleFetch]);

  // Debug logging for consultation data
  useEffect(() => {
    console.log('PatientFileView - Consultation data updated:', consultation);
    console.log('PatientFileView - Loading state:', loadingConsultation);
    console.log('PatientFileView - Error state:', consultationError);
  }, [consultation, loadingConsultation, consultationError]);

  const renderHistoryTaking = () => {
    if (!consultation) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="History Taking" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 600,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Chief Complaint</TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>History of Present Illness</TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Family History</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.chief_complaint || ""}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.history_present_illness || ""}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.family_history || ""}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>General Health</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Family Ocular History</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Family General History</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.general_health || ""}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.family_ocular_history || ""}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{consultation.family_general_history || ""}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderVisualAcuity = () => {
    if (!consultation?.visual_acuity) return null;

    const va = consultation.visual_acuity;
    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Clinical Assessment (VA)" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 500,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: "bold" }} colSpan={2}>Unaided</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} colSpan={2}>Aided</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>LE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>LE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>VA</TableCell>
                <TableCell>{va.unaided_re_va}</TableCell>
                <TableCell>{va.unaided_le_va}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{va.aided_re_va} {va.aided_re_va_description}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{va.aided_le_va} {va.aided_le_va_description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>PH</TableCell>
                <TableCell>{va.unaided_re_ph}</TableCell>
                <TableCell>{va.unaided_le_ph}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>IPD</TableCell>
                <TableCell>{va.unaided_ipd}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderExternalExamination = () => {
    if (!consultation?.external_examination) return null;

    const ee = consultation.external_examination;
    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="External Examination" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 400,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>LE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>LID</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_lid}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_lid}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>SCLELA</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_sclera}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_sclera}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>CORNEA</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_cornea}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_cornea}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>CONJUCTIVA</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_conjuctiva}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_conjuctiva}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>IRIS</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_iris}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_iris}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>PUPIL</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_pupil}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_pupil}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>LENS</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_lens}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_lens}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>IOP</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.re_iop}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ee.le_iop}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderFunctionalTests = () => {
    if (!consultation?.functional_tests) return null;

    const ft = consultation.functional_tests;
    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Functional Tests" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 400,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>LE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>NPC</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.re_npc}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.le_npc}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>NPA</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.re_npa}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.le_npa}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>CONFRONTATION</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.re_confrontation}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.le_confrontation}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>COVER TEST</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.re_cover_test}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{ft.le_cover_test}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderRefraction = () => {
    if (!consultation?.refraction) return null;

    const ref = consultation.refraction;
    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Examination Details (Subjective)" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 600,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }} colSpan={4}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} colSpan={4}>LE</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>SPH</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>CYL</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>AXIS</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>VA</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>SPH</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>CYL</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>AXIS</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>VA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{ref.sub_re_sph}</TableCell>
                <TableCell>{ref.sub_re_cyl}</TableCell>
                <TableCell>{ref.sub_re_axis}</TableCell>
                <TableCell>{ref.sub_re_va}</TableCell>
                <TableCell>{ref.sub_le_sph}</TableCell>
                <TableCell>{ref.sub_le_cyl}</TableCell>
                <TableCell>{ref.sub_le_axis}</TableCell>
                <TableCell>{ref.sub_le_va}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>ADD</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>VA</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ADD</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>VA</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ref.sub_re_add}</TableCell>
                <TableCell>{ref.sub_re_add_va}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>{ref.sub_le_add}</TableCell>
                <TableCell>{ref.sub_le_add_va}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderFundoscopy = () => {
    if (!consultation?.fundoscopy) return null;

    const fund = consultation.fundoscopy;
    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Fundoscopy" style={{ mb: 2 }} />
        <TableContainer 
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 300,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>RE</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>LE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ wordBreak: 'break-word' }}>{fund.re}</TableCell>
                <TableCell sx={{ wordBreak: 'break-word' }}>{fund.le}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderVitals = () => {
    if (!consultation?.vital_signs || consultation.vital_signs.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Vital Signs" style={{ mb: 2 }} />
        <TableContainer
          component={Card}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: 700,
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Temp (°C)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>BP (mmHg)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>HR</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>RR</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>SpO2 (%)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Weight (kg)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>BMI</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Triage Nurse</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultation.vital_signs.map((vs, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{vs.created_at}</TableCell>
                  <TableCell>{vs.temperature}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{vs.systolic_bp ? `${vs.systolic_bp}/${vs.diastolic_bp}` : ""}</TableCell>
                  <TableCell>{vs.heart_rate}</TableCell>
                  <TableCell>{vs.respiratory_rate}</TableCell>
                  <TableCell>{vs.oxygen_saturation}</TableCell>
                  <TableCell>{vs.weight_kg}</TableCell>
                  <TableCell>{vs.bmi_calculated}</TableCell>
                  <TableCell>{vs.triage_category}</TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{vs.triaged_by?.full_name || vs.triagedBy?.full_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderLabResults = () => {
    if (!consultation?.lab_results || consultation.lab_results.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Laboratory Results" style={{ mb: 2 }} />
        {consultation.lab_results.map((request, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {request.request_no} - {request.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>
                <strong>Requested:</strong> {request.created_at}
                {request.completed_at ? <span> | <strong>Completed:</strong> {request.completed_at}</span> : null}
                {request.completed_by?.full_name ? <span> | <strong>By:</strong> {request.completed_by.full_name}</span> : null}
              </Typography>
              <TableContainer
                sx={{
                  overflowX: 'auto',
                  '& .MuiTable-root': {
                    minWidth: 500,
                  }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Test</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Result</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Reference Range</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(request.tests || []).map((test, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{test.lab_test?.name || test.labTest?.name}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>
                          {test.result}
                          {test.is_abnormal && <Chip size="small" label="Abnormal" color="error" sx={{ ml: 1 }} />}
                        </TableCell>
                        <TableCell>{test.unit}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{test.reference_range}</TableCell>
                        <TableCell>{test.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {request.clinical_notes && (
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-word' }}>
                  <strong>Notes:</strong> {request.clinical_notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const renderRadiologyResults = () => {
    if (!consultation?.radiology_results || consultation.radiology_results.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Radiology Results" style={{ mb: 2 }} />
        {consultation.radiology_results.map((request, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {request.request_no} - {request.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>
                <strong>Requested:</strong> {request.created_at}
                {request.completed_at ? <span> | <strong>Completed:</strong> {request.completed_at}</span> : null}
                {request.completed_by?.full_name ? <span> | <strong>By:</strong> {request.completed_by.full_name}</span> : null}
              </Typography>
              <TableContainer
                sx={{
                  overflowX: 'auto',
                  '& .MuiTable-root': {
                    minWidth: 500,
                  }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Findings</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Impression</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Conclusion</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(request.exams || []).map((exam, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{exam.radiology_exam?.name || exam.radiologyExam?.name}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{exam.findings}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{exam.impression}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{exam.conclusion}</TableCell>
                        <TableCell>{exam.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {request.clinical_notes && (
                <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-word' }}>
                  <strong>Notes:</strong> {request.clinical_notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const renderDiagnosisAndManagement = () => {
    if (!consultation) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader
          title={
            consultation.patient_direction === "Direct to Doctor"
              ? "Diagnosis & Management"
              : "Management"
          }
          style={{ mb: 2 }}
        />
        <Grid container spacing={2}>
          {consultation.patient_direction === "Direct to Doctor" && (
            <Grid item xs={12} md={6}>
              <DiagnosisCard
                title="Diagnosis"
                diagnosisType="Final"
                items={consultation.diagnoses}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <ConsultationItemsCard
              title="Medicine"
              consultationType="Pharmacy"
              items={consultation.items}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ConsultationItemsCard
              title="Procedure"
              consultationType="Procedure"
              items={consultation.items}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ConsultationItemsCard
              title="Dispensing"
              consultationType="Glass"
              items={consultation.items}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ConsultationItemsCard
              title="Others"
              consultationType="Others"
              items={consultation.items}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderRemarksAndRecommendation = () => {
    if (!consultation) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Remark & Doctor Recommendation" style={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Remark
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {consultation.remarks || ""}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Doctor Recommendation
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {consultation.doctor_comments_remarks || ""}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderFollowUp = () => {
    if (!consultation || consultation.status !== "Consulted" || !consultation.patient_to_return) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Subheader title="Follow-up Information" style={{ mb: 2 }} />
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  <strong>Patient to Return:</strong> {consultation.patient_to_return}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="body2">
                  <strong>Return Date:</strong> {consultation.to_return_date}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  if (!consultation) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
        <Typography variant="body1">
          {loadingConsultation ? 'Loading consultation data...' : 
           consultationError ? `Error: ${consultationError.message || 'Something went wrong'}` :
           'No consultation data available'}
        </Typography>
        {consultationError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Please try again or contact support if the problem persists.
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 1, sm: 2 },
        maxWidth: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%'
      }}
    >
      {/* Patient Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              wordBreak: 'break-word'
            }}
          >
            Patient File - {patient.full_name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Patient Name:</strong> {patient.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Patient Number:</strong> {patient.id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Age:</strong> {getAge(patient.date_of_birth)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Gender:</strong> {patient.gender}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Phone:</strong> {patient.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Address:</strong> {patient.address}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Payment Mode:</strong> {consultation.payment_cache_item?.payment_mode?.name || consultation.payment_cache_item?.payment_cache?.check_in?.payment_mode?.name || "Not Assigned"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Consultation Item:</strong> {consultation.payment_cache_item?.item?.name || "Not Assigned"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>Consultant:</strong> {consultation.payment_cache_item?.consultant?.full_name || "Not Assigned"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Date:</strong> {consultation.payment_cache_item?.served_at || consultation.created_at}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Require Item:</strong> {consultation.require_glass}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>To Return:</strong> {consultation.patient_to_return}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2">
                <strong>Return Date:</strong> {consultation.to_return_date}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Consultation Details */}
      {renderHistoryTaking()}
      {renderVitals()}
      {renderLabResults()}
      {renderRadiologyResults()}
      {renderVisualAcuity()}
      {renderExternalExamination()}
      {renderFunctionalTests()}
      {renderRefraction()}
      {renderFundoscopy()}
      {renderDiagnosisAndManagement()}
      {renderRemarksAndRecommendation()}
      {renderFollowUp()}
    </Box>
  );
};

export default PatientFileView;
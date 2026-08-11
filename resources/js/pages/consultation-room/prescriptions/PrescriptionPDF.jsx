import React, { useCallback, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";

import { getAge } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

const Subheader = ({ title, style }) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: 9,
          paddingVertical: 4,
          paddingHorizontal: 12,
          color: "#fff",
          backgroundColor: "#039be5",
          borderRadius: 5,
          ...style,
        },
      ]}
    >
      {title}
    </Text>
  );
};

const DiagnosisCard = ({ title, diagnosisType, items }) => {
  const filteredItems = items.filter((item) => item.diagnosis_type === diagnosisType);
  
  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={[
          styles.text,
          {
            fontSize: 9,
            fontWeight: "bold",
            marginBottom: 4,
            color: "#1976d2",
          },
        ]}
      >
        {title}
      </Text>
      {filteredItems.map((item, index) => (
        <View
          key={index}
          style={{
            padding: 4,
            marginBottom: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 3,
          }}
        >
          <Text style={[styles.text, { fontSize: 8 }]}>
            {item.diagnosis?.name || "N/A"}
          </Text>
        </View>
      ))}
    </View>
  );
};

const PDFReportDocument = ({ consultation, patient }) => {
  return (
    <Document
      title="Prescription"
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <Page
        size="A4"
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 35,
        }}
        orientation="portrait"
      >
        <Header
          title="Prescription"
          subtitle={patient.full_name}
        />

        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name", value: patient.full_name },
            { label: "Patient Number", value: patient.id },
            { label: "Age", value: getAge(patient.date_of_birth) },
            { label: "Gender", value: patient.gender },
            { label: "Phone Number", value: patient.phone },
            { label: "Address", value: patient.address },
            {
              label: "Payment Mode",
              value: consultation.payment_cache_item?.payment_mode?.name || "-",
            },
            {
              label: "Consultation Item",
              value: consultation.payment_cache_item?.item?.name || consultation.payment_cache_item?.consultation_type?.name || "-",
            },
            {
              label: "Consultant",
              value: consultation.payment_cache_item?.consultant?.full_name || consultation.creator?.full_name || "-",
            },
            {
              label: "Consultation Date",
              value:
                consultation.payment_cache_item?.served_at ||
                consultation.created_at ||
                "N/A",
            },
            { label: "Require Spectacle", value: consultation.require_glass || "No" },
            { label: "To Return", value: consultation.patient_to_return || "No" },
            { label: "Return Date", value: consultation.to_return_date || "-" },
          ]}
          containerStyle={{
            marginBottom: 8,
          }}
        />

        {/* Clinical Notes Summary - WITHOUT REMARKS */}
        <Subheader title="Clinical Notes" style={{ marginBottom: 6 }} />
        <Descriptions
          columns={2}
          items={[
            { label: "Chief Complaint", value: consultation.chief_complaint || "-" },
            { label: "History of Present Illness", value: consultation.history_present_illness || "-" },
            { label: "Family History", value: consultation.family_history || "-" },
            { label: "General Health", value: consultation.general_health || "-" },
            { label: "Family Ocular History", value: consultation.family_ocular_history || "-" },
            { label: "Family General History", value: consultation.family_general_history || "-" },
            // REMARKS IS INTENTIONALLY EXCLUDED
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* Diagnoses */}
        <Subheader title="Diagnoses" style={{ marginBottom: 6 }} />
        <Descriptions columns={1} items={[]} containerStyle={{ marginBottom: 4 }} />
        {/* Provisional */}
        <DiagnosisCard title="Provisional" diagnosisType="Provisional" items={consultation.diagnoses || []} />
        {/* Final */}
        <DiagnosisCard title="Final" diagnosisType="Final" items={consultation.diagnoses || []} />

        {consultation.patient_direction === "Direct to Doctor" ? (
          <React.Fragment>
            <Subheader
              title="History Taking"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Chief Complaint
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  History of Present Illness
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Family History
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.chief_complaint || "-"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.history_present_illness || "-"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_history || "-"}
                </Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  General Health
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Family Ocular History
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Family General History
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.general_health || "-"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_ocular_history || "-"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_general_history || "-"}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {/* Visual Acuity */}
        {consultation.visual_acuity ? (
          <React.Fragment>
            <Subheader
              title="Clinical Assessment (VA)"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]} />
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Unaided
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Aided
                </Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 64 }]} />
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  RE
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  LE
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  RE
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  LE
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 64 },
                  ]}
                >
                  VA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_re_va || "N/A"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_le_va || "N/A"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.aided_re_va || "N/A"}{" "}
                  {consultation.visual_acuity.aided_re_va_description || ""}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.aided_le_va || "N/A"}{" "}
                  {consultation.visual_acuity.aided_le_va_description || ""}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 64 },
                  ]}
                >
                  PH
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_re_ph || "N/A"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_le_ph || "N/A"}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {/* External Examination */}
        {consultation.external_examination ? (
          <React.Fragment>
            <Subheader
              title="External Examination"
              style={{ marginBottom: 8 }}
            />
            <Descriptions
              columns={2}
              items={[
                { label: "RE Lid", value: consultation.external_examination.re_lid || "N/A" },
                { label: "RE Sclera", value: consultation.external_examination.re_sclera || "N/A" },
                { label: "RE Cornea", value: consultation.external_examination.re_cornea || "N/A" },
                { label: "RE Conjunctiva", value: consultation.external_examination.re_conjuctiva || "N/A" },
                { label: "RE Iris", value: consultation.external_examination.re_iris || "N/A" },
                { label: "RE Pupil", value: consultation.external_examination.re_pupil || "N/A" },
                { label: "RE Lens", value: consultation.external_examination.re_lens || "N/A" },
                { label: "RE IOP", value: consultation.external_examination.re_iop || "N/A" },
                { label: "LE Lid", value: consultation.external_examination.le_lid || "N/A" },
                { label: "LE Sclera", value: consultation.external_examination.le_sclera || "N/A" },
                { label: "LE Cornea", value: consultation.external_examination.le_cornea || "N/A" },
                { label: "LE Conjunctiva", value: consultation.external_examination.le_conjuctiva || "N/A" },
                { label: "LE Iris", value: consultation.external_examination.le_iris || "N/A" },
                { label: "LE Pupil", value: consultation.external_examination.le_pupil || "N/A" },
                { label: "LE Lens", value: consultation.external_examination.le_lens || "N/A" },
                { label: "LE IOP", value: consultation.external_examination.le_iop || "N/A" },
              ]}
              containerStyle={{ marginBottom: 8 }}
            />
          </React.Fragment>
        ) : null}

        {/* Functional Tests */}
        {consultation.functional_tests ? (
          <React.Fragment>
            <Subheader
              title="Functional Tests"
              style={{ marginBottom: 8 }}
            />
            <Descriptions
              columns={2}
              items={[
                { label: "Color Vision RE", value: consultation.functional_tests.re_color_vision || "N/A" },
                { label: "Color Vision LE", value: consultation.functional_tests.le_color_vision || "N/A" },
                { label: "Depth Perception", value: consultation.functional_tests.depth_perception || "N/A" },
                { label: "Visual Field", value: consultation.functional_tests.visual_field || "N/A" },
              ]}
              containerStyle={{ marginBottom: 8 }}
            />
          </React.Fragment>
        ) : null}

        {/* Refraction */}
        {consultation.refraction ? (
          <React.Fragment>
            <Subheader
              title="Examination Details"
              style={{ marginBottom: 8 }}
            />
            <Descriptions
              columns={2}
              items={[
                { label: "RE Sphere", value: consultation.refraction.re_sphere || "N/A" },
                { label: "RE Cylinder", value: consultation.refraction.re_cylinder || "N/A" },
                { label: "RE Axis", value: consultation.refraction.re_axis || "N/A" },
                { label: "RE Add", value: consultation.refraction.re_add || "N/A" },
                { label: "LE Sphere", value: consultation.refraction.le_sphere || "N/A" },
                { label: "LE Cylinder", value: consultation.refraction.le_cylinder || "N/A" },
                { label: "LE Axis", value: consultation.refraction.le_axis || "N/A" },
                { label: "LE Add", value: consultation.refraction.le_add || "N/A" },
              ]}
              containerStyle={{ marginBottom: 8 }}
            />
          </React.Fragment>
        ) : null}

        {/* Fundoscopy */}
        {consultation.fundoscopy ? (
          <React.Fragment>
            <Subheader
              title="Fundoscopy"
              style={{ marginBottom: 8 }}
            />
            <Descriptions
              columns={2}
              items={[
                { label: "RE Disc", value: consultation.fundoscopy.re_disc || "N/A" },
                { label: "RE Macula", value: consultation.fundoscopy.re_macula || "N/A" },
                { label: "RE Vessels", value: consultation.fundoscopy.re_vessels || "N/A" },
                { label: "RE Periphery", value: consultation.fundoscopy.re_periphery || "N/A" },
                { label: "LE Disc", value: consultation.fundoscopy.le_disc || "N/A" },
                { label: "LE Macula", value: consultation.fundoscopy.le_macula || "N/A" },
                { label: "LE Vessels", value: consultation.fundoscopy.le_vessels || "N/A" },
                { label: "LE Periphery", value: consultation.fundoscopy.le_periphery || "N/A" },
              ]}
              containerStyle={{ marginBottom: 8 }}
            />
          </React.Fragment>
        ) : null}

        {/* Prescription Items (Medicines) */}
        {consultation.items && Array.isArray(consultation.items) && consultation.items.length > 0 ? (
          <React.Fragment>
            <Subheader
              title="Prescription Items"
              style={{ marginBottom: 8 }}
            />
            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Item Name
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Quantity
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Unit
                </Text>
              </View>
              {consultation.items
                .filter(item => item.consultation_type?.name === "Pharmacy")
                .map((item, index) => (
                  <View key={index} style={tableStyles.tableRow}>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {item.item?.name || item.medicine?.name || "N/A"}
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {item.quantity || "N/A"}
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {item.unit_of_measure?.name || "N/A"}
                    </Text>
                  </View>
                ))}
            </View>
          </React.Fragment>
        ) : null}

        {/* Doctor Recommendations */}
        {consultation.doctor_recommendations ? (
          <React.Fragment>
            <Subheader
              title="Doctor Recommendations"
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.text, { fontSize: 9, marginBottom: 8 }]}>
              {consultation.doctor_recommendations}
            </Text>
          </React.Fragment>
        ) : null}

        {/* Doctor Comments */}
        {consultation.doctor_comments_remarks ? (
          <React.Fragment>
            <Subheader
              title="Doctor Recommendation"
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.text, { fontSize: 9, marginBottom: 8 }]}>
              {consultation.doctor_comments_remarks}
            </Text>
          </React.Fragment>
        ) : null}

        {/* Lens Types */}
        {consultation.lens_types ? (
          <React.Fragment>
            <Subheader
              title="Item Selection"
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.text, { fontSize: 9, marginBottom: 8 }]}>
              {typeof consultation.lens_types === 'string' 
                ? JSON.parse(consultation.lens_types).join(", ")
                : Array.isArray(consultation.lens_types)
                ? consultation.lens_types.join(", ")
                : "N/A"}
            </Text>
          </React.Fragment>
        ) : null}

        <Footer />
      </Page>
    </Document>
  );
};

const PrescriptionPDF = ({ consultationId, patient, consultation, ...rest }) => {
  const [loading, setLoading] = useState(false);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [shouldGenerateOnLoad, setShouldGenerateOnLoad] = useState(false);

  const {
    data: fetchedConsultation,
    loading: fetchLoading,
    handleFetch,
  } = useFetch(
    `api/consultations/${consultationId}`,
    {
      with_items: "Yes",
      with_diagnoses: "Yes",
      with_visual_acuity: "Yes",
      with_external_examination: "Yes",
      with_functional_tests: "Yes",
      with_refraction: "Yes",
      with_fundoscopy: "Yes",
    },
    false,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    setLoadingConsultation(fetchLoading);
  }, [fetchLoading]);

  const generatePdfDocument = useCallback(async () => {
    const consultationData = consultation || fetchedConsultation;
    const patientData = patient || fetchedConsultation?.payment_cache_item?.payment_cache?.check_in?.patient;

    if (consultationData && patientData) {
      setLoading(true);
      try {
        if (!consultationData.id || !patientData.id) {
          throw new Error('Missing consultation or patient ID');
        }

        const pdfDocument = (
          <PDFReportDocument
            consultation={consultationData}
            patient={patientData}
          />
        );

        const blob = await pdf(pdfDocument).toBlob();

        if (!blob || blob.size === 0) {
          throw new Error('Generated PDF is empty or invalid');
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prescription-${patientData?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error('PDF generation failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          consultation: consultationData,
          patient: patientData,
        });
        
        // More user-friendly error messages
        let errorMessage = 'Failed to generate prescription PDF. ';
        if (error.message && error.message.includes('font')) {
          errorMessage += 'Font loading issue. Please refresh the page and try again.';
        } else if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
          errorMessage += 'Network issue. Please check your connection and try again.';
        } else if (error.message && error.message.includes('Missing')) {
          errorMessage += 'Missing required data. Please refresh the page and try again.';
        } else {
          errorMessage += `Error: ${error.message || 'Unknown error'}. Please try again.`;
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  }, [consultation, fetchedConsultation, patient]);

  useEffect(() => {
    const consultationData = consultation || fetchedConsultation;
    const patientData = patient || fetchedConsultation?.payment_cache_item?.payment_cache?.check_in?.patient;
    
    if (consultationData && patientData && shouldGenerateOnLoad && !loadingConsultation) {
      generatePdfDocument();
      setShouldGenerateOnLoad(false);
    }
  }, [consultation, fetchedConsultation, patient, shouldGenerateOnLoad, loadingConsultation, generatePdfDocument]);

  const handleDownloadWithFlag = useCallback(async () => {
    if (!consultationId && !consultation) {
      alert('Missing consultation data. Please refresh the page.');
      return;
    }

    const consultationData = consultation || fetchedConsultation;
    const patientData = patient || fetchedConsultation?.payment_cache_item?.payment_cache?.check_in?.patient;

    // If we have consultation data but need to fetch more details
    if (consultationData && !consultationData.items && consultationId && !loadingConsultation) {
      setShouldGenerateOnLoad(true);
      await handleFetch();
      return;
    }

    if (consultationData && patientData) {
      await generatePdfDocument();
    } else if (consultationId && !loadingConsultation) {
      setShouldGenerateOnLoad(true);
      await handleFetch();
    }
  }, [consultation, consultationId, fetchedConsultation, patient, loadingConsultation, handleFetch, generatePdfDocument]);

  return (
    <Button
      disabled={loading || loadingConsultation}
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadWithFlag}
      {...rest}
    >
      {loadingConsultation || loading ? "Generating..." : "Prescription"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Helvetica",
  },
});

export default PrescriptionPDF;


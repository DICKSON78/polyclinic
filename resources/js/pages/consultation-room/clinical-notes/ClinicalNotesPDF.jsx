import React, { useCallback, useState } from "react";
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

import { getAge } from "../../../helpers";
import Header from "../../../components/pdf/Header";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";

const Subheader = ({ title, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: "#1976d2",
          color: "#fff",
          paddingVertical: 4,
          paddingHorizontal: 12,
          borderRadius: 5,
          marginBottom: 8,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 9,
    color: "#333",
    marginBottom: 4,
  },
  divider: {
    borderBottom: "1 solid #e0e0e0",
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
});

const ClinicalNotesPDFDocument = ({ consultation, patient, clinic }) => {
  return (
    <Document
      title="Clinical Notes"
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
          title="Clinical Notes"
          subtitle={`${patient?.first_name || ''} ${patient?.middle_name || ''} ${patient?.last_name || ''}`}
        />

        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name", value: `${patient?.first_name || ''} ${patient?.middle_name || ''} ${patient?.last_name || ''}` },
            { label: "Patient Number", value: patient?.id },
            { label: "Age", value: getAge(patient?.date_of_birth) },
            { label: "Gender", value: patient?.gender },
            { label: "Phone Number", value: patient?.phone },
            { label: "Address", value: patient?.address },
            {
              label: "Payment Mode",
              value: consultation?.payment_cache_item?.payment_mode?.name || consultation?.payment_cache_item?.payment_cache?.check_in?.payment_mode?.name || "-",
            },
            {
              label: "Consultation Item",
              value: consultation?.payment_cache_item?.item?.name || consultation?.payment_cache_item?.consultation_type?.name || "-",
            },
            {
              label: "Consultant",
              value: consultation?.payment_cache_item?.consultant?.full_name || consultation?.creator?.full_name || "-",
            },
            {
              label: "Consultation Date",
              value:
                consultation?.payment_cache_item?.served_at ||
                consultation?.created_at ||
                "N/A",
            },
            { label: "Require Item", value: consultation?.require_glass || "No" },
            { label: "To Return", value: consultation?.patient_to_return || "No" },
            { label: "Return Date", value: consultation?.to_return_date || "N/A" },
          ]}
          containerStyle={{
            marginBottom: 8,
          }}
        />

        {/* History Taking */}
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
              {consultation?.chief_complaint || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.history_present_illness || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.family_history || ""}
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
              {consultation?.general_health || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.family_ocular_history || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.family_general_history || ""}
            </Text>
          </View>
        </View>

        {/* Visual Acuity */}
        {consultation?.visual_acuity ? (
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
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  Distance
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation?.visual_acuity?.distance_re_unaided || ""}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation?.visual_acuity?.distance_le_unaided || ""}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  Near
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation?.visual_acuity?.near_re_unaided || ""}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation?.visual_acuity?.near_le_unaided || ""}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {/* Clinical Examination */}
        <Subheader
          title="Clinical Examination"
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
              Diagnosis
            </Text>
            <Text
              style={[
                styles.text,
                tableStyles.tableCell,
                { fontWeight: "bold" },
              ]}
            >
              Treatment
            </Text>
            <Text
              style={[
                styles.text,
                tableStyles.tableCell,
                { fontWeight: "bold" },
              ]}
            >
              Medications
            </Text>
          </View>
          <View style={tableStyles.tableRow}>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.diagnoses?.map(d => d.name).join(', ') || 'N/A'}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.treatment_plan || consultation?.treatment || 'N/A'}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation?.items?.filter(item => item.category === 'medication').map(item => item.name).join(', ') || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Recommendations */}
        <Subheader
          title="Recommendations"
          style={{ marginBottom: 8 }}
        />

        <Text style={styles.text}>
          {consultation?.doctor_recommendations || consultation?.recommendations || 'N/A'}
        </Text>

      </Page>
    </Document>
  );
};

const ClinicalNotesPDF = ({ consultation, patient, clinic, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!consultation) {
      alert("No consultation data available");
      return;
    }

    setLoading(true);
    try {
      const pdfDocument = (
        <ClinicalNotesPDFDocument
          consultation={consultation}
          patient={patient}
          clinic={clinic || window.user?.clinic}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();

      if (!blob || blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      console.log('Generated blob type:', blob.type);
      console.log('Generated blob size:', blob.size);

      // Create proper PDF blob with correct MIME type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const patientName = patient?.first_name || "patient";
      link.download = `clinical-notes-${patientName}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [consultation, patient, clinic]);

  return (
    <Button
      disabled={loading || !consultation}
      variant="contained"
      color="primary"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={generatePDF}
      {...rest}
    >
      {loading ? "Generating..." : "Clinical Notes"}
    </Button>
  );
};

export default ClinicalNotesPDF;
export { ClinicalNotesPDFDocument };

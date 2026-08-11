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

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";

import { getAge } from "../../../helpers";

const PDFReportDocument = ({ prescription, patient }) => {
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
        <Header title="Prescription" subtitle={patient.full_name} />

        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name", value: patient.full_name },
            { label: "Patient Number", value: patient.id },
            { label: "Age", value: getAge(patient.date_of_birth) },
            { label: "Gender", value: patient.gender },
            { label: "Phone Number", value: patient.phone },
            { label: "Prescription No.", value: prescription.prescription_no },
            {
              label: "Prescribed By",
              value: prescription.prescribed_by?.full_name || "-",
            },
            {
              label: "Date",
              value: prescription.date_prescribed
                ? new Date(prescription.date_prescribed).toLocaleString()
                : "-",
            },
            { label: "Diagnosis", value: prescription.diagnosis || "-" },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {prescription.clinical_notes && (
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
              Clinical Notes
            </Text>
            <Text style={[styles.text, { fontSize: 9 }]}>
              {prescription.clinical_notes}
            </Text>
          </View>
        )}

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
              marginBottom: 8,
            },
          ]}
        >
          Medicines
        </Text>

        <View style={[tableStyles.table, { marginBottom: 8 }]}>
          <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
            <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>
              Medicine
            </Text>
            <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>
              Dosage
            </Text>
            <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>
              Frequency
            </Text>
            <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>
              Duration
            </Text>
            <Text style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}>
              Quantity
            </Text>
          </View>
          {(prescription.items || []).map((item, index) => (
            <View key={index} style={tableStyles.tableRow}>
              <Text style={[styles.text, tableStyles.tableCell]}>
                {item.medicine_name || item.medicine?.name || "N/A"}
              </Text>
              <Text style={[styles.text, tableStyles.tableCell]}>
                {item.dosage || "-"}
              </Text>
              <Text style={[styles.text, tableStyles.tableCell]}>
                {item.frequency || "-"}
              </Text>
              <Text style={[styles.text, tableStyles.tableCell]}>
                {item.duration ? `${item.duration} days` : "-"}
              </Text>
              <Text style={[styles.text, tableStyles.tableCell]}>
                {item.quantity || "0"} {item.unit || ""}
              </Text>
            </View>
          ))}
        </View>

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
            Instructions
          </Text>
          {(prescription.items || []).map((item, index) => (
            <Text key={index} style={[styles.text, { fontSize: 9, marginBottom: 2 }]}>
              • {item.medicine_name || item.medicine?.name || "Medicine"}
              {item.instructions ? `: ${item.instructions}` : ""}
              {item.meal && item.meal !== "None" ? ` (${item.meal} meals)` : ""}
            </Text>
          ))}
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

const PrescriptionPDF = ({ prescription, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePdfDocument = useCallback(async () => {
    if (prescription && patient) {
      setLoading(true);
      try {
        const pdfDocument = (
          <PDFReportDocument prescription={prescription} patient={patient} />
        );

        const blob = await pdf(pdfDocument).toBlob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `prescription-${patient?.full_name || "patient"}-${new Date()
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
        alert(`Failed to generate prescription PDF. ${error.message || ""}`);
      } finally {
        setLoading(false);
      }
    }
  }, [prescription, patient]);

  return (
    <Button
      disabled={loading}
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={generatePdfDocument}
      {...rest}
    >
      {loading ? "Generating..." : "Print"}
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

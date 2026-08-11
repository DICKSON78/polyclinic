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
import { PDFReportDocument } from "../../patient-records/patient-file/PatientFilePDF";
import { getAge } from "../../../helpers";

// ── Shared styles (same as PatientFilePDF) ───────────────────
const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Helvetica",
  },
});

// ── Subheader (same design as PatientFilePDF) ─────────────────
const Subheader = ({ title, style }) => (
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
        ...style,
      },
    ]}
  >
    {title}
  </Text>
);

// ── Referral Letter Document ───────────────────────────────────
const ReferralPDFDocument = ({ referral, patient, clinic }) => {
  const clinicData = clinic || window?.user?.clinic || {};

  return (
    <Document
      title="Referral Letter"
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
        {/* ── Header ── */}
        <Header title="Referral Letter" subtitle={patient?.full_name} />

        {/* ── Patient Information ── */}
        <Subheader title="Patient Information" style={{ marginBottom: 8 }} />
        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name",   value: patient?.full_name },
            { label: "Patient Number", value: patient?.id },
            { label: "Age",            value: getAge(patient?.date_of_birth) },
            { label: "Gender",         value: patient?.gender },
            { label: "Phone Number",   value: patient?.phone },
            { label: "Address",        value: patient?.address },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* ── Referral Details ── */}
        <Subheader title="Referral Details" style={{ marginBottom: 8 }} />
        <Descriptions
          columns={3}
          items={[
            {
              label: "Referral Date",
              value: referral?.referral_date
                ? new Date(referral.referral_date).toLocaleDateString()
                : "N/A",
            },
            { label: "Status", value: referral?.status || "Pending" },
            {
              label: "Referred To",
              value: referral?.referred_to_name
                ? `${referral.referred_to_name}${referral.referred_to_type ? ` (${referral.referred_to_type})` : ""}`
                : "N/A",
            },
            {
              label: "Referred By",
              value: referral?.creator?.full_name || "N/A",
            },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* ── Action Taken ── */}
        <Subheader title="Action Taken" style={{ marginBottom: 8 }} />
        <View style={[tableStyles.table, { marginBottom: 8 }]}>
          <View style={tableStyles.tableRow}>
            <Text
              style={[
                styles.text,
                tableStyles.tableCell,
                { lineHeight: 1.5, minHeight: 40 },
              ]}
            >
              {referral?.clinical_summary || "N/A"}
            </Text>
          </View>
        </View>

        {/* ── Reason for Referral ── */}
        <Subheader title="Reason for Referral" style={{ marginBottom: 8 }} />
        <View style={[tableStyles.table, { marginBottom: 8 }]}>
          <View style={tableStyles.tableRow}>
            <Text
              style={[
                styles.text,
                tableStyles.tableCell,
                { lineHeight: 1.5, minHeight: 40 },
              ]}
            >
              {referral?.referral_reason || "N/A"}
            </Text>
          </View>
        </View>

        {/* ── Referring Clinic ── */}
        <Subheader title="Referring Clinic" style={{ marginBottom: 8 }} />
        <Descriptions
          columns={2}
          items={[
            { label: "Clinic Name", value: clinicData.name || "N/A" },
            { label: "Address",     value: clinicData.address || "N/A" },
            { label: "Phone",       value: clinicData.phone || "N/A" },
            { label: "Email",       value: clinicData.email || "N/A" },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* ── Signature Line ── */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 24,
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "45%" }}>
            <View
              style={{
                borderBottom: "1pt solid #000",
                marginBottom: 4,
                height: 24,
              }}
            />
            <Text style={[styles.text, { textAlign: "center" }]}>
              Referring Doctor Signature
            </Text>
            <Text
              style={[
                styles.text,
                { textAlign: "center", marginTop: 2, color: "#555" },
              ]}
            >
              {referral?.creator?.full_name || ""}
            </Text>
          </View>
          <View style={{ width: "45%" }}>
            <View
              style={{
                borderBottom: "1pt solid #000",
                marginBottom: 4,
                height: 24,
              }}
            />
            <Text style={[styles.text, { textAlign: "center" }]}>
              Date
            </Text>
            <Text
              style={[
                styles.text,
                { textAlign: "center", marginTop: 2, color: "#555" },
              ]}
            >
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Footer
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

// ── Download Button Component ─────────────────────────────────
const ReferralPDF = ({ referral, patient, clinic, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!referral) {
      alert("No referral data available");
      return;
    }

    setLoading(true);
    try {
      // Always use ReferralPDFDocument (referral letter design)
      // If consultation exists, fetch it to enrich the referral letter
      let enrichedReferral = { ...referral };

      if (referral.consultation_id) {
        try {
          const resp = await fetch(
            `/api/consultations/${referral.consultation_id}?with_referral=Yes`
          );
          if (resp.ok) {
            const json = await resp.json();
            const consultation = json?.data?.data;
            if (consultation && consultation.creator) {
              enrichedReferral.creator =
                enrichedReferral.creator || consultation.creator;
            }
          }
        } catch (_) {
          // use referral as-is
        }
      }

      const blob = await pdf(
        <ReferralPDFDocument
          referral={enrichedReferral}
          patient={patient}
          clinic={clinic || window?.user?.clinic}
        />
      ).toBlob('application/pdf');

      if (!blob || blob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const patientName =
        patient?.full_name || patient?.first_name || "patient";
      link.download = `referral-letter-${patientName}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [referral, patient, clinic]);

  return (
    <Button
      disabled={loading || !referral}
      variant="contained"
      color="primary"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={generatePDF}
      {...rest}
    >
      {loading ? "Generating..." : "Referral"}
    </Button>
  );
};

export default ReferralPDF;
export { ReferralPDFDocument };
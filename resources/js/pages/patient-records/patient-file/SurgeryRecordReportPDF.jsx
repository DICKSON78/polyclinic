import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import {
  Document,
  Font,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Use public path for fonts to avoid build issues
const fontRegular = "/fonts/Custom-Regular.ttf";
const fontItalic = "/fonts/Custom-Italic.ttf";
const fontBold = "/fonts/Custom-Bold.ttf";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import { styles as tableStyles } from "../../../components/pdf/Table";

import { getAge } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const Subheader = ({ title, style }) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: 10,
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

const PDFReportPage = ({ surgeryRecordReport, patient }) => {
  return (
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
        title="Surgery Record Report"
        subtitle={patient.full_name}
      />

      <Subheader
        title="A: Patient"
        style={{ marginBottom: 8 }}
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
        ]}
        containerStyle={{
          marginBottom: 8,
        }}
      />

      <Subheader
        title="B: Preoperative"
        style={{ marginBottom: 8 }}
      />

      <View style={[tableStyles.table, { marginBottom: 8 }]}>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Clinical Assessment
          </Text>
          <View style={[tableStyles.tableCell, styles.row]}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>RE:</Text>
            <Text style={[styles.text, { marginHorizontal: 8 }]}>
              {surgeryRecordReport.unaided_re_va}
            </Text>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              With Pinhole:
            </Text>
            <Text style={[styles.text, { marginLeft: 8 }]}>
              {surgeryRecordReport.aided_re_va}
            </Text>
          </View>
          <View style={[tableStyles.tableCell, styles.row]}>
            <Text style={[styles.text, { fontWeight: "bold" }]}>LE:</Text>
            <Text style={[styles.text, { marginHorizontal: 8 }]}>
              {surgeryRecordReport.unaided_le_va}
            </Text>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              With Pinhole:
            </Text>
            <Text style={[styles.text, { marginLeft: 8 }]}>
              {surgeryRecordReport.aided_le_va}
            </Text>
          </View>
        </View>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Name of Surgeon
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.surgeon}
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Name of Assistant Surgeon
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.assistant_surgeon}
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Name of Scrub Nurse
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.scrub_nurse}
          </Text>
        </View>
      </View>

      <Subheader
        title="C: Clinical Data"
        style={{ marginBottom: 8 }}
      />

      <View style={[tableStyles.table, { marginBottom: 8 }]}>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Type of Operation
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.operation_type}
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Type of Anaesthesia
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.anaesthesia_type}
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              tableStyles.lightGrey,
              { fontWeight: "bold", width: 144 },
            ]}
          >
            Eye to be Operated
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {surgeryRecordReport.operated_eye}
          </Text>
        </View>
      </View>

      <Subheader
        title="D: Intraoperative Notes"
        style={{ marginBottom: 8 }}
      />

      <Text style={[styles.text, { marginBottom: 8 }]}>
        {surgeryRecordReport.intraoperative_notes}
      </Text>

      <Subheader
        title="E: Postoperative Management"
        style={{ marginBottom: 8 }}
      />

      <Text style={[styles.text, { marginBottom: 8 }]}>
        {surgeryRecordReport.postoperative_management}
      </Text>

      <Descriptions
        columns={2}
        items={[
          {
            label: "Signature of Doctor",
            value: "",
            itemStyle: {
              width: "48%",
              marginRight: "2%",
            },
          },
        ]}
        showFalsyValues
        hideColons
        containerStyle={{
          marginTop: 24,
          marginBottom: 8,
        }}
        itemStyle={{
          marginBottom: 4,
        }}
        valueStyle={{
          fontSize: 8,
          borderBottom: "1pt dotted #666666",
        }}
      />

      <Footer
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </Page>
  );
};

const PDFReportDocument = ({ surgeryRecordReport, patient }) => {
  return (
    <Document
      title="Surgery Record Report"
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <PDFReportPage
        surgeryRecordReport={surgeryRecordReport}
        patient={patient}
      />
    </Document>
  );
};

const PDFReport = ({ surgeryRecordReportId, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const {
    data: surgeryRecordReport,
    loading: loadingSurgeryRecordReport,
    handleFetch,
  } = useFetch(
    `api/surgery-record-reports/${surgeryRecordReportId}`,
    null,
    false,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (surgeryRecordReport) {
      generatePdfDocument();
    }
  }, [surgeryRecordReport]);

  const generatePdfDocument = useCallback(async () => {
    if (surgeryRecordReport) {
      setLoading(true);
      const blob = await pdf(
        <PDFReportDocument
          surgeryRecordReport={surgeryRecordReport}
          patient={patient}
        />
      ).toBlob();
      setLoading(false);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  }, [surgeryRecordReport]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      onClick={handleFetch}
      {...rest}
    >
      {loadingSurgeryRecordReport || loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Custom",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
});

export { PDFReportDocument, PDFReportPage };
export default PDFReport;

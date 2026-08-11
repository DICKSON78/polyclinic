import React, { useCallback, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import {
  Document,
  Font,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Use system fonts as fallback to avoid font loading issues
const fontRegular = "Helvetica";
const fontItalic = "Helvetica-Oblique";
const fontBold = "Helvetica-Bold";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";
import { PDFReportPage as SurgeryRecordReportPage } from "./SurgeryRecordReportPDF";
import { PDFReportPage as CataractSurgeryRecordPage } from "./CataractSurgeryRecordPDF";

import { getAge } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

// Use core PDF fonts directly (Helvetica family) to avoid production loading issues

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
  // Safety check: ensure items is an array before filtering
  const safeItems = Array.isArray(items) ? items : [];
  
  return (
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
          flex: 0.25,
        },
        {
          field: "disease_name",
          headerName: "Disease Name",
          valueGetter: (item, index) => item.disease?.name,
        },
        {
          field: "disease_code",
          headerName: "Disease Code",
          valueGetter: (item, index) => item.disease?.code,
        },
      ]}
      items={safeItems.filter((e) => e.diagnosis_type === diagnosisType)}
    />
  );
};

const ConsultationItemsCard = ({ title, consultationType, items }) => {
  // Safety check: ensure items is an array before filtering
  const safeItems = Array.isArray(items) ? items : [];
  
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
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
          flex: 0.25,
        },
        {
          field: "item_name",
          headerName: "Item Name",
          valueGetter: (item, index) => item.item?.name || "N/A",
        },
        {
          field: "quantity",
          headerName: "Qty",
          valueGetter: (item) => item.quantity,
        },
        {
          field: "dosage",
          headerName: "Dosage",
          show: consultationType === "Pharmacy",
        },
        {
          field: "comments",
          headerName: "Comments",
          show: consultationType !== "Pharmacy",
        },
        {
          field: "status",
          headerName: "Status",
          valueGetter: (item, index) => getStatusLabel(item.status),
        },
      ]}
      items={safeItems.filter((e) => e.consultation_type?.name === consultationType)}
    />
  );
};

const PDFReportDocument = ({ consultation, patient, includeReferral }) => {
  // Use includeReferral if provided, otherwise use consultation.referral
  const referralData = includeReferral || consultation.referral;
  
  return (
    <Document
      title="Patient File"
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
          title="Patient File"
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
              value: consultation.payment_cache_item?.payment_mode?.name || consultation.payment_cache_item?.payment_cache?.check_in?.payment_mode?.name || "-",
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
            { label: "Require Item", value: consultation.require_glass || "No" },
            { label: "To Return", value: consultation.patient_to_return || "No" },
            { label: "Return Date", value: consultation.to_return_date || "N/A" },
          ]}
          containerStyle={{
            marginBottom: 8,
          }}
        />

        {/* History Taking - Always show, matching form layout */}
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
              {consultation.chief_complaint || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation.history_present_illness || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation.family_history || ""}
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
              {consultation.general_health || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation.family_ocular_history || ""}
            </Text>
            <Text style={[styles.text, tableStyles.tableCell]}>
              {consultation.family_general_history || ""}
            </Text>
          </View>
        </View>

        {/* Vital Signs */}
        {consultation.vital_signs && consultation.vital_signs.length > 0 ? (
          <React.Fragment>
            <Subheader
              title="Vital Signs"
              style={{ marginBottom: 8 }}
            />
            <Table
              caption=""
              columns={[
                {
                  field: "created_at",
                  headerName: "Date",
                  valueGetter: (item) => item.created_at,
                  flex: 1.2,
                },
                {
                  field: "temperature",
                  headerName: "Temp (°C)",
                  valueGetter: (item) => item.temperature,
                },
                {
                  field: "bp",
                  headerName: "BP (mmHg)",
                  valueGetter: (item) =>
                    item.systolic_bp ? `${item.systolic_bp}/${item.diastolic_bp}` : "",
                },
                {
                  field: "heart_rate",
                  headerName: "HR",
                  valueGetter: (item) => item.heart_rate,
                },
                {
                  field: "respiratory_rate",
                  headerName: "RR",
                  valueGetter: (item) => item.respiratory_rate,
                },
                {
                  field: "oxygen_saturation",
                  headerName: "SpO2 (%)",
                  valueGetter: (item) => item.oxygen_saturation,
                },
                {
                  field: "weight_kg",
                  headerName: "Wt (kg)",
                  valueGetter: (item) => item.weight_kg,
                },
                {
                  field: "bmi",
                  headerName: "BMI",
                  valueGetter: (item) => item.bmi_calculated,
                },
                {
                  field: "triage_category",
                  headerName: "Category",
                  valueGetter: (item) => item.triage_category,
                },
              ]}
              items={consultation.vital_signs}
            />
          </React.Fragment>
        ) : null}

        {/* Laboratory Results */}
        {consultation.lab_results && consultation.lab_results.length > 0 ? (
          <React.Fragment>
            <Subheader
              title="Laboratory Results"
              style={{ marginBottom: 8 }}
            />
            {consultation.lab_results.map((request, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text
                  style={[
                    styles.text,
                    { fontSize: 9, fontWeight: "bold", marginBottom: 4, color: "#039be5" },
                  ]}
                >
                  {request.request_no} - {request.status} ({request.created_at})
                </Text>
                <Table
                  caption=""
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, i) => i + 1,
                      flex: 0.25,
                    },
                    {
                      field: "test",
                      headerName: "Test",
                      valueGetter: (item) => item.lab_test?.name || item.labTest?.name || "N/A",
                    },
                    {
                      field: "result",
                      headerName: "Result",
                      valueGetter: (item) => item.result,
                    },
                    {
                      field: "unit",
                      headerName: "Unit",
                      valueGetter: (item) => item.unit,
                    },
                    {
                      field: "reference_range",
                      headerName: "Ref. Range",
                      valueGetter: (item) => item.reference_range,
                    },
                    {
                      field: "status",
                      headerName: "Status",
                      valueGetter: (item) => item.status,
                    },
                  ]}
                  items={request.tests || []}
                />
              </View>
            ))}
          </React.Fragment>
        ) : null}

        {/* Radiology Results */}
        {consultation.radiology_results && consultation.radiology_results.length > 0 ? (
          <React.Fragment>
            <Subheader
              title="Radiology Results"
              style={{ marginBottom: 8 }}
            />
            {consultation.radiology_results.map((request, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text
                  style={[
                    styles.text,
                    { fontSize: 9, fontWeight: "bold", marginBottom: 4, color: "#039be5" },
                  ]}
                >
                  {request.request_no} - {request.status} ({request.created_at})
                </Text>
                <Table
                  caption=""
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, i) => i + 1,
                      flex: 0.25,
                    },
                    {
                      field: "exam",
                      headerName: "Exam",
                      valueGetter: (item) => item.radiology_exam?.name || item.radiologyExam?.name || "N/A",
                    },
                    {
                      field: "findings",
                      headerName: "Findings",
                      valueGetter: (item) => item.findings,
                    },
                    {
                      field: "impression",
                      headerName: "Impression",
                      valueGetter: (item) => item.impression,
                    },
                    {
                      field: "conclusion",
                      headerName: "Conclusion",
                      valueGetter: (item) => item.conclusion,
                    },
                  ]}
                  items={request.exams || []}
                />
              </View>
            ))}
          </React.Fragment>
        ) : null}

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
                  {consultation.visual_acuity.unaided_re_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_le_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.aided_re_va}{" "}
                  {consultation.visual_acuity.aided_re_va_description}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.aided_le_va}{" "}
                  {consultation.visual_acuity.aided_le_va_description}
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
                  {consultation.visual_acuity.unaided_re_ph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_le_ph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 64 },
                  ]}
                >
                  IPD
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.visual_acuity.unaided_ipd}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.external_examination ? (
          <React.Fragment>
            <Subheader
              title="External Examination"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCell, { flex: 0.25 }]} />
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
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  LID
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_lid}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_lid}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  SCRELA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_sclera}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_sclera}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  CORNEA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_cornea}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_cornea}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  CONJUCTIVA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_conjuctiva}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_conjuctiva}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  IRIS
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_iris}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_iris}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  PUPIL
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_pupil}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_pupil}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  LENS
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_lens}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_lens}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.25 }]}
                >
                  IOP
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.re_iop}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.external_examination.le_iop}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.functional_tests ? (
          <React.Fragment>
            <Subheader
              title="Functional Tests"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCell, { flex: 0.3 }]} />
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
                  style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}
                >
                  NPC
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.re_npc}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.le_npc}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}
                >
                  NPA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.re_npa}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.le_npa}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}
                >
                  CONFRONTATION
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.re_confrontation}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.le_confrontation}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[styles.text, tableStyles.tableCell, { flex: 0.3 }]}
                >
                  COVER TEST
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.re_cover_test}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.functional_tests.le_cover_test}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.refraction ? (
          <React.Fragment>
            {/* Objective Refraction */}
            <Subheader
              title="Examination Details - Objective Examination"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 12 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
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
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  SPH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  CYL
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  AXIS
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  SPH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  CYL
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  AXIS
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_re_sph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_re_cyl}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_re_axis}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_re_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_le_sph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_le_cyl}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_le_axis}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.ob_le_va}
                </Text>
              </View>
            </View>

            {/* Subjective Refraction */}
            <Subheader
              title="Examination Details - Subjective Examination"
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
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  SPH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  CYL
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  AXIS
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  SPH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  CYL
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  AXIS
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_sph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_cyl}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_axis}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_sph}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_cyl}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_axis}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_va}
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  ADD
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  ADD
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  VA
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_add}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_re_add_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_add}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.refraction.sub_le_add_va}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]} />
                <Text style={[styles.text, tableStyles.tableCell]} />
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.fundoscopy ? (
          <React.Fragment>
            <Subheader
              title="Fundoscopy"
              style={{ marginBottom: 8 }}
            />

            <Table
              containerStyle={{ marginBottom: 8 }}
              columns={[
                {
                  field: "re",
                  headerName: "RE",
                },
                {
                  field: "le",
                  headerName: "LE",
                },
              ]}
              items={[
                {
                  re: consultation.fundoscopy.re,
                  le: consultation.fundoscopy.le,
                },
              ]}
            />
          </React.Fragment>
        ) : null}

        {!referralData && (
          <React.Fragment>
            <Subheader
              title={
                consultation.patient_direction === "Direct to Doctor"
                  ? "Diagnosis & Management"
                  : "Management"
              }
              style={{ marginBottom: 8 }}
            />

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {consultation.patient_direction === "Direct to Doctor" ? (
                <View style={{ width: "50%", paddingRight: 4, marginBottom: 8 }}>
                  <DiagnosisCard
                    title="Diagnosis"
                    diagnosisType="Final"
                    items={consultation.diagnoses}
                  />
                </View>
              ) : null}
              <View
                style={{
                  width: "50%",
                  paddingLeft:
                    consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
                  paddingRight:
                    consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
                  marginBottom: 8,
                }}
              >
                <ConsultationItemsCard
                  title="Medicine"
                  consultationType="Pharmacy"
                  items={consultation.items}
                />
              </View>
              <View
                style={{
                  width: "50%",
                  paddingLeft:
                    consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
                  paddingRight:
                    consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
                  marginBottom: 8,
                }}
              >
                <ConsultationItemsCard
                  title="Procedure"
                  consultationType="Procedure"
                  items={consultation.items}
                />
              </View>
              <View
                style={{
                  width: "50%",
                  paddingLeft:
                    consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
                  paddingRight:
                    consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
                  marginBottom: 8,
                }}
              >
                <ConsultationItemsCard
                  title="Dispensing"
                  consultationType="Glass"
                  items={consultation.items}
                />
              </View>
              <View
                style={{
                  width: "50%",
                  paddingLeft:
                    consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
                  paddingRight:
                    consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
                  marginBottom: 8,
                }}
              >
                <ConsultationItemsCard
                  title="Others"
                  consultationType="Others"
                  items={consultation.items}
                />
              </View>
            </View>
          </React.Fragment>
        )}

        {/* Remark & Doctor Recommendation - hidden for referral documents */}
        {!referralData && (
          <React.Fragment>
            <Subheader
              title="Remark & Doctor Recommendation"
              style={{ marginBottom: 8 }}
            />

            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <View style={{ width: "50%", paddingRight: 8 }}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontWeight: "bold",
                      marginBottom: 4,
                      fontSize: 9,
                      color: "#039be5",
                    },
                  ]}
                >
                  Remark
                </Text>
                <Text style={[styles.text, { fontSize: 8, minHeight: 40 }]}>
                  {consultation.remarks || ""}
                </Text>
              </View>
              <View style={{ width: "50%", paddingLeft: 8 }}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontWeight: "bold",
                      marginBottom: 4,
                      fontSize: 9,
                      color: "#039be5",
                    },
                  ]}
                >
                  Doctor Recommendation
                </Text>
                <Text style={[styles.text, { fontSize: 8, minHeight: 40 }]}>
                  {consultation.doctor_comments_remarks || ""}
                </Text>
              </View>
            </View>
          </React.Fragment>
        )}

        {consultation.status === "Consulted" && consultation.patient_to_return ? (
          <React.Fragment>
            <Subheader
              title="Follow-up Information"
              style={{ marginBottom: 8 }}
            />

            <Descriptions
              columns={2}
              items={[
                {
                  label: "Patient to Return",
                  value: consultation.patient_to_return,
                },
                { label: "Return Date", value: consultation.to_return_date },
              ]}
              containerStyle={{
                marginBottom: 8,
              }}
            />
          </React.Fragment>
        ) : null}

        {/* Referral Information - Show if referral exists */}
        {referralData ? (
          <React.Fragment>
            <Subheader
              title="Referral Information"
              style={{ marginBottom: 8 }}
            />

            {/* Referred To Info */}
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.text, { fontSize: 8, fontWeight: 'bold', marginBottom: 2 }]}>
                Referred To:
              </Text>
              <Text style={[styles.text, { fontSize: 8 }]}>
                {`${referralData.referred_to_name || "N/A"}${referralData.referred_to_type ? ` (${referralData.referred_to_type})` : ""}`}
              </Text>
            </View>

            {/* Action Taken */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontWeight: "bold",
                    marginBottom: 4,
                    fontSize: 10,
                    color: "#000",
                  },
                ]}
              >
                ACTION TAKEN:
              </Text>
              <Text style={[styles.text, { fontSize: 9, lineHeight: 1.4 }]}>
                {referralData.clinical_summary || ""}
              </Text>
            </View>

            {/* Reason for Referral */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontWeight: "bold",
                    marginBottom: 4,
                    fontSize: 10,
                    color: "#000",
                  },
                ]}
              >
                REASON FOR REFERRAL:
              </Text>
              <Text style={[styles.text, { fontSize: 9, lineHeight: 1.4 }]}>
                {referralData.referral_reason || ""}
              </Text>
            </View>
          </React.Fragment>
        ) : null}

        <Footer
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>

      {consultation.patient_direction === "Direct to Doctor" ? (
        <React.Fragment>
          {consultation.templates?.surgery_record_report ? (
            <SurgeryRecordReportPage
              surgeryRecordReport={consultation.templates.surgery_record_report}
              patient={patient}
            />
          ) : null}
          {consultation.templates?.cataract_surgery_record ? (
            <CataractSurgeryRecordPage
              cataractSurgeryRecord={
                consultation.templates.cataract_surgery_record
              }
              patient={patient}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </Document>
  );
};

const PDFReport = ({ consultationId, patient, includeReferral, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const {
    data: consultation,
    loading: loadingConsultation,
    handleFetch,
  } = useFetch(
    `api/consultations/${consultationId}`,
    {
      with_diagnoses: "Yes",
      with_items: "Yes",
      with_item_templates: "Yes",
      with_referral: "Yes",
      with_lab_results: "Yes",
      with_radiology_results: "Yes",
      with_vital_signs: "Yes",
    },
    false,
    null,
    (response) => response.data.data
  );

  const generatePdfDocument = useCallback(async () => {
    if (consultation && patient) {
      setLoading(true);
      try {
        console.log('Starting PDF generation...', { consultation, patient });
        
        // Validate required data
        if (!consultation.id || !patient.id) {
          throw new Error('Missing consultation or patient ID');
        }
        
        // Create the PDF document with error handling
        const pdfDocument = (
          <PDFReportDocument
            consultation={consultation}
            patient={patient}
            includeReferral={includeReferral}
          />
        );
        
        console.log('PDF document created, generating blob...');
        
        const blob = await pdf(pdfDocument).toBlob();
        
        if (!blob || blob.size === 0) {
          throw new Error('Generated PDF is empty or invalid');
        }
        
        console.log('PDF blob created successfully', { size: blob.size, type: blob.type });
        
        // Create a download link instead of opening in new tab
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clinical-notes-${patient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log('PDF download initiated successfully');
      } catch (error) {
        console.error('PDF generation failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          consultation: consultation,
          patient: patient,
          errorType: error.constructor.name
        });
        
        // More user-friendly error messages
        let errorMessage = 'Failed to generate PDF. ';
        if (error.message.includes('font')) {
          errorMessage += 'Font loading issue. Please refresh the page and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network issue. Please check your connection and try again.';
        } else {
          errorMessage += `Error: ${error.message}. Please try again.`;
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('Missing required data for PDF generation:', { consultation, patient });
      alert('Missing consultation or patient data. Please refresh the page and try again.');
    }
  }, [consultation, patient, includeReferral]);

  const handleDownload = useCallback(async () => {
    if (!consultationId || !patient?.id) {
      alert('Missing consultation or patient data. Please refresh the page.');
      return;
    }
    
    // Fetch consultation data if not already loaded
    if (!consultation && !loadingConsultation) {
      await handleFetch();
      // generatePdfDocument will be called via useEffect when consultation loads
      return;
    }
    
    // If consultation is already loaded, generate PDF directly
    if (consultation && patient) {
      await generatePdfDocument();
    }
  }, [consultation, consultationId, patient, loadingConsultation, handleFetch, generatePdfDocument]);

  // Handle PDF generation when consultation is loaded after fetch
  const [shouldGenerateOnLoad, setShouldGenerateOnLoad] = useState(false);
  
  useEffect(() => {
    if (consultation && patient && shouldGenerateOnLoad && !loadingConsultation) {
      generatePdfDocument();
      setShouldGenerateOnLoad(false);
    }
  }, [consultation, patient, shouldGenerateOnLoad, loadingConsultation, generatePdfDocument]);
  
  // Update handleDownload to set flag when fetching
  const handleDownloadWithFlag = useCallback(async () => {
    if (!consultationId || !patient?.id) {
      alert('Missing consultation or patient data. Please refresh the page.');
      return;
    }
    
    // Fetch consultation data if not already loaded
    if (!consultation && !loadingConsultation) {
      setShouldGenerateOnLoad(true);
      await handleFetch();
      return;
    }
    
    // If consultation is already loaded, generate PDF directly
    if (consultation && patient) {
      await generatePdfDocument();
    }
  }, [consultation, consultationId, patient, loadingConsultation, handleFetch, generatePdfDocument]);

  return (
    <Button
      disabled={loading || loadingConsultation}
      variant="contained"
      color="secondary"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadWithFlag}
      {...rest}
    >
      {loadingConsultation || loading ? "Generating PDF..." : "Clinical Note"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    // Use Helvetica which is built into PDF viewers
    fontFamily: "Helvetica",
  },
});

export default PDFReport;
export { PDFReportDocument };

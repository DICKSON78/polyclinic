import React from "react";
import { Document, Page, View, Text, StyleSheet, pdf } from "@react-pdf/renderer";
import Header from "../../../components/pdf/Header";
import Descriptions from "../../../components/pdf/Descriptions";
import { styles as tableStyles } from "../../../components/pdf/Table";

// Subheader component for section titles
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

// Sick Sheet PDF Component - Similar to Clinical Note but with specific sections omitted
const SickSheetDocument = ({ consultation, patient, sickSheetData }) => {
  // Helper function to calculate age
  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Document
      title="Sick Sheet"
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
          title="Sick Sheet"
          subtitle={patient.full_name}
        />

        {/* Patient Details */}
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

        {/* Visual Acuity - Only if available */}
        {consultation.visual_acuity ? (
          <React.Fragment>
            <Subheader
              title="Clinical Assessment"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View
                  style={[tableStyles.tableCellNoFlex, { width: 64 }]}
                />
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
                />
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Aided
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                />
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View
                  style={[tableStyles.tableCellNoFlex, { width: 64 }]}
                />
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

        {/* Diagnosis and Management */}
        <Subheader
          title="Diagnosis and Management"
          style={{ marginBottom: 8 }}
        />

        {consultation.diagnoses && consultation.diagnoses.length > 0 ? (
          <View style={[tableStyles.table, { marginBottom: 8 }]}>
            <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
              <Text
                style={[
                  styles.text,
                  tableStyles.tableCellNoFlex,
                  { width: 27, fontWeight: "bold" },
                ]}
              >
                S/N
              </Text>
              <Text
                style={[
                  styles.text,
                  tableStyles.tableCell,
                  { fontWeight: "bold" },
                ]}
              >
                Disease Name
              </Text>
              <Text
                style={[
                  styles.text,
                  tableStyles.tableCellNoFlex,
                  { width: 48, fontWeight: "bold" },
                ]}
              >
                Code
              </Text>
            </View>
            {consultation.diagnoses.map((diagnosis, index) => (
              <View key={index} style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 27 },
                  ]}
                >
                  {index + 1}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {diagnosis.disease?.name || "-"}
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 48 },
                  ]}
                >
                  {diagnosis.disease?.code || "-"}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.text, { marginBottom: 8 }]}>
            No diagnosis recorded
          </Text>
        )}

        {/* Management Items (Pharmacy/Glass) */}
        {consultation.items && consultation.items.length > 0 ? (
          <React.Fragment>
            <Subheader
              title="Management"
              style={{ marginBottom: 8 }}
            />
            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    { width: 27, fontWeight: "bold" },
                  ]}
                >
                  S/N
                </Text>
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
                  Dosage/Comments
                </Text>
              </View>
              {consultation.items.map((item, index) => (
                <View key={index} style={tableStyles.tableRow}>
                  <Text
                    style={[
                      styles.text,
                      tableStyles.tableCellNoFlex,
                      { width: 27 },
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text style={[styles.text, tableStyles.tableCell]}>
                    {item.item?.name || "-"}
                  </Text>
                  <Text style={[styles.text, tableStyles.tableCell]}>
                    {item.dosage || item.comments || "-"}
                  </Text>
                </View>
              ))}
            </View>
          </React.Fragment>
        ) : null}

        {/* Follow-up Information */}
        {(consultation.patient_to_return === "Yes" || consultation.to_return_date || consultation.return_reason) ? (
          <React.Fragment>
            <Subheader
              title="Follow-up Information"
              style={{ marginBottom: 8 }}
            />
            <Descriptions
              columns={2}
              items={[
                { label: "Patient to Return", value: consultation.patient_to_return || "No" },
                { label: "Return Date", value: consultation.to_return_date || "-" },
                { label: "Return Reason", value: consultation.return_reason || "-" },
              ]}
              containerStyle={{
                marginBottom: 8,
              }}
            />
          </React.Fragment>
        ) : null}

        {/* Sick Sheet Specific Information (hidden: date range and number of days) */}
        {/* The date-from, date-to and number-of-days fields have been removed from the PDF output as requested. */}

        {/* Doctor Comments (from sick sheet form) */}
        {sickSheetData?.doctor_comment && (
          <React.Fragment>
            <Subheader
              title="Doctor Comments"
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.text, { marginBottom: 8 }]}> 
              {sickSheetData.doctor_comment}
            </Text>
          </React.Fragment>
        )}

        {/* Footer with signature area */}
        <View style={{ marginTop: 16, borderTop: "1px solid #e0e0e0", paddingTop: 8 }}>
          <Text style={[styles.text, { marginBottom: 24 }]}>
            Date: {new Date().toLocaleDateString()}
          </Text>
          <Text style={[styles.text]}>
            _______________________________
          </Text>
          <Text style={[styles.text, { fontSize: 7 }]}>
            Doctor's Signature & Stamp
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Helvetica",
  },
});

export default SickSheetDocument;

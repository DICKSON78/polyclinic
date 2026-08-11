import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import Grid from "../../../components/pdf/Grid";
import { styles as tableStyles } from "../../../components/pdf/Table";

import useFetch from "../../../hooks/useFetch";
import { getAge } from "../../../helpers";
import { CATARACT_SURGERY_RECORD_OPTIONS } from "../../../constants";

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

const Radio = ({ style, checked, label }) => {
  return (
    <View style={{ display: "flex", flexDirection: "row", ...style }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: 10,
          height: 10,
          borderRadius: 5,
          border: `1pt solid ${checked ? "#00225f" : "#808080"}`,
        }}
      >
        {checked ? (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#00225f",
            }}
          />
        ) : null}
      </View>
      {label ? (
        <Text
          style={[
            styles.text,
            { fontSize: tableStyles.tableCell.fontSize, marginLeft: 4 },
          ]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
};

const PDFReportPage = ({ cataractSurgeryRecord, patient }) => {
  const postoperativeData = useMemo(() => {
    if (cataractSurgeryRecord.postoperative_data) {
      return cataractSurgeryRecord.postoperative_data.split("||");
    }

    return [];
  }, [cataractSurgeryRecord]);

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
        title="Surgical Record"
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
        title="B: Preoperative Examination"
        style={{ marginBottom: 8 }}
      />

      <View style={[tableStyles.table, { marginBottom: 8 }]}>
        <View style={tableStyles.tableRow}>
          <View
            style={[
              tableStyles.tableCellNoFlex,
              {
                width: "60%",
                padding: 0,
                borderLeftWidth: 0,
                borderTopWidth: 0,
              },
            ]}
          >
            <View
              style={[
                tableStyles.table,
                { borderRightWidth: 0, borderBottomWidth: 0 },
              ]}
            >
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <View style={[tableStyles.tableCellNoFlex, { width: 160 }]} />
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
                    tableStyles.lightGrey,
                    { width: 80 },
                  ]}
                >
                  Clinical Assessment
                </Text>
                <View
                  style={[
                    tableStyles.tableCell,
                    tableStyles.table,
                    { padding: 0 },
                  ]}
                >
                  <View style={[tableStyles.tableRow]}>
                    <Text
                      style={[
                        styles.text,
                        tableStyles.tableCellNoFlex,
                        tableStyles.lightGrey,
                        { width: 80 },
                      ]}
                    >
                      Presenting VA
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {cataractSurgeryRecord.unaided_re_va}
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {cataractSurgeryRecord.unaided_le_va}
                    </Text>
                  </View>
                  <View style={[tableStyles.tableRow]}>
                    <Text
                      style={[
                        styles.text,
                        tableStyles.tableCellNoFlex,
                        tableStyles.lightGrey,
                        { width: 80 },
                      ]}
                    >
                      Best or Pinhole VA
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {cataractSurgeryRecord.aided_re_va}
                    </Text>
                    <Text style={[styles.text, tableStyles.tableCell]}>
                      {cataractSurgeryRecord.aided_le_va}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCellNoFlex,
                    tableStyles.lightGrey,
                    { width: 80 },
                  ]}
                >
                  Examination
                </Text>
                <View
                  style={[
                    tableStyles.tableCell,
                    tableStyles.table,
                    { padding: 0 },
                  ]}
                >
                  {CATARACT_SURGERY_RECORD_OPTIONS.lensExamination.map(
                    (e, i) => (
                      <View
                        key={e.value}
                        style={[tableStyles.tableRow]}
                      >
                        <Text
                          style={[
                            styles.text,
                            tableStyles.tableCellNoFlex,
                            tableStyles.lightGrey,
                            { width: 80 },
                          ]}
                        >
                          {e.label}
                        </Text>
                        <View style={tableStyles.tableCell}>
                          <Radio
                            checked={
                              cataractSurgeryRecord.lens_examination_re ===
                              e.value
                            }
                          />
                        </View>
                        <View style={tableStyles.tableCell}>
                          <Radio
                            checked={
                              cataractSurgeryRecord.lens_examination_le ===
                              e.value
                            }
                          />
                        </View>
                      </View>
                    )
                  )}
                </View>
              </View>
              <View style={tableStyles.tableRow}>
                <View style={tableStyles.tableCell}>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                        padding: tableStyles.tableCell.padding,
                      },
                    ]}
                  >
                    Other ocular pathology in the eye to be operated, likely to
                    affect outcome
                  </Text>
                  <Grid
                    columns={1}
                    containerStyle={{
                      padding: tableStyles.tableCell.padding,
                    }}
                  >
                    {CATARACT_SURGERY_RECORD_OPTIONS.otherOcularPathology.map(
                      (e, i) => (
                        <Radio
                          key={e.value}
                          checked={
                            cataractSurgeryRecord.other_ocular_pathology ===
                            e.value
                          }
                          label={e.label}
                        />
                      )
                    )}

                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: tableStyles.tableCell.fontSize,
                          borderBottom: "1pt dotted #666666",
                        },
                      ]}
                    >
                      {cataractSurgeryRecord.other_ocular_pathology_specify}
                    </Text>
                  </Grid>
                </View>
              </View>
            </View>
          </View>
          <View style={[tableStyles.tableCell, { padding: 0 }]}>
            <Text
              style={[
                styles.text,
                {
                  fontSize: tableStyles.tableCell.fontSize,
                  fontWeight: "bold",
                  padding: tableStyles.tableCell.padding,
                },
              ]}
            >
              Category of Clinical Assessment (Snellen 6 m)
            </Text>
            <Grid
              columns={2}
              containerStyle={{
                padding: tableStyles.tableCell.padding,
              }}
            >
              {CATARACT_SURGERY_RECORD_OPTIONS.vaCategories.map((e, i) => (
                <View
                  key={e.value}
                  style={styles.row}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {i + 1}
                  </Text>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        marginLeft: 8,
                      },
                    ]}
                  >
                    {e.label}
                  </Text>
                </View>
              ))}
            </Grid>
            <View style={[styles.divider, { marginVertical: 4 }]} />
            <Text
              style={[
                styles.text,
                {
                  fontSize: tableStyles.tableCell.fontSize,
                  fontWeight: "bold",
                  padding: tableStyles.tableCell.padding,
                },
              ]}
            >
              Clinical Data
            </Text>
            <Text
              style={[
                styles.text,
                {
                  fontSize: tableStyles.tableCell.fontSize,
                  padding: tableStyles.tableCell.padding,
                },
              ]}
            >
              {cataractSurgeryRecord.clinical_data}
            </Text>
          </View>
        </View>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Optional
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={tableStyles.tableCell}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Eye to be operated:
                  </Text>
                  {["RE", "LE"].map((e, i) => (
                    <Radio
                      key={e}
                      checked={cataractSurgeryRecord.operated_eye === e}
                      label={e}
                      style={{ marginLeft: 8 }}
                    />
                  ))}
                </View>

                <View style={[styles.row, { marginTop: 4 }]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Examination:
                  </Text>
                  <Descriptions
                    columns={3}
                    items={[
                      {
                        label: "SPH",
                        value:
                          cataractSurgeryRecord.operated_eye_refraction_sph,
                      },
                      {
                        label: "CYL",
                        value:
                          cataractSurgeryRecord.operated_eye_refraction_cyl,
                      },
                      {
                        label: "AXIS",
                        value:
                          cataractSurgeryRecord.operated_eye_refraction_axis,
                      },
                    ]}
                    showFalsyValues
                    containerStyle={{ marginLeft: 16 }}
                    valueStyle={{ width: "70%" }}
                  />
                </View>
                <View style={[styles.row, { marginTop: 4 }]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Targeted postop. spherical equivalent:
                  </Text>
                  <Descriptions
                    columns={2}
                    items={[
                      {
                        label: "SPH",
                        value:
                          cataractSurgeryRecord.operated_eye_refraction_sph_postop,
                      },
                    ]}
                    showFalsyValues
                    containerStyle={{ marginLeft: 16 }}
                    valueStyle={{ width: "70%" }}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { alignItems: "flex-start" }]}>
                  <Text
                    style={[
                      styles.text,
                      {
                        fontSize: tableStyles.tableCell.fontSize,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Biometry:
                  </Text>
                  <Descriptions
                    columns={3}
                    items={[
                      {
                        label: "K1",
                        value: cataractSurgeryRecord.operated_eye_biometry_k1,
                      },
                      {
                        label: "K2",
                        value: cataractSurgeryRecord.operated_eye_biometry_k2,
                      },
                      {
                        label: "Axial length",
                        value:
                          cataractSurgeryRecord.operated_eye_biometry_axial_length,
                      },
                    ]}
                    showFalsyValues
                    containerStyle={{ marginLeft: 16 }}
                    valueStyle={{ width: "70%" }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <Subheader
        title="C: Surgery"
        style={{ marginBottom: 8 }}
      />

      <View style={[tableStyles.table, { marginBottom: 8 }]}>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell, { padding: 0 }]}>
            <View
              style={[
                tableStyles.table,
                { borderRightWidth: 0, borderBottomWidth: 0 },
              ]}
            >
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    {
                      fontWeight: "bold",
                      borderLeftWidth: 0,
                      borderTopWidth: 0,
                    },
                  ]}
                >
                  Date of operation
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold", borderTopWidth: 0 },
                  ]}
                >
                  Place of operation
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { borderLeftWidth: 0 },
                  ]}
                >
                  {cataractSurgeryRecord.operation_date}
                </Text>
                <View style={tableStyles.tableCell}>
                  <Grid columns={1}>
                    {CATARACT_SURGERY_RECORD_OPTIONS.placeOfOperation.map(
                      (e, i) => (
                        <Radio
                          key={e.value}
                          checked={
                            cataractSurgeryRecord.operation_place === e.value
                          }
                          label={e.label}
                        />
                      )
                    )}
                  </Grid>
                </View>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    {
                      fontWeight: "bold",
                      borderLeftWidth: 0,
                    },
                  ]}
                >
                  Type of surgery
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  IOL
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <View style={[tableStyles.tableCell, { borderLeftWidth: 0 }]}>
                  <Grid columns={1}>
                    {CATARACT_SURGERY_RECORD_OPTIONS.typeOfSurgery.map(
                      (e, i) => (
                        <Radio
                          key={e.value}
                          checked={
                            cataractSurgeryRecord.surgery_type === e.value
                          }
                          label={e.label}
                        />
                      )
                    )}
                  </Grid>
                </View>
                <View style={tableStyles.tableCell}>
                  <Grid columns={1}>
                    {CATARACT_SURGERY_RECORD_OPTIONS.iol.map((e, i) => (
                      <Radio
                        key={e.value}
                        checked={cataractSurgeryRecord.iol === e.value}
                        label={e.label}
                      />
                    ))}
                  </Grid>
                </View>
              </View>
            </View>
          </View>
          <View style={[tableStyles.tableCell, { padding: 0 }]}>
            <View
              style={[
                tableStyles.table,
                { borderRightWidth: 0, borderBottomWidth: 0 },
              ]}
            >
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    {
                      fontWeight: "bold",
                      borderLeftWidth: 0,
                      borderTopWidth: 0,
                    },
                  ]}
                >
                  Hospital / Camp ID
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold", borderTopWidth: 0 },
                  ]}
                >
                  Surgeon ID
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { borderLeftWidth: 0 },
                  ]}
                >
                  {cataractSurgeryRecord.hospital_id}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {cataractSurgeryRecord.surgeon_id}
                </Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold", borderLeftWidth: 0 },
                  ]}
                >
                  Training
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <View style={[tableStyles.tableCell, { borderLeftWidth: 0 }]}>
                  <Grid columns={1}>
                    {CATARACT_SURGERY_RECORD_OPTIONS.training.map((e, i) => (
                      <Radio
                        key={e.value}
                        checked={cataractSurgeryRecord.training === e.value}
                        label={e.label}
                      />
                    ))}
                  </Grid>
                </View>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold", borderLeftWidth: 0 },
                  ]}
                >
                  Operative complications in operated eye
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <View style={[tableStyles.tableCell, { borderLeftWidth: 0 }]}>
                  <Grid columns={2}>
                    {CATARACT_SURGERY_RECORD_OPTIONS.operativeComplications.map(
                      (e, i) => (
                        <Radio
                          key={e.value}
                          checked={
                            cataractSurgeryRecord.operative_complications ===
                            e.value
                          }
                          label={e.label}
                        />
                      )
                    )}
                  </Grid>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Optional
          </Text>
        </View>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Section
          </Text>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Capsulotomy
          </Text>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Type IOL
          </Text>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            IOL Power
          </Text>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Suture
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell]}>
            <Grid columns={1}>
              {CATARACT_SURGERY_RECORD_OPTIONS.section.map((e, i) => (
                <Radio
                  key={e.value}
                  checked={cataractSurgeryRecord.section === e.value}
                  label={e.label}
                />
              ))}
            </Grid>
          </View>
          <View style={[tableStyles.tableCell]}>
            <Grid columns={1}>
              {CATARACT_SURGERY_RECORD_OPTIONS.capsulotomy.map((e, i) => (
                <Radio
                  key={e.value}
                  checked={cataractSurgeryRecord.capsulotomy === e.value}
                  label={e.label}
                />
              ))}
            </Grid>
          </View>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {cataractSurgeryRecord.iol_type}
          </Text>
          <Text style={[styles.text, tableStyles.tableCell]}>
            {cataractSurgeryRecord.iol_power}
          </Text>
          <View style={[tableStyles.tableCell]}>
            <Grid columns={1}>
              {CATARACT_SURGERY_RECORD_OPTIONS.suture.map((e, i) => (
                <Radio
                  key={e.value}
                  checked={cataractSurgeryRecord.suture === e.value}
                  label={e.label}
                />
              ))}

              <Descriptions
                columns={1}
                vertical
                items={[
                  {
                    label: "Number of sutures",
                    value: cataractSurgeryRecord.number_of_sutures,
                  },
                ]}
                showFalsyValues
                containerStyle={{
                  marginTop: 4,
                }}
                valueStyle={{
                  borderBottom: "1pt dotted #666666",
                }}
              />
            </Grid>
          </View>
        </View>
      </View>

      <Subheader
        title="D: Postoperative Management"
        style={{ marginBottom: 8 }}
      />

      <View style={tableStyles.table}>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCellNoFlex,
              { fontWeight: "bold", width: 334 },
            ]}
          >
            Clinical assessment of operated eye postoperation
          </Text>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            {"Cause of presenting vision <6/60 (Key 8, 9, 10, 11, 12)"}
          </Text>
        </View>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 2 },
            ]}
          >
            Follow-up visit
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.75 },
            ]}
          >
            Presenting VA
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.75 },
            ]}
          >
            Best VA
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.5 },
            ]}
          >
            Select.
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.5 },
            ]}
          >
            Surg.
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.5 },
            ]}
          >
            Specs.
          </Text>
          <Text
            style={[
              styles.text,
              tableStyles.tableCell,
              { fontWeight: "bold", flex: 0.5 },
            ]}
          >
            Sequel.
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell, { flex: 2 }]}>
            <Descriptions
              columns={1}
              items={[
                {
                  label: "Days postop. at discharge",
                  value: postoperativeData[0],
                },
              ]}
              showFalsyValues
              valueStyle={{
                borderBottom: "1pt dotted #666666",
              }}
            />
          </View>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[1]}
          </Text>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[2]}
          </Text>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[3] === "Select"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[3] === "Surg"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[3] === "Specs"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]} />
        </View>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell, { flex: 2 }]}>
            <Descriptions
              columns={1}
              items={[
                {
                  label: "1-3 wks postop.",
                  value: postoperativeData[4],
                },
              ]}
              showFalsyValues
              valueStyle={{
                borderBottom: "1pt dotted #666666",
              }}
            />
          </View>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[5]}
          </Text>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[6]}
          </Text>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[7] === "Select"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[7] === "Surg"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[7] === "Specs"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[7] === "Sequel"} />
          </View>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell, { flex: 2 }]}>
            <Descriptions
              columns={1}
              items={[
                {
                  label: "4-11 wks postop.",
                  value: postoperativeData[8],
                },
              ]}
              showFalsyValues
              valueStyle={{
                borderBottom: "1pt dotted #666666",
              }}
            />
          </View>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[9]}
          </Text>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[10]}
          </Text>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[11] === "Select"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[11] === "Surg"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[11] === "Specs"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[11] === "Sequel"} />
          </View>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={[tableStyles.tableCell, { flex: 2 }]}>
            <Descriptions
              columns={1}
              items={[
                {
                  label: "12+ wks postop.",
                  value: postoperativeData[12],
                },
              ]}
              showFalsyValues
              valueStyle={{
                borderBottom: "1pt dotted #666666",
              }}
            />
          </View>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[13]}
          </Text>
          <Text style={[styles.text, tableStyles.tableCell, { flex: 0.75 }]}>
            {postoperativeData[14]}
          </Text>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[15] === "Select"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[15] === "Surg"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[15] === "Specs"} />
          </View>
          <View style={[tableStyles.tableCell, { flex: 0.5 }]}>
            <Radio checked={postoperativeData[15] === "Sequel"} />
          </View>
        </View>
        <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
          <Text
            style={[styles.text, tableStyles.tableCell, { fontWeight: "bold" }]}
          >
            Optional
          </Text>
        </View>
        <View style={tableStyles.tableRow}>
          <View style={tableStyles.tableCell}>
            <View style={styles.row}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: tableStyles.tableCell.fontSize,
                    fontWeight: "bold",
                  },
                ]}
              >
                Postop. Examination:
              </Text>
              <Descriptions
                columns={3}
                items={[
                  {
                    label: "SPH",
                    value: postoperativeData[16],
                  },
                  {
                    label: "CYL",
                    value: postoperativeData[17],
                  },
                  {
                    label: "AXIS",
                    value: postoperativeData[18],
                  },
                ]}
                showFalsyValues
                containerStyle={{ marginLeft: 16 }}
                valueStyle={{ width: "70%" }}
              />
            </View>
          </View>
        </View>
      </View>

      <Footer
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </Page>
  );
};

const PDFReportDocument = ({ cataractSurgeryRecord, patient }) => {
  return (
    <Document
      title="Surgical Record"
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <PDFReportPage
        cataractSurgeryRecord={cataractSurgeryRecord}
        patient={patient}
      />
    </Document>
  );
};

const PDFReport = ({ cataractSurgeryRecordId, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const {
    data: cataractSurgeryRecord,
    loading: loadingCataractSurgeryRecord,
    handleFetch,
  } = useFetch(
    `api/cataract-surgery-records/${cataractSurgeryRecordId}`,
    null,
    false,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (cataractSurgeryRecord) {
      generatePdfDocument();
    }
  }, [cataractSurgeryRecord]);

  const generatePdfDocument = useCallback(async () => {
    if (cataractSurgeryRecord) {
      setLoading(true);
      const blob = await pdf(
        <PDFReportDocument
          cataractSurgeryRecord={cataractSurgeryRecord}
          patient={patient}
        />
      ).toBlob();
      setLoading(false);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  }, [cataractSurgeryRecord]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      onClick={handleFetch}
      {...rest}
    >
      {loadingCataractSurgeryRecord || loading ? "Generating PDF..." : "PDF"}
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
    alignItems: "center",
  },
  divider: {
    height: 0,
    borderBottom: "1pt solid #666666",
  },
});

export { PDFReportDocument, PDFReportPage };
export default PDFReport;

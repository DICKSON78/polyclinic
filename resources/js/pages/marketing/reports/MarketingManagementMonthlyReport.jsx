import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Page from "../../../components/Page";
import TextField from "../../../components/TextField";
import { useToast } from "../../../hooks";
import { hasReportAccess } from "../../../helpers";
import { downloadHTMLAsPDF } from "../../../helpers/pdfDownload";

const MarketingManagementMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const printRef = useRef();

  const customerRelationshipActivities = [
    "Total Clients Called",
    "Clients Reached Successfully",
    "Clients Reminded for Follow-up / Recheck",
    "Clients Contacted for After-Sales Feedback",
    "Clients Contacted for Marketing / Offers",
    "Number of clients who returned after follow-up",
    "Cross-selling achieved through follow-up calls",
  ];

  const getCustomerRelationshipKey = (activity) => {
    const keyMap = {
      "Total Clients Called": "totalClientsCalled",
      "Clients Reached Successfully": "clientsReachedSuccessfully",
      "Clients Reminded for Follow-up / Recheck": "clientsRemindedForFollowup",
      "Clients Contacted for After-Sales Feedback": "clientsContactedForAfterSales",
      "Clients Contacted for Marketing / Offers": "clientsContactedForMarketing",
      "Number of clients who returned after follow-up": "clientsReturnedAfterFollowup",
      "Cross-selling achieved through follow-up calls": "crossSellingAchieved",
    };
    return keyMap[activity] || activity;
  };

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: "",
    dateSubmitted: new Date(),
    customerRelationship: {
      totalClientsCalled: "",
      clientsReachedSuccessfully: "",
      clientsRemindedForFollowup: "",
      clientsContactedForAfterSales: "",
      clientsContactedForMarketing: "",
      clientsReturnedAfterFollowup: "",
      crossSellingAchieved: "",
    },
    tiktokManagement: [
      { description: "Number of contents posted", target: "", result: "" },
      { description: "New followers gained", target: "", result: "" },
      { description: "Average views per video", target: "", result: "" },
      { description: "Ads budget", target: "", result: "" },
      { description: "Ads conducted", target: "", result: "" },
    ],
    instagramManagement: [
      { description: "Number of contents posted", target: "", result: "" },
      { description: "New followers gained", target: "", result: "" },
      { description: "Ads budget", target: "", result: "" },
      { description: "Ads conducted", target: "", result: "" },
    ],
    googleManagement: "",
    reportSummary: "",
    reportRecommendation: "",
    signature: "",
    reportDate: new Date(),
  });

  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    if (!isAdmin && !hasReportAccess(privileges, "marketing", "marketing_management_monthly_report")) {
      addToast({ message: "You do not have access to this report.", severity: "error" });
      navigate("/marketing/dashboard");
    }
  }, [navigate, addToast]);

  useEffect(() => {
    document.title = `Marketing Management Monthly Report - ${window.APP_NAME}`;
    // Load reports from localStorage
    const savedReports = localStorage.getItem("marketing_management_monthly_reports");
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        setReports(parsed);
      } catch (e) {
        console.error("Error loading reports:", e);
      }
    }
  }, []);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleTiktokChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.tiktokManagement];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tiktokManagement: updated };
    });
  };

  const handleInstagramChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.instagramManagement];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, instagramManagement: updated };
    });
  };

  const handleNewReport = () => {
    setFormData({
      employeeName: "",
      dateSubmitted: new Date(),
      customerRelationship: {
        totalClientsCalled: "",
        clientsReachedSuccessfully: "",
        clientsRemindedForFollowup: "",
        clientsContactedForAfterSales: "",
        clientsContactedForMarketing: "",
        clientsReturnedAfterFollowup: "",
        crossSellingAchieved: "",
      },
      tiktokManagement: [
        { description: "Number of contents posted", target: "", result: "" },
        { description: "New followers gained", target: "", result: "" },
        { description: "Average views per video", target: "", result: "" },
        { description: "Ads budget", target: "", result: "" },
        { description: "Ads conducted", target: "", result: "" },
      ],
      instagramManagement: [
        { description: "Number of contents posted", target: "", result: "" },
        { description: "New followers gained", target: "", result: "" },
        { description: "Ads budget", target: "", result: "" },
        { description: "Ads conducted", target: "", result: "" },
      ],
      googleManagement: "",
      reportSummary: "",
      reportRecommendation: "",
      signature: "",
      reportDate: new Date(),
    });
    setSelectedReportId(null);
  };

  const handleEdit = (report) => {
    setFormData({
      ...report,
      dateSubmitted: report.dateSubmitted ? new Date(report.dateSubmitted) : new Date(),
      reportDate: report.reportDate ? new Date(report.reportDate) : new Date(),
    });
    setSelectedReportId(report.id);
  };

  const handleSave = () => {
    const reportToSave = {
      ...formData,
      id: selectedReportId || Date.now(),
      createdAt: selectedReportId
        ? reports.find((r) => r.id === selectedReportId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedReports;
    if (selectedReportId) {
      updatedReports = reports.map((r) => (r.id === selectedReportId ? reportToSave : r));
    } else {
      updatedReports = [...reports, reportToSave];
    }

    setReports(updatedReports);
    localStorage.setItem("marketing_management_monthly_reports", JSON.stringify(updatedReports));
    addToast({ message: "Report saved successfully!", severity: "success" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      const updatedReports = reports.filter((r) => r.id !== id);
      setReports(updatedReports);
      localStorage.setItem("marketing_management_monthly_reports", JSON.stringify(updatedReports));
      addToast({ message: "Report deleted successfully!", severity: "success" });
      if (selectedReportId === id) {
        handleNewReport();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!printRef.current) {
        addToast({
          message: "Report content not found",
          severity: "error",
        });
        return;
      }

      const filename = `Marketing_Management_Monthly_Report_${formData.employeeName || 'Report'}_${formData.dateSubmitted ? new Date(formData.dateSubmitted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}.pdf`;
      
      await downloadHTMLAsPDF(printRef.current, filename);
      
      addToast({
        message: "Report downloaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      addToast({
        message: error.message || "Failed to download PDF",
        severity: "error",
      });
    }
  };

  return (
    <Page
      title="Marketing Management Monthly Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Reports" },
        { title: "Marketing Management Monthly Report" },
      ]}
    >
      <Card>
        <CardHeader
          title="Marketing Management Monthly Report"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleNewReport}
              >
                New Report
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                {selectedReportId ? "Update" : "Save"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          {/* Reports List */}
          {reports.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Saved Reports
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>
                        {report.dateSubmitted
                          ? new Date(report.dateSubmitted).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(report)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(report.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Report Display/Edit */}
          <Paper
            ref={printRef}
            sx={{
              p: 4,
              "@media print": {
                p: 2,
                boxShadow: "none",
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {/* Header */}
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: "center",
                  color: "#1976d2",
                  fontFamily: "serif",
                }}
              >
                Polyclinic HMS
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  textAlign: "left",
                  color: "#1976d2",
                  fontFamily: "serif",
                }}
              >
                Marketing Management Monthly Report
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Employee Name:</strong>{" "}
                      <TextField
                        fullWidth
                        value={formData.employeeName}
                        onChange={(value) => handleInputChange(null, "employeeName", value)}
                        sx={{ display: "inline-block", width: "300px", ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date Submitted:</strong>{" "}
                      <DatePicker
                        value={formData.dateSubmitted}
                        onChange={(date) => handleInputChange(null, "dateSubmitted", date)}
                        sx={{ display: "inline-block", ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

            <Divider sx={{ my: 3 }} />

            {/* TIKTOK MANAGEMENT Table */}
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
            >
              TIKTOK MANAGEMENT
            </Typography>
            <Table
              sx={{
                mb: 4,
                border: "1px solid #ccc",
                "& .MuiTableCell-root": {
                  border: "1px solid #ccc",
                  padding: "8px",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>DESCRIPTION</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    TARGET
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    RESULTS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.tiktokManagement.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      <TextField
                        fullWidth
                        value={item.target}
                        onChange={(value) => handleTiktokChange(index, "target", value)}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      <TextField
                        fullWidth
                        value={item.result}
                        onChange={(value) => handleTiktokChange(index, "result", value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* INSTAGRAM MANAGEMENT Table */}
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
            >
              INSTAGRAM MANAGEMENT
            </Typography>
            <Table
              sx={{
                mb: 4,
                border: "1px solid #ccc",
                "& .MuiTableCell-root": {
                  border: "1px solid #ccc",
                  padding: "8px",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>DESCRIPTION</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    TARGET
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    RESULTS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.instagramManagement.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      <TextField
                        fullWidth
                        value={item.target}
                        onChange={(value) => handleInstagramChange(index, "target", value)}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ccc" }}>
                      <TextField
                        fullWidth
                        value={item.result}
                        onChange={(value) => handleInstagramChange(index, "result", value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
            >
              GOOGLE MANAGEMENT
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={formData.googleManagement}
              onChange={(value) => handleInputChange(null, "googleManagement", value)}
              placeholder="Enter Google Management report..."
              sx={{ mb: 4 }}
            />

            {/* CUSTOMER RELATIONSHIP MANAGEMENT Section */}
            <Typography
              variant="h6"
              sx={{
                mt: 4,
                mb: 2,
                fontWeight: "bold",
                textAlign: "center",
                textDecoration: "underline",
              }}
            >
              CUSTOMER RELATIONSHIP MANAGEMENT
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>Activity</TableCell>
                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>Number/Summary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerRelationshipActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ border: "1px solid #ddd" }}>{activity}</TableCell>
                      <TableCell sx={{ border: "1px solid #ddd" }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={formData.customerRelationship[getCustomerRelationshipKey(activity)] || ""}
                          onChange={(value) =>
                            handleInputChange(
                              "customerRelationship",
                              getCustomerRelationshipKey(activity),
                              value
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Report Summary */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Report Summary
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Report Summary"
                value={formData.reportSummary || ""}
                onChange={(value) => handleInputChange(null, "reportSummary", value)}
              />
            </Box>

            {/* Report Recommendation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Report Recommendation
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Report Recommendation"
                value={formData.reportRecommendation || ""}
                onChange={(value) => handleInputChange(null, "reportRecommendation", value)}
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Footer - Signature and Date */}
            <Box sx={{ mt: 6, mb: 2 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>Signature:</strong>
                    <TextField
                      fullWidth
                      value={formData.signature}
                      onChange={(value) => handleInputChange(null, "signature", value)}
                      sx={{ mt: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    <strong>Date:</strong>
                    <DatePicker
                      value={formData.reportDate}
                      onChange={(date) => handleInputChange(null, "reportDate", date)}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            </LocalizationProvider>
          </Paper>
        </CardContent>
      </Card>
    </Page>
  );
};

export default MarketingManagementMonthlyReport;

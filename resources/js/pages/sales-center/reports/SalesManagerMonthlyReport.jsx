import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  TextField as MuiTextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  AssessmentRounded as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Page from "../../../components/Page";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../hooks";
import { formatError, hasReportAccess } from "../../../helpers";
import { downloadHTMLAsPDF } from "../../../helpers/pdfDownload";

const SalesManagerMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isDirectorRoute = location.pathname.includes("/director/");

  // Check access: user must have sales_center privilege OR sales_manager_monthly_report privilege
  // Admins always have access to all pages
  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    
    // Admins have access to all pages without checking privileges
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    
    if (!isAdmin && !hasReportAccess(privileges, 'sales_center', 'sales_manager_monthly_report')) {
      addToast({ 
        message: "You do not have access to this page.", 
        severity: "error" 
      });
      navigate(isDirectorRoute ? "/director/dashboard" : "/sales-center/dashboard");
    }
  }, [navigate, addToast, isDirectorRoute]);
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  // Date filter state
  const [dateFilter, setDateFilter] = useState("month"); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    employeeName: "",
    month: "",
    dateSubmitted: new Date().toISOString().split("T")[0],
    
    // Section 1: Sales Performance Summary
    salesPerformance: {
      frames: "",
      transitionLenses: "",
      bluecutLenses: "",
      progressiveTransition: "",
      progressiveBluecut: "",
      bifocalTransition: "",
      bifocalBluecut: "",
      specialOrdersChina: "",
      contactLenses: "",
    },
    
    // Section 2: Sales Targets & Achievements
    salesTargets: {
      averageDailySales: { target: "1,500,000", result: "" },
      bluecutVsOtherRatio: { target: "80%", result: "" },
      averageBifocalLensMonthly: { target: "5", result: "" },
      averageProgressiveLensMonthly: { target: "10", result: "" },
      customerConsultedVsSalesRatio: { target: "70%", result: "" },
    },
    resultsEvaluation: "",
    
    // SALES INFORMATION Section
    salesInformation: {
      singleVisionLensSold: "",
      transitionSold: "",
      bluecutSold: "",
      progressiveLensSold: "",
      bifocalLensSold: "",
      framesSold: "",
      specialOrderLens: "",
      contactLens: "",
    },
    
    // Report Summary
    reportSummary: "",
    
    // Recommendation
    recommendation: "",
    
    // Submit to Director
    submittedToDirector: false,
    directorSignature: "",
    
    // Section 3: Customer Relationship Management
    customerRelationship: {
      totalClientsCalled: "",
      clientsReachedSuccessfully: "",
      clientsRemindedForFollowup: "",
      clientsContactedForAfterSales: "",
      clientsContactedForMarketing: "",
      positiveResponses: "",
      clientsReturnedAfterFollowup: "",
      crossSellingAchieved: "",
    },
    
    // Section 4: Customer Feedback & Satisfaction
    customerFeedback: "",
    
    // Section 5: Challenges Faced
    challenges: {
      supplyStockIssues: "",
      customerObjectionsPricing: "",
      marketCompetition: "",
    },
    
    // Section 6: Achievements / Highlights
    achievements: {
      bestSellingProducts: "",
      mostSuccessfulCampaign: "",
      positiveTestimonials: "",
    },
    
    // Section 7: Recommendations
    recommendations: {
      suggestionsForImproving: "",
      newStrategiesPromotions: "",
      supportResourcesNeeded: "",
    },
    signature: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    document.title = `Sales Manager Monthly Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

  // Auto-calculate sales information when dates change
  // Note: This can be enabled when API endpoint is ready
  // useEffect(() => {
  //   if (startDate && endDate) {
  //     autoCalculateSalesInformation();
  //   }
  // }, [startDate, endDate]);

    const loadSavedReports = async () => {
    try {
      const response = await window.axios.get("api/employee-reports", {
        params: { report_type: "Monthly", per_page: 100 }
      });
      const reports = response?.data?.data?.data || [];
      const filtered = reports.filter(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return d && d._report_type === "sales_manager_report";
        } catch { return false; }
      });
      setSavedReports(filtered.map(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return { ...d, id: r.id, _api_id: r.id, timestamp: new Date(r.created_at).getTime() };
        } catch { return { id: r.id, _api_id: r.id }; }
      }));
    } catch (error) {
      console.error("Error loading saved reports:", error);
    }
  };

  const calculateDateRange = () => {
    const date = new Date(selectedDate);
    let start, end;

    switch (dateFilter) {
      case "day":
        start = new Date(date);
        end = new Date(date);
        break;
      case "week":
        const dayOfWeek = date.getDay();
        start = new Date(date);
        start.setDate(date.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "month":
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case "year":
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(date);
        end = new Date(date);
    }

    setStartDate(start);
    setEndDate(end);
  };

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

  const handleNestedInputChange = (section, subSection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      const reportData = {
        ...formData,
        dateFilter,
        selectedDate: selectedDate.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      
      let apiId = currentReportId;
      if (currentReportId) {
        await window.axios.put(`api/employee-reports/${currentReportId}`, {
          report_type: "Monthly",
          report_date: startDate ? startDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          end_date: endDate ? endDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          activities_completed: JSON.stringify({ ...reportData, _report_type: "sales_manager_report" }),
          achievements: "",
          additional_notes: "",
        });
      } else {
        const res = await window.axios.post("api/employee-reports", {
          report_type: "Monthly",
          report_date: startDate ? startDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          end_date: endDate ? endDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          activities_completed: JSON.stringify({ ...reportData, _report_type: "sales_manager_report" }),
          achievements: "",
          additional_notes: "",
        });
        apiId = res?.data?.data?.id;
        setCurrentReportId(apiId);
      }
      
      setCurrentReportId(reportId);
      loadSavedReports();
      
      addToast({
        message: currentReportId ? "Report updated successfully!" : "Report saved successfully!",
        severity: "success",
      });
    } catch (error) {
      addToast({
        message: formatError(error) || "Failed to save report",
        severity: "error",
      });
    }
  };

  const handleEdit = (report) => {
    try {
      setFormData({
        employeeName: report.employeeName || "",
        month: report.month || "",
        dateSubmitted: report.dateSubmitted || new Date().toISOString().split("T")[0],
        salesPerformance: report.salesPerformance || {
          frames: "",
          transitionLenses: "",
          bluecutLenses: "",
          progressiveTransition: "",
          progressiveBluecut: "",
          bifocalTransition: "",
          bifocalBluecut: "",
          specialOrdersChina: "",
          contactLenses: "",
        },
        salesTargets: report.salesTargets || {
          averageDailySales: { target: "1,500,000", result: "" },
          bluecutVsOtherRatio: { target: "80%", result: "" },
          averageBifocalLensMonthly: { target: "5", result: "" },
          averageProgressiveLensMonthly: { target: "10", result: "" },
          customerConsultedVsSalesRatio: { target: "70%", result: "" },
        },
        resultsEvaluation: report.resultsEvaluation || "",
        customerRelationship: report.customerRelationship || {
          totalClientsCalled: "",
          clientsReachedSuccessfully: "",
          clientsRemindedForFollowup: "",
          clientsContactedForAfterSales: "",
          clientsContactedForMarketing: "",
          positiveResponses: "",
          clientsReturnedAfterFollowup: "",
          crossSellingAchieved: "",
        },
        customerFeedback: report.customerFeedback || "",
        challenges: report.challenges || {
          supplyStockIssues: "",
          customerObjectionsPricing: "",
          marketCompetition: "",
        },
        achievements: report.achievements || {
          bestSellingProducts: "",
          mostSuccessfulCampaign: "",
          positiveTestimonials: "",
        },
        recommendations: report.recommendations || {
          suggestionsForImproving: "",
          newStrategiesPromotions: "",
          supportResourcesNeeded: "",
        },
        salesInformation: report.salesInformation || {
          singleVisionLensSold: "",
          transitionSold: "",
          bluecutSold: "",
          progressiveLensSold: "",
          bifocalLensSold: "",
          framesSold: "",
          specialOrderLens: "",
          contactLens: "",
        },
        reportSummary: report.reportSummary || "",
        recommendation: report.recommendation || "",
        submittedToDirector: report.submittedToDirector || false,
        directorSignature: report.directorSignature || "",
        signature: report.signature || "",
        reportDate: report.reportDate || new Date().toISOString().split("T")[0],
      });

      if (report.dateFilter) {
        setDateFilter(report.dateFilter);
      }
      if (report.selectedDate) {
        setSelectedDate(new Date(report.selectedDate));
      }
      if (report.startDate) {
        setStartDate(new Date(report.startDate));
      }
      if (report.endDate) {
        setEndDate(new Date(report.endDate));
      }

      setCurrentReportId(report.id);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      addToast({
        message: "Report loaded for editing",
        severity: "success",
      });
    } catch (error) {
      addToast({
        message: formatError(error) || "Failed to load report",
        severity: "error",
      });
    }
  };

  const handleDelete = (report) => {
    const component = (
      <ConfirmationDialog
        message={`Delete report for ${report.employeeName || "Unknown Employee"} (${report.month || "Unknown Month"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          try {
            await window.axios.delete(`api/employee-reports/${report._api_id || report.id}`);
            loadSavedReports();
            if (currentReportId === report.id) {
              setCurrentReportId(null);
              // Reset form
              setFormData({
                employeeName: "",
                month: "",
                dateSubmitted: new Date().toISOString().split("T")[0],
                salesPerformance: {
                  frames: "",
                  transitionLenses: "",
                  bluecutLenses: "",
                  progressiveTransition: "",
                  progressiveBluecut: "",
                  bifocalTransition: "",
                  bifocalBluecut: "",
                  specialOrdersChina: "",
                  contactLenses: "",
                },
                salesTargets: {
                  averageDailySales: { target: "1,500,000", result: "" },
                  bluecutVsOtherRatio: { target: "80%", result: "" },
                  averageBifocalLensMonthly: { target: "5", result: "" },
                  averageProgressiveLensMonthly: { target: "10", result: "" },
                  customerConsultedVsSalesRatio: { target: "70%", result: "" },
                },
                resultsEvaluation: "",
                customerRelationship: {
                  totalClientsCalled: "",
                  clientsReachedSuccessfully: "",
                  clientsRemindedForFollowup: "",
                  clientsContactedForAfterSales: "",
                  clientsContactedForMarketing: "",
                  positiveResponses: "",
                  clientsReturnedAfterFollowup: "",
                  crossSellingAchieved: "",
                },
                customerFeedback: "",
                challenges: {
                  supplyStockIssues: "",
                  customerObjectionsPricing: "",
                  marketCompetition: "",
                },
                achievements: {
                  bestSellingProducts: "",
                  mostSuccessfulCampaign: "",
                  positiveTestimonials: "",
                },
                recommendations: {
                  suggestionsForImproving: "",
                  newStrategiesPromotions: "",
                  supportResourcesNeeded: "",
                },
                salesInformation: {
                  singleVisionLensSold: "",
                  transitionSold: "",
                  bluecutSold: "",
                  progressiveLensSold: "",
                  bifocalLensSold: "",
                  framesSold: "",
                  specialOrderLens: "",
                  contactLens: "",
                },
                reportSummary: "",
                recommendation: "",
                submittedToDirector: false,
                directorSignature: "",
                signature: "",
                reportDate: new Date().toISOString().split("T")[0],
              });
            }
            modalRef.current.close();
            addToast({ message: "Report deleted successfully", severity: "success" });
          } catch (error) {
            addToast({
              message: formatError(error) || "Failed to delete report",
              severity: "error",
            });
          }
        }}
      />
    );

    modalRef.current.open("Confirm Delete", component);
  };

  const handleNewReport = () => {
    setCurrentReportId(null);
    setFormData({
      employeeName: "",
      month: "",
      dateSubmitted: new Date().toISOString().split("T")[0],
      salesPerformance: {
        frames: "",
        transitionLenses: "",
        bluecutLenses: "",
        progressiveTransition: "",
        progressiveBluecut: "",
        bifocalTransition: "",
        bifocalBluecut: "",
        specialOrdersChina: "",
        contactLenses: "",
      },
      salesTargets: {
        averageDailySales: { target: "1,500,000", result: "" },
        bluecutVsOtherRatio: { target: "80%", result: "" },
        averageBifocalLensMonthly: { target: "5", result: "" },
        averageProgressiveLensMonthly: { target: "10", result: "" },
        customerConsultedVsSalesRatio: { target: "70%", result: "" },
      },
      resultsEvaluation: "",
      customerRelationship: {
        totalClientsCalled: "",
        clientsReachedSuccessfully: "",
        clientsRemindedForFollowup: "",
        clientsContactedForAfterSales: "",
        clientsContactedForMarketing: "",
        positiveResponses: "",
        clientsReturnedAfterFollowup: "",
        crossSellingAchieved: "",
      },
      customerFeedback: "",
      challenges: {
        supplyStockIssues: "",
        customerObjectionsPricing: "",
        marketCompetition: "",
      },
      achievements: {
        bestSellingProducts: "",
        mostSuccessfulCampaign: "",
        positiveTestimonials: "",
      },
      recommendations: {
        suggestionsForImproving: "",
        newStrategiesPromotions: "",
        supportResourcesNeeded: "",
      },
      salesInformation: {
        singleVisionLensSold: "",
        transitionSold: "",
        bluecutSold: "",
        progressiveLensSold: "",
        bifocalLensSold: "",
        framesSold: "",
        specialOrderLens: "",
        contactLens: "",
      },
      reportSummary: "",
      recommendation: "",
      submittedToDirector: false,
      directorSignature: "",
      signature: "",
      reportDate: new Date().toISOString().split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    try {
      if (!printRef.current) {
        addToast({
          message: "Report content not found",
          severity: "error",
        });
        return;
      }

      const filename = `SalesManager_Monthly_Report_${formData.employeeName || 'Report'}_${formData.month || new Date().toISOString().split('T')[0]}.pdf`;
      
      await downloadHTMLAsPDF(printRef.current, filename);
      
      addToast({
        message: "Report downloaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      addToast({
        message: formatError(error) || "Failed to download report",
        severity: "error",
      });
    }
  };

  // Auto-calculate sales information from system data
  const autoCalculateSalesInformation = async () => {
    try {
      if (!startDate || !endDate) return;

      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      // Fetch sales data from the dashboard API
      const response = await window.axios.get('/api/sales-management/dashboard', { params });
      const salesData = response.data?.data;

      if (salesData) {
        // Update sales information (values will be populated from API if available)
        // For now, we'll keep manual entry but this can be auto-populated when API is ready
        // The system can fetch actual counts from PatientPaymentCacheItem based on lens types, item types, etc.
        setFormData((prev) => ({
          ...prev,
          salesInformation: {
            ...prev.salesInformation,
            // Auto-populate if API provides this data in the future
            // For now, users can manually enter or system calculates on save
          },
        }));
      }
    } catch (error) {
      console.error("Error auto-calculating sales information:", error);
      // Silently fail - allow manual entry
    }
  };

  const itemCategories = [
    { label: "Accessories", key: "frames" },
    { label: "Transition Items", key: "transitionLenses" },
    { label: "Blue-cut Items", key: "bluecutLenses" },
    { label: "Progressive transition", key: "progressiveTransition" },
    { label: "Progressive bluecut", key: "progressiveBluecut" },
    { label: "Bifocal transition", key: "bifocalTransition" },
    { label: "Bifocal bluecut", key: "bifocalBluecut" },
    { label: "Special orders (China)", key: "specialOrdersChina" },
    { label: "Contact Items", key: "contactLenses" },
  ];

  const salesInformationItems = [
    { label: "Single vision items sold", key: "singleVisionLensSold" },
    { label: "Transition sold", key: "transitionSold" },
    { label: "Bluecut sold", key: "bluecutSold" },
    { label: "Progressive items sold", key: "progressiveLensSold" },
    { label: "Bifocal items sold", key: "bifocalLensSold" },
    { label: "Accessories sold", key: "framesSold" },
    { label: "Special order items", key: "specialOrderLens" },
    { label: "Contact items", key: "contactLens" },
  ];

  return (
    <Page
      title="Sales Manager Monthly Report"
      breadcrumbs={[
        { title: "Home" },
        { title: isDirectorRoute ? "Director" : "Sales Center" },
        { title: "Reports" },
        { title: "Sales Manager Monthly Report" },
      ]}
    >
      <Box sx={{ mb: 3, "@media print": { display: "none" } }}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Select
                  fullWidth
                  label="Report Period"
                  value={dateFilter}
                  onChange={(value) => setDateFilter(value)}
                  options={[
                    { id: "day", name: "Daily" },
                    { id: "week", name: "Weekly" },
                    { id: "month", name: "Monthly" },
                    { id: "year", name: "Yearly" },
                  ]}
                  optionsLabel="name"
                  optionsValue="id"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="Select Date"
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(value || new Date())}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="Start Date"
                  value={startDate}
                  onChange={(value) => setStartDate(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  fullWidth
                  label="End Date"
                  value={endDate}
                  onChange={(value) => setEndDate(value)}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                {currentReportId && (
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    Editing saved report
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleNewReport}
                  size="small"
                >
                  New Report
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  {currentReportId ? "Update" : "Save"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Saved Reports List */}
        {savedReports.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardHeader title="Saved Reports" />
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Saved Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>{report.month || "N/A"}</TableCell>
                      <TableCell>
                        {report.dateSubmitted
                          ? new Date(report.dateSubmitted).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {report.dateFilter
                          ? report.dateFilter.charAt(0).toUpperCase() + report.dateFilter.slice(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(parseInt(report.timestamp)).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(report)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(report)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Box>

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
        {/* Header */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: "#1976d2",
            fontFamily: "serif",
          }}
        >
          Detailed Sales Manager Monthly Report
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Employee Name:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.employeeName || " "}
                </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Month:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "250px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.month || " "}
                </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date Submitted:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "250px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.dateSubmitted || " "}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Sales Targets & Sales Information - Side by Side */}
        <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
          {/* Left Side: SALES TARGETS */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
            >
              SALES TARGETS
            </Typography>
            <Table
              sx={{
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
                  <TableCell sx={{ fontWeight: 700 }}>TARGET</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>RESULTS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Average daily sales</TableCell>
                  <TableCell>{formData.salesTargets.averageDailySales.target}</TableCell>
                  <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {formData.salesTargets.averageDailySales.result || " "}
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Customer conversion ratio</TableCell>
                  <TableCell>{formData.salesTargets.bluecutVsOtherRatio.target}</TableCell>
                  <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {formData.salesTargets.bluecutVsOtherRatio.result || " "}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          {/* Right Side: SALES INFORMATION */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
            >
              SALES INFORMATION
            </Typography>
            <Table
              sx={{
                border: "1px solid #ccc",
                "& .MuiTableCell-root": {
                  border: "1px solid #ccc",
                  padding: "8px",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity Sold</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesInformationItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                      <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                        {formData.salesInformation[item.key] || " "}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
          <strong>Results evaluation & suggestions/commitments:</strong>
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "40px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.resultsEvaluation || ""}
        </Box>

        {/* REPORT SUMMARY Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          REPORT SUMMARY
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minWidth: "100%",
            width: "100%",
            paddingBottom: "2px",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.reportSummary || ""}
        </Box>

        {/* RECOMMENDATION Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          RECOMMENDATION
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000",
            minWidth: "100%",
            width: "100%",
            paddingBottom: "2px",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.recommendation || ""}
        </Box>

        {/* SUBMIT TO DIRECTOR Section */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
            SUBMIT TO DIRECTOR
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Director Signature:</strong>{" "}
              <span style={{ borderBottom: "1px solid #000", minWidth: "300px", display: "inline-block", paddingBottom: "2px" }}>
                {formData.directorSignature || "_________________________"}
              </span>
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Date Submitted:</strong>{" "}
              <span style={{ borderBottom: "1px solid #000", minWidth: "300px", display: "inline-block", paddingBottom: "2px" }}>
                {formData.submittedToDirector && formData.reportDate ? formData.reportDate : "_________________________"}
              </span>
            </Typography>
          </Box>
        </Box>

        {/* Signature and Date */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Signature:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.signature || "_________________________"}
            </span>
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "200px", display: "inline-block" }}>
              {formData.reportDate || "_________________________"}
            </span>
          </Typography>
        </Box>
      </Paper>

      {/* Editable Form (Hidden when printing) */}
      <Box sx={{ mt: 4, "@media print": { display: "none" } }}>
        <Card>
          <CardHeader title="Fill Report Data" />
          <CardContent>
            <Grid container spacing={3}>
              {/* Header Fields */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(value) => handleInputChange(null, "employeeName", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Month"
                  value={formData.month}
                  onChange={(value) => handleInputChange(null, "month", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  fullWidth
                  label="Date Submitted"
                  value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null}
                  onChange={(value) =>
                    handleInputChange(
                      null,
                      "dateSubmitted",
                      value ? value.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </Grid>

              {/* Section 2: Sales Targets */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 2: Sales Targets & Achievements
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Average Daily Sales (Result)"
                  value={formData.salesTargets.averageDailySales.result}
                  onChange={(value) =>
                    handleNestedInputChange(
                      "salesTargets",
                      "averageDailySales",
                      "result",
                      value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Bluecut vs Other Item Ratio (Result)"
                  value={formData.salesTargets.bluecutVsOtherRatio.result}
                  onChange={(value) =>
                    handleNestedInputChange(
                      "salesTargets",
                      "bluecutVsOtherRatio",
                      "result",
                      value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Average Bifocal Items Monthly (Result)"
                  value={formData.salesTargets.averageBifocalLensMonthly.result}
                  onChange={(value) =>
                    handleNestedInputChange(
                      "salesTargets",
                      "averageBifocalLensMonthly",
                      "result",
                      value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Average Progressive Items Monthly (Result)"
                  value={formData.salesTargets.averageProgressiveLensMonthly.result}
                  onChange={(value) =>
                    handleNestedInputChange(
                      "salesTargets",
                      "averageProgressiveLensMonthly",
                      "result",
                      value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Customer Consulted vs Sales Ratio (Result)"
                  value={formData.salesTargets.customerConsultedVsSalesRatio.result}
                  onChange={(value) =>
                    handleNestedInputChange(
                      "salesTargets",
                      "customerConsultedVsSalesRatio",
                      "result",
                      value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Results Evaluation & Suggestions/Commitments"
                  value={formData.resultsEvaluation}
                  onChange={(value) => handleInputChange(null, "resultsEvaluation", value)}
                />
              </Grid>

              {/* SALES INFORMATION Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  SALES INFORMATION
                </Typography>
              </Grid>
              {salesInformationItems.map((item, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={item.label}
                    value={formData.salesInformation[item.key] || ""}
                    onChange={(value) =>
                      handleInputChange("salesInformation", item.key, value)
                    }
                  />
                </Grid>
              ))}

              {/* REPORT SUMMARY Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  REPORT SUMMARY
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Report Summary"
                  value={formData.reportSummary}
                  onChange={(value) => handleInputChange(null, "reportSummary", value)}
                />
              </Grid>

              {/* RECOMMENDATION Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  RECOMMENDATION
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Recommendation"
                  value={formData.recommendation}
                  onChange={(value) => handleInputChange(null, "recommendation", value)}
                />
              </Grid>

              {/* SUBMIT TO DIRECTOR Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  SUBMIT TO DIRECTOR
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Director Signature"
                  value={formData.directorSignature}
                  onChange={(value) => handleInputChange(null, "directorSignature", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  fullWidth
                  label="Date Submitted to Director"
                  value={formData.submittedToDirector && formData.reportDate ? new Date(formData.reportDate) : null}
                  onChange={(value) => {
                    handleInputChange(null, "submittedToDirector", value ? true : false);
                    if (value) {
                      handleInputChange(null, "reportDate", value.toISOString().split("T")[0]);
                    }
                  }}
                />
              </Grid>

              {/* Signature and Date */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Signature & Date
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Signature"
                  value={formData.signature}
                  onChange={(value) => handleInputChange(null, "signature", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  fullWidth
                  label="Report Date"
                  value={formData.reportDate ? new Date(formData.reportDate) : null}
                  onChange={(value) =>
                    handleInputChange(
                      null,
                      "reportDate",
                      value ? value.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default SalesManagerMonthlyReport;


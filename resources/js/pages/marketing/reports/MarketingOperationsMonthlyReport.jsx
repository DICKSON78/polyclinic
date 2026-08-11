import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
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
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks";
import { formatError, hasReportAccess } from "../../../helpers";
import { downloadHTMLAsPDF } from "../../../helpers/pdfDownload";

const MarketingOperationsMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  
  // Check access: user must have marketing privilege OR marketing_operations_monthly_report privilege
  // Admins always have access to all pages
  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    
    // Admins have access to all pages without checking privileges
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    
    if (!isAdmin && !hasReportAccess(privileges, 'marketing', 'marketing_operations_monthly_report')) {
      addToast({ 
        message: "You do not have access to this page.", 
        severity: "error" 
      });
      navigate("/marketing/dashboard");
    }
  }, [navigate, addToast]);
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  // Date filter state
  const [dateFilter, setDateFilter] = useState("month"); // day, week, month, year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Default key responsibilities
  const keyResponsibilities = [
    "Supervise all Polyclinic HMS operations to ensure smooth daily performance.",
    "Plan and implement marketing strategies to attract new clients.",
    "Organize and monitor outreach and community programs under Polyclinic HMS Foundation.",
    "Manage insurance partnerships and follow up on new insurance applications.",
    "Handle government relations and ensure compliance with all regulatory requirements.",
    "Supervise sales, reception, and cashier departments to ensure all employees meet their Monthly targets.",
  ];

  // Default monthly targets
  const defaultMonthlyTargets = [
    {
      category: "Marketing & Branding",
      performanceIndicator: "Number of marketing campaigns conducted",
      monthlyTarget: "4 campaign",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Marketing & Branding",
      performanceIndicator: "Number of new clients reached through marketing",
      monthlyTarget: "200 new clients",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Marketing & Branding",
      performanceIndicator: "Social media engagement (growth %)",
      monthlyTarget: "20% growth",
      actualResult: "",
      remarks: "",
    },
  ];

  // Default operational tasks
  const defaultOperationalTasks = [
    {
      category: "Operations Oversight",
      task: "Staff supervision and attendance management",
      target: "100% compliance",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Operations Oversight",
      task: "Weekly staff meeting conducted",
      target: "4 meeting",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Operations Oversight",
      task: "Operational challenges resolved",
      target: "All identified issues",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Polyclinic HMS Foundation",
      task: "Outreach sponsorship applications",
      target: "8 applications",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Insurance Partnerships",
      task: "Follow-up on insurance applications",
      target: "4 review meeting",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Insurance Partnerships",
      task: "Britam customer identifications",
      target: "At least 4",
      actualResult: "",
      remarks: "",
    },
    {
      category: "Government Relations",
      task: "Compliance or license follow-up",
      target: "100% completion",
      actualResult: "",
      remarks: "",
    },
  ];

  // Default departments for staff supervision
  const defaultDepartments = ["Sales", "Reception", "Cashier"];

  // Form data state
  const [formData, setFormData] = useState({
    employeeName: "",
    dateSubmitted: new Date().toISOString().split("T")[0],
    
    // Marketing Metrics Section
    marketingMetrics: {
      totalRequiredCalls: "",
      totalClientsCalled: "",
      successfulCalls: "",
      unreachableCalls: "",
    },
    
    // TikTok Management Table
    tiktokManagement: [
      { description: "Number of contents posted", target: "", result: "" },
      { description: "New followers gained", target: "", result: "" },
      { description: "Average views per video", target: "", result: "" },
      { description: "Ads budget", target: "", result: "" },
      { description: "Ads conducted", target: "", result: "" },
    ],
    
    // Instagram Management Table
    instagramManagement: [
      { description: "Number of contents posted", target: "", result: "" },
      { description: "New followers gained", target: "", result: "" },
      { description: "Ads budget", target: "", result: "" },
      { description: "Ads conducted", target: "", result: "" },
    ],
    
    // Google Management Section
    googleManagement: "",
    
    // Section 2: Monthly Targets vs Results
    monthlyTargets: defaultMonthlyTargets,
    
    // Operational Tasks
    operationalTasks: defaultOperationalTasks,
    
    // Section 3: Supervision of Staff Performance
    staffPerformance: defaultDepartments.map((dept) => ({
      department: dept,
      employeeName: "",
      monthlyTargetSummary: "",
      actualPerformance: "",
      remarksActionPlan: "",
    })),
    
    // Section 4: Action Plan if Targets Are Not Met
    actionPlan: "",
    
    // Section 5: Observations / Challenges
    observationsChallenges: "",
    
    // Section 6: Recommendations / Plans for Next Month
    recommendations: "",
    
    // Report Summary
    reportSummary: "",
    
    // Recommendation (separate from Section 6)
    recommendation: "",
    
    signature: "",
    reportDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    document.title = `Monthly Marketing & Operations Manager Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

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

    const loadSavedReports = async () => {
    try {
      const response = await window.axios.get("api/employee-reports", {
        params: { report_type: "Monthly", per_page: 100 }
      });
      const reports = response?.data?.data?.data || [];
      const filtered = reports.filter(r => {
        try {
          const d = typeof r.activities_completed === "string" ? JSON.parse(r.activities_completed) : r.activities_completed;
          return d && d._report_type === "marketing_operations_monthly_report";
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMonthlyTargetChange = (index, field, value) => {
    setFormData((prev) => {
      const newTargets = [...prev.monthlyTargets];
      newTargets[index] = {
        ...newTargets[index],
        [field]: value,
      };
      return {
        ...prev,
        monthlyTargets: newTargets,
      };
    });
  };

  const handleOperationalTaskChange = (index, field, value) => {
    setFormData((prev) => {
      const newTasks = [...prev.operationalTasks];
      newTasks[index] = {
        ...newTasks[index],
        [field]: value,
      };
      return {
        ...prev,
        operationalTasks: newTasks,
      };
    });
  };

  const handleStaffPerformanceChange = (index, field, value) => {
    setFormData((prev) => {
      const newStaff = [...prev.staffPerformance];
      newStaff[index] = {
        ...newStaff[index],
        [field]: value,
      };
      return {
        ...prev,
        staffPerformance: newStaff,
      };
    });
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
          activities_completed: JSON.stringify({ ...reportData, _report_type: "marketing_operations_monthly_report" }),
          achievements: "",
          additional_notes: "",
        });
      } else {
        const res = await window.axios.post("api/employee-reports", {
          report_type: "Monthly",
          report_date: startDate ? startDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          end_date: endDate ? endDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          activities_completed: JSON.stringify({ ...reportData, _report_type: "marketing_operations_monthly_report" }),
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
        dateSubmitted: report.dateSubmitted || new Date().toISOString().split("T")[0],
        marketingMetrics: report.marketingMetrics || {
          totalRequiredCalls: "",
          totalClientsCalled: "",
          successfulCalls: "",
          unreachableCalls: "",
        },
        tiktokManagement: report.tiktokManagement || [
          { description: "Number of contents posted", target: "", result: "" },
          { description: "New followers gained", target: "", result: "" },
          { description: "Average views per video", target: "", result: "" },
          { description: "Ads budget", target: "", result: "" },
          { description: "Ads conducted", target: "", result: "" },
        ],
        instagramManagement: report.instagramManagement || [
          { description: "Number of contents posted", target: "", result: "" },
          { description: "New followers gained", target: "", result: "" },
          { description: "Ads budget", target: "", result: "" },
          { description: "Ads conducted", target: "", result: "" },
        ],
        googleManagement: report.googleManagement || "",
        monthlyTargets: report.monthlyTargets || defaultMonthlyTargets,
        operationalTasks: report.operationalTasks || defaultOperationalTasks,
        staffPerformance: report.staffPerformance || defaultDepartments.map((dept) => ({
          department: dept,
          employeeName: "",
          monthlyTargetSummary: "",
          actualPerformance: "",
          remarksActionPlan: "",
        })),
        actionPlan: report.actionPlan || "",
        observationsChallenges: report.observationsChallenges || "",
        recommendations: report.recommendations || "",
        reportSummary: report.reportSummary || "",
        recommendation: report.recommendation || "",
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
        message={`Delete report for ${report.employeeName || "Unknown Employee"}?`}
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
                dateSubmitted: new Date().toISOString().split("T")[0],
                marketingMetrics: {
                  totalRequiredCalls: "",
                  totalClientsCalled: "",
                  successfulCalls: "",
                  unreachableCalls: "",
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
                monthlyTargets: defaultMonthlyTargets,
                operationalTasks: defaultOperationalTasks,
                staffPerformance: defaultDepartments.map((dept) => ({
                  department: dept,
                  employeeName: "",
                  monthlyTargetSummary: "",
                  actualPerformance: "",
                  remarksActionPlan: "",
                })),
                actionPlan: "",
                observationsChallenges: "",
                recommendations: "",
                reportSummary: "",
                recommendation: "",
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
      dateSubmitted: new Date().toISOString().split("T")[0],
      marketingMetrics: {
        totalRequiredCalls: "",
        totalClientsCalled: "",
        successfulCalls: "",
        unreachableCalls: "",
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
      monthlyTargets: defaultMonthlyTargets,
      operationalTasks: defaultOperationalTasks,
      staffPerformance: defaultDepartments.map((dept) => ({
        department: dept,
        employeeName: "",
        monthlyTargetSummary: "",
        actualPerformance: "",
        remarksActionPlan: "",
      })),
      actionPlan: "",
      observationsChallenges: "",
      recommendations: "",
      reportSummary: "",
      recommendation: "",
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

      const filename = `MarketingOperations_Monthly_Report_${formData.employeeName || 'Report'}_${formData.month || new Date().toISOString().split('T')[0]}.pdf`;
      
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

  // Group monthly targets by category for display
  const groupedMonthlyTargets = formData.monthlyTargets.reduce((acc, target) => {
    if (!acc[target.category]) {
      acc[target.category] = [];
    }
    acc[target.category].push(target);
    return acc;
  }, {});

  // Group operational tasks by category for display
  const groupedOperationalTasks = formData.operationalTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {});

  return (
    <Page
      title="Monthly Marketing & Operations Manager Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing" },
        { title: "Reports" },
        { title: "Monthly Marketing & Operations Manager Report" },
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
          Monthly Marketing & Operations Manager Report
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Employee Name:</strong>{" "}
                <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
                  {formData.employeeName || " "}
                </span>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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

        {/* Section 1: Key Responsibilities */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}
        >
          1. Key Responsibilities
        </Typography>

        <Box sx={{ mb: 4 }}>
          {keyResponsibilities.map((responsibility, index) => (
            <Typography key={index} variant="body1" sx={{ mb: 1 }}>
              - {responsibility}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />



        {/* TIKTOK MANAGEMENT Table */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
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
              <TableCell sx={{ fontWeight: 700 }}>TARGET</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>RESULTS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.tiktokManagement.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {item.target || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {item.result || " "}
                  </span>
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
              <TableCell sx={{ fontWeight: 700 }}>TARGET</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>RESULTS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.instagramManagement.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {item.target || " "}
                  </span>
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", "& span": { borderBottom: "none" } }}>
                  <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                    {item.result || " "}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* GOOGLE MANAGEMENT Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          GOOGLE MANAGEMENT
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
          {formData.googleManagement || ""}
        </Box>

        <Divider sx={{ my: 3 }} />



        {/* Operational Tasks Table */}
        <Table
          sx={{
            mb: 4,
            border: "1px dashed #ccc",
            "& .MuiTableCell-root": {
              border: "1px dashed #ccc",
              padding: "8px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actual Result</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedOperationalTasks).map(([category, tasks]) =>
              tasks.map((task, index) => (
                <TableRow key={`${category}-${index}`}>
                  {index === 0 && (
                    <TableCell
                      rowSpan={tasks.length}
                      sx={{ fontWeight: 600, verticalAlign: "top" }}
                    >
                      {category}
                    </TableCell>
                  )}
                  <TableCell>{task.task}</TableCell>
                  <TableCell>{task.target}</TableCell>
                  <TableCell sx={{ border: "1px dashed #ccc", "& span": { borderBottom: "none" } }}>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {task.actualResult || " "}
                    </span>
                  </TableCell>
                  <TableCell sx={{ border: "1px dashed #ccc", "& span": { borderBottom: "none" } }}>
                    <span style={{ minWidth: "100%", display: "block", padding: "4px 0" }}>
                      {task.remarks || " "}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>



        {/* Section 4: Action Plan if Targets Are Not Met */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 1, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          2. Action Plan if Targets Are Not Met
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
          If any department fails to meet their Monthly targets, the manager must outline specific steps to improve performance in the following week. This may include additional training, motivation strategies, workload reallocation, or promotional activities to boost results.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
          Action Plan:
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.actionPlan || ""}
        </Box>

        {/* Section 5: Observations / Challenges */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          3. Observations / Challenges
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.observationsChallenges || ""}
        </Box>

        {/* Section 6: Recommendations / Plans for Next Month */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2, mt: 4, color: "#1976d2", fontFamily: "serif" }}
        >
          4. Recommendations / Plans for Next Month
        </Typography>
        <Box
          sx={{
            borderBottom: "1px solid #000", minWidth: "300px", width: "100%", paddingBottom: "2px",
            minHeight: "60px",
            mb: 4,
            p: 1,
          }}
        >
          {formData.recommendations || ""}
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

        {/* Signature and Date */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Signature:</strong>{" "}
            <span style={{ borderBottom: "1px solid #000", minWidth: "300px", width: "100%", display: "inline-block", paddingBottom: "2px" }}>
              {formData.signature || " "}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Employee Name"
                  value={formData.employeeName}
                  onChange={(value) => handleInputChange("employeeName", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  fullWidth
                  label="Date Submitted"
                  value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null}
                  onChange={(value) =>
                    handleInputChange(
                      "dateSubmitted",
                      value ? value.toISOString().split("T")[0] : ""
                    )
                  }
                />
              </Grid>



              {/* TIKTOK MANAGEMENT Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  TIKTOK MANAGEMENT
                </Typography>
              </Grid>
              {formData.tiktokManagement.map((item, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {item.description}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Target"
                      value={item.target}
                      onChange={(value) => {
                        const newTiktok = [...formData.tiktokManagement];
                        newTiktok[index] = { ...newTiktok[index], target: value };
                        handleInputChange("tiktokManagement", newTiktok);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Results"
                      value={item.result}
                      onChange={(value) => {
                        const newTiktok = [...formData.tiktokManagement];
                        newTiktok[index] = { ...newTiktok[index], result: value };
                        handleInputChange("tiktokManagement", newTiktok);
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              {/* INSTAGRAM MANAGEMENT Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  INSTAGRAM MANAGEMENT
                </Typography>
              </Grid>
              {formData.instagramManagement.map((item, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {item.description}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Target"
                      value={item.target}
                      onChange={(value) => {
                        const newInstagram = [...formData.instagramManagement];
                        newInstagram[index] = { ...newInstagram[index], target: value };
                        handleInputChange("instagramManagement", newInstagram);
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Results"
                      value={item.result}
                      onChange={(value) => {
                        const newInstagram = [...formData.instagramManagement];
                        newInstagram[index] = { ...newInstagram[index], result: value };
                        handleInputChange("instagramManagement", newInstagram);
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}

              {/* GOOGLE MANAGEMENT Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  GOOGLE MANAGEMENT
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Google Review Report"
                  value={formData.googleManagement}
                  onChange={(value) => handleInputChange("googleManagement", value)}
                  placeholder="Write a simple report on Google reviews..."
                />
              </Grid>



              {/* Operational Tasks */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Operational Tasks
                </Typography>
              </Grid>
              {formData.operationalTasks.map((task, index) => (
                <React.Fragment key={index}>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {task.category} - {task.task}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Target"
                      value={task.target}
                      onChange={(value) => handleOperationalTaskChange(index, "target", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Actual Result"
                      value={task.actualResult}
                      onChange={(value) => handleOperationalTaskChange(index, "actualResult", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Remarks"
                      value={task.remarks}
                      onChange={(value) => handleOperationalTaskChange(index, "remarks", value)}
                    />
                  </Grid>
                </React.Fragment>
              ))}



              {/* Section 4: Action Plan */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 2: Action Plan if Targets Are Not Met
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Action Plan"
                  value={formData.actionPlan}
                  onChange={(value) => handleInputChange("actionPlan", value)}
                />
              </Grid>

              {/* Section 5: Observations / Challenges */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 3: Observations / Challenges
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observations / Challenges"
                  value={formData.observationsChallenges}
                  onChange={(value) => handleInputChange("observationsChallenges", value)}
                />
              </Grid>

              {/* Section 6: Recommendations */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Section 4: Recommendations / Plans for Next Month
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Recommendations / Plans for Next Month"
                  value={formData.recommendations}
                  onChange={(value) => handleInputChange("recommendations", value)}
                />
              </Grid>

              {/* REPORT SUMMARY Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
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
                  onChange={(value) => handleInputChange("reportSummary", value)}
                />
              </Grid>

              {/* RECOMMENDATION Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
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
                  onChange={(value) => handleInputChange("recommendation", value)}
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
                  onChange={(value) => handleInputChange("signature", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  fullWidth
                  label="Report Date"
                  value={formData.reportDate ? new Date(formData.reportDate) : null}
                  onChange={(value) =>
                    handleInputChange(
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

export default MarketingOperationsMonthlyReport;


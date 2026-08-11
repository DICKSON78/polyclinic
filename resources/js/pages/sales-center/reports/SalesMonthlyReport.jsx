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

const STORAGE_KEY_PREFIX = "sales_monthly_report_";

const salesTargetsInitial = {
  averageGlassDailySales: { target: "1,500,000", result: "" },
  glassCustomerConversionRatio: { target: "80%", result: "" },
};

const salesPerformanceInitial = {
  salesClosed: "",
  afterSalesFollowUp: "",
  glassSalesConsultation: "",
  successfulSales: "",
};

const salesInformationInitial = {
  singleVisionLensSold: "",
  transitionSold: "",
  bluecutSold: "",
  progressiveLensSold: "",
  bifocalLensSold: "",
  framesSold: "",
  specialOrderLens: "",
  contactLens: "",
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

const salesPerformanceLabels = [
  { label: "Sales Closed", key: "salesClosed" },
  { label: "After Sales Follow Up", key: "afterSalesFollowUp" },
  { label: "Sales Consultation", key: "glassSalesConsultation" },
  { label: "Successful Sales", key: "successfulSales" },
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

const getDefaultFormData = () => ({
  employeeName: "",
  month: "",
  dateSubmitted: new Date().toISOString().split("T")[0],
  salesPerformance: { ...salesPerformanceInitial },
  salesTargets: JSON.parse(JSON.stringify(salesTargetsInitial)),
  salesItemCategories: itemCategories.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {}),
  resultsEvaluation: "",
  salesInformation: { ...salesInformationInitial },
  reportSummary: "",
  reportRecommendation: "",
  signature: "",
  reportDate: new Date().toISOString().split("T")[0],
});

const SalesMonthlyReport = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const modalRef = useRef(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [dateFilter, setDateFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    const isAdmin = user.role === "Admin" || user.is_admin === true || user.is_admin === 1 || user.is_admin === "1";
    if (!isAdmin && !hasReportAccess(privileges, "sales_center", "sales_monthly_report")) {
      addToast({ message: "You do not have access to this report.", severity: "error" });
      navigate("/sales-center/dashboard");
    }
  }, [navigate, addToast]);

  useEffect(() => {
    document.title = `Sales Monthly Report - ${window.APP_NAME}`;
    calculateDateRange();
    loadSavedReports();
  }, [dateFilter, selectedDate]);

  const calculateDateRange = () => {
    const date = new Date(selectedDate);
    let start, end;
    switch (dateFilter) {
      case "day":
        start = end = new Date(date);
        break;
      case "week":
        start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
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
        start = end = new Date(date);
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
          return d && d._report_type === "sales_monthly_report";
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

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNestedInputChange = (section, subSection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: { ...prev[section][subSection], [field]: value },
      },
    }));
  };

  const handleSave = () => {
    try {
      const reportId = currentReportId || `${STORAGE_KEY_PREFIX}${Date.now()}`;
      const toSave = {
        ...formData,
        dateFilter,
        selectedDate: selectedDate.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };
      localStorage.setItem(reportId, JSON.stringify(toSave));
      setCurrentReportId(reportId);
      loadSavedReports();
      addToast({ message: currentReportId ? "Report updated." : "Report saved.", severity: "success" });
    } catch (e) {
      addToast({ message: formatError(e) || "Failed to save", severity: "error" });
    }
  };

  const handleEdit = (report) => {
    setFormData({
      ...getDefaultFormData(),
      employeeName: report.employeeName || "",
      month: report.month || "",
      dateSubmitted: report.dateSubmitted || getDefaultFormData().dateSubmitted,
      salesPerformance: report.salesPerformance || salesPerformanceInitial,
      salesTargets: report.salesTargets || salesTargetsInitial,
      salesItemCategories: report.salesItemCategories || {},
      resultsEvaluation: report.resultsEvaluation || "",
      salesInformation: report.salesInformation || salesInformationInitial,
      signature: report.signature || "",
      reportDate: report.reportDate || getDefaultFormData().reportDate,
    });
    setCurrentReportId(report.id);
    if (report.selectedDate) setSelectedDate(new Date(report.selectedDate));
    if (report.dateFilter) setDateFilter(report.dateFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast({ message: "Report loaded for editing", severity: "success" });
  };

  const handleDelete = async (report) => {
    const component = (
      <ConfirmationDialog
        message={`Delete report for ${report.employeeName || "Unknown"} (${report.month || "Unknown"})?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          await window.axios.delete(`api/employee-reports/${report._api_id || report.id}`);
          loadSavedReports();
          if (currentReportId === report.id) {
            setCurrentReportId(null);
            setFormData(getDefaultFormData());
          }
          modalRef.current.close();
          addToast({ message: "Report deleted", severity: "success" });
        }}
      />
    );
    modalRef.current.open("Confirm Delete", component);
  };

  const handleNewReport = () => {
    setCurrentReportId(null);
    setFormData(getDefaultFormData());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async () => {
    if (!printRef.current) {
      addToast({ message: "Report content not found", severity: "error" });
      return;
    }
    try {
      const name = formData.employeeName || "Report";
      const month = formData.month || new Date().toISOString().split("T")[0];
      await downloadHTMLAsPDF(printRef.current, `Sales_Monthly_Report_${name}_${month}.pdf`);
      addToast({ message: "Report downloaded.", severity: "success" });
    } catch (e) {
      addToast({ message: formatError(e) || "Failed to download", severity: "error" });
    }
  };

  return (
    <Page
      title="Sales Monthly Report"
      breadcrumbs={[
        { title: "Home" },
        { title: "Sales Center" },
        { title: "Reports" },
        { title: "Sales Monthly Report" },
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
                  onChange={(v) => setDateFilter(v)}
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
                  onChange={(v) => setSelectedDate(v || new Date())}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker fullWidth label="Start Date" value={startDate} onChange={(v) => setStartDate(v)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker fullWidth label="End Date" value={endDate} onChange={(v) => setEndDate(v)} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleNewReport} size="small">
                New Report
              </Button>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  {currentReportId ? "Update" : "Save"}
                </Button>
                <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownload}>
                  Download PDF
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

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
                    <TableCell>Saved</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.employeeName || "N/A"}</TableCell>
                      <TableCell>{report.month || "N/A"}</TableCell>
                      <TableCell>
                        {report.dateSubmitted ? new Date(report.dateSubmitted).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{new Date(parseInt(report.timestamp, 10)).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(report)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(report)}>
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

      <Paper ref={printRef} sx={{ p: 4, "@media print": { p: 2, boxShadow: "none" } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3, textAlign: "center", color: "#1976d2", fontFamily: "serif" }}>
          Sales Monthly Report
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Employee Name:</strong>{" "}
              </Typography>
              <TextField fullWidth size="small" value={formData.employeeName} onChange={(v) => handleInputChange(null, "employeeName", v)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Month:</strong>{" "}
              </Typography>
              <TextField fullWidth size="small" value={formData.month} onChange={(v) => handleInputChange(null, "month", v)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date Submitted:</strong>{" "}
              </Typography>
              <DatePicker fullWidth value={formData.dateSubmitted ? new Date(formData.dateSubmitted) : null} onChange={(v) => handleInputChange(null, "dateSubmitted", v ? v.toISOString().split("T")[0] : "")} />
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* 1. Sales Performance Summary - Item Category / Quantity Sold */}
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          1. Sales Performance Summary
        </Typography>
        <Table sx={{ mb: 4, border: "1px dashed #ccc", "& .MuiTableCell-root": { border: "1px dashed #ccc", padding: "8px" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Item Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity Sold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemCategories.map((cat) => (
              <TableRow key={cat.key}>
                <TableCell>{cat.label}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.salesItemCategories[cat.key] || ""}
                    onChange={(v) => handleInputChange("salesItemCategories", cat.key, v)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 2. SALES TARGETS */}
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          2. SALES TARGETS
        </Typography>
        <Table sx={{ mb: 4, border: "1px solid #ccc", "& .MuiTableCell-root": { border: "1px solid #ccc", padding: "8px" } }}>
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
              <TableCell>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.salesTargets.averageGlassDailySales?.target ?? ""}
                  onChange={(v) => handleNestedInputChange("salesTargets", "averageGlassDailySales", "target", v)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.salesTargets.averageGlassDailySales?.result || ""}
                  onChange={(v) => handleNestedInputChange("salesTargets", "averageGlassDailySales", "result", v)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Customer conversion ratio</TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.salesTargets.glassCustomerConversionRatio?.target ?? ""}
                  onChange={(v) => handleNestedInputChange("salesTargets", "glassCustomerConversionRatio", "target", v)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.salesTargets.glassCustomerConversionRatio?.result || ""}
                  onChange={(v) => handleNestedInputChange("salesTargets", "glassCustomerConversionRatio", "result", v)}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* 3. SALES PERFORMANCE (draft) */}
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          3. SALES PERFORMANCE
        </Typography>
        <Table sx={{ mb: 4, border: "1px solid #ccc", "& .MuiTableCell-root": { border: "1px solid #ccc", padding: "8px" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Number / Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesPerformanceLabels.map((item) => (
              <TableRow key={item.key}>
                <TableCell>{item.label}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.salesPerformance[item.key] || ""}
                    onChange={(v) => handleInputChange("salesPerformance", item.key, v)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 4. SALES INFORMATION */}
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2, color: "#1976d2", fontFamily: "serif" }}>
          4. SALES INFORMATION
        </Typography>
        <Table sx={{ mb: 4, border: "1px solid #ccc", "& .MuiTableCell-root": { border: "1px solid #ccc", padding: "8px" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity Sold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesInformationItems.map((item) => (
              <TableRow key={item.key}>
                <TableCell>{item.label}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.salesInformation[item.key] || ""}
                    onChange={(v) => handleInputChange("salesInformation", item.key, v)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic" }}>
          <strong>Results evaluation & suggestions/commitments:</strong>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={formData.resultsEvaluation}
          onChange={(v) => handleInputChange(null, "resultsEvaluation", v)}
          sx={{ mb: 4 }}
        />

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

        <Box sx={{ mt: 4, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Signature:</strong>
              </Typography>
              <TextField fullWidth size="small" value={formData.signature} onChange={(v) => handleInputChange(null, "signature", v)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date:</strong>
              </Typography>
              <DatePicker fullWidth value={formData.reportDate ? new Date(formData.reportDate) : null} onChange={(v) => handleInputChange(null, "reportDate", v ? v.toISOString().split("T")[0] : "")} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default SalesMonthlyReport;

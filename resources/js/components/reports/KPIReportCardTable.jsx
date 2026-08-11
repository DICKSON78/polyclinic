import React from "react";
import { Box, Card, CardContent, CardHeader, Chip, CircularProgress, Divider, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from "@mui/material";
import { green, purple, red, grey } from "@mui/material/colors";
import { numberFormat } from "../../helpers";

import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Assessment as ReportIcon, EmojiEvents as EmojiEventsIcon, PictureAsPdf as PdfIcon, DateRange as DateRangeIcon } from "@mui/icons-material";
import axios from 'axios';
import { useToast } from "../../hooks";
import { pdf } from "@react-pdf/renderer";
import Header from "../pdf/Header";
import Footer from "../pdf/Footer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 35,
    fontSize: 7,
    fontFamily: "Custom",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "black",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "black",
  },
  summaryBox: {
    backgroundColor: "#f5f5f5",
    border: "1pt solid #000",
    padding: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 8,
    marginBottom: 4,
    color: "black",
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    border: "1pt solid #000",
    padding: 4,
    fontSize: 8,
  },
  tableHeader: {
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
  },
  tableColHeader: {
    width: "20%",
    border: "1pt solid #000",
    padding: 4,
    fontSize: 8,
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
  },
  remarksBox: {
    backgroundColor: "#f5f5f5",
    border: "1pt solid #000",
    padding: 8,
    marginBottom: 12,
  },
  remarksText: {
    fontSize: 8,
    lineHeight: 1.2,
    color: "black",
  },
});

const getProgressColor = (status, r, t) => {
  const rn = parseFloat(r) || 0;
  const tn = parseFloat(t) || 0;
  if (rn === 0) return "#e0e0e0";
  if (tn === 0) return "#e0e0e0";
  const pct = Math.round((rn / tn) * 100);
  if (pct >= 75) return "#2e7d32";
  else if (pct >= 50) return "#7b1fa2";
  else return "#c62828";
};

const getStatusFromResult = (r, t) => {
  const rn = parseFloat(r) || 0;
  const tn = parseFloat(t) || 0;
  if (rn === 0) return 'default';
  if (tn === 0) return 'default';
  const pct = Math.round((rn / tn) * 100);
  if (pct >= 75) return 'success';
  else if (pct >= 50) return 'warning';
  else return 'error';
};

const getStatusLabel = (r, t) => {
  const rn = parseFloat(r) || 0;
  const tn = parseFloat(t) || 0;
  if (rn === 0) return 'No count';
  if (tn === 0) return 'No target';
  const pct = Math.round((rn / tn) * 100);
  if (pct >= 100) return 'Excellent';
  else if (pct >= 75) return 'Above';
  else if (pct >= 50) return 'Average';
  else return 'Below';
};

const getProgressValue = (result, target) => {
  if (typeof result === 'string' && result.includes('%')) {
    return parseInt(result.replace('%', ''));
  }
  const resultNum = Number(result) || 0;
  const targetNum = Number(target) || 0;
  if (targetNum === 0) return 0;
  return Math.min((resultNum / targetNum) * 100, 100);
};


const KPIReportCardTable = ({
  title,
  kpis = [],
  loading = false,
  remarks = '',
  recommendations = '',
  canEdit = false,
  department = '',
  date = '',
  selectedDate = '',
  setSelectedDate = null,
  onRefresh = null,
  onFilterChange = null
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEditingTargets, setIsEditingTargets] = React.useState(false);
  const [editedRemarks, setEditedRemarks] = React.useState(remarks);
  const [editedRecommendations, setEditedRecommendations] = React.useState(recommendations);
  const [editedTargets, setEditedTargets] = React.useState({});
  const [pdfGenerating, setPdfGenerating] = React.useState(false);
  const [selectedWeek, setSelectedWeek] = React.useState(1);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [showFilter, setShowFilter] = React.useState(false);
  
  // Debug function to check month selection
  const handleMonthChange = (e) => {
    const value = parseInt(e.target.value);
    console.log('Month changed to:', value);
    setSelectedMonth(value);
  };
  
  // Modal states
  const [showTargetModal, setShowTargetModal] = React.useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = React.useState(false);
  const [selectedKPI, setSelectedKPI] = React.useState(null);
  const [targetValue, setTargetValue] = React.useState('');
  const [recommendationText, setRecommendationText] = React.useState('');

  // Destructure toast hooks safely
  const addToast = useToast();

  React.useEffect(() => {
    setEditedRemarks(remarks);
    setEditedRecommendations(recommendations);
  }, [remarks, recommendations]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Modal handlers
  const handleEditTarget = (kpi, index) => {
    setSelectedKPI(kpi);
    setTargetValue(kpi.target || '');
    setShowTargetModal(true);
  };

  const handleCreateTarget = (kpi, index) => {
    setSelectedKPI(kpi);
    setTargetValue('');
    setShowTargetModal(true);
  };

  const handleSaveTarget = async () => {
    try {
      console.log('Save target - selectedKPI:', selectedKPI);
      console.log('Save target - targetValue:', targetValue);
      
      // Safety check: ensure selectedKPI exists
      if (!selectedKPI) {
        console.error('No selectedKPI found');
        addToast({ message: 'No KPI selected for editing', severity: 'error' });
        return;
      }

      const kpiName = selectedKPI.label || selectedKPI.description || 'Unknown KPI';
      const kpiId = selectedKPI.id || kpiName;
      console.log('Using KPI id:', kpiId);

      const response = await axios.patch(`/api/performance-reports/${department}/targets`, {
        targets: { [kpiId]: parseFloat(targetValue) || 0 }
      });
      
      addToast({ message: 'Target saved successfully', severity: 'success' });
      setShowTargetModal(false);
      setSelectedKPI(null);
      setTargetValue('');
      
      // Refresh data using callback instead of full page reload
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Save target error:', err);
      addToast({ message: 'Failed to save target: ' + (err.response?.data?.message || err.message), severity: 'error' });
    }
  };

  const handleRecommendationClick = () => {
    setRecommendationText(recommendations);
    setShowRecommendationModal(true);
  };

  const handleSaveRecommendation = async () => {
    try {
      const response = await axios.patch(`/api/performance-reports/${department}/report`, {
        recommendations: recommendationText,
        date: date
      });
      
      addToast({ message: 'Recommendations saved successfully', severity: 'success' });
      setShowRecommendationModal(false);
      setRecommendationText('');
      
      // Refresh data using callback instead of full page reload
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Save recommendation error:', err);
      addToast({ message: 'Failed to save recommendations: ' + (err.response?.data?.message || err.message), severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      console.log('Saving remarks:', { remarks: editedRemarks, recommendations: editedRecommendations, date: date, department: department });
      
      if (department && date) {
        const response = await axios.patch(`/api/performance-reports/${department}/report`, {
          remarks: editedRemarks,
          recommendations: editedRecommendations,
          date: date
        });
        console.log('Remarks save response:', response);
      }

      addToast({ message: 'Report analysis updated successfully', severity: 'success' });
      setIsEditing(false);
      
    } catch (err) {
      console.error('Remarks save error:', err);
      addToast({ message: 'Failed to update report: ' + (err.response?.data?.message || err.message), severity: 'error' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditingTargets(false);
    setEditedRemarks(remarks);
    setEditedRecommendations(recommendations);
  };

  const handleEditTargets = () => {
    setIsEditingTargets(true);
    const targets = {};
    tableRows.forEach((kpi, index) => {
      const targetValue = typeof kpi._t === 'string' ? parseInt(kpi._t.replace(/[^\d]/g, '')) || 0 : kpi._t || 0;
      targets[index] = targetValue;
    });
    setEditedTargets(targets);
  };

  const handleSaveTargets = async () => {
    try {
      console.log('Current editedTargets:', editedTargets);
      console.log('Table rows:', tableRows);
      
      if (department && tableRows.length > 0) {
        const targetData = tableRows.map((kpi, index) => ({
          kpi_name: kpi.label || kpi.description || `KPI ${index + 1}`,
          target_value: editedTargets[index] || kpi._t || 0,
          target_unit: 'units',
          department: department
        }));

        console.log('Saving targets:', targetData);

        const response = await axios.patch(`/api/department-performance/${department}`, {
          targets: targetData
        });

        console.log('Save response:', response);
      }

      // FIX: use safeToast so minified "W is not a function" never happens
      addToast({ message: 'Targets updated successfully', severity: 'success' });
      setIsEditingTargets(false);
      
    } catch (err) {
      console.error('Save error:', err);
      addToast({ message: 'Failed to update targets: ' + (err.response?.data?.message || err.message), severity: 'error' });
    }
  };

  const handleTargetChange = (index, value) => {
    setEditedTargets(prev => ({
      ...prev,
      [index]: Number(value) || 0
    }));
  };

  const handleApplyFilter = () => {
    const filterParams = {
      month: selectedMonth + 1, // Convert 0-based to 1-based month
      year: selectedYear
    };
    
    // Call the parent component's filter change handler
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(filterParams);
    }
    
    setShowFilter(false);
  };

  const generatePDF = async () => {
    setPdfGenerating(true);
    try {
      const isCRM = department === 'crm';
      const reportPeriod = showFilter 
        ? isCRM 
          ? `${title.toUpperCase()} OF WEEK ${selectedWeek}, ${selectedYear}`
          : `${title.toUpperCase()} OF ${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        : isCRM
          ? `${title.toUpperCase()} OF CURRENT WEEK`
          : `${title.toUpperCase()} OF ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

      const PDFDocument = () => (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Header title="" subtitle={reportPeriod} />
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>EXECUTIVE SUMMARY</Text>
              <View style={pdfStyles.summaryBox}>
                <Text style={pdfStyles.summaryText}>Total KPIs: {tableRows.length}</Text>
                <Text style={pdfStyles.summaryText}>Report Period: {reportPeriod}</Text>
                <Text style={pdfStyles.summaryText}>Overall Performance: {tableRows.length > 0 ? 'Good' : 'No Data'}</Text>
              </View>
            </View>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>KEY PERFORMANCE INDICATORS</Text>
              <View style={pdfStyles.table}>
                <View style={pdfStyles.tableRow}>
                  <View style={[pdfStyles.tableColHeader, pdfStyles.tableHeader]}><Text>KPI</Text></View>
                  <View style={[pdfStyles.tableColHeader, pdfStyles.tableHeader]}><Text>Target</Text></View>
                  <View style={[pdfStyles.tableColHeader, pdfStyles.tableHeader]}><Text>Result</Text></View>
                  <View style={[pdfStyles.tableColHeader, pdfStyles.tableHeader]}><Text>Performance</Text></View>
                  <View style={[pdfStyles.tableColHeader, pdfStyles.tableHeader]}><Text>Status</Text></View>
                </View>
                {tableRows.map((kpi, index) => {
                  const percentage = getProgressValue(kpi.results, kpi.target);
                  const status = getStatusFromResult(kpi.results);
                  return (
                    <View key={index} style={pdfStyles.tableRow}>
                      <View style={pdfStyles.tableCol}><Text>{kpi.label || ''}</Text></View>
                      <View style={pdfStyles.tableCol}><Text>{kpi.target || ''}</Text></View>
                      <View style={pdfStyles.tableCol}><Text>{kpi.results || ''}</Text></View>
                      <View style={pdfStyles.tableCol}><Text>{percentage}%</Text></View>
                      <View style={pdfStyles.tableCol}><Text>{getStatusLabel(kpi.results, status)}</Text></View>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>PERFORMANCE ANALYSIS</Text>
              <View style={pdfStyles.remarksBox}>
                <Text style={pdfStyles.remarksText}>{remarks || 'No remarks provided for this period.'}</Text>
              </View>
            </View>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>RECOMMENDATIONS</Text>
              <View style={pdfStyles.remarksBox}>
                <Text style={pdfStyles.remarksText}>{recommendations || 'No recommendations provided for this period.'}</Text>
              </View>
            </View>
            <Footer
              render={({ pageNumber, totalPages }) => (
                <View style={{ position: "absolute", bottom: 10, right: 24, fontSize: 7, fontFamily: "Custom", color: "grey" }}>
                  <Text>Printed: {new Date().toLocaleString()}</Text>
                </View>
              )}
            />
          </Page>
        </Document>
      );

      const blob = await pdf(<PDFDocument />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      if (link && typeof link.click === 'function') {
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        if (document.body && typeof document.body.appendChild === 'function') {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      if (window.URL && typeof window.URL.revokeObjectURL === 'function') {
        window.URL.revokeObjectURL(url);
      }
      addToast({ message: 'PDF report generated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast({ message: 'Failed to generate PDF report', severity: 'error' });
    } finally {
      setPdfGenerating(false);
    }
  };

  const tableRows = kpis.length > 0 ? 
    kpis.map((k, index) => ({
      label: k.description || k.name || k.label || 'KPI', 
      id: k.id || null,
      target: k.target, 
      results: k.results || k.formatted_result || '', 
      status: k.status,
      _r: k._r !== undefined ? k._r : (parseFloat(k.results) || 0), 
      _t: k._t !== undefined ? k._t : (parseFloat(k.target) || 0),
      index: index
    })) : 
    [];

  return (
    <Card sx={{ mb: 3, width: '100%' }}>
      <CardHeader 
        title={title} 
        titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
        sx={{ backgroundColor: "#f5f5f5" }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PdfIcon />}
              onClick={generatePDF}
              disabled={pdfGenerating}
              sx={{ 
                minWidth: '100px',
                backgroundColor: '#d32f2f',
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              {pdfGenerating ? 'Generating...' : 'PDF'}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DateRangeIcon />}
              onClick={() => setShowFilter(true)}
              sx={{ 
                minWidth: '100px',
                backgroundColor: '#2e7d32',
                '&:hover': { backgroundColor: '#1b5e20' }
              }}
            >
              Filter
            </Button>
            {canEdit && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRecommendationClick}
                  sx={{ 
                    minWidth: '120px',
                    backgroundColor: '#9c27b0',
                    '&:hover': { backgroundColor: '#7b1fa2' }
                  }}
                >
                  Recommendations
                </Button>
              </Box>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>TARGET</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>RESULTS</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>
                      {row.target}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.max(getProgressValue(row._r, row._t), row._r > 0 ? 25 : 0)}
                            sx={{ 
                              height: 10, 
                              borderRadius: 4,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(row.status, row._r, row._t),
                                minWidth: row._r > 0 ? '8px' : '0px'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {row.results}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(row._r, row._t)}
                        size="small"
                        color={getStatusFromResult(row._r, row._t)}
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleEditTarget(row, index)}
                          sx={{ minWidth: 80, fontSize: '0.75rem' }}
                        >
                          Edit Target
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => handleCreateTarget(row, index)}
                          sx={{ minWidth: 80, fontSize: '0.75rem' }}
                        >
                          Create Target
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Recommendations Section */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EmojiEventsIcon sx={{ color: purple[600], fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={700}>Recommendations</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {recommendations || 'No recommendations provided.'}
          </Typography>
        </Box>
      </CardContent>
      
      {/* Target Modal */}
      <Dialog open={showTargetModal} onClose={() => setShowTargetModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedKPI ? `Edit Target: ${selectedKPI.label || selectedKPI.description || 'KPI'}` : 'Create Target'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Target Value"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            variant="outlined"
            size="small"
            inputProps={{ min: 0 }}
            helperText={`Enter target value for ${selectedKPI?.label || 'selected KPI'}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTargetModal(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveTarget} variant="contained" color="primary">
            Save Target
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recommendations Modal */}
      <Dialog open={showRecommendationModal} onClose={() => setShowRecommendationModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Recommendations
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Recommendations"
            value={recommendationText}
            onChange={(e) => setRecommendationText(e.target.value)}
            variant="outlined"
            placeholder="Enter performance recommendations..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecommendationModal(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveRecommendation} variant="contained" color="primary">
            Save Recommendations
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={showFilter} onClose={() => setShowFilter(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {department === 'crm' ? 'Weekly Performance Tracker' : `Filter by ${department === 'crm' ? 'Week' : 'Month'}`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {department === 'crm' ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Select a date to view weekly performance tracking from Monday to Sunday
              </Typography>
              <TextField
                type="date"
                fullWidth
                label="Select Date"
                value={selectedDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => { setSelectedDate?.(e.target.value); }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Week Range:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    const date = selectedDate ? new Date(selectedDate) : new Date();
                    const weekStart = new Date(date);
                    const dayOfWeek = date.getDay();
                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    weekStart.setDate(date.getDate() + mondayOffset);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`;
                  })()}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Month filtering feature is available. Select a month from the dropdown to generate reports for specific periods.
              </Typography>
              <TextField
                select
                fullWidth
                label={`Select ${department === 'crm' ? 'Week' : 'Month'}`}
                value={department === 'crm' ? selectedWeek : selectedMonth}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (department === 'crm') setSelectedWeek(value);
                  else handleMonthChange(e);
                }}
                sx={{ mt: 2 }}
              >
                {department === 'crm' 
                  ? Array.from({length: 52}, (_, i) => (
                      <MenuItem key={i} value={i + 1}>Week {i + 1}</MenuItem>
                    ))
                  : Array.from({length: 12}, (_, i) => (
                      <MenuItem key={i} value={i}>
                        {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                      </MenuItem>
                    ))
                }
              </TextField>
              <TextField
                select
                fullWidth
                label="Select Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                sx={{ mt: 2 }}
              >
                {Array.from({length: 5}, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <MenuItem key={year} value={year}>{year}</MenuItem>;
                })}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilter(false)}>Cancel</Button>
          <Button onClick={handleApplyFilter} variant="contained">Apply Filter</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default KPIReportCardTable;
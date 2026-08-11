import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Grid, Card, CardContent, CardHeader, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  Tooltip, Button, Alert, CircularProgress, Divider, Stack, LinearProgress,
  TextField, InputAdornment, Paper
} from '@mui/material';
import {
  Visibility as EyeIcon, People as PeopleIcon, CheckCircle as CheckIcon,
  Assessment as ReportIcon, Refresh as RefreshIcon, Edit as EditIcon,
  Save as SaveIcon, Cancel as CancelIcon, TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon,
  HealthAndSafety as HealthIcon, Medication as MedicineIcon,
  EmojiEvents as EmojiEventsIcon, Campaign as CampaignIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import { useFetch, useToast, usePatch } from '../../../hooks';
import { numberFormat, formatDate } from '../../../helpers';
import Page from '../../../components/Page';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';
import { green, orange, red, blue, purple, cyan, teal, grey } from '@mui/material/colors';

// Safe toast helper - prevents "W is not a function" after minification
const safeToast = (fn, message) => {
  if (fn && typeof fn === 'function') {
    try { fn(message); } catch (e) { console.warn('Toast failed:', e); }
  }
};

const OptometryPerformanceReportCard = ({ user, editable = false, refreshTrigger = null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});
  const [editedRemarks, setEditedRemarks] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');
  const [patchLoading, setPatchLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({});

  // Safe toast destructuring
  const toastHook = useToast();
  const showSuccess = toastHook?.showSuccess || null;
  const showError = toastHook?.showError || null;

  // Fetch real data from API - same endpoint as CRM/Sales
  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/optometry', {
    dependencies: [refreshTrigger]
  });

  // Fetch saved targets
  const {
    data: targetsData,
    loading: targetsLoading,
  } = useFetch('/api/performance-reports/optometry/targets', {
    dependencies: [refreshTrigger]
  });

  // Build calculated data from API response - same pattern as CRM
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;

    const apiData = performanceData.data;

    const calculatedKpis = (apiData.kpis || []).map(kpi => {
      // Try to match saved target from department_kpi_targets table
      const targetRecord = targetsData?.find(t =>
        t.kpi_name?.toLowerCase() === kpi.name?.toLowerCase()
      );
      const finalTarget = targetRecord?.target_value ?? kpi.target ?? 0;

      // achievement = result / target * 100
      const achievementRate = finalTarget > 0 ? Math.round((kpi.result / finalTarget) * 100) : 0;

      let performanceStatus = 'Below Target';
      let statusColor = orange[700];
      if (achievementRate >= 100) { performanceStatus = 'Above Target'; statusColor = blue[700]; }
      else if (achievementRate >= 90) { performanceStatus = 'Target Achieved'; statusColor = green[700]; }

      return {
        ...kpi,
        target: finalTarget,
        achievement_rate: achievementRate,
        performance_status: performanceStatus,
        status_color: statusColor,
        formatted_result: kpi.unit === '%'
          ? `${Number(kpi.result).toFixed(1)}%`
          : kpi.unit === 'TZS'
            ? `${numberFormat(kpi.result)} TZS`
            : numberFormat(kpi.result),
        formatted_target: kpi.unit === '%'
          ? `${Number(finalTarget).toFixed(1)}%`
          : kpi.unit === 'TZS'
            ? `${numberFormat(finalTarget)} TZS`
            : numberFormat(finalTarget),
      };
    });

    const targetsAchieved = calculatedKpis.filter(k => k.achievement_rate >= 100).length;
    const totalKpis = calculatedKpis.length;
    const completionRate = totalKpis > 0 ? Math.round((targetsAchieved / totalKpis) * 100) : 0;

    return {
      ...apiData,
      kpis: calculatedKpis,
      summary: { targets_achieved: targetsAchieved, total_kpis: totalKpis, completion_rate: completionRate },
    };
  }, [performanceData, targetsData]);

  // Transform to KPIReportCardTable format
  // result% = achievement_rate (count/target*100)
  const transformToKPIs = (data) => {
    if (!data?.kpis) return [];
    return data.kpis.map(kpi => {
      const pct = kpi.achievement_rate || 0;
      let status = 'default';
      
      // If target is set (not default 50), calculate proper status
      if (kpi.target && kpi.target !== 50) {
        if (pct >= 75) status = 'success';
        else if (pct >= 50) status = 'warning';
        else if (pct > 0) status = 'error';
        else status = 'error'; // 0% achievement with target set
      }

      return {
        description: kpi.name,
        // Show the actual count as target and result
        target: kpi.formatted_target || String(kpi.target),
        results: `${pct}%`,   // percentage for progress bar
        status,
        _r: kpi.result,       // raw count
        _t: kpi.target,       // raw target
      };
    });
  };

  const handleEdit = () => {
    const targets = {};
    calculatedData?.kpis?.forEach(kpi => { targets[kpi.id] = kpi.target; });
    setEditedTargets(targets);
    setEditedRemarks(calculatedData?.remarks || '');
    setEditedRecommendations(
      Array.isArray(calculatedData?.recommendations)
        ? calculatedData.recommendations.join('\n')
        : (calculatedData?.recommendations || '')
    );
    setIsEditing(true);
  };

  const handleSave = async () => {
    setPatchLoading(true);
    try {
      // 1. Save targets - send as {kpi_id: value} object
      await axios.patch('/api/performance-reports/optometry/targets', {
        targets: editedTargets
      });

      // 2. Save remarks & recommendations
      await axios.patch('/api/performance-reports/optometry/report', {
        remarks: editedRemarks,
        recommendations: editedRecommendations,
        date: new Date().toISOString().split('T')[0]
      });

      safeToast(showSuccess, 'Report updated successfully');
      setIsEditing(false);
      fetchData();
    } catch (err) {
      safeToast(showError, 'Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setPatchLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTargets({});
    setEditedRemarks('');
    setEditedRecommendations('');
  };

  const handleRefresh = () => fetchData();

  const handleFilterChange = (filterParams) => {
    console.log('handleFilterChange called with:', filterParams);
    setCurrentFilter(filterParams);
    
    // Convert month/year to start_date and end_date format
    const { month, year } = filterParams;
    let apiUrl = '/api/performance-reports/optometry';
    
    if (month && year) {
      // Create start_date (first day of month) and end_date (last day of month)
      const startDate = new Date(year, month - 1, 1); // month is 1-based, Date constructor is 0-based
      const endDate = new Date(year, month, 0); // Last day of previous month (which is our target month)
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const queryParams = new URLSearchParams({
        start_date: startDateStr,
        end_date: endDateStr
      });
      
      apiUrl += '?' + queryParams.toString();
      
      console.log('Filter API URL:', apiUrl);
      console.log('Date range:', startDateStr, 'to', endDateStr);
    }
    
    console.log('Calling fetchData with URL:', apiUrl);
    // Fetch data with filters
    fetchData(apiUrl);
  };

  if (performanceLoading && !performanceData) {
    return (
      <Page title="Examination Report Card">
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  if (performanceError || !performanceData) {
    return (
      <Page title="Examination Report Card">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>Failed to load examination performance data.</Alert>
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>Retry</Button>
        </Box>
      </Page>
    );
  }

  return (
    <Page title="Examination Report Card">
      <Box sx={{ p: 3 }}>

        {/* Header */}
        <Paper elevation={3} sx={{
          p: 4, mb: 4, borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Examination Report Card</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Medicine sales, return patient rate — real data from the system
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Chip label={`Updated: ${formatDate(new Date())}`} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Real-time Data" color="info" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={performanceLoading}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {calculatedData?.can_edit && !isEditing && (
                <Tooltip title="Edit Targets & Analysis">
                  <IconButton onClick={handleEdit}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isEditing && (
                <>
                  <Tooltip title="Save">
                    <IconButton onClick={handleSave} disabled={patchLoading}
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                      {patchLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton onClick={handleCancel}
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {calculatedData?.kpis?.map((kpi) => {
            const icons = {
              medicine_sales: <MedicineIcon />,
              softdrop_sales: <MedicineIcon />,
              return_patient_percentage: <PeopleIcon />,
            };
            const colors = {
              medicine_sales: green[500],
              softdrop_sales: teal[500],
              return_patient_percentage: blue[500],
            };
            return (
              <Grid item xs={12} sm={6} md={4} key={kpi.id}>
                <InfoCard
                  title={kpi.name}
                  count={kpi.formatted_result || numberFormat(kpi.result)}
                  icon={icons[kpi.id] || <ReportIcon />}
                  color={colors[kpi.id] || orange[500]}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* KPI Table - medicines only */}
        <KPIReportCardTable
          title="EXAMINATION DEPARTMENT REPORT CARD"
          kpis={transformToKPIs(calculatedData?.kpis?.filter(kpi => !kpi.is_separate_card) || [])}
          loading={performanceLoading || targetsLoading}
          canEdit={calculatedData?.can_edit || false}
          department="optometry"
          date={new Date().toISOString().split('T')[0]}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
          recommendations={
            Array.isArray(calculatedData?.recommendations)
              ? calculatedData.recommendations.join('\n')
              : (calculatedData?.recommendations || '')
          }
        />

        {/* Return Patient Separate Card */}
        {calculatedData?.kpis?.filter(kpi => kpi.is_separate_card).map((kpi) => {
          const percentage = (kpi.result / kpi.target) * 100;
          const progressColor = percentage >= 50 ? 'success' : percentage >= 25 ? 'warning' : 'error';
          
          return (
            <Card key={kpi.id} sx={{ mb: 3 }}>
              <CardHeader 
                title={kpi.name}
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                avatar={<Avatar sx={{ bgcolor: blue[100], color: blue[700] }}><PeopleIcon /></Avatar>}
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Target: {kpi.formatted_target} | Result: {kpi.formatted_result}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        color={progressColor}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'right' }}>
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {percentage >= 50 ? 'Target achieved!' : percentage >= 25 ? 'Progressing towards target' : 'Below target'}
                </Typography>
              </CardContent>
            </Card>
          );
        })}

        {/* Recommendations edit section (when editing from header) */}
        {isEditing && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Card>
                <CardHeader title="Recommendations" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  avatar={<Avatar sx={{ bgcolor: teal[100], color: teal[700] }}><CampaignIcon /></Avatar>} />
                <Divider />
                <CardContent>
                  <TextField fullWidth multiline rows={4} value={editedRecommendations}
                    onChange={(e) => setEditedRecommendations(e.target.value)}
                    placeholder="Enter recommendations..." variant="outlined" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Recommendations Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={12}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Recommendations" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                avatar={<Avatar sx={{ bgcolor: teal[100], color: teal[700] }}><CampaignIcon /></Avatar>} />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  {(() => {
                    const recs = calculatedData?.recommendations;
                    const list = Array.isArray(recs)
                      ? recs
                      : recs ? [recs] : ['No recommendations yet.'];
                    return list.map((rec, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: teal[100], color: teal[600], fontSize: 12 }}>{i + 1}</Avatar>
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{rec}</Typography>
                      </Box>
                    ));
                  })()}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>
    </Page>
  );
};

export default OptometryPerformanceReportCard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Grid, Card, CardContent, CardHeader, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  Tooltip, Button, Alert, CircularProgress, Divider, Stack, LinearProgress,
  TextField, InputAdornment, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Assessment as ReportIcon, Refresh as RefreshIcon, Edit as EditIcon,
  Save as SaveIcon, Cancel as CancelIcon, TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon,
  AttachMoney as MoneyIcon, EmojiEvents as EmojiEventsIcon,
  Campaign as CampaignIcon, PictureAsPdf as PdfIcon, DateRange as DateRangeIcon,
  ShoppingCart as ShoppingCartIcon, People as PeopleIcon, CheckCircle as CheckIcon
} from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import { useFetch, useToast } from '../../../hooks';
import { numberFormat, formatDate } from '../../../helpers';
import Page from '../../../components/Page';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';
import { green, orange, red, blue, purple, cyan, teal, yellow, grey } from '@mui/material/colors';

// Safe toast helper
const safeToast = (fn, message) => {
  if (fn && typeof fn === 'function') {
    try { fn(message); } catch (e) { console.warn('Toast failed:', e); }
  }
};

const SalesPerformanceReportCard = ({ user, editable = false, refreshTrigger = null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});
  const [editedRemarks, setEditedRemarks] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');
  const [patchLoading, setPatchLoading] = useState(false);

  // Safe toast
  const toastHook = useToast();
  const showSuccess = toastHook?.showSuccess || null;
  const showError = toastHook?.showError || null;

  // Fetch real data from API
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError,
    handleFetch: fetchData
  } = useFetch('/api/performance-reports/sales', { _refresh: refreshKey });

  // Fetch saved targets
  const {
    data: targetsData,
    loading: targetsLoading,
  } = useFetch('/api/department-performance/sales/targets', {
    dependencies: [refreshTrigger]
  });

  // Build calculated data - result% = result/target*100
  const calculatedData = React.useMemo(() => {
    if (!performanceData?.data) return null;

    const apiData = performanceData.data;

    const calculatedKpis = (apiData.kpis || []).map(kpi => {
      const targetRecord = targetsData?.data?.find(t =>
        t.kpi_name?.toLowerCase() === kpi.name?.toLowerCase()
      );
      const finalTarget = parseFloat(targetRecord?.target_value ?? kpi.target ?? 0);
      const achievementRate = finalTarget > 0 ? Math.round((kpi.result / finalTarget) * 100) : 0;

      let performanceStatus = 'Below Target';
      let statusColor = orange[700];
      if (achievementRate >= 100) { performanceStatus = 'Above Target'; statusColor = blue[700]; }
      else if (achievementRate >= 90) { performanceStatus = 'Target Achieved'; statusColor = green[700]; }

      const formatted_result = kpi.unit === '%'
        ? `${Number(kpi.result).toFixed(1)}%`
        : kpi.unit === 'TZS'
          ? `${numberFormat(kpi.result)} TZS`
          : numberFormat(kpi.result);

      const formatted_target = kpi.unit === '%'
        ? `${Number(finalTarget).toFixed(1)}%`
        : kpi.unit === 'TZS'
          ? `${numberFormat(finalTarget)} TZS`
          : numberFormat(finalTarget);

      return {
        ...kpi,
        target: finalTarget,
        achievement_rate: achievementRate,
        performance_status: performanceStatus,
        status_color: statusColor,
        formatted_result,
        formatted_target,
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

  // Transform for KPIReportCardTable - results shown as achievement % for all KPIs
  const transformToKPIs = (data) => {
    if (!data?.kpis) return [];
    return data.kpis.map(kpi => {
      const pct = kpi.achievement_rate || 0;
      let status = 'default';
      if (pct >= 75) status = 'success';
      else if (pct >= 50) status = 'warning';
      else if (pct > 0) status = 'error';

      // Always show percentage for results
      const resultText = `${pct}%`;

      return {
        description: kpi.name,
        id: kpi.id,
        target: kpi.formatted_target || String(kpi.target),
        results: resultText,  // Always show percentage
        status,
        _r: kpi.achievement_rate || 0,
        _t: 100,
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
      // 1. Save targets as {kpi_id: value} - matches PerformanceDashboardController::updateTargets
      await axios.patch('/api/performance-reports/sales/targets', {
        targets: editedTargets
      });

      // 2. Save remarks + recommendations
      await axios.patch('/api/performance-reports/sales/report', {
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

  const handleRefresh = () => setRefreshKey(k => k + 1);

  if (performanceLoading && !performanceData) {
    return (
      <Page title="Sales Report Card">
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  if (performanceError || !performanceData) {
    return (
      <Page title="Sales Report Card">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>Failed to load sales performance data.</Alert>
          <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>Retry</Button>
        </Box>
      </Page>
    );
  }

  return (
    <Page title="Sales Report Card">
      <Box sx={{ p: 3 }}>

        {/* Header */}
        <Paper elevation={3} sx={{
          p: 4, mb: 4, borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Sales Department Report Card</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Average daily sales, customer conversion — real data
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
              average_glass_daily_sales: <MoneyIcon />,
              glass_conversion_ratio: <CheckIcon />,
            };
            const colors = {
              average_glass_daily_sales: green[500],
              glass_conversion_ratio: blue[500],
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

        {/* KPI Table */}
        <KPIReportCardTable
          title="SALES DEPARTMENT REPORT CARD"
          kpis={transformToKPIs(calculatedData)}
          loading={performanceLoading}
          canEdit={calculatedData?.can_edit || false}
          department="sales"
          date={new Date().toISOString().split('T')[0]}
          onRefresh={handleRefresh}
          recommendations={
            Array.isArray(calculatedData?.recommendations)
              ? calculatedData.recommendations.join('\n')
              : (calculatedData?.recommendations || '')
          }
        />

        </Box>
    </Page>
  );
};

export default SalesPerformanceReportCard;
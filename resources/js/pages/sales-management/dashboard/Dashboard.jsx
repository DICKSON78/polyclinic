import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, CardHeader, Divider, Grid,
  Typography, CircularProgress, LinearProgress,
} from '@mui/material';
import {
  TrendingUpRounded as TrendingIcon,
  DiscountRounded as DiscountIcon,
} from '@mui/icons-material';
import { green, pink, orange, red } from '@mui/material/colors';

import Page from '../../../components/Page';
import InfoCard from '../../dashboard/InfoCard';
import KPIReportCardTable from '../../../components/reports/KPIReportCardTable';
import { useFetch, useToast } from '../../../hooks';
import { formatError, numberFormat, formatDateForDb } from '../../../helpers';

const KPICard = ({ kpi }) => {
  const percentage = kpi.target > 0 ? Math.min(100, Math.round((kpi.result / kpi.target) * 100)) : 0;
  const color = percentage >= 100 ? green[500] : percentage >= 75 ? orange[500] : red[500];
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>{kpi.name}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={700} color={color}>{kpi.formatted_result}</Typography>
          <Typography variant="body2" color="text.secondary">Target: {kpi.formatted_target}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
        />
        <Typography variant="caption" color={color} sx={{ mt: 0.5, display: 'block' }}>{percentage}% of target</Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const today = formatDateForDb(new Date());
  
  // Get month-to-date range (from start of month to today)
  const monthStart = new Date();
  monthStart.setDate(1); // First day of current month
  const startDate = formatDateForDb(monthStart);

  const { data, loading, error } = useFetch(
    'api/sales-management/dashboard',
    { start_date: startDate, end_date: today }, // Use month-to-date instead of just today
    true,
    null,
    (response) => {
      console.log('Sales Dashboard API Response:', response);
      return response.data.data;
    }
  );

  const { data: kpiData, loading: kpiLoading } = useFetch(
    'api/performance-reports/sales',
    { start_date: startDate, end_date: today }, // Use month-to-date for KPIs
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Sales Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) addToast({ message: formatError(error), severity: 'error' });
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title='Sales Management Dashboard'>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  // Add null checks to prevent errors
  const salesPerformance = data?.summary?.sales_performance || 0;
  const kpis = (kpiData?.kpis || []).map(kpi => {
    const achievementRate = kpi.target > 0 ? Math.round((kpi.result / kpi.target) * 100) : 0;
    let status = 'default';
    if (achievementRate >= 75) status = 'success';
    else if (achievementRate >= 50) status = 'warning';
    else if (achievementRate > 0) status = 'error';

    return {
      ...kpi,
      description: kpi.name,
      results: `${achievementRate}%`, // Show percentage instead of formatted result
      _r: achievementRate,
      _t: 100,
      status,
    };
  });
  const summary = data?.summary || {};

  return (
    <Page
      title='Sales Management Dashboard'
      breadcrumbs={[{ title: 'Home' }, { title: 'Sales Management' }, { title: 'Dashboard' }]}
    >
      <Typography variant='h4' fontWeight={700} sx={{ mb: 3 }}>Sales Management Dashboard</Typography>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title='Sales Performance'
            count={`${salesPerformance}%`}
            subtitle={`vs ${numberFormat(summary?.sales_target || 1500000)} target`}
            icon={<TrendingIcon />}
            color={salesPerformance >= 100 ? green[500] : salesPerformance >= 75 ? orange[500] : red[500]}
  
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoCard
            title='Total Discount'
            count={numberFormat(summary?.total_discounts || 0)}
            subtitle='Discounts given today'
            icon={<DiscountIcon />}
            color={pink[500]}
  
          />
        </Grid>
      </Grid>

      {/* KPI Report Cards */}
      {kpis.length>0 && <KPIReportCardTable 
        title="SALES DEPARTMENT REPORT CARD" 
        kpis={kpis} 
        loading={kpiLoading} 
        remarks={kpiData?.remarks || 'Excellent sales performance achieved. Keep up the good work!'}
        recommendations={kpiData?.recommendations || 'Continue maintaining strong sales strategies to achieve targets consistently.'}
        canEdit={kpiData?.can_edit || false}
        department="sales"
        date={startDate}
      />}
    </Page>
  );
};

export default Dashboard;

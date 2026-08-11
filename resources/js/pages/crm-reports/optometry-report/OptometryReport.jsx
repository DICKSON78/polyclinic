import React from 'react';
import {
  Box, Card, CardContent, CardHeader, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, Divider, Avatar, LinearProgress, Paper
} from '@mui/material';
import { Visibility as EyeIcon, CheckCircle as CheckIcon, MedicationRounded as MedicineIcon, RotateRight as ReturnIcon } from '@mui/icons-material';
import InfoCard from '../../dashboard/InfoCard';
import { useFetch } from '../../../hooks';
import { numberFormat, formatDateForDb } from '../../../helpers';
import ChartWrapper from '../../../components/ChartWrapper';
import Page from '../../../components/Page';
import { green, orange, blue, purple, red } from '@mui/material/colors';

const OptometryReport = () => {
  const today = formatDateForDb(new Date());
  const monthStart = new Date(); monthStart.setDate(1);

  const { data: rawData, loading } = useFetch(
    'api/performance-reports/optometry',
    { start_date: formatDateForDb(monthStart), end_date: today },
    true, null, (response) => response.data.data
  );

  const { data: consultData, loading: consultLoading } = useFetch(
    'api/consultation-room/dashboard',
    { start_date: formatDateForDb(monthStart), end_date: today },
    true, null, (response) => response.data.data
  );

  if (loading || consultLoading) {
    return (
      <Page title='Examination Report'>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  const kpis = rawData?.kpis || [];
  const summary = consultData?.summary || {};
  const medicineSalesKPI = kpis.find(k => k.id === 'medicine_sales') || { result: 0, target: 0, formatted_result: '0', formatted_target: '0' };
  const returnPatientKPI = kpis.find(k => k.id === 'return_patient_percentage') || { result: 0, target: 0, formatted_result: '0%', formatted_target: '0%' };

  const kpiChartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, distributed: true } },
    colors: [blue[400], green[400], purple[400], orange[400]],
    xaxis: { categories: kpis.map(k => k.name) },
    yaxis: { labels: { formatter: (val) => numberFormat(val) } },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
    legend: { show: false },
  };

  return (
    <Page title='Examination Report'>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2, background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={1}>Examination Report</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>Track examination performance, consultation statistics and medicine sales</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Chip label="Monthly Analysis" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                <Chip label="Real-time Data" color="info" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}><EyeIcon /></Avatar>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard title="Total Consultations" count={numberFormat(summary.total_consultations || 0)} icon={<EyeIcon />} color={blue[500]} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard title="Consultations Today" count={numberFormat(summary.consultations_today || 0)} icon={<CheckIcon />} color={green[500]} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard title="Medicine Sales" count={medicineSalesKPI.formatted_result} icon={<MedicineIcon />} color={purple[500]} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoCard title="Return Patient %" count={returnPatientKPI.formatted_result} icon={<ReturnIcon />} color={orange[500]} />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader title="KPI Performance" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} sx={{ pb: 0 }} />
              <Divider />
              <CardContent>
                {kpis.length > 0 ? (
                  <ChartWrapper options={kpiChartOptions} series={[{ name: 'Result', data: kpis.map(k => k.result || 0) }]} type="bar" height={280} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                    <Typography color="textSecondary">No KPI data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2, height: '100%' }}>
              <CardHeader title="KPI Targets vs Results" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} sx={{ pb: 0 }} />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>KPI</strong></TableCell>
                        <TableCell align="right"><strong>Target</strong></TableCell>
                        <TableCell align="right"><strong>Result</strong></TableCell>
                        <TableCell align="right"><strong>Progress</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpis.map((kpi, i) => {
                        const pct = kpi.target > 0 ? Math.min(100, Math.round((kpi.result / kpi.target) * 100)) : 0;
                        const color = pct >= 100 ? green[500] : pct >= 75 ? orange[500] : red[500];
                        return (
                          <TableRow key={i}>
                            <TableCell>{kpi.name}</TableCell>
                            <TableCell align="right">{kpi.formatted_target}</TableCell>
                            <TableCell align="right">{kpi.formatted_result}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                                <Typography variant="caption" color={color}>{pct}%</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
              <CardHeader title="Consultation Statistics" titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} sx={{ pb: 0 }} />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: 'Total Consultations', value: summary.total_consultations || 0 },
                        { label: 'Consultations Today', value: summary.consultations_today || 0 },
                        { label: 'Prescriptions Written', value: summary.prescriptions_written || 0 },
                        { label: 'Eye Examinations', value: summary.eye_examinations || 0 },
                        { label: 'Clinical Notes Created', value: summary.clinical_notes_created || 0 },
                        { label: 'Pending Consultations', value: summary.pending_consultations || 0 },
                      ].map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.label}</TableCell>
                          <TableCell align="right"><strong>{numberFormat(row.value)}</strong></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default OptometryReport;

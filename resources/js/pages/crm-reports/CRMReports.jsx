import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Container
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Phone as PhoneIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingIcon,
  ShoppingCart as SalesIcon,
  Visibility as EyeIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import Page from '../../components/Page';
import { useAuth } from '../../hooks';
import { hasPrivilege, isAdmin } from '../../helpers/privileges';

const CRMReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEditReports = isAdmin(user) || hasPrivilege(user, 'crm_reports');

  const reportCards = [
    {
      title: 'CRM Report Card',
      description: 'Track CRM KPIs, patient contact status, and marketing leads with real-time analytics',
      icon: <ReportsIcon />,
      color: '#2196f3',
      path: '/crm-reports/performance-report-card',
      features: ['Patient Contact Status', 'Marketing Glass Leads', 'Conversion Metrics', 'Performance Indicators'],
      stats: {
        primary: '4 KPIs',
        secondary: 'Real-time'
      }
    },
    {
      title: 'Marketing Contact Analytics',
      description: 'Analyze contact patterns, call success rates, and marketer performance with interactive charts',
      icon: <PhoneIcon />,
      color: '#4caf50',
      path: '/crm-reports/marketing-contact-analytics',
      features: ['Contact Status Trends', 'Call Success Rates', 'Marketer Performance', 'Contact Distribution', '7-Day Analytics'],
      stats: {
        primary: '3 Charts',
        secondary: 'Live Data'
      }
    },
    {
      title: 'Lead Conversion Report',
      description: 'Track lead funnel, conversion rates, and source performance with detailed conversion metrics',
      icon: <PeopleIcon />,
      color: '#9c27b0',
      path: '/crm-reports/lead-conversion-report',
      features: ['Conversion Funnel', 'Lead Sources', 'Conversion Trends', 'Source Performance', '30-Day Analysis'],
      stats: {
        primary: '5 Metrics',
        secondary: 'Growth Data'
      }
    },
    {
      title: 'Examination Report Card',
      description: 'Monitor examination performance metrics, patient outcomes, and service quality indicators',
      icon: <EyeIcon />,
      color: '#00bcd4',
      path: '/optometry-reports/performance-report-card',
      features: ['Patient Outcomes', 'Service Quality', 'Performance Metrics', 'Treatment Success', 'Quality Indicators'],
      stats: {
        primary: '4 KPIs',
        secondary: 'Quality Data'
      }
    },
    {
      title: 'Sales Report Card',
      description: 'Track sales performance, revenue metrics, and team productivity with comprehensive analytics',
      icon: <SalesIcon />,
      color: '#ff9800',
      path: '/sales-reports/performance-report-card',
      features: ['Revenue Tracking', 'Sales Performance', 'Team Productivity', 'Conversion Rates', 'Sales Analytics'],
      stats: {
        primary: '6 Metrics',
        secondary: 'Revenue Data'
      }
    }
  ];

  return (
    <Page
      title="CRM Reports"
      breadcrumbs={[
        { title: 'Home' },
        { title: 'CRM Reports' },
      ]}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                CRM Analytics Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                Comprehensive CRM analytics with five specialized reports: Performance metrics, Contact analytics, Lead conversion tracking, Examination performance, and Sales analytics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Chip
                  label="Real-time Data"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  label="Database Driven"
                  color="info"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                {canEditReports && (
                  <Chip
                    label="Full Access"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 56,
                  height: 56,
                  fontSize: 28
                }}
              >
                <AnalyticsIcon />
              </Avatar>
            </Box>
          </Box>
        </Paper>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Reports
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Accuracy
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="success"
                sx={{ mt: 2, height: 6, borderRadius: 3 }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h3" color="info.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                Real-time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updates
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="info"
                sx={{ mt: 2, height: 6, borderRadius: 3 }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                Live
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analytics
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="warning"
                sx={{ mt: 2, height: 6, borderRadius: 3 }} 
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Report Cards */}
        <Grid container spacing={3}>
          {reportCards.map((report, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                  borderRadius: 3,
                  overflow: 'visible'
                }}
                onClick={() => navigate(report.path)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: report.color,
                        color: 'white',
                        width: 56,
                        height: 56,
                        mr: 2,
                        fontSize: 28,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {report.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={report.stats.primary}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: `${report.color}20`,
                            color: report.color,
                            '&:hover': {
                              bgcolor: `${report.color}30`
                            }
                          }}
                        />
                        <Chip
                          label={report.stats.secondary}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: report.color,
                            color: report.color,
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: report.color }}>
                      Key Features:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {report.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: `${report.color}20`,
                              color: report.color
                            }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      mt: 2,
                      bgcolor: report.color,
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: `${report.color}dd`,
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(report.path);
                    }}
                  >
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Info Section */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mr: 2,
                fontSize: 24
              }}
            >
              <CampaignIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              About CRM Reports
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Our CRM reports provide comprehensive insights into customer relationship management activities across five key areas:
            Performance metrics tracking, detailed contact analytics, lead conversion analysis, examination performance monitoring, and sales analytics. 
            These reports help marketing teams optimize their strategies, improve customer engagement, track conversion effectiveness, monitor service quality, 
            and analyze sales performance through data-driven insights.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 2 }}>
            All data is sourced directly from your database, ensuring real-time accuracy and actionable insights for business growth.
          </Typography>
        </Paper>
      </Box>
    </Page>
  );
};

export default CRMReports;

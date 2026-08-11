import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  Assessment as AnalyticsIcon,
  Payment as PaymentIcon,
  Medication as MedicineIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 50 }} />,
      title: 'Patient Management',
      description: 'Comprehensive patient records with advanced search, filtering, and history tracking.',
      benefits: ['Patient Registration', 'Medical History', 'Appointment Scheduling', 'VIP Patient Management'],
      color: '#667eea',
    },
    {
      icon: <HospitalIcon sx={{ fontSize: 50 }} />,
      title: 'Clinical Tools',
      description: 'Advanced clinical documentation for consultations, prescriptions, and examinations.',
      benefits: ['Clinical Notes', 'Prescriptions', 'Triage & Vitals', 'Diagnosis Management'],
      color: '#764ba2',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 50 }} />,
      title: 'Analytics & Reports',
      description: 'Real-time analytics and comprehensive reports for data-driven decision making.',
      benefits: ['Dashboard Analytics', 'Financial Reports', 'Patient Statistics', 'Performance Metrics'],
      color: '#f093fb',
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 50 }} />,
      title: 'Payment Management',
      description: 'Streamlined billing and payment processing with multiple payment channels.',
      benefits: ['Billing & Invoicing', 'Payment Processing', 'Credit Management', 'Financial Tracking'],
      color: '#4facfe',
    },
    {
      icon: <MedicineIcon sx={{ fontSize: 50 }} />,
      title: 'Pharmacy Management',
      description: 'Complete stock and dispensing management for medicines and supplies.',
      benefits: ['Stock Control', 'Stock Alerts', 'Dispensing', 'Medicine Tracking'],
      color: '#43e97b',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 50 }} />,
      title: 'Radiology & Imaging',
      description: 'Advanced radiology reporting tools for imaging studies and accurate diagnostics.',
      benefits: ['X-Ray Imaging', 'Ultrasound', 'Imaging Reports', 'Diagnostic Support'],
      color: '#fa709a',
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 50 }} />,
      title: 'Appointment Scheduling',
      description: 'Intelligent scheduling system to optimize appointments and reduce wait times.',
      benefits: ['Smart Scheduling', 'Calendar Management', 'Reminders', 'Wait Time Tracking'],
      color: '#feca57',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50 }} />,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with HIPAA compliance and data protection.',
      benefits: ['Data Encryption', 'Access Control', 'Audit Logs', 'Backup & Recovery'],
      color: '#48dbfb',
    },
  ];

  const highlights = [
    { icon: <SpeedIcon />, text: 'Lightning Fast Performance' },
    { icon: <CloudIcon />, text: 'Cloud-Based Solution' },
    { icon: <SecurityIcon />, text: 'Bank-Level Security' },
    { icon: <CheckIcon />, text: 'HIPAA Compliant' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 3,
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: 800,
                mx: 'auto',
                opacity: 0.95,
                mb: 4,
              }}
            >
              Everything you need to manage your healthcare facility efficiently and effectively
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {highlights.map((highlight, index) => (
                <Chip
                  key={index}
                  icon={highlight.icon}
                  label={highlight.text}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    py: 2.5,
                    px: 1,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: 'white',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                      {feature.description}
                    </Typography>
                    <Stack spacing={1}>
                      {feature.benefits.map((benefit, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon sx={{ color: feature.color, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                mb: 3,
              }}
            >
              Ready to Experience These Features?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95, maxWidth: 600, mx: 'auto' }}>
              Start your free trial today and see how Polyclinic HMS can transform your practice
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                },
                transition: 'all 0.3s',
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Features;

import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Stack, 
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  LocalHospital as InsuranceIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const InsurancePayment = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);

  const acceptedInsurances = [
    { 
      name: 'NHIF', 
      fullName: 'National Health Insurance Fund',
      type: 'Government', 
      popular: true,
      logo: 'https://www.nhif.or.tz/sites/default/files/logo.png',
      fallbackLogo: '/images/insurance/nhif.png',
    },
    { 
      name: 'AAR Insurance', 
      fullName: 'AAR Insurance',
      type: 'Private', 
      popular: true,
      logo: 'https://aar.co.tz/wp-content/uploads/2023/09/aar-logo.png',
      fallbackLogo: '/images/insurance/aar-logo.png',
    },
    { 
      name: 'Jubilee Insurance', 
      fullName: 'Jubilee Insurance',
      type: 'Private', 
      popular: true,
      logo: 'https://www.jubileeinsurance.com/wp-content/uploads/2020/01/Jubilee-Logo.png',
      fallbackLogo: '/images/insurance/jubilee-logo.png',
    },
    { 
      name: 'Sanlam Insurance', 
      fullName: 'Sanlam Insurance',
      type: 'Private', 
      popular: false,
      logo: 'https://www.sanlam.co.tz/wp-content/uploads/sanlam-logo.png',
      fallbackLogo: '/images/insurance/sanlam-logo.png',
    },
    { 
      name: 'Alliance Insurance', 
      fullName: 'Alliance Insurance',
      type: 'Private', 
      popular: false,
      logo: 'https://allianceinsurance.co.tz/wp-content/uploads/alliance-logo.png',
      fallbackLogo: '/images/insurance/alliance-logo.png',
    },
    { 
      name: 'UAP Insurance', 
      fullName: 'UAP Insurance',
      type: 'Private', 
      popular: false,
      logo: 'https://www.uap-group.com/wp-content/uploads/uap-logo.png',
      fallbackLogo: '/images/insurance/uap-logo.png',
    },
    { 
      name: 'Britam Insurance', 
      fullName: 'Britam Insurance',
      type: 'Private', 
      popular: false,
      logo: 'https://www.britam.com/wp-content/uploads/britam-logo.png',
      fallbackLogo: '/images/insurance/britam-logo.png',
    },
    { 
      name: 'CIC Insurance', 
      fullName: 'CIC Insurance',
      type: 'Private', 
      popular: false,
      logo: 'https://www.cic.co.ke/wp-content/uploads/cic-logo.png',
      fallbackLogo: '/images/insurance/cic-logo.png',
    },
  ];

  const paymentMethods = [
    {
      title: 'Cash',
      description: 'We accept cash payments at our clinic',
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#00BCD4',
    },
    {
      title: 'Credit/Debit Cards',
      description: 'Visa, MasterCard, and American Express accepted',
      icon: <CreditCardIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Mobile Money',
      description: 'M-Pesa, Tigo Pesa, Airtel Money, and other mobile payment options',
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#00BCD4',
    },
    {
      title: 'Bank Transfer',
      description: 'Direct bank transfers accepted with proof of payment',
      icon: <BankIcon sx={{ fontSize: 40 }} />,
      color: '#42a5f5',
    },
    {
      title: 'Insurance Claims',
      description: 'We process insurance claims directly with your provider',
      icon: <InsuranceIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
    },
    {
      title: 'Checks',
      description: 'Personal and business checks accepted (subject to verification)',
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#4dd0e1',
    },
  ];

  const paymentPlans = [
    {
      title: 'Standard Payment Plan',
      duration: '3-6 months',
      description: 'Flexible monthly payments for consultations and basic services',
      features: ['No interest for 3 months', 'Easy monthly installments', 'Quick approval process'],
      color: '#1976d2',
    },
    {
      title: 'Extended Payment Plan',
      duration: '6-12 months',
      description: 'Longer-term payment plans for major procedures and inpatient care',
      features: ['Low interest rates', 'Flexible terms', 'No prepayment penalties'],
      color: '#00BCD4',
    },
    {
      title: 'Student Discount Plan',
      duration: 'Flexible',
      description: 'Special payment options for students with valid ID',
      features: ['Student discounts available', 'Flexible payment terms', 'No credit check required'],
      color: '#00BCD4',
    },
  ];

  const insuranceBenefits = [
    'General outpatient consultations',
    'Laboratory diagnostic tests',
    'Radiology and imaging services',
    'Pharmacy and e-prescriptions',
    'Inpatient care (when covered)',
    'Follow-up appointments',
  ];

  useEffect(() => {
    // Hero animation - only animate position, keep opacity at 1
    if (heroRef.current) {
      const heroElements = heroRef.current.children;
      gsap.set(heroElements, { opacity: 1 });
      gsap.from(heroElements, {
        duration: 1.2,
        y: 60,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    // Section animations - only animate position, keep opacity at 1
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        const sectionElements = section.children;
        gsap.set(sectionElements, { opacity: 1 });
        gsap.from(sectionElements, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
          duration: 0.8,
          y: 40,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pt: { xs: '56px', sm: '64px' } }}>
      <Navbar />
      
      {/* Hero Section - Light Blue/Purple Gradient - Matching Blog Page */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #E0F7FA 100%)',
          color: '#212529',
          py: { xs: 5, md: 6 },
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
            zIndex: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                mb: 2,
                color: '#1C1C1C !important',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #1C1C1C 0%, #1976d2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Insurance & Payment Options
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: '#555 !important',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              Making quality healthcare accessible through flexible insurance acceptance and convenient payment options
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Payment Methods Section */}
      <Box 
        ref={(el) => (sectionsRef.current[0] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: 'white' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B',
                mb: 2,
              }}
            >
              Accepted Payment Methods
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              We offer multiple convenient payment options to suit your needs
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {paymentMethods.map((method, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '12px',
                        bgcolor: `${method.color}15`,
                        color: method.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {method.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: '#1A4A6B',
                        fontSize: '1.1rem',
                      }}
                    >
                      {method.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#555',
                        lineHeight: 1.7,
                        fontSize: '0.95rem',
                      }}
                    >
                      {method.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Insurance Plans Section */}
      <Box 
        ref={(el) => (sectionsRef.current[1] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8f9fa' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B',
                mb: 2,
              }}
            >
              Accepted Insurance Plans
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              We accept a wide range of insurance plans to make your healthcare more affordable
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 4 }}>
            {acceptedInsurances.map((insurance, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    p: { xs: 2, sm: 2.5 },
                    transition: 'all 0.3s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: { xs: 56, sm: 64 },
                        height: { xs: 56, sm: 64 },
                        borderRadius: '8px',
                        bgcolor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Box
                        component="img"
                        src={insurance.logo}
                        alt={`${insurance.name} logo`}
                        onError={(e) => {
                          if (e.target.src !== insurance.fallbackLogo) {
                            e.target.src = insurance.fallbackLogo;
                          } else {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                        sx={{
                          width: '90%',
                          height: '90%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                      <Box
                        sx={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#1976d215',
                          color: '#1976d2',
                        }}
                      >
                        <InsuranceIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: '#1A4A6B',
                            fontSize: { xs: '0.9rem', sm: '0.95rem' },
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                          title={insurance.fullName}
                        >
                          {insurance.name}
                        </Typography>
                        {insurance.popular && (
                          <Chip
                            label="Popular"
                            size="small"
                            sx={{
                              bgcolor: '#43e97b15',
                              color: '#00BCD4',
                              fontSize: '0.65rem',
                              height: 18,
                              fontWeight: 600,
                              '& .MuiChip-label': {
                                px: 0.75,
                              },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          fontSize: '0.75rem',
                          display: 'block',
                        }}
                      >
                        {insurance.type}
                      </Typography>
                    </Box>
                    <CheckIcon sx={{ color: '#43e97b', fontSize: { xs: 20, sm: 24 }, flexShrink: 0 }} />
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
              bgcolor: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <InfoIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: '#1A4A6B',
              }}
            >
              Don't See Your Insurance Plan?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#555',
                mb: 3,
                lineHeight: 1.8,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Contact us to verify if we accept your insurance. We're constantly adding new insurance providers to serve our patients better.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PhoneIcon />}
              onClick={() => navigate('/contact')}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              Call us now to Verify
            </Button>
          </Card>
        </Container>
      </Box>

      {/* Payment Plans Section */}
      <Box 
        ref={(el) => (sectionsRef.current[2] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: 'white' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B',
                mb: 2,
              }}
            >
              Flexible Payment Plans
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              We offer flexible payment options to make quality healthcare accessible to everyone
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {paymentPlans.map((plan, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: `2px solid ${plan.color}30`,
                    bgcolor: 'white',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 30px ${plan.color}30`,
                      borderColor: plan.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: `${plan.color}15`,
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: plan.color,
                        mb: 1,
                        fontSize: '1.5rem',
                      }}
                    >
                      {plan.title}
                    </Typography>
                    <Chip
                      label={plan.duration}
                      sx={{
                        bgcolor: plan.color,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#555',
                        mb: 3,
                        lineHeight: 1.7,
                        minHeight: 50,
                      }}
                    >
                      {plan.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List sx={{ py: 0 }}>
                      {plan.features.map((feature, idx) => (
                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon sx={{ color: plan.color, fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: '0.9rem',
                                color: '#333',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant="outlined"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/contact')}
                      sx={{
                        mt: 3,
                        borderColor: plan.color,
                        color: plan.color,
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: plan.color,
                          bgcolor: `${plan.color}10`,
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Insurance Benefits Section */}
      <Box 
        ref={(el) => (sectionsRef.current[3] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8f9fa' }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '12px',
                      bgcolor: '#1976d215',
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    <InsuranceIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#1A4A6B',
                    }}
                  >
                    What Insurance Covers
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#555',
                    mb: 3,
                    lineHeight: 1.8,
                  }}
                >
                  Most insurance plans cover a variety of healthcare services. Coverage varies by plan, but typically includes:
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <List sx={{ flex: 1 }}>
                    {insuranceBenefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: '#43e97b', fontSize: 24 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={benefit}
                          primaryTypographyProps={{
                            sx: {
                              fontSize: '1rem',
                              color: '#333',
                              fontWeight: 500,
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '12px',
                      bgcolor: '#00BCD415',
                      color: '#00BCD4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#1A4A6B',
                    }}
                  >
                    Insurance Verification
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#555',
                    mb: 3,
                    lineHeight: 1.8,
                  }}
                >
                  Before your visit, we can help you verify your insurance coverage and understand what services are covered under your plan.
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <ScheduleIcon sx={{ color: '#667eea', fontSize: 24, mt: 0.5, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A4A6B', mb: 0.5 }}>
                          Pre-Visit Verification
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>
                          Call us before your appointment to verify your insurance coverage and estimated costs
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <VerifiedIcon sx={{ color: '#667eea', fontSize: 24, mt: 0.5, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A4A6B', mb: 0.5 }}>
                          Direct Billing
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>
                          We handle insurance claims directly, so you don't have to worry about paperwork
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <HelpIcon sx={{ color: '#667eea', fontSize: 24, mt: 0.5, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A4A6B', mb: 0.5 }}>
                          Coverage Questions
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>
                          Our team is here to answer any questions about your insurance coverage
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box 
        ref={(el) => (sectionsRef.current[4] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: 'white' }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B',
                mb: 2,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Common questions about insurance and payment options
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                question: 'Do you accept insurance?',
                answer: 'Yes, we accept most major insurance plans including NHIF, AAR, Jubilee, and many others. Please call us now to verify if your specific insurance plan is accepted.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept cash, credit/debit cards, mobile money (M-Pesa, Tigo Pesa, Airtel Money), bank transfers, and checks. We also process insurance claims directly.',
              },
              {
                question: 'Do you offer payment plans?',
                answer: 'Yes, we offer flexible payment plans for eligible patients. Plans range from 3-12 months depending on the service. Please speak with our billing department to discuss your options.',
              },
              {
                question: 'Will my insurance cover laboratory tests?',
                answer: 'Coverage for laboratory tests and diagnostics varies by insurance plan. Most plans cover essential diagnostic tests, while others may have specific limitations. We recommend contacting your insurance provider or our office to verify coverage.',
              },
              {
                question: 'What if I don\'t have insurance?',
                answer: 'We offer competitive self-pay rates for patients without insurance. We also provide discounts for seniors, students, and military personnel. Payment plans are also available.',
              },
              {
                question: 'How do I verify my insurance coverage?',
                answer: 'You can call us before your appointment to verify your insurance coverage. We\'ll check your benefits and provide an estimate of any out-of-pocket costs.',
              },
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    p: 3,
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      color: '#1A4A6B',
                      fontSize: '1.1rem',
                    }}
                  >
                    {faq.question}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#555',
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        ref={(el) => (sectionsRef.current[5] = el)}
        sx={{ py: { xs: 4, md: 6 }, bgcolor: '#f8f9fa' }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              bgcolor: 'white',
              p: { xs: 4, md: 6 },
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 800,
                mb: 2,
                color: '#1A4A6B',
              }}
            >
              Have Questions About Insurance or Payment?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Our team is here to help you understand your insurance coverage and payment options. Call us now!
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'center', maxWidth: 500, mx: 'auto' }}
            >
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={() => navigate('/contact')}
                sx={{
                  bgcolor: '#1976d2',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
                }}
              >
                Call us now
              </Button>
              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => navigate('/appointment')}
                sx={{
                  borderColor: '#667eea',
                  color: '#1976d2',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: '#1976d210',
                  },
                }}
              >
                Book Appointment
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default InsurancePayment;

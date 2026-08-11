import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  Visibility as EyeIcon,
  Healing as TreatmentIcon,
  ShoppingBag as SpectaclesIcon,
  Groups as OutreachIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './components/SEO';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Enhanced Color Scheme - Blue/Teal Theme
const colors = {
  primary: '#1E88E5',
  primaryLight: '#4FC3F7',
  primaryDark: '#1565c0',
  secondary: '#00ACC1',
  secondaryLight: '#4dd0e1',
  secondaryDark: '#0097a7',
  white: '#FFFFFF',
  offWhite: '#F5FAFF',
  lightGray: '#E9ECEF',
  mediumGray: '#DEE2E6',
  textPrimary: '#0D2B45',
  textSecondary: '#7A8A9A',
  textDarkGray: '#4A4A4A',
  darkCharcoal: '#0D2B45',
  borderLight: '#E0EAF3',
  success: '#2ECC71',
  info: '#00ACC1',
  warning: '#FFC107',
};

const Services = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const servicesRef = useRef([]);
  const sectionRef = useRef(null);
  const ctaRef = useRef(null);

  const services = [
    {
      id: 'health-checkup',
      icon: EyeIcon,
      title: 'Comprehensive Health Checkup',
      description: 'Our comprehensive health checkup service utilizes modern diagnostic equipment and evidence-based techniques to provide a thorough assessment of your overall health and wellbeing. Our experienced doctors conduct detailed evaluations to detect early signs of chronic conditions such as diabetes and hypertension, check your vital signs, and evaluate your general health. Each checkup is tailored to your individual needs, age, and medical history, ensuring personalized care recommendations that support optimal health throughout your life.',
      features: [
        'Complete health assessment and vital signs check',
        'Advanced diagnostic screening with laboratory testing',
        'Comprehensive blood pressure and blood sugar screening',
        'Blood and urine laboratory tests',
        'Height, weight and body mass index evaluation',
        'Chronic disease risk assessment',
        'Referral for specialized care when needed',
        'Personalized health advice and follow-up',
      ],
      image: '/images/services-vision-testing.jpeg',
      color: '#1E88E5',
    },
    {
      id: 'general-consultation',
      icon: EyeIcon,
      title: 'General Medical Consultation',
      description: 'Our general medical consultation service evaluates your overall health and addresses a wide range of everyday health concerns. This comprehensive evaluation includes checking your vital signs, reviewing your medical history, and diagnosing common conditions such as infections, fever, malaria, and typhoid. Our experienced doctors use modern techniques and equipment to identify health problems that may affect your daily life and wellbeing, providing personalized treatment plans to improve your comfort and performance.',
      features: [
        'Vital signs and general health assessment',
        'Diagnosis and treatment of common conditions',
        'Treatment of infections, fever, malaria and typhoid',
        'Prescription medication and treatment plans',
        'Health education and lifestyle guidance',
        'Management of acute and chronic conditions',
        'Referral to specialist physicians when needed',
        'Follow-up care and progress monitoring',
      ],
      image: '/images/services-vision-testing.jpeg',
      color: '#764ba2',
    },
    {
      id: 'manage-treat-conditions',
      icon: TreatmentIcon,
      title: 'Diagnose, Manage and Treat Medical Conditions',
      description: 'Our clinic specializes in the expert diagnosis and comprehensive management of various medical conditions and diseases. Our team of qualified doctors uses modern diagnostic technology to identify conditions such as diabetes, hypertension, infections, and other common illnesses. We develop personalized treatment plans that may include prescription medications, lifestyle modifications, and when necessary, timely referrals to specialist physicians for advanced care.',
      features: [
        'Modern diagnostic tools and laboratory testing',
        'Personalized treatment protocol development',
        'Chronic disease management and monitoring',
        'Prescription medication management',
        'Specialist referral coordination',
        'Regular follow-up care and progress tracking',
        'Emergency care services',
        'Inpatient care and management',
      ],
      image: '/images/gallery-staff-at-work.jpeg',
      color: '#f093fb',
    },
    {
      id: 'laboratory-diagnostics',
      icon: EyeIcon,
      title: 'Laboratory Diagnostics',
      description: 'Our on-site laboratory offers a wide range of diagnostic tests to support accurate diagnosis and treatment. Our qualified laboratory technologists use modern equipment to perform blood tests, urine analysis, infection screening, and routine health panels. Most results are available the same day, allowing your doctor to make timely, informed decisions about your care.',
      features: [
        'Complete blood count and blood chemistry',
        'Urine analysis and pregnancy testing',
        'Malaria, typhoid and infection screening',
        'Blood sugar and cholesterol testing',
        'Health panels and wellness screening',
        'Same-day results and reporting',
        'Direct results to your consulting doctor',
        'Follow-up testing and monitoring',
      ],
      image: '/images/services-vision-testing.jpeg',
      color: '#4facfe',
    },
    {
      id: 'pharmacy-e-prescriptions',
      icon: SpectaclesIcon,
      title: 'Pharmacy & E-Prescriptions',
      description: 'Our pharmacy service works hand-in-hand with your doctor through electronic prescriptions. Once your consultation is complete, your prescription is sent directly to our on-site pharmacy for fast and convenient dispensing. Our pharmacists provide clear dosage guidance, medication counseling, and safety checks to ensure you use your medicines correctly and effectively.',
      features: [
        'Electronic prescriptions from your doctor',
        'Fast on-site medication dispensing',
        'Wide range of common medications',
        'Clear dosage and usage instructions',
        'Medication counseling and advice',
        'Drug safety and interaction checks',
        'Chronic medication refills and support',
        'Ongoing follow-up and monitoring',
      ],
      image: '/images/services-glasses-frames.jpeg',
      color: '#43e97b',
    },
    {
      id: 'wards-inpatient',
      icon: OutreachIcon,
      title: 'Wards & Inpatient Care',
      description: 'We are committed to providing quality inpatient care for patients who need admission and close monitoring. Our comfortable ward facilities are supported by a dedicated nursing team that provides round-the-clock care, medication administration, and continuous monitoring. We work closely with your doctor to plan your treatment and prepare for a smooth discharge and recovery at home.',
      features: [
        'Comfortable ward accommodation',
        '24/7 nursing and medical care',
        'Continuous patient monitoring',
        'Medication administration and records',
        'Daily review by your doctor',
        'Inpatient laboratory and imaging support',
        'Family updates and communication',
        'Discharge planning and follow-up care',
      ],
      image: '/images/appointment-receptionist.jpeg',
      color: '#ff6b6b',
    },
  ];

  const serviceCategories = [
    'General Medical Consultation',
    'Comprehensive Health Checkup',
    'Diagnosis & Treatment',
    'Laboratory Diagnostics',
    'Pharmacy & E-Prescriptions',
    'Wards & Inpatient Care',
    'Emergency Services',
    'Community Health Outreach',
  ];

  const recentServices = [
    { title: 'Advanced Laboratory Diagnostics', image: '/images/services-vision-testing.jpeg' },
    { title: 'Modern Pharmacy & Medication Dispensing', image: '/images/services-glasses-frames.jpeg' },
    { title: 'Professional Healthcare Team', image: '/images/gallery-staff-at-work.jpeg' },
  ];

  const popularTags = [
    'Outpatient Care',
    'Laboratory Services',
    'Pharmacy',
    'Inpatient Care',
    'Maternal Health',
    'Polyclinic HMS',
    'Tanzania',
    'Healthcare',
  ];

  useEffect(() => {
    // Hero section animation - only animate position, keep opacity at 1
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      gsap.set(heroElements, { opacity: 1, y: 0 });
      gsap.from(heroElements, {
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }

    // Services cards animation - only animate position/scale, keep opacity at 1
    servicesRef.current.forEach((ref, index) => {
      if (ref) {
        gsap.set(ref, { opacity: 1, y: 0 });
        gsap.from(ref, {
          scrollTrigger: {
            trigger: ref,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.8,
          y: 60,
          scale: 0.9,
          ease: 'back.out(1.7)',
          delay: index * 0.1,
        });
      }
    });

    // Section animation - only animate position, keep opacity at 1
    if (sectionRef.current) {
      gsap.set(sectionRef.current, { opacity: 1, y: 0 });
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
        duration: 1,
        y: 30,
        ease: 'power2.out',
      });
    }

    // CTA section animation - only animate position, keep opacity at 1
    if (ctaRef.current) {
      const ctaElements = ctaRef.current.querySelectorAll('.cta-animate');
      gsap.set(ctaElements, { opacity: 1, y: 0 });
      gsap.from(ctaElements, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
        },
        duration: 1,
        y: 50,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    // Cleanup
    return () => {
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa !important', pt: { xs: '56px', sm: '64px' } }}>
      <SEO 
        title="Our Services - Polyclinic HMS | Comprehensive Healthcare Solutions in Tanzania"
        description="Polyclinic HMS offers comprehensive healthcare services including outpatient consultations, health checkups, laboratory diagnostics, pharmacy & e-prescriptions, and wards & inpatient care in Dar es Salaam, Tanzania."
        keywords="healthcare services Tanzania, medical clinic Dar es Salaam, outpatient consultation, laboratory tests, pharmacy services, inpatient care, health checkup, Polyclinic HMS services"
      />
      <Navbar />
      
      {/* Hero Section - Light Blue/Purple Gradient Background - Two Column Layout */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          color: '#212529',
          pt: 0,
          pb: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: { xs: 4, md: 5 } }}>
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            {/* Left Column - Heading and Primary Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  className="hero-animate"
                  variant="overline"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: colors.primary,
                    textTransform: 'uppercase',
                    mb: 1.5,
                    display: 'block',
                    opacity: 1,
                  }}
                >
                  Professional Healthcare
                </Typography>
                <Typography
                  className="hero-animate"
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem', lg: '3.25rem' },
                    fontWeight: 900,
                    mb: 2.5,
                    color: `${colors.darkCharcoal} !important`,
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${colors.darkCharcoal} 0%, ${colors.primary} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 1,
                    lineHeight: 1.2,
                  }}
                >
                  Our Services
                </Typography>
                <Typography
                  className="hero-animate"
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: '#4A4A4A !important',
                    lineHeight: 1.8,
                    mb: 2,
                    opacity: 1,
                  }}
                >
                  At Polyclinic HMS, we provide comprehensive, patient-centered healthcare services designed to keep you and your family well. Our experienced team of doctors and nurses utilizes modern technology and evidence-based practices to deliver exceptional care tailored to your unique needs.
                </Typography>
                <Typography
                  className="hero-animate"
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: `${colors.textSecondary} !important`,
                    lineHeight: 1.7,
                    opacity: 1,
                  }}
                >
                  From general consultations and routine checkups to laboratory testing, medication dispensing, and inpatient care, we are committed to supporting the health and wellbeing of individuals and families throughout Tanzania.
                </Typography>
              </Box>
            </Grid>

            {/* Right Column - Secondary Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  className="hero-animate"
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: '#4A4A4A !important',
                    lineHeight: 1.8,
                    mb: 2.5,
                    opacity: 1,
                  }}
                >
                  Our comprehensive range of services includes modern diagnostic capabilities, personalized treatment plans, convenient pharmacy services, and quality inpatient care, all delivered with professionalism, compassion, and the highest standards of clinical excellence.
                </Typography>
                <Box
                  className="hero-animate"
                  sx={{
                    opacity: 1,
                    p: { xs: 2, md: 3 },
                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 2,
                    borderLeft: `4px solid ${colors.primary}`,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        color: `${colors.textSecondary} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      <strong style={{ color: colors.darkCharcoal }}>What We Offer:</strong>
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, color: '#4A4A4A' }}>
                      <Typography component="li" variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        General medical consultation
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        Comprehensive health checkup
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        Diagnose, manage and treat medical conditions
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        Laboratory diagnostics
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        Pharmacy & e-prescriptions
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.7 }}>
                        Wards & inpatient care
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section - Two Column Layout - Light Blue/Purple Gradient */}
      <Box 
        ref={sectionRef}
        sx={{ 
          py: { xs: 5, md: 7 },
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                fontWeight: 800,
                mb: 1.5,
                color: `${colors.darkCharcoal} !important`,
              }}
            >
              Comprehensive Healthcare Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#4A4A4A !important',
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Explore our range of professional services designed to support your health and wellbeing
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Left Column - Main Services Content */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card
                    key={service.id}
                    ref={(el) => (servicesRef.current[index] = el)}
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white !important',
                      overflow: 'hidden',
                      mb: { xs: 1.5, md: 2 },
                      transition: 'all 0.3s',
                      position: 'relative',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      },
                      '& *': {
                        color: 'inherit',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 250, sm: 300, md: 380, lg: 400 },
                        overflow: 'hidden',
                        bgcolor: '#f0f0f0',
                        position: 'relative',
                        '&:hover img': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={service.image}
                        alt={service.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }}
                        onError={(e) => {
                          e.target.src = '/images/clinic-exterior-building.jpeg';
                          e.target.onerror = null;
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 }, color: '#333' }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          icon={<IconComponent sx={{ fontSize: '1rem !important', color: service.color }} />}
                          label={service.title.split(' ')[0]}
                          size="small"
                          sx={{
                            bgcolor: `${service.color}15`,
                            color: service.color,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          color: '#1C1C1C !important',
                          fontSize: { xs: '1.5rem', md: '2rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {service.title}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          color: '#4A4A4A !important',
                          lineHeight: 1.8,
                          fontSize: { xs: '0.95rem', md: '1rem' },
                        }}
                      >
                        {service.description}
                      </Typography>
                      
                      {/* Features */}
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: '#1C1C1C !important',
                            fontSize: '1rem',
                          }}
                        >
                          Service Features:
                        </Typography>
                        <Grid container spacing={2}>
                          {service.features.map((feature, idx) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <CheckIcon
                                  sx={{
                                    color: service.color,
                                    fontSize: 20,
                                    mt: 0.25,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#4A4A4A !important',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.7,
                                  }}
                                >
                                  {feature}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>

                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/appointment')}
                        sx={{
                          bgcolor: service.color,
                          color: 'white',
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          borderRadius: '8px',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: service.color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>

            {/* Right Column - Sidebar (No Search Bar) */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ position: { xs: 'relative', lg: 'sticky' }, top: { lg: 100 } }}>
                {/* Recent Services */}
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white !important',
                    mb: 3,
                    position: 'relative',
                    zIndex: 1,
                    '& *': {
                      color: 'inherit',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, color: '#333' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#1A4A6B !important',
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Recent Services
                    </Typography>
                    <Stack spacing={2}>
                      {recentServices.map((service, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            cursor: 'pointer',
                            transition: 'opacity 0.3s',
                            '&:hover': {
                              opacity: 0.7,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 70,
                              height: 70,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              bgcolor: '#f0f0f0',
                              flexShrink: 0,
                              position: 'relative',
                            }}
                          >
                            <Box
                              component="img"
                              src={service.image}
                              alt={service.title}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.target.src = '/images/clinic-exterior-building.jpeg';
                                e.target.onerror = null;
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.875rem',
                              color: '#4A4A4A !important',
                              lineHeight: 1.5,
                              flex: 1,
                            }}
                          >
                            {service.title}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Service Categories */}
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white !important',
                    mb: 3,
                    position: 'relative',
                    zIndex: 1,
                    '& *': {
                      color: 'inherit',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, color: '#333' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: '#1A4A6B !important',
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Service Categories
                    </Typography>
                    <Stack spacing={1}>
                      {serviceCategories.map((category, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5,
                            cursor: 'pointer',
                            color: '#555',
                            transition: 'color 0.3s',
                            '&:hover': {
                              color: colors.primary,
                            },
                          }}
                        >
                          <ArrowForwardIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: '#555 !important' }}>
                            {category}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Popular Tags */}
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white !important',
                    position: 'relative',
                    zIndex: 1,
                    '& *': {
                      color: 'inherit',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, color: '#333' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: `${colors.darkCharcoal} !important`,
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        letterSpacing: '0.1em',
                      }}
                    >
                      Popular Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {popularTags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: '#f0f0f0',
                            color: '#555',
                            '&:hover': {
                              bgcolor: colors.primary,
                              color: 'white',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section - Light Blue/Purple Gradient */}
      <Box
        ref={ctaRef}
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            className="cta-animate"
            sx={{
              borderRadius: '24px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              bgcolor: 'white',
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              opacity: 1,
            }}
          >
            <Typography
              className="cta-animate"
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#1A4A6B !important',
                fontSize: { xs: '1.5rem', md: '2rem' },
                opacity: 1,
              }}
            >
              Ready to Schedule Your Appointment?
            </Typography>
            <Typography 
              className="cta-animate"
              variant="body1" 
              sx={{ 
                mb: 4, 
                color: '#555 !important',
                fontSize: '1rem',
                lineHeight: 1.8,
                maxWidth: 600,
                mx: 'auto',
                opacity: 1,
              }}
            >
              Experience quality healthcare with our expert team. Book your appointment today and take the first step towards better health and wellbeing.
            </Typography>
            <Stack 
              className="cta-animate"
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ opacity: 1 }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/appointment')}
                sx={{
                  bgcolor: colors.primary,
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
                Book Appointment Now
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/contact')}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: colors.primary,
                    color: 'white',
                  },
                }}
              >
                Call us now
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Services;

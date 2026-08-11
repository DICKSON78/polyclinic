import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Rating,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Security as InsuranceIcon,
  ShoppingBag as ShopIcon,
  Visibility as EyeIcon,
  Healing as TreatmentIcon,
  Lens as ContactLensIcon,
  Groups as OutreachIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  EmojiEvents as AwardIcon,
  LocalHospital as HospitalIcon,
  Verified as VerifiedIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Favorite as FavoriteIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  PlayArrow as PlayIcon,
  Google as GoogleIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Map as MapIcon,
  ChildCare as ChildCareIcon,
  WaterDrop as WaterDropIcon,
  MedicalServices as MedicalServicesIcon,
  MenuBook as MenuBookIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const quickLinksRef = useRef(null);
  const whyChooseRef = useRef(null);
  const videoRef = useRef(null);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  // GSAP Animations
  useEffect(() => {
    // Hero animation - only animate position, keep opacity at 1 for full visibility (like Quick Access Services)
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      // Ensure all elements start fully visible - don't let GSAP touch opacity
      gsap.set(heroElements, { opacity: 1, y: 0 });
      // Only animate y position - opacity stays at 1 (matching Quick Access Services visibility)
      gsap.from(heroElements, {
        y: 30, // Only animate y, opacity is not in the animation object so it won't be touched
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        force3D: true,
      });
    }

    // Quick links animation - only animate position/scale, keep opacity at 1
    if (quickLinksRef.current) {
      const quickLinkCards = quickLinksRef.current.querySelectorAll('.quick-link-card');
      gsap.set(quickLinkCards, { opacity: 1 });
      gsap.from(quickLinkCards, {
        scrollTrigger: {
          trigger: quickLinksRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        scale: 0.9,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      });
    }

    // Why Choose animation - only animate position, keep opacity at 1
    if (whyChooseRef.current) {
      const whyChooseCards = whyChooseRef.current.querySelectorAll('.why-choose-card');
      gsap.set(whyChooseCards, { opacity: 1 });
      gsap.from(whyChooseCards, {
        scrollTrigger: {
          trigger: whyChooseRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const quickLinks = [
    {
      icon: <CalendarIcon sx={{ fontSize: 32 }} />,
      title: 'Book Appointment',
      subtitle: 'Book your medical consultation online in seconds',
      description: '',
      color: colors.primary,
      route: '/appointment',
      buttonText: 'Book Now',
    },
    {
      icon: <StarIcon sx={{ fontSize: 32 }} />,
      title: 'Rate Us',
      subtitle: 'Share your experience and help us improve our services',
      description: '',
      color: colors.secondary,
      route: 'https://g.page/r/CWNj2_Hl76OhEBM/review',
      buttonText: 'Rate Us',
      external: true,
    },
    {
      icon: <ShopIcon sx={{ fontSize: 32 }} />,
      title: 'Our Facilities',
      subtitle: 'Take a tour of our departments and modern healthcare facilities',
      description: '',
      color: colors.success,
      route: '/gallery', // Facilities Gallery
      buttonText: 'Explore Now',
    },
  ];

  const services = [
    {
      icon: <MedicalServicesIcon sx={{ fontSize: 48 }} />,
      title: 'General Outpatient Consultation',
      description: 'Comprehensive medical consultation with our experienced doctors covering family and internal medicine. We take a full medical history, assess your symptoms, and develop a personalized treatment plan. Chronic conditions such as diabetes and hypertension are carefully monitored and managed with regular follow-up appointments.',
      features: [
        'Medical History & Assessment',
        'Personalized Treatment Plans',
        'Chronic Disease Management',
        'Specialist Referrals',
        'Follow-up Care',
      ],
      color: colors.primary,
    },
    {
      icon: <HospitalIcon sx={{ fontSize: 48 }} />,
      title: 'Triage & Vital Signs',
      description: 'Quick and efficient assessment of every patient on arrival. Our nurses measure your blood pressure, temperature, pulse, oxygen saturation, and weight to determine urgency and priority. This ensures that patients with the most critical needs receive care first.',
      features: [
        'Blood Pressure & Pulse',
        'Temperature & Oxygen Levels',
        'Weight & BMI Measurement',
        'Rapid Urgency Assessment',
        'Priority-based Care',
      ],
      color: colors.secondary,
    },
    {
      icon: <WaterDropIcon sx={{ fontSize: 48 }} />,
      title: 'Laboratory Diagnostics',
      description: 'On-site laboratory offering a wide range of diagnostic tests including blood tests, urine analysis, infection screening, and routine health panels. Our qualified laboratory technologists use modern equipment to deliver accurate results, most available the same day.',
      features: [
        'Blood Tests (CBC & More)',
        'Urine Analysis',
        'Infection Screening',
        'Routine Health Panels',
        'Same-day Results',
      ],
      color: colors.info,
    },
    {
      icon: <MedicalServicesIcon sx={{ fontSize: 48 }} />,
      title: 'Radiology & Imaging',
      description: 'Diagnostic imaging services including X-ray and ultrasound to support accurate diagnosis. Our team works closely with your doctor to provide clear, detailed images and reports that guide treatment decisions.',
      features: [
        'X-Ray Imaging',
        'Ultrasound Scans',
        'Detailed Reports',
        'Image Review with Doctors',
        'Referral Support',
      ],
      color: colors.success,
    },
    {
      icon: <TreatmentIcon sx={{ fontSize: 48 }} />,
      title: 'Pharmacy & E-Prescriptions',
      description: 'Electronic prescriptions sent directly from your doctor to our on-site pharmacy for fast and convenient dispensing. Our pharmacists provide clear dosage guidance and medication counseling to ensure you use your medicines safely and effectively.',
      features: [
        'Electronic Prescriptions',
        'On-site Medication Dispensing',
        'Dosage Guidance',
        'Medication Counseling',
        'Drug Safety Checks',
      ],
      color: colors.warning,
    },
    {
      icon: <OutreachIcon sx={{ fontSize: 48 }} />,
      title: 'Wards & Inpatient Care',
      description: 'Comfortable ward facilities and dedicated inpatient care for patients who need admission and close monitoring. Our nursing team provides round-the-clock care, medication administration, and discharge planning to support a smooth recovery.',
      features: [
        'Patient Admissions',
        '24/7 Nursing Care',
        'Continuous Monitoring',
        'Comfortable Ward Beds',
        'Discharge Planning',
      ],
      color: colors.primaryDark,
    },
  ];

  const whyChooseUs = [
    {
      image: '/images/eye_exam.jpeg',
      title: 'General Outpatient Consultation',
      description: 'Comprehensive medical consultation with our experienced doctors covering family and internal medicine. We take a full medical history, assess your symptoms, and develop a personalized treatment plan tailored to your needs, age, and medical history.',
      color: colors.primary,
      route: '/services',
    },
    {
      image: '/images/eyecare.jpeg',
      title: 'Triage & Vital Signs',
      description: 'Quick and efficient assessment of every patient on arrival. Our nurses measure your blood pressure, temperature, pulse, oxygen saturation, and weight to determine urgency and ensure patients with the most critical needs receive care first.',
      color: colors.secondary,
      route: '/services',
    },
    {
      image: '/images/disease.jpeg',
      title: 'Laboratory Diagnostics',
      description: 'On-site laboratory offering a wide range of diagnostic tests including blood tests, urine analysis, and routine health panels. Our qualified laboratory technologists use modern equipment to deliver accurate results, most available the same day.',
      color: colors.info,
      route: '/services',
    },
    {
      image: '/images/lens_fitting.jpeg',
      title: 'Radiology & Imaging',
      description: 'Diagnostic imaging services including X-ray and ultrasound to support accurate diagnosis. Our team works closely with your doctor to provide clear, detailed images and reports that guide treatment decisions.',
      color: colors.success,
      route: '/services',
    },
    {
      image: '/images/eyeware.jpeg',
      title: 'Pharmacy & E-Prescriptions',
      description: 'Electronic prescriptions sent directly from your doctor to our on-site pharmacy for fast and convenient dispensing. Our pharmacists provide clear dosage guidance and medication counseling to ensure safe and effective treatment.',
      color: colors.warning,
      route: '/services',
    },
    {
      image: '/images/dryeye.jpeg',
      title: 'Wards & Inpatient Care',
      description: 'Comfortable ward facilities and dedicated inpatient care for patients who need admission and close monitoring. Our nursing team provides round-the-clock care, medication administration, and discharge planning to support a smooth recovery.',
      color: colors.primaryDark,
      route: '/services',
    },
  ];

  const stats = [
    { number: '24/7', label: 'Online Booking' },
    { number: '5+', label: 'Years Experience' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  return (
    <Box sx={{ bgcolor: colors.white, minHeight: '100vh', pt: { xs: '56px', sm: '64px' } }}>
      <SEO 
        title="Polyclinic HMS - Trusted Healthcare Clinic in Dar es Salaam | Comprehensive Medical Services"
        description="Polyclinic HMS is a modern multi-service healthcare clinic in Dar es Salaam, Tanzania. We offer outpatient consultations, triage & vital signs, laboratory diagnostics, radiology & imaging, pharmacy & e-prescriptions, and wards & inpatient care. Book your appointment today!"
        keywords="polyclinic Tanzania, healthcare clinic Dar es Salaam, medical services, outpatient care, laboratory tests, radiology, pharmacy, e-prescription, inpatient care, health checkup, Polyclinic HMS, doctor Tanzania, family medicine, chronic disease management"
      />
      <Navbar />

      {/* Hero Section with Image Carousel */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '85vh' },
          color: colors.textPrimary,
          pt: { xs: 3, sm: 4, md: 0 },
          pb: { xs: 2, sm: 3, md: 0 },
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          width: '100%',
          backgroundImage: 'url(/images/bg/home_bg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'left center' },
          backgroundRepeat: 'no-repeat',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(232, 244, 248, 0.7) 0%, rgba(240, 232, 255, 0.7) 100%)',
            zIndex: 0,
            pointerEvents: 'none',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
                    zIndex: 1,
            pointerEvents: 'none',
                  },
                }}
              >
        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', gap: 0, height: { xs: 'auto', md: '85vh' }, alignItems: 'stretch', overflow: 'hidden', margin: 0, padding: 0 }}>
          {/* Left Content Section with Container - Takes 65% width to avoid video overlap */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 65%' }, position: 'relative', height: { xs: 'auto', md: '100%' }, display: 'flex', alignItems: 'center', minHeight: { xs: 'auto', sm: 'auto', md: 'auto' } }}>
            <Container maxWidth="xl" sx={{ pr: { xs: 2, sm: 3, md: 4 }, pl: { xs: 2, sm: 3, md: 8 }, py: { xs: 3, sm: 4, md: 6 }, width: '100%', height: { xs: 'auto', md: '100%' }, display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 'auto', md: '100%' },
                  display: 'flex',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  minHeight: { xs: 'auto', sm: 'auto', md: 'auto' },
                  py: { xs: 2, sm: 3, md: 0 },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 3, width: '100%' }}>
              <Typography
                className="hero-animate"
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 900,
                  lineHeight: { xs: 1.3, sm: 1.2, md: 1.2 },
                  mb: { xs: 1, sm: 1.25, md: 1 },
                  letterSpacing: '-0.02em',
                  color: '#1E88E5 !important',
                  opacity: 1,
                  textShadow: '0 2px 8px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  wordBreak: 'break-word',
                }}
              >
                THE CARE YOUR HEALTH DESERVES.
              </Typography>
              <Typography
                className="hero-animate"
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.05rem' },
                  fontWeight: 500,
                  lineHeight: { xs: 1.5, sm: 1.6, md: 1.6 },
                  mb: { xs: 2, sm: 2.25, md: 2 },
                  color: '#4A4A4A !important',
                  opacity: 1,
                  textShadow: '0 1px 4px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.08)',
                  wordBreak: 'break-word',
                }}
              >
                One of the trusted healthcare clinics in Dar es Salaam, delivering expert medical care through precision, advanced technology, and trust.
              </Typography>
              
              <Stack 
                className="hero-animate"
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1.25, sm: 2 }}
                sx={{ mb: { xs: 2.5, sm: 3, md: 2.5 }, opacity: 1, width: '100%' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/appointment')}
                  sx={{
                    bgcolor: '#00ACC1',
                    color: 'white !important',
                    fontWeight: 600,
                    px: { xs: 2.5, sm: 3.5, md: 4 },
                    py: { xs: 1.1, sm: 1.5 },
                    fontSize: { xs: '0.8125rem', sm: '0.95rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: '#0097a7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Book Appointment Now
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  onClick={() => setPhoneDialogOpen(true)}
                  sx={{
                    borderColor: '#00ACC1',
                    color: '#00ACC1',
                    bgcolor: 'white',
                    fontWeight: 600,
                    px: { xs: 2.5, sm: 3.5, md: 4 },
                    py: { xs: 1.1, sm: 1.5 },
                    fontSize: { xs: '0.8125rem', sm: '0.95rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    borderWidth: 2,
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderColor: '#00ACC1',
                      bgcolor: '#00ACC1',
                      color: 'white !important',
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Call us now
                </Button>
              </Stack>

              <Box className="hero-animate" sx={{ opacity: 1, mt: { xs: 2.5, sm: 3, md: 2.5 }, width: '100%' }}>
                <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} justifyContent="center" alignItems="flex-start">
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 4 }} key={index}>
                      <Box 
                        sx={{ 
                          textAlign: 'center', 
                          opacity: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          height: '100%',
                          px: { xs: 0.5, sm: 1, md: 0 },
                          background: 'transparent',
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.5rem' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            mb: { xs: 0.25, sm: 0.35, md: 0.5 },
                            opacity: 1,
                            color: '#1E88E5 !important',
                            display: 'block',
                            textShadow: '0 2px 6px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {stat.number}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.95rem' },
                            fontWeight: 600,
                            lineHeight: { xs: 1.3, sm: 1.4, md: 1.4 },
                            opacity: 1,
                            color: '#4A4A4A !important',
                            display: 'block',
                            textAlign: 'center',
                            textShadow: '0 1px 3px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.08)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Video Section - Absolutely Positioned at Right Edge */}
          <Box 
            sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              top: { xs: 'auto', md: '7.5%' },
              right: { xs: 0, md: '2%' },
              width: { xs: '100%', md: '28%' },
              height: { xs: '300px', md: '85%' },
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              className="hero-animate"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                width: '100%',
                background: 'transparent',
                border: 'none',
                boxShadow: { xs: 'none', md: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
                borderRadius: { xs: '0', md: '30px' },
              }}
            >
              <Box
                component="video"
                ref={videoRef}
                src="/images/video/home_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Quick Links Section - Enhanced */}
      <Box ref={quickLinksRef} sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Quick Access
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Quick Access
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Fast, convenient access to our most popular services and features. Everything you need for comprehensive healthcare in one place.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {quickLinks.map((link, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  className="quick-link-card"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${link.color}15 0%, ${link.color}08 100%)`,
                    border: `2px solid ${link.color}30`,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: `${link.color}10`,
                      transform: 'scaleY(0)',
                      transformOrigin: 'bottom',
                      transition: 'transform 0.4s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 16px 40px ${link.color}40`,
                      borderColor: link.color,
                      '&::before': {
                        transform: 'scaleY(1)',
                      },
                      '& .quick-link-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: link.color,
                        color: 'white',
                      },
                      '& .quick-link-button': {
                        bgcolor: link.color,
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => {
                    if (link.external) {
                      window.open(link.route, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(link.route);
                    }
                  }}
                >
                  <Box
                    className="quick-link-icon"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: link.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      mx: 'auto',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 4px 16px ${link.color}40`,
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: `${colors.darkCharcoal} !important`,
                      mb: 2,
                      textAlign: 'center',
                    }}
                  >
                    {link.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      color: `${colors.textDarkGray} !important`,
                      lineHeight: 1.7,
                      mb: 3,
                      textAlign: 'center',
                      flexGrow: 1,
                    }}
                  >
                    {link.subtitle}
                  </Typography>
                  <Button
                    className="quick-link-button"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (link.external) {
                        window.open(link.route, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(link.route);
                      }
                    }}
                    sx={{
                      bgcolor: `${link.color}20`,
                      color: link.color,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      width: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: link.color,
                        color: 'white',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {link.buttonText}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section - Enhanced Grid - Light Blue/Purple Gradient */}
      <Box 
        ref={whyChooseRef} 
        sx={{ 
          py: { xs: 4, md: 5 }, 
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.secondary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Services
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', md: '1rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Excellence in healthcare through advanced technology, experienced professionals, and personalized service tailored to your unique needs.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {whyChooseUs.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  className="why-choose-card"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3.5,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `2px solid ${colors.lightGray}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
                      borderColor: item.color,
                    },
                  }}
                  onClick={() => item.route && navigate(item.route)}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      mx: 'auto',
                      mb: 2.5,
                      transition: 'all 0.3s ease',
                      border: `3px solid ${item.color}30`,
                      boxShadow: `0 4px 16px ${item.color}20`,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 6px 20px ${item.color}40`,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/services-vision-testing.jpeg';
                        e.target.onerror = null;
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: `${colors.darkCharcoal} !important`,
                      mb: 1.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.95rem',
                      color: `${colors.textDarkGray} !important`,
                      lineHeight: 1.7,
                      mb: 2,
                      flexGrow: 1,
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.route) navigate(item.route);
                    }}
                    sx={{
                      color: item.color,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      mt: 'auto',
                      '&:hover': {
                        bgcolor: `${item.color}10`,
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Learn More
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us & Order Books Section - Two Column Layout */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: colors.white,
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
            {/* Left Side - Why Choose Us */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    fontWeight: 800,
                    color: `${colors.darkCharcoal} !important`,
                    mb: 3,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Why Choose Us
                </Typography>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Powered by modern medical technology
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Exceptional customer care
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Fast & accurate medical services
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Easy access with spacious parking
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <CheckIcon sx={{ color: colors.secondary, fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                      }}
                    >
                      Wide range of healthcare services
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right Side - Order Books/Journal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  p: { xs: 4, md: 5 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
                  border: `2px solid ${colors.borderLight}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                    borderColor: colors.primary,
                  },
                }}
              >
                {/* Book Image Background */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: '40%', md: '45%' },
                    height: '100%',
                    opacity: 0.15,
                    zIndex: 0,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'url(/images/books/jicho.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    },
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: 'auto',
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/books/jicho.jpg"
                    alt="Health Education Book"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.src = '/images/books/profile.jpeg';
                      e.target.onerror = null;
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 800,
                    color: `${colors.darkCharcoal} !important`,
                    mb: 2,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Order Books/Journal
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: `${colors.textDarkGray} !important`,
                    lineHeight: 1.7,
                    mb: 3,
                  }}
                >
                  Access our collection of health education books and journals. Stay informed with practical guidance on healthy living, disease prevention, and treatment in primary care.
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Health education publications
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Practical wellness guides
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.95rem',
                        color: `${colors.textDarkGray} !important`,
                      }}
                    >
                      Educational resources for patients & families
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/books')}
                  sx={{
                    bgcolor: colors.primary,
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: `0 4px 16px ${colors.primary}40`,
                    '&:hover': {
                      bgcolor: colors.primaryDark,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${colors.primary}50`,
                    },
                    transition: 'all 0.3s ease',
                    mt: 'auto',
                  }}
                >
                  Order Now
                </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Visit Us Today Section - Map & Building Image */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: colors.white,
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primary,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Visit Us Today
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Find Our Location
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Visit our clinic at Gerezani - Kamata traffic light near traffic post, Dar es Salaam, Tanzania
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            {/* Building Image - Left Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: `1px solid ${colors.borderLight}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500, lg: 600 },
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/clinic-exterior-building.jpeg"
                    alt="Polyclinic HMS Clinic Building"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                    onError={(e) => {
                      e.target.src = '/images/gallery-waiting-area.jpeg';
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        mb: 0.5,
                      }}
                    >
                      Polyclinic HMS Clinic
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                      }}
                    >
                      Gerezani - Kamata traffic light, Dar es Salaam
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Map - Right Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: `1px solid ${colors.borderLight}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500, lg: 600 },
                    bgcolor: '#f0f0f0',
                  }}
                >
                  <Box
                    component="iframe"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.638!2d39.2752407!3d-6.8275607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4ba9dcc989f3%3A0xa1a3efe5f1db6363!2sSikaf%20Eye%20Care!5e0!3m2!1sen!2stz!4v1704792000000!5m2!1sen!2stz"
                    sx={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Polyclinic HMS Location - Gerezani, Kamata traffic light, Dar es Salaam"
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: { xs: 15, md: 20 },
                      right: { xs: 15, md: 20 },
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<MapIcon />}
                      component="a"
                      href="https://www.google.com/maps/place/Sikaf+Eye+Care/@-6.8275607,39.2752407,17z/data=!4m14!1m7!3m6!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!2sSikaf+Eye+Care!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v!3m5!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v?entry=ttu"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: colors.primary,
                        color: 'white',
                        fontWeight: 700,
                        px: { xs: 2, md: 3 },
                        py: { xs: 1, md: 1.5 },
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: { xs: '0.875rem', md: '0.95rem' },
                        boxShadow: `0 4px 16px ${colors.primary}40`,
                        '&:hover': {
                          bgcolor: colors.primaryDark,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${colors.primary}50`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Open in Google Maps
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Phone Number Dialog */}
      <Dialog
        open={phoneDialogOpen}
        onClose={() => setPhoneDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#00ACC1' }}>
            Contact Us
          </Typography>
          <IconButton
            onClick={() => setPhoneDialogOpen(false)}
            size="small"
            sx={{
              color: '#666',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <PhoneIcon sx={{ fontSize: 48, color: '#00ACC1', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#1C1C1C' }}>
              +255 676 506 323
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Click the number below to call us directly
            </Typography>
            <Button
              variant="contained"
              component="a"
              href="tel:+255676506323"
              startIcon={<PhoneIcon />}
              sx={{
                bgcolor: '#00ACC1',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0097a7',
                },
              }}
            >
              Call Now
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setPhoneDialogOpen(false)}
            sx={{
              textTransform: 'none',
              color: '#666',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />

      {/* Fixed Social Media Icons - Right Side */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          right: { xs: 8, sm: 12, md: 20 },
          transform: 'translateY(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <IconButton
          component="a"
          href="https://www.instagram.com/sikaf_eye_care?igsh=dGc1YWJhM2FwN3k2&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          sx={{
            bgcolor: '#E4405F',
            color: 'white',
            width: { xs: 36, sm: 40, md: 44 },
            height: { xs: 36, sm: 40, md: 44 },
            borderRadius: '50%',
            boxShadow: '0 3px 10px rgba(228, 64, 95, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#C13584',
              transform: 'scale(1.1)',
              boxShadow: '0 5px 15px rgba(228, 64, 95, 0.6)',
            },
            '& svg': {
              fontSize: { xs: 18, sm: 20, md: 22 },
            },
          }}
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          component="a"
          href="https://wa.me/255676506323"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          sx={{
            bgcolor: '#25D366',
            color: 'white',
            width: { xs: 36, sm: 40, md: 44 },
            height: { xs: 36, sm: 40, md: 44 },
            borderRadius: '50%',
            boxShadow: '0 3px 10px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#20BA5A',
              transform: 'scale(1.1)',
              boxShadow: '0 5px 15px rgba(37, 211, 102, 0.6)',
            },
            '& svg': {
              fontSize: { xs: 18, sm: 20, md: 22 },
            },
          }}
        >
          <WhatsAppIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Home;
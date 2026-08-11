import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  ZoomIn as ZoomInIcon,
  LocationOn as LocationIcon,
  Visibility as EyeIcon,
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

// WhatsApp Contact Information
const WHATSAPP_NUMBER = "+255676506323"; // Polyclinic HMS WhatsApp
const WHATSAPP_MESSAGE = "Hello! I'd like to know more about Polyclinic HMS facilities and services.";

const Facilities = () => {
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const facilityImages = [
    {
      id: 1,
      title: 'General Outpatient Consultation',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-1.jpeg',
      description: 'Our general outpatient consultation rooms provide comfortable, private care for walk-in and scheduled patients.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 2,
      title: 'Triage & Vital Signs',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-2.jpeg',
      description: 'Dedicated triage area for rapid assessment of vital signs and fast-track care.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 3,
      title: 'Pharmacy & E-Prescriptions',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-3.jpeg',
      description: 'On-site pharmacy dispensing prescribed medicines with expert guidance from our pharmacists.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 4,
      title: 'Laboratory Diagnostics',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-4.jpeg',
      description: 'Modern laboratory equipped for accurate, same-day diagnostic testing.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 5,
      title: 'Radiology & Imaging',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-5.jpeg',
      description: 'Imaging suites offering X-ray and ultrasound services for precise diagnosis.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 6,
      title: 'Emergency Care',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-6.jpeg',
      description: '24-hour emergency care unit staffed by experienced medical teams.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 7,
      title: 'Pediatric Care',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-7.jpeg',
      description: 'Child-friendly pediatric department with experienced pediatric specialists.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 8,
      title: 'Maternity & Delivery',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-8.jpeg',
      description: 'Safe, supportive maternity and delivery facilities with skilled midwives.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 9,
      title: 'Minor Surgical Procedures',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-9.jpeg',
      description: 'Well-equipped minor procedure room for safe outpatient surgical care.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 10,
      title: 'Dental Clinic',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-10.jpeg',
      description: 'Comprehensive dental services in a clean, comfortable environment.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 11,
      title: 'Physiotherapy',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-11.jpeg',
      description: 'Physiotherapy and rehabilitation services to support your recovery.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 12,
      title: 'Health Screening',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-12.jpeg',
      description: 'Preventive health screening packages to help you stay well.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 13,
      title: 'Vaccination Services',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-13.jpeg',
      description: 'Vaccination services for children and adults, including travel vaccines.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 14,
      title: 'Patient Registration & Records',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-14.jpeg',
      description: 'Efficient patient registration and medical records management.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 15,
      title: 'Specialist Clinics',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-15.jpeg',
      description: 'Regular specialist clinics covering a wide range of medical fields.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 16,
      title: 'Ambulance Services',
      category: 'Outpatient Departments',
      image: '/images/eyeware/children/children-16.jpeg',
      description: 'Ambulance services for prompt medical transport when you need it most.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 17,
      title: 'Sample Collection Center',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/1.jpeg',
      description: 'Professional sample collection center with minimal waiting time.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 18,
      title: 'Hematology Testing',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/2.jpeg',
      description: 'Accurate blood testing for complete blood counts and related conditions.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 19,
      title: 'Biochemistry Testing',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/3.jpeg',
      description: 'Biochemistry tests including glucose, cholesterol, and organ function.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 20,
      title: 'Microbiology Testing',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/4.jpeg',
      description: 'Microbiology testing for infections and antibiotic guidance.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 21,
      title: 'Urine & Stool Analysis',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/5.jpeg',
      description: 'Urine and stool analysis for quick, reliable results.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 22,
      title: 'Blood Group & Crossmatch',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/6.jpeg',
      description: 'Blood grouping and crossmatch services for safe transfusions.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 23,
      title: 'Ultrasound Imaging',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/7.jpeg',
      description: 'Ultrasound imaging for safe, non-invasive diagnosis.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 24,
      title: 'X-Ray Imaging',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/8.jpeg',
      description: 'Digital X-ray imaging with rapid reporting.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 25,
      title: 'ECG & Cardiac Screening',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/9.jpeg',
      description: 'ECG and cardiac screening for heart health assessment.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 26,
      title: 'Pathology Reporting',
      category: 'Diagnostics & Laboratory',
      image: '/images/galarry/10.jpeg',
      description: 'Careful review and reporting of all laboratory results by qualified staff.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 27,
      title: 'Private Wards',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-1.jpeg',
      description: 'Comfortable private wards for patients who prefer extra privacy.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 28,
      title: 'Semi-Private Wards',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-2.jpeg',
      description: 'Semi-private wards offering quality care at an accessible cost.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 29,
      title: 'General Wards',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-3.jpeg',
      description: 'Spacious general wards with attentive nursing care.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 30,
      title: 'Maternity Ward',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-4.jpeg',
      description: 'Dedicated maternity ward supporting mothers and newborns.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 31,
      title: 'Pediatric Ward',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-5.jpeg',
      description: 'Specialist pediatric ward for the care of sick children.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 32,
      title: 'Isolation Ward',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-6.jpeg',
      description: 'Controlled isolation facilities for managing infectious conditions.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 33,
      title: 'Intensive Care Unit',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-7.jpeg',
      description: 'Intensive care unit for critically ill patients requiring close monitoring.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 34,
      title: 'Nursing Station',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-8.jpeg',
      description: '24-hour nursing stations ensuring constant, responsive care.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 35,
      title: 'Recovery Room',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-9.jpeg',
      description: 'Quiet recovery rooms for patients resting after procedures.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 36,
      title: 'Inpatient Pharmacy',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-10.jpeg',
      description: 'Inpatient pharmacy providing medicines throughout your stay.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 37,
      title: 'Cafeteria & Waiting Lounge',
      category: 'Inpatient & Wards',
      image: '/images/eyeware/executive/executive-11.jpeg',
      description: 'Cafeteria and comfortable waiting lounge for families and visitors.',
      whatsappNumber: WHATSAPP_NUMBER,
    },
  ];

  const categories = ['Outpatient Departments', 'Diagnostics & Laboratory', 'Inpatient & Wards'];
  const [activeCategory, setActiveCategory] = useState('Outpatient Departments');

  const filteredImages = facilityImages.filter(img => img.category === activeCategory);

  const openModal = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    setSelectedImage(filteredImages[newIndex]);
    setSelectedIndex(newIndex);
  };

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

    // Facility items animation - only animate position, keep opacity at 1
    if (galleryRef.current) {
      const facilityItems = galleryRef.current.querySelectorAll('.facility-item');
      gsap.set(facilityItems, { opacity: 1 });
      gsap.from(facilityItems, {
        scrollTrigger: {
          trigger: galleryRef.current,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [activeCategory]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.white, pt: { xs: '56px', sm: '64px' } }}>
      <SEO
        title="Our Facilities - Polyclinic HMS | Departments, Diagnostics & Wards"
        description="Explore the facilities at Polyclinic HMS including outpatient departments, diagnostics and laboratory, and inpatient wards. Modern, well-equipped healthcare in Dar es Salaam."
        keywords="Polyclinic HMS facilities, clinic departments, hospital wards, laboratory diagnostics, inpatient care, healthcare facilities Dar es Salaam"
      />
      <Navbar />

      {/* Hero Section - Light Blue/Purple Gradient */}
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          color: colors.textPrimary,
          pt: { xs: 5, md: 6 },
          pb: { xs: 4, md: 5 },
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              className="hero-animate"
              variant="overline"
              sx={{
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: colors.primary,
                textTransform: 'uppercase',
                mb: 2,
                display: 'block',
                opacity: 1,
              }}
            >
              Our Facilities
            </Typography>
            <Typography
              className="hero-animate"
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '4.5rem' },
                fontWeight: 900,
                mb: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                opacity: 1,
              }}
            >
              Our Facilities
            </Typography>
            <Typography
              className="hero-animate"
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: `${colors.textDarkGray} !important`,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                mb: 4,
                opacity: 1,
              }}
            >
              Take a look at our modern, well-equipped facilities. From outpatient departments and laboratory diagnostics to comfortable inpatient wards, everything is designed to deliver safe, quality healthcare for you and your family.
            </Typography>
            <Box
              className="hero-animate"
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                opacity: 1,
              }}
            >
              <Chip
                icon={<EyeIcon />}
                label={`${facilityImages.length} Facilities`}
                sx={{
                  bgcolor: colors.primary,
                  color: colors.white,
                  fontWeight: 600,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.95rem',
                }}
              />
              <Chip
                icon={<LocationIcon />}
                label="Dar es Salaam, Tanzania"
                sx={{
                  bgcolor: colors.white,
                  color: colors.primary,
                  fontWeight: 600,
                  border: `2px solid ${colors.primary}`,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.95rem',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Category Filter */}
      <Box
        sx={{
          py: { xs: 3, md: 4 },
          bgcolor: colors.offWhite,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                variant={activeCategory === category ? 'contained' : 'outlined'}
                sx={{
                  bgcolor: activeCategory === category ? colors.primary : 'transparent',
                  color: activeCategory === category ? colors.white : colors.textDarkGray,
                  borderColor: activeCategory === category ? colors.primary : colors.borderLight,
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderRadius: 2.5,
                  '&:hover': {
                    bgcolor: activeCategory === category ? colors.primaryLight : colors.lightGray,
                    borderColor: colors.primary,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Facilities Grid */}
      <Box ref={galleryRef} sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {filteredImages.map((item, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={item.id}
              >
                <Card
                  className="facility-item"
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: `1px solid ${colors.borderLight}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: colors.white,
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: `0 20px 48px rgba(45, 90, 90, 0.2)`,
                      borderColor: colors.primary,
                      '& .facility-image': {
                        transform: 'scale(1.08)',
                      },
                      '& .facility-overlay': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => openModal(item, index)}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: { xs: 280, sm: 300, md: 320 },
                      bgcolor: colors.lightGray,
                    }}
                  >
                    <Box
                      component="img"
                      className="facility-image"
                      src={item.image}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/galarry/1.jpeg';
                      }}
                    />
                    <Box
                      className="facility-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(45, 90, 90, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 48, color: colors.white }} />
                    </Box>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: colors.primary,
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: `${colors.darkCharcoal} !important`,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: `${colors.textDarkGray} !important`,
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredImages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h5"
                sx={{
                  color: colors.textDarkGray,
                  mb: 2,
                }}
              >
                No facilities found in this category
              </Typography>
              <Button
                onClick={() => setActiveCategory('Outpatient Departments')}
                variant="contained"
                sx={{
                  bgcolor: colors.primary,
                  color: colors.white,
                  '&:hover': {
                    bgcolor: colors.primaryLight,
                  },
                }}
              >
                View All Facilities
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Image Modal/Lightbox */}
      <Dialog
        open={!!selectedImage}
        onClose={closeModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            m: 2,
          },
        }}
        BackdropProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
          },
        }}
      >
        {selectedImage && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              onClick={closeModal}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: colors.white,
                zIndex: 10,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {filteredImages.length > 1 && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: colors.white,
                    zIndex: 10,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: colors.white,
                    zIndex: 10,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </>
            )}

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                maxWidth: '90vw',
                maxHeight: '90vh',
              }}
            >
              <Box
                component="img"
                src={selectedImage.image}
                alt={selectedImage.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                }}
                onError={(e) => {
                  e.target.src = '/images/gallery-staff-at-work.jpeg';
                }}
              />
              <Box
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  color: colors.white,
                  maxWidth: 600,
                }}
              >
                <Chip
                  label={selectedImage.category}
                  size="small"
                  sx={{
                    bgcolor: colors.primary,
                    color: colors.white,
                    mb: 2,
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: colors.white,
                    mb: 1,
                    fontWeight: 700,
                  }}
                >
                  {selectedImage.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.95rem',
                    mb: 2,
                  }}
                >
                  {selectedImage.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => openWhatsApp(selectedImage, selectedImage.whatsappNumber)}
                    sx={{
                      bgcolor: '#25D366',
                      color: colors.white,
                      '&:hover': {
                        bgcolor: '#1DA851',
                      },
                      fontSize: '0.9rem',
                      px: 3,
                    }}
                  >
                    Ask About This Facility
                  </Button>
                </Box>
                {filteredImages.length > 1 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} of {filteredImages.length}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>

      <Footer />
    </Box>
  );
};

// WhatsApp function
const openWhatsApp = (facility, whatsappNumber) => {
  const message = `Hello! I'd like to know more about "${facility.title}" at Polyclinic HMS. Can you provide more details?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

export default Facilities;

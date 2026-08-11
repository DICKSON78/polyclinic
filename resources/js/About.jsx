import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  EmojiEvents as AwardIcon,
  Groups as TeamIcon,
  Visibility as VisionIcon,
  Business as MissionIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './components/SEO';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef([]);
  const ctaRef = useRef(null);

  const values = [
    {
      icon: <VisionIcon sx={{ fontSize: 50 }} />,
      title: 'Our Vision',
      description: 'To become the leading healthcare provider in Dar es Salaam, delivering accessible, high-quality medical services through innovative technology and comprehensive solutions.',
      color: '#1976d2',
    },
    {
      icon: <MissionIcon sx={{ fontSize: 50 }} />,
      title: 'Our Mission',
      description: 'To empower the Dar es Salaam community with quality healthcare services and comprehensive solutions that improve health outcomes and quality of life.',
      color: '#00BCD4',
    },
    {
      icon: <AwardIcon sx={{ fontSize: 50 }} />,
      title: 'Our Values',
      description: 'Excellence, innovation, integrity, and patient-centered care drive everything we do.',
      color: '#42a5f5',
    },
    {
      icon: <TeamIcon sx={{ fontSize: 50 }} />,
      title: 'Our Commitment',
      description: 'We are dedicated to supporting our patients with responsive service, comprehensive care, and a commitment to your success.',
      color: '#1565c0',
    },
  ];


  const teamMembers = [
    { name: 'Dr. Sarah Johnson', role: 'Chief Medical Officer', image: '/images/optometrist-headshot.jpeg' },
    { name: 'Dr. Michael Chen', role: 'Senior Consultant Physician', image: '/images/gallery-staff-at-work.jpeg' },
    { name: 'Dr. Amina Hassan', role: 'Head of Laboratory Services', image: '/images/appointment-receptionist.jpeg' },
  ];

  const achievements = [
    { number: '10', label: 'Active Clinics', icon: <LocationIcon /> },
    { number: '100K+', label: 'Patients Served', icon: <PersonIcon /> },
    { number: '5+', label: 'Years Experience', icon: <CalendarIcon /> },
    { number: '98%', label: 'Satisfaction Rate', icon: <AwardIcon /> },
  ];

  useEffect(() => {
    // Hero section animation - only animate position, keep opacity at 1
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

    // Story section animation - only animate position, keep opacity at 1
    if (storyRef.current) {
      gsap.set(storyRef.current, { opacity: 1 });
      gsap.from(storyRef.current, {
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 75%',
        },
        duration: 1,
        y: 50,
        ease: 'power2.out',
      });
    }

    // Values cards animation - only animate position/scale, keep opacity at 1
    valuesRef.current.forEach((card, index) => {
      if (card) {
        gsap.set(card, { opacity: 1 });
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
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


    // CTA section animation - only animate position, keep opacity at 1
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 1 });
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
        },
        duration: 1,
        y: 50,
        ease: 'power2.out',
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pt: { xs: '56px', sm: '64px' } }}>
      <SEO 
        title="About Us - Polyclinic HMS | Leading Healthcare Clinic in Tanzania"
        description="Learn about Polyclinic HMS, the leading healthcare clinic in Dar es Salaam, Tanzania. Our mission is to provide comprehensive, accessible, and high-quality healthcare services to our community. Trusted since 2018."
        keywords="about Polyclinic HMS, healthcare clinic Tanzania, polyclinic Dar es Salaam, hospital mission, clinic history, Polyclinic HMS team"
      />
      <Navbar />
      
      {/* Hero Section - Light Blue/Purple Gradient Background */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          color: '#212529',
          py: { xs: 5, md: 6 },
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
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#667eea',
                textTransform: 'uppercase',
                mb: 2,
                display: 'block',
              }}
            >
              
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 900,
                mb: 3,
                textAlign: 'center',
                letterSpacing: '-0.02em',
                color: '#1C1C1C !important',
                background: 'linear-gradient(135deg, #1C1C1C 0%, #667eea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              About Polyclinic HMS
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                maxWidth: 900,
                mx: 'auto',
                color: '#4A4A4A !important',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.8,
              }}
            >
              Empowering the Dar es Salaam community with innovative healthcare technology and comprehensive solutions since 2018.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Achievements Section - Golden Yellow Gradient */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 }, 
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFEDD8 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(201, 180, 138, 0.12) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {achievements.map((achievement, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
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
                  <Box
                    sx={{
                      color: '#667eea',
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {achievement.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#1C1C1C !important',
                      mb: 0.5,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                    }}
                  >
                    {achievement.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#4A4A4A !important',
                      fontWeight: 500,
                    }}
                  >
                    {achievement.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Story Section - Two Column Layout */}
      <Box 
        ref={storyRef}
        sx={{ 
          py: { xs: 6, md: 8 }, 
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {/* Left Column - Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  overflow: 'hidden',
                  mb: 4,
                }}
              >
                <Box
                  component="img"
                  src="/images/clinic-exterior-building.jpeg"
                  alt="Polyclinic HMS Clinic"
                  sx={{
                    width: '100%',
                    height: { xs: 300, sm: 400, md: 500, lg: 600 },
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.target.src = '/images/optometrist-headshot.jpeg';
                  }}
                />
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip
                      icon={<PersonIcon />}
                      label="Polyclinic HMS Team"
                      size="small"
                      sx={{ bgcolor: '#667eea', color: 'white' }}
                    />
                    <Chip
                      icon={<CalendarIcon />}
                      label="Since 2018"
                      size="small"
                      sx={{ bgcolor: '#764ba2', color: 'white' }}
                    />
                  </Stack>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: '#1C1C1C !important',
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    Our Story
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.1rem' }, 
                      lineHeight: 1.8, 
                      mb: 3, 
                      color: '#4A4A4A !important',
                    }}
                  >
                    Polyclinic HMS was founded in 2018 in Dar es Salaam to deliver quality healthcare services in Tanzania through modern technology and compassionate care. 
                    We recognized the critical need for comprehensive, accessible healthcare services in Tanzania's commercial capital, offering general consultations, 
                    laboratory diagnostics, radiology, e-prescriptions, and inpatient care in one welcoming, professional environment.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.1rem' }, 
                      lineHeight: 1.8, 
                      mb: 3, 
                      color: '#4A4A4A !important',
                    }}
                  >
                    Starting as a small clinic, we've grown to become one of Dar es Salaam's most trusted healthcare providers, serving thousands of patients throughout the region. 
                    Today, we continue to innovate and expand our services, keeping the needs of our community at the heart of everything we do.
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/contact')}
                    sx={{
                      bgcolor: '#667eea',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#5568d3',
                      },
                    }}
                  >
                    Get In Touch
                  </Button>
                </CardContent>
              </Card>

              {/* Mission Card */}
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  mb: 4,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <MissionIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: '#1C1C1C !important',
                      }}
                    >
                      Our Mission
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.1rem' }, 
                      lineHeight: 1.8, 
                      color: '#4A4A4A !important',
                    }}
                  >
                    To empower the Dar es Salaam community with quality healthcare services, comprehensive care, and unwavering support to improve health outcomes and quality of life.
                  </Typography>
                </CardContent>
              </Card>

              {/* Vision Card */}
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        bgcolor: '#764ba2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <VisionIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: '#1C1C1C !important',
                      }}
                    >
                      Our Vision
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.1rem' }, 
                      lineHeight: 1.8, 
                      color: '#4A4A4A !important',
                    }}
                  >
                    To become the leading healthcare provider in Dar es Salaam and throughout Tanzania, delivering quality medical services through innovative technology, expert care, and comprehensive solutions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Call to Action Section - Ready to Transform Your Practice */}
              <Card
                ref={ctaRef}
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  mb: 3,
                  p: { xs: 3, md: 4 },
                  textAlign: 'center',
                  position: { md: 'sticky' },
                  top: { md: 100 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: '#1A4A6B !important',
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                  }}
                >
                  Ready to Transform Your Practice?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 3, 
                    color: '#4A4A4A !important',
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                    lineHeight: 1.7,
                  }}
                >
                  Join thousands of satisfied patients in Dar es Salaam who trust Polyclinic HMS for their healthcare needs.
                </Typography>
                <Stack 
                  direction="column" 
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/contact')}
                    fullWidth
                    sx={{
                      bgcolor: '#667eea',
                      color: 'white',
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#5568d3',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/appointment')}
                    fullWidth
                    sx={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: '#667eea',
                        color: 'white',
                      },
                    }}
                  >
                    Book Appointment
                  </Button>
                </Stack>
              </Card>

              {/* Recent Posts */}
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#1C1C1C !important',
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Recent Posts
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { title: 'Comprehensive Healthcare Services', image: '/images/services-vision-testing.jpeg' },
                      { title: 'Advanced Diagnostic Equipment', image: '/images/services-glasses-frames.jpeg' },
                      { title: 'Expert Team of Medical Professionals', image: '/images/gallery-staff-at-work.jpeg' },
                    ].map((post, index) => (
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
                          component="img"
                          src={post.image}
                          alt={post.title}
                          sx={{
                            width: { xs: 80, md: 100 },
                            height: { xs: 80, md: 100 },
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.src = '/images/clinic-exterior-building.jpeg';
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            color: '#4A4A4A !important',
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {post.title}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#1C1C1C !important',
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Categories
                  </Typography>
                  <Stack spacing={1}>
                    {['General Consultations', 'Laboratory Testing', 'Radiology & Imaging', 'Pharmacy Services', 'Inpatient Care'].map((category, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 0.5,
                          cursor: 'pointer',
                          color: '#333',
                          transition: 'color 0.3s',
                          '&:hover': {
                            color: '#667eea',
                          },
                        }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#555 !important' }}>{category}</Typography>
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
                  bgcolor: 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#1C1C1C !important',
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Popular Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Healthcare', 'Clinic', 'Polyclinic', 'Medical', 'Laboratory', 'Polyclinic HMS', 'Tanzania', 'Health'].map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: '#f0f0f0',
                          color: '#333',
                          '&:hover': {
                            bgcolor: '#667eea',
                            color: 'white',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Values Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 4,
              textAlign: 'center',
              color: '#1A4A6B !important',
              fontSize: { xs: '1.75rem', md: '2.5rem' },
            }}
          >
            Our Core Values
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  ref={(el) => (valuesRef.current[index] = el)}
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white',
                    p: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '12px',
                      bgcolor: `${value.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ color: value.color }}>
                      {value.icon}
                    </Box>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1.5, 
                      color: '#1C1C1C !important',
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      lineHeight: 1.8, 
                      color: '#4A4A4A !important',
                    }}
                  >
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default About;

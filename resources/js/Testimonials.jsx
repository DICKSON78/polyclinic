import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Stack,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  FormatQuote as QuoteIcon,
  Star as StarIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
  EmojiEvents as AwardIcon,
  ArrowForward as ArrowForwardIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Color Scheme
const colors = {
  primary: '#1E88E5',
  primaryLight: '#4FC3F7',
  primaryDark: '#1565c0',
  secondary: '#00ACC1',
  primaryGold: '#00ACC1',
  darkCharcoal: '#0D2B45',
  offWhite: '#F5FAFF',
  textDarkGray: '#4A4A4A',
  borderLight: '#E0EAF3',
};

const Testimonials = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef([]);
  const ctaRef = useRef(null);
  const decorativeShapesRef = useRef([]);

  const stats = [
    { number: '98%', label: 'Patient Satisfaction', icon: <ThumbUpIcon />, color: colors.primaryGold },
    { number: '10K+', label: 'Happy Patients', icon: <PeopleIcon />, color: colors.primaryGold },
    { number: '4.9/5', label: 'Average Rating', icon: <StarIcon />, color: colors.primaryGold },
    { number: '5+', label: 'Years of Excellence', icon: <AwardIcon />, color: colors.primaryGold },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'General Practitioner',
      location: 'Lagos, Nigeria',
      rating: 5,
      text: 'As a healthcare professional, I\'ve been using this system for over 3 years. The comprehensive patient management features have transformed how I run my practice. The clinical documentation tools are exceptional, and the support team is always responsive.',
      avatar: 'SJ',
      verified: true,
    },
    {
      name: 'Michael Chen',
      role: 'Patient',
      location: 'Accra, Ghana',
      rating: 5,
      text: 'The modern equipment and professional staff made my visit comfortable and efficient. The appointment booking system is seamless, and I love how I can access my records online. Highly recommend this clinic for all your healthcare needs.',
      avatar: 'MC',
      verified: true,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      location: 'Nairobi, Kenya',
      rating: 5,
      text: 'Great experience from start to finish. The appointment was on time, my consultation was thorough, and the staff went above and beyond to make sure I understood my diagnosis and treatment plan.',
      avatar: 'ER',
      verified: true,
    },
    {
      name: 'David Kim',
      role: 'Patient',
      location: 'Cairo, Egypt',
      rating: 5,
      text: 'Outstanding patient care and attention to detail. The team helped me understand my diagnosis and recommended the right treatment for my health needs. The follow-up care has been exceptional, and I feel confident in their expertise.',
      avatar: 'DK',
      verified: true,
    },
    {
      name: 'Lisa Anderson',
      role: 'Clinic Administrator',
      location: 'Johannesburg, South Africa',
      rating: 5,
      text: 'Professional, caring, and efficient. The clinic management system has streamlined our operations significantly. Patient registration is quick, billing is automated, and the reporting features give us valuable insights into our practice performance.',
      avatar: 'LA',
      verified: true,
    },
    {
      name: 'James Okafor',
      role: 'Patient',
      location: 'Abuja, Nigeria',
      rating: 5,
      text: 'I\'ve been coming here for years and always receive top-notch care. The doctors are knowledgeable and take time to explain everything clearly. The online portal makes it easy to book appointments and view my medical history.',
      avatar: 'JO',
      verified: true,
    },
    {
      name: 'Amina Hassan',
      role: 'Patient',
      location: 'Dar es Salaam, Tanzania',
      rating: 5,
      text: 'Excellent service! The staff was professional and friendly. My check-up was thorough, and I felt well taken care of throughout my visit. The clinic is clean, modern, and uses the latest medical technology.',
      avatar: 'AH',
      verified: true,
    },
    {
      name: 'Robert Mwangi',
      role: 'Patient',
      location: 'Kampala, Uganda',
      rating: 5,
      text: 'The pediatric care services are outstanding. My daughter felt comfortable throughout her visit, and the doctor explained everything in a way we could understand. The follow-up care has been excellent, and we\'re very satisfied.',
      avatar: 'RM',
      verified: true,
    },
    {
      name: 'Fatima Al-Mansouri',
      role: 'Patient',
      location: 'Casablanca, Morocco',
      rating: 5,
      text: 'I had a wonderful experience with the laboratory and diagnostic services. The staff were patient and thorough, and I got my lab results the same day. The clinic\'s pharmacy has a great selection of medications too.',
      avatar: 'FA',
      verified: true,
    },
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

    // Stats animation - only animate position, keep opacity at 1
    if (statsRef.current) {
      const statsElements = statsRef.current.children;
      gsap.set(statsElements, { opacity: 1 });
      gsap.from(statsElements, {
        duration: 1,
        y: 40,
        stagger: 0.15,
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Testimonials animation - only animate position, keep opacity at 1
    testimonialsRef.current.forEach((ref, index) => {
      if (ref) {
        gsap.set(ref, { opacity: 1 });
        gsap.from(ref, {
          duration: 0.8,
          y: 50,
          scrollTrigger: {
            trigger: ref,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: index * 0.1,
        });
      }
    });

    // CTA animation - only animate position, keep opacity at 1
    if (ctaRef.current) {
      const ctaElements = ctaRef.current.children;
      gsap.set(ctaElements, { opacity: 1 });
      gsap.from(ctaElements, {
        duration: 1,
        y: 40,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Decorative shapes animation
    decorativeShapesRef.current.forEach((shape, index) => {
      if (shape) {
        gsap.to(shape, {
          duration: 4 + index * 0.5,
          rotation: 360,
          repeat: -1,
          ease: 'none',
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.offWhite, position: 'relative', overflow: 'hidden', pt: { xs: '56px', sm: '64px' } }}>
      <Navbar />
      
      {/* Decorative Background Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={(el) => (decorativeShapesRef.current[0] = el)}
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: { xs: 150, md: 300 },
            height: { xs: 150, md: 300 },
            background: `linear-gradient(135deg, ${colors.primaryGold}15 0%, ${colors.primaryGold}08 100%)`,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            filter: 'blur(50px)',
          }}
        />
        <Box
          ref={(el) => (decorativeShapesRef.current[1] = el)}
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '3%',
            width: { xs: 120, md: 250 },
            height: { xs: 120, md: 250 },
            background: `linear-gradient(135deg, ${colors.primaryGold}12 0%, ${colors.primaryGold}05 100%)`,
            borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
            filter: 'blur(40px)',
          }}
        />
      </Box>

      {/* Hero Section - Light Blue/Purple Background */}
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
            background: `radial-gradient(circle at 70% 30%, ${colors.primaryGold}08 0%, transparent 50%)`,
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
              Patient Stories
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '6rem' },
                fontWeight: 900,
                mb: 3,
                textAlign: 'center',
                letterSpacing: '-0.03em',
                color: `${colors.darkCharcoal} !important`,
                background: `linear-gradient(135deg, ${colors.darkCharcoal} 0%, ${colors.primary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Patient Testimonials
            </Typography>
            <Typography
              variant="h5"
              sx={{
                textAlign: 'center',
                maxWidth: 900,
                mx: 'auto',
                fontSize: { xs: '1.2rem', md: '1.5rem', lg: '1.7rem' },
                fontWeight: 300,
                lineHeight: 1.7,
                color: '#4A4A4A !important',
                fontStyle: 'italic',
                mb: 2,
              }}
            >
              "Your health is our mission, and our patients' satisfaction is our greatest reward."
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.15rem' },
                fontWeight: 400,
                lineHeight: 1.8,
                color: '#666 !important',
              }}
            >
              Discover what our patients and healthcare professionals have to say about their experience with our comprehensive healthcare services. These authentic testimonials reflect our commitment to excellence and patient-centered care.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box
        ref={statsRef}
        sx={{
          py: { xs: 6, md: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: `2px solid ${colors.borderLight}`,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 40px ${colors.primaryGold}40`,
                      borderColor: colors.primaryGold,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: stat.color,
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: `${colors.darkCharcoal} !important`,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: `${colors.textDarkGray} !important`,
                      fontWeight: 500,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Grid */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          zIndex: 1,
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primaryGold,
                textTransform: 'uppercase',
                mb: 2,
                display: 'block',
              }}
            >
              Real Stories, Real Impact
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 900,
                mb: 3,
                color: `${colors.darkCharcoal} !important`,
                letterSpacing: '-0.02em',
              }}
            >
              What Our Patients Say
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: `${colors.textDarkGray} !important`,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: 700,
                mx: 'auto',
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.7,
              }}
            >
              Real experiences from real patients and healthcare professionals who trust us with their healthcare needs. Each testimonial reflects our commitment to excellence.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              endIcon={<StarIcon />}
              href="https://g.page/r/CWNj2_Hl76OhEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#4285F4',
                color: 'white',
                fontWeight: 700,
                px: { xs: 5, md: 6 },
                py: 2,
                borderRadius: '16px',
                fontSize: { xs: '1rem', md: '1.1rem' },
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(66, 133, 244, 0.4)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#357AE8',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 12px 32px rgba(66, 133, 244, 0.5)',
                  '& .MuiButton-startIcon': {
                    transform: 'scale(1.1)',
                  },
                  '& .MuiButton-endIcon': {
                    transform: 'scale(1.1) rotate(15deg)',
                  },
                },
                '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                  transition: 'transform 0.3s ease',
                },
              }}
            >
              Rate us
            </Button>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={index}
                ref={(el) => (testimonialsRef.current[index] = el)}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '24px',
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: `2px solid ${colors.borderLight}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: `linear-gradient(90deg, ${colors.primaryGold} 0%, ${colors.primary} 100%)`,
                    },
                    '&:hover': {
                      transform: 'translateY(-16px) scale(1.02)',
                      boxShadow: `0 24px 64px ${colors.primaryGold}35`,
                      borderColor: colors.primaryGold,
                      '& .quote-icon': {
                        transform: 'scale(1.2) rotate(-5deg)',
                        opacity: 0.3,
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    {/* Quote Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <QuoteIcon
                        className="quote-icon"
                        sx={{
                          fontSize: { xs: 56, md: 64 },
                          color: colors.primaryGold,
                          opacity: 0.15,
                          transform: 'rotate(180deg)',
                          transition: 'all 0.4s ease',
                        }}
                      />
                    </Box>

                    {/* Rating */}
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating
                        value={testimonial.rating}
                        readOnly
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: colors.primaryGold,
                            fontSize: { xs: '1.4rem', md: '1.6rem' },
                          },
                          '& .MuiRating-iconEmpty': {
                            color: `${colors.borderLight} !important`,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.textDarkGray,
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          ml: 0.5,
                        }}
                      >
                        {testimonial.rating}.0
                      </Typography>
                    </Box>

                    {/* Testimonial Text */}
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        lineHeight: 1.9,
                        color: `${colors.textDarkGray} !important`,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontStyle: 'italic',
                        minHeight: { xs: '140px', md: '160px' },
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -16,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          background: `linear-gradient(180deg, ${colors.primaryGold} 0%, transparent 100%)`,
                          borderRadius: '2px',
                        },
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>

                    <Divider sx={{ my: 2, borderColor: colors.borderLight }} />

                    {/* Author Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: colors.primaryGold,
                          width: { xs: 50, md: 56 },
                          height: { xs: 50, md: 56 },
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', md: '1.3rem' },
                          color: colors.darkCharcoal,
                          boxShadow: `0 4px 12px ${colors.primaryGold}40`,
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            color: `${colors.darkCharcoal} !important`,
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: `${colors.textDarkGray} !important`,
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            mb: 0.5,
                          }}
                        >
                          {testimonial.role}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: `${colors.textDarkGray} !important`,
                            fontSize: { xs: '0.75rem', md: '0.8rem' },
                            opacity: 0.7,
                          }}
                        >
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Irregular Shape */}
      <Box
        ref={ctaRef}
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          zIndex: 1,
          background: `linear-gradient(135deg, ${colors.primary} 0%, #764ba2 100%)`,
          clipPath: 'polygon(0% 5%, 100% 0%, 100% 95%, 0% 100%)',
          mt: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              p: { xs: 5, md: 8 },
              textAlign: 'center',
              color: 'white',
              position: 'relative',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 900,
                mb: 3,
                color: 'white !important',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Experience Excellence?
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                mb: 4,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
                color: 'white !important',
                fontWeight: 300,
              }}
            >
              Join thousands of satisfied patients who trust us with their healthcare needs. Schedule your appointment today and experience the difference that quality care makes in your health journey.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{ justifyContent: 'center', maxWidth: 600, mx: 'auto' }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/appointment')}
                sx={{
                  bgcolor: 'white',
                  color: colors.primary,
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  borderRadius: '14px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 32px rgba(255,255,255,0.4)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Book an Appointment
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  borderRadius: '14px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderWidth: 2.5,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-4px) scale(1.02)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Call us now
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Testimonials;

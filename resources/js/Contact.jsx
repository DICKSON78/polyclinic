import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  VideoLibrary as TikTokIcon,
  WhatsApp as WhatsAppIcon,
  Map as MapIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './components/SEO';
import { usePost } from './hooks';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Color Scheme - Blue/Teal Theme
const colors = {
  primary: '#1E88E5',
  primaryLight: '#4FC3F7',
  primaryDark: '#1565c0',
  secondary: '#00ACC1',
  secondaryLight: '#4dd0e1',
  secondaryDark: '#0097a7',
  white: '#FFFFFF',
  offWhite: '#F5FAFF',
  lightGray: '#E0EAF3',
  textPrimary: '#0D2B45',
  textSecondary: '#7A8A9A',
  success: '#2ECC71',
  info: '#00ACC1',
};

const Contact = () => {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const contactCardsRef = useRef(null);
  const mapRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const { data, loading, error, handlePost } = usePost();

  useEffect(() => {
    if (data) {
    setShowSuccess(true);
    setFormData({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      phone: '', 
      subject: '', 
      message: '' 
      });
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error('Error submitting contact form:', error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.first_name && formData.last_name && formData.email && formData.message) {
      handlePost("api/office-calendar/contact-submissions", formData);
    }
  };

  useEffect(() => {
    // Hero section animation - only animate position, keep opacity at 1
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      gsap.set(heroElements, { opacity: 1 });
      gsap.from(heroElements, {
        duration: 1,
        y: 50,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    // Contact cards animation - only animate position, keep opacity at 1
    if (contactCardsRef.current) {
      const cardElements = contactCardsRef.current.querySelectorAll('.contact-card');
      gsap.set(cardElements, { opacity: 1 });
      gsap.from(cardElements, {
        scrollTrigger: {
          trigger: contactCardsRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }

    // Form animation - only animate position, keep opacity at 1
    if (formRef.current) {
      const formElements = formRef.current.querySelectorAll('.form-animate');
      gsap.set(formElements, { opacity: 1 });
      gsap.from(formElements, {
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 50,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }

    // Map animation - only animate position, keep opacity at 1
    if (mapRef.current) {
      gsap.set(mapRef.current, { opacity: 1 });
      gsap.from(mapRef.current, {
        scrollTrigger: {
          trigger: mapRef.current,
          start: 'top 80%',
        },
        duration: 1,
        y: 50,
        ease: 'power3.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const contactInfo = [
    {
      icon: <LocationIcon />,
      title: 'Our Location',
      details: [
        'Gerezani - Kamata traffic light',
        'near traffic post',
        'Dar es Salaam, Tanzania',
      ],
      action: {
        text: 'Get Directions',
        link: 'https://www.google.com/maps/place/Sikaf+Eye+Care/@-6.8275607,39.2752407,17z/data=!4m14!1m7!3m6!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!2sSikaf+Eye+Care!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v!3m5!1s0x185c4ba9dcc989f3:0xa1a3efe5f1db6363!8m2!3d-6.8275607!4d39.2752407!16s%2Fg%2F11qrppb30v?entry=ttu',
      },
    },
    {
      icon: <PhoneIcon />,
      title: 'Phone & WhatsApp',
      details: [
        'Call: +255 676 506 323',
        'WhatsApp: +255 676 506 323',
      ],
      action: {
        text: 'Call Now',
        link: 'tel:+255676506323',
      },
    },
    {
      icon: <EmailIcon />,
      title: 'Email Address',
      details: [
        'info@polyclinic-hms.com',
      ],
      action: {
        text: 'Send Email',
        link: 'mailto:info@polyclinic-hms.com',
      },
    },
    {
      icon: <TimeIcon />,
      title: 'Working Hours',
      details: [
        'Monday - Friday: 8:30 AM - 8:00 PM',
        'Saturday: 9:30 AM - 7:00 PM',
        'Sunday: 9:30 AM - 3:30 PM',
      ],
      action: {
        text: 'Book Appointment',
        link: '/appointment',
      },
    },
  ];

  const socialMedia = [
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      link: 'https://www.facebook.com/sikafeyecare',
      color: '#1877F2',
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon />,
      link: 'https://www.instagram.com/sikaf_eye_care?igsh=dGc1YWJhM2FwN3k2&utm_source=qr',
      color: '#E4405F',
    },
    {
      name: 'TikTok',
      icon: <TikTokIcon />,
      link: 'https://www.tiktok.com/@sikafeyecare',
      color: '#000000',
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      link: 'https://wa.me/255676506323',
      color: '#25D366',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pt: { xs: '56px', sm: '64px' } }}>
      <SEO 
        title="Call us now - Polyclinic HMS | Get in Touch | Dar es Salaam, Tanzania"
        description="Contact Polyclinic HMS in Dar es Salaam, Tanzania. Call us at +255 676 506 323, email info@polyclinic-hms.com, or visit us at Gerezani - Kamata traffic light near traffic post. We're here to help with all your healthcare needs."
        keywords="contact Polyclinic HMS, healthcare clinic contact Tanzania, polyclinic Dar es Salaam contact, hospital clinic address, Polyclinic HMS phone number, clinic email"
      />
      <Navbar />
      
      {/* Hero Section - Redesigned */}
      <Box
        ref={heroRef}
        sx={{
          bgcolor: 'white',
          color: colors.textPrimary,
          py: { xs: 5, md: 6 },
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="hero-animate" sx={{ mb: 4 }}>
              <Typography
                  variant="overline"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: colors.primary,
                    textTransform: 'uppercase',
                    mb: 2,
                    display: 'block',
                  }}
                >
                  Call us now
                </Typography>
                <Typography
                variant="h2"
                sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 900,
                    lineHeight: 1.1,
                    mb: 3,
                    letterSpacing: '-0.03em',
                    color: `${colors.darkCharcoal} !important`,
                    background: `linear-gradient(135deg, ${colors.darkCharcoal} 0%, ${colors.primary} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
              >
                  Let's Connect
              </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 6,
                    bgcolor: colors.primary,
                    borderRadius: 3,
                    mb: 4,
                  }}
                />
              </Box>

              <Typography
                className="hero-animate"
                variant="h5"
                sx={{
                  fontSize: { xs: '1.2rem', md: '1.6rem', lg: '1.8rem' },
                  fontWeight: 300,
                  lineHeight: 1.7,
                  mb: 4,
                  color: '#4A4A4A !important',
                  fontStyle: 'italic',
                }}
              >
                "Your health is our mission. We're here to provide exceptional healthcare and answer all your questions."
              </Typography>

              <Typography
                className="hero-animate"
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  fontWeight: 400,
                  lineHeight: 1.8,
                  mb: 4,
                  color: '#666 !important',
                }}
              >
                Whether you need to schedule an appointment, ask about our services, or have questions about your health, our dedicated team at Polyclinic HMS is ready to assist you. We believe in building lasting relationships with our patients through clear communication and compassionate care.
              </Typography>

              <Stack 
                className="hero-animate"
                direction="row" 
                spacing={2} 
                sx={{ flexWrap: 'wrap', gap: 2 }}
              >
                {socialMedia.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: '#f8f9fa',
                        color: social.color,
                      border: '2px solid #e0e0e0',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        bgcolor: social.color,
                        color: 'white',
                        borderColor: social.color,
                        transform: 'translateY(-4px) scale(1.05)',
                        boxShadow: `0 8px 20px ${social.color}40`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                className="hero-animate"
                sx={{
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
                  height: { xs: 400, sm: 500, md: 650, lg: 750 },
                  border: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  },
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
                    position: 'relative',
                    zIndex: 0,
                  }}
                  onError={(e) => {
                    e.target.src = '/images/gallery-waiting-area.jpeg';
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Info Cards Section */}
      <Box
        ref={contactCardsRef}
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B !important',
                mb: 2,
              }}
            >
              Contact Information
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555 !important',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Multiple ways to reach us. Choose what's most convenient for you.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
            {contactInfo.map((info, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  className="contact-card"
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, sm: 3, md: 3 },
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    bgcolor: 'white',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      borderColor: colors.primary,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 56, sm: 60, md: 64 },
                      height: { xs: 56, sm: 60, md: 64 },
                      borderRadius: '12px',
                      bgcolor: `${colors.primary}15`,
                      color: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: { xs: 2, md: 2.5 },
                      mx: 'auto',
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(info.icon, { 
                      sx: { 
                        fontSize: { xs: 32, sm: 36, md: 40 },
                      } 
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1rem' },
                      fontWeight: 700,
                      color: `${colors.darkCharcoal} !important`,
                      mb: { xs: 1.5, md: 2 },
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Box 
                    sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-start',
                      minHeight: 0,
                    }}
                  >
                    <Stack 
                      spacing={0.5} 
                      sx={{ 
                        mb: { xs: 2, md: 2.5 },
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {info.details.map((detail, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.9rem' },
                            color: '#333 !important',
                            textAlign: 'center',
                            lineHeight: 1.7,
                          }}
                        >
                          {detail}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                  <Box sx={{ flexShrink: 0, mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      component="a"
                      href={info.action.link}
                      target={info.action.link.startsWith('http') ? '_blank' : '_self'}
                      rel={info.action.link.startsWith('http') ? 'noopener noreferrer' : ''}
                      sx={{
                        borderColor: colors.primary,
                        color: colors.primary,
                        fontWeight: 600,
                        py: { xs: 1, md: 1 },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' },
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: colors.primary,
                          bgcolor: colors.primary,
                          color: 'white',
                          borderWidth: 2,
                        },
                      }}
                    >
                      {info.action.text}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <Box
        ref={formRef}
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: '#f8f9fa',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B !important',
                mb: 2,
              }}
            >
              Send Us a Message
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555 !important',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Have a question? Fill out the form below and our team will get back to you within 24 hours.
            </Typography>
          </Box>

          <Grid container spacing={5}>
            {/* Contact Form */}
            <Grid size={{ xs: 12 }}>
              <Card
                className="form-animate"
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  bgcolor: 'white',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Your Message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          multiline
                          rows={6}
                          variant="outlined"
                          placeholder="Tell us how we can help you..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              bgcolor: '#f8f9fa',
                              '& fieldset': {
                                borderColor: '#e0e0e0',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: colors.primary,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: colors.primary,
                                borderWidth: '2px',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#666 !important',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'colors.primary !important',
                            },
                            '& .MuiInputBase-input': {
                              color: '#333 !important',
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          endIcon={<SendIcon />}
                          disabled={loading}
                          sx={{
                            bgcolor: colors.primary,
                            color: 'white',
                            fontWeight: 700,
                            py: 1.5,
                            borderRadius: '8px',
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                            '&:hover': {
                              bgcolor: '#5568d3',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Send Message
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Map Section */}
      <Box
        ref={mapRef}
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: '#f8f9fa',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#1A4A6B !important',
                mb: 2,
              }}
            >
              Find Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1rem',
                color: '#555 !important',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              Visit our clinic at Gerezani - Kamata traffic light near traffic post, Dar es Salaam, Tanzania
            </Typography>
          </Box>

          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              bgcolor: 'white',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: { xs: 350, sm: 450, md: 550, lg: 600 },
                position: 'relative',
                bgcolor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  bottom: 20,
                  right: 20,
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
                    px: 3,
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      bgcolor: '#5568d3',
                    },
                  }}
                >
                  Open in Google Maps
                </Button>
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Additional Information Section */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  p: 4,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '${colors.darkCharcoal} !important',
                    fontSize: '1.5rem',
                  }}
                >
                  Office Hours
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Monday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      8:30 AM – 8:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Tuesday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      8:30 AM – 8:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Wednesday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      8:30 AM – 8:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Thursday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      8:30 AM – 8:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Friday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      8:30 AM – 8:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Saturday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      9:30 AM – 7:00 PM
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#333 !important' }}>
                      Sunday
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555 !important' }}>
                      9:30 AM – 3:30 PM
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white',
                  p: 4,
                  height: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '${colors.darkCharcoal} !important',
                    fontSize: '1.5rem',
                  }}
                >
                  Why Choose Us
                </Typography>
                <Stack spacing={2}>
                  {[
                    'Expert team of doctors and healthcare professionals',
                    'State-of-the-art diagnostic equipment',
                    'Comprehensive healthcare services',
                    'Patient-centered approach',
                    'Convenient location with parking',
                    'Flexible payment options',
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: colors.primary, fontSize: 20, mt: 0.25, flexShrink: 0 }} />
                      <Typography variant="body1" sx={{ color: '#333 !important', lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '8px',
            bgcolor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          Thank you! Your message has been sent successfully. We'll get back to you soon.
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default Contact;
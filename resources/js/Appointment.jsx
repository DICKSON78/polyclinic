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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

const Appointment = () => {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const benefitsRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    appointmentType: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 2) {
          error = 'First name must be at least 2 characters';
        }
        break;
      case 'last_name':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (value.trim().length < 2) {
          error = 'Last name must be at least 2 characters';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'appointmentType':
        if (!value) {
          error = 'Please select an appointment type';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({
        ...errors,
        [name]: error,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      if (field !== 'message') {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      first_name: true,
      last_name: true,
      phone: true,
      appointmentType: true,
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send appointment to backend API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit appointment');
      }

      const result = await response.json();
      
      console.log('Appointment submitted:', result);
      alert('Thank you! Your appointment request has been submitted. We will contact you soon to confirm.');
      
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        appointmentType: '',
        message: '',
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Error submitting appointment:', error);
      alert('There was an error submitting your appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const appointmentTypes = [
    'General Consultation',
    'Laboratory Testing',
    'Follow-up Visit',
    'Emergency Consultation',
    'Specialist Consultation',
    'Other',
  ];

  const benefits = [
    '24/7 Online Booking Available',
    'Instant Confirmation',
    'Flexible Scheduling',
    'No Phone Calls Needed',
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

    // Form section animation - only animate position, keep opacity at 1
    if (formRef.current) {
      gsap.set(formRef.current, { opacity: 1 });
      gsap.from(formRef.current, {
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 80%',
        },
        duration: 1,
        y: 50,
        ease: 'power2.out',
      });
    }

    // Benefits animation - only animate position, keep opacity at 1
    if (benefitsRef.current) {
      const benefitElements = benefitsRef.current.children;
      gsap.set(benefitElements, { opacity: 1 });
      gsap.from(benefitElements, {
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 30,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.offWhite, pt: { xs: '56px', sm: '64px' } }}>
      <Navbar />
      
      {/* Hero Section - Light Blue/Purple Gradient - Matching Blog Page */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          color: colors.textPrimary,
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(25, 118, 210, 0.08) 0%, transparent 50%)',
            zIndex: 0,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, md: 4 }, position: 'relative', zIndex: 1, py: { xs: 2, md: 3 } }}>
          <Box sx={{ textAlign: 'center', width: '100%' }}>
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
              Book Your Visit
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 900,
                mb: 2,
                color: `${colors.darkCharcoal} !important`,
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, ${colors.darkCharcoal} 0%, ${colors.primary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Book Your Appointment
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                maxWidth: 700,
                mx: 'auto',
                color: '#4A4A4A !important',
                lineHeight: 1.7,
              }}
            >
              Schedule your healthcare appointment online 24/7. It's quick, easy, and secure. Our experienced team is ready to provide you with exceptional medical care.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section - Golden Yellow Gradient */}
      <Box
        ref={benefitsRef}
        sx={{
          py: { xs: 5, md: 6 },
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
        <Container maxWidth="xl" sx={{ px: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 4.5 } }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: colors.primaryGold,
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Why Book Online
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                letterSpacing: '-0.02em',
              }}
            >
              Convenience at Your Fingertips
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {benefits.map((benefit, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: { xs: 2.5, sm: 3, md: 3.5 },
                    borderRadius: '20px',
                    bgcolor: 'white',
                    border: `2px solid ${colors.borderLight}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
                      borderColor: colors.primary,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 52, sm: 56, md: 64 },
                      height: { xs: 52, sm: 56, md: 64 },
                      borderRadius: '50%',
                      bgcolor: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
                      background: `linear-gradient(135deg, rgba(30, 136, 229, 0.1) 0%, rgba(0, 172, 193, 0.1) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: { xs: 1.5, md: 2 },
                  }}
                >
                  <CheckIcon
                    sx={{
                        fontSize: { xs: 28, sm: 32, md: 36 },
                        color: colors.primary,
                    }}
                  />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: `${colors.darkCharcoal} !important`,
                      fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.05rem' },
                      lineHeight: 1.5,
                    }}
                  >
                    {benefit}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Appointment Form Section - White Background */}
      <Box
        ref={formRef}
        sx={{
          py: { xs: 5, md: 7 },
          bgcolor: 'white',
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 3, sm: 3, md: 4 }}>
            {/* Form Column */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card
                sx={{
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: 'none',
                  overflow: 'hidden',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(102, 126, 234, 0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    color: 'white',
                    p: { xs: 2.5, sm: 3.5, md: 4 },
                    textAlign: 'center',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 100%)',
                    },
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 36, sm: 44, md: 52 }, mb: { xs: 1, sm: 1.5, md: 2 }, color: 'white', opacity: 0.95 }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      mb: { xs: 0.75, sm: 1, md: 1.5 },
                      color: 'white !important',
                      fontSize: { xs: '1.35rem', sm: '1.6rem', md: '2rem', lg: '2.25rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Schedule Your Visit
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      color: 'white !important',
                      fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.05rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    Fill out the form below to request an appointment
                  </Typography>
                </Box>
                <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 }, bgcolor: '#fafafa' }}>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={{ xs: 2.5, sm: 3 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        variant="outlined"
                        error={!!errors.first_name}
                        helperText={errors.first_name || ''}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1.5, color: errors.first_name ? '#d32f2f' : colors.primaryGold, fontSize: '1.2rem' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: errors.first_name ? '#d32f2f' : colors.borderLight,
                              borderWidth: errors.first_name ? 2 : 1,
                            },
                            '&:hover fieldset': {
                              borderColor: errors.first_name ? '#d32f2f' : colors.primaryGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: errors.first_name ? '#d32f2f' : colors.primaryGold,
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: errors.first_name ? '#d32f2f' : colors.primaryGold,
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        variant="outlined"
                        error={!!errors.last_name}
                        helperText={errors.last_name || ''}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1.5, color: errors.last_name ? '#d32f2f' : colors.primaryGold, fontSize: '1.2rem' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: errors.last_name ? '#d32f2f' : colors.borderLight,
                              borderWidth: errors.last_name ? 2 : 1,
                            },
                            '&:hover fieldset': {
                              borderColor: errors.last_name ? '#d32f2f' : colors.primaryGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: errors.last_name ? '#d32f2f' : colors.primaryGold,
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: errors.last_name ? '#d32f2f' : colors.primaryGold,
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        variant="outlined"
                        error={!!errors.phone}
                        helperText={errors.phone || 'Format: +1234567890 or (123) 456-7890'}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1.5, color: errors.phone ? '#d32f2f' : colors.primaryGold, fontSize: '1.2rem' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: errors.phone ? '#d32f2f' : colors.borderLight,
                              borderWidth: errors.phone ? 2 : 1,
                            },
                            '&:hover fieldset': {
                              borderColor: errors.phone ? '#d32f2f' : colors.primaryGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: errors.phone ? '#d32f2f' : colors.primaryGold,
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: errors.phone ? '#d32f2f' : colors.primaryGold,
                          },
                        }}
                      />

                      <FormControl fullWidth error={!!errors.appointmentType}>
                        <InputLabel sx={{ '&.Mui-focused': { color: errors.appointmentType ? '#d32f2f' : colors.primaryGold } }}>Appointment Type</InputLabel>
                        <Select
                          name="appointmentType"
                          value={formData.appointmentType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="Appointment Type"
                          required
                          sx={{
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: errors.appointmentType ? '#d32f2f' : colors.borderLight,
                              borderWidth: errors.appointmentType ? 2 : 1,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: errors.appointmentType ? '#d32f2f' : colors.primaryGold,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: errors.appointmentType ? '#d32f2f' : colors.primaryGold,
                              borderWidth: 2,
                            },
                          }}
                        >
                          {appointmentTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.appointmentType && (
                          <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, ml: 1.75 }}>
                            {errors.appointmentType}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Additional Message (Optional)"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Any specific needs or concerns you'd like us to know about..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: colors.borderLight,
                            },
                            '&:hover fieldset': {
                              borderColor: colors.primaryGold,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.primaryGold,
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: colors.primaryGold,
                          },
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, pt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth={{ xs: true, sm: false }}
                          disabled={isSubmitting}
                          endIcon={!isSubmitting ? <SendIcon sx={{ fontSize: '1.2rem' }} /> : null}
                          startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
                          sx={{
                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                            color: 'white',
                            fontWeight: 700,
                            px: { xs: 4, sm: 5 },
                            py: 1.75,
                            borderRadius: '14px',
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            textTransform: 'none',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                            minWidth: { xs: '100%', sm: 220 },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5568d3 0%, #653a8f 100%)',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                            },
                            '&:disabled': {
                              background: '#ccc',
                              color: '#666',
                              transform: 'none',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Appointment Request'}
                        </Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            {/* Info Column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack 
                spacing={{ xs: 2.5, sm: 3 }} 
                sx={{ 
                  position: { xs: 'relative', lg: 'sticky' }, 
                  top: { lg: 100 },
                }}
              >
                {/* What to Expect Card */}
                <Card
                  sx={{
                    borderRadius: '20px',
                    border: `2px solid ${colors.borderLight}`,
                    bgcolor: 'white',
                    p: { xs: 2.5, md: 3 },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: colors.darkCharcoal,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    What to Expect
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      'Comprehensive health assessment',
                      'Discussion of your medical needs',
                      'Personalized treatment plan',
                      'Expert recommendations',
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CheckIcon sx={{ color: colors.primaryGold, fontSize: '1.2rem', mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: colors.textDarkGray, fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>

                {/* Preparation Tips Card */}
                <Card
                  sx={{
                    borderRadius: '20px',
                    border: `2px solid ${colors.borderLight}`,
                    bgcolor: '#fafafa',
                    p: { xs: 2.5, md: 3 },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: colors.darkCharcoal,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    Preparation Tips
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      'Bring your medical records or test results',
                      'List of current medications',
                      'Insurance card if applicable',
                      'Arrive 10 minutes early',
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: colors.primaryGold,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            mt: 0.25,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: colors.darkCharcoal, fontWeight: 700, fontSize: '0.7rem' }}>
                            {index + 1}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: colors.textDarkGray, fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>

                {/* Quick Info Card */}
                <Card
                  sx={{
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    color: 'white',
                    p: { xs: 2.5, md: 3 },
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-4px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '5px',
                      background: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: 'white',
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    Need Help?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    If you have questions or need assistance, our team is here to help.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => window.location.href = '/contact'}
                    sx={{
                      bgcolor: 'white',
                      color: colors.primary,
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Call us now
                  </Button>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Appointment;

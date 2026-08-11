import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogContent,
  Fade,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Send as SendIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Google as GoogleIcon,
  WhatsApp as WhatsAppIcon,
  VideoLibrary as TikTokIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Color Scheme
const colors = {
  primaryGold: '#C9B48A',
  primaryOrange: '#FF6B35',
  darkCharcoal: '#1C1C1C',
  offWhite: '#FAFAF8',
  textDarkGray: '#4A4A4A',
  borderLight: '#E6E6E6',
};

import { usePost, useToast } from './hooks';
import { formatError } from './helpers';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const addToast = useToast();
  const { data, loading, error, handlePost, setData, setError } = usePost();

  useEffect(() => {
    if (data && (data.message || data.data)) {
      setShowSuccessDialog(true);
      setEmail('');
      // Clear data after showing dialog to prevent re-triggering
      setTimeout(() => {
        setData(null);
      }, 100);
    }
  }, [data, setData]);

  useEffect(() => {
    if (error) {
      addToast({ 
        message: formatError(error) || 'Failed to subscribe. Please try again.', 
        severity: 'error' 
      });
      setError(null);
    }
  }, [error, addToast, setError]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      addToast({ message: 'Please enter your email address', severity: 'warning' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast({ message: 'Please enter a valid email address', severity: 'warning' });
      return;
    }

    handlePost("api/office-calendar/subscribers", { email });
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  // Only include links that have corresponding routes
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' },
  ];

  const services = [
    { label: 'Outpatient & Inpatient Care', path: '/services' },
    { label: 'Diagnosis & Treatment', path: '/services' },
    { label: 'Laboratory Services', path: '/services' },
    { label: 'Pharmacy & Dispensing', path: '/services' },
    { label: 'Maternal & Child Health', path: '/services' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, label: 'Facebook', url: 'https://www.facebook.com' },
    { icon: <InstagramIcon />, label: 'Instagram', url: 'https://www.instagram.com' },
    { icon: <TikTokIcon />, label: 'TikTok', url: 'https://www.tiktok.com' },
    { icon: <YouTubeIcon />, label: 'YouTube', url: 'https://youtube.com' },
    { icon: <WhatsAppIcon />, label: 'WhatsApp', url: 'https://wa.me/255676506323' },
  ];

  const FooterLink = ({ to, children }) => {
    // Only render if path exists (all paths in our arrays are valid routes)
    return (
      <Link
        to={to}
        style={{
          color: 'rgba(255,255,255,0.8)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 0',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.color = colors.primaryOrange;
          const arrow = e.target.querySelector('svg');
          if (arrow) {
            arrow.style.transform = 'translateX(4px)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'rgba(255,255,255,0.8)';
          const arrow = e.target.querySelector('svg');
          if (arrow) {
            arrow.style.transform = 'translateX(0)';
          }
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: '14px', color: colors.primaryOrange }} />
        {children}
      </Link>
    );
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: colors.darkCharcoal,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${colors.primaryOrange} 0%, ${colors.primaryOrange}dd 100%)`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 3 }, pb: { xs: 1.5, md: 2 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Column 1: Company Information */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ pr: { md: 2 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: 'white',
                fontSize: { xs: '1.2rem', md: '1.3rem' },
                textDecoration: 'none',
                display: 'block',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  color: colors.primaryOrange,
                },
              }}
            >
              Polyclinic HMS
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 1.5,
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              Leading Healthcare Facility in Tanzania
            </Typography>
            
            {/* Contact Information */}
            <Stack spacing={1}>
              <Box 
                component="a"
                href="https://maps.app.goo.gl/hHiVY3VkJhoY9Xe27?g_st=iwb"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <LocationIcon sx={{ color: colors.primaryOrange, fontSize: '18px', mt: 0.5, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  Dar es Salaam, Tanzania
                </Typography>
              </Box>
              <Box 
                component="a"
                href="tel:+255676506323"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <PhoneIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  +255 676 506 323
                </Typography>
              </Box>
              <Box 
                component="a"
                href="https://wa.me/255676506323"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <WhatsAppIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  WhatsApp: +255 676 506 323
                </Typography>
              </Box>
              <Box 
                component="a"
                href="mailto:info@polyclinic-hms.com"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  textDecoration: 'none',
                  transition: 'opacity 0.3s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <EmailIcon sx={{ color: colors.primaryOrange, fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  info@polyclinic-hms.com
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Column 2: Useful Links */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ px: { md: 1.5 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'white',
              }}
            >
              Useful Links
            </Typography>
            <Stack spacing={0.25}>
              {quickLinks.map((link, index) => (
                <FooterLink key={index} to={link.path}>
                  {link.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Our Services */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ px: { md: 1.5 }, mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'white',
              }}
            >
              Our Services
            </Typography>
            <Stack spacing={0.25}>
              {services.map((service, index) => (
                <FooterLink key={index} to={service.path}>
                  {service.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Join Our Newsletter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ pl: { md: 2 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.75,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: 'white',
              }}
            >
              Join Our Newsletter
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 1.5,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              Catch all our latest updates by newsletter.
            </Typography>
            <form onSubmit={handleSubscribe}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  placeholder="Your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="small"
                  sx={{
                    flex: 1,
                    minWidth: 0, // Allow TextField to shrink and grow properly
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: '4px',
                      height: '36px',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primaryOrange,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      py: 0.5,
                      fontSize: '0.9rem',
                      padding: '8px 12px',
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.6)',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: colors.primaryOrange,
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto',
                    height: '36px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: '#E55A2B',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </Stack>
            </form>

            {/* Google Reviews Button */}
            <Button
              component="a"
              href="https://g.page/r/CWNj2_Hl76OhEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<GoogleIcon sx={{ fontSize: '16px' }} />}
              endIcon={<StarIcon sx={{ fontSize: '14px' }} />}
              sx={{
                mb: 1.5,
                bgcolor: '#4285F4',
                color: 'white',
                fontWeight: 600,
                py: 0.5,
                px: 1.5,
                borderRadius: '4px',
                fontSize: '0.75rem',
                textTransform: 'none',
                height: '32px',
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#357AE8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
                },
              }}
            >
              Rate us
            </Button>

            {/* Social Media */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: 1,
                fontSize: '0.85rem',
                color: 'white',
              }}
            >
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    width: { xs: 36, md: 38 },
                    height: { xs: 36, md: 38 },
                    '& svg': { fontSize: { xs: 16, md: 18 } },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: colors.primaryOrange,
                      bgcolor: `${colors.primaryOrange}20`,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Divider
          sx={{
            my: { xs: 1.5, md: 1.5 },
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            pb: 0,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              fontSize: { xs: '0.75rem', md: '0.85rem' },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            © {new Date().getFullYear()} Polyclinic HMS. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              to="/privacy"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = colors.primaryOrange)}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              Cookie Policy
            </Link>
          </Stack>
        </Box>
      </Container>

      {/* Success Dialog - SweetAlert Style */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseSuccessDialog}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Success Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                animation: 'scaleIn 0.3s ease-out',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>

            {/* Success Message */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: 'text.primary',
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
              }}
            >
              Successfully Subscribed!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 3,
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              Thank you for subscribing to our newsletter. You'll receive updates about our latest news, services, and special offers.
            </Typography>

            {/* Action Button */}
            <Button
              variant="contained"
              onClick={handleCloseSuccessDialog}
              sx={{
                bgcolor: colors.primaryOrange,
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: `0 4px 12px ${colors.primaryOrange}40`,
                '&:hover': {
                  bgcolor: '#E55A2B',
                  boxShadow: `0 6px 16px ${colors.primaryOrange}50`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Awesome!
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Footer;

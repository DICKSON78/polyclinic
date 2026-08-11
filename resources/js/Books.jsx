import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
} from '@mui/material';
import {
  MenuBook as BookIcon,
  ArrowForward as ArrowForwardIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './components/SEO';

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

const Books = () => {
  const navigate = useNavigate();

  const handleWhatsAppOrder = (bookTitle) => {
    const message = encodeURIComponent(`Hello! I would like to order the book: "${bookTitle}". Please provide more information.`);
    window.open(`https://wa.me/255676506323?text=${message}`, '_blank');
  };

  const books = [
    {
      id: 1,
      title: 'Jicho la Kunguru',
      titleEnglish: "The Crow's Eye",
      author: 'Sibtwain Kassim Fadhil',
      authorTitle: 'Healthcare Educator & Founder of Polyclinic HMS Foundation',
      isbn: '978-9912-42-480-7',
      description: 'An engaging and educational resource designed to help children learn about health in a fun and interactive way. This beautifully illustrated book teaches young readers about the importance of healthy habits and self-care through the story of a crow.',
      image: '/images/books/jicho.jpg',
      features: [
        'Educational content for children',
        'Beautiful illustrations',
        'Interactive learning about health',
        'Available in Swahili',
      ],
      targetAudience: 'Children and Parents',
      language: 'Swahili',
    },
    {
      id: 2,
      title: 'Jicho Lako',
      titleEnglish: 'Your Eye',
      author: 'Sibtwain Kassim Fadhil',
      authorTitle: 'Healthcare Educator & Founder of Polyclinic HMS Foundation',
      isbn: 'Coming Soon',
      description: 'A comprehensive guide to understanding and maintaining good health. This book provides valuable information about healthcare, common health conditions, and preventive measures for a healthy lifestyle.',
      image: '/images/books/jicho-lako-cover.jpg',
      features: [
        'Comprehensive health guide',
        'Information on common health conditions',
        'Preventive care strategies',
        'Professional insights',
      ],
      targetAudience: 'General Public',
      language: 'Swahili',
    },
  ];

  return (
    <Box sx={{ bgcolor: colors.white, minHeight: '100vh', pt: { xs: '56px', sm: '64px' } }}>
      <SEO 
        title="Books & Journals - Polyclinic HMS | Educational Resources"
        description="Explore our collection of health education books and journals. Order educational resources including 'Jicho la Kunguru' and other publications by Polyclinic HMS Foundation. Contact us via WhatsApp to place your order."
        keywords="health education books Tanzania, health books, health education, Polyclinic HMS books, Jicho la Kunguru, health journals, educational resources"
      />
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
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
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <BookIcon sx={{ fontSize: { xs: 48, md: 64 }, color: colors.primary, mb: 2 }} />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Books & Journals
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: `${colors.textDarkGray} !important`,
                lineHeight: 1.7,
                mb: 3,
              }}
            >
              Access our comprehensive collection of health education books and journals. Stay updated with the latest research, treatment protocols, and clinical guidelines in healthcare.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Books Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {books.map((book) => (
              <Grid size={{ xs: 12, md: 6 }} key={book.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: `2px solid ${colors.borderLight}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                      borderColor: colors.primary,
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 300, md: 400 },
                      bgcolor: colors.lightGray,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={book.image}
                      alt={book.title}
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
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`;
                        e.target.parentElement.innerHTML = `
                          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM19 20H5V4H19V20Z" fill="#1E88E5"/>
                              <path d="M7 6H17V8H7V6ZM7 10H17V12H7V10ZM7 14H13V16H7V14Z" fill="#1E88E5"/>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={book.language}
                        size="small"
                        sx={{
                          bgcolor: `${colors.primary}15`,
                          color: colors.primary,
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={book.targetAudience}
                        size="small"
                        sx={{
                          bgcolor: `${colors.secondary}15`,
                          color: colors.secondary,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        fontWeight: 800,
                        color: `${colors.darkCharcoal} !important`,
                        mb: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {book.title}
                    </Typography>
                    {book.titleEnglish && (
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontSize: '1rem',
                          color: `${colors.textSecondary} !important`,
                          mb: 2,
                          fontStyle: 'italic',
                        }}
                      >
                        {book.titleEnglish}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PersonIcon sx={{ fontSize: 20, color: colors.primary }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.95rem',
                          color: `${colors.textDarkGray} !important`,
                          fontWeight: 600,
                        }}
                      >
                        {book.author}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        color: `${colors.textSecondary} !important`,
                        mb: 2,
                      }}
                    >
                      {book.authorTitle}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        color: `${colors.textDarkGray} !important`,
                        lineHeight: 1.7,
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      {book.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: `${colors.darkCharcoal} !important`,
                          mb: 1.5,
                        }}
                      >
                        Features:
                      </Typography>
                      <Stack spacing={1}>
                        {book.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: colors.primary,
                                mt: 0.75,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.9rem',
                                color: `${colors.textDarkGray} !important`,
                                lineHeight: 1.6,
                              }}
                            >
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <DescriptionIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          color: `${colors.textSecondary} !important`,
                        }}
                      >
                        ISBN: {book.isbn}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => handleWhatsAppOrder(book.title)}
                      sx={{
                        bgcolor: '#25D366',
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                        '&:hover': {
                          bgcolor: '#20BA5A',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Order via WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Author Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.offWhite }}>
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              bgcolor: colors.white,
              border: `2px solid ${colors.borderLight}`,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 3,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              About the Author
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    mx: 'auto',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `4px solid ${colors.primary}20`,
                    boxShadow: `0 8px 24px ${colors.primary}30`,
                  }}
                >
                  <Box
                    component="img"
                    src="/images/books/profile.jpeg"
                    alt="Sibtwain Kassim Fadhil"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 300px; background: linear-gradient(135deg, #1E88E5 0%, #00ACC1 100%);">
                          <svg width="100" height="100" viewBox="0 0 24 24" fill="white">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                    fontWeight: 700,
                    color: `${colors.darkCharcoal} !important`,
                    mb: 2,
                  }}
                >
                  Sibtwain Kassim Fadhil
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: `${colors.textDarkGray} !important`,
                    lineHeight: 1.7,
                    mb: 2,
                  }}
                >
                  Sibtwain Kassim Fadhil is the founder of Polyclinic HMS Foundation, dedicated to promoting health education and awareness. With a passion for making healthcare accessible and understandable, he has authored several educational books aimed at helping children and the general public understand the importance of good health.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: `${colors.textDarkGray} !important`,
                    lineHeight: 1.7,
                    mb: 2,
                  }}
                >
                  Through his books, including "Jicho la Kunguru" (The Crow's Eye), he combines engaging storytelling with educational content to teach young readers about health in a fun and interactive way. His work emphasizes the importance of early health education and preventive care.
                </Typography>
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: `${colors.primary}10`,
                    border: `1px solid ${colors.primary}30`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.9rem',
                      color: `${colors.darkCharcoal} !important`,
                      fontWeight: 600,
                      fontStyle: 'italic',
                      textAlign: 'center',
                    }}
                  >
                    "Changia. Saidia. Wezesha." (Contribute. Help. Enable.)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.85rem',
                      color: `${colors.textSecondary} !important`,
                      textAlign: 'center',
                      mt: 1,
                    }}
                  >
                    We invite stakeholders to sponsor these books for children in need, helping to spread health education across our communities.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 3,
              textAlign: 'center',
              bgcolor: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
              border: `2px solid ${colors.borderLight}`,
            }}
          >
            <BookIcon sx={{ fontSize: 48, color: colors.primary, mb: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 800,
                color: `${colors.darkCharcoal} !important`,
                mb: 2,
              }}
            >
              Interested in Our Books?
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
              Contact us via WhatsApp to place your order or inquire about bulk orders for schools, clinics, or organizations. We're here to help spread health education.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              onClick={() => handleWhatsAppOrder('Books & Journals')}
              sx={{
                bgcolor: '#25D366',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                '&:hover': {
                  bgcolor: '#20BA5A',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Contact Us on WhatsApp
            </Button>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Books;


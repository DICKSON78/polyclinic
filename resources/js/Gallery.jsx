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
const WHATSAPP_NUMBER = "+255712345678"; // Replace with actual number
const WHATSAPP_MESSAGE = "Hello! I'm interested in eyewear from Polyclinic HMS.";

const Eyeware = () => {
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const eyewareImages = [
    // Children Frames (16 frames - new images)
    {
      id: 1,
      title: 'Kids Adventure Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-1.jpeg',
      description: 'Fun and colorful frames designed for active children',
      price: 'TZS 25,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 2,
      title: 'Youth Explorer Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-2.jpeg',
      description: 'Durable frames perfect for school and play activities',
      price: 'TZS 28,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 3,
      title: 'Junior Sport Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-3.jpeg',
      description: 'Lightweight frames with UV protection for outdoor activities',
      price: 'TZS 30,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 4,
      title: 'Kids Classic Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-4.jpeg',
      description: 'Timeless designs that grow with your child',
      price: 'TZS 26,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 5,
      title: 'Youth Trendy Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-5.jpeg',
      description: 'Modern styles that kids love to wear',
      price: 'TZS 32,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 6,
      title: 'Children Comfort Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-6.jpeg',
      description: 'Soft nose pads and lightweight materials for comfort',
      price: 'TZS 27,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 7,
      title: 'Kids Durable Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-7.jpeg',
      description: 'Strong frames that can handle rough play',
      price: 'TZS 29,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 8,
      title: 'Youth Stylish Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-8.jpeg',
      description: 'Fashionable frames for confident young wearers',
      price: 'TZS 31,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 9,
      title: 'Children Premium Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-9.jpeg',
      description: 'High-quality frames with excellent craftsmanship',
      price: 'TZS 35,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 10,
      title: 'Kids Ultimate Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-10.jpeg',
      description: 'The perfect combination of style, comfort, and durability',
      price: 'TZS 33,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 31,
      title: 'Kids Flex Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-11.jpeg',
      description: 'Flexible frames that adjust to active lifestyles',
      price: 'TZS 27,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 32,
      title: 'Youth Outdoor Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-12.jpeg',
      description: 'Designed for outdoor adventures and sports',
      price: 'TZS 28,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 33,
      title: 'Kids Colorful Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-13.jpeg',
      description: 'Bright and vibrant frames kids adore',
      price: 'TZS 26,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 34,
      title: 'Youth Round Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-14.jpeg',
      description: 'Classic round frames for a fun look',
      price: 'TZS 29,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 35,
      title: 'Kids Lightweight Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-15.jpeg',
      description: 'Super light frames that feel like nothing is there',
      price: 'TZS 31,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 36,
      title: 'Youth Smart Frames',
      category: 'Children Frames',
      image: '/images/eyeware/children/children-16.jpeg',
      description: 'Smart-looking frames for the school-going child',
      price: 'TZS 30,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },

    // Medium Budget Frames (10 frames using existing gallery images)
    {
      id: 11,
      title: 'Classic Office Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/11.jpeg',
      description: 'Professional frames perfect for office environments',
      price: 'TZS 45,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 12,
      title: 'Modern Everyday Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/12.jpeg',
      description: 'Versatile frames suitable for daily wear',
      price: 'TZS 48,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 13,
      title: 'Comfort Business Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/13.jpeg',
      description: 'Comfortable frames designed for long work hours',
      price: 'TZS 50,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 14,
      title: 'Stylish Casual Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/1.jpeg',
      description: 'Perfect blend of style and comfort for casual occasions',
      price: 'TZS 47,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 15,
      title: 'Durable Medium Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/2.jpeg',
      description: 'Strong and reliable frames that last',
      price: 'TZS 49,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 16,
      title: 'Professional Medium Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/3.jpeg',
      description: 'Business-appropriate frames with modern appeal',
      price: 'TZS 52,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 17,
      title: 'Versatile Medium Collection',
      category: 'Medium Budget Frames',
      image: '/images/galarry/4.jpeg',
      description: 'Wide range of styles for different occasions',
      price: 'TZS 46,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 18,
      title: 'Quality Mid-Range Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/5.jpeg',
      description: 'Excellent quality at an affordable price',
      price: 'TZS 51,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 19,
      title: 'Comfort Medium Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/6.jpeg',
      description: 'Designed for all-day wearing comfort',
      price: 'TZS 48,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 20,
      title: 'Classic Medium Frames',
      category: 'Medium Budget Frames',
      image: '/images/galarry/7.jpeg',
      description: 'Timeless designs that never go out of style',
      price: 'TZS 49,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },

    // Executive Collections (11 frames - new images)
    {
      id: 21,
      title: 'Premium Executive Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-1.jpeg',
      description: 'Luxury frames crafted with premium materials for executives',
      price: 'TZS 120,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 22,
      title: 'Designer Executive Eyewear',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-2.jpeg',
      description: 'High-end designer frames for the discerning professional',
      price: 'TZS 135,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 23,
      title: 'Luxury Executive Collection',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-3.jpeg',
      description: 'Exclusive executive frames with premium finishes',
      price: 'TZS 150,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 24,
      title: 'Elite Professional Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-4.jpeg',
      description: 'Elite frames designed for executives who demand the finest',
      price: 'TZS 145,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 25,
      title: 'Executive Titanium Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-5.jpeg',
      description: 'Lightweight titanium frames with superior craftsmanship',
      price: 'TZS 160,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 26,
      title: 'Prestige Executive Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-6.jpeg',
      description: 'Prestige frames that command attention and respect',
      price: 'TZS 175,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 27,
      title: 'Executive Luxury Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-7.jpeg',
      description: 'Luxury frames that reflect success and sophistication',
      price: 'TZS 155,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 28,
      title: 'Premium Executive Collection',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-8.jpeg',
      description: 'Premium collection for the modern executive',
      price: 'TZS 140,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 29,
      title: 'Elite Executive Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-9.jpeg',
      description: 'Elite craftsmanship for elite professionals',
      price: 'TZS 165,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 30,
      title: 'Executive Master Collection',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-10.jpeg',
      description: 'The ultimate in executive eyewear excellence',
      price: 'TZS 180,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
    {
      id: 37,
      title: 'Executive Signature Frames',
      category: 'Executive Collections',
      image: '/images/eyeware/executive/executive-11.jpeg',
      description: 'Signature collection for the distinguished executive',
      price: 'TZS 190,000',
      whatsappNumber: WHATSAPP_NUMBER,
    },
  ];

  const categories = ['Children Frames', 'Medium Budget Frames', 'Executive Collections'];
  const [activeCategory, setActiveCategory] = useState('Children Frames');

  const filteredImages = eyewareImages.filter(img => img.category === activeCategory);

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

    // Eyeware items animation - only animate position, keep opacity at 1
    if (galleryRef.current) {
      const eyewareItems = galleryRef.current.querySelectorAll('.eyeware-item');
      gsap.set(eyewareItems, { opacity: 1 });
      gsap.from(eyewareItems, {
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
        title="Eyeware Collection - Polyclinic HMS | Premium Frames & Eyewear"
        description="Explore our premium eyeware collection featuring children frames, medium budget frames, and executive collections. Find the perfect frames for your style and budget at Polyclinic HMS."
        keywords="eyeware, eyeglasses frames, optical frames, children eyewear, executive frames, Polyclinic HMS eyewear collection"
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
              Premium Collection
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
              Eyeware Gallery
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
              Discover our premium eyeware collection featuring carefully curated frames for every style and budget. From playful children frames to sophisticated executive collections, find the perfect eyewear that combines fashion, comfort, and quality.
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
                label={`${eyewareImages.length} Frames`}
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

      {/* Eyeware Grid */}
      <Box ref={galleryRef} sx={{ py: { xs: 6, md: 8 }, bgcolor: colors.white }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {filteredImages.map((item, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={item.id}
              >
                <Card
                  className="eyeware-item"
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
                      '& .eyeware-image': {
                        transform: 'scale(1.08)',
                      },
                      '& .eyeware-overlay': {
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
                      className="eyeware-image"
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
                      className="eyeware-overlay"
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
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        right: 12,
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: colors.primary,
                          fontSize: '0.85rem',
                        }}
                      >
                        {item.price}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(item, item.whatsappNumber);
                        }}
                        sx={{
                          minWidth: 'auto',
                          px: 1,
                          py: 0.5,
                          fontSize: '0.7rem',
                          bgcolor: '#25D366',
                          color: colors.white,
                          '&:hover': {
                            bgcolor: '#1DA851',
                          },
                        }}
                      >
                        WhatsApp
                      </Button>
                    </Box>
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
                No eyeware found in this category
              </Typography>
              <Button
                onClick={() => setActiveCategory('All')}
                variant="contained"
                sx={{
                  bgcolor: colors.primary,
                  color: colors.white,
                  '&:hover': {
                    bgcolor: colors.primaryLight,
                  },
                }}
              >
                View All Eyeware
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
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.white,
                      fontWeight: 700,
                    }}
                  >
                    {selectedImage.price}
                  </Typography>
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
                    Contact via WhatsApp
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
const openWhatsApp = (frame, whatsappNumber) => {
  const message = `Hi! I'm interested in "${frame.title}" priced at ${frame.price}. Can you provide more details?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

export default Eyeware;

import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Stack,
  Divider,
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon, 
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Blog = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);
  const allPostsRef = useRef(null);

  const blogPosts = [
    {
      slug: 'understanding-your-health',
      title: 'Understanding Your Health: A Comprehensive Guide',
      excerpt: 'Learn about common health conditions and how to maintain good health throughout your life. Discover preventive measures and treatment options available for various illnesses. Our comprehensive guide covers everything from basic body systems to practical care tips that can help keep you well for years to come.',
      date: 'March 15, 2025',
      category: 'Health Tips',
      readTime: '5 min read',
      color: '#1976d2',
      image: '/images/services-vision-testing.jpeg',
    },
    {
      slug: 'importance-regular-checkups',
      title: 'The Importance of Regular Health Checkups',
      excerpt: 'Discover why regular checkups are crucial for maintaining good health and detecting early signs of disease before it progresses. Learn what to expect during a consultation. Early detection can prevent complications and help maintain your health throughout your life.',
      date: 'March 10, 2025',
      category: 'Prevention',
      readTime: '4 min read',
      color: '#00BCD4',
      image: '/images/gallery-staff-at-work.jpeg',
    },
    {
      slug: 'choosing-right-doctor',
      title: 'How to Choose the Right Doctor for Your Family',
      excerpt: 'Tips and advice on selecting a clinic and doctor that match your family\'s needs and lifestyle. Find the right care team that combines expertise with compassion. Whether you need routine care, chronic disease management, or specialist referrals, we guide you through the process to ensure comfort and quality care.',
      date: 'March 5, 2025',
      category: 'Health Tips',
      readTime: '6 min read',
      color: '#42a5f5',
      image: '/images/services-glasses-frames.jpeg',
    },
    {
      slug: 'managing-stress',
      title: 'Managing Stress for a Healthier Lifestyle',
      excerpt: 'Learn how to protect your health from stress and reduce its effects with practical tips and techniques for modern lifestyles. Discover simple breathing exercises and daily routines. With increasing daily demands, understanding stress is essential for maintaining wellbeing in the digital age.',
      date: 'February 28, 2025',
      category: 'Wellness',
      readTime: '5 min read',
      color: '#1565c0',
      image: '/images/appointment-receptionist.jpeg',
    },
    {
      slug: 'nutrition-healthy-living',
      title: 'Nutrition for a Healthy Life',
      excerpt: 'Explore the essential vitamins and nutrients that support good health and learn which foods can help maintain your wellbeing throughout life. Discover the power of fruits, vegetables, and whole grains. A balanced diet rich in essential nutrients can significantly contribute to long-term health and prevent chronic conditions.',
      date: 'February 22, 2025',
      category: 'Nutrition',
      readTime: '7 min read',
      color: '#4dd0e1',
      image: '/images/gallery-waiting-area.jpeg',
    },
    {
      slug: 'understanding-hypertension',
      title: 'Understanding Hypertension: The Silent Risk',
      excerpt: 'Get informed about high blood pressure, its risk factors, symptoms, and why early detection through regular checkups is critical for your health. Learn about treatment options available. Hypertension is often called the "silent killer" because it can cause serious complications before symptoms become noticeable.',
      date: 'February 18, 2025',
      category: 'Medical',
      readTime: '8 min read',
      color: '#0097a7',
      image: '/images/services-contact-lens-fitting.jpeg',
    },
    {
      slug: 'child-health-care',
      title: 'Child Health: Ensuring Healthy Growth from Childhood',
      excerpt: 'Early healthcare for children is essential for proper growth, development, and academic success. Learn about common childhood conditions, when to bring your child for a checkup, and how to recognize signs of illness. Regular well-child visits help ensure your child grows and develops correctly.',
      date: 'February 12, 2025',
      category: 'Pediatric Care',
      readTime: '6 min read',
      color: '#1976d2',
      image: '/images/services-vision-testing.jpeg',
    },
    {
      slug: 'diabetes-awareness',
      title: 'Diabetes: Causes, Symptoms, and Modern Management',
      excerpt: 'Diabetes is a common condition affecting millions worldwide. Understand the causes, early symptoms, and modern treatment options available today. With good management and regular monitoring, people with diabetes can live full and active lives.',
      date: 'February 8, 2025',
      category: 'Medical',
      readTime: '7 min read',
      color: '#4ecdc4',
      image: '/images/gallery-staff-at-work.jpeg',
    },
    {
      slug: 'medication-safety',
      title: 'Medication Safety: Essential Practices for Taking Medicines',
      excerpt: 'Taking medicines correctly is crucial for your health and recovery. Learn essential practices, dosage guidelines, and safety tips to prevent errors and complications. Following proper medication practices helps ensure effective treatment and protects your wellbeing.',
      date: 'February 3, 2025',
      category: 'Medication',
      readTime: '5 min read',
      color: '#95e1d3',
      image: '/images/services-contact-lens-fitting.jpeg',
    },
  ];

  const categories = [
    'Health Tips',
    'Prevention',
    'Wellness',
    'Technology',
    'Nutrition',
    'Medical',
    'Pediatric Care',
    'Medication',
  ];

  const recentPosts = [
    { title: 'Understanding Your Health: A Comprehensive Guide', image: '/images/services-vision-testing.jpeg' },
    { title: 'The Importance of Regular Health Checkups', image: '/images/gallery-staff-at-work.jpeg' },
    { title: 'How to Choose the Right Doctor for Your Family', image: '/images/services-glasses-frames.jpeg' },
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

    // Cards animation on scroll - only animate position/scale, keep opacity at 1
    cardsRef.current.forEach((card, index) => {
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

    // Section animation - only animate position, keep opacity at 1
    if (sectionRef.current) {
      gsap.set(sectionRef.current, { opacity: 1 });
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

    // All posts section animation - only animate position, keep opacity at 1
    if (allPostsRef.current) {
      gsap.set(allPostsRef.current, { opacity: 1 });
      gsap.from(allPostsRef.current, {
        scrollTrigger: {
          trigger: allPostsRef.current,
          start: 'top 85%',
        },
        duration: 1,
        y: 30,
        ease: 'power2.out',
      });
    }

    // Cleanup function
    return () => {
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa !important', pt: { xs: '56px', sm: '64px' } }}>
      <Navbar />
      
      {/* Hero Section - Light Blue/Purple Gradient Background - Minimized */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
          color: '#212529',
          py: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 30%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
            zIndex: 0,
            pointerEvents: 'none',
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
                color: '#1976d2',
                textTransform: 'uppercase',
                mb: 1,
                display: 'block',
              }}
            >
              Latest Articles
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                fontWeight: 900,
                mb: 2,
                color: '#1C1C1C !important',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #1C1C1C 0%, #667eea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Our Blog
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#4A4A4A !important',
                lineHeight: 1.7,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Stay informed with the latest health tips, medical advice, and clinic updates from our expert team.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Featured Posts Section - Two Column Layout - Light Blue/Purple Gradient */}
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
                color: '#1C1C1C !important',
              }}
            >
              Featured Articles
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
              Discover our most popular and informative articles
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Left Column - Featured Posts */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {blogPosts.slice(0, 3).map((post, index) => (
                <Card
                  key={index}
                  ref={(el) => (cardsRef.current[index] = el)}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    bgcolor: 'white !important',
                    overflow: 'hidden',
                    mb: 4,
                    cursor: 'pointer',
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
                      src={post.image}
                      alt={post.title}
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
                        label={post.category}
                        size="small"
                        sx={{
                          bgcolor: `${post.color}15`,
                          color: post.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Chip
                        icon={<TimeIcon sx={{ fontSize: '0.875rem !important', color: '#555' }} />}
                        label={post.readTime}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          borderColor: '#e0e0e0',
                          color: '#555',
                        }}
                      />
                      <Chip
                        icon={<CalendarIcon sx={{ fontSize: '0.875rem !important', color: '#555' }} />}
                        label={post.date}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          borderColor: '#e0e0e0',
                          color: '#555',
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
                      {post.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        mb: 0,
                        color: '#4A4A4A !important',
                        lineHeight: 1.8,
                        fontSize: { xs: '0.95rem', md: '1rem' },
                      }}
                    >
                      {post.excerpt}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Right Column - Sidebar */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ position: { xs: 'relative', lg: 'sticky' }, top: { lg: 100 } }}>
              {/* Search Section */}
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
                    Search
                  </Typography>
                  <Box
                    component="input"
                    placeholder="Search articles..."
                    sx={{
                      width: '100%',
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      bgcolor: '#f8f9fa',
                      color: '#333',
                      '&::placeholder': {
                        color: '#999',
                      },
                      '&:focus': {
                        outline: 'none',
                        borderColor: '#667eea',
                      },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Recent Posts */}
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
                    Recent Posts
                  </Typography>
                  <Stack spacing={2}>
                    {recentPosts.map((post, index) => (
                      <Box
                        key={index}
                        onClick={() => navigate(`/blog/${blogPosts[index]?.slug || ''}`)}
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
                            src={post.image}
                            alt={post.title}
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
                            color: '#333 !important',
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
                    Categories
                  </Typography>
                  <Stack spacing={1}>
                    {categories.map((category, index) => (
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
                            color: '#1976d2',
                          },
                        }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#333 !important' }}>{category}</Typography>
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
                    Popular Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Healthcare', 'Clinic', 'Health', 'Polyclinic', 'Medical', 'Laboratory', 'Polyclinic HMS', 'Tanzania'].map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: '#f0f0f0',
                          color: '#555',
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
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* All Posts Section - Three Column Grid Layout */}
      {blogPosts.length > 3 && (
        <Box 
          ref={allPostsRef}
          sx={{ 
            py: { xs: 5, md: 7 },
            bgcolor: 'white',
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                  fontWeight: 800,
                  mb: 1.5,
                  color: '#1C1C1C !important',
                }}
              >
                More Articles
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
                Explore additional articles on health, medical tips, and wellness
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 3, md: 4 }}>
              {blogPosts.slice(3).map((post, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index + 3}>
                  <Card
                    ref={(el) => (cardsRef.current[index + 3] = el)}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0',
                      bgcolor: 'white',
                      overflow: 'hidden',
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 220, sm: 260, md: 300, lg: 320 },
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
                        src={post.image}
                        alt={post.title}
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
                    <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          sx={{
                            bgcolor: `${post.color}15`,
                            color: post.color,
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          }}
                        />
                        <Chip
                          icon={<TimeIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } + ' !important', color: '#555' }} />}
                          label={post.readTime}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            borderColor: '#e0e0e0',
                            color: '#555',
                          }}
                        />
                        <Chip
                          icon={<CalendarIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } + ' !important', color: '#555' }} />}
                          label={post.date.split(' ')[0] + ' ' + post.date.split(' ')[1]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            borderColor: '#e0e0e0',
                            color: '#555',
                            display: { xs: 'none', sm: 'flex' },
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: '#1C1C1C !important',
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {post.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mb: 0,
                          color: '#4A4A4A !important',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.9rem', md: '0.95rem' },
                        }}
                      >
                        {post.excerpt}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Newsletter Section - Light Blue/Purple Gradient */}
      <Box
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
            background: 'radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.08) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ bgcolor: 'transparent', position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              bgcolor: 'white',
              p: { xs: 3, sm: 4, md: 5 },
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#1A4A6B !important',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                        color: '#4A4A4A !important',
                fontSize: '1rem',
                lineHeight: 1.8,
              }}
            >
              Subscribe to our newsletter and never miss an update
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ maxWidth: 450, mx: 'auto' }}
            >
              <Box
                component="input"
                placeholder="Enter your email"
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.25,
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '0.95rem',
                  outline: 'none',
                  bgcolor: '#f8f9fa',
                  color: '#333',
                  '&::placeholder': {
                    color: '#999',
                  },
                  '&:focus': {
                    borderColor: '#667eea',
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.25,
                  borderRadius: '8px',
                  bgcolor: '#667eea',
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: '#5568d3',
                  },
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Blog;

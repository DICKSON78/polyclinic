import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Container,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const theme = useTheme();
  // Use 'lg' breakpoint to show hamburger menu on tablets/iPads (below 1200px)
  // This ensures proper display on medium screens (768px - 1200px)
  // Material-UI breakpoints: xs:0, sm:600, md:900, lg:1200, xl:1536
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleDropdownOpen = (event, dropdownName) => {
    setActiveDropdown(dropdownName);
    setAnchorEl(event.currentTarget);
    if (dropdownName === 'Services') {
      setServicesOpen(true);
    } else if (dropdownName === 'Resources') {
      setResourcesOpen(true);
    }
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
    setAnchorEl(null);
    setServicesOpen(false);
    setResourcesOpen(false);
  };

  // Navigation structure with dropdowns
  const navItems = [
    { label: 'Home', path: '/', type: 'link' },
    { label: 'About', path: '/about', type: 'link' },
    {
      label: 'Services',
      type: 'dropdown',
      items: [
        { label: 'Our Services', path: '/services' },
        { label: 'Books & Journals', path: '/books' },
        { label: 'Insurance & Payment', path: '/insurance-payment' },
      ],
    },
    {
      label: 'Resources',
      type: 'dropdown',
      items: [
        { label: 'FAQ', path: '/faq' },
        { label: 'Testimonials', path: '/testimonials' },
      ],
    },
    { label: 'Blog', path: '/blog', type: 'link' },
    { label: 'Appointment', path: '/appointment', type: 'link' },
    { label: 'Contact Us', path: '/contact', type: 'link' },
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between', 
            py: { xs: 1, sm: 1.25, md: 1.5 }, 
            minHeight: { xs: 56, sm: 64, md: 70 },
            flexWrap: { md: 'nowrap' },
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Logo */}
          <Box 
            component={Link}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.75, sm: 1.5, md: 1.5 },
              textDecoration: 'none',
              transition: 'transform 0.3s',
              flex: '0 0 auto',
              minWidth: 0,
              maxWidth: { xs: '60%', sm: 'none', md: 'none' },
              flexShrink: 0,
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Box
              component="img"
              src={`/logo.png?v=${Date.now()}`}
              alt="Polyclinic HMS Logo"
              sx={{
                height: { xs: 32, sm: 40, md: 45 },
                width: 'auto',
                objectFit: 'contain',
                display: logoError ? 'none' : 'block',
                flexShrink: 0,
              }}
              onError={(e) => {
                console.warn('Logo failed to load from /logo.png:', e);
                // Try images directory as fallback
                if (e.target.src.includes('/logo.png')) {
                  console.log('Trying /images/logo.png as fallback...');
                  e.target.src = '/images/logo.png';
                  return;
                }
                setLogoError(true);
              }}
              onLoad={(e) => {
                console.log('Logo loaded successfully from:', e.target.src);
                setLogoLoaded(true);
                setLogoError(false);
              }}
            />
            {/* Text fallback logo - shown when image fails */}
            {logoError && (
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#1E88E5',
                  fontSize: { xs: '0.75rem', sm: '1.1rem', md: '1.25rem' },
                  letterSpacing: { xs: '0.2px', sm: '0.5px' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '100px', sm: '150px', md: 'none' },
                  lineHeight: 1.1,
                  flexShrink: 1,
                }}
                title="Polyclinic HMS"
              >
                Polyclinic HMS
              </Typography>
            )}
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 800,
                color: '#1C1C1C',
                fontSize: { xs: '0.75rem', sm: '1.1rem', md: '1.25rem' },
                letterSpacing: { xs: '0.2px', sm: '0.5px' },
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '100px', sm: '150px', md: 'none' },
                lineHeight: 1.1,
                flexShrink: 1,
              }}
              title="Polyclinic HMS"
            >
              Polyclinic HMS
            </Typography>
          </Box>

          {/* Desktop Navigation - Only show on large screens (1200px+) */}
          {!isMobile && (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, sm: 1, md: 1.5, lg: 1.5 }, 
                alignItems: 'center', 
                flexWrap: 'nowrap',
                overflow: 'hidden',
                maxWidth: { lg: '100%' },
              }}
            >
              {navItems.map((item, index) => {
                if (item.type === 'link') {
                  const isAppointment = item.path === '/appointment';
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path || index}
                      component={Link}
                      to={item.path}
                      variant={isAppointment ? 'contained' : 'text'}
                      sx={{
                        color: isAppointment ? '#1C1C1C' : '#1C1C1C',
                        bgcolor: isAppointment ? '#B3E5FC' : 'transparent',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                        px: { xs: 1.25, sm: 1.5, md: 2 },
                        py: { xs: 0.75, sm: 0.875, md: 1 },
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s',
                        boxShadow: isAppointment ? '0 2px 8px rgba(33, 150, 243, 0.15)' : 'none',
                        '&:hover': {
                          backgroundColor: isAppointment ? '#81D4FA' : 'rgba(28, 28, 28, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: isAppointment ? '0 4px 12px rgba(33, 150, 243, 0.25)' : 'none',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                } else if (item.type === 'dropdown') {
                  return (
                    <Box key={item.label}>
                      <Box>
                        <Button
                          onClick={(e) => handleDropdownOpen(e, item.label)}
                          sx={{
                            color: '#1C1C1C',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                            px: { xs: 1.25, sm: 1.5, md: 2 },
                            py: { xs: 0.75, sm: 0.875, md: 1 },
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s',
                            '&:hover': {
                              backgroundColor: 'rgba(28, 28, 28, 0.1)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                          endIcon={
                            activeDropdown === item.label ? (
                              <ExpandLessIcon sx={{ color: '#1C1C1C', fontSize: '1.2rem' }} />
                            ) : (
                              <ExpandMoreIcon sx={{ color: '#1C1C1C', fontSize: '1.2rem' }} />
                            )
                          }
                        >
                          {item.label}
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={activeDropdown === item.label}
                          onClose={handleDropdownClose}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          sx={{
                            '& .MuiPaper-root': {
                              borderRadius: '12px',
                              mt: 1,
                              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                              minWidth: 200,
                              bgcolor: 'white',
                              border: '1px solid rgba(28, 28, 28, 0.1)',
                            },
                            '& .MuiMenuItem-root': {
                              color: '#1C1C1C',
                              '&:hover': {
                                backgroundColor: 'rgba(28, 28, 28, 0.1)',
                              },
                            },
                          }}
                        >
                          {item.items?.map((subItem) => (
                            <MenuItem
                              key={subItem.path}
                              component={Link}
                              to={subItem.path}
                              onClick={handleDropdownClose}
                              sx={{
                                px: 2,
                                py: 1.5,
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                },
                              }}
                            >
                              {subItem.label}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          )}

          {/* Mobile/Tablet Menu Button - Shows on screens below 1200px */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ 
                color: '#1C1C1C',
                ml: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(28, 28, 28, 0.1)',
                },
              }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>

        {/* Mobile/Tablet Menu - Shows on screens below 1200px */}
        {isMobile && mobileMenuOpen && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              pb: 2,
              px: { xs: 2, md: 3 },
              maxHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' },
              overflowY: 'auto',
            }}
          >
            {navItems.map((item, index) => {
              if (item.type === 'link') {
                const isAppointment = item.path === '/appointment';
                return (
                  <Button
                    key={item.path || index}
                    component={Link}
                    to={item.path}
                    fullWidth
                    variant={isAppointment ? 'contained' : 'text'}
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      color: isAppointment ? '#1C1C1C' : '#1C1C1C',
                      bgcolor: isAppointment ? '#B3E5FC' : 'transparent',
                      fontWeight: 600,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1.5,
                      borderRadius: '8px',
                      boxShadow: isAppointment ? '0 2px 8px rgba(33, 150, 243, 0.15)' : 'none',
                      '&:hover': {
                        backgroundColor: isAppointment ? '#81D4FA' : 'rgba(28, 28, 28, 0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              } else if (item.type === 'dropdown') {
                const isOpen = item.label === 'Services' ? servicesOpen : resourcesOpen;
                return (
                  <Box key={item.label}>
                    <Button
                      fullWidth
                      onClick={() => {
                        if (item.label === 'Services') {
                          setServicesOpen(!servicesOpen);
                        } else if (item.label === 'Resources') {
                          setResourcesOpen(!resourcesOpen);
                        }
                      }}
                      sx={{
                        color: '#1C1C1C',
                        fontWeight: 600,
                        textTransform: 'none',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(28, 28, 28, 0.1)',
                        },
                      }}
                      endIcon={isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      {item.label}
                    </Button>
                    <Collapse in={isOpen}>
                      <Box sx={{ pl: 2, pt: 0.5 }}>
                        {item.items?.map((subItem) => (
                          <Button
                            key={subItem.path}
                            component={Link}
                            to={subItem.path}
                            fullWidth
                            onClick={() => setMobileMenuOpen(false)}
                            sx={{
                              color: '#1C1C1C',
                              fontWeight: 500,
                              textTransform: 'none',
                              justifyContent: 'flex-start',
                              px: 2,
                              py: 1.25,
                              fontSize: '0.9rem',
                              borderRadius: '6px',
                              '&:hover': {
                                backgroundColor: 'rgba(28, 28, 28, 0.1)',
                              },
                            }}
                          >
                            {subItem.label}
                          </Button>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              }
              return null;
            })}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Navbar;

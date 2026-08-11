import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Cookies = () => {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.',
      examples: ['Session management', 'Security tokens', 'Load balancing'],
      necessary: true,
    },
    {
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: ['Page views', 'User behavior', 'Traffic sources'],
      necessary: false,
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
      examples: ['Language preferences', 'Theme settings', 'User preferences'],
      necessary: false,
    },
    {
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.',
      examples: ['Ad targeting', 'Campaign tracking', 'Conversion tracking'],
      necessary: false,
    },
  ];

  const sections = [
    {
      title: '1. What Are Cookies?',
      content: [
        {
          text: 'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies allow a website to recognize your device and store some information about your preferences or past actions.',
        },
      ],
    },
    {
      title: '2. How We Use Cookies',
      content: [
        {
          subtitle: '2.1 Essential Functions',
          text: 'We use cookies to enable essential website functions, such as maintaining your session, ensuring security, and remembering your preferences during your visit.',
        },
        {
          subtitle: '2.2 Website Analytics',
          text: 'We use analytics cookies to understand how visitors use our website, which helps us improve the user experience and optimize our content and services.',
        },
        {
          subtitle: '2.3 Personalization',
          text: 'We use cookies to remember your preferences and settings, such as language selection and display preferences, to provide you with a more personalized experience.',
        },
      ],
    },
    {
      title: '3. Types of Cookies We Use',
      content: [
        {
          text: 'We use different types of cookies for various purposes. Below is a detailed breakdown of the cookies we use:',
        },
      ],
    },
    {
      title: '4. Third-Party Cookies',
      content: [
        {
          subtitle: '4.1 Service Providers',
          text: 'We may use third-party service providers who set cookies on our website to help us analyze website usage, provide customer support, or deliver targeted advertising. These third parties are bound by their own privacy policies.',
        },
        {
          subtitle: '4.2 Social Media',
          text: 'Our website may include social media features that use cookies. These features are provided by third-party social media platforms and are governed by their respective privacy policies.',
        },
      ],
    },
    {
      title: '5. Managing Your Cookie Preferences',
      content: [
        {
          subtitle: '5.1 Browser Settings',
          text: 'You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. However, blocking or deleting cookies may impact your ability to use certain features of our website.',
        },
        {
          subtitle: '5.2 Cookie Consent',
          text: 'When you first visit our website, you will be presented with a cookie consent banner. You can accept all cookies, reject non-essential cookies, or customize your cookie preferences.',
        },
        {
          subtitle: '5.3 Opt-Out Tools',
          text: 'You can opt out of certain third-party cookies by visiting the opt-out pages provided by those third parties. We can provide links to these opt-out tools upon request.',
        },
      ],
    },
    {
      title: '6. Cookie Duration',
      content: [
        {
          subtitle: '6.1 Session Cookies',
          text: 'Session cookies are temporary and are deleted when you close your browser. They are used to maintain your session while you navigate our website.',
        },
        {
          subtitle: '6.2 Persistent Cookies',
          text: 'Persistent cookies remain on your device for a set period or until you delete them. They are used to remember your preferences and settings for future visits.',
        },
      ],
    },
    {
      title: '7. Updates to This Policy',
      content: [
        {
          text: 'We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date.',
        },
      ],
    },
    {
      title: '8. Call us now',
      content: [
        {
          text: 'If you have any questions about our use of cookies or this Cookie Policy, please call us now:',
          details: [
            'Email: privacy@polyclinic-hms.com',
            'Phone: +1 (555) 123-4567',
            'Address: 123 Healthcare Street, Medical District, City 12345',
          ],
        },
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 900,
              mb: 2,
              textAlign: 'center',
            }}
          >
            Cookie Policy
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              opacity: 0.95,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Learn about how we use cookies and similar technologies to enhance your experience on our website.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 2,
              opacity: 0.9,
            }}
          >
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: 'text.secondary',
                }}
              >
                This Cookie Policy explains what cookies are, how we use them on our website, and how you can manage your cookie preferences. By using our website, you consent to our use of cookies in accordance with this policy.
              </Typography>

              {sections.map((section, sectionIndex) => (
                <Box key={sectionIndex} sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: '#1976d2',
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                    }}
                  >
                    {section.title}
                  </Typography>
                  
                  {section.content.map((item, itemIndex) => (
                    <Box key={itemIndex} sx={{ mb: 3 }}>
                      {item.subtitle && (
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1.5,
                            color: '#00BCD4',
                            fontSize: { xs: '1.1rem', md: '1.2rem' },
                          }}
                        >
                          {item.subtitle}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 2,
                          lineHeight: 1.8,
                          color: 'text.secondary',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                        }}
                      >
                        {item.text}
                      </Typography>
                      {item.details && (
                        <Box sx={{ pl: 2, mt: 1 }}>
                          {item.details.map((detail, detailIndex) => (
                            <Typography
                              key={detailIndex}
                              variant="body2"
                              sx={{
                                mb: 0.5,
                                color: 'text.secondary',
                              }}
                            >
                              • {detail}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {itemIndex < section.content.length - 1 && (
                        <Divider sx={{ mt: 2, mb: 2 }} />
                      )}
                    </Box>
                  ))}
                  
                  {sectionIndex < sections.length - 1 && (
                    <Divider sx={{ mt: 3, mb: 3 }} />
                  )}
                </Box>
              ))}

              {/* Cookie Types Section */}
              <Box sx={{ mt: 5, mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                                color: '#1976d2',
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                  }}
                >
                  Cookie Types We Use
                </Typography>
                <Grid container spacing={3}>
                  {cookieTypes.map((cookie, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: '15px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          border: cookie.necessary ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: '#1976d2',
                              }}
                            >
                              {cookie.name}
                            </Typography>
                            {cookie.necessary && (
                              <Chip
                                label="Required"
                                size="small"
                                sx={{
                                  bgcolor: '#1976d2',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              color: 'text.secondary',
                              lineHeight: 1.7,
                            }}
                          >
                            {cookie.description}
                          </Typography>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: 'text.secondary',
                                display: 'block',
                                mb: 0.5,
                              }}
                            >
                              Examples:
                            </Typography>
                            {cookie.examples.map((example, exampleIndex) => (
                              <Chip
                                key={exampleIndex}
                                label={example}
                                size="small"
                                sx={{
                                  mr: 0.5,
                                  mb: 0.5,
                                  fontSize: '0.7rem',
                                  bgcolor: '#f5f5f5',
                                }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  bgcolor: '#f0f4ff',
                  borderRadius: '12px',
                  border: '1px solid #1976d2',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                                color: '#1976d2',
                  }}
                >
                  Manage Your Cookie Preferences
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  You have control over cookies. You can adjust your browser settings to accept or reject cookies, or you can use our cookie preference center to manage your choices.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Note: Disabling certain cookies may affect the functionality of our website and your user experience.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Cookies;


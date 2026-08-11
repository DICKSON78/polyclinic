import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Privacy = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        {
          subtitle: '1.1 Personal Information',
          text: 'We collect personal information that you provide directly to us when you use our services, including but not limited to: name, email address, phone number, date of birth, medical history, insurance information, and payment details.',
        },
        {
          subtitle: '1.2 Medical Information',
          text: 'As a healthcare service provider, we collect and maintain medical records, examination results, prescriptions, and other health-related information necessary for providing quality healthcare services.',
        },
        {
          subtitle: '1.3 Usage Information',
          text: 'We automatically collect information about how you interact with our website and services, including IP address, browser type, device information, pages visited, and time spent on pages.',
        },
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: '2.1 Service Provision',
          text: 'We use your information to provide, maintain, and improve our healthcare services, schedule appointments, process payments, and communicate with you about your care.',
        },
        {
          subtitle: '2.2 Medical Care',
          text: 'Your medical information is used by our healthcare professionals to diagnose, treat, and manage your health conditions effectively.',
        },
        {
          subtitle: '2.3 Communication',
          text: 'We may use your contact information to send you appointment reminders, test results, treatment updates, and important health information.',
        },
        {
          subtitle: '2.4 Legal Compliance',
          text: 'We use your information to comply with applicable laws, regulations, and healthcare standards, including HIPAA and other medical privacy regulations.',
        },
      ],
    },
    {
      title: '3. Information Sharing and Disclosure',
      content: [
        {
          subtitle: '3.1 Healthcare Providers',
          text: 'We may share your medical information with other healthcare providers involved in your care, with your consent or as required by law.',
        },
        {
          subtitle: '3.2 Service Providers',
          text: 'We may share information with third-party service providers who assist us in operating our practice, such as billing services, IT support, and cloud storage providers, all of whom are bound by confidentiality agreements.',
        },
        {
          subtitle: '3.3 Legal Requirements',
          text: 'We may disclose your information if required by law, court order, or government regulation, or to protect the rights, property, or safety of our patients, staff, or others.',
        },
        {
          subtitle: '3.4 Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, with appropriate privacy protections maintained.',
        },
      ],
    },
    {
      title: '4. Data Security',
      content: [
        {
          subtitle: '4.1 Security Measures',
          text: 'We implement industry-standard security measures to protect your personal and medical information, including encryption, secure servers, access controls, and regular security audits.',
        },
        {
          subtitle: '4.2 Data Retention',
          text: 'We retain your medical records as required by law and professional standards. Personal information is retained only as long as necessary to provide services and comply with legal obligations.',
        },
      ],
    },
    {
      title: '5. Your Rights',
      content: [
        {
          subtitle: '5.1 Access and Correction',
          text: 'You have the right to access, review, and request corrections to your personal and medical information. Please call us now to exercise these rights.',
        },
        {
          subtitle: '5.2 Opt-Out',
          text: 'You may opt-out of non-essential communications, such as marketing emails, while still receiving important health-related communications.',
        },
        {
          subtitle: '5.3 Data Portability',
          text: 'You may request a copy of your medical records in a portable format, subject to applicable laws and regulations.',
        },
      ],
    },
    {
      title: '6. Cookies and Tracking Technologies',
      content: [
        {
          subtitle: '6.1 Cookie Usage',
          text: 'We use cookies and similar technologies to enhance your experience, analyze website usage, and improve our services. You can control cookie preferences through your browser settings.',
        },
      ],
    },
    {
      title: '7. Children\'s Privacy',
      content: [
        {
          subtitle: '7.1 Protection of Minors',
          text: 'We are committed to protecting the privacy of children. We do not knowingly collect personal information from children under 13 without parental consent, in compliance with COPPA and other applicable laws.',
        },
      ],
    },
    {
      title: '8. Changes to This Policy',
      content: [
        {
          subtitle: '8.1 Policy Updates',
          text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.',
        },
      ],
    },
    {
      title: '9. Call us now',
      content: [
        {
          subtitle: '9.1 Privacy Inquiries',
          text: 'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please call us now at:',
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
            Privacy Policy
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
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal and medical information.
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
                At Polyclinic HMS, we are committed to protecting your privacy and ensuring the security of your personal and medical information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our services.
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
                  Questions About Privacy?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to call us now. We're here to help protect your privacy and ensure your peace of mind.
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

export default Privacy;


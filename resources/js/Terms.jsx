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

const Terms = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: [
        {
          text: 'By accessing and using the services of Polyclinic HMS, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
        },
      ],
    },
    {
      title: '2. Use License',
      content: [
        {
          subtitle: '2.1 Permission',
          text: 'Permission is granted to temporarily access the materials on Polyclinic HMS\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
        },
        {
          subtitle: '2.2 Restrictions',
          text: 'Under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person.',
        },
      ],
    },
    {
      title: '3. Medical Services',
      content: [
        {
          subtitle: '3.1 Healthcare Provider Relationship',
          text: 'The information provided on this website is for general informational purposes only and does not constitute medical advice. The use of our services establishes a healthcare provider-patient relationship, and all medical care is provided in accordance with applicable medical standards and regulations.',
        },
        {
          subtitle: '3.2 No Guarantee of Results',
          text: 'While we strive to provide the highest quality healthcare services, we cannot guarantee specific outcomes or results. Individual results may vary based on various factors including but not limited to patient condition, compliance with treatment, and other health factors.',
        },
        {
          subtitle: '3.3 Emergency Situations',
          text: 'This website and our services are not intended for emergency medical situations. In case of a medical emergency, please call emergency services immediately or visit the nearest emergency room.',
        },
      ],
    },
    {
      title: '4. Appointments and Cancellations',
      content: [
        {
          subtitle: '4.1 Scheduling',
          text: 'Appointments can be scheduled through our website, phone, or in person. We reserve the right to reschedule appointments when necessary due to emergencies or other circumstances.',
        },
        {
          subtitle: '4.2 Cancellation Policy',
          text: 'We require at least 24 hours notice for appointment cancellations. Failure to provide adequate notice or missing appointments may result in a cancellation fee. Repeated no-shows may result in restrictions on future appointments.',
        },
        {
          subtitle: '4.3 Late Arrivals',
          text: 'Patients arriving more than 15 minutes late may be asked to reschedule their appointment to ensure adequate time for proper care and to respect other patients\' scheduled times.',
        },
      ],
    },
    {
      title: '5. Payment Terms',
      content: [
        {
          subtitle: '5.1 Payment Responsibility',
          text: 'Patients are responsible for all charges for services rendered, regardless of insurance coverage. We accept various payment methods including cash, credit cards, and insurance plans as accepted by our practice.',
        },
        {
          subtitle: '5.2 Insurance',
          text: 'We will submit claims to your insurance provider as a courtesy. However, you are ultimately responsible for all charges not covered by insurance, including deductibles, copayments, and non-covered services.',
        },
        {
          subtitle: '5.3 Payment Plans',
          text: 'Payment plans may be available for qualifying patients. Terms and conditions for payment plans will be provided separately and must be agreed upon before services are rendered.',
        },
      ],
    },
    {
      title: '6. Intellectual Property',
      content: [
        {
          subtitle: '6.1 Ownership',
          text: 'All content, including but not limited to text, graphics, logos, images, and software, is the property of Polyclinic HMS or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.',
        },
        {
          subtitle: '6.2 Use Restrictions',
          text: 'You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any content from this website without express written permission from Polyclinic HMS.',
        },
      ],
    },
    {
      title: '7. User Accounts',
      content: [
        {
          subtitle: '7.1 Account Security',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
        },
        {
          subtitle: '7.2 Account Termination',
          text: 'We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these terms or for any other reason we deem necessary to protect our services and other users.',
        },
      ],
    },
    {
      title: '8. Limitation of Liability',
      content: [
        {
          subtitle: '8.1 Disclaimer',
          text: 'The materials on Polyclinic HMS\'s website are provided on an "as is" basis. Polyclinic HMS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
        },
        {
          subtitle: '8.2 Limitation',
          text: 'In no event shall Polyclinic HMS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Polyclinic HMS\'s website, even if Polyclinic HMS or an authorized representative has been notified orally or in writing of the possibility of such damage.',
        },
      ],
    },
    {
      title: '9. Revisions and Errata',
      content: [
        {
          text: 'The materials appearing on Polyclinic HMS\'s website could include technical, typographical, or photographic errors. Polyclinic HMS does not warrant that any of the materials on its website are accurate, complete, or current. Polyclinic HMS may make changes to the materials contained on its website at any time without notice.',
        },
      ],
    },
    {
      title: '10. Links to Third-Party Sites',
      content: [
        {
          text: 'Our website may contain links to third-party websites. These links are provided for your convenience only. We do not endorse or assume responsibility for the content, privacy policies, or practices of third-party websites. Your use of third-party websites is at your own risk.',
        },
      ],
    },
    {
      title: '11. Modifications to Terms',
      content: [
        {
          text: 'Polyclinic HMS may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service. We encourage you to review these terms periodically.',
        },
      ],
    },
    {
      title: '12. Governing Law',
      content: [
        {
          text: 'These terms and conditions are governed by and construed in accordance with applicable local, state, and federal laws. Any disputes arising from these terms or your use of our services shall be resolved through appropriate legal channels.',
        },
      ],
    },
    {
      title: '13. Contact Information',
      content: [
        {
          text: 'If you have any questions about these Terms of Service, please call us now:',
          details: [
            'Email: legal@polyclinic-hms.com',
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
            Terms of Service
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
            Please read these terms carefully before using our services. By using our services, you agree to these terms.
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
                Welcome to Polyclinic HMS. These Terms of Service ("Terms") govern your access to and use of our website, services, and facilities. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
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
                  Questions About Our Terms?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  If you have any questions about these Terms of Service, please call us now. We're committed to transparency and are happy to clarify any aspect of these terms.
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

export default Terms;


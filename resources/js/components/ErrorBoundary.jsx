import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 100%)',
            p: 3,
          }}
        >
          <Container maxWidth="sm">
            <Box
              sx={{
                textAlign: 'center',
                bgcolor: 'white',
                p: 4,
                borderRadius: 3,
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Polyclinic HMS Logo"
                sx={{
                  height: 60,
                  width: 'auto',
                  mb: 3,
                  mx: 'auto',
                }}
                onError={(e) => {
                  console.warn('ErrorBoundary logo failed to load');
                  // Fallback: show text logo if image fails to load
                  e.target.style.display = 'none';
                  const textLogo = document.createElement('h3');
                  textLogo.innerHTML = 'Polyclinic HMS';
                  textLogo.style.cssText = 'color: #1E88E5; text-align: center; margin-bottom: 24px; font-weight: bold;';
                  e.target.parentNode.insertBefore(textLogo, e.target.nextSibling);
                }}
                onLoad={(e) => {
                  console.log('ErrorBoundary logo loaded successfully');
                  // Ensure any fallback text is removed when image loads
                  const fallback = e.target.nextElementSibling;
                  if (fallback && fallback.tagName === 'H3') {
                    fallback.remove();
                  }
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1C1C1C',
                  mb: 2,
                }}
              >
                Something Went Wrong
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#4A4A4A',
                  mb: 3,
                  lineHeight: 1.7,
                }}
              >
                We're sorry, but something unexpected happened. Please try refreshing the page or call us now if the problem persists.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                    },
                  }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5568d3',
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                    },
                  }}
                >
                  Go to Home
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


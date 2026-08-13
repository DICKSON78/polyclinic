import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { usePost } from "../hooks";
import { formatError } from "../helpers";
import { getDefaultRoute } from "../helpers/privileges";

const Auth = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const { data, loading, error, handlePost } = usePost(
    "/api/auth/login"
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = `Login - ${window.APP_NAME}`;
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // User is already logged in, redirect to dashboard
      const defaultRoute = getDefaultRoute({});
      navigate(defaultRoute, { replace: true });
      return;
    }
  }, []);

  useEffect(() => {
    if (data && data.data && data.data.user && data.data.token) {
      window.user = data.data.user;
      window.localStorage.removeItem("token");
      window.localStorage.setItem("token", data.data.token);

      const u = data.data.user || {};
      
      // Use the centralized privilege utility to get default route
      const defaultRoute = getDefaultRoute(u);

      navigate(defaultRoute, { replace: true });
    }
  }, [data, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.username && formData.password) {
      handlePost("/api/auth/login", formData);
    }
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{
            mb: 2,
            border: "none",
          }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{ position: 'relative', zIndex: 2 }}
        >
          <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)', p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1E88E5',
                }}
              >
                Polyclinic HMS
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: '#1C1C1C',
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6C757D',
                  lineHeight: 1.6,
                }}
              >
                Sign in to access your account and continue managing your healthcare services.
              </Typography>
            </Box>

            {handleFeedback()}

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    color: '#1C1C1C',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    color: '#1C1C1C',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              <Button
                disabled={loading}
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Auth;

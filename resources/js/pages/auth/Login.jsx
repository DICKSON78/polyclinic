import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Typography,
  Divider,
} from "@mui/material";
import {
  LockRounded as LockIcon,
  Person2Rounded as UsernameIcon,
  VisibilityOffRounded as VisibilityOffIcon,
  VisibilityRounded as VisibilityIcon,
} from "@mui/icons-material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";
import { getDefaultRoute } from "../../helpers/privileges";

const LogIn = () => {
  const navigate = useNavigate();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [formData, setFormData] = useState({
    username: undefined,
    password: undefined,
  });
  const { data, loading, error, handlePost } = usePost(
    "/api/auth/login"
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = `Login - ${window.APP_NAME}`;
    
    // Clear any stale redirect flags when login page loads
    window.sessionStorage.removeItem('redirecting_to_login');
  }, []);

  useEffect(() => {
    if (data) {
      // Clear any redirect flags from previous session expiry
      window.sessionStorage.removeItem('redirecting_to_login');
      
      window.user = data.data.user;
      window.localStorage.removeItem("token");
      window.localStorage.setItem("token", data.data.token);

      const u = data.data.user || {};
      
      // Use the centralized privilege utility to get default route
      const defaultRoute = getDefaultRoute(u);

      // Navigate to default route using React Router
      navigate(defaultRoute, { replace: true });
    }
  }, [data, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formRef.current.validate()) {
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
    <Box p={2}>
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
      <Divider sx={{ mb: 3 }} />
      {handleFeedback()}
      <Form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <TextField
          ref={usernameRef}
          placeholder="Username"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <UsernameIcon />
              </InputAdornment>
            ),
          }}
          containerProps={{ sx: { mb: 2 } }}
          onChange={(value) => setFormData({ ...formData, username: value })}
        />
        <TextField
          ref={passwordRef}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </InputAdornment>
            ),
          }}
          containerProps={{ sx: { mb: 2 } }}
          onChange={(value) => setFormData({ ...formData, password: value })}
        />
        <Button
          disabled={loading}
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          onClick={handleSubmit}
        >
          Login
        </Button>
      </Form>
    </Box>
  );
};

export default LogIn;

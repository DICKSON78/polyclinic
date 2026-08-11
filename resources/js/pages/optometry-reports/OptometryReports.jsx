import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Visibility as EyeIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  HealthAndSafety as HealthIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import Page from '../../components/Page';
// import { useAuth } from '../../hooks';
// import { hasPrivilege, isAdmin } from '../../helpers/privileges';

const OptometryReports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to performance report card
    navigate('/optometry-reports/performance-report-card');
  }, [navigate]);

  // Show loading or redirecting message
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Typography variant="h6" color="text.secondary">
        Loading Examination Report Card...
      </Typography>
    </Box>
  );
};

export default OptometryReports;

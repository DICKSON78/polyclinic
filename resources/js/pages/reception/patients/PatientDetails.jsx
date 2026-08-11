import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/StarRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import PhoneIcon from "@mui/icons-material/PhoneRounded";
import EmailIcon from "@mui/icons-material/EmailRounded";
import LocationOnIcon from "@mui/icons-material/LocationOnRounded";
import WorkIcon from "@mui/icons-material/WorkRounded";
import PaymentIcon from "@mui/icons-material/PaymentRounded";
import InfoIcon from "@mui/icons-material/InfoRounded";
import DownloadIcon from "@mui/icons-material/DownloadRounded";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getAge } from "../../../helpers";
import ReferralPDF from "../../consultation-room/referrals/ReferralPDF";

const PatientDetails = ({ setLoading, onLoadSuccess }) => {
  const { patientId } = useParams();
  const addToast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch patient data
  const { data, loading, error, handleFetch } = useFetch(
    `api/patients/${patientId}`,
    null,
    patientId && patientId !== 'null' && patientId !== 'undefined' && patientId !== '', // Only fetch if patientId is valid
    null,
    (response) => response.data.data
  );

  // Fetch referral data for patient
  const { data: referralData, loading: referralLoading } = useFetch(
    `api/patients/${patientId}/referrals`,
    null,
    patientId && patientId !== 'null' && patientId !== 'undefined' && patientId !== '', // Only fetch if patientId is valid
    null,
    (response) => response.data.data
  );

  // Refetch if patientId changes
  useEffect(() => {
    if (patientId && patientId !== 'null' && patientId !== 'undefined' && patientId !== '') {
      // Only refetch if we don't have data or the patientId has changed
      if (!data || (data.id && String(data.id) !== String(patientId))) {
        handleFetch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    if (typeof setLoading === "function") {
      setLoading(loading);
    }
  }, [loading]);

  useEffect(() => {
    if (data && typeof onLoadSuccess === "function") {
      onLoadSuccess(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleFeedback = () => {
    if (error) {
      return (
        <Alert
          sx={{ mb: 2 }}
          severity={"error"}
        >
          {formatError(error)}
        </Alert>
      );
    }

    return null;
  };

  const getPatientInfoRows = () => {
    try {
      if (!data) return [];

      const rows = [
        { 
          label: "Patient Name", 
          value: data.full_name || 'N/A', 
          isVip: data.is_vip,
          icon: <PersonIcon />,
          priority: 1
        },
        { 
          label: "Patient Number", 
          value: data.id || 'N/A',
          icon: <PersonIcon />,
          priority: 1
        },
        { 
          label: "Age", 
          value: getAge(data.date_of_birth) || 'N/A',
          icon: <PersonIcon />,
          priority: 2
        },
        { 
          label: "Gender", 
          value: data.gender || 'N/A',
          icon: <PersonIcon />,
          priority: 2
        },
      { 
        label: "Phone Number", 
        value: data.phone,
        icon: <PhoneIcon />,
        priority: 1
      },
      { 
        label: "Email Address", 
        value: data.email || "Not provided",
        icon: <EmailIcon />,
        priority: 3
      },
      { 
        label: "Address", 
        value: data.address,
        icon: <LocationOnIcon />,
        priority: 2
      },
      { 
        label: "Occupation", 
        value: data.occupation,
        icon: <WorkIcon />,
        priority: 3
      },
      { 
        label: "Payment Mode", 
        value: data.payment_mode?.name,
        icon: <PaymentIcon />,
        priority: 1
      },
      { 
        label: "National ID", 
        value: data.national_id || "Not provided",
        icon: <InfoIcon />,
        priority: 3
      },
    ];

    // Add location information if available
    if (data.region?.name) {
      rows.push({ 
        label: "Region", 
        value: data.region.name,
        icon: <LocationOnIcon />,
        priority: 3
      });
    }
    if (data.district?.name) {
      rows.push({ 
        label: "District", 
        value: data.district.name,
        icon: <LocationOnIcon />,
        priority: 3
      });
    }
    if (data.ward?.name) {
      rows.push({ 
        label: "Ward", 
        value: data.ward.name,
        icon: <LocationOnIcon />,
        priority: 3
      });
    }

    // Add information source if available
    if (data.information_source?.name) {
      rows.push({ 
        label: "Information Source", 
        value: data.information_source.name,
        icon: <InfoIcon />,
        priority: 3
      });
    }

    // Add client type badges if applicable
    const clientTypes = [];
    if (data.is_student) clientTypes.push('Student');
    if (data.is_businessperson) clientTypes.push('Businessperson');
    if (data.is_outreach) clientTypes.push('Outreach Client');
    if (data.is_employee) clientTypes.push('Employee');
    
    if (clientTypes.length > 0) {
      rows.push({ 
        label: "Client Type", 
        value: clientTypes.join(', '),
        icon: <InfoIcon />,
        priority: 3
      });
    }

    return rows;
    } catch (error) {
      console.error('PatientDetails: Error in getPatientInfoRows():', error);
      return [];
    }
  };

  const getResponsiveColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3; // Desktop: 3 columns
  };

  const getGroupedRows = () => {
    try {
      const items = getPatientInfoRows();
      if (!items || !Array.isArray(items)) {
        console.warn('PatientDetails: getPatientInfoRows() returned invalid data:', items);
        return [];
      }
      
      const columnsPerRow = getResponsiveColumns();
      const grouped = [];
      for (let i = 0; i < items.length; i += columnsPerRow) {
        grouped.push(items.slice(i, i + columnsPerRow));
      }
      return grouped;
    } catch (error) {
      console.error('PatientDetails: Error in getGroupedRows():', error);
      return [];
    }
  };

  const renderInfoCard = (row) => (
    <Box 
      key={row.label}
      sx={{ 
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        '&:hover': {
          backgroundColor: 'background.paper !important',
          transform: 'none !important',
          boxShadow: 'none !important'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          color: 'primary.main', 
          mr: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          {row.icon}
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {row.label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            wordBreak: 'break-word'
          }}
        >
          {row.value}
        </Typography>
        {row.isVip && (
          <Chip
            icon={<StarIcon />}
            label="VIP"
            color="warning"
            size="small"
            sx={{ 
              ml: 'auto',
              "& .MuiChip-label": {
                color: "warning.contrastText",
              }
            }}
          />
        )}
      </Box>
    </Box>
  );

  const renderTableRow = (group, rowIndex) => (
    <TableRow key={rowIndex}>
      {group.map((row, index) => (
        <React.Fragment key={index}>
          <TableCell
            sx={{
              borderBottom: "none !important",
              borderColor: "transparent !important",
              border: "none !important",
              borderLeft: "none !important",
              borderRight: "none !important",
              borderTop: "none !important",
              color: "primary.contrastText",
              fontWeight: 600,
              fontSize: "0.7875rem",
              opacity: 0.9,
              width: "15%",
              verticalAlign: "top",
              pt: rowIndex === 0 ? 2 : 1,
              pb: rowIndex === getGroupedRows().length - 1 ? 2 : 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {row.icon}
              {row.label}
            </Box>
          </TableCell>
          <TableCell
            sx={{
              borderBottom: "none !important",
              borderColor: "transparent !important",
              border: "none !important",
              borderLeft: "none !important",
              borderRight: "none !important",
              borderTop: "none !important",
              color: "primary.contrastText",
              fontWeight: 500,
              fontSize: "0.9rem",
              width: "35%",
              verticalAlign: "top",
              pt: rowIndex === 0 ? 2 : 1,
              pb: rowIndex === getGroupedRows().length - 1 ? 2 : 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {row.value}
              {row.isVip && (
                <Chip
                  icon={<StarIcon />}
                  label="VIP"
                  color="warning"
                  size="small"
                  sx={{ 
                    ml: 1,
                    "& .MuiChip-label": {
                      color: "warning.contrastText",
                    }
                  }}
                />
              )}
            </Box>
          </TableCell>
        </React.Fragment>
      ))}
      {group.length < getResponsiveColumns() && (
        Array.from({ length: getResponsiveColumns() - group.length }).map((_, index) => (
          <React.Fragment key={`empty-${index}`}>
            <TableCell sx={{ 
              borderBottom: "none !important", 
              borderColor: "transparent !important",
              border: "none !important",
              borderLeft: "none !important",
              borderRight: "none !important",
              borderTop: "none !important",
              width: "15%" 
            }} />
            <TableCell sx={{ 
              borderBottom: "none !important", 
              borderColor: "transparent !important",
              border: "none !important",
              borderLeft: "none !important",
              borderRight: "none !important",
              borderTop: "none !important",
              width: "35%" 
            }} />
          </React.Fragment>
        ))
      )}
    </TableRow>
  );

  return (
    <React.Fragment>
      <style>
        {`
          .patient-details-table .MuiTableCell-root {
            border: none !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: none !important;
            border-top: none !important;
            border-color: transparent !important;
          }
          .patient-details-table .MuiTableRow-root:hover {
            background-color: transparent !important;
          }
          .patient-details-table .MuiTable-root {
            border-collapse: separate !important;
            border-spacing: 0 !important;
          }
          .patient-details-table .MuiPaper-root {
            box-shadow: none !important;
            border: none !important;
          }
          .patient-details-table .MuiTableContainer-root {
            background-color: transparent !important;
          }
          .patient-details-table .MuiTableBody-root {
            background-color: transparent !important;
          }
          .patient-details-table .MuiTableBody-root .MuiTableRow-root {
            background-color: transparent !important;
          }
          .patient-details-table .MuiTableBody-root .MuiTableRow-root:hover {
            background-color: transparent !important;
          }
        `}
      </style>
      {handleFeedback()}
      {loading ? (
        <Skeleton
          variant="rounded"
          height={128}
          sx={{ mb: 2 }}
        />
      ) : null}
      {data ? (
        <>
          {/* Header with Download Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Patient Details
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Download Patient Details">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    // Simple download functionality
                    const patientData = {
                      name: `${data.first_name || ''} ${data.middle_name || ''} ${data.last_name || ''}`,
                      id: data.id,
                      age: getAge(data.date_of_birth),
                      gender: data.gender,
                      phone: data.phone,
                      email: data.email,
                      address: data.address,
                      occupation: data.occupation,
                      paymentMode: data.payment_mode?.name,
                      nationalId: data.national_id,
                      isVip: data.is_vip,
                      createdAt: data.created_at,
                    };
                    
                    const content = `PATIENT DETAILS REPORT
=====================

Name: ${patientData.name}
Patient ID: ${patientData.id}
Age: ${patientData.age}
Gender: ${patientData.gender}
Phone: ${patientData.phone}
Email: ${patientData.email || 'Not provided'}
Address: ${patientData.address || 'Not provided'}
Occupation: ${patientData.occupation || 'Not provided'}
Payment Mode: ${patientData.paymentMode || 'Not provided'}
National ID: ${patientData.nationalId || 'Not provided'}
VIP Status: ${patientData.isVip ? 'Yes' : 'No'}
Created: ${patientData.createdAt}

Generated on: ${new Date().toLocaleString()}
Generated by: Polyclinic HMS`;

                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `patient-details-${patientData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  sx={{ minWidth: 'auto' }}
                >
                  Download
                </Button>
              </Tooltip>
              <Tooltip title="Download Referral Letter">
                {referralData && referralData.length > 0 ? (
                  <ReferralPDF
                    referral={referralData[0]}
                    patient={data}
                    size="small"
                  />
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    disabled
                    startIcon={<DownloadIcon />}
                  >
                    No Referral
                  </Button>
                )}
              </Tooltip>
            </Box>
          </Box>
          {/* Mobile/Tablet View - Card Layout */}
          <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 2 }}>
            <Grid container spacing={2}>
              {getPatientInfoRows().map((row) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={row.label}
                >
                  {renderInfoCard(row)}
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Desktop View - Table Layout */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box
              className="patient-details-table"
              sx={{
                mb: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                width: "100%",
                border: "none",
                boxShadow: "none !important",
                "&:hover": {
                  boxShadow: "none !important",
                  backgroundColor: "primary.main !important"
                },
                "& .MuiTableContainer-root": {
                  "& .MuiTable-root": {
                    "& .MuiTableRow-root": {
                      "&:hover": {
                        backgroundColor: "transparent !important",
                      },
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "none !important",
                      borderColor: "transparent !important",
                      border: "none !important",
                      borderLeft: "none !important",
                      borderRight: "none !important",
                      borderTop: "none !important",
                    },
                  },
                },
              }}
            >
              <Box
                sx={{
                  "& .MuiTable-root": {
                    "& .MuiTableRow-root": {
                      "&:hover": {
                        backgroundColor: "transparent !important",
                      },
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "none !important",
                      borderColor: "transparent !important",
                      border: "none !important",
                      borderLeft: "none !important",
                      borderRight: "none !important",
                      borderTop: "none !important",
                    },
                  },
                }}
              >
                <Table
                  sx={{
                    "& .MuiTableRow-root": {
                      "&:hover": {
                        backgroundColor: "transparent !important",
                      },
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "none !important",
                      borderColor: "transparent !important",
                      border: "none !important",
                      borderLeft: "none !important",
                      borderRight: "none !important",
                      borderTop: "none !important",
                    },
                  }}
                >
                  <TableBody>
                    {getGroupedRows().map((group, rowIndex) => renderTableRow(group, rowIndex))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default PatientDetails;
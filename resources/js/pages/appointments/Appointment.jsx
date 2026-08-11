import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  LinearProgress,
  Typography,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import Navbar from "../../Navbar";
import Footer from "../../Footer";
import Form from "../../components/Form";
import TextField from "../../components/TextField";
import { usePost, useToast } from "../../hooks";
import { formatError, getValidationRules } from "../../helpers";

const validationRules = getValidationRules();

const Appointment = () => {
  const addToast = useToast();
  const formRef = useRef();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const { data, loading, error, handlePost } = usePost("api/appointments", formData);

  useEffect(() => {
    document.title = `Book Appointment - Polyclinic HMS`;
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message || "Appointment request submitted successfully!", severity: "success" });
      setSubmitted(true);
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        message: "",
      });
      if (formRef.current) {
        formRef.current.clear();
      }
    }
  }, [data, addToast]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", pt: { xs: '56px', sm: '64px', md: '70px' }, display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 }, mb: 0, flex: 1 }}>
        {/* Appointment Form - Centered */}
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Card 
            sx={{ 
              borderRadius: "16px", 
              boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              overflow: "hidden",
              border: "1px solid #e0e0e0",
              background: "white",
            }}
          >
            {loading && <LinearProgress sx={{ height: 3 }} />}
            <CardContent sx={{ p: { xs: 3, md: 4 }, color: '#333 !important' }}>
              {submitted && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: "12px",
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                    "& .MuiAlert-icon": {
                      fontSize: "1.5rem",
                      color: "#4caf50",
                    },
                    "& .MuiAlert-message": {
                      color: "#2e7d32",
                      fontWeight: 500,
                    },
                  }}
                >
                  Thank you! Your appointment request has been submitted successfully. 
                  We will contact you soon to confirm your appointment.
                </Alert>
              )}

              <Form ref={formRef}>
                <Grid container spacing={3}>
                    
                  {/* First Name */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="First"
                      fullWidth
                      required
                      value={formData.first_name}
                      onChange={(value) =>
                        setFormData({ ...formData, first_name: value })
                      }
                      containerProps={{
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                              borderWidth: "1.5px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A4A6B",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A4A6B",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputBase-input": {
                            py: 1.25,
                            fontSize: "0.95rem",
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Last Name */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Last"
                      fullWidth
                      required
                      value={formData.last_name}
                      onChange={(value) =>
                        setFormData({ ...formData, last_name: value })
                      }
                      containerProps={{
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                              borderWidth: "1.5px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A4A6B",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A4A6B",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputBase-input": {
                            py: 1.25,
                            fontSize: "0.95rem",
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      required
                      value={formData.phone}
                      onChange={(value) =>
                        setFormData({ ...formData, phone: value })
                      }
                      containerProps={{
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                              borderWidth: "1.5px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A4A6B",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A4A6B",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputBase-input": {
                            py: 1.25,
                            fontSize: "0.95rem",
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Additional Message */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Additional Message"
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Any additional information you'd like to share..."
                      value={formData.message}
                      onChange={(value) =>
                        setFormData({ ...formData, message: value })
                      }
                      containerProps={{
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            "& fieldset": {
                              borderColor: "#e0e0e0",
                              borderWidth: "1.5px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1A4A6B",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1A4A6B",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputBase-input": {
                            py: 1.5,
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{
                        bgcolor: "#FFC107", // Yellow button like in image
                        color: "#000",
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: "8px",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        boxShadow: "0 4px 15px rgba(255, 193, 7, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "#FFB300",
                          boxShadow: "0 6px 20px rgba(255, 193, 7, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        "&.Mui-disabled": {
                          bgcolor: "#FFC107",
                          opacity: 0.6,
                          color: "#000",
                        },
                      }}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Appointment;


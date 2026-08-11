import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as PersonAddIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import SelectClinic from "../../../components/SelectClinic";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getPrivileges, getPrivilegesForDepartment } from "../../../helpers";

const UserRegistration = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const clinicRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const usernameRef = useRef();
  const employeeNumberRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const designationRef = useRef();
  const departmentRef = useRef();
  const jobTitleRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();

  const { data: departments } = useFetch(
    "api/departments",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: jobTitles } = useFetch(
    "api/job-titles",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "error" });

  const steps = [
    { label: "Personal Info", icon: <PersonAddIcon /> },
    { label: "Employment", icon: <WorkIcon /> },
    { label: "Access & Security", icon: <SecurityIcon /> },
  ];

  const [formData, setFormData] = useState({
    clinic_id: undefined,
    first_name: undefined,
    middle_name: undefined,
    last_name: undefined,
    username: undefined,
    employee_number: undefined,
    gender: undefined,
    date_of_birth: null,
    designation: undefined,
    department_id: undefined,
    job_title_id: undefined,
    national_id: undefined,
    phone: undefined,
    password: undefined,
    role: "Client",
    privileges: [],
  });

  const { data, loading, error, handlePost } = usePost("api/users", {
    ...formData,
    date_of_birth: formData.date_of_birth
      ? formatDateForDb(formData.date_of_birth)
      : null,
  });

  useEffect(() => {
    document.title = `User Registration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });

      window.setTimeout(() => {
        navigate("/user-management/users");
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, label: "", color: "error" };
    }
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["error", "error", "warning", "info", "success"];
    
    return {
      score: (score / 5) * 100,
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)],
    };
  };

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, password: value });
    setPasswordStrength(checkPasswordStrength(value));
  };

  // Step navigation
  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Validate current step before proceeding
  const canProceed = () => {
    switch (activeStep) {
      case 0: // Personal Info
        return formData.first_name && formData.last_name && formData.gender;
      case 1: // Employment
        return formData.department_id && formData.job_title_id;
      case 2: // Access & Security
        return formData.username && formData.password;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  // Toggle all privileges in a category
  const toggleCategory = (category, checked) => {
    const categoryPrivileges = [category.value];
    if (category.children) {
      category.children.forEach(child => categoryPrivileges.push(child.value));
    }
    
    setFormData({
      ...formData,
      privileges: checked
        ? [...new Set([...formData.privileges, ...categoryPrivileges])]
        : formData.privileges.filter(p => !categoryPrivileges.includes(p)),
    });
  };

  const getPrivilegesTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "undefined" || e.show)
      .map((e) => {
        const hasChildren = e.children && e.children.length;
        const isChecked = formData.privileges.indexOf(e.value) !== -1;
        
        return (
          <Grid item xs={12} key={e.value}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: isChecked 
                  ? (theme) => alpha(theme.palette.primary.main, 0.04)
                  : "background.paper",
                borderColor: isChecked 
                  ? "primary.main"
                  : (theme) => theme.palette.divider,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                {/* Main category checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(event) => toggleCategory(e, event.target.checked)}
                      sx={{
                        "&.Mui-checked": {
                          color: "primary.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="subtitle2" fontWeight={600}>
                      {e.label}
                    </Typography>
                  }
                />
                
                {/* Sub-items in the same row */}
                {hasChildren && e.children.map(child => {
                  const childChecked = formData.privileges.indexOf(child.value) !== -1;
                  return (
                    <FormControlLabel
                      key={child.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={childChecked}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              privileges: event.target.checked
                                ? [...new Set([...formData.privileges, child.value])]
                                : formData.privileges.filter((f) => f !== child.value),
                            })
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          {child.label}
                        </Typography>
                      }
                      sx={{ ml: 0 }}
                    />
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        );
      });
  };

  const privilegeCount = formData.privileges.length;

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Employee Management" },
        { title: "New Employee" },
      ]}
    >
      <Card>
        <PageHeader 
          title="Register New Employee" 
          trailing={
            <Chip 
              icon={<PersonAddIcon />} 
              label="New Employee" 
              color="primary" 
              variant="outlined" 
            />
          }
        />
        <Divider />
        
        {/* Stepper */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          <Form ref={formRef}>
            {/* Step 1: Personal Information */}
            {activeStep === 0 && (
              <Card variant="outlined">
                <CardHeader
                  avatar={<PersonAddIcon color="primary" />}
                  title={
                    <Typography variant="subtitle1" fontWeight={600}>
                      Personal Information
                    </Typography>
                  }
                  subheader="Basic employee details"
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(0, 0, 0, 0.01)",
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {window.user.role === "Admin" && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          As an administrator, you can assign this employee to any branch.
                        </Alert>
                        <SelectClinic
                          ref={clinicRef}
                          required
                          onChange={(value) =>
                            setFormData({ ...formData, clinic_id: value?.id })
                          }
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        ref={firstNameRef}
                        label="First Name"
                        fullWidth
                        required
                        onChange={(value) =>
                          setFormData({ ...formData, first_name: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        ref={middleNameRef}
                        label="Middle Name"
                        fullWidth
                        onChange={(value) =>
                          setFormData({ ...formData, middle_name: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        ref={lastNameRef}
                        label="Last Name"
                        fullWidth
                        required
                        onChange={(value) =>
                          setFormData({ ...formData, last_name: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Select
                        ref={genderRef}
                        label="Gender"
                        fullWidth
                        required
                        options={["Male", "Female"]}
                        onChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DatePicker
                        ref={dateOfBirthRef}
                        label="Date of Birth"
                        fullWidth
                        value={formData.date_of_birth}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            date_of_birth: !isNaN(value) ? value : null,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        ref={phoneRef}
                        label="Phone Number"
                        fullWidth
                        onChange={(value) =>
                          setFormData({ ...formData, phone: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        ref={nationalIdRef}
                        label="National ID"
                        fullWidth
                        onChange={(value) =>
                          setFormData({ ...formData, national_id: value })
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Employment Details */}
            {activeStep === 1 && (
              <Card variant="outlined">
                <CardHeader
                  avatar={<WorkIcon color="primary" />}
                  title={
                    <Typography variant="subtitle1" fontWeight={600}>
                      Employment Details
                    </Typography>
                  }
                  subheader="Job role and department information"
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.02)"
                        : "rgba(0, 0, 0, 0.01)",
                  }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        ref={employeeNumberRef}
                        label="Employee Number"
                        fullWidth
                        helperText="Unique identifier for the employee"
                        onChange={(value) =>
                          setFormData({ ...formData, employee_number: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Select
                        ref={designationRef}
                        label="Designation"
                        fullWidth
                        options={["Doctor", "Other"]}
                        helperText="Select if employee is a doctor"
                        onChange={(value) =>
                          setFormData({ ...formData, designation: value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Select
                        ref={departmentRef}
                        label="Department"
                        fullWidth
                        required
                        options={departments}
                        optionsLabel="name"
                        optionsValue="id"
                        onChange={(value) => {
                          const dept = departments.find((d) => d.id === value);
                          const suggested = dept ? getPrivilegesForDepartment(dept.name) : [];
                          setFormData({
                            ...formData,
                            department_id: value,
                            // Auto-suggest privileges based on department (merge, don't overwrite existing choices)
                            privileges: [...new Set([...formData.privileges, ...suggested])],
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Select
                        ref={jobTitleRef}
                        label="Job Title"
                        fullWidth
                        required
                        options={jobTitles}
                        optionsLabel="name"
                        optionsValue="id"
                        onChange={(value) =>
                          setFormData({ ...formData, job_title_id: value })
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Access & Security */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                {/* Login Credentials */}
                <Card variant="outlined">
                  <CardHeader
                    avatar={<BadgeIcon color="primary" />}
                    title={
                      <Typography variant="subtitle1" fontWeight={600}>
                        Login Credentials
                      </Typography>
                    }
                    subheader="Username and password for system access"
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(0, 0, 0, 0.01)",
                    }}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          ref={usernameRef}
                          label="Username"
                          fullWidth
                          required
                          helperText="Used for logging into the system"
                          onChange={(value) =>
                            setFormData({ ...formData, username: value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          ref={passwordRef}
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          required
                          InputProps={{
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
                          onChange={handlePasswordChange}
                        />
                        {formData.password && (
                          <Box sx={{ mt: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={passwordStrength.score}
                                  color={passwordStrength.color}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                              <Chip
                                size="small"
                                label={passwordStrength.label}
                                color={passwordStrength.color}
                                sx={{ minWidth: 80 }}
                              />
                            </Stack>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Admin Role:</strong> Admins have full system access across all clinics/branches and can manage all settings.
                            <br />
                            <strong>Client Role:</strong> Standard employees with access based on assigned privileges below.
                          </Typography>
                        </Alert>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Select
                          label="Role"
                          fullWidth
                          required
                          value={formData.role}
                          options={[
                            { label: "Client (Standard)", value: "Client" },
                            { label: "Receptionist", value: "Receptionist" },
                            { label: "Cashier", value: "Cashier" },
                            { label: "Doctor", value: "Doctor" },
                            { label: "Examiner", value: "Optometrist" },
                            { label: "Dispenser", value: "Optician" },
                            { label: "Pharmacist", value: "Pharmacist" },
                            { label: "Sales Manager", value: "Sales Manager" },
                            { label: "Sales", value: "Sales" },
                            { label: "Storekeeper", value: "Storekeeper" },
                            { label: "Inventory Manager", value: "Inventory Manager" },
                            { label: "Accountant", value: "Accountant" },
                            { label: "Finance Manager", value: "Finance Manager" },
                            { label: "HR", value: "HR" },
                            { label: "Employee Manager", value: "Employee Manager" },
                            { label: "Marketing", value: "Marketing" },
                            { label: "Marketing Manager", value: "Marketing Manager" },
                            { label: "Director", value: "Director" },
                            { label: "Admin (Full Access)", value: "Admin" },
                          ]}
                          optionsLabel="label"
                          optionsValue="value"
                          onChange={(value) =>
                            setFormData({ ...formData, role: value })
                          }
                          helperText="Select the appropriate role for this employee. Admin users have access to all clinics and settings."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Access Privileges */}
                <Card variant="outlined">
                  <CardHeader
                    avatar={<SecurityIcon color="primary" />}
                    title={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Access Privileges
                        </Typography>
                        <Chip
                          size="small"
                          label={`${privilegeCount} selected`}
                          color={privilegeCount > 0 ? "primary" : "default"}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    subheader="Control which areas of the system this employee can access"
                    action={
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() => {
                            const allPrivs = [];
                            getPrivileges(window.user?.clinic?.preferences || [])
                              .filter(e => typeof e.show === "undefined" || e.show)
                              .forEach(e => {
                                allPrivs.push(e.value);
                                if (e.children) {
                                  e.children.forEach(c => allPrivs.push(c.value));
                                }
                              });
                            setFormData({ ...formData, privileges: allPrivs });
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => setFormData({ ...formData, privileges: [] })}
                        >
                          Clear All
                        </Button>
                      </Stack>
                    }
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(0, 0, 0, 0.01)",
                    }}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      {getPrivilegesTree(
                        getPrivileges(window.user?.clinic?.preferences || [])
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Form>
        </CardContent>

        <Divider />
        
        {/* Navigation Buttons */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          p={2}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          <Stack direction="row" spacing={2}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
              >
                {loading ? "Creating Employee..." : "Create Employee"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default UserRegistration;

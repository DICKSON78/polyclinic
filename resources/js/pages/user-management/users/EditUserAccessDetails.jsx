import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
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
  Switch,
  Typography,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { usePatch, useToast } from "../../../hooks";
import { formatError, getPrivileges } from "../../../helpers";

const EditUserAccessDetails = ({ item, modal, fetchUsers }) => {
  const addToast = useToast();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "error" });
  const [loading, setLoading] = useState(false);
  const [userPrivileges, setUserPrivileges] = useState([]);

  // Normalize privileges to always be an array
  const normalizePrivileges = (privileges) => {
    if (!privileges) return [];
    if (Array.isArray(privileges)) return privileges;
    if (typeof privileges === 'object') {
      // Handle database row format where each privilege is a column
      const privilegesArray = [];
      Object.keys(privileges).forEach(key => {
        if (privileges[key] === true || privileges[key] === 1 || privileges[key] === "1" || privileges[key] === "true") {
          privilegesArray.push(key);
        }
      });
      return privilegesArray;
    }
    return [];
  };

  // Get suggested privileges based on role
  const getPrivilegesForRole = (role) => {
    const rolePrivileges = {
      "Receptionist": ["dashboard", "reception", "receptionist_monthly_report"],
      "Cashier": ["dashboard", "payment_center", "cashier_monthly_report"],
      "Doctor": ["dashboard", "consultation_room", "optometrist_monthly_report", "optometry_report_card"],
      "Optometrist": ["dashboard", "consultation_room", "optometrist_monthly_report", "optometry_report_card"],
      "Optician": ["dashboard", "optician_center", "dispensing"],
      "Pharmacist": ["dashboard", "medicine_center", "dispensing"],
      "Sales Manager": ["dashboard", "sales_center", "sales_management", "sales_manager_monthly_report", "sales_report_card"],
      "Sales": ["dashboard", "sales_center", "sales_management", "sales_report_card"],
      "Storekeeper": ["dashboard", "inventory_management"],
      "Inventory Manager": ["dashboard", "inventory_management"],
      "Accountant": ["dashboard", "financial_management"],
      "Finance Manager": ["dashboard", "financial_management"],
      "HR": ["dashboard", "employee_management"],
      "Marketing": ["dashboard", "marketing", "marketing_operations_monthly_report", "office_calendar", "crm_reports"],
      "Marketing Manager": ["dashboard", "marketing", "marketing_operations_monthly_report", "office_calendar", "crm_reports"],
      "Director": ["dashboard", "director", "reception", "payment_center", "consultation_room", "optician_center", "medicine_center", "inventory_management", "financial_management", "employee_management", "marketing", "sales_center", "sales_management"],
      "Admin": [],
      "Client": [],
    };
    return rolePrivileges[role] || [];
  };

  // Get current privileges only (what user actually has)
  const getCurrentPrivileges = () => {
    const existingPrivileges = normalizePrivileges(item.privileges);
    console.log('DEBUG - Item data:', item);
    console.log('DEBUG - Raw privileges:', item.privileges);
    console.log('DEBUG - Normalized privileges:', existingPrivileges);
    return existingPrivileges;
  };

  // Get initial privileges - show only current privileges
  const getInitialPrivileges = () => {
    return getCurrentPrivileges();
  };

  const [formData, setFormData] = useState(() => {
    const initialPrivileges = normalizePrivileges(item.privileges);
    console.log('DEBUG - Initial state setup:', {
      username: item.username,
      rawPrivileges: item.privileges,
      initialPrivileges: initialPrivileges,
      privilegesType: typeof item.privileges
    });
    
    return {
      username: item.username,
      password: undefined,
      privileges: initialPrivileges,
      status: item.status,
      role: item.role || "Client",
    };
  });

  const [suggestedPrivileges, setSuggestedPrivileges] = useState([]);
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(false);

  const handleRoleChange = (newRole) => {
    let suggested = [];
    if (newRole === "Admin" || newRole === "Director") {
      const allPrivs = [];
      getPrivileges(window.user?.clinic?.preferences || [])
        .filter(e => typeof e.show === "undefined" || e.show)
        .forEach(e => {
          allPrivs.push(e.value);
          if (e.children) {
            e.children.forEach(c => allPrivs.push(c.value));
          }
        });
      suggested = allPrivs;
    } else {
      suggested = getPrivilegesForRole(newRole);
    }
    setFormData(prev => ({ ...prev, role: newRole }));
    setSuggestedPrivileges(suggested);
    setShowSuggestionBanner(true);
  };

  const applySuggestions = () => {
    setFormData(prev => ({ ...prev, privileges: [...new Set(suggestedPrivileges)] }));
    setShowSuggestionBanner(false);
  };

  const { data, patchLoading, patchError, handlePatch } = usePatch(
    `api/users/${item.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      
      // If updating current user's privileges, refresh window.user
      if (item.id && window.user && window.user.id === item.id) {
        if (window.axios) {
          window.axios.get('/api/auth/user')
            .then(response => {
              if (response.data && response.data.data) {
                window.user = response.data.data;
                window.location.reload();
              }
            })
            .catch(err => {
              console.error('Failed to refresh user data:', err);
            });
        }
      }
      
      window.setTimeout(() => {
        fetchUsers();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (patchError) {
      addToast({ message: formatError(patchError), severity: "error" });
    }
  }, [patchError]);

  // Fetch user privileges from API when component mounts
  useEffect(() => {
    if (item?.id) {
      setLoading(true);
      console.log('DEBUG - Fetching privileges for user ID:', item.id);
      
      if (window.axios) {
        window.axios.get(`/api/users/${item.id}`)
          .then(response => {
            const userData = response.data.data;
            console.log('DEBUG - API Response:', userData);
            console.log('DEBUG - API Privileges:', userData.privileges);
            
            const privileges = normalizePrivileges(userData.privileges);
            console.log('DEBUG - Normalized Privileges:', privileges);
            
            setUserPrivileges(privileges);
            setFormData(prev => ({ ...prev, privileges: privileges }));
            setLoading(false);
          })
          .catch(error => {
            console.error('DEBUG - API Error:', error);
            addToast({ message: "Failed to fetch user privileges", severity: "error" });
            setLoading(false);
          });
      }
    }
  }, [item?.id]);

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

  const handleSubmit = () => {
    if (!formData.username || formData.username.trim() === '') {
      addToast({ message: "Username is required", severity: "error" });
      return;
    }
    if (!formData.role) {
      addToast({ message: "Role is required", severity: "error" });
      return;
    }
    // Remove empty password before sending
    const payload = { ...formData };
    if (!payload.password || payload.password === '' || payload.password.length < 6) {
      delete payload.password;
    }
    payload.privileges = Array.isArray(userPrivileges) ? userPrivileges : [];
    handlePatch(null, payload);
  };

  // Toggle all privileges in a category
  const toggleCategory = (category, checked) => {
    const categoryPrivileges = [category.value];
    if (category.children) {
      category.children.forEach(child => categoryPrivileges.push(child.value));
    }
    
    const newPrivileges = checked
      ? [...new Set([...formData.privileges, ...categoryPrivileges])]
      : formData.privileges.filter(p => !categoryPrivileges.includes(p));
    
    // Update both states to keep them in sync
    setFormData({ ...formData, privileges: newPrivileges });
    setUserPrivileges(newPrivileges);
  };

  const getPrivilegesTree = (items) => {
    if (!items) return null;
    
    console.log('DEBUG - Rendering privileges tree:', {
      currentPrivileges: userPrivileges,
      itemsCount: items.length
    });

    return items
      .filter((e) => typeof e.show === "undefined" || e.show)
      .map((e) => {
        const hasChildren = e.children && e.children.length;
        const isChecked = userPrivileges.indexOf(e.value) !== -1;
        
        console.log('DEBUG - Checkbox state for ' + e.value + ':', {
          isChecked: isChecked,
          privilegeValue: e.value,
          currentPrivileges: userPrivileges,
          indexOf: userPrivileges.indexOf(e.value)
        });
        
        return (
          <Grid item xs={12} key={e.value}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: isChecked 
                  ? (theme) => alpha(theme.palette.success.main, 0.04)
                  : "background.paper",
                borderColor: isChecked 
                  ? "success.main"
                  : (theme) => theme.palette.divider,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "success.main",
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
                          color: "success.main",
                        },
                      }}
                      inputProps={{
                        'aria-label': `Toggle ${e.label} privileges`
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
                  const childChecked = userPrivileges.indexOf(child.value) !== -1;
                  return (
                    <FormControlLabel
                      key={child.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={childChecked}
                          onChange={(event) => {
                            const newPrivileges = event.target.checked
                              ? [...new Set([...formData.privileges, child.value])]
                              : formData.privileges.filter((f) => f !== child.value);
                            
                            // Update both states to keep them in sync
                            setFormData({ ...formData, privileges: newPrivileges });
                            setUserPrivileges(newPrivileges);
                          }}
                          inputProps={{
                            'aria-label': `Toggle ${child.label} privilege`
                          }}
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

  const privilegeCount = userPrivileges.length;

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      {patchLoading && <LinearProgress />}
      <CardContent sx={{ pt: 3 }}>
        <Box>
          {/* Account Status Alert */}
          <Alert 
            severity={formData.status === "Active" ? "success" : "warning"}
            icon={formData.status === "Active" ? <CheckCircleIcon /> : <CancelIcon />}
            sx={{ mb: 3 }}
          >
            This account is currently <strong>{formData.status}</strong>
          </Alert>

          {/* Role Suggestion Banner */}
          {showSuggestionBanner && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button size="small" variant="contained" disableElevation onClick={applySuggestions}>
                    Apply Suggestions
                  </Button>
                  <Button size="small" color="inherit" onClick={() => setShowSuggestionBanner(false)}>
                    Keep Current
                  </Button>
                </Stack>
              }
            >
              Role changed — apply suggested default privileges for this role, or keep current.
            </Alert>
          )}

          {/* Login Credentials Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              avatar={<LockResetIcon color="primary" />}
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
                    defaultValue={formData.username}
                    onChange={(value) =>
                      setFormData({ ...formData, username: value })
                    }
                    helperText="Used for logging into the system"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    ref={passwordRef}
                    label="New Password"
                    helperText="Leave blank to keep current password"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          sx={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
                          )}
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
                    value={formData.role || item.role || "Client"}
                    options={[
                      { label: "Admin (Full Access)", value: "Admin" },
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
                      { label: "Marketing", value: "Marketing" },
                      { label: "Marketing Manager", value: "Marketing Manager" },
                      { label: "Director", value: "Director" },
                    ]}
                    optionsLabel="label"
                    optionsValue="value"
                    onChange={(value) => handleRoleChange(value)}
                    helperText="Admin users have access to all clinics and settings"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Access Privileges Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              avatar={<SecurityIcon color="primary" />}
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Current Access Privileges
                  </Typography>
                  <Chip
                    size="small"
                    label={`${privilegeCount} currently assigned`}
                    color={privilegeCount > 0 ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>
              }
              subheader="Showing currently assigned privileges. Check/uncheck to modify access."
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
                      // Update both states to keep them in sync
                      setFormData({ ...formData, privileges: allPrivs });
                      setUserPrivileges(allPrivs);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => {
                      // Update both states to keep them in sync
                      setFormData({ ...formData, privileges: [] });
                      setUserPrivileges([]);
                    }}
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
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Current Status:</strong> Showing privileges currently assigned to {item?.username || 'this user'}. 
                  {privilegeCount === 0 && " This user has no privileges assigned."}
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                {getPrivilegesTree(
                  getPrivileges(window.user?.clinic?.preferences || [])
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Account Status Section */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Account Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive accounts cannot log in to the system
                  </Typography>
                </Box>
                <Switch
                  checked={formData.status === "Active"}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.checked ? "Active" : "Inactive",
                    })
                  }
                  color="success"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          size="large"
          color="inherit"
          onClick={() => modal.close()}
          disabled={loading || patchLoading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading || patchLoading}
        >
          {patchLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditUserAccessDetails;

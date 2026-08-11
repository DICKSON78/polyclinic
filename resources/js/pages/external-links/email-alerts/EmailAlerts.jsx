import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Button,
} from "@mui/material";
import {
  EmailRounded as EmailIcon,
  SaveRounded as SaveIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const EmailAlerts = () => {
  const addToast = useToast();

  const [settings, setSettings] = useState({
    email_alerts_enabled: false,
    smtp_host: "",
    smtp_port: "",
    smtp_username: "",
    smtp_password: "",
    smtp_encryption: "tls",
    from_email: "",
    from_name: "",
    appointment_notifications: false,
    patient_registration_notifications: false,
    consultation_reminders: false,
    prescription_ready_notifications: false,
    bill_reminders: false,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/external-links/email-alerts/settings",
    {},
    true,
    settings,
    (response) => response.data.data || settings
  );

  const { data: saveData, loading: saving, error: saveError, handlePatch } = usePatch();

  useEffect(() => {
    document.title = `Email Alerts Configuration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  useEffect(() => {
    if (saveError) {
      addToast({ message: formatError(saveError), severity: "error" });
    }
  }, [saveError, addToast]);

  useEffect(() => {
    if (saveData) {
      addToast({ message: saveData.message || "Email alerts settings saved successfully", severity: "success" });
    }
  }, [saveData, addToast]);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    handlePatch("api/external-links/email-alerts/settings", settings);
  };

  return (
    <Page
      title="Email Alerts Configuration"
      breadcrumbs={[
        { title: "Home" },
        { title: "External Links" },
        { title: "Email Alerts" },
      ]}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <PageHeader
              title="Email Alerts Configuration"
              trailing={
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  Save Settings
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                Configure email alert settings to enable automated email notifications for various events in the system.
              </Alert>

              <Grid container spacing={3}>
                {/* Enable/Disable Email Alerts */}
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email_alerts_enabled}
                          onChange={(e) => handleChange("email_alerts_enabled", e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Enable Email Alerts
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Turn on/off all email notifications
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                {settings.email_alerts_enabled && (
                  <>
                    {/* SMTP Configuration */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                        SMTP Configuration
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="SMTP Host"
                        fullWidth
                        value={settings.smtp_host}
                        onChange={(value) => handleChange("smtp_host", value)}
                        placeholder="smtp.gmail.com"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="SMTP Port"
                        fullWidth
                        value={settings.smtp_port}
                        onChange={(value) => handleChange("smtp_port", value)}
                        placeholder="587"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="SMTP Username"
                        fullWidth
                        value={settings.smtp_username}
                        onChange={(value) => handleChange("smtp_username", value)}
                        placeholder="your-email@gmail.com"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="SMTP Password"
                        fullWidth
                        type="password"
                        value={settings.smtp_password}
                        onChange={(value) => handleChange("smtp_password", value)}
                        placeholder="Enter SMTP password"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Select
                        label="SMTP Encryption"
                        fullWidth
                        options={[
                          { label: "TLS", value: "tls" },
                          { label: "SSL", value: "ssl" },
                          { label: "None", value: "none" },
                        ]}
                        value={settings.smtp_encryption}
                        onChange={(value) => handleChange("smtp_encryption", value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="From Email Address"
                        fullWidth
                        value={settings.from_email}
                        onChange={(value) => handleChange("from_email", value)}
                        placeholder="noreply@example.com"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="From Name"
                        fullWidth
                        value={settings.from_name}
                        onChange={(value) => handleChange("from_name", value)}
                        placeholder="Polyclinic HMS"
                      />
                    </Grid>

                    {/* Notification Types */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                        Notification Types
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.appointment_notifications}
                            onChange={(e) => handleChange("appointment_notifications", e.target.checked)}
                          />
                        }
                        label="Appointment Notifications"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send emails when appointments are scheduled or updated
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.patient_registration_notifications}
                            onChange={(e) => handleChange("patient_registration_notifications", e.target.checked)}
                          />
                        }
                        label="Patient Registration Notifications"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send emails when new patients register
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.consultation_reminders}
                            onChange={(e) => handleChange("consultation_reminders", e.target.checked)}
                          />
                        }
                        label="Consultation Reminders"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send reminder emails before scheduled consultations
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.prescription_ready_notifications}
                            onChange={(e) => handleChange("prescription_ready_notifications", e.target.checked)}
                          />
                        }
                        label="Prescription Ready Notifications"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send emails when prescriptions are ready
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.bill_reminders}
                            onChange={(e) => handleChange("bill_reminders", e.target.checked)}
                          />
                        }
                        label="Bill Reminders"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Send reminder emails for pending bills
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default EmailAlerts;


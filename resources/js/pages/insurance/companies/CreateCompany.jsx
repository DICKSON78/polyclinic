import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import SelectClinic from "../../../components/SelectClinic";

import { usePost, useToast } from "../../../hooks";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const CreateCompany = ({ modal, fetchCompanies }) => {
  const addToast = useToast();

  const formRef = useRef();
  const nameRef = useRef();
  const codeRef = useRef();
  const typeRef = useRef();
  const contactPersonRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();
  const statusRef = useRef();
  const clinicRef = useRef();

  const [clinicId, setClinicId] = useState();

  const [formData, setFormData] = useState({
    name: undefined,
    code: undefined,
    type: undefined,
    contact_person: undefined,
    phone: undefined,
    email: undefined,
    address: undefined,
    status: undefined,
  });

  const { data, loading, error, handlePost } = usePost("api/insurance-company", {
    ...formData,
    clinic_id: clinicId,
  });

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchCompanies();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <CardHeader
            title="Company Information"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={nameRef}
                  label="Company Name *"
                  fullWidth
                  required
                  rules={[validationRules.required]}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={codeRef}
                  label="Company Code"
                  fullWidth
                  onChange={(value) => setFormData({ ...formData, code: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  ref={typeRef}
                  label="Type *"
                  fullWidth
                  required
                  options={["Government", "Private"]}
                  onChange={(value) => setFormData({ ...formData, type: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  ref={statusRef}
                  label="Status *"
                  fullWidth
                  required
                  options={["Active", "Inactive"]}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardHeader
            title="Contact Details"
            titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={contactPersonRef}
                  label="Contact Person"
                  fullWidth
                  onChange={(value) => setFormData({ ...formData, contact_person: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={phoneRef}
                  label="Phone"
                  fullWidth
                  rules={[validationRules.optionalPhone]}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={emailRef}
                  label="Email"
                  fullWidth
                  rules={[validationRules.optionalEmail]}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={addressRef}
                  label="Address"
                  fullWidth
                  onChange={(value) => setFormData({ ...formData, address: value })}
                />
              </Grid>
              {window.user?.is_admin ? (
                <Grid size={{ xs: 12 }}>
                  <SelectClinic
                    ref={clinicRef}
                    onChange={(value) => setClinicId(value?.id)}
                  />
                </Grid>
              ) : null}
            </Grid>
          </CardContent>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => modal.close()}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? "Saving..." : "Save Company"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateCompany;

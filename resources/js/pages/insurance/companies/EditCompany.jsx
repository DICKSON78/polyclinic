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

import { usePatch, useToast } from "../../../hooks";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const EditCompany = ({ item, modal, fetchCompanies }) => {
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

  const [formData, setFormData] = useState({
    name: item.name,
    code: item.code || undefined,
    type: item.type || undefined,
    contact_person: item.contact_person || undefined,
    phone: item.phone || undefined,
    email: item.email || undefined,
    address: item.address || undefined,
    status: item.status || undefined,
  });

  const { data, loading, error, handlePatch } = usePatch(`api/insurance-company/${item.id}`, formData);

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
      handlePatch();
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
                  value={formData.name}
                  rules={[validationRules.required]}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={codeRef}
                  label="Company Code"
                  fullWidth
                  value={formData.code}
                  onChange={(value) => setFormData({ ...formData, code: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  ref={typeRef}
                  label="Type *"
                  fullWidth
                  required
                  value={formData.type}
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
                  value={formData.status}
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
                  value={formData.contact_person}
                  onChange={(value) => setFormData({ ...formData, contact_person: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={phoneRef}
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  rules={[validationRules.optionalPhone]}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={emailRef}
                  label="Email"
                  fullWidth
                  value={formData.email}
                  rules={[validationRules.optionalEmail]}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  ref={addressRef}
                  label="Address"
                  fullWidth
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                />
              </Grid>
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
          {loading ? "Saving..." : "Update Company"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditCompany;

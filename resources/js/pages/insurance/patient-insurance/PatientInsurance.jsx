import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";

import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Form from "../../../components/Form";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Table from "../../../components/Table";

import { useDelete, useFetch, usePost, usePatch, useToast } from "../../../hooks";
import { formatDate, formatDateForDb, formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const MembershipForm = ({ mode, item, patientId, modal, fetchMemberships }) => {
  const addToast = useToast();

  const formRef = useRef();
  const companyRef = useRef();
  const memberNumberRef = useRef();
  const cardNumberRef = useRef();
  const validFromRef = useRef();
  const validUntilRef = useRef();
  const statusRef = useRef();

  const [formData, setFormData] = useState({
    insurance_company_id: item?.insurance_company_id || undefined,
    member_number: item?.member_number || "",
    card_number: item?.card_number || "",
    valid_from: item?.valid_from ? new Date(item.valid_from) : null,
    valid_until: item?.valid_until ? new Date(item.valid_until) : null,
    status: item?.status || "Active",
  });

  const { data: companies, loading: loadingCompanies } = useFetch(
    "api/insurance-company",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => response?.data?.data?.data ?? []
  );

  const {
    data: postData,
    loading: saving,
    error: saveError,
    handlePost,
  } = usePost("api/patient-insurance");

  const {
    data: patchData,
    loading: patching,
    error: patchError,
    handlePatch,
  } = usePatch(`api/patient-insurance/${item?.id || 0}`);

  useEffect(() => {
    if (postData || patchData) {
      addToast({ message: (postData || patchData).message, severity: "success" });
      window.setTimeout(() => {
        fetchMemberships();
        modal.close();
      }, 1000);
    }
  }, [postData, patchData]);

  useEffect(() => {
    if (saveError) addToast({ message: formatError(saveError), severity: "error" });
  }, [saveError]);

  useEffect(() => {
    if (patchError) addToast({ message: formatError(patchError), severity: "error" });
  }, [patchError]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      const payload = {
        patient_id: patientId,
        insurance_company_id: formData.insurance_company_id,
        member_number: formData.member_number || undefined,
        card_number: formData.card_number || undefined,
        valid_from: formData.valid_from ? formatDateForDb(formData.valid_from) : undefined,
        valid_until: formData.valid_until ? formatDateForDb(formData.valid_until) : undefined,
        status: formData.status,
      };

      if (mode === "edit") {
        handlePatch(`api/patient-insurance/${item.id}`, payload);
      } else {
        handlePost("api/patient-insurance", payload);
      }
    }
  };

  return (
    <React.Fragment>
      {(saving || patching) && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12 }}>
              <Select
                ref={companyRef}
                label="Insurance Company *"
                fullWidth
                required
                optionsLabel="name"
                optionsValue="id"
                loading={loadingCompanies}
                options={companies || []}
                value={formData.insurance_company_id}
                onChange={(value) => setFormData({ ...formData, insurance_company_id: value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                ref={memberNumberRef}
                label="Member Number"
                fullWidth
                value={formData.member_number}
                onChange={(value) => setFormData({ ...formData, member_number: value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                ref={cardNumberRef}
                label="Card Number"
                fullWidth
                value={formData.card_number}
                onChange={(value) => setFormData({ ...formData, card_number: value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                ref={validFromRef}
                label="Valid From"
                fullWidth
                value={formData.valid_from}
                onChange={(value) => setFormData({ ...formData, valid_from: value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                ref={validUntilRef}
                label="Valid Until"
                fullWidth
                value={formData.valid_until}
                onChange={(value) => setFormData({ ...formData, valid_until: value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                ref={statusRef}
                label="Status"
                fullWidth
                required
                options={["Active", "Inactive"]}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          disabled={saving || patching}
          onClick={handleSubmit}
        >
          {saving || patching ? "Saving..." : mode === "edit" ? "Update" : "Add Membership"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const PatientInsurance = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [patientId, setPatientId] = useState();
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);

  const { data: patients, loading: loadingPatients } = useFetch(
    "api/patients",
    { per_page: 200 },
    true,
    [],
    (response) => {
      const raw = response?.data?.data;
      return Array.isArray(raw) ? raw : (raw?.data ?? []);
    }
  );

  const { data: deleteData, loading: deleting, error: deleteError, handleDelete } = useDelete("api/patient-insurance");

  useEffect(() => {
    document.title = `Patient Insurance - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setMemberships([]);
    setLoadingMemberships(!!patientId);
    if (!patientId) return;

    window.axios
      .get(`/api/patient-insurance/patients/${patientId}`)
      .then((response) => {
        const raw = response?.data?.data;
        setMemberships(Array.isArray(raw) ? raw : []);
      })
      .catch((e) => addToast({ message: formatError(e), severity: "error" }))
      .finally(() => setLoadingMemberships(false));
  }, [patientId]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      if (patientId) {
        window.axios
          .get(`/api/patient-insurance/patients/${patientId}`)
          .then((response) => {
            const raw = response?.data?.data;
            setMemberships(Array.isArray(raw) ? raw : []);
          })
          .catch(() => {});
      }
    }
  }, [deleteData]);

  useEffect(() => {
    if (deleteError) addToast({ message: formatError(deleteError), severity: "error" });
  }, [deleteError]);

  const fetchMemberships = () => {
    if (!patientId) return;
    window.axios
      .get(`/api/patient-insurance/patients/${patientId}`)
      .then((response) => {
        const raw = response?.data?.data;
        setMemberships(Array.isArray(raw) ? raw : []);
      })
      .catch((e) => addToast({ message: formatError(e), severity: "error" }));
  };

  const openAddForm = () => {
    modalRef.current.open(
      "Add Insurance Membership",
      <MembershipForm
        mode="add"
        patientId={patientId}
        modal={modalRef.current}
        fetchMemberships={fetchMemberships}
      />,
      "md"
    );
  };

  const openEditForm = (item) => {
    modalRef.current.open(
      "Edit Insurance Membership",
      <MembershipForm
        mode="edit"
        item={item}
        patientId={patientId}
        modal={modalRef.current}
        fetchMemberships={fetchMemberships}
      />,
      "md"
    );
  };

  const confirmDelete = (item) => {
    modalRef.current.open(
      "Delete Membership",
      <ConfirmationDialog
        message={`Are you sure you want to remove this ${item.insurance_company?.name || "insurance"} membership?`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/patient-insurance/${item.id}`);
        }}
      />,
      "sm"
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Patient Insurance" },
      ]}
    >
      <Card>
        <PageHeader
          title="Patient Insurance"
          subtitle="Manage patients' insurance memberships"
          trailing={
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              disabled={!patientId}
              onClick={openAddForm}
            >
              Add Membership
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                label="Patient *"
                fullWidth
                required
                optionsLabel="full_name"
                optionsValue="id"
                placeholder="Search patient..."
                loading={loadingPatients}
                options={patients || []}
                value={patientId}
                onChange={(value) => setPatientId(value)}
              />
            </Grid>
          </Grid>

          {!patientId ? (
            <Typography color="text.secondary" align="center" py={6}>
              Select a patient to view their insurance memberships.
            </Typography>
          ) : (
            <Table
              loading={loadingMemberships}
              columns={[
                {
                  field: "insurance_company",
                  headerName: "Insurance Company",
                  valueGetter: (item) => item.insurance_company?.name || "-",
                },
                {
                  field: "member_number",
                  headerName: "Member Number",
                  valueGetter: (item) => item.member_number || "-",
                },
                {
                  field: "card_number",
                  headerName: "Card Number",
                  valueGetter: (item) => item.card_number || "-",
                  hideOnMobile: true,
                },
                {
                  field: "valid_from",
                  headerName: "Valid From",
                  valueGetter: (item) => (item.valid_from ? formatDate(item.valid_from) : "-"),
                  hideOnMobile: true,
                },
                {
                  field: "valid_until",
                  headerName: "Valid Until",
                  valueGetter: (item) => (item.valid_until ? formatDate(item.valid_until) : "-"),
                  hideOnMobile: true,
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item) => (
                    <Chip
                      size="small"
                      color={item.status === "Active" ? "success" : "default"}
                      label={item.status || "-"}
                    />
                  ),
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  renderCell: (item) => (
                    <Stack
                      direction="row"
                      spacing={1}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditForm(item)}
                        >
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleting}
                          onClick={() => confirmDelete(item)}
                        >
                          <DeleteRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ),
                },
              ]}
              items={memberships}
              noItemsOverlayMessage="No insurance memberships found for this patient."
            />
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientInsurance;

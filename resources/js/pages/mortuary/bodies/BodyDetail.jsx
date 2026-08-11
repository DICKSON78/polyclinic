import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  LogoutRounded as ReleaseIcon,
  DescriptionRounded as CertificateIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

const STATUS_COLORS = {
  "In-Storage": "info",
  Transferred: "warning",
  Released: "success",
  Cremated: "secondary",
};

const RELEASE_STATUSES = ["Released", "Cremated", "Transferred"];

const ReleaseForm = ({ item, modal, fetchItem }) => {
  const addToast = useToast();
  const formRef = useRef();

  const [status, setStatus] = useState("Released");
  const [receivedByName, setReceivedByName] = useState(item?.received_by_name || "");
  const [receivedByPhone, setReceivedByPhone] = useState(item?.received_by_phone || "");
  const [notes, setNotes] = useState("");

  const { data, loading, error, handlePost } = usePost(
    `api/mortuary/bodies/${item.id}/release`
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchItem();
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
      handlePost(null, {
        status,
        received_by_name: receivedByName,
        received_by_phone: receivedByPhone,
        notes,
      });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Select
                label="Action *"
                fullWidth
                required
                value={status}
                onChange={setStatus}
                options={RELEASE_STATUSES}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Received By Name"
                fullWidth
                value={receivedByName}
                onChange={setReceivedByName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Received By Phone"
                fullWidth
                value={receivedByPhone}
                onChange={setReceivedByPhone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={2}
                value={notes}
                onChange={setNotes}
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={() => modal.close()}>
          Cancel
        </Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {loading ? "Releasing..." : "Confirm"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const BodyDetail = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { bodyId } = useParams();

  usePrivilege('wards', '/dashboard');

  const modalRef = useRef();

  const {
    data: item,
    loading,
    error,
    handleFetch: fetchItem,
  } = useFetch(
    `api/mortuary/bodies/${bodyId}`,
    null,
    true,
    null,
    (response) => response.data?.data
  );

  useEffect(() => {
    document.title = `Mortuary Body ${item?.body_no || ""} - ${window.APP_NAME}`;
  }, [item]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const canRelease = item && item.status === "In-Storage";
  const hasCertificate = item?.certificate;

  const openRelease = () => {
    modalRef.current.open(
      `Release Body ${item.body_no}`,
      <ReleaseForm item={item} modal={modalRef.current} fetchItem={fetchItem} />,
      "sm"
    );
  };

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Mortuary" }, { title: "Bodies" }, { title: item?.body_no || "Detail" }]}
    >
      <Card>
        <PageHeader
          title={item?.body_no || "Mortuary Body"}
          subtitle={item?.deceased_name || "Body record"}
          leading={
            <IconButton onClick={() => navigate("/mortuary/bodies")}>
              <BackIcon />
            </IconButton>
          }
          trailing={
            item ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {canRelease ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ReleaseIcon />}
                    onClick={openRelease}
                  >
                    Release / Transfer
                  </Button>
                ) : null}
                {!hasCertificate && canRelease ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CertificateIcon />}
                    onClick={() => navigate(`/mortuary/certificates?new=1&body=${item.id}`)}
                  >
                    Create Certificate
                  </Button>
                ) : null}
                {hasCertificate ? (
                  <Chip
                    size="small"
                    color={hasCertificate.status === "Issued" ? "success" : "warning"}
                    label={`Certificate: ${hasCertificate.certificate_no}`}
                  />
                ) : null}
                <Chip
                  size="small"
                  color={STATUS_COLORS[item.status] || "default"}
                  label={item.status || "-"}
                />
              </Stack>
            ) : null
          }
        />
        <Divider />
        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : !item ? (
          <Stack alignItems="center" py={6}>
            <Typography color="text.secondary">Body record not found.</Typography>
          </Stack>
        ) : (
          <CardContent>
            <Descriptions
              columns={3}
              items={[
                { label: "Deceased Name", value: item.deceased_name || "-" },
                { label: "Gender", value: item.gender || "-" },
                { label: "Age", value: item.age || "-" },
                { label: "Patient Record", value: item.patient?.full_name || "-" },
                { label: "Date of Death", value: item.date_of_death || "-" },
                { label: "Cause of Death", value: item.cause_of_death || "-" },
                { label: "Storage Location", value: item.storage_location || "-" },
                { label: "Admitted At", value: item.admitted_at || "-" },
                { label: "Admitted By", value: item.admittedBy?.full_name || "-" },
                { label: "Released At", value: item.released_at || "-" },
                { label: "Received By", value: item.received_by_name || "-" },
                { label: "Received Phone", value: item.received_by_phone || "-" },
                { label: "Notes", value: item.notes || "-" },
              ]}
            />
          </CardContent>
        )}
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default BodyDetail;

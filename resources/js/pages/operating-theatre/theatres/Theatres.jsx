import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  RefreshRounded as RefreshIcon,
  MeetingRoomRounded as TheatreIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import Form from "../../../components/Form";

import { useDelete, useFetch, usePatch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError, getValidationRules } from "../../../helpers";

const validationRules = getValidationRules();

const STATUS_COLORS = {
  Active: "success",
  Inactive: "default",
  Maintenance: "warning",
};

const TheatreForm = ({ existing, modal, handleSaved }) => {
  const addToast = useToast();
  const formRef = useRef();
  const nameRef = useRef();
  const locationRef = useRef();
  const equipmentRef = useRef();
  const statusRef = useRef();
  const notesRef = useRef();

  const [name, setName] = useState(existing?.name || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [equipmentNotes, setEquipmentNotes] = useState(existing?.equipment_notes || "");
  const [status, setStatus] = useState(existing?.status || "Active");
  const [notes, setNotes] = useState(existing?.notes || "");

  const isEdit = Boolean(existing);
  const { data, loading, error, handlePost } = usePost("api/operating-theatre/theatres");
  const { data: patchData, loading: patchLoading, error: patchError, handlePatch } = usePatch("api/operating-theatre/theatres");

  useEffect(() => {
    if (data || patchData) {
      addToast({ message: (data || patchData).message, severity: "success" });
      window.setTimeout(() => {
        handleSaved();
        modal.close();
      }, 800);
    }
  }, [data, patchData]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (patchError) {
      addToast({ message: formatError(patchError), severity: "error" });
    }
  }, [patchError]);

  const saving = loading || patchLoading;

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      const payload = {
        name,
        location: location || undefined,
        equipment_notes: equipmentNotes || undefined,
        status,
        notes: notes || undefined,
      };
      if (isEdit) {
        handlePatch(`api/operating-theatre/theatres/${existing.id}`, payload);
      } else {
        handlePost("api/operating-theatre/theatres", payload);
      }
    }
  };

  return (
    <React.Fragment>
      {saving && <LinearProgress />}
      <CardContent sx={{ p: 0 }}>
        <Form ref={formRef}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                ref={nameRef}
                label="Theatre Name *"
                fullWidth
                required
                value={name}
                rules={[validationRules.required]}
                onChange={(value) => setName(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                ref={locationRef}
                label="Location"
                fullWidth
                value={location}
                onChange={(value) => setLocation(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                ref={equipmentRef}
                label="Equipment / Notes"
                fullWidth
                value={equipmentNotes}
                onChange={(value) => setEquipmentNotes(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                ref={statusRef}
                label="Status *"
                fullWidth
                required
                options={["Active", "Inactive", "Maintenance"]}
                value={status}
                onChange={(value) => setStatus(value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                ref={notesRef}
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={notes}
                onChange={(value) => setNotes(value)}
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
        <Button variant="contained" disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving..." : isEdit ? "Update Theatre" : "Add Theatre"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

const Theatres = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  usePrivilege('wards', '/dashboard');

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/operating-theatre/theatres",
    { ...params },
    true,
    { data: [], total: 0 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
      };
    }
  );

  const { data: deleteData, error: deleteError, handleDelete } = useDelete("api/operating-theatre/theatres");

  useEffect(() => {
    document.title = `Theatres - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      handleFetch();
    }
  }, [deleteData]);

  const openCreate = () => {
    modalRef.current.open(
      "Add Theatre",
      <TheatreForm modal={modalRef.current} handleSaved={handleFetch} />,
      "sm"
    );
  };

  const openEdit = (theatre) => {
    modalRef.current.open(
      "Edit Theatre",
      <TheatreForm existing={theatre} modal={modalRef.current} handleSaved={handleFetch} />,
      "sm"
    );
  };

  const confirmDelete = (theatre) => {
    modalRef.current.open(
      "Delete Theatre",
      <ConfirmationDialog
        message={`Delete "${theatre.name}"? This cannot be undone.`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/operating-theatre/theatres/${theatre.id}`);
        }}
      />,
      "sm"
    );
  };

  const statusOptions = ["Active", "Inactive", "Maintenance"];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Operating Theatre" }, { title: "Theatres" }]}
    >
      <Card>
        <PageHeader
          title="Operating Theatres"
          subtitle="Manage surgical theatres"
          trailing={
            <React.Fragment>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
              >
                Add Theatre
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
            <SearchTextField
              placeholder="Search theatres..."
              onChange={(value) => setParams({ ...params, q: value || undefined, page: 1 })}
            />
            <Select
              label="Status"
              sx={{ minWidth: 180 }}
              clearable
              options={statusOptions}
              value={params.status}
              onChange={(value) => setParams({ ...params, status: value || undefined, page: 1 })}
            />
          </Stack>
          <Table
            loading={loading}
            columns={[
              {
                field: "name",
                headerName: "Theatre",
                renderCell: (item) => (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TheatreIcon fontSize="small" color="action" />
                    <Typography variant="body2">{item.name}</Typography>
                  </Stack>
                ),
              },
              {
                field: "location",
                headerName: "Location",
                valueGetter: (item) => item.location || "-",
                hideOnMobile: true,
              },
              {
                field: "equipment_notes",
                headerName: "Equipment",
                valueGetter: (item) => item.equipment_notes || "-",
                hideOnMobile: true,
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={STATUS_COLORS[item.status] || "default"}
                    label={item.status || "-"}
                  />
                ),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" spacing={0}>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" onClick={() => openEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton size="small" color="error" onClick={() => confirmDelete(item)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ),
              },
            ]}
            items={Array.isArray(data.data) ? data.data : []}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Theatres;

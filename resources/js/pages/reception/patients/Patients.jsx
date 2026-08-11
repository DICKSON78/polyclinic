import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import LocalHospitalIcon from "@mui/icons-material/LocalHospitalRounded";
import ReceiptIcon from "@mui/icons-material/ReceiptRounded";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceRounded";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import BusinessIcon from "@mui/icons-material/BusinessRounded";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismRounded";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLongRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import EditPatient from "./EditPatient";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getAge } from "../../../helpers";
import moment from "moment";

const Patients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuPatient, setActionMenuPatient] = useState(null);

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    id: undefined,
    name: undefined,
    phone: undefined,
    gender: undefined,
    payment_mode_id: undefined,
    client_type: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patients",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      // Handle paginated response from Laravel
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        page: paginatedData.current_page || paginatedData.page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  useEffect(() => {
    document.title = `Client Lists - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleNewPatientClick = () => {
    navigate("/reception/register-new-client");
  };

  const openEditPatientModal = (item) => {
    let component = (
      <EditPatient
        item={item}
        modal={modalRef.current}
        fetchPatients={handleFetch}
      />
    );

    modalRef.current.open("Edit Patient", component, "md");
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(item);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  const handleActionMenuOpen = (event, patient) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuPatient(patient);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuPatient(null);
  };


  const handleCreateBill = (patient) => {
    navigate(`/reception/patients/${patient.id}/check-in`, {
      state: { createBill: true }
    });
  };

  const handleViewRecord = (patient) => {
    navigate(`/reception/patients/${patient.id}/records/patient-file`);
  };

  const handleCreateInvoice = (patient) => {
    navigate(`/reception/patients/${patient.id}/check-in`, {
      state: { createInvoice: true }
    });
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Client Lists" },
      ]}
    >
      <Card
        sx={{
          boxShadow: 2,
        }}
      >
        <PageHeader
          title="Clients"
          trailing={
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ 
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-end" }
              }}
            >
              <Tooltip title="Refresh List">
                <IconButton
                  onClick={handleFetch}
                  disabled={loading}
                  size="medium"
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewPatientClick}
                size="medium"
                sx={{
                  minWidth: { xs: 'auto', sm: 140 },
                  px: { xs: 2, sm: 3 },
                }}
              >
                {isMobile ? 'New' : 'New Patient'}
              </Button>
            </Stack>
          }
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        />
        <Divider />
        <CardContent 
          sx={{ 
            px: { xs: 2, sm: 3 }, 
            py: { xs: 2, sm: 3 },
            '&:last-child': {
              pb: { xs: 2, sm: 3 },
            }
          }}
        >
          <Filters
            params={params}
            setParams={setParams}
            sx={{ 
              mb: 3,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
                minWidth: { xs: 50, sm: 60 },
                width: { xs: 50, sm: 60 },
              },
              {
                field: "full_name",
                headerName: "Client Name",
                valueGetter: (item) => item.full_name,
                minWidth: { xs: 140, sm: 180 },
                flex: 1,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) => getAge(item.date_of_birth),
                minWidth: { xs: 60, sm: 70 },
                width: { xs: 60, sm: 70 },
              },
              {
                field: "phone",
                headerName: "Phone",
                minWidth: { xs: 100, sm: 120 },
                width: { xs: 100, sm: 120 },
              },
              {
                field: "client_type",
                headerName: "Client Type",
                minWidth: { xs: 100, sm: 140 },
                hideOnMobile: true,
                renderCell: (item) => {
                  const types = [];
                  if (item.is_vip === true) {
                    types.push(
                      <Chip
                        key="vip"
                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                        label="VIP"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                          bgcolor: '#FFD700',
                          color: '#000',
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            fontSize: 14,
                            color: '#000',
                          }
                        }}
                      />
                    );
                  }
                  if (item.is_businessperson === true) {
                    types.push(
                      <Chip
                        key="business"
                        icon={<BusinessIcon sx={{ fontSize: 14 }} />}
                        label="Business"
                        color="info"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                          '& .MuiChip-icon': {
                            fontSize: 14,
                          }
                        }}
                      />
                    );
                  }
                  if (item.is_student) {
                    types.push(
                      <Chip
                        key="student"
                        label="Student"
                        color="secondary"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                        }}
                      />
                    );
                  }
                  if (item.is_outreach) {
                    types.push(
                      <Chip
                        key="outreach"
                        icon={<VolunteerActivismIcon sx={{ fontSize: 14 }} />}
                        label="Outreach"
                        color="success"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                          '& .MuiChip-icon': {
                            fontSize: 14,
                          }
                        }}
                      />
                    );
                  }
                  if (item.is_employee) {
                    types.push(
                      <Chip
                        key="employee"
                        label="VIP"
                        color="primary"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                        }}
                      />
                    );
                  }
                  if (item.is_prestige === true) {
                    types.push(
                      <Chip
                        key="prestige"
                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                        label="Prestige Client"
                        size="small"
                        sx={{ 
                          mr: 0.5,
                          mb: 0.5,
                          height: 22,
                          fontSize: '0.65rem',
                          '& .MuiChip-icon': {
                            fontSize: 14,
                          }
                        }}
                      />
                    );
                  }
                  return types.length > 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        alignItems: 'center',
                        py: 0.5,
                      }}
                    >
                      {types}
                    </Box>
                  ) : (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}
                    >
                      Regular
                    </Typography>
                  );
                },
              },
              {
                field: "gender",
                headerName: "Gender",
                minWidth: { xs: 70, sm: 80 },
                width: { xs: 70, sm: 80 },
                hideOnMobile: true,
              },
              {
                field: "email",
                headerName: "Email",
                valueGetter: (item, index) => item.email || "Not provided",
                minWidth: { xs: 150, sm: 180 },
                hideOnMobile: true,
              },
              {
                field: "payment_mode_id",
                headerName: "Payment Mode",
                valueGetter: (item, index) => item.payment_mode?.name || "Not set",
                minWidth: { xs: 120, sm: 140 },
                hideOnMobile: true,
              },
              {
                field: "created_at",
                headerName: "Date Created",
                valueGetter: (item) => {
                  if (!item.created_at) return "Not available";
                  try {
                    return moment(item.created_at).format('DD/MM/YYYY');
                  } catch (e) {
                    return "Not available";
                  }
                },
                minWidth: { xs: 100, sm: 120 },
                width: { xs: 100, sm: 120 },
                hideOnMobile: true,
              },
              {
                field: "actions",
                headerName: "Actions",
                minWidth: { xs: 160, sm: 200 },
                width: { xs: 160, sm: 200 },
                align: 'right',
                headerAlign: 'right',
                hideOnMobile: false,
                show: true,
                fixed: true,
                renderCell: (item) => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                      gap: { xs: 0.5, sm: 1 },
                      width: '100%',
                      minWidth: { xs: 160, sm: 200 },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(`/reception/patients/${item.id}/check-in`)
                      }
                      sx={{
                        minWidth: { xs: 90, sm: 120 },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 0.75 },
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Check-In
                    </Button>
                    <Tooltip title="More Actions" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, item)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                          color: 'text.primary',
                          minWidth: { xs: 36, sm: 40 },
                          minHeight: { xs: 36, sm: 40 },
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          flexShrink: 0,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            transform: 'scale(1.05)',
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: '1.3rem', sm: '1.5rem' },
                          }
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ),
              },
            ]}
            items={data.data}
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
      
      {/* Action Menu for additional actions */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: 3,
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (actionMenuPatient) {
              openEditPatientModal(actionMenuPatient);
            }
            handleActionMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Edit Client
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuPatient) {
              handleCreateInvoice(actionMenuPatient);
            }
            handleActionMenuClose();
          }}
        >
          <ReceiptLongIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Create Invoice
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuPatient) {
              handleCreateBill(actionMenuPatient);
            }
            handleActionMenuClose();
          }}
        >
          <AccountBalanceIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Create Bill
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuPatient) {
              handleViewRecord(actionMenuPatient);
            }
            handleActionMenuClose();
          }}
        >
          <VisibilityIcon sx={{ mr: 1.5, fontSize: 20 }} />
          View Record
        </MenuItem>
      </Menu>
      
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Patients;
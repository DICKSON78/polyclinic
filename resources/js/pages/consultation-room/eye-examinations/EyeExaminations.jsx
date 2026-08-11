import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const EyeExaminations = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch consultations with eye examination data
  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      per_page: 50,
      with_items: "Yes",
    },
    true,
    [],
    (response) => {
      // Safely extract list of consultations (no over-filtering to avoid empty lists)
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data;
      return Array.isArray(list) ? list : [];
    }
  );

  // CRUD disabled on this list; edits happen in consultation context

  useEffect(() => {
    document.title = `Examinations - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleFetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    handleFetch();
  };

  const handleCreateNew = () => navigate('/consultation-room/consultation-patients/pending');

  const handleView = (consultation) => {
    const patientId = consultation.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && consultation.id) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${consultation.id}/clinical-notes`);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <Page
      title="Examinations"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Examinations" },
      ]}
    >
      <Card>
        <CardHeader
          title="Examinations"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ fontSize: '0.7875rem' }}
            >
              New Examination
            </Button>
          }
        />
        <CardContent>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search examinations..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFetch}
                size="small"
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Examinations Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
              <TableCell>Examination Summary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading examinations...
                    </TableCell>
                  </TableRow>
                ) : !data || !Array.isArray(data) || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No examinations found
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(data) ? data : []).map((examination) => (
                    <TableRow key={examination.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {examination.patient?.full_name || examination.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || "Unknown Patient"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                      <Typography variant="body2" fontWeight="medium">
                            {examination.examination_type || 'Examination'}
                          </Typography>
                          {Array.isArray(examination.items) && examination.items.length > 0 ? (
                            examination.items
                              .slice(0, 3)
                              .map((item, index) => (
                                <Typography key={index} variant="caption" display="block">
                                  {item?.item?.name || 'Examination Item'}{item?.quantity ? ` - ${item.quantity}` : ''}
                        </Typography>
                              ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">No items</Typography>
                          )}
                          {Array.isArray(examination.items) && examination.items.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                              +{examination.items.length - 3} more
                        </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(examination.status)}
                          color={getStatusColor(examination.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(examination.created_at || examination.consultation?.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(examination)}
                            title="View Details"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </Page>
  );
};

export default EyeExaminations;

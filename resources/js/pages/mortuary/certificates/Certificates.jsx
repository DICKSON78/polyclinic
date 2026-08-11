import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  VerifiedRounded as IssueIcon,
  BlockRounded as VoidIcon,
  RefreshRounded as RefreshIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";

import { useFetch, usePost, useToast } from "../../../hooks";
import usePrivilege from "../../../hooks/usePrivilege";
import { formatError } from "../../../helpers";

import CertificateForm from "./CertificateForm";

const STATUS_COLORS = {
  Draft: "warning",
  Issued: "success",
  Void: "error",
};

const Certificates = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  usePrivilege('wards', '/dashboard');

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: searchParams.get("status") || undefined,
    q: undefined,
  });
  const [searchText, setSearchText] = useState("");

  const { data, loading, error, handleFetch } = useFetch(
    "api/mortuary/certificates",
    params,
    true,
    { data: [], total: 0, current_page: 1, per_page: 25 },
    (response) => {
      const paginatedData = response.data?.data || response.data || {};
      return {
        data: paginatedData.data || [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        per_page: paginatedData.per_page || 25,
      };
    }
  );

  const { data: issueData, handlePost: postIssue } = usePost();
  const { data: voidData, handlePost: postVoid } = usePost();

  useEffect(() => {
    document.title = `Death Certificates - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openForm(searchParams.get("body") ? { body_id: searchParams.get("body") } : null);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = (item) => {
    modalRef.current.open(
      item?.certificate_no ? `Edit Certificate ${item.certificate_no}` : "New Death Certificate",
      <CertificateForm item={item} modal={modalRef.current} onSuccess={handleFetch} />,
      "md"
    );
  };

  const handleIssue = (item) => {
    postIssue(`api/mortuary/certificates/${item.id}/issue`, {});
  };

  const handleVoid = (item) => {
    postVoid(`api/mortuary/certificates/${item.id}/void`, {});
  };

  useEffect(() => {
    if (issueData) {
      addToast({ message: issueData.message, severity: "success" });
      handleFetch();
    }
  }, [issueData]);

  useEffect(() => {
    if (voidData) {
      addToast({ message: voidData.message, severity: "success" });
      handleFetch();
    }
  }, [voidData]);

  const handleSearch = () => {
    setParams((prev) => ({ ...prev, q: searchText || undefined, page: 1 }));
  };

  const columns = [
    {
      field: "certificate_no",
      headerName: "Certificate No",
      valueGetter: (item) => item.certificate_no || "-",
    },
    {
      field: "deceased_name",
      headerName: "Deceased",
      valueGetter: (item) => item.deceased_name || "-",
    },
    {
      field: "cause_of_death",
      headerName: "Cause of Death",
      valueGetter: (item) => item.cause_of_death || "-",
      hideOnMobile: true,
    },
    {
      field: "doctor",
      headerName: "Doctor",
      valueGetter: (item) => item.doctor?.full_name || "-",
      hideOnMobile: true,
    },
    {
      field: "issued_at",
      headerName: "Issued At",
      valueGetter: (item) => item.issued_at || "-",
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
      width: 130,
      renderCell: (item) => (
        <Stack direction="row" spacing={0.5}>
          {item.status === "Draft" ? (
            <Tooltip title="Issue Certificate">
              <IconButton size="small" color="success" onClick={() => handleIssue(item)}>
                <IssueIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {item.status !== "Void" ? (
            <Tooltip title="Void Certificate">
              <IconButton size="small" color="error" onClick={() => handleVoid(item)}>
                <VoidIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[{ title: "Home" }, { title: "Mortuary" }, { title: "Certificates" }]}
    >
      <Card square variant="outlined">
        <PageHeader
          title="Death Certificates"
          subtitle="Manage death certificates"
          trailing={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleFetch} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => openForm()}
              >
                New Certificate
              </Button>
            </Stack>
          }
        />
        <Divider />
        <Stack direction="row" spacing={1} px={2} py={1.5} flexWrap="wrap" alignItems="center">
          <SearchTextField
            placeholder="Search by certificate no, name..."
            onChange={setSearchText}
          />
          <Button variant="contained" color="info" size="small" onClick={handleSearch}>
            <SearchIcon />
          </Button>
          <Select
            label="Status"
            sx={{ minWidth: 180 }}
            clearable
            value={params.status}
            onChange={(value) =>
              setParams((prev) => ({ ...prev, status: value || undefined, page: 1 }))
            }
            options={Object.keys(STATUS_COLORS)}
          />
        </Stack>
        <Table
          loading={loading}
          columns={columns}
          items={data.data}
          itemCount={data.total}
          page={data.current_page - 1}
          pageSize={data.per_page}
          onPageChange={(event, newPage) =>
            setParams((prev) => ({ ...prev, page: newPage + 1 }))
          }
          onPageSizeChange={(event) =>
            setParams((prev) => ({
              ...prev,
              per_page: parseInt(event.target.value, 10),
              page: 1,
            }))
          }
          noItemsOverlayMessage="No death certificates found."
        />
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Certificates;

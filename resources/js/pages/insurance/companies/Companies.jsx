import React, { useEffect, useRef, useState } from "react";

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
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Filters from "./Filters";
import CreateCompany from "./CreateCompany";
import EditCompany from "./EditCompany";

import { useDelete, useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const Companies = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/insurance-company",
    params,
    true,
    { data: [], total: 0 },
    (response) => {
      const raw = response?.data?.data;
      if (!raw || typeof raw !== "object") return { data: [], total: 0 };
      return {
        data: Array.isArray(raw.data) ? raw.data : [],
        total: parseInt(raw.total, 10) || 0,
      };
    }
  );

  const { data: deleteData, loading: deleting, handleDelete } = useDelete("api/insurance-company");

  useEffect(() => {
    document.title = `Insurance Companies - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (deleteData) {
      addToast({ message: deleteData.message, severity: "success" });
      handleFetch();
    }
  }, [deleteData]);

  const openCreateCompanyModal = () => {
    let component = (
      <CreateCompany
        modal={modalRef.current}
        fetchCompanies={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Insurance Company", component, "md");
  };

  const openEditCompanyModal = (item) => {
    let component = (
      <EditCompany
        item={item}
        modal={modalRef.current}
        fetchCompanies={handleFetch}
      />
    );

    modalRef.current.open("Edit Insurance Company", component, "md");
  };

  const confirmDeleteCompany = (item) => {
    let component = (
      <ConfirmationDialog
        message={`Are you sure you want to delete "${item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/insurance-company/${item.id}`);
        }}
      />
    );

    modalRef.current.open("Delete Company", component, "sm");
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "success" : "default";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Insurance" },
        { title: "Companies" },
      ]}
    >
      <Card>
        <PageHeader
          title="Insurance Companies"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateCompanyModal}
              >
                New Company
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "name",
                headerName: "Name",
              },
              {
                field: "code",
                headerName: "Code",
                valueGetter: (item, index) => item.code || "-",
              },
              {
                field: "type",
                headerName: "Type",
                valueGetter: (item, index) => item.type || "-",
              },
              {
                field: "contact_person",
                headerName: "Contact Person",
                valueGetter: (item, index) => item.contact_person || "-",
              },
              {
                field: "phone",
                headerName: "Phone",
                valueGetter: (item, index) => item.phone || "-",
              },
              {
                field: "email",
                headerName: "Email",
                valueGetter: (item, index) => item.email || "-",
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status || "-"}
                  />
                ),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton size="small" onClick={() => openEditCompanyModal(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleting}
                          onClick={() => confirmDeleteCompany(item)}
                        >
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

export default Companies;

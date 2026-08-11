import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";

import { useFetch, useToast } from "../../../hooks";
import {
  capitalize,
  formatDateForDb,
  formatError,
  getAge,
} from "../../../helpers";

const PatientBills = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const { status } = useParams();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: capitalize(status),
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-item-bills",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `${capitalize(status)} Patient Bills - ${window.APP_NAME}`;
    setParams({ ...params, status: capitalize(status) });
  }, [status]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: `${capitalize(status)} Patient Bills` },
      ]}
    >
      <Card>
        <PageHeader title={`${capitalize(status)} Patient Bills`} />
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
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item, index) =>
                  item.first_item.payment_cache.check_in.patient.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) =>
                  item.first_item.payment_cache.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(
                    item.first_item.payment_cache.check_in.patient.date_of_birth
                  ),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) =>
                  item.first_item.payment_cache.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) =>
                  item.first_item.payment_cache.check_in.patient.phone,
              },
              {
                field: "require_glass",
                headerName: "Item Required",
                renderCell: (item) => {
                  const requireGlass = item.first_item.payment_cache.consultation?.require_glass;
                  if (requireGlass === 'Yes') {
                    return (
                      <Chip
                        label="Yes"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    );
                  }
                  return requireGlass === 'No' ? (
                    <Chip
                      label="No"
                      color="default"
                      size="small"
                    />
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>
                  );
                },
              },
              {
                field: "created_by",
                headerName: "Created By",
                valueGetter: (item, index) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Created",
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    divider={
                      <Divider
                        orientation="vertical"
                        sx={{ height: 16 }}
                      />
                    }
                    spacing={1}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        navigate(
                          `/payment-center/patient-bills/${status}/${item.first_item.payment_cache.check_in.patient_id}/${item.id}`
                        )
                      }
                    >
                      {status === "pending" ? "Manage" : "View"}
                    </Button>
                  </Stack>
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
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientBills;

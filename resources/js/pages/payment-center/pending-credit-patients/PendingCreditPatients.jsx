import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge, getWeekStartDate } from "../../../helpers";

const PendingCreditPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    item_status: "Pending",
    item_transaction_type: "Credit",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: getWeekStartDate(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-payment-cache",
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
    document.title = `Credit Patients Approval - ${window.APP_NAME}`;
  }, []);

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
        { title: "Credit Patients Approval" },
      ]}
    >
      <Card>
        <PageHeader title="Credit Patients Approval" />
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
                valueGetter: (item, index) => item.check_in.patient.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(item.check_in.patient.date_of_birth),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.check_in.patient.phone,
              },
              {
                field: "require_glass",
                headerName: "Item Required",
                renderCell: (item) => {
                  const requireGlass = item.consultation?.require_glass;
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
                headerName: "Sent By",
                valueGetter: (item, index) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Sent",
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
                          `/payment-center/pending-credit-patients/${item.check_in.patient_id}/${item.id}`
                        )
                      }
                    >
                      Manage
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

export default PendingCreditPatients;

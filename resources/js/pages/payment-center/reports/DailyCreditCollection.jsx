import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import useFetch from "../../../hooks/useFetch";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
  throttle,
} from "../../../helpers";

const DailyCashCollection = ({ module }) => {
  const { data: paymentChannels } = useFetch(
    "api/payment-channels",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [params, setParams] = useState({
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_channel_id: undefined,
    start_date: new Date(),
    end_date: new Date(),
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `Daily Cash Collection Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Payment Center" },
        { title: "Reports" },
        { title: "Daily Cash Collection Report" },
      ]}
    >
      <Report
        title="Daily Cash Collection Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/payment-center/cash-collection"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        prependInner={
          <React.Fragment>
            <Card
              variant="outlined"
              sx={{
                bgcolor: "background.default",
                mb: 2,
              }}
            >
              <CardContent>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    md
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Name"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        setParams({ ...params, patient_name: value })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Number"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        setParams({ ...params, patient_id: value })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Gender"
                      fullWidth
                      options={["Male", "Female"]}
                      clearable
                      onChange={(value) =>
                        setParams({ ...params, patient_gender: value })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Payment Channel"
                      fullWidth
                      options={paymentChannels}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      onChange={(value) =>
                        setParams({ ...params, payment_channel_id: value })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        }
        columns={[
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) =>
              `${item.first_name} ${item.middle_name || ""} ${item.last_name}`,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
          },
          {
            field: "items",
            headerName: "Item Name",
          },
          {
            field: "amount",
            headerName: "Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
          },
          {
            field: "discount",
            headerName: "Discount",
            valueGetter: (item, index) => numberFormat(item.discount),
          },
          {
            field: "subtotal",
            headerName: "Subtotal",
            valueGetter: (item, index) =>
              numberFormat(parseFloat(item.amount) - parseFloat(item.discount)),
          },
          {
            field: "channel",
            headerName: "Payment Channel",
            valueGetter: (item) => item.channel?.name,
          },
          {
            field: "creator",
            headerName: "Created By",
            valueGetter: (item) => item.creator?.full_name,
          },
          {
            field: "created_at",
            headerName: "Date",
          },
          {
            field: "transaction_type",
            headerName: "Type",
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 3, index: 1 },
          { reducer: (acc, item) => acc + (parseFloat(item.amount) || 0), index: 5 },
          { reducer: (acc, item) => acc + (parseFloat(item.discount) || 0), index:6 },
          { reducer: (acc, item) => acc + Math.max(0, (parseFloat(item.amount) || 0) - (parseFloat(item.discount) || 0)), index: 7 },
        ]}
      />
    </Page>
  );
};

export default DailyCashCollection;

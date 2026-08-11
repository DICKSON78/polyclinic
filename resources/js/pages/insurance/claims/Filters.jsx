import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import { SearchTextField } from "../../../components/Table";
import useFetch from "../../../hooks/useFetch";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: companies } = useFetch(
    "api/insurance-company",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{
        bgcolor: "background.default",
        ...(rest && rest.sx),
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
            <SearchTextField
              placeholder="Search claim no or patient..."
              sx={{ width: "100%" }}
              onChange={(e) =>
                setParams({ ...params, q: e.target.value || undefined, page: 1 })
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
              label="Insurance Company"
              fullWidth
              options={companies}
              optionsLabel="name"
              optionsValue="id"
              clearable
              value={params.insurance_company_id}
              onChange={(value) =>
                setParams({ ...params, insurance_company_id: value, page: 1 })
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
              label="Status"
              fullWidth
              options={["Draft", "Submitted", "Approved", "Rejected", "Paid"]}
              clearable
              value={params.status}
              onChange={(value) =>
                setParams({ ...params, status: value, page: 1 })
              }
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="Start Date"
              value={params.start_date || null}
              onChange={(value) =>
                setParams({
                  ...params,
                  start_date: !isNaN(value) ? value : null,
                  page: 1,
                })
              }
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="End Date"
              value={params.end_date || null}
              onChange={(value) =>
                setParams({ ...params, end_date: !isNaN(value) ? value : null, page: 1 })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

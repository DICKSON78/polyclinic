import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Select from "../../../components/Select";
import { SearchTextField } from "../../../components/Table";

const Filters = ({ params, setParams, ...rest }) => {
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
        <Grid container spacing={2}>
          <Grid item md sm={6} xs={12}>
            <SearchTextField
              placeholder="Search visit no or patient..."
              sx={{ width: "100%" }}
              onChange={(e) =>
                setParams({ ...params, q: e.target.value || undefined, page: 1 })
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Status"
              fullWidth
              options={["Waiting", "In-Treatment", "Admitted", "Discharged", "Referred", "Cancelled"]}
              clearable
              value={params.status}
              onChange={(value) =>
                setParams({ ...params, status: value, page: 1 })
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Priority"
              fullWidth
              options={["Stable", "Serious", "Critical"]}
              clearable
              value={params.priority}
              onChange={(value) =>
                setParams({ ...params, priority: value, page: 1 })
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Date"
              fullWidth
              options={["today", "yesterday"]}
              clearable
              value={params.date}
              onChange={(value) =>
                setParams({ ...params, date: value, page: 1 })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

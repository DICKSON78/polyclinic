import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
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
              placeholder="Search by name or code..."
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
              label="Status"
              fullWidth
              options={["Active", "Inactive"]}
              clearable
              value={params.status}
              onChange={(value) =>
                setParams({ ...params, status: value, page: 1 })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

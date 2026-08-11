import React from "react";

import { Box, Chip, MenuItem, Select as MuiSelect, Stack, TextField as MuiTextField } from "@mui/material";

import Select from "../../../components/Select";

const STATUSES = ["Scheduled", "Ready", "In-Progress", "Completed", "Postponed", "Cancelled"];
const PROCEDURE_TYPES = ["Elective", "Emergency", "Urgent"];

const DATE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
];

const Filters = ({ params, setParams, sx }) => {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2, ...sx }} flexWrap="wrap" useFlexGap>
      <Select
        label="Status"
        sx={{ minWidth: 160 }}
        clearable
        options={STATUSES}
        value={params.status}
        onChange={(value) => setParams({ ...params, status: value || undefined, page: 1 })}
      />
      <Select
        label="Type"
        sx={{ minWidth: 160 }}
        clearable
        options={PROCEDURE_TYPES}
        value={params.procedure_type}
        onChange={(value) => setParams({ ...params, procedure_type: value || undefined, page: 1 })}
      />
      <Select
        label="Date"
        sx={{ minWidth: 140 }}
        clearable
        optionsLabel="label"
        optionsValue="value"
        options={DATE_OPTIONS}
        value={params.date}
        onChange={(value) => setParams({ ...params, date: value || undefined, page: 1 })}
      />
    </Stack>
  );
};

export default Filters;

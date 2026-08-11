import React, { useState } from "react";
import { Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useFetch } from "../../../hooks";
import { safeExtractArray } from "../../../helpers";

const Reports = () => {
  const [selectedType, setSelectedType] = useState("all");

  const { data: lensTypes, loading: loadingLensTypes } = useFetch(
    "api/lens-types",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => safeExtractArray(response, 'data.data.data', [])
  );

  const handleExport = () => {
    // Implement export logic
    alert("Exporting reports...");
  };

  return (
    <div>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Item Type</InputLabel>
        <Select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Item Type"
        >
          <MenuItem value="all">All</MenuItem>
          {(lensTypes || []).map((lt) => (
            <MenuItem key={lt.id} value={lt.name}>{lt.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleExport}
        sx={{ ml: 2 }}
      >
        Export Reports
      </Button>
    </div>
  );
};

export default Reports;

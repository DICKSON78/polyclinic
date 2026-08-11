import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import SelectClinic from "../../../../components/SelectClinic";
import FormLabelControl from "../../../../components/FormLabelControl";
import DatePicker from "../../../../components/DatePicker";

import { useFetch, usePost, useToast } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const CreateItem = ({ modal, fetchItems }) => {
  const addToast = useToast();

  const formRef = useRef();
  const clinicRef = useRef();
  const nameRef = useRef();
  const codeRef = useRef();
  const itemTypeRef = useRef();
  const consultationTypeRef = useRef();
  const unitOfMeasureRef = useRef();
  const lensTypeRef = useRef();

  const { data: itemTypes } = useFetch(
    "api/item-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: consultationTypes } = useFetch(
    "api/consultation-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: unitsOfMeasure } = useFetch(
    "api/units-of-measure",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: lensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [itemType, setItemType] = useState();
  const [consultationType, setConsultationType] = useState();
  const [formData, setFormData] = useState({
    clinic_id: undefined,
    name: undefined,
    code: undefined,
    category: undefined,
    item_type_id: undefined,
    consultation_type_id: undefined,
    unit_of_measure_id: undefined,
    lens_type_id: undefined,
    is_consultation_item: "No",
    is_stock_item: "No",
    templates: [],
    unit_buying_price: undefined,
    selling_price: undefined,
    expiration_date: undefined,
  });

  const { data, loading, error, handlePost } = usePost("api/items", formData);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchItems();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost("api/items", {
        ...formData,
        templates: formData.templates.join(","),
      });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            {window.user && window.user.role === "Admin" ? (
              <Grid
                size={{ xs: 12, sm: 12, md: 6 }}
              >
                <SelectClinic
                  ref={clinicRef}
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, clinic_id: value?.id })
                  }
                />
              </Grid>
            ) : null}
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <TextField
                ref={nameRef}
                label="Item Name"
                fullWidth
                required
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <TextField
                ref={codeRef}
                label="Item Code"
                fullWidth
                onChange={(value) => setFormData({ ...formData, code: value })}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <TextField
                label="Category"
                fullWidth
                placeholder="e.g., Antibiotics, Accessories, Items"
                onChange={(value) => setFormData({ ...formData, category: value })}
                helperText="Optional: Categorize this item for better organization"
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <Select
                ref={itemTypeRef}
                label="Item Type"
                fullWidth
                required
                options={itemTypes}
                optionsLabel="name"
                onChange={(value) => {
                  setItemType(value);
                  setFormData({ ...formData, item_type_id: value.id });
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <Select
                ref={consultationTypeRef}
                label="Consultation Type"
                fullWidth
                required
                options={consultationTypes}
                optionsLabel="name"
                onChange={(value) => {
                  setConsultationType(value);
                  setFormData({ ...formData, consultation_type_id: value?.id });
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <Select
                ref={unitOfMeasureRef}
                label="Unit of Measure"
                fullWidth
                options={unitsOfMeasure}
                optionsLabel="name"
                optionsValue="id"
                clearable
                onChange={(value) =>
                  setFormData({ ...formData, unit_of_measure_id: value })
                }
              />
            </Grid>
            {itemType && itemType.name === "Lens" ? (
              <Grid
                size={{ xs: 12, sm: 12, md: 6 }}
              >
                <Select
                  ref={lensTypeRef}
                  label="Lens Type"
                  fullWidth
                  options={lensTypes}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, lens_type_id: value })
                  }
                />
              </Grid>
            ) : null}
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
              alignSelf="flex-end"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_consultation_item === "Yes"}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        is_consultation_item: event.target.checked
                          ? "Yes"
                          : "No",
                      })
                    }
                  />
                }
                label="Consultation Item"
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
              alignSelf="flex-end"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_stock_item === "Yes"}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        is_stock_item: event.target.checked ? "Yes" : "No",
                      })
                    }
                  />
                }
                label="Stock Item"
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <TextField
                label="Buying Price / Cost"
                fullWidth
                type="number"
                placeholder="0.00"
                onChange={(value) => setFormData({ ...formData, unit_buying_price: value })}
                helperText="Cost price for profit calculation"
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <TextField
                label="Selling Price"
                fullWidth
                type="number"
                placeholder="0.00"
                onChange={(value) => setFormData({ ...formData, selling_price: value })}
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 6 }}
            >
              <DatePicker
                label="Expiration Date"
                fullWidth
                value={formData.expiration_date}
                onChange={(value) => setFormData({ ...formData, expiration_date: value })}
              />
            </Grid>
            {consultationType && consultationType.name === "Procedure" ? (
              <Grid
                size={{ xs: 12, sm: 12, md: 12 }}
                alignSelf="flex-end"
              >
                <FormLabelControl
                  label="Item Templates"
                  control={
                    <Box
                      p={2}
                      border={(theme) => `1px solid ${theme.palette.divider}`}
                      borderRadius={(theme) => `${theme.shape.borderRadius}px`}
                      bgcolor={(theme) =>
                        theme.components.MuiOutlinedInput.styleOverrides.root
                          .backgroundColor
                      }
                    >
                      {["Surgery Record Report", "Cataract Surgery Record"].map(
                        (e) => (
                          <FormControlLabel
                            key={e}
                            control={
                              <Checkbox
                                checked={formData.templates.indexOf(e) !== -1}
                                onChange={(event) =>
                                  setFormData({
                                    ...formData,
                                    templates: event.target.checked
                                      ? [...formData.templates, e]
                                      : formData.templates.filter(
                                          (f) => f !== e
                                        ),
                                  })
                                }
                              />
                            }
                            label={e}
                          />
                        )
                      )}
                    </Box>
                  }
                />
              </Grid>
            ) : null}
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateItem;

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Radio,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Table, { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";
import SelectUser from "../../../components/SelectUser";
import TextField from "../../../components/TextField";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationRules,
  numberFormat,
  throttle,
  validateInteger,
} from "../../../helpers";

const validationRules = getValidationRules();

const SelectItems = ({
  consultation,
  selected: initial,
  consultationType,
  fetchItems: fetchConsultationItems,
  modal,
}) => {
  const addToast = useToast();

  const paymentModeRef = useRef();
  const consultantRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const dosageRef = useRef();
  const commentsRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const [paymentMode, setPaymentMode] = useState(
    consultation.payment_cache_item.payment_mode
  );
  const [consultant, setConsultant] = useState(window.user);
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [lensTypeId, setLensTypeId] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [dosage, setDosage] = useState();
  const [comments, setComments] = useState();

  const { data: lensTypes, handleFetch: fetchLensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );
  const { data: paymentModes, handleFetch: fetchPaymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const {
    data: items,
    loading: loadingItems,
    setData: setItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/items",
    {
      status: "Active",
      per_page: 5000,
      q: itemName,
      consultation_type: consultationType,
      payment_mode_id: paymentMode ? paymentMode.id : undefined,
      item_type: itemType,
      lens_type_id: lensTypeId,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const [selected, setSelected] = useState(initial);

  const {
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
    handlePost,
  } = usePost();
  const {
    data: dataDelete,
    loading: loadingDelete,
    error: errorDelete,
    handleDelete,
  } = useDelete();

  useEffect(() => {
    if (consultationType === "Glass" && itemType === "Lens") {
      fetchLensTypes();
    }
  }, [consultationType, itemType]);

  useEffect(() => {
    if (paymentMode) {
      setSelectedItem(null);
      setQuantity(1);
      setDosage(null);
      setComments(null);
      setItems([]);
      fetchItems();
    }
  }, [paymentMode]);

  useEffect(() => {
    if (paymentMode) {
      fetchItems();
    }
  }, [itemName, itemType, lensTypeId]);

  useEffect(() => {
    if (itemType !== "Lens") {
      setLensTypeId(null);
    }
  }, [itemType]);

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      setSelected([...selected, dataPost.data]);
      setSelectedItem(null);
      setQuantity(1);
      setDosage(null);
      fetchConsultationItems();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      setSelected(selected.filter((e) => e.id !== dataDelete.data.id));
      fetchConsultationItems();
    }
  }, [dataDelete]);

  useEffect(() => {
    if (errorPost) {
      setError(errorPost);
    }
  }, [errorPost]);

  useEffect(() => {
    if (errorDelete) {
      setError(errorDelete);
    }
  }, [errorDelete]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handlePostItem = () => {
    setData(null);
    setError(null);

    if (
      paymentModeRef.current.validate() &&
      consultantRef.current.validate() &&
      quantityRef.current.validate()
    ) {
      handlePost("api/consultations/add-item", {
        payment_mode_id: paymentMode.id,
        item_id: selectedItem.id,
        consultation_id: consultation.id,
        consultation_type: consultationType,
        quantity,
        dosage,
        comments,
        consultant_id: consultant ? consultant.id : null,
      });
    }
  };

  const handleDeleteItem = (item) => {
    setData(null);
    setError(null);
    handleDelete(`api/patient-payment-cache-items/${item.id}`);
  };

  return (
    <React.Fragment>
      {loadingPost || loadingDelete ? <LinearProgress /> : null}
      <CardContent>
        <Grid
          container
          spacing={2}
          mb={2}
        >
          <Grid
            item
            md={3.5}
            sm={12}
            xs={12}
          >
            <Select
              ref={paymentModeRef}
              label="Payment Mode"
              fullWidth
              required
              options={paymentModes}
              optionsLabel="name"
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={paymentMode}
              onChange={(value) => setPaymentMode(value)}
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <SelectUser
              ref={consultantRef}
              label="Consultant"
              clearable
              params={{ designation: "Doctor" }}
              value={consultant}
              onChange={(value) => setConsultant(value)}
            />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md={3.5}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader
                title="Select Item"
                action={
                  <SearchTextField
                    onChange={(value) =>
                      throttle(() => setItemName(value), 1000)
                    }
                    sx={{ width: 116 }}
                  />
                }
                className="no-action-margin"
              />
              <Divider />
              {loadingItems && <LinearProgress />}
              {consultationType === "Glass" ? (
                <React.Fragment>
                  <CardContent sx={{ bgcolor: "background.default" }}>
                    <Select
                      placeholder="Item Type"
                      fullWidth
                      clearable
                      options={["Lens", "Frame"]}
                      onChange={(value) => setItemType(value)}
                    />
                    {itemType === "Lens" ? (
                      <Select
                        placeholder="Item Type"
                        fullWidth
                        clearable
                        options={lensTypes}
                        optionsLabel="name"
                        optionsValue="id"
                        onChange={(value) => setLensTypeId(value)}
                        containerProps={{ mt: 2 }}
                      />
                    ) : null}
                  </CardContent>
                  <Divider />
                </React.Fragment>
              ) : null}
              <CardContent sx={{ height: "40vh", overflowY: "auto" }}>
                {items.map((e) => (
                  <FormControlLabel
                    key={e.id}
                    control={
                      <Radio
                        size="small"
                        checked={selectedItem === e}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedItem(e);
                          }
                        }}
                      />
                    }
                    label={<Typography variant="body2">{e.name}</Typography>}
                    sx={{ display: "flex" }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={8.5}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader title="Selected Items" />
              <Divider />
              <CardContent>
                {selectedItem ? (
                  <Grid
                    container
                    spacing={1}
                    alignItems="flex-end"
                    mb={2}
                  >
                    <Grid
                      item
                      md={4}
                      sm={4}
                      xs={12}
                    >
                      <TextField
                        ref={itemRef}
                        disabled={true}
                        label="Selected Item"
                        fullWidth
                        required
                        value={selectedItem.name || ""}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      sm={4}
                      xs={12}
                    >
                      <TextField
                        disabled={true}
                        label="Unit Price"
                        fullWidth
                        value={
                          selectedItem.prices.length
                            ? numberFormat(
                                selectedItem.prices[0].unit_price || 0
                              )
                            : ""
                        }
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      sm={4}
                      xs={12}
                    >
                      <TextField
                        ref={quantityRef}
                        label="Quantity"
                        fullWidth
                        required
                        defaultValue={quantity}
                        rules={[
                          validationRules.number,
                          (value) =>
                            value > 0 || "Quantity has to be greater than 0.",
                        ]}
                        onChange={(value) => {
                          value = validateInteger(value);
                          setQuantity(value);
                        }}
                      />
                    </Grid>
                    <Grid
                      item
                      md={2}
                      sm={4}
                      xs={12}
                    >
                      <TextField
                        disabled={true}
                        label="Total Price"
                        fullWidth
                        value={
                          numberFormat(
                            (selectedItem.prices[0].unit_price || 0) *
                              (quantity || 0)
                          ) || ""
                        }
                      />
                    </Grid>
                    {consultationType === "Pharmacy" ? (
                      <Grid
                        item
                        md={4}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          ref={dosageRef}
                          label="Dosage"
                          fullWidth
                          onChange={(value) => setDosage(value)}
                        />
                      </Grid>
                    ) : null}
                    <Grid
                      item
                      md={6}
                      sm={12}
                      xs={12}
                    >
                      <TextField
                        ref={commentsRef}
                        label="Comments"
                        fullWidth
                        multiline
                        rows={4}
                        onChange={(value) => setComments(value)}
                      />
                    </Grid>
                    <Grid
                      item
                      md={1}
                      sm={2}
                      xs={12}
                    >
                      <Button
                        disabled={loadingPost}
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={handlePostItem}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                ) : null}

                <Table
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    {
                      field: "item_name",
                      headerName: "Item Name",
                      valueGetter: (item, index) => item.item?.name,
                    },
                    {
                      field: "quantity",
                      headerName: "Quantity",
                      valueGetter: (item, index) =>
                        numberFormat(item.quantity || 0),
                    },
                    {
                      field: "dosage",
                      headerName: "Dosage",
                      show: consultationType === "Pharmacy",
                    },
                    {
                      field: "comments",
                      headerName: "Comments",
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      renderCell: (item) => (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={
                                loadingDelete || item.status !== "Pending"
                              }
                              onClick={() => handleDeleteItem(item)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ),
                    },
                  ]}
                  items={selected}
                  hidePaginationFooter
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          onClick={() => modal.close()}
        >
          Close
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default SelectItems;

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
} from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import { Typography } from "@mui/material";
import Modal from "../../../components/Modal";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import { useFetch, usePatch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationError,
  numberFormat,
} from "../../../helpers";

const DispensingRequestItems = ({ consultationType, stockItem }) => {
  const addToast = useToast();
  const { patientId, paymentCacheId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [paymentCache, setPaymentCache] = useState();

  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    error: itemsError,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      payment_cache_id: paymentCacheId,
      consultation_type: consultationType,
      is_stock_item: stockItem,
    },
    true, // Changed to true to fetch immediately
    [],
    (response) => response.data.data.data
  );

  const { handlePatch: handleAutoSave } = usePatch();
  
  // Fetch payment cache information
  const { data: paymentCacheData, loading: loadingPaymentCache, error: paymentCacheError } = useFetch(
    `api/patient-payment-cache/${paymentCacheId}`,
    null,
    true,
    null,
    (response) => response.data.data
  );

  const { data, loading, error, handlePost: originalHandlePost, setError } = usePost(
    "api/patient-payment-cache-items/dispense",
    {
      payment_cache_id: paymentCacheId,
      items: selectedItems.map((e) => e.id),
    }
  );

  const handlePost = (itemIds = null) => {
    const itemsToDispense = itemIds || selectedItems.map((e) => e.id);
    originalHandlePost({
      payment_cache_id: paymentCacheId,
      items: itemsToDispense,
    });
  };

  useEffect(() => {
    document.title = `Dispensing Request Items - ${window.APP_NAME}`;
  }, []);



  useEffect(() => {
    if (paymentCacheData) {
      setPaymentCache(paymentCacheData);
    }
  }, [paymentCacheData]);



  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      fetchItems();
      setSelectedItems([]);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (itemsError) {
      addToast({ message: formatError(itemsError), severity: "error" });
    }
  }, [itemsError]);

  useEffect(() => {
    if (paymentCacheError) {
      addToast({ message: formatError(paymentCacheError), severity: "error" });
    }
  }, [paymentCacheError]);

  const autoSave = (item, field, value) => {
    if (value !== item[field]) {
      handleAutoSave(`api/patient-payment-cache-items/${item.id}`, {
        [field]: value,
      });
    }
  };

  const handleDispenseSingleItem = (item) => {
    let component = (
      <ConfirmationDialog
        message={`Are you sure you want to dispense "${item.item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost([item.id]);
        }}
      />
    );

    modalRef.current.open("Dispense Item", component, "sm");
  };

  const confirmSubmitDispense = (title) => {
    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open(title, component, "sm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Not Paid";
      case "Served":
        return "Dispensed";
    }

    return status;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        {
          title:
            consultationType === "Others"
              ? "Other Dispensing"
              : consultationType === "Glass"
                ? "Outpatient Dispensing"
                : "Medicine Center",
        },
        { title: "Dispensing Requests" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}



              {patient ? (
          <Card>
            <PageHeader title="Dispensing Request Items" />
            <Divider />
            <CardContent>
              {/* Stock Warning */}
              {items && items.some(item => (item.item?.balance || 0) <= 0) && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 2,
                    '& .MuiAlert-icon': {
                      color: '#ffa726'
                    },
                    '& .MuiAlert-message': {
                      color: '#e65100'
                    }
                  }}
                >
                  <AlertTitle>Stock Warning</AlertTitle>
                  Some items are out of stock. Please check inventory before dispensing.
                </Alert>
              )}
              
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_id",
                  headerName: "Item Name",
                  valueGetter: (item, index) => item.item.name,
                },
                {
                  field: "unit_of_measure_id",
                  headerName: "UoM",
                  valueGetter: (item, index) => item.item.unit_of_measure?.name,
                },
                {
                  field: "balance",
                  headerName: "Item Balance",
                  renderCell: (item, index) => {
                    const balance = parseFloat(item.item?.balance) || 0;
                    const minimumStock = item.item?.minimum_stock || 0;
                    // Display 0 instead of negative values to avoid confusion during inspections
                    const displayBalance = balance < 0 ? 0 : balance;
                    const isOutOfStock = displayBalance <= 0;
                    const isBelowMinimum = displayBalance < minimumStock && minimumStock > 0;
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: isOutOfStock ? '#ff6b6b' : isBelowMinimum ? '#ffa726' : '#66bb6a',
                        fontWeight: isOutOfStock || isBelowMinimum ? 'bold' : 'normal'
                      }}>
                        <span>{numberFormat(displayBalance)}</span>
                        {isOutOfStock && (
                          <span style={{ 
                            fontSize: '10.8px', 
                            backgroundColor: '#ff6b6b', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            opacity: 0.8
                          }}>
                            OUT OF STOCK
                          </span>
                        )}
                        {isBelowMinimum && !isOutOfStock && (
                          <span style={{ 
                            fontSize: '10.8px', 
                            backgroundColor: '#ffa726', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            opacity: 0.8
                          }}>
                            LOW STOCK
                          </span>
                        )}
                      </div>
                    );
                  },
                },
                {
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => item.payment_mode.name,
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
                  renderCell: (item, index) => (
                    <TextField
                      disabled={item.status === "Served"}
                      fullWidth
                      defaultValue={item.dosage}
                      onChange={(value) => {
                        let tmp = items;
                        tmp[index] = { ...item, dosage: value };
                        setItems(tmp);
                        setSelectedItems(
                          selectedItems.filter((e) => e.id !== item.id)
                        );
                        autoSave(item, "dosage", value);
                      }}
                    />
                  ),
                  show: consultationType === "Pharmacy",
                },
                {
                  field: "comments",
                  headerName: "Comments",
                  renderCell: (item, index) => (
                    <TextField
                      disabled={item.status === "Served"}
                      fullWidth
                      multiline
                      rows={4}
                      defaultValue={item.comments}
                      onChange={(value) => {
                        let tmp = items;
                        tmp[index] = { ...item, comments: value };
                        setItems(tmp);
                        setSelectedItems(
                          selectedItems.filter((e) => e.id !== item.id)
                        );
                        autoSave(item, "comments", value);
                      }}
                    />
                  ),
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item, index) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        color={getStatusColor(item.status)}
                        label={getStatusLabel(item.status)}
                      />
                      {item.status === "Served" && (
                        <Chip
                          size="small"
                          color="default"
                          label="Not Selectable"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  ),
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  renderCell: (item, index) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {item.status !== "Served" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleDispenseSingleItem(item)}
                          disabled={loading}
                        >
                          Dispense
                        </Button>
                      )}
                      {item.status === "Served" && (
                        <Chip
                          size="small"
                          color="success"
                          label="Dispensed"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  ),
                },
              ]}
              items={items || []}
              hidePaginationFooter
              checkboxSelection={(item, index) =>
                item.status !== "Served"
              }
              checked={selectedItems}
              setChecked={setSelectedItems}
            />
            </CardContent>
            <Divider />
            {loading && <LinearProgress />}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              p={2}
            >
              <Button
                disabled={loading}
                variant="contained"
                onClick={() => confirmSubmitDispense("Dispense Items")}
              >
                Dispense Items
              </Button>
            </Stack>
          </Card>
        ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default DispensingRequestItems;

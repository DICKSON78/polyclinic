import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleRounded as ApplyIcon,
  DeleteRounded as DeleteIcon,
  VisibilityRounded as ViewIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useDelete, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const StocktakesList = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
  });

  const [stocktakeItems, setStocktakeItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const { data, loading, error, handleFetch, handleRefresh } = useFetch(
    "api/stocktakes",
    params,
    true,
    { data: [], total: 0, page: 1 },
    (response) => {
      const apiData = response?.data?.data;
      if (!apiData || !apiData.data) {
        return { data: [], total: 0, page: 1, per_page: 25 };
      }
      return {
        data: apiData.data || [],
        total: apiData.total || 0,
        page: apiData.current_page || 1,
        per_page: apiData.per_page || 25,
      };
    }
  );

  const { data: appliedData, loading: applying, error: applyError, handlePost: handleApply } = usePost("api/stocktakes");
  const { data: deletedData, loading: deleting, error: deleteError, handleDelete } = useDelete();

  useEffect(() => {
    document.title = `Stocktakes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) addToast({ message: formatError(error), severity: "error" });
  }, [error]);

  useEffect(() => {
    if (applyError) addToast({ message: formatError(applyError), severity: "error" });
  }, [applyError]);

  useEffect(() => {
    if (deleteError) addToast({ message: formatError(deleteError), severity: "error" });
  }, [deleteError]);

  useEffect(() => {
    if (appliedData) {
      addToast({ message: appliedData.message || "Stocktake applied successfully.", severity: "success" });
      handleRefresh?.();
    }
  }, [appliedData]);

  useEffect(() => {
    if (deletedData) {
      addToast({ message: deletedData.message || "Stocktake deleted successfully.", severity: "success" });
      handleRefresh?.();
    }
  }, [deletedData]);

  const confirmApply = (stocktake) => {
    let component = (
      <ConfirmationDialog
        message="Apply this stocktake? This will update item balances to the counted quantities. This cannot be undone."
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleApply(`api/stocktakes/${stocktake.id}/apply`);
        }}
      />
    );
    modalRef.current.open("Apply Stocktake", component, "sm");
  };

  const confirmDelete = (stocktake) => {
    let component = (
      <ConfirmationDialog
        message="Are you sure you want to delete this stocktake?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDelete(`api/stocktakes/${stocktake.id}`);
        }}
      />
    );
    modalRef.current.open("Delete Stocktake", component, "sm");
  };

  const viewItems = async (stocktake) => {
    modalRef.current.open(`Stocktake Items - ${stocktake.reason}`, "Loading items...", "md");
    setLoadingItems(true);
    try {
      const response = await window.axios.get(`/api/stocktakes/${stocktake.id}`);
      const result = response.data?.data;
      setStocktakeItems(result?.items || []);
      modalRef.current.open(
        `Stocktake Items - ${stocktake.reason}`,
        <Box>
          {stocktakeItems.length === 0 ? (
            <Typography variant="body2">No items in this stocktake.</Typography>
          ) : (
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_name",
                  headerName: "Item",
                  valueGetter: (item) => item.item?.name || "N/A",
                },
                {
                  field: "quantity",
                  headerName: "Counted Qty",
                  valueGetter: (item) => item.quantity,
                },
                {
                  field: "unit_buying_price",
                  headerName: "Unit Buying Price",
                  valueGetter: (item) => item.unit_buying_price,
                },
                {
                  field: "selling_price",
                  headerName: "Selling Price",
                  valueGetter: (item) => item.selling_price,
                },
              ]}
              items={stocktakeItems}
              itemCount={stocktakeItems.length}
            />
          )}
        </Box>,
        "md"
      );
    } catch (e) {
      addToast({ message: "Failed to load stocktake items.", severity: "error" });
    } finally {
      setLoadingItems(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Applied") return "success";
    return "warning";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Stocktakes" },
      ]}
    >
      <Card sx={{ width: "100%" }}>
        <PageHeader
          title={<Typography variant="h5">Stocktakes</Typography>}
        />
        <Divider />
        <CardContent>
          <Table
            loading={loading || applying || deleting}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "reason",
                headerName: "Reason",
                valueGetter: (item) => item.reason,
              },
              {
                field: "prepared_by",
                headerName: "Prepared By",
                valueGetter: (item) => item.creator?.full_name || "N/A",
              },
              {
                field: "created_at",
                headerName: "Date",
                valueGetter: (item) => item.created_at,
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip size="small" color={getStatusColor(item.status)} label={item.status} />
                ),
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="View Items">
                      <IconButton size="small" color="info" onClick={() => viewItems(item)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {item.status !== "Applied" ? (
                      <Tooltip title="Apply Stocktake">
                        <IconButton size="small" color="success" onClick={() => confirmApply(item)}>
                          <ApplyIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => confirmDelete(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              },
            ]}
            items={Array.isArray(data?.data) ? data.data : []}
            itemCount={data?.total || 0}
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

export default StocktakesList;

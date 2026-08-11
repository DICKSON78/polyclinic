import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";

import { numberFormat, throttle } from "../../../helpers";

const ItemBalance = ({ module, consultationType }) => {
  const [params, setParams] = useState({
    consultation_type: undefined,
    status: "Active",
    is_stock_item: "Yes",
    include_all_stock: "Yes", // Show all stock items including zero balance
    q: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Item Balance Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "weekly":
        return "Weekly Report";
      case "monthly":
        return "Monthly Report";
      case "yearly":
        return "Yearly Report";
      default:
        return "";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Stock Management" },
        { title: "Reports" },
        { title: "Item Balance" },
      ]}
    >
      <Report
        title={`Item Balance Report - ${getReportPeriodTitle()}`}
        subtitle="Current Balance: Existing stock • New Stock Added: Recently added stock • Total Available Stock: Combined stock level"
        uri="api/items"
        params={{ ...params, consultation_type: consultationType }}
        headerTrailingContent={
          <React.Fragment>
            <Select
              label="Report Period"
              options={[
                { id: "daily", name: "Daily" },
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
                { id: "yearly", name: "Yearly" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              value={params.report_period}
              onChange={(value) =>
                setParams({ ...params, report_period: value })
              }
              sx={{ width: 150, mr: 2 }}
            />
            <SearchTextField
              placeholder="Search Item"
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value }), 1000)
              }
              sx={{ width: 200 }}
            />
          </React.Fragment>
        }
        columns={[
          {
            field: "id",
            headerName: "Item Number",
            valueGetter: (item, index) => item.id,
          },
          {
            field: "name",
            headerName: "Item Name",
          },
          {
            field: "code",
            headerName: "Item Code",
          },
          {
            field: "item_type_id",
            headerName: "Item Type",
            valueGetter: (item, index) => item.item_type?.name,
          },
          {
            field: "lens_type_id",
            headerName: "Dispensing Item Type",
            valueGetter: (item, index) => item.lens_type?.name,
            show: !module || module === "Outpatient Dispensing",
          },
          {
            field: "consultation_type_id",
            headerName: "Consultation Type",
            valueGetter: (item, index) => item.consultation_type?.name,
            show: !module,
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item, index) => item.unit_of_measure?.name,
          },
          {
            field: "selling_price",
            headerName: "Selling Price",
            valueGetter: (item, index) => numberFormat((item.prices && item.prices[0]?.unit_price) || 0),
          },
          {
            field: "balance",
            headerName: "Current Balance",
            valueGetter: (item, index) => {
              const balance = parseFloat(item.balance) || 0;
              // Display 0 instead of negative values to avoid confusion during inspections
              return numberFormat(balance < 0 ? 0 : balance);
            },
          },
          {
            field: "new_balance",
            headerName: "New Stock Added",
            valueGetter: (item, index) => {
              const newBalance = parseFloat(item.new_balance) || 0;
              // Display 0 instead of negative values to avoid confusion during inspections
              return numberFormat(newBalance < 0 ? 0 : newBalance);
            },
          },
          {
            field: "total_balance",
            headerName: "Total Available Stock",
            valueGetter: (item, index) => {
              const currentBalance = parseFloat(item.balance) || 0;
              const newBalance = parseFloat(item.new_balance) || 0;
              // Total Balance should be current balance + new balance (total stock including newly added)
              const totalBalance = currentBalance + newBalance;
              // Display 0 instead of negative values to avoid confusion during inspections
              return numberFormat(totalBalance < 0 ? 0 : totalBalance);
            },
          },
        ]}
      />
    </Page>
  );
};

export default ItemBalance;

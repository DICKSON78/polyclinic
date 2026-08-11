/**
 * Helper functions.
 */

import moment from "moment";

/**
 * Safely extracts an array from API response, ensuring it's always an array
 * @param {*} response - The API response object
 * @param {string} path - The path to extract (e.g., 'data.data.data' or 'data.data')
 * @param {Array} defaultValue - Default value if extraction fails
 * @returns {Array}
 */
export const safeExtractArray = (response, path = 'data.data.data', defaultValue = []) => {
  try {
    if (!response || !response.data) {
      return defaultValue;
    }
    
    const parts = path.split('.');
    let result = response.data;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return defaultValue;
      }
    }
    
    return Array.isArray(result) ? result : defaultValue;
  } catch (error) {
    console.error('Error extracting array from response:', error);
    return defaultValue;
  }
};

/**
 * Safely extracts paginated data from API response
 * @param {*} response - The API response object
 * @param {string} dataPath - Path to data array (default: 'data.data')
 * @returns {Object} - { data: Array, total: number, page: number }
 */
export const safeExtractPaginatedData = (response, dataPath = 'data.data') => {
  try {
    if (!response || !response.data) {
      return { data: [], total: 0, page: 1 };
    }
    
    const result = response.data.data || response.data;
    
    return {
      data: Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []),
      total: result?.total ?? result?.total_count ?? 0,
      page: result?.current_page ?? result?.page ?? 1,
      per_page: result?.per_page ?? result?.perPage ?? 25,
      last_page: result?.last_page ?? result?.lastPage ?? 1,
    };
  } catch (error) {
    console.error('Error extracting paginated data from response:', error);
    return { data: [], total: 0, page: 1 };
  }
};

/**
 * Formats a `number` into comma-separated sections.
 * Ensures the number is never negative (returns "0" for negative values).
 * Limits decimal places to at most maxDecimals (default 2).
 * @param number {Number}
 * @param maxDecimals {number} - Maximum decimal places (default 2). Use 0 for integers.
 * @returns {String}
 */
export const numberFormat = (number, maxDecimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }
  const safeNumber = Math.max(0, Number(number));
  const rounded = maxDecimals === 0
    ? Math.round(safeNumber)
    : round(safeNumber, maxDecimals);
  let parts = rounded.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

/**
 * Ensures a value is never negative. Returns 0 for negative values.
 * @param value {Number|String}
 * @returns {Number}
 */
export const ensureNonNegative = (value) => {
  const num = parseFloat(value) || 0;
  return Math.max(0, num);
};

/**
 * Rounds a `number` to `decimalPlaces`.
 * @param number {Number}
 * @param decimalPlaces {int}
 * @returns {Number}
 */
export const round = (number, decimalPlaces = 0) => {
  number = Math.round(number + "e" + decimalPlaces);
  return Number(number + "e" + -decimalPlaces);
};

/**
 * Strips all non-digit characters from `text` and returns a string of digits.
 * @param text {String}
 * @returns {String}
 */
export const validateInteger = (text) => {
  text = text || "";
  return Array.prototype.slice
    .call(text)
    .filter((c) => /\d+/.test(c))
    .join("");
};

/**
 * Capitalizes each first letter of each word in a `text`.
 * @param text {String}
 * @returns {String}
 */
export const capitalize = (text) => {
  return text
    .split(" ")
    .map((e) => e.charAt(0).toUpperCase() + e.substr(1).toLowerCase())
    .join(" ");
};

/**
 * Formats a date object or string to the format of year-month-date.
 * @param date
 * @returns {String}
 */
export const formatDateForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD");
};

/**
 * Formats a date object or string to a readable format.
 * @param date {Date|String}
 * @returns {String}
 */
export const formatDate = (date) => {
  if (!date) return "-";
  return moment(date).format("MMM DD, YYYY");
};

/**
 * Get the start date of the current week (Monday).
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getWeekStartDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the end date of the current week (Sunday).
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getWeekEndDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get the start date of the current month.
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getMonthStartDate = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get the end date of the current month.
 * @param date {Date|String} - Optional date, defaults to current date
 * @returns {Date}
 */
export const getMonthEndDate = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Calls a `fn` after a specified `delay` time.
 * @param fn {Function}
 * @param delay {int}
 */
export const throttle = (fn, delay) => {
  if (window.throttleTimeoutID) {
    window.clearTimeout(window.throttleTimeoutID);
  }

  window.throttleTimeoutID = window.setTimeout(fn, delay);
};

/**
 * Get common validation rules.
 * @returns {Object}
 */
export const getValidationRules = () => {
  return {
    required: (value) => !!value || "This field is required.",
    integer: (value) => {
      const pattern = /^-?\d+$/;
      return pattern.test(value) || "Invalid integer.";
    },
    optionalInteger: (value) => {
      const pattern = /^-?\d+$/;
      return !value ? true : pattern.test(value) || "Invalid integer.";
    },
    number: (value) => {
      const pattern = /^-?\d*\.?\d+$/;
      return pattern.test(value) || "Invalid number.";
    },
    phone: (value) => {
      const pattern = /^0\d{9}$/;
      return pattern.test(value) || "Invalid phone number.";
    },
    requiredPhone: (value) => {
      if (!value || !value.trim()) {
        return "Phone number is required.";
      }
      const pattern = /^0\d{9}$/;
      return pattern.test(value) || "Invalid phone number. Must start with 0 and have 10 digits.";
    },
    optionalPhone: (value) => {
      const pattern = /^0\d{9}$/;
      return !value ? true : pattern.test(value) || "Invalid phone number.";
    },
    email: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value) || "Invalid email address.";
    },
    optionalEmail: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value ? true : pattern.test(value) || "Invalid email address.";
    },
    time: (value) => {
      const pattern = /^(\d{2}):(\d{2})$/;
      const matches = pattern.exec(value);
      if (matches && matches.length === 3) {
        const hours = parseInt(matches[1]);
        const minutes = parseInt(matches[2]);
        return (hours <= 23 && minutes <= 59) || "Invalid time.";
      }

      return "Invalid time.";
    },
  };
};

/**
 * Get a validation-like error object.
 * @param message
 * @returns {{response: {status: number, data: {message: *}}}}
 */
export const getValidationError = (message) => {
  return { response: { status: 422, data: { message } } };
};

/**
 * Formats an error body into a user-friendly error message.
 * @param errorBody
 * @returns {String}
 */
export const formatError = (errorBody) => {
  let message = "Something went wrong.";

  if (errorBody.response) {
    const statusCode = parseInt(errorBody.response.status);
    switch (statusCode) {
      case 401:
      case 403:
        {
          let data = errorBody.response.data;
          if (data.message) {
            message = data.message;
          }
        }
        break;
      case 404:
        message = "The requested resource was not found.";
        break;
      case 422:
        {
          // validation errors
          let data = errorBody.response.data;
          if (data.message) {
            message = data.message;
          }

          if (data.errors) {
            let errors = [];
            Object.keys(data.errors).forEach((e, i) =>
              errors.push(data.errors[e][0])
            );
            message = errors.join("\n");
          }
        }
        break;
    }
  } else if (errorBody.request) {
    message = "Network connectivity error.";
  }

  return message;
};

/**
 * Get age from `date`.
 * @param date
 * @returns {*}
 */
export const getAge = (date) => {
  if (!date || date === "0000-00-00") {
    return null;
  }

  const years = moment().diff(date, "years");
  const months = moment().diff(date, "months");
  const days = moment().diff(date, "days");

  if (years >= 1) {
    return Math.floor(years) + " years";
  }

  if (months >= 1 && months <= 12) {
    return Math.floor(months) + " months";
  }

  return days + " days";
};

/**
 * Get full name from `firstName`, `middleName` and `lastName`.
 * @param firstName
 * @param middleName
 * @param lastName
 * @returns {String}
 */
export const getFullName = (firstName, middleName, lastName) => {
  let fullName = `${firstName} ${middleName || ""} ${lastName}`.trim();
  return fullName.replace(/\s{2,}/g, " ");
};

/**
 * Get address from `region`, `district` and `ward`.
 * @param region
 * @param district
 * @param ward
 * @returns {String}
 */
export const getAddress = (region, district, ward) => {
  let address = "";

  if (ward) {
    address += ward.name;
  }
  if (district) {
    address += `, ${district.name}`;

    if (address.indexOf(", ") === 0) {
      address = address.substring(2);
    }
  }
  if (region) {
    address += `, ${region.name}`;

    if (address.indexOf(", ") === 0) {
      address = address.substring(2);
    }
  }

  return address;
};

/**
 * Get date range title for reports.
 * @param startDate
 * @param endDate
 * @returns {String}
 */
export const getDateRangeTitle = (startDate, endDate) => {
  let title = "";
  if (startDate) {
    title += `From ${formatDateForDb(startDate)}`;
  }
  if (endDate) {
    title += ` to ${formatDateForDb(endDate)}`;
  }

  return title;
};

/**
 * Gets file extension from `filename`.
 * @param {String} filename
 * @returns {String}
 */
export const getFileExtension = (filename) => {
  filename = filename || "";
  const parts = filename.split(".");
  return (parts[parts.length - 1] || "").toUpperCase();
};

/**
 * Check if user has access to a specific report page
 * Access is granted if:
 * 1. User has the parent section privilege (e.g., "reception") OR
 * 2. User has the specific report privilege (e.g., "receptionist_monthly_report")
 * 
 * @deprecated Use hasReportAccess from helpers/privileges.js instead
 * This function is kept for backward compatibility
 * 
 * @param {Object} privileges - User privileges object (or user object)
 * @param {string} parentPrivilege - Parent section privilege (e.g., "reception")
 * @param {string} reportPrivilege - Specific report privilege (e.g., "receptionist_monthly_report")
 * @returns {boolean} - True if user has access
 */
export const hasReportAccess = (privileges, parentPrivilege, reportPrivilege) => {
  // Import the new function dynamically to avoid circular dependencies
  // If privileges has a 'privileges' property, it's a user object
  if (privileges && typeof privileges === 'object' && 'privileges' in privileges) {
    // It's a user object, use the new function
    const { hasReportAccess: newHasReportAccess } = require('./helpers/privileges');
    return newHasReportAccess(privileges, parentPrivilege, reportPrivilege);
  }
  
  // Legacy: privileges is a plain object
  if (!privileges) return false;
  
  const isGranted = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "Yes" || v === "yes";
  
  // Check parent privilege OR specific report privilege
  const hasParent = isGranted(privileges[parentPrivilege]);
  const hasReport = isGranted(privileges[reportPrivilege]);
  
  return hasParent || hasReport;
};

export const getPrivileges = (preferences) => {
  return [
    { label: "Dashboard", value: "dashboard" },
    { 
      label: "Reception", 
      value: "reception",
      children: [
        { label: "Receptionist Monthly Report", value: "receptionist_monthly_report" }
      ]
    },
    { 
      label: "Payment Center", 
      value: "payment_center",
      children: [
        { label: "Cashier Monthly Report", value: "cashier_monthly_report" }
      ]
    },
    { 
      label: "Consultation Room", 
      value: "consultation_room",
      children: [
        { label: "Clinician Monthly Report", value: "optometrist_monthly_report" },
        { label: "Examination Performance Report Card", value: "optometry_report_card" },
        { label: "Examination KPI Report Card", value: "optometry_kpi_report_card" },
        { label: "CRM KPI Report Card", value: "crm_kpi_report_card" }
      ]
    },
    { label: "Outpatient Dispensing", value: "optician_center" },
    { label: "Medicine Center", value: "medicine_center" },
    { label: "Dispensing", value: "dispensing" },
    { label: "Other Dispensing", value: "other_dispensing" },
    { 
      label: "Sales Center", 
      value: "sales_center",
      children: [
        { label: "Sales Manager Monthly Report", value: "sales_manager_monthly_report" },
        { label: "Sales KPI Report Card", value: "sales_kpi_report_card" },
        { label: "CRM KPI Report Card", value: "crm_kpi_report_card" }
      ]
    },
    { label: "Inventory Management", value: "inventory_management" },
    { label: "Sales Management", value: "sales_management" },
    { 
      label: "CRM Reports", 
      value: "crm_reports",
      children: [
        { label: "CRM Report Card", value: "crm_report_card" },
        { label: "Marketing Contact Analytics", value: "marketing_contact_analytics" },
        { label: "Lead Conversion Report", value: "lead_conversion_report" }
      ]
    },
    { 
      label: "Examination Reports", 
      value: "optometry_reports",
      children: [
        { label: "Examination Report Card", value: "optometry_report_card" }
      ]
    },
    { 
      label: "Sales Reports", 
      value: "sales_reports",
      children: [
        { label: "Sales Report Card", value: "sales_report_card" }
      ]
    },
    { 
      label: "Marketing", 
      value: "marketing",
      children: [
        { label: "Marketing Operations Monthly Report", value: "marketing_operations_monthly_report" },
        { label: "CRM Reports", value: "crm_reports" }
      ]
    },
    { label: "Financial Management", value: "financial_management" },
    { label: "Employee Management", value: "user_management" },
    { label: "Director", value: "director" },
    { label: "Office & Communications", value: "office_calendar" },
    { label: "Calendar Edit", value: "calendar_edit" },
    { label: "Settings", value: "settings" },
  ];
};

/**
 * Get suggested privileges for a given department name.
 * Used to auto-suggest checkboxes when a department is selected during employee creation.
 */
export const getPrivilegesForDepartment = (departmentName) => {
  if (!departmentName) return [];
  const name = departmentName.toString().toLowerCase();

  if (name.includes('reception') || name.includes('front desk'))
    return ['reception'];
  if (name.includes('cashier') || name.includes('payment') || name.includes('billing'))
    return ['payment_center'];
  if (name.includes('consultation') || name.includes('doctor') || name.includes('clinical'))
    return ['consultation_room'];
  if (name.includes('optician') || name.includes('dispensing'))
    return ['optician_center', 'dispensing'];
  if (name.includes('pharmacy') || name.includes('medicine'))
    return ['medicine_center'];
  if (name.includes('sales'))
    return ['sales_center'];
  if (name.includes('inventory') || name.includes('stock') || name.includes('store'))
    return ['inventory_management'];
  if (name.includes('marketing') || name.includes('crm') || name.includes('client relation'))
    return ['marketing'];
  if (name.includes('finance') || name.includes('account'))
    return ['financial_management'];
  if (name.includes('hr') || name.includes('human resource') || name.includes('admin'))
    return ['user_management'];
  if (name.includes('director') || name.includes('management') || name.includes('executive'))
    return ['director'];
  if (name.includes('procedure') || name.includes('surgery') || name.includes('theatre'))
    return ['procedure_room'];

  return [];
};

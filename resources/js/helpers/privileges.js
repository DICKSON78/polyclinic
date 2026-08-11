/**
 * Privilege checking utilities
 */
export const isPrivilegeGranted = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true" || value === "Yes" || value === "yes") {
    return true;
  }
  return false;
};

export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === "Admin" || 
         user.is_admin === true || 
         user.is_admin === 1 || 
         user.is_admin === "1";
};

const PRIVILEGE_ALIASES = {
  sales_center: ["sales"],
  sales: ["sales_center"],
  user_management: ["employee_management"],
  employee_management: ["user_management"],
  laboratory: ["lab"],
  lab: ["laboratory"],
  wards: ["inpatient"],
  inpatient: ["wards"],
};

const ROLE_FALLBACK_PRIVILEGES = {
  Admin: [
    "dashboard",
    "reception",
    "payment_center",
    "consultation_room",
    "optician_center",
    "medicine_center",
    "procedure_room",
    "inventory_management",
    "financial_management",
    "employee_management",
    "settings",
    "clear_pending_bill",
    "customer_relationship_management",
    "receptionist_monthly_report",
    "cashier_monthly_report",
    "optometrist_monthly_report",
    "dispensing",
    "other_dispensing",
    "sales_center",
    "sales_manager_monthly_report",
    "user_management",
    "marketing",
    "marketing_operations_monthly_report",
    "director",
    "office_calendar",
    "calendar_edit",
    "optometry_report_card",
    "sales_report_card",
    "crm_report_card",
    "triage",
    "laboratory",
    "radiology",
    "wards",
    "e_prescription",
    "appointments",
  ],
  Director: [
    "dashboard",
    "reception",
    "payment_center",
    "consultation_room",
    "optician_center",
    "medicine_center",
    "procedure_room",
    "inventory_management",
    "financial_management",
    "employee_management",
    "clear_pending_bill",
    "customer_relationship_management",
    "receptionist_monthly_report",
    "cashier_monthly_report",
    "optometrist_monthly_report",
    "dispensing",
    "other_dispensing",
    "sales_center",
    "sales_manager_monthly_report",
    "user_management",
    "marketing",
    "marketing_operations_monthly_report",
    "director",
    "office_calendar",
    "calendar_edit",
    "optometry_report_card",
    "sales_report_card",
    "crm_report_card",
    "triage",
    "laboratory",
    "radiology",
    "wards",
    "e_prescription",
    "appointments",
  ],
  Receptionist: ["dashboard", "reception", "patient_registration", "reception_reports", "website_appointments", "triage"],
  Cashier: ["dashboard", "payment_center", "credit_patients_approval", "patient_bills", "invoices", "expenses", "payment_center_reports"],
  Doctor: ["dashboard", "consultation_room", "consultation_reports", "optometry_report_card", "laboratory", "radiology", "wards", "e_prescription"],
  Optometrist: ["dashboard", "consultation_room", "consultation_reports", "optometry_report_card"],
  Optician: ["dashboard", "optician_center", "workshop_reports"],
  Pharmacist: ["dashboard", "medicine_center", "pharmacy_reports", "dispensing_reports"],
  Nurse: ["dashboard", "triage"],
  LabTechnician: ["dashboard", "laboratory", "laboratory_reports"],
  Radiologist: ["dashboard", "radiology", "radiology_reports"],
  SalesManager: ["sales_center", "sales", "sales_manager_monthly_report", "sales_report_card"],
  Sales: ["sales_center", "sales", "sales_report_card"],
  Storekeeper: ["dashboard", "inventory_management", "inventory_reports"],
  InventoryManager: ["dashboard", "inventory_management", "inventory_reports"],
  Accountant: ["dashboard", "financial_management", "financial_reports"],
  FinanceManager: ["dashboard", "financial_management", "financial_reports"],
  HR: ["dashboard", "employee_management", "employee_reports"],
  EmployeeManager: ["dashboard", "employee_management", "employee_reports"],
  Marketing: ["marketing", "marketing_operations_monthly_report", "office_calendar"],
  MarketingManager: ["marketing", "marketing_operations_monthly_report", "office_calendar"],
  Client: [],
};

const normalizePrivilegePayload = (payload) => {
  if (!payload) return {};

  let normalized = payload;

  if (typeof normalized === "string") {
    try {
      normalized = JSON.parse(normalized);
    } catch (e) {
      return {};
    }
  }

  if (Array.isArray(normalized)) {
    const result = {};
    normalized.forEach((item) => {
      if (typeof item === "string") {
        result[item] = true;
        return;
      }
      if (item && typeof item === "object") {
        if (typeof item.privilege === "string") {
          result[item.privilege] = true;
          return;
        }
        Object.keys(item).forEach((key) => {
          result[key] = item[key];
        });
      }
    });
    return result;
  }

  if (normalized && typeof normalized === "object") {
    if (
      normalized.original &&
      typeof normalized.original === "object" &&
      Object.keys(normalized).length === 1
    ) {
      return normalizePrivilegePayload(normalized.original);
    }
    return normalized;
  }

  return {};
};

const getNormalizedPrivileges = (user) => {
  const rawPrivileges =
    user?.privileges ?? user?.access ?? user?.user_privileges ?? {};

  const normalized = normalizePrivilegePayload(rawPrivileges);
  const hasAnyExplicitPrivilege = Object.keys(normalized).length > 0;

  if (!hasAnyExplicitPrivilege) {
    const roleKey = (user?.role || "").toString().trim().toLowerCase();
    const fallbackPrivileges = ROLE_FALLBACK_PRIVILEGES[roleKey] || [];
    fallbackPrivileges.forEach((privilege) => {
      normalized[privilege] = true;
    });
  }

  return normalized;
};

export const hasPrivilege = (user, privilegeKey) => {
  if (!user || !privilegeKey) {
    return false;
  }
  
  if (isAdmin(user)) {
    return true;
  }
  
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  const privilegeValue = normalizedPrivileges[privilegeKey];
  let granted = isPrivilegeGranted(privilegeValue);
  
  if (!granted) {
    const aliasKeys = PRIVILEGE_ALIASES[privilegeKey] || [];
    for (const aliasKey of aliasKeys) {
      if (isPrivilegeGranted(normalizedPrivileges[aliasKey])) {
        granted = true;
        break;
      }
    }
  }
  
  if (!granted) {
    const roleKey = (user?.role || "").toString().trim().toLowerCase();
    const fallbackPrivileges = ROLE_FALLBACK_PRIVILEGES[roleKey] || [];
    granted = fallbackPrivileges.includes(privilegeKey);
  }
  
  return granted;
};

export const hasReportAccess = (user, parentPrivilege, reportPrivilege) => {
  if (!user) return false;
  
  if (isAdmin(user)) {
    return true;
  }
  
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  let hasParent = isPrivilegeGranted(normalizedPrivileges[parentPrivilege]);
  
  if (!hasParent) {
    const aliasKeys = PRIVILEGE_ALIASES[parentPrivilege] || [];
    hasParent = aliasKeys.some((k) => isPrivilegeGranted(normalizedPrivileges[k]));
  }
  
  const hasReport = reportPrivilege ? isPrivilegeGranted(normalizedPrivileges[reportPrivilege]) : false;
  
  return hasParent || hasReport;
};

export const getDefaultRoute = (user) => {
  if (!user) return "/login";
  
  if (isAdmin(user)) {
    return "/dashboard";
  }
  
  // Role-based routing for specific roles
  const role = (user?.role || "").toString().trim();
  
  switch (role) {
    case "Receptionist":
      return "/reception/dashboard";
    case "Cashier":
      return "/payment-center/dashboard";
    case "Doctor":
    case "Optometrist":
      return "/consultation-room/dashboard";
    case "Optician":
      return "/optician-center/dashboard";
    case "Nurse":
      return "/triage/dashboard";
    case "Lab Technician":
      return "/laboratory/dashboard";
    case "Radiologist":
      return "/radiology/dashboard";
    case "Pharmacist":
      return "/medicine-center/dashboard";
    case "Sales Manager":
    case "Sales":
      return "/sales-management/dashboard";
    case "Storekeeper":
    case "Inventory Manager":
      return "/inventory-management/dashboard";
    case "Accountant":
    case "Finance Manager":
      return "/financial-management/dashboard";
    case "HR":
    case "Employee Manager":
      return "/user-management/users";
    case "Marketing":
    case "Marketing Manager":
      return "/marketing/dashboard";
    case "Director":
      return "/dashboard";
    default:
      break;
  }
  
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  const routeCandidates = [
    { privilege: 'dashboard', route: '/dashboard' },
    { privilege: 'reception', route: '/reception/dashboard' },
    { privilege: 'triage', route: '/triage/dashboard' },
    { privilege: 'payment_center', route: '/payment-center/dashboard' },
    { privilege: 'consultation_room', route: '/consultation-room/dashboard' },
    { privilege: 'optician_center', route: '/optician-center/dashboard' },
    { privilege: 'laboratory', route: '/laboratory/dashboard' },
    { privilege: 'radiology', route: '/radiology/dashboard' },
    { privilege: 'medicine_center', route: '/medicine-center/dashboard' },
    { privilege: 'procedure_room', route: '/procedure-room/dashboard' },
    { privilege: 'inventory_management', route: '/inventory-management/dashboard' },
    { privilege: 'sales_center', route: '/sales-management/dashboard' },
    { privilege: 'financial_management', route: '/financial-management/dashboard' },
    { privilege: 'user_management', route: '/user-management/users' },
    { privilege: 'settings', route: '/settings/preferences' },
    { privilege: 'marketing', route: '/marketing/dashboard' },
  ];
  
  for (const candidate of routeCandidates) {
    if (hasPrivilege({ ...user, privileges: normalizedPrivileges }, candidate.privilege)) {
      return candidate.route;
    }
  }
  
  return "/dashboard";
};
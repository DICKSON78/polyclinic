import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useNotificationContext } from "../contexts/NotificationContext";
import { hasPrivilege, isAdmin } from "../helpers/privileges";

// Material-UI Icons - All imports consolidated and deduplicated
import {
  AddRounded as AddIcon,
  AssessmentRounded as PerformanceIcon,
  AssignmentRounded as PrescriptionIcon,
  BadgeRounded as JobTitlesIcon,
  BusinessCenterRounded as DirectorIcon,
  CheckCircleRounded as CheckCircleIcon,
  ContactsRounded as ClinicDetailsIcon,
  ContactMailRounded as ContactIcon,
  DoneAllRounded as DoneIcon,
  EmailRounded as EmailIcon,
  EventNoteRounded as AppointmentsIcon,
  EventRounded as EventsIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  GroupRounded as PeopleIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  InfoRounded as InfoIcon,
  Inventory2Rounded as ItemsIcon,
  LibraryBooksRounded as ReportsIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocalHospitalRounded as ClinicsIcon,
  LocationSearchingRounded as MarketResearchIcon,
  ManageAccountsRounded as UserManagementIcon,
  MedicationRounded as MedicineIcon,
  MessageRounded as MessageIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PestControlRounded as DiseasesIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  PhoneRounded as PhoneIcon,
  PointOfSaleRounded as SalesIcon,
  ReceiptRounded as ReceiptIcon,
  ScheduleRounded as PatientsToReturnIcon,
  SendRounded as MarketingStrategiesIcon,
  SettingsRounded as SettingsIcon,
  StarBorderRounded as StarIcon,  // Changed to StarBorderRounded to avoid duplicate
  StarRounded as VipIcon,
  TaskAltRounded as DoctorTaskIcon,
  TaskRounded as DailyActivitiesIcon,
  TrendingDownRounded as ExpensesIcon,
  WarningRounded as WarningIcon,
  WindowRounded as DepartmentsIcon,
  Visibility as EyeIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";

import GlassPatientsIcon from "./icons/AddLens";
import { BiotechRounded as LabIcon, MonitorHeartRounded as TriageIcon, RadioRounded as RadiologyIcon, BedRounded as WardsIcon, FavoriteBorderRounded as VitalsIcon, EmergencyRounded as EmergencyIcon, MeetingRoomRounded as TheatreIcon, MedicalServicesRounded as SurgeryIcon, AirRounded as AnesthesiaIcon } from "@mui/icons-material";

const SingleLevelMenuItem = ({ item, setDrawerOpen, location, navigate }) => {
  const isSelected = () => {
    if (location.pathname === item.to) {
      return true;
    }

    if (location.pathname.indexOf(item.to) === 0) {
      const nextChars = location.pathname.substring(item.to.length);
      if (/^\/.+/.test(nextChars)) {
        return true;
      }
    }

    return false;
  };

  return item.subheader ? (
    <ListSubheader sx={{
      px: { xs: 1, sm: 1, md: 1.5 },
      fontWeight: 700,
      fontSize: '0.7875rem'
    }}>
      {item.title}
    </ListSubheader>
  ) : (
    <ListItemButton
      selected={isSelected()}
      onClick={() => {
        navigate(item.to);
        if (typeof setDrawerOpen === "function") {
          setDrawerOpen(false);
        }
      }}
      sx={{
        color: "text.secondary",
        "& .MuiListItemIcon-root": {
          color: "inherit",
        },
        "&:hover, &.Mui-selected, &.Mui-selected:hover": {
          color: "primary.main",
          "& .MuiListItemIcon-root": {
            color: "inherit",
          },
        },
        "&.Mui-selected, &.Mui-selected:hover": {
          borderRight: (theme) => {
            const color = theme?.palette?.primary?.main;
            return color ? `4px solid ${color}` : '4px solid #345ea8';
          },
        },
        px: { xs: 1, sm: 1, md: 1.5 },
      }}
    >
      {item.icon ? (
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={item.title} />
      {item.badge !== undefined && item.badge !== null && typeof item.badge === 'number' && item.badge > 0 ? (
        <Box
          ml={1}
          bgcolor="error.main"
          borderRadius={2}
          px={1}
          sx={{
            minWidth: '24px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'badgePop 0.5s ease-out',
            '@keyframes badgePop': {
              '0%': {
                transform: 'scale(0)',
                opacity: 0,
              },
              '50%': {
                transform: 'scale(1.2)',
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          <Typography
            color="error.contrastText"
            variant="caption"
            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          >
            {item.badge}
          </Typography>
        </Box>
      ) : null}
    </ListItemButton>
  );
};

const MultiLevelMenuItem = ({ item, location, generateMenuTree }) => {
  const [open, setOpen] = useState();

  return (
    <Box className="MuiListItem-multilevel">
      <ListItemButton
        selected={location.pathname.indexOf(item.to) === 0}
        onClick={(event) => setOpen(open === item.to ? null : item.to)}
        sx={{
          color: "text.secondary",
          "& .MuiListItemIcon-root": {
            color: "inherit",
          },
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: "primary.main",
            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
          },
          "&.Mui-selected, &.Mui-selected:hover": {
            borderRight: (theme) => {
              const color = theme?.palette?.primary?.main;
              return color ? `4px solid ${color}` : '4px solid #345ea8';
            },
          },
          px: { xs: 1, sm: 1, md: 1.5 },
        }}
      >
        {item.icon ? (
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        ) : null}
        <ListItemText primary={item.title} />
        {item.badge !== undefined && item.badge !== null && typeof item.badge === 'number' && item.badge > 0 ? (
          <Box
            ml={1.5}
            bgcolor="error.main"
            borderRadius={2}
            px={1}
            sx={{
              minWidth: '24px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'badgePop 0.5s ease-out',
              '@keyframes badgePop': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0,
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              color="error.contrastText"
              variant="caption"
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              {item.badge}
            </Typography>
          </Box>
        ) : null}
        {open === item.to ? (
          <ExpandLessIcon sx={{ ml: 0.5 }} />
        ) : (
          <ExpandMoreIcon sx={{ ml: 0.5 }} />
        )}
      </ListItemButton>

      <Collapse
        in={open === item.to}
        unmountOnExit
      >
        <List
          component="div"
          dense
          sx={{ pl: 2 }}
        >
          {generateMenuTree(item.items)}
        </List>
      </Collapse>
    </Box>
  );
};

const Menu = ({ drawerOpen, setDrawerOpen, user, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // Debug logging
  console.log('[Menu] Menu component rendered with:', {
    drawerOpen,
    user: user ? {
      id: user.id,
      username: user.username,
      role: user.role,
      privileges: user.privileges,
      privilegesType: typeof user.privileges,
      hasPrivileges: !!(user && user.privileges)
    } : null,
    itemCount: items.length
  });

  // Use NotificationContext for stable sidebar badges
  const { notifications, loading: notificationsLoading } = useNotificationContext();

  // Debug notifications
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Menu - Notifications:', notifications);
      console.log('Menu - Notifications Loading:', notificationsLoading);
      if (notifications) {
        console.log('Menu - Badge values:', {
          patients_to_return: notifications.patients_to_return,
          patients_sent_to_cashier: notifications.patients_sent_to_cashier,
          credit_patients_approval: notifications.credit_patients_approval,
          patients_sent_to_doctor: notifications.patients_sent_to_doctor,
          patients_sent_to_optician: notifications.patients_sent_to_optician,
          dispensing_requests: notifications.dispensing_requests,
          other_dispensing_requests: notifications.other_dispensing_requests,
          procedure_requests: notifications.procedure_requests,
          vip_patients: notifications.vip_patients,
          patients_sent_to_sales: notifications.patients_sent_to_sales,
        });
      }
    }
  }, [notifications, notificationsLoading]);

  const renumberTopSections = (list) => {
    let counter = 0;
    return list.map((item) => {
      if (
        item?.subheader &&
        item?.title !== "MENU" &&
        typeof item.show === "boolean" &&
        item.show
      ) {
        const baseTitle = (item.title || "").replace(/^\d+\.\s*/, "");
        counter += 1;
        return { ...item, title: `${counter}. ${baseTitle}` };
      }
      return item;
    });
  };

  // Helper function to check if privilege is granted
  const isPrivilegeGranted = (privilegeKey) => {
    if (!privilegeKey) return true;
    if (!user || !user.privileges) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Menu] User or privileges not loaded yet for ${privilegeKey}`, { user: !!user, hasPrivileges: !!(user && user.privileges) });
      }
      return false;
    }
    return hasPrivilege(user, privilegeKey);
  };

  useEffect(() => {
    if (user && user.privileges) {
      // Debug user privileges on menu load
      console.log('[Menu] User loaded:', {
        username: user.username,
        role: user.role,
        isAdmin: isAdmin(user),
        privileges: user.privileges,
        privilegesType: typeof user.privileges,
        privilegesKeys: user.privileges ? Object.keys(user.privileges) : []
      });

      // Role-based menu visibility
      const getMenuVisibility = (section) => {
        const role = (user?.role || "").toString().trim();
        const hasSalesCenterAccess = hasPrivilege(user, 'sales_center');

        switch (section) {
          case "RECEPTION":
            return role === "Admin" || role === "Director" || role === "Receptionist" || hasPrivilege(user, 'reception') || isAdmin(user);
          case "CASHIER":
            return role === "Admin" || role === "Director" || role === "Cashier" || role === "Finance Manager" || hasPrivilege(user, 'payment_center') || isAdmin(user);
          case "CONSULTATION ROOM":
            return role === "Admin" || role === "Director" || role === "Doctor" || role === "Optometrist" || hasPrivilege(user, 'consultation_room') || isAdmin(user);
          case "SALES MANAGEMENT":
            return role === "admin" || role === "director" || role === "sales manager" || role === "sales" || hasPrivilege(user, 'sales_management') || hasPrivilege(user, 'sales_center') || hasPrivilege(user, 'sales_reports') || isAdmin(user);
          case "PHARMACY":
            return role === "Admin" || role === "Director" || role === "Pharmacist" || hasPrivilege(user, 'medicine_center') || isAdmin(user);
          case "WORKSHOP":
            return role === "Admin" || role === "Director" || role === "Optician" || hasPrivilege(user, 'optician_center') || isAdmin(user);
          case "STOCK MANAGEMENT":
            return role === "Admin" || role === "Director" || role === "Storekeeper" || role === "Inventory Manager" || hasPrivilege(user, 'inventory_management') || isAdmin(user);
          case "FINANCIAL MANAGEMENT":
            return role === "Admin" || role === "Director" || isAdmin(user);
          case "EMPLOYEE MANAGEMENT":
            return role === "Admin" || role === "Director" || role === "HR" || role === "Employee Manager" || hasPrivilege(user, 'employee_management') || isAdmin(user);
          case "DIRECTOR":
            return role === "Admin" || role === "Director" || hasPrivilege(user, 'director') || isAdmin(user);
          case "SETTINGS":
            return role === "Admin" || role === "Director" || hasPrivilege(user, 'settings') || isAdmin(user);
          case "OPTOMETRY":
            return role === "Admin" || role === "Director" || role === "Doctor" || role === "Optometrist" || hasPrivilege(user, 'consultation_room') || hasPrivilege(user, 'optometry_reports') || isAdmin(user);
          case "SALES TABLE":
            return role === "admin" || role === "director" || role === "sales manager" || role === "sales" || hasSalesCenterAccess || hasPrivilege(user, 'sales_reports') || isAdmin(user);
          case "MARKETING":
            return role === "Admin" || role === "Director" || role === "Marketing" || role === "Marketing Manager" || hasPrivilege(user, 'marketing') || isAdmin(user);
          case "CRM REPORTS":
            return isAdmin(user) || hasPrivilege(user, 'crm_reports');
          case "CALENDAR":
            return hasPrivilege(user, 'office_calendar') || isAdmin(user);
          case "TRIAGE":
            return role === "Admin" || role === "Director" || role === "Nurse" || role === "Receptionist" || hasPrivilege(user, 'triage') || isAdmin(user);
          case "LABORATORY":
            return role === "Admin" || role === "Director" || role === "Lab Technician" || hasPrivilege(user, 'laboratory') || isAdmin(user);
          case "RADIOLOGY":
            return role === "Admin" || role === "Director" || role === "Radiologist" || hasPrivilege(user, 'radiology') || isAdmin(user);
          case "WARDS":
            return role === "Admin" || role === "Director" || role === "Nurse" || role === "Doctor" || hasPrivilege(user, 'wards') || isAdmin(user);
          case "E_PRESCRIPTION":
            return role === "Admin" || role === "Director" || role === "Doctor" || hasPrivilege(user, 'e_prescription') || isAdmin(user);
          case "INSURANCE":
            return role === "Admin" || role === "Director" || hasPrivilege(user, 'insurance') || hasPrivilege(user, 'insurance_management') || isAdmin(user);
          default:
            return isAdmin(user);
        }
      };

      setItems(renumberTopSections([
        {
          title: "MENU",
          subheader: true,
          show: isAdmin(user),
        },
        {
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
          show: isAdmin(user),
        },
        {
          title: "1. RECEPTION",
          subheader: true,
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Reception Dashboard",
          icon: <HomeIcon />,
          to: "/reception/dashboard",
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Register new clients",
          icon: <PeopleIcon />,
          to: "/reception/register-new-client",
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Client Lists",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
          badge: notifications && typeof notifications.patients_to_return !== 'undefined' && notifications.patients_to_return != null ? (Number(notifications.patients_to_return) || 0) : 0,
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Sent Messages",
          icon: <MessageIcon />,
          to: "/reception/sent-messages",
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/reception/reports",
          show: getMenuVisibility('RECEPTION'),
          items: [
            {
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/reception/reports/patient-registration",
              show: getMenuVisibility('RECEPTION'),
            },
          ],
        },
        {
          title: "Website Appointments",
          icon: <AppointmentsIcon />,
          to: "/external-links/website-appointments",
          badge: notifications && typeof notifications.website_appointments !== 'undefined' && notifications.website_appointments != null ? (Number(notifications.website_appointments) || 0) : 0,
          show: getMenuVisibility('RECEPTION'),
        },
        {
          title: "2. TRIAGE",
          subheader: true,
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Triage Dashboard",
          icon: <TriageIcon />,
          to: "/triage/dashboard",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Triage Queue",
          icon: <WaitingIcon />,
          to: "/triage/queue",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Emergency Department",
          icon: <EmergencyIcon />,
          to: "/emergency/dashboard",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "ER Visits",
          icon: <WaitingIcon />,
          to: "/emergency/visits",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Ambulance",
          icon: <EmergencyIcon />,
          to: "/ambulance/dashboard",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Ambulance Requests",
          icon: <WaitingIcon />,
          to: "/ambulance/requests",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "Ambulance Trips",
          icon: <EmergencyIcon />,
          to: "/ambulance/trips",
          show: getMenuVisibility('TRIAGE'),
        },
        {
          title: "3. CASHIER",
          subheader: true,
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Cashier Dashboard",
          icon: <HomeIcon />,
          to: "/payment-center/dashboard",
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          badge: notifications && typeof notifications.patients_sent_to_cashier !== 'undefined' && notifications.patients_sent_to_cashier != null ? (Number(notifications.patients_sent_to_cashier) || 0) : 0,
          show: getMenuVisibility('CASHIER'),
        },
        // Credit Patients Approval menu item commented out
        // {
        //   title: "Credit Patients Approval",
        //   icon: <WaitingIcon />,
        //   to: "/payment-center/pending-credit-patients",
        //   badge: notifications && typeof notifications.credit_patients_approval !== 'undefined' && notifications.credit_patients_approval != null ? (Number(notifications.credit_patients_approval) || 0) : 0,
        //   show: getMenuVisibility('CASHIER'),
        // },
        {
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Cleared Patient Bills",
          icon: <DoneIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Invoices",
          icon: <ReceiptIcon />,
          to: "/payment-center/invoices",
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/payment-center/expenses",
          show: getMenuVisibility('CASHIER'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/payment-center/reports",
          show: getMenuVisibility('CASHIER'),
          items: [
            {
              title: "Daily Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-credit-collection",
              show: getMenuVisibility('CASHIER'),
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/expenses",
              show: getMenuVisibility('CASHIER'),
            },
          ],
        },
        {
          title: "4. EXAMINATIONS",
          subheader: true,
          show: getMenuVisibility('CONSULTATION ROOM'),
        },


        {
          title: "5. LABORATORY",
          subheader: true,
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Lab Dashboard",
          icon: <LabIcon />,
          to: "/laboratory/dashboard",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Lab Requests",
          icon: <LabIcon />,
          to: "/laboratory/requests",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Sample Collection",
          icon: <VitalsIcon />,
          to: "/laboratory/samples",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Results Entry",
          icon: <DoneIcon />,
          to: "/laboratory/results",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Lab Reports",
          icon: <ReportsIcon />,
          to: "/laboratory/reports",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "6. RADIOLOGY",
          subheader: true,
          show: getMenuVisibility('RADIOLOGY'),
        },
        {
          title: "Radiology Dashboard",
          icon: <RadiologyIcon />,
          to: "/radiology/dashboard",
          show: getMenuVisibility('RADIOLOGY'),
        },
        {
          title: "Imaging Requests",
          icon: <RadiologyIcon />,
          to: "/radiology/requests",
          show: getMenuVisibility('RADIOLOGY'),
        },
        {
          title: "Results Entry",
          icon: <DoneIcon />,
          to: "/radiology/results",
          show: getMenuVisibility('RADIOLOGY'),
        },
        {
          title: "Exam Catalog",
          icon: <ReportsIcon />,
          to: "/radiology/exams",
          show: getMenuVisibility('RADIOLOGY'),
        },
        {
          title: "7. BLOOD BANK",
          subheader: true,
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Blood Bank Dashboard",
          icon: <LabIcon />,
          to: "/blood-bank/dashboard",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Blood Inventory",
          icon: <LabIcon />,
          to: "/blood-bank/units",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Blood Donors",
          icon: <VitalsIcon />,
          to: "/blood-bank/donors",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "Transfusions",
          icon: <DoneIcon />,
          to: "/blood-bank/transfusions",
          show: getMenuVisibility('LABORATORY'),
        },
        {
          title: "8. E-PRESCRIPTION",
          subheader: true,
          show: getMenuVisibility('E_PRESCRIPTION'),
        },
        {
          title: "E-Prescription Dashboard",
          icon: <PrescriptionIcon />,
          to: "/e-prescription/dashboard",
          show: getMenuVisibility('E_PRESCRIPTION'),
        },
        {
          title: "Prescriptions",
          icon: <PrescriptionIcon />,
          to: "/e-prescription/prescriptions",
          show: getMenuVisibility('E_PRESCRIPTION'),
        },
        {
          title: "9. WARDS / INPATIENT",
          subheader: true,
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Wards Dashboard",
          icon: <WardsIcon />,
          to: "/wards/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Admissions",
          icon: <WardsIcon />,
          to: "/wards/admissions",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Bed Management",
          icon: <VitalsIcon />,
          to: "/wards/beds",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Inpatient Notes",
          icon: <DoneIcon />,
          to: "/wards/notes",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Discharges",
          icon: <DoneIcon />,
          to: "/wards/discharges",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Operating Theatre",
          icon: <TheatreIcon />,
          to: "/operating-theatre/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Surgeries",
          icon: <SurgeryIcon />,
          to: "/operating-theatre/surgeries",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Anesthesia Records",
          icon: <AnesthesiaIcon />,
          to: "/anesthesia/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Mortuary",
          icon: <VitalsIcon />,
          to: "/mortuary/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Mortuary Bodies",
          icon: <WardsIcon />,
          to: "/mortuary/bodies",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Death Certificates",
          icon: <DoneIcon />,
          to: "/mortuary/certificates",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Inpatient Billing",
          icon: <ReceiptIcon />,
          to: "/inpatient-billing/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Inpatient Charges",
          icon: <ItemsIcon />,
          to: "/inpatient-billing/charges",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Inpatient Bills",
          icon: <ReceiptIcon />,
          to: "/inpatient-billing/bills",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Ward Records Dashboard",
          icon: <WardsIcon />,
          to: "/ward-records/dashboard",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Discharge Summaries",
          icon: <DoneIcon />,
          to: "/ward-records/discharge",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Nursing Charts",
          icon: <VitalsIcon />,
          to: "/ward-records/nursing",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Fluid Balance",
          icon: <VitalsIcon />,
          to: "/ward-records/fluid-balance",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "Medication Admin Record",
          icon: <ReceiptIcon />,
          to: "/ward-records/mar",
          show: getMenuVisibility('WARDS'),
        },
        {
          title: "10. CONSULTATION ROOM",
          subheader: true,
          show: getMenuVisibility('CONSULTATION ROOM'),
        },
        {
          title: "Consultation Room Dashboard",
          icon: <HomeIcon />,
          to: "/consultation-room/dashboard",
          show: getMenuVisibility('CONSULTATION ROOM'),
        },
        {
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          badge: notifications && typeof notifications.patients_sent_to_doctor !== 'undefined' && notifications.patients_sent_to_doctor != null ? (Number(notifications.patients_sent_to_doctor) || 0) : 0,
          show: getMenuVisibility('CONSULTATION ROOM'),
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: getMenuVisibility('CONSULTATION ROOM'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/consultation-room/reports",
          show: getMenuVisibility('CONSULTATION ROOM'),
          items: [
            {
              title: "Consultation Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/consultation",
              show: getMenuVisibility('CONSULTATION ROOM'),
            },
          ],
        },
        {
          title: "11. SALES TABLE",
          subheader: true,
          show: getMenuVisibility('SALES MANAGEMENT'),
        },
        {
          title: "Sales Management Dashboard",
          icon: <HomeIcon />,
          to: "/sales-management/dashboard",
          show: getMenuVisibility('SALES MANAGEMENT'),
        },
        {
          title: "Client Lists",
          icon: <PeopleIcon />,
          to: "/sales-management/clients",
          show: getMenuVisibility('SALES MANAGEMENT'),
        },
        {
          title: "Prescriptions Without Purchases",
          icon: <PrescriptionIcon />,
          to: "/sales-management/prescriptions",
          show: getMenuVisibility('SALES MANAGEMENT'),
        },
        {
          title: "Patients Sent to Sales",
          icon: <PrescriptionIcon />,
          to: "/sales-management/clinical-notes",
          show: getMenuVisibility('SALES MANAGEMENT'),
          badge: notifications && typeof notifications.patients_sent_to_sales !== 'undefined' && notifications.patients_sent_to_sales != null ? (Number(notifications.patients_sent_to_sales) || 0) : 0,
        },
        {
          title: "12. PHARMACY",
          subheader: true,
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Pharmacy Dashboard",
          icon: <HomeIcon />,
          to: "/pharmacy/dashboard",
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Medicine Alerts",
          icon: <WarningIcon />,
          to: "/pharmacy/medicine-alerts",
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Medicine Taking",
          icon: <MedicineIcon />,
          to: "/pharmacy/medicine-taking",
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Medicine Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/pharmacy/dispensing-requests",
          badge: notifications && typeof notifications.dispensing_requests !== 'undefined' && notifications.dispensing_requests != null ? (Number(notifications.dispensing_requests) || 0) : 0,
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Pharmacy Reports",
          icon: <ReportsIcon />,
          to: "/pharmacy/reports",
          show: getMenuVisibility('PHARMACY'),
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/pharmacy/reports/stock-management",
              show: getMenuVisibility('PHARMACY'),
              items: [
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/pharmacy/reports/stock-management/item-balance",
                  show: getMenuVisibility('PHARMACY'),
                },
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/pharmacy/reports/stock-management/item-quantity-dispensed",
                  show: getMenuVisibility('PHARMACY'),
                },
              ],
            },
            {
              title: "Pharmacy Monthly Report",
              icon: <ReportsIcon />,
              to: "/pharmacy/reports/pharmacy-monthly-report",
              show: getMenuVisibility('PHARMACY'),
            },
          ],
        },
        {
          title: "Dispensing Reports",
          icon: <ReportsIcon />,
          to: "/dispensing/reports",
          show: getMenuVisibility('PHARMACY'),
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/items-dispensed",
              show: getMenuVisibility('PHARMACY'),
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/items-not-dispensed",
              show: getMenuVisibility('PHARMACY'),
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/item-balance",
              show: getMenuVisibility('PHARMACY'),
            },
          ],
        },
        {
          title: "13. OUTPATIENT DISPENSING",
          subheader: true,
          show: getMenuVisibility('WORKSHOP'),
        },
        {
          title: "Dispensing Dashboard",
          icon: <HomeIcon />,
          to: "/optician-center/dashboard",
          show: getMenuVisibility('WORKSHOP'),
        },
        {
          title: "Patients Sent for Dispensing",
          icon: <WaitingIcon />,
          to: "/optician-center/glass-patients",
          badge: notifications && typeof notifications.patients_sent_to_optician !== 'undefined' && notifications.patients_sent_to_optician != null ? (Number(notifications.patients_sent_to_optician) || 0) : 0,
          show: getMenuVisibility('WORKSHOP'),
        },
        {
          title: "Item Stock",
          icon: <ItemsIcon />,
          to: "/optician-center/lens-stock",
          show: getMenuVisibility('WORKSHOP'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/optician-center/reports",
          show: getMenuVisibility('WORKSHOP'),
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-dispensed",
              show: getMenuVisibility('WORKSHOP'),
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-not-dispensed",
              show: getMenuVisibility('WORKSHOP'),
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/item-balance",
              show: getMenuVisibility('WORKSHOP'),
            },
          ],
        },
        {
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/consultation-room/procedure-requests",
          badge: notifications && typeof notifications.procedure_requests !== 'undefined' && notifications.procedure_requests != null ? (Number(notifications.procedure_requests) || 0) : 0,
          show: isPrivilegeGranted('procedure_room') || isPrivilegeGranted('consultation_room'),
        },
        {
          title: "14. STOCK MANAGEMENT",
          subheader: true,
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Stock Dashboard",
          icon: <HomeIcon />,
          to: "/inventory-management/dashboard",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Stocktakes",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktakes",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Stock Alerts (All Items)",
          icon: <WarningIcon />,
          to: "/inventory-management/stock-alerts",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Item List",
          icon: <ItemsIcon />,
          to: "/inventory-management/lens-list",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Item Tracking",
          icon: <ItemsIcon />,
          to: "/inventory-management/lens-tracking",
          show: getMenuVisibility('STOCK MANAGEMENT'),
        },
        {
          title: "Medicines",
          icon: <ItemsIcon />,
          to: "/pharmacy/medicines",
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Add Medicine",
          icon: <AddIcon />,
          to: "/pharmacy/add-medicine",
          show: getMenuVisibility('PHARMACY'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/inventory-management/reports",
          show: getMenuVisibility('STOCK MANAGEMENT'),
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/inventory-management/reports/stock-management",
              show: getMenuVisibility('STOCK MANAGEMENT'),
              items: [
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/inventory-management/reports/stock-management/item-balance",
                  show: getMenuVisibility('STOCK MANAGEMENT'),
                },
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/inventory-management/reports/stock-management/item-quantity-dispensed",
                  show: getMenuVisibility('STOCK MANAGEMENT'),
                },
              ],
            },
            {
              title: "Stock Alerts",
              icon: <WarningIcon />,
              to: "/inventory-management/reports/stock-alerts",
              show: getMenuVisibility('STOCK MANAGEMENT'),
            },
          ],
        },
        {
          title: "15. FINANCIAL MANAGEMENT",
          subheader: true,
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Financial Management Dashboard",
          icon: <HomeIcon />,
          to: "/financial-management/dashboard",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/financial-management/expenses",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/financial-management/reports",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
          items: [
            {
              title: "Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cash-collection",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/credit-collection",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/pending-patient-bills",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cleared-patient-bills",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Bill Payment Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/patient-bill-payments",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expenses",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Expense Payments Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expense-payments",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Balance Sheet Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/balance-sheet",
              show: isPrivilegeGranted('financial_management'),
            },
          ],
        },
        {
          title: "16. INSURANCE",
          subheader: true,
          show: getMenuVisibility('INSURANCE'),
        },
        {
          title: "Insurance Dashboard",
          icon: <HomeIcon />,
          to: "/insurance/dashboard",
          show: getMenuVisibility('INSURANCE'),
        },
        {
          title: "Claims",
          icon: <ReceiptIcon />,
          to: "/insurance/claims",
          show: getMenuVisibility('INSURANCE'),
        },
        {
          title: "Patient Insurance",
          icon: <PeopleIcon />,
          to: "/insurance/patient-insurance",
          show: getMenuVisibility('INSURANCE'),
        },
        {
          title: "Insurance Companies",
          icon: <ItemsIcon />,
          to: "/insurance/companies",
          show: getMenuVisibility('INSURANCE'),
        },
        {
          title: "17. MARKETING",
          subheader: true,
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Marketing Dashboard",
          icon: <MarketingStrategiesIcon />,
          to: "/marketing/dashboard",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Daily Activities",
          icon: <DailyActivitiesIcon />,
          to: "/marketing/daily-activities",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Marketing Strategies",
          icon: <MarketingStrategiesIcon />,
          to: "/marketing/marketing-strategies",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Bulk SMS",
          icon: <EmailIcon />,
          to: "/marketing/bulk-sms",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Communication Logs",
          icon: <CommunicationLogsIcon />,
          to: "/marketing/communication-logs",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Dispensing Patients",
          icon: <GlassPatientsIcon />,
          to: "/marketing/glass-patients",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Source of Information",
          icon: <InfoIcon />,
          to: "/marketing/information-sources",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "High Value Patients",
          icon: <VipIcon />,
          to: "/marketing/high-value-patients",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Prestige Clients",
          icon: <StarIcon />,
          to: "/marketing/prestige-clients",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Client Calling Status",
          icon: <PhoneIcon />,
          to: "/marketing/client-calling-status",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "WhatsApp Export",
          icon: <MessageIcon />,
          to: "/marketing/whatsapp-export",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Unreachable Numbers",
          icon: <WarningIcon />,
          to: "/marketing/unreachable-numbers",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Events",
          icon: <EventsIcon />,
          to: "/marketing/events",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Research Plans",
          icon: <MarketResearchIcon />,
          to: "/marketing/research-plans",
          show: getMenuVisibility('MARKETING'),
        },
        {
          title: "Ideas",
          icon: <IdeaDevelopmentIcon />,
          to: "/marketing/ideas",
          show: getMenuVisibility('MARKETING'),
        },
        /*
        {
          title: "Marketing Contact Analytics",
          icon: <PhoneIcon />,
          to: "/marketing/marketing-contact-analytics",
          show: getMenuVisibility('MARKETING'),
        },
        */
        /*
        {
          title: "18. CRM REPORTS",
          subheader: true,
          show: getMenuVisibility('CRM REPORTS'),
        },
        {
          title: "Lead Conversion Report",
          icon: <PeopleIcon />,
          to: "/crm-reports/lead-conversion-report",
          show: getMenuVisibility('CRM REPORTS'),
        },
        {
          title: "Examination Performance Report",
          icon: <EyeIcon />,
          to: "/optometry-reports/performance-report-card",
          show: getMenuVisibility('CRM REPORTS'),
        },
        {
          title: "Sales Report",
          icon: <ShoppingCartIcon />,
          to: "/sales-reports",
          show: getMenuVisibility('CRM REPORTS'),
        },
        */
        {
          title: "19. EMPLOYEE MANAGEMENT",
          subheader: true,
          show: getMenuVisibility('EMPLOYEE MANAGEMENT'),
        },
        {
          title: "Employees",
          icon: <UserManagementIcon />,
          to: "/user-management/users",
          show: isPrivilegeGranted('employee_management'),
        },
        {
          title: "20. DIRECTOR",
          subheader: true,
          show: getMenuVisibility('DIRECTOR'),
        },
        // {
          // title: "Director Dashboard",
          // icon: <DirectorIcon />,
          // to: "/director/dashboard",
          // show: getMenuVisibility('DIRECTOR'),
        // },
        {
          title: "Employee Performance",
          icon: <PerformanceIcon />,
          to: "/director/employee-performance",
          show: getMenuVisibility('DIRECTOR'),
        },
        // {
        //   title: "All Reports",
        //   icon: <ReportsIcon />,
        //   to: "/director/reports",
        //   show: isPrivilegeGranted('director'),
        //   items: [
        //     {
        //       title: "Reception Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/reception",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Patient Registration Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/reception/patient-registration",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Payment Center Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/payment-center",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Daily Cash Collection Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/payment-center/daily-cash-collection",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Daily Cash Collection Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/payment-center/daily-credit-collection",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Expenses Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/payment-center/expenses",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Consultation Room Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/consultation-room",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Consultation Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/consultation-room/consultation",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Optometrist Monthly Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/consultation-room/optometrist-monthly-report",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Sales Center Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/sales-center",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Sales Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/sales-center/sales",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Sales Manager Monthly Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/sales-center/sales-manager-monthly-report",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Financial Management Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/financial-management",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Cash Collection Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/cash-collection",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Credit Collection Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/credit-collection",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Pending Patient Bills Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/pending-patient-bills",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Cleared Patient Bills Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/cleared-patient-bills",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Patient Bill Payments Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/patient-bill-payments",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Expenses Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/expenses",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Expense Payments Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/expense-payments",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Balance Sheet Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/financial-management/balance-sheet",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Medicine Center Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/medicine-center",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Medicines Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/medicine-center/dispensing/medicines-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Medicines Not Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/medicine-center/dispensing/medicines-not-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Item Balance Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/medicine-center/stock-management/item-balance",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Item Quantity Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/medicine-center/stock-management/item-quantity-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Medicine Alerts",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/medicine-center/medicine-alerts",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Inventory Management Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/inventory-management",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Item Balance Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/inventory-management/stock-management/item-balance",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Item Quantity Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/inventory-management/stock-management/item-quantity-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Stock Alerts",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/inventory-management/stock-alerts",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Dispensing Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/dispensing",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Items Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/dispensing/items-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Items Not Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/dispensing/items-not-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Item Balance Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/dispensing/item-balance",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //     {
        //       title: "Optician Center Reports",
        //       icon: <ReportsIcon />,
        //       to: "/director/reports/optician-center",
        //       show: isPrivilegeGranted('director'),
        //       items: [
        //         {
        //           title: "Items Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/optician-center/items-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Items Not Dispensed Report",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/optician-center/items-not-dispensed",
        //           show: isPrivilegeGranted('director'),
        //         },
        //         {
        //           title: "Item Balance",
        //           icon: <ReportsIcon />,
        //           to: "/director/reports/optician-center/item-balance",
        //           show: isPrivilegeGranted('director'),
        //         },
        //       ],
        //     },
        //   ],
        // },
        {
          title: "Calendar",
          icon: <AppointmentsIcon />,
          to: "/office-calendar",
          show: getMenuVisibility('CALENDAR'),
        },
        {
          title: "21. SETTINGS",
          subheader: true,
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: getMenuVisibility('SETTINGS'),
          items: [
            {
              title: "Units of Measure",
              icon: <SettingsIcon />,
              to: "/settings/item-management/units-of-measure",
              show: getMenuVisibility('SETTINGS'),
            },
            {
              title: "Dispensing Item Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/lens-types",
              show: getMenuVisibility('SETTINGS'),
            },
            {
              title: "Item Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/item-types",
              show: getMenuVisibility('SETTINGS'),
            },
            {
              title: "Consultation Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/consultation-types",
              show: getMenuVisibility('SETTINGS'),
            },
            {
              title: "Items",
              icon: <SettingsIcon />,
              to: "/settings/item-management/items",
              show: getMenuVisibility('SETTINGS'),
            },
          ],
        },
        {
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Expense Categories",
          icon: <ExpensesIcon />,
          to: "/settings/expense-categories",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Departments",
          icon: <DepartmentsIcon />,
          to: "/settings/departments",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Job Titles",
          icon: <JobTitlesIcon />,
          to: "/settings/job-titles",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Occupations",
          icon: <JobTitlesIcon />,
          to: "/settings/occupations",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Clinic Details",
          icon: <ClinicDetailsIcon />,
          to: "/settings/clinic-details",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "System Preferences",
          icon: <SettingsIcon />,
          to: "/settings/preferences",
          show: getMenuVisibility('SETTINGS'),
        },
        {
          title: "Clinics",
          icon: <ClinicsIcon />,
          to: "/settings/clinics",
          show: (hasPrivilege(user, 'settings') || isAdmin(user)) && isAdmin(user),
        },
        {
          title: "Performance Targets",
          icon: <PerformanceIcon />,
          to: "/settings/performance-targets",
          show: getMenuVisibility('SETTINGS'),
        },
      ]));

      // Debug: Log visible menu items
      const visibleItems = items.filter(item => item.show !== false);
      const hiddenItems = items.filter(item => item.show === false);
      console.log('[Menu] Menu items summary:', {
        total: items.length,
        visible: visibleItems.length,
        hidden: hiddenItems.length,
        visibleSections: visibleItems.filter(i => i.subheader).map(i => i.title),
        hiddenSections: hiddenItems.filter(i => i.subheader).map(i => i.title)
      });
    } else {
      console.log('[Menu] No user object, menu items cleared');
      setItems([]);
    }
  }, [user, notifications]);

  const generateMenuTree = (items) => {
    if (!items) return null;

    // First, identify which section headers should be shown based on visible children
    const sectionVisibility = new Map();

    // Helper function to recursively check if an item or any of its children are visible
    const hasVisibleContent = (item) => {
      // Check if the item itself is visible
      if (typeof item.show === "boolean" && item.show) {
        return true;
      }
      // Check nested items recursively
      if (item.items && Array.isArray(item.items)) {
        return item.items.some(nestedItem => hasVisibleContent(nestedItem));
      }
      return false;
    };

    items.forEach((item, index) => {
      if (item.subheader && item.title !== "MENU") {
        // Find all items that belong to this section (items after this subheader until next subheader)
        const sectionItems = [];
        for (let i = index + 1; i < items.length; i++) {
          const nextItem = items[i];
          if (nextItem.subheader) {
            // Reached next section, stop
            break;
          }
          sectionItems.push(nextItem);
        }

        // Check if any item in this section is visible (including nested items)
        const hasVisibleItems = sectionItems.some(sectionItem => hasVisibleContent(sectionItem));

        sectionVisibility.set(index, hasVisibleItems);
      }
    });

    // Filter items based on show property
    const filteredItems = items.filter((e, index) => {
      // For section headers, check if they have visible children
      if (e.subheader) {
        if (e.title === "MENU") {
          return true; // Always show the main MENU header
        }
        // Check if this section has any visible items
        return sectionVisibility.get(index) === true;
      }
      // For regular items, check the show property
      return typeof e.show === "boolean" && e.show;
    });

    return filteredItems.map((e, index) => {
      const hasChildren = e.items?.filter(
        (child) => typeof child.show === "boolean" && child.show
      )?.length;
      // Generate unique key: use title + route combination to ensure uniqueness
      const uniqueKey = e.subheader
        ? `subheader-${e.title}-${index}`
        : `${e.title}-${e.to || index}-${index}`;
      return hasChildren ? (
        <MultiLevelMenuItem
          key={uniqueKey}
          item={e}
          location={location}
          generateMenuTree={generateMenuTree}
        />
      ) : (
        <SingleLevelMenuItem
          key={uniqueKey}
          item={e}
          setDrawerOpen={setDrawerOpen}
          location={location}
          navigate={navigate}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "scroll",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "10px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.05)"
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#555",
        },
      }}
    >
      <List
        component="nav"
        dense
        disablePadding
        {...rest}
      >
        {generateMenuTree(items)}
      </List>
    </Box>
  );
};

export default Menu;
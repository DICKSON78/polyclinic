import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContextProvider } from "../contexts/ToastContext";
import { FilterProvider } from "../contexts/FilterContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "./ErrorBoundary";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";
import navigationFix from "../utils/navigationFix";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import RoleBasedDashboard from "./RoleBasedDashboard";
import SalesExpenses from "../pages/dashboard/sales-expenses/SalesExpenses";
import PatientRegistration from "../pages/dashboard/patient-registration/PatientRegistration";

// Lazy-load route modules to reduce initial bundle size
const ReceptionRoutes = lazy(() => import("../pages/reception/ReceptionRoutes"));
const PaymentCenterRoutes = lazy(() => import("../pages/payment-center/PaymentCenterRoutes"));
const ConsultationRoomRoutes = lazy(() => import("../pages/consultation-room/ConsultationRoomRoutes"));
const SalesCenterRoutes = lazy(() => import("../pages/sales-center/SalesCenterRoutes"));
const SalesManagementRoutes = lazy(() => import("../pages/sales-management/SalesManagementRoutes"));
const OpticianCenterRoutes = lazy(() => import("../pages/optician-center/OpticianCenterRoutes"));
const MedicineCenterRoutes = lazy(() => import("../pages/medicine-center/MedicineCenterRoutes"));
const ProcedureRoomRoutes = lazy(() => import("../pages/procedure-room/ProcedureRoomRoutes"));
const OtherDispensingRoutes = lazy(() => import("../pages/other-dispensing/OtherDispensingRoutes"));
const DispensingMainRoutes = lazy(() => import("../pages/dispensing/DispensingMainRoutes"));
const InventoryManagementRoutes = lazy(() => import("../pages/inventory-management/InventoryManagementRoutes"));
const FinancialManagementRoutes = lazy(() => import("../pages/financial-management/FinancialManagementRoutes"));
const MarketingRoutes = lazy(() => import("../pages/marketing/MarketingRoutes"));
const UserManagementRoutes = lazy(() => import("../pages/user-management/UserManagementRoutes"));
const DirectorRoutes = lazy(() => import("../pages/director/DirectorRoutes"));
const SettingsRoutes = lazy(() => import("../pages/settings/SettingsRoutes"));
const OfficeCalendarRoutes = lazy(() => import("../pages/office-calendar/OfficeCalendarRoutes"));
const PatientRecordsRoutes = lazy(() => import("../pages/patient-records/PatientRecordsRoutes"));
const ExternalLinksRoutes = lazy(() => import("../pages/external-links/ExternalLinksRoutes"));
const CRMReportsRoutes = lazy(() => import("../pages/crm-reports/CRMReportsRoutes"));
const OptometryReportsRoutes = lazy(() => import("../pages/optometry-reports/OptometryReportsRoutes"));
const SalesReportsRoutes = lazy(() => import("../pages/sales-reports/SalesReportsRoutes"));
const TriageRoutes = lazy(() => import("../pages/triage/TriageRoutes"));
const LaboratoryRoutes = lazy(() => import("../pages/laboratory/LaboratoryRoutes"));
const RadiologyRoutes = lazy(() => import("../pages/radiology/RadiologyRoutes"));
const EPrescriptionRoutes = lazy(() => import("../pages/e-prescription/EPrescriptionRoutes"));
const InsuranceRoutes = lazy(() => import("../pages/insurance/InsuranceRoutes"));
const EmergencyRoutes = lazy(() => import("../pages/emergency/EmergencyRoutes"));
const OperatingTheatreRoutes = lazy(() => import("../pages/operating-theatre/OperatingTheatreRoutes"));
const AnesthesiaRoutes = lazy(() => import("../pages/anesthesia/AnesthesiaRoutes"));
const WardsRoutes = lazy(() => import("../pages/wards/WardsRoutes"));
const BloodBankRoutes = lazy(() => import("../pages/blood-bank/BloodBankRoutes"));
const AmbulanceRoutes = lazy(() => import("../pages/ambulance/AmbulanceRoutes"));
const MortuaryRoutes = lazy(() => import("../pages/mortuary/MortuaryRoutes"));
const InpatientBillingRoutes = lazy(() => import("../pages/inpatient-billing/InpatientBillingRoutes"));
const WardRecordsRoutes = lazy(() => import("../pages/ward-records/WardRecordsRoutes"));

import Home from "../Home";
import About from "../About";
import Features from "../Features";
import Services from "../Services";
import Books from "../Books";
import Blog from "../Blog";
import BlogArticle from "../BlogArticle";
import Eyeware from "../Eyeware";
import FAQ from "../FAQ";
import Testimonials from "../Testimonials";
import InsurancePayment from "../InsurancePayment";
import Privacy from "../Privacy";
import Terms from "../Terms";
import Cookies from "../Cookies";
import Contact from "../Contact";
import Appointment from "../pages/appointments/Appointment";

const App = () => {
  console.log('App component initializing...');

  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem("theme_mode") || "light"
  );

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Loader removed, set to false

  // Global error handler to catch unhandled errors
  useEffect(() => {
    const handleError = (event) => {
      // Prevent default error display
      event.preventDefault();
      // Log error silently (only in console)
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled error:', event.error);
      }
      return false;
    };

    const handleRejection = (event) => {
      // Prevent default unhandled rejection display
      event.preventDefault();
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled promise rejection:', event.reason);
      }
      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Navigation fixes disabled to prevent interference with React Router
  // React.useEffect(() => {
  //   console.log('🔧 Applying global navigation fixes...');
  //   navigationFix.runAllFixes();
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <ToastContextProvider>
          <FilterProvider>
            <NotificationProvider>
              <CssBaseline />
              <GlobalStyles
                styles={{
                  "*::selection": {
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                  },
                  html: {
                    scrollBehavior: "smooth",
                    scrollbarWidth: "auto", // Enable Firefox scrollbars
                    overflowX: "auto",
                    overflowY: "auto",
                  },
                  "html::-webkit-scrollbar": {
                    width: "10px",
                    height: "10px",
                  },
                  "html::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.05)",
                  },
                  "html::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "5px",
                  },
                  "html::-webkit-scrollbar-thumb:hover": {
                    background: "#555",
                  },
                  body: {
                    overflowY: "auto",
                    overflowX: "auto",
                    scrollbarWidth: "auto", // Enable Firefox scrollbars
                  },
                  "body::-webkit-scrollbar": {
                    width: "10px",
                    height: "10px",
                  },
                  "body::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.05)",
                  },
                  "body::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "5px",
                  },
                  "body::-webkit-scrollbar-thumb:hover": {
                    background: "#555",
                  },
                  // Global scrollbar styling for all elements
                  "*": {
                    scrollbarWidth: "auto",
                    scrollbarColor: "#888 rgba(0,0,0,0.05)",
                  },
                  "*::-webkit-scrollbar": {
                    width: "10px",
                    height: "10px",
                  },
                  "*::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.05)",
                  },
                  "*::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "5px",
                  },
                  "*::-webkit-scrollbar-thumb:hover": {
                    background: "#555",
                  },
                  // Text justify for all paragraphs and body text
                  "p, .MuiTypography-body1, .MuiTypography-body2, .MuiTypography-paragraph": {
                    textAlign: "justify",
                    textJustify: "inter-word",
                  },
                  // Responsive text justify - only on larger screens
                  "@media (max-width: 600px)": {
                    "p, .MuiTypography-body1, .MuiTypography-body2": {
                      textAlign: "justify",
                      textJustify: "inter-word",
                      hyphens: "auto",
                      WebkitHyphens: "auto",
                      MozHyphens: "auto",
                    },
                  },
                }}
              />
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogArticle />} />
                  <Route path="/gallery" element={<Eyeware />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/insurance-payment" element={<InsurancePayment />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/appointment" element={<Appointment />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<AuthLayout />} />
                  {/* Redirect for common mis-typed routes */}
                  <Route
                    path="/cash-collection"
                    element={<Navigate to="/financial-management/reports/cash-collection" replace />}
                  />
                  <Route
                    path="/"
                    element={
                      <DefaultLayout
                        setThemeMode={setThemeMode}
                        setUser={setUser}
                        user={user}
                        smsBalance={smsBalance}
                      />
                    }
                  >
                    <React.Fragment>
                      <Route path="dashboard" element={<RoleBasedDashboard user={user} setSmsBalance={setSmsBalance} />} />
                      <Route path="dashboard/sales-expenses" element={<SalesExpenses />} />
                      <Route path="dashboard/patient-registration" element={<PatientRegistration />} />
                      <Route path="reception/*" element={<Suspense fallback={<div>Loading...</div>}><ReceptionRoutes /></Suspense>} />
                      <Route path="triage/*" element={<Suspense fallback={<div>Loading...</div>}><TriageRoutes /></Suspense>} />
                      <Route path="emergency/*" element={<Suspense fallback={<div>Loading...</div>}><EmergencyRoutes /></Suspense>} />
                      <Route path="operating-theatre/*" element={<Suspense fallback={<div>Loading...</div>}><OperatingTheatreRoutes /></Suspense>} />
                      <Route path="anesthesia/*" element={<Suspense fallback={<div>Loading...</div>}><AnesthesiaRoutes /></Suspense>} />
                      <Route path="laboratory/*" element={<Suspense fallback={<div>Loading...</div>}><LaboratoryRoutes /></Suspense>} />
                      <Route path="radiology/*" element={<Suspense fallback={<div>Loading...</div>}><RadiologyRoutes /></Suspense>} />
                      <Route path="e-prescription/*" element={<Suspense fallback={<div>Loading...</div>}><EPrescriptionRoutes /></Suspense>} />
                      <Route path="wards/*" element={<Suspense fallback={<div>Loading...</div>}><WardsRoutes /></Suspense>} />
                      <Route path="blood-bank/*" element={<Suspense fallback={<div>Loading...</div>}><BloodBankRoutes /></Suspense>} />
                      <Route path="ambulance/*" element={<Suspense fallback={<div>Loading...</div>}><AmbulanceRoutes /></Suspense>} />
                      <Route path="mortuary/*" element={<Suspense fallback={<div>Loading...</div>}><MortuaryRoutes /></Suspense>} />
                      <Route path="inpatient-billing/*" element={<Suspense fallback={<div>Loading...</div>}><InpatientBillingRoutes /></Suspense>} />
                      <Route path="ward-records/*" element={<Suspense fallback={<div>Loading...</div>}><WardRecordsRoutes /></Suspense>} />
                      <Route path="payment-center/*" element={<Suspense fallback={<div>Loading...</div>}><PaymentCenterRoutes /></Suspense>} />
                      <Route path="consultation-room/*" element={<Suspense fallback={<div>Loading...</div>}><ConsultationRoomRoutes /></Suspense>} />
                      <Route path="patient-records/*" element={<Suspense fallback={<div>Loading...</div>}><PatientRecordsRoutes /></Suspense>} />
                      <Route path="sales-center/*" element={<Suspense fallback={<div>Loading...</div>}><SalesCenterRoutes /></Suspense>} />
                      <Route path="sales-management/*" element={<Suspense fallback={<div>Loading...</div>}><SalesManagementRoutes /></Suspense>} />
                      <Route path="optician-center/*" element={<Suspense fallback={<div>Loading...</div>}><OpticianCenterRoutes /></Suspense>} />
                      <Route path="medicine-center/*" element={<Suspense fallback={<div>Loading...</div>}><MedicineCenterRoutes /></Suspense>} />
                      <Route path="pharmacy/*" element={<Suspense fallback={<div>Loading...</div>}><MedicineCenterRoutes /></Suspense>} />
                      <Route path="procedure-room/*" element={<Suspense fallback={<div>Loading...</div>}><ProcedureRoomRoutes /></Suspense>} />
                      <Route
                        path="dispensing/*"
                        element={<Suspense fallback={<div>Loading...</div>}><DispensingMainRoutes /></Suspense>}
                      />
                      <Route
                        path="other-dispensing/*"
                        element={<Suspense fallback={<div>Loading...</div>}><OtherDispensingRoutes /></Suspense>}
                      />
                      <Route path="inventory-management/*" element={<Suspense fallback={<div>Loading...</div>}><InventoryManagementRoutes /></Suspense>} />
                      <Route path="financial-management/*" element={<Suspense fallback={<div>Loading...</div>}><FinancialManagementRoutes /></Suspense>} />
                      <Route path="insurance/*" element={<Suspense fallback={<div>Loading...</div>}><InsuranceRoutes /></Suspense>} />
                      <Route path="marketing/*" element={<Suspense fallback={<div>Loading...</div>}><MarketingRoutes /></Suspense>} />
                      <Route path="crm-reports/*" element={<Suspense fallback={<div>Loading...</div>}><CRMReportsRoutes /></Suspense>} />
                      <Route path="optometry-reports/*" element={<Suspense fallback={<div>Loading...</div>}><OptometryReportsRoutes /></Suspense>} />
                      <Route path="sales-reports/*" element={<Suspense fallback={<div>Loading...</div>}><SalesReportsRoutes /></Suspense>} />
                      <Route path="user-management/*" element={<Suspense fallback={<div>Loading...</div>}><UserManagementRoutes /></Suspense>} />
                      <Route path="director/*" element={<Suspense fallback={<div>Loading...</div>}><DirectorRoutes /></Suspense>} />
                      <Route path="office-calendar/*" element={<Suspense fallback={<div>Loading...</div>}><OfficeCalendarRoutes /></Suspense>} />
                      <Route path="external-links/*" element={<Suspense fallback={<div>Loading...</div>}><ExternalLinksRoutes /></Suspense>} />
                      <Route path="settings/*" element={<Suspense fallback={<div>Loading...</div>}><SettingsRoutes /></Suspense>} />
                      {/* Catch-all route for unmatched paths - redirect to dashboard */}
                      <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </React.Fragment>
                  </Route>
                  {/* Catch-all for routes outside DefaultLayout */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Router>
            </NotificationProvider>
          </FilterProvider>
        </ToastContextProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;

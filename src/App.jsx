import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/home";
import Register from "./pages/register"; 
import Login from "./pages/login";

// Components
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute"; 

// Personal Tracker Pages (Formerly Vendor)
import VendorDashboard from "./pages/vendor/VendorDashboard";
import BillingPayments from "./pages/vendor/BillingPayments";   
import SettingsProfile from "./pages/vendor/SettingsProfile";   

// Corporate Pages (Business/Team Module)
import CorporateDashboard from "./pages/corporate/CorporateDashboard";
import ManageStaff from "./pages/corporate/ManageStaff";
import AttendanceTracker from "./pages/corporate/AttendanceTracker";
import SalaryCalculator from "./pages/corporate/SalaryCalculator";
import CorporateSettings from "./pages/corporate/CorporateSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 

        {/* Locked Routes (Require Authentication) */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* Personal Tracker Sub-Routes */}
            <Route path="vendor" element={<VendorDashboard />} />
            <Route path="vendor/billing" element={<BillingPayments />} />
            <Route path="vendor/settings" element={<SettingsProfile />} />

            {/* Corporate Sub-Routes */}
            <Route path="corporate" element={<CorporateDashboard />} />
            <Route path="corporate/staff" element={<ManageStaff />} />
            <Route path="corporate/attendance" element={<AttendanceTracker />} />
            <Route path="corporate/salary" element={<SalaryCalculator />} />
            <Route path="corporate/settings" element={<CorporateSettings />} />
            
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
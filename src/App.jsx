import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Register from "./pages/register"; 
import Login from "./pages/login";

// ✅ FIXED: Screenshot ke hisaab se ye files 'Vendor' folder ke andar hain
import DashboardLayout from "./components/Vendor/DashboardLayout";
import ProtectedRoute from "./components/Vendor/ProtectedRoute"; 

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ManageCustomers from "./pages/vendor/ManageCustomers";   
import DailyDeliveries from "./pages/vendor/DailyDeliveries";   
import BillingPayments from "./pages/vendor/BillingPayments";   
import SettingsProfile from "./pages/vendor/SettingsProfile";   

// Corporate Pages
import CorporateDashboard from "./pages/corporate/CorporateDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 

        {/* Locked Routes */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Vendor Sub-Routes */}
            <Route path="vendor" element={<VendorDashboard />} />
            <Route path="vendor/customers" element={<ManageCustomers />} />
            <Route path="vendor/deliveries" element={<DailyDeliveries />} />
            <Route path="vendor/billing" element={<BillingPayments />} />
            <Route path="vendor/settings" element={<SettingsProfile />} />

            {/* Corporate Sub-Routes */}
            <Route path="corporate" element={<CorporateDashboard />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Register from "./pages/register"; 
import Login from "./pages/login";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute"; 

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import ManageCustomers from "./pages/vendor/ManageCustomers";   // <-- Naya
import DailyDeliveries from "./pages/vendor/DailyDeliveries";   // <-- Naya
import BillingPayments from "./pages/vendor/BillingPayments";   // <-- Naya
import SettingsProfile from "./pages/vendor/SettingsProfile";   // <-- Naya

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

            <Route path="corporate" element={<CorporateDashboard />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
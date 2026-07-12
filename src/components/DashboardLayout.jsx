import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import VendorSidebar from "./Vendor/VendorSidebar";
import CorporateSidebar from "./Corporate/CorporateSidebar";

export default function DashboardLayout() {
  const location = useLocation();
  // Sidebar open/close control karne ke liye state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isVendorRoute = 
    location.pathname.includes("/dashboard/vendor") ||
    location.pathname.includes("/milk-tracker") ||
    location.pathname.includes("/maid-attendance-tracker") ||
    location.pathname.includes("/worker-attendance-tracker") ||
    location.pathname.includes("/customer-ledger");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Black Overlay for Mobile: Jab sidebar khulega toh peeche thoda dark ho jayega */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)} // Bahar click karne par band
        ></div>
      )}

      {/* Dynamic Sidebar - Isko props bhej rahe hain */}
      {isVendorRoute ? (
        <VendorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      ) : (
        <CorporateSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 w-full flex flex-col min-h-screen">
        
        {/* Mobile Header (Sirf chhote screens par dikhega) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">DailyTracker</h2>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-600 hover:text-blue-600 focus:outline-none p-1"
          >
            {/* Hamburger Icon */}
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
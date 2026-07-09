import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function VendorSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Check active path for highlighting buttons
  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      className={`w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0`}
    >
      <div>
        {/* Brand Header */}
        <div className="mb-10 px-2 flex justify-between items-center mt-2">
          <div>
            <h2 className="text-xl font-black tracking-wide text-blue-400">My Tracker</h2>
            <p className="text-[11px] text-emerald-400 font-bold tracking-widest uppercase mt-1">● Personal Earning</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1 bg-slate-800 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-2">
          {/* 1. My Calendar (Main Attendance/Entry) */}
          <Link 
            to="/dashboard/vendor" 
            onClick={() => setIsOpen(false)} 
            className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/dashboard/vendor") ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <span className="mr-2">📅</span> My Calendar
          </Link>
          
          {/* 2. Payments & Hisaab (Earnings Summary) */}
          <Link 
            to="/dashboard/vendor/billing" 
            onClick={() => setIsOpen(false)} 
            className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/dashboard/vendor/billing") ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <span className="mr-2">💰</span> Payments & Hisaab
          </Link>

          {/* 3. Profile & Settings */}
          <Link 
            to="/dashboard/vendor/settings" 
            onClick={() => setIsOpen(false)} 
            className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/dashboard/vendor/settings") ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <span className="mr-2">⚙️</span> Profile & Settings
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center"
      >
        <span className="mr-2">🚪</span> Secure Logout
      </button>
    </aside>
  );
}
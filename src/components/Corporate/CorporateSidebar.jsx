import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function CorporateSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside 
      className={`w-64 bg-slate-950 text-white min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0`}
    >
      <div>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-indigo-400">DailyTracker</h2>
            <p className="text-xs text-indigo-300 font-medium mt-1">🏢 Corporate Panel</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1.5">
          <Link 
            to="/dashboard/corporate" 
            onClick={() => setIsOpen(false)}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              location.pathname === "/dashboard/corporate" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            📊 Analytics Overview
          </Link>
          <Link to="#" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            📋 Attendance Logs
          </Link>
          <Link to="#" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            👔 Manage Employees
          </Link>
        </nav>
      </div>

      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all">
        🚪 Logout Account
      </button>
    </aside>
  );
}
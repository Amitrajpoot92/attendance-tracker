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

  // Naye Dashboard ke sabhi raste (Routes)
  const navLinks = [
    { name: "Dashboard Overview", path: "/dashboard/corporate", icon: "📊" },
    { name: "Manage Staff", path: "/dashboard/corporate/staff", icon: "👥" },
    { name: "Attendance Tracker", path: "/dashboard/corporate/attendance", icon: "✅" },
    { name: "Salary Calculator", path: "/dashboard/corporate/salary", icon: "💰" },
    { name: "Corporate Settings", path: "/dashboard/corporate/settings", icon: "⚙️" },
  ];

  return (
    <aside 
      className={`w-64 bg-slate-950 text-white min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-900 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0`}
    >
      <div>
        <div className="mb-10 px-2 flex justify-between items-center mt-2">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] shadow-sm">✅</span>
              Attendance<span className="text-indigo-400">Tracker</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 ml-8">
              Corporate Panel
            </p>
          </div>
          
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1 bg-slate-800/50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 mt-8">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
        >
          <span className="text-lg">🚪</span>
          Logout Account
        </button>
      </div>
    </aside>
  );
}
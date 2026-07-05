import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 🌟 Premium Logo Area */}
        <Link to="/" className="flex items-center gap-2.5 group active:scale-[0.97] transition-transform">
          {/* Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          {/* Brand Name (AttendanceTracker) */}
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
            Attendance<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tracker</span>
          </span>
        </Link>
        
        {/* 🚀 Navigation / Modern Login Button */}
        <nav>
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200/80 shadow-sm px-4 sm:px-5 py-2 rounded-xl hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 active:scale-[0.95] active:bg-slate-100 transition-all duration-200"
          >
            <span>Login</span>
            <span className="text-lg leading-none mb-[2px]">&rarr;</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/60 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Brand & Tagline Section */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-800">
                Attendance<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tracker</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 text-center md:text-left font-medium max-w-sm mt-1">
              Built for Paperboys, Milkmen, and Corporate Teams to manage daily tasks efficiently.
            </p>
          </div>

          {/* Links & Copyright Section */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-bold text-slate-500">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors">Help & Support</a>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              © {new Date().getFullYear()} AttendanceTracker. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
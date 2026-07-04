import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
            DailyTracker
          </span>
        </div>
        
        {/* Navigation / Login Button */}
        <nav>
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
          >
            Login to Dashboard &rarr;
          </Link>
        </nav>
      </div>
    </header>
  );
}
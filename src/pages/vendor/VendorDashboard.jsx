import { useNavigate } from "react-router-dom";

export default function VendorDashboard() {
  const navigate = useNavigate();

  const trackers = [
    {
      id: "milk",
      title: "🥛 Milk Tracker",
      description: "Manage daily milk delivery from your milkman. Log milk quantities, prices, extra products (curd, paneer) and keep track of monthly bills and payments.",
      url: "/milk-tracker",
      gradient: "from-blue-500 to-indigo-600",
      badge: "Milkman & Dues"
    },
    {
      id: "maid",
      title: "🧹 Maid Attendance Tracker",
      description: "Log daily attendance, half days, paid leaves, and overtime hours for your household maid. Automatically calculate monthly salary and record payments/advances.",
      url: "/maid-attendance-tracker",
      gradient: "from-purple-500 to-pink-600",
      badge: "Staff Attendance"
    },
    {
      id: "worker",
      title: "👷 Worker Attendance Tracker",
      description: "Log daily work attendance, daily earnings, half days, and overtime. Perfect for independent workers, freelancers, daily wage laborers, or multiple job tracking.",
      url: "/worker-attendance-tracker",
      gradient: "from-emerald-500 to-teal-600",
      badge: "Daily Wages"
    },
    {
      id: "khata",
      title: "📓 Customer Ledger (Khata)",
      description: "Record purchases, credit transactions (udhari), and payments with different local shops. Maintain clear dual-column credits and debits to know exactly what you owe.",
      url: "/customer-ledger",
      gradient: "from-amber-500 to-rose-600",
      badge: "Personal Khata Book"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="text-center md:text-left mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome to <span className="text-blue-600">DailyTracker</span> Hub
        </h1>
        <p className="text-lg text-slate-500 mt-2 font-medium">
          Choose a specialized module to manage your daily logs, attendance, payments and ledgers.
        </p>
      </div>

      {/* Grid Layout of the 4 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {trackers.map((tracker) => (
          <div 
            key={tracker.id}
            className="group relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            {/* Upper colored band */}
            <div className={`h-3 bg-gradient-to-r ${tracker.gradient}`} />

            <div className="p-8 flex-grow">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                  {tracker.title}
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {tracker.badge}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {tracker.description}
              </p>
            </div>

            <div className="p-8 pt-0">
              <button
                onClick={() => navigate(tracker.url)}
                className={`w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md`}
              >
                Open {tracker.title.split(" ")[1]} Tracker
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mt-12 flex flex-col sm:flex-row items-center gap-4">
        <div className="text-2xl">💡</div>
        <p className="text-sm font-semibold text-blue-800 text-center sm:text-left">
          You can use multiple trackers simultaneously! Your active records are saved securely in your personal account database. Switch trackers anytime using the sidebar menu.
        </p>
      </div>
    </div>
  );
}
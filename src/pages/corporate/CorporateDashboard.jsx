export default function CorporateDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Corporate Management</h1>
      <p className="text-slate-500 mb-6">Overview of company attendance and employee stats.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Employees</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Present Today</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Absent Today</p>
          <p className="text-3xl font-bold text-rose-600 mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
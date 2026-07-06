import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function CorporateDashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
    estPayroll: 0
  });
  const [currency, setCurrency] = useState("₹");
  const [loading, setLoading] = useState(true);

  // Aaj ki exact date matching Firebase format (YYYY-MM-DD)
  const todayDateString = new Date().toISOString().split('T')[0];
  
  const todayDisplayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      
      try {
        // 1. Fetch Global Currency Settings
        const settingsSnap = await getDoc(doc(db, "corporate_settings", auth.currentUser.uid));
        let activeCurrency = "₹";
        if (settingsSnap.exists() && settingsSnap.data().currency) {
          activeCurrency = settingsSnap.data().currency;
          setCurrency(activeCurrency);
        }

        // 2. Fetch All Staff members for counts and payroll calculation
        const staffQ = query(collection(db, "staff"), where("adminId", "==", auth.currentUser.uid));
        const staffSnap = await getDocs(staffQ);
        const staffList = staffSnap.docs.map(doc => doc.data());
        const totalStaff = staffList.length;

        // Auto calculate estimated monthly payroll expense
        const estPayroll = staffList.reduce((sum, emp) => {
          if (emp.workType === "Monthly") return sum + emp.wage;
          if (emp.workType === "Daily") return sum + (emp.wage * 30);
          return sum + (emp.wage * 8 * 30); // Hourly assuming 8 hours shift/day
        }, 0);

        // 3. Fetch Today's Live Attendance Records
        const attendanceRef = doc(db, "daily_attendance", `${auth.currentUser.uid}_${todayDateString}`);
        const attendanceSnap = await getDoc(attendanceRef);

        let presentToday = 0;
        let absentToday = 0;
        let onLeave = 0;

        if (attendanceSnap.exists()) {
          const records = attendanceSnap.data().records || {};
          Object.values(records).forEach(rec => {
            if (rec.status === "P") presentToday++;
            if (rec.status === "HD") presentToday += 0.5; // Half day counts as 0.5 present
            if (rec.status === "A") absentToday++;
            if (rec.status === "L") onLeave++;
          });
        }

        // State update with real calculations
        setStats({
          totalStaff,
          presentToday,
          absentToday,
          onLeave,
          estPayroll
        });

      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [todayDateString]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard overview...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative overflow-hidden pb-24">
      
      {/* 🌟 Premium Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {todayDisplayDate}
            </p>
          </div>
          
          <Link 
            to="/dashboard/corporate/attendance"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="text-lg">✅</span>
            Mark Today's Attendance
          </Link>
        </div>

        {/* 📊 Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Total Staff */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">👥</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stats.totalStaff}</p>
            </div>
          </div>

          {/* Present Today */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl shadow-inner border border-green-100 group-hover:scale-110 transition-transform">✅</div>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                {stats.totalStaff ? ((stats.presentToday / stats.totalStaff) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
              <p className="text-3xl font-black text-green-600 mt-1">{stats.presentToday}</p>
            </div>
          </div>

          {/* Absent / Leave */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-50 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl shadow-inner border border-red-100 group-hover:scale-110 transition-transform">❌</div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent / Leave</p>
              <p className="text-3xl font-black text-red-500 mt-1">{stats.absentToday + stats.onLeave}</p>
            </div>
          </div>

          {/* Payroll Estimate */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2rem] shadow-xl shadow-slate-900/20 text-white flex flex-col justify-between group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">💰</div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Est. Monthly Payroll</p>
              <p className="text-3xl font-black text-white mt-1">
                <span className="text-xl text-indigo-400 mr-1">{currency}</span>{stats.estPayroll.toLocaleString()}
              </p>
            </div>
          </div>

        </div>

        {/* 🚀 Quick Actions Section */}
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          <Link to="/dashboard/corporate/staff" className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all active:scale-[0.98] group">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              ➕
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Add New Staff</h3>
              <p className="text-xs font-medium text-slate-500">Hire & setup profiles</p>
            </div>
          </Link>

          <Link to="/dashboard/corporate/salary" className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all active:scale-[0.98] group">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              📄
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Generate Payslip</h3>
              <p className="text-xs font-medium text-slate-500">Calculate & share salary</p>
            </div>
          </Link>

          <Link to="/dashboard/corporate/settings" className="bg-white/80 backdrop-blur-sm border border-slate-200 p-5 rounded-2xl flex items-center gap-4 hover:border-purple-400 hover:bg-purple-50/50 transition-all active:scale-[0.98] group">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
              ⚙️
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Company Settings</h3>
              <p className="text-xs font-medium text-slate-500">Update logo & currency</p>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
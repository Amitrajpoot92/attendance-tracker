import { useState, useEffect, useMemo } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Aaj ki date nikalne ka function (Format: YYYY-MM-DD)
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function DailyDeliveries() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const todayString = getTodayDateString();

  // 1. Firebase se Real-time Data Fetching
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "customers"),
      where("vendorId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Smart Logic: Agar last update aaj nahi hua, toh status automatically "Pending" maano
        const currentStatus = data.lastDeliveryDate === todayString 
          ? (data.lastDeliveryStatus || "Pending") 
          : "Pending";

        customersData.push({ 
          id: doc.id, 
          ...data,
          currentStatus // Ye humne UI ke liye naya field banaya
        });
      });
      setCustomers(customersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [todayString]);

  // 2. Update Status in Firebase
  const updateStatus = async (id, newStatus) => {
    try {
      const customerRef = doc(db, "customers", id);
      await updateDoc(customerRef, {
        lastDeliveryStatus: newStatus,
        lastDeliveryDate: todayString
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status. Check connection.");
    }
  };

  // 3. Auto-Sorting (Pending Upar, Delivered/Absent Niche) & Filtering
  const processedDeliveries = useMemo(() => {
    // Pehle filter karo
    let filtered = customers;
    if (activeFilter !== "All") {
      filtered = customers.filter(c => c.currentStatus === activeFilter);
    }

    // Fir Sort karo (1: Pending, 2: Absent, 3: Delivered)
    const statusPriority = { "Pending": 1, "Absent": 2, "Delivered": 3 };
    
    return filtered.sort((a, b) => {
      return statusPriority[a.currentStatus] - statusPriority[b.currentStatus];
    });
  }, [customers, activeFilter]);

  // Dynamic Calculations for Stats
  const total = customers.length;
  const deliveredCount = customers.filter(d => d.currentStatus === "Delivered").length;
  const pendingCount = customers.filter(d => d.currentStatus === "Pending").length;
  const absentCount = customers.filter(d => d.currentStatus === "Absent").length;
  
  // Progress percentage
  const progressPercent = total === 0 ? 0 : Math.round(((deliveredCount + absentCount) / total) * 100);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading today's route...</div>;
  }

  return (
    <div className="pb-8">
      
      {/* Header with Branding */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Daily Tracker</h1>
          <p className="text-slate-500">
            Manage your daily route on <span className="font-semibold text-blue-600">AttendanceTrackers</span>.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm inline-block">
          <p className="text-sm font-semibold text-slate-700">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Route Completion</h3>
          <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Status Counters */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase">Delivered</p>
          <p className="text-xl md:text-3xl font-black text-emerald-700 mt-1">{deliveredCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase">Pending</p>
          <p className="text-xl md:text-3xl font-black text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-rose-600 uppercase">Absent</p>
          <p className="text-xl md:text-3xl font-black text-rose-700 mt-1">{absentCount}</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide">
        {["All", "Pending", "Delivered", "Absent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter 
                ? "bg-slate-800 text-white shadow-md" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {filter} {filter !== "All" && `(${eval(filter.toLowerCase() + 'Count')})`}
          </button>
        ))}
      </div>

      {/* Responsive Log List (Auto-Sorting Applied) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {processedDeliveries.length > 0 ? processedDeliveries.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:bg-slate-50 border-l-4 ${
                item.currentStatus === 'Delivered' ? 'border-l-emerald-500 bg-emerald-50/30 opacity-70' :
                item.currentStatus === 'Absent' ? 'border-l-rose-500 bg-rose-50/30 opacity-70' : 'border-l-amber-400 bg-white'
              }`}
            >
              
              {/* Customer Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.currentStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                    item.currentStatus === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.currentStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  {item.address} 
                  <span className="mx-1 text-slate-300">|</span> 
                  <strong className="text-slate-700">Qty: {item.qty}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 md:flex md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => updateStatus(item.id, "Delivered")}
                  disabled={item.currentStatus === "Delivered"}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    item.currentStatus === 'Delivered' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 cursor-default' 
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent'
                  }`}
                >
                  ✓ <span className="hidden sm:inline md:hidden lg:inline">Delivered</span>
                </button>
                
                <button 
                  onClick={() => updateStatus(item.id, "Pending")}
                  disabled={item.currentStatus === "Pending"}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    item.currentStatus === 'Pending' 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200 cursor-default' 
                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-transparent'
                  }`}
                >
                  ⏳ <span className="hidden sm:inline md:hidden lg:inline">Pending</span>
                </button>

                <button 
                  onClick={() => updateStatus(item.id, "Absent")}
                  disabled={item.currentStatus === "Absent"}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2.5 md:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    item.currentStatus === 'Absent' 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 cursor-default' 
                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent'
                  }`}
                >
                  ❌ <span className="hidden sm:inline md:hidden lg:inline">Absent</span>
                </button>
              </div>

            </div>
          )) : (
            <div className="p-8 text-center text-slate-500 font-medium">
              {customers.length === 0 ? "You have no customers yet. Add them from the Manage Customers page." : "No deliveries found for this filter."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function SalaryCalculator() {
  const [staffList, setStaffList] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  
  // Date & Config
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM
  const [currency, setCurrency] = useState("₹");
  
  // Inputs
  const [bonus, setBonus] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [penalty, setPenalty] = useState(0);
  
  // Calculated Stats from Firebase
  const [attendanceStats, setAttendanceStats] = useState({ presentDays: 0, overtimeHrs: 0 });
  const [calc, setCalc] = useState({ base: 0, overtimePay: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  const payslipRef = useRef(null);
  const activeEmp = staffList.find(e => e.id === selectedEmpId);

  // 1. Fetch Staff & Currency Settings on Load
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch Staff
        const staffQ = query(collection(db, "staff"), where("adminId", "==", auth.currentUser.uid));
        const staffSnap = await getDocs(staffQ);
        const fetchedStaff = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStaffList(fetchedStaff);
        if (fetchedStaff.length > 0) setSelectedEmpId(fetchedStaff[0].id);

        // Fetch Currency (Agar settings page me save ki thi)
        const settingsSnap = await getDoc(doc(db, "corporate_settings", auth.currentUser.uid));
        if (settingsSnap.exists() && settingsSnap.data().currency) {
          setCurrency(settingsSnap.data().currency);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch Attendance for Selected Month & Employee
  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      if (!auth.currentUser || !selectedEmpId) return;
      
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = `${selectedMonth}-31`;

      try {
        const attendanceQ = query(
          collection(db, "daily_attendance"),
          where("adminId", "==", auth.currentUser.uid),
          where("date", ">=", startOfMonth),
          where("date", "<=", endOfMonth)
        );

        const snapshot = await getDocs(attendanceQ);
        
        let totalPresents = 0;
        let totalOvertime = 0;

        snapshot.forEach((doc) => {
          const records = doc.data().records;
          if (records && records[selectedEmpId]) {
            const empRecord = records[selectedEmpId];
            if (empRecord.status === "P") totalPresents += 1;
            if (empRecord.status === "HD") totalPresents += 0.5; // Half day counts as 0.5
            if (empRecord.overtime) totalOvertime += Number(empRecord.overtime);
          }
        });

        setAttendanceStats({ presentDays: totalPresents, overtimeHrs: totalOvertime });
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
      }
    };

    fetchMonthlyAttendance();
  }, [selectedEmpId, selectedMonth]);

  // 3. Auto-Calculate Final Salary
  useEffect(() => {
    if (!activeEmp) return;

    let base = 0;
    let overtimePay = 0;
    const { presentDays, overtimeHrs } = attendanceStats;

    // Smart Calculation based on Work Type
    if (activeEmp.workType === "Monthly") {
      base = Math.round((activeEmp.wage / 30) * presentDays); // Pro-rata basis
      overtimePay = overtimeHrs * 100; // Standard ₹100/hr for monthly staff
    } else if (activeEmp.workType === "Daily") {
      base = activeEmp.wage * presentDays;
      overtimePay = overtimeHrs * 50; 
    } else if (activeEmp.workType === "Hourly") {
      base = activeEmp.wage * (presentDays * 8); // Assuming 8hr standard shift
      overtimePay = overtimeHrs * activeEmp.wage; // Overtime at normal hourly rate
    }

    const totalDeductions = Number(advance) + Number(penalty);
    const totalAdditions = base + overtimePay + Number(bonus);
    const net = totalAdditions - totalDeductions;
    
    setCalc({ base, overtimePay, net: Math.max(0, net) });
  }, [activeEmp, attendanceStats, bonus, advance, penalty]);

  // Action Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!activeEmp) return;
    const text = `Hello ${activeEmp.name},\n\n🧾 *Salary Slip: ${selectedMonth}*\n\n*Total Present:* ${attendanceStats.presentDays} Days\n*Net Salary:* ${currency}${calc.net.toLocaleString()}\n\n(Base: ${currency}${calc.base}, Bonus: ${currency}${bonus || 0}, Deductions: ${currency}${Number(advance) + Number(penalty)})\n\nSent via AttendanceTracker.`;
    window.open(`https://wa.me/${activeEmp.phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Calculating Salaries...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative overflow-hidden pb-24">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header & Month Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salary Calculator</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Auto-calculate wages, add bonuses, and generate payslips.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-500 pl-2">Select Month:</span>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-100 text-slate-800 font-bold px-4 py-2 rounded-xl outline-none cursor-pointer"
            />
          </div>
        </div>

        {staffList.length === 0 ? (
           <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
             <p className="text-slate-500 font-medium">No staff found to calculate salary.</p>
           </div>
        ) : (
          <>
            {/* Top Controls: Select Employee */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
              <div className="w-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Staff Member</label>
                <div className="relative">
                  <select 
                    value={selectedEmpId}
                    onChange={(e) => {
                      setSelectedEmpId(e.target.value);
                      setBonus(0); setAdvance(0); setPenalty(0);
                    }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-bold text-lg rounded-xl pl-4 pr-10 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {staffList.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-auto shrink-0 flex items-center gap-4 bg-blue-50 px-5 py-3.5 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/40">
                  {activeEmp?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase">{activeEmp?.workType} Basis</p>
                  <p className="text-sm font-black text-blue-900">{currency}{activeEmp?.wage} <span className="text-xs font-medium opacity-70">Rate</span></p>
                </div>
              </div>
            </div>

            {/* The Digital Payslip Card (Printable Area) */}
            <div ref={payslipRef} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative print:shadow-none print:border-none print:m-0">
              
              <div className="bg-slate-900 text-white p-6 sm:px-8 sm:py-6 flex justify-between items-center relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:border-black">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl print:hidden"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-black">Salary Statement</h2>
                  <p className="text-slate-400 text-sm font-medium print:text-black">Month: {selectedMonth}</p>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 print:text-black">Attendance</p>
                  <p className="font-black text-xl text-green-400 print:text-black">{attendanceStats.presentDays} <span className="text-sm font-medium text-white print:text-black">Days</span></p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                
                {/* Earnings & Deductions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  
                  {/* Earnings */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 print:hidden"></span> Earnings (+)
                    </h3>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-semibold text-sm print:text-black">Base Salary (Auto)</span>
                      <span className="font-black text-slate-800">{currency}{calc.base.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-semibold text-sm print:text-black">Overtime ({attendanceStats.overtimeHrs} hrs)</span>
                      <span className="font-black text-slate-800">{currency}{calc.overtimePay.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <label className="text-slate-500 font-semibold text-sm print:text-black">Bonus / Incentive</label>
                      <div className="relative w-32 print:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold print:hidden">{currency}</span>
                        <input 
                          type="number" 
                          value={bonus || ""}
                          onChange={(e) => setBonus(e.target.value)}
                          className="w-full bg-green-50/50 border border-green-200 text-green-700 font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-green-500 text-right print:p-0 print:border-none print:bg-transparent print:text-black"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 print:hidden"></span> Deductions (-)
                    </h3>
                    
                    <div className="flex justify-between items-center py-2">
                      <label className="text-slate-500 font-semibold text-sm print:text-black">Advance Taken</label>
                      <div className="relative w-32 print:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold print:hidden">{currency}</span>
                        <input 
                          type="number" 
                          value={advance || ""}
                          onChange={(e) => setAdvance(e.target.value)}
                          className="w-full bg-red-50/50 border border-red-200 text-red-700 font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-red-500 text-right print:p-0 print:border-none print:bg-transparent print:text-black"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <label className="text-slate-500 font-semibold text-sm print:text-black">Late Penalty / Fine</label>
                      <div className="relative w-32 print:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold print:hidden">{currency}</span>
                        <input 
                          type="number" 
                          value={penalty || ""}
                          onChange={(e) => setPenalty(e.target.value)}
                          className="w-full bg-red-50/50 border border-red-200 text-red-700 font-bold rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-red-500 text-right print:p-0 print:border-none print:bg-transparent print:text-black"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Net Salary */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:bg-white print:border-2 print:border-black">
                  <div>
                    <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-1 print:text-black">Final Net Salary</p>
                    <p className="text-xs text-slate-500 font-medium print:text-black">To be paid to <strong className="text-slate-800">{activeEmp?.name}</strong></p>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    <span className="text-2xl text-slate-400 font-bold mr-1 print:text-black">{currency}</span>
                    {calc.net.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 print:hidden">
              <button 
                onClick={handlePrint} 
                className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print / Save PDF
              </button>

              <button 
                onClick={handleWhatsAppShare} 
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Send to WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, addDoc, query, where, deleteDoc } from "firebase/firestore";

export default function MaidTracker() {
  // 1. Core States
  const [maids, setMaids] = useState([]);
  const [selectedMaidId, setSelectedMaidId] = useState("");
  const [attendance, setAttendance] = useState({});
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 3. Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());

  // 4. Modals State
  const [isMaidModalOpen, setIsMaidModalOpen] = useState(false);
  const [newMaidName, setNewMaidName] = useState("");
  const [newMaidSalary, setNewMaidSalary] = useState("");
  const [newMaidOtRate, setNewMaidOtRate] = useState("");
  const [newMaidPhone, setNewMaidPhone] = useState("");

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [attStatus, setAttStatus] = useState("Present");
  const [otHours, setOtHours] = useState("0");
  const [attNote, setAttNote] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- FIREBASE FETCHING ---

  // Fetch Maids Profiles
  useEffect(() => {
    const fetchMaids = async () => {
      if (!auth.currentUser) return;
      try {
        const ref = collection(db, "users", auth.currentUser.uid, "maids");
        const snap = await getDocs(ref);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaids(list);
        if (list.length > 0 && !selectedMaidId) {
          setSelectedMaidId(list[0].id);
        }
      } catch (error) {
        showToast("Error loading maids profiles", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaids();
  }, [auth.currentUser?.uid]);

  // Fetch Attendance & Payments for Selected Maid
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !selectedMaidId) return;

      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      try {
        // Fetch Attendance
        const attRef = collection(db, "users", auth.currentUser.uid, "maids", selectedMaidId, "attendance");
        const attQuery = query(attRef, where("yearMonth", "==", yearMonth));
        const attSnap = await getDocs(attQuery);
        const attObj = {};
        attSnap.docs.forEach(doc => {
          attObj[doc.id] = doc.data();
        });
        setAttendance(attObj);

        // Fetch Payments
        const payRef = collection(db, "users", auth.currentUser.uid, "maids", selectedMaidId, "payments");
        const payQuery = query(payRef, where("yearMonth", "==", yearMonth));
        const paySnap = await getDocs(payQuery);
        const payList = paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(payList);
      } catch (error) {
        showToast("Error loading tracker data", "error");
      }
    };
    fetchData();
  }, [selectedMaidId, currentDate, auth.currentUser?.uid]);

  // --- ACTIONS ---

  const handleAddMaid = async (e) => {
    e.preventDefault();
    if (!newMaidName || !newMaidSalary || !newMaidOtRate) return;
    try {
      const ref = collection(db, "users", auth.currentUser.uid, "maids");
      const docRef = await addDoc(ref, {
        name: newMaidName,
        phone: newMaidPhone || "Not Provided",
        monthlySalary: Number(newMaidSalary),
        otRate: Number(newMaidOtRate),
        createdAt: new Date().toISOString()
      });

      const newObj = {
        id: docRef.id,
        name: newMaidName,
        phone: newMaidPhone || "Not Provided",
        monthlySalary: Number(newMaidSalary),
        otRate: Number(newMaidOtRate)
      };

      setMaids([...maids, newObj]);
      setSelectedMaidId(docRef.id);
      setIsMaidModalOpen(false);
      setNewMaidName("");
      setNewMaidPhone("");
      setNewMaidSalary("");
      setNewMaidOtRate("");
      showToast("Maid added successfully!");
    } catch (error) {
      showToast("Error adding maid", "error");
    }
  };

  const openAttendanceModal = (dateStr) => {
    if (!selectedMaidId) {
      showToast("Please add and select a maid first!", "error");
      return;
    }
    const existing = attendance[dateStr];

    setSelectedDateStr(dateStr);
    setAttStatus(existing?.status || "Present");
    setOtHours(existing?.otHours ?? "0");
    setAttNote(existing?.note || "");
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    const yearMonth = selectedDateStr.substring(0, 7);

    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "maids", selectedMaidId, "attendance", selectedDateStr);
      const payload = {
        date: selectedDateStr,
        yearMonth,
        status: attStatus,
        otHours: Number(otHours),
        note: attNote,
        timestamp: new Date().toISOString()
      };

      await setDoc(docRef, payload, { merge: true });

      setAttendance(prev => ({
        ...prev,
        [selectedDateStr]: payload
      }));

      setIsAttendanceModalOpen(false);
      showToast(`Logged attendance for ${selectedDateStr}`);
    } catch (error) {
      showToast("Failed to save attendance details", "error");
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount) return;
    const yearMonth = paymentDate.substring(0, 7);

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "maids", selectedMaidId, "payments");
      const docRef = await addDoc(ref, {
        amount: Number(paymentAmount),
        date: paymentDate,
        yearMonth,
        note: paymentNote || "Salary Payment",
        createdAt: new Date().toISOString()
      });

      setPayments(prev => [...prev, {
        id: docRef.id,
        amount: Number(paymentAmount),
        date: paymentDate,
        yearMonth,
        note: paymentNote || "Salary Payment"
      }]);

      setIsPaymentModalOpen(false);
      setPaymentAmount("");
      setPaymentNote("");
      showToast("Payment logged successfully!");
    } catch (error) {
      showToast("Failed to record payment", "error");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "maids", selectedMaidId, "payments", paymentId);
      await deleteDoc(ref);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      showToast("Payment record deleted.");
    } catch (error) {
      showToast("Failed to delete payment record", "error");
    }
  };

  // --- CALENDAR SETUP ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- Live Calculations ---
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let paidLeaves = 0;
  let totalOtHours = 0;

  Object.values(attendance).forEach(att => {
    if (att.status === "Present") presentDays++;
    else if (att.status === "Absent") absentDays++;
    else if (att.status === "Half Day") halfDays++;
    else if (att.status === "Paid Leave") paidLeaves++;
    totalOtHours += (att.otHours || 0);
  });

  const maidProfile = maids.find(m => m.id === selectedMaidId);
  const monthlySalary = maidProfile?.monthlySalary || 0;
  const otRate = maidProfile?.otRate || 0;

  // Deduction = Absent days * (Monthly Salary / Days in Month)
  // Half Day deduction = Half Days * 0.5 * (Monthly Salary / Days in Month)
  const dailyWage = monthlySalary / daysInMonth;
  const deductions = (absentDays * dailyWage) + (halfDays * 0.5 * dailyWage);
  const overtimePay = totalOtHours * otRate;
  const netPayable = monthlySalary - deductions + overtimePay;

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const outstandingDues = netPayable - totalPaid;

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Loading Maid Tracker...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-10 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold text-sm shadow-2xl transition-all ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">🧹 Maid Attendance</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Track daily attendance, overtime, salary payouts, and dues.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="flex-grow md:w-56 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
            value={selectedMaidId}
            onChange={(e) => setSelectedMaidId(e.target.value)}
          >
            {maids.length === 0 && <option value="">No Maid Configured</option>}
            {maids.map(m => (
              <option key={m.id} value={m.id}>{m.name} (₹{m.monthlySalary}/m)</option>
            ))}
          </select>
          <button
            onClick={() => setIsMaidModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shadow-md"
          >
            + Add Maid
          </button>
        </div>
      </div>

      {maids.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🧹</div>
          <h2 className="text-2xl font-black text-slate-800">No Maid Configured</h2>
          <p className="text-slate-500 font-semibold mt-2 max-w-md mx-auto">
            Get started by adding your maid profile, monthly base salary, and hourly overtime rate.
          </p>
          <button
            onClick={() => setIsMaidModalOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            Add Maid Details
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Section (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              {/* Calendar Nav */}
              <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
                <button onClick={prevMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold text-xs uppercase active:scale-95">◀ Prev</button>
                <h2 className="text-lg font-black tracking-wider uppercase">{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold text-xs uppercase active:scale-95">Next ▶</button>
              </div>

              {/* Calendar Grid */}
              <div className="p-6 bg-slate-50">
                <div className="grid grid-cols-7 gap-2 mb-3 text-center font-bold text-slate-400 uppercase text-xs">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const attEntry = attendance[dateStr];

                    let bgClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-400";
                    let label = "";

                    if (attEntry) {
                      if (attEntry.status === "Present") {
                        bgClass = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/20";
                        label = "P";
                      } else if (attEntry.status === "Absent") {
                        bgClass = "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20";
                        label = "A";
                      } else if (attEntry.status === "Half Day") {
                        bgClass = "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20";
                        label = "HD";
                      } else if (attEntry.status === "Paid Leave") {
                        bgClass = "bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/20";
                        label = "PL";
                      }
                      if (attEntry.otHours > 0) {
                        label += ` (+${attEntry.otHours}h)`;
                      }
                    }

                    return (
                      <div
                        key={day}
                        onClick={() => openAttendanceModal(dateStr)}
                        className={`aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${bgClass}`}
                      >
                        <span className="text-lg font-black">{day}</span>
                        {label && <span className="text-[9px] font-bold mt-1 bg-black/15 px-1.5 py-0.5 rounded-full">{label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculations Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Present</p>
                <p className="text-xl font-black text-emerald-600">{presentDays}d</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Absent</p>
                <p className="text-xl font-black text-rose-600">{absentDays}d</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Half Day</p>
                <p className="text-xl font-black text-amber-500">{halfDays}d</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paid Leave</p>
                <p className="text-xl font-black text-blue-500">{paidLeaves}d</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl shadow-md text-white text-center flex flex-col justify-center col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">OT Hours</p>
                <p className="text-xl font-black">{totalOtHours} hrs</p>
              </div>
            </div>
          </div>

          {/* Dues & Payouts (Right 1 column) */}
          <div className="space-y-6">
            {/* Salary Calculation details */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Salary Calculator</h3>
              <div className="space-y-3.5">
                <div className="flex justify-between font-medium text-slate-500 text-sm">
                  <span>Base Salary:</span>
                  <span className="text-slate-800 font-bold">₹{monthlySalary}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500 text-sm">
                  <span>Absence Deductions:</span>
                  <span className="text-rose-600 font-bold">-₹{deductions.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500 text-sm">
                  <span>Overtime Pay:</span>
                  <span className="text-emerald-600 font-bold">+₹{overtimePay.toFixed(0)}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-black text-slate-800 text-sm">
                  <span>Net Salary Payable:</span>
                  <span>₹{netPayable.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500 text-sm">
                  <span>Paid till now:</span>
                  <span className="text-emerald-600 font-bold">₹{totalPaid}</span>
                </div>
                <div className="border-t border-slate-100 pt-3.5 flex justify-between font-black text-base text-slate-800">
                  <span>Net Dues:</span>
                  <span className={outstandingDues > 0 ? "text-rose-600" : "text-emerald-600"}>
                    ₹{outstandingDues.toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="mt-6 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                💸 Pay / Advance
              </button>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Salary Payments</h3>
              {payments.length === 0 ? (
                <p className="text-sm font-semibold text-slate-400 text-center py-6">No payments recorded this month.</p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div>
                        <p className="text-sm font-black text-slate-800">₹{p.amount}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{p.date} • {p.note}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MAID */}
      {isMaidModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Add Maid Details</h3>
              <button onClick={() => setIsMaidModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleAddMaid} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Maid Name</label>
                <input
                  type="text" required
                  value={newMaidName} onChange={(e) => setNewMaidName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Geeta Bai"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact Number (Optional)</label>
                <input
                  type="tel"
                  value={newMaidPhone} onChange={(e) => setNewMaidPhone(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Monthly Salary (₹)</label>
                  <input
                    type="number" required
                    value={newMaidSalary} onChange={(e) => setNewMaidSalary(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. 4000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">OT Hourly Rate (₹)</label>
                  <input
                    type="number" required
                    value={newMaidOtRate} onChange={(e) => setNewMaidOtRate(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Add Maid</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATTENDANCE ENTRY */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Attendance: {selectedDateStr}</h3>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {["Present", "Absent", "Half Day", "Paid Leave"].map(status => (
                    <button
                      key={status} type="button"
                      onClick={() => setAttStatus(status)}
                      className={`py-3 rounded-xl font-bold text-xs border-2 transition-all ${
                        attStatus === status
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Overtime Hours (hrs)</label>
                <input
                  type="number" step="0.5" required
                  value={otHours} onChange={(e) => setOtHours(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Remarks / Note (Optional)</label>
                <input
                  type="text"
                  value={attNote} onChange={(e) => setAttNote(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Cleaned balcony extra"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG WAGE/ADVANCE PAYMENT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Log Payout / Advance</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Amount Paid (₹)</label>
                <input
                  type="number" required
                  value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 2000"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Date of Payment</label>
                <input
                  type="date" required
                  value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Payment Note (Optional)</label>
                <input
                  type="text"
                  value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Online Transfer / Advance salary"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Log Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

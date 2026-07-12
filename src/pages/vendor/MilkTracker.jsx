import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, addDoc, query, where, deleteDoc } from "firebase/firestore";

export default function MilkTracker() {
  // 1. Core States
  const [milkmen, setMilkmen] = useState([]);
  const [selectedMilkmanId, setSelectedMilkmanId] = useState("");
  const [deliveries, setDeliveries] = useState({});
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 3. Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());

  // 4. Modals State
  const [isMilkmanModalOpen, setIsMilkmanModalOpen] = useState(false);
  const [newMilkmanName, setNewMilkmanName] = useState("");
  const [newMilkmanRate, setNewMilkmanRate] = useState("");
  const [newMilkmanQty, setNewMilkmanQty] = useState("");
  const [newMilkmanPhone, setNewMilkmanPhone] = useState("");

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("Delivered");
  const [deliveryQty, setDeliveryQty] = useState("");
  const [deliveryRate, setDeliveryRate] = useState("");
  const [deliveryExtras, setDeliveryExtras] = useState("0");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- FIREBASE FETCHING ---

  // Fetch Milkmen Profiles
  useEffect(() => {
    const fetchMilkmen = async () => {
      if (!auth.currentUser) return;
      try {
        const ref = collection(db, "users", auth.currentUser.uid, "milkmen");
        const snap = await getDocs(ref);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMilkmen(list);
        if (list.length > 0 && !selectedMilkmanId) {
          setSelectedMilkmanId(list[0].id);
        }
      } catch (error) {
        showToast("Error loading milkmen profiles", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMilkmen();
  }, [auth.currentUser?.uid]);

  // Fetch Deliveries & Payments for Selected Milkman
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !selectedMilkmanId) return;

      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      try {
        // Fetch Deliveries
        const delRef = collection(db, "users", auth.currentUser.uid, "milkmen", selectedMilkmanId, "deliveries");
        const delQuery = query(delRef, where("yearMonth", "==", yearMonth));
        const delSnap = await getDocs(delQuery);
        const delObj = {};
        delSnap.docs.forEach(doc => {
          delObj[doc.id] = doc.data();
        });
        setDeliveries(delObj);

        // Fetch Payments
        const payRef = collection(db, "users", auth.currentUser.uid, "milkmen", selectedMilkmanId, "payments");
        const payQuery = query(payRef, where("yearMonth", "==", yearMonth));
        const paySnap = await getDocs(payQuery);
        const payList = paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(payList);
      } catch (error) {
        showToast("Error loading tracker data", "error");
      }
    };
    fetchData();
  }, [selectedMilkmanId, currentDate, auth.currentUser?.uid]);

  // --- ACTIONS ---

  const handleAddMilkman = async (e) => {
    e.preventDefault();
    if (!newMilkmanName || !newMilkmanRate || !newMilkmanQty) return;
    try {
      const ref = collection(db, "users", auth.currentUser.uid, "milkmen");
      const docRef = await addDoc(ref, {
        name: newMilkmanName,
        phone: newMilkmanPhone || "Not Provided",
        defaultRate: Number(newMilkmanRate),
        defaultQty: Number(newMilkmanQty),
        createdAt: new Date().toISOString()
      });

      const newObj = {
        id: docRef.id,
        name: newMilkmanName,
        phone: newMilkmanPhone || "Not Provided",
        defaultRate: Number(newMilkmanRate),
        defaultQty: Number(newMilkmanQty)
      };

      setMilkmen([...milkmen, newObj]);
      setSelectedMilkmanId(docRef.id);
      setIsMilkmanModalOpen(false);
      setNewMilkmanName("");
      setNewMilkmanPhone("");
      setNewMilkmanRate("");
      setNewMilkmanQty("");
      showToast("Milkman added successfully!");
    } catch (error) {
      showToast("Error adding milkman", "error");
    }
  };

  const openDeliveryModal = (dateStr) => {
    if (!selectedMilkmanId) {
      showToast("Please add and select a milkman first!", "error");
      return;
    }
    const existing = deliveries[dateStr];
    const mman = milkmen.find(m => m.id === selectedMilkmanId);

    setSelectedDateStr(dateStr);
    setDeliveryStatus(existing?.status || "Delivered");
    setDeliveryQty(existing?.qty ?? (mman?.defaultQty || "1.5"));
    setDeliveryRate(existing?.rate ?? (mman?.defaultRate || "60"));
    setDeliveryExtras(existing?.extras ?? "0");
    setDeliveryNote(existing?.note || "");
    setIsDeliveryModalOpen(true);
  };

  const handleSaveDelivery = async (e) => {
    e.preventDefault();
    const yearMonth = selectedDateStr.substring(0, 7);

    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "milkmen", selectedMilkmanId, "deliveries", selectedDateStr);
      const payload = {
        date: selectedDateStr,
        yearMonth,
        status: deliveryStatus,
        qty: deliveryStatus === "Not Delivered" ? 0 : Number(deliveryQty),
        rate: Number(deliveryRate),
        extras: Number(deliveryExtras),
        note: deliveryNote,
        timestamp: new Date().toISOString()
      };

      await setDoc(docRef, payload, { merge: true });

      setDeliveries(prev => ({
        ...prev,
        [selectedDateStr]: payload
      }));

      setIsDeliveryModalOpen(false);
      showToast(`Logged delivery for ${selectedDateStr}`);
    } catch (error) {
      showToast("Failed to save delivery details", "error");
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount) return;
    const yearMonth = paymentDate.substring(0, 7);

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "milkmen", selectedMilkmanId, "payments");
      const docRef = await addDoc(ref, {
        amount: Number(paymentAmount),
        date: paymentDate,
        yearMonth,
        note: paymentNote || "Milk bill payment",
        createdAt: new Date().toISOString()
      });

      setPayments(prev => [...prev, {
        id: docRef.id,
        amount: Number(paymentAmount),
        date: paymentDate,
        yearMonth,
        note: paymentNote || "Milk bill payment"
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
      const ref = doc(db, "users", auth.currentUser.uid, "milkmen", selectedMilkmanId, "payments", paymentId);
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

  // --- Live calculations ---
  let totalLitres = 0;
  let milkBill = 0;
  let extrasBill = 0;

  Object.values(deliveries).forEach(del => {
    if (del.status === "Delivered") {
      totalLitres += (del.qty || 0);
      milkBill += ((del.qty || 0) * (del.rate || 0));
      extrasBill += (del.extras || 0);
    }
  });

  const totalBill = milkBill + extrasBill;
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalDues = totalBill - totalPaid;

  const currentMilkman = milkmen.find(m => m.id === selectedMilkmanId);

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Loading Milk Tracker...</div>;

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
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">🥛 Milk Tracker</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Track daily milk delivery, bills, and payment records.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="flex-grow md:w-56 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
            value={selectedMilkmanId}
            onChange={(e) => setSelectedMilkmanId(e.target.value)}
          >
            {milkmen.length === 0 && <option value="">No Milkman Configured</option>}
            {milkmen.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.defaultQty}L @ ₹{m.defaultRate})</option>
            ))}
          </select>
          <button
            onClick={() => setIsMilkmanModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shadow-md"
          >
            + Add Milkman
          </button>
        </div>
      </div>

      {milkmen.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🥛</div>
          <h2 className="text-2xl font-black text-slate-800">No Milkman Configured</h2>
          <p className="text-slate-500 font-semibold mt-2 max-w-md mx-auto">
            Get started by adding your first milkman details, daily milk quantity, and price per litre.
          </p>
          <button
            onClick={() => setIsMilkmanModalOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            Add Milkman Details
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Block (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              {/* Calendar Nav */}
              <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
                <button onClick={prevMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold text-xs uppercase active:scale-95">◀ Prev</button>
                <h2 className="text-lg font-black tracking-wider uppercase">{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold text-xs uppercase active:scale-95">Next ▶</button>
              </div>

              {/* Grid */}
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
                    const delivery = deliveries[dateStr];

                    let bgClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-400";
                    let label = "";

                    if (delivery) {
                      if (delivery.status === "Delivered") {
                        bgClass = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/20";
                        label = `${delivery.qty}L`;
                      } else {
                        bgClass = "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/20";
                        label = "Absent";
                      }
                    }

                    return (
                      <div
                        key={day}
                        onClick={() => openDeliveryModal(dateStr)}
                        className={`aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${bgClass}`}
                      >
                        <span className="text-lg font-black">{day}</span>
                        {label && <span className="text-[10px] font-bold mt-1 bg-black/15 px-2 py-0.5 rounded-full">{label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculations Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Milk</p>
                <p className="text-2xl font-black text-slate-800">{totalLitres.toFixed(1)} Litres</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Milk Bill</p>
                <p className="text-2xl font-black text-slate-800">₹{milkBill.toFixed(0)}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Curd/Extras</p>
                <p className="text-2xl font-black text-slate-800">₹{extrasBill.toFixed(0)}</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl shadow-md text-white text-center flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Bill</p>
                <p className="text-2xl font-black">₹{totalBill.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Dues & Payments Block (Right 1 column) */}
          <div className="space-y-6">
            {/* Balance Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Bill Settlement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between font-medium text-slate-500 text-sm">
                    <span>Monthly Milk Bill:</span>
                    <span className="text-slate-800 font-bold">₹{totalBill}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-500 text-sm">
                    <span>Payments Logged:</span>
                    <span className="text-emerald-600 font-bold">₹{totalPaid}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-800">
                    <span>Outstanding Dues:</span>
                    <span className={totalDues > 0 ? "text-rose-600" : "text-emerald-600"}>
                      ₹{totalDues}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="mt-6 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                💸 Log Payment
              </button>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex-grow">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Payments Hisaab</h3>
              {payments.length === 0 ? (
                <p className="text-sm font-semibold text-slate-400 text-center py-6">No payments recorded for this month.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
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

      {/* MODAL: ADD MILKMAN */}
      {isMilkmanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Add Milkman details</h3>
              <button onClick={() => setIsMilkmanModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleAddMilkman} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Milkman Name</label>
                <input
                  type="text" required
                  value={newMilkmanName} onChange={(e) => setNewMilkmanName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Ramesh Milk Diary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact Number (Optional)</label>
                <input
                  type="tel"
                  value={newMilkmanPhone} onChange={(e) => setNewMilkmanPhone(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Price / Litre (₹)</label>
                  <input
                    type="number" required
                    value={newMilkmanRate} onChange={(e) => setNewMilkmanRate(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Daily Litres (L)</label>
                  <input
                    type="number" step="0.1" required
                    value={newMilkmanQty} onChange={(e) => setNewMilkmanQty(e.target.value)}
                    className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. 1.5"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Add Milkman</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DATE DELIVERY ENTRY */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Log Delivery: {selectedDateStr}</h3>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  {["Delivered", "Not Delivered"].map(st => (
                    <button
                      key={st} type="button"
                      onClick={() => setDeliveryStatus(st)}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        deliveryStatus === st
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {deliveryStatus === "Delivered" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Quantity (Litres)</label>
                      <input
                        type="number" step="0.1" required
                        value={deliveryQty} onChange={(e) => setDeliveryQty(e.target.value)}
                        className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Rate / Litre (₹)</label>
                      <input
                        type="number" required
                        value={deliveryRate} onChange={(e) => setDeliveryRate(e.target.value)}
                        className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Extra Items Bill (₹) (Paneer/Curd)</label>
                    <input
                      type="number" required
                      value={deliveryExtras} onChange={(e) => setDeliveryExtras(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g. 40"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Remarks / Note (Optional)</label>
                <input
                  type="text"
                  value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Milk was thin"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG BILL PAYMENT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Log Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Payment Amount (₹)</label>
                <input
                  type="number" required
                  value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 1500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Payment Date</label>
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
                  placeholder="e.g. Paid online"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Log Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function BillingPayments() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [modalMode, setModalMode] = useState("received"); // 'bill' (Total Due Set karna) ya 'received' (Paisa Jama karna)

  // 1. Firebase se Real-Time Data Fetch
  useEffect(() => {
    if (!auth.currentUser) return;
    const vendorId = auth.currentUser.uid;

    const q = query(collection(db, "customers"), where("vendorId", "==", vendorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const custData = [];
      snapshot.forEach(doc => custData.push({ id: doc.id, ...doc.data() }));
      setCustomers(custData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Global Stats Calculations (Sare Customers ka mila kar)
  const globalTotalBill = customers.reduce((acc, curr) => acc + (curr.totalBill || 0), 0);
  const globalTotalReceived = customers.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const globalTotalPending = globalTotalBill - globalTotalReceived;

  // 3. Modal Handlers
  const handleOpenModal = (customer, mode) => {
    setSelectedCustomer(customer);
    setModalMode(mode);
    // Purana amount input mein pehle se daal do, taaki edit karna aasan ho
    if (mode === "bill") {
      setInputValue(customer.totalBill || 0);
    } else {
      setInputValue(customer.paidAmount || 0);
    }
    setIsModalOpen(true);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const amount = Number(inputValue);
    if (amount < 0) return alert("Amount cannot be negative");

    const customerRef = doc(db, "customers", selectedCustomer.id);

    try {
      if (modalMode === "bill") {
        // Total Bill (Due) ko update/overwrite karo
        await updateDoc(customerRef, { totalBill: amount });
      } else {
        // Received (Jama) ko update/overwrite karo
        await updateDoc(customerRef, { paidAmount: amount });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Transaction Error:", error);
      alert("Failed to update Khata.");
    }
  };

  // 4. Search Filter
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading AttendanceTrackers Billing...</div>;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Khata</h1>
        <p className="text-slate-500">
          Manage customer bills and track collected payments in real-time on <span className="font-semibold text-blue-600">AttendanceTrackers</span>.
        </p>
      </div>

      {/* GLOBAL STATS CARDS (Real Time Update) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expected Bill</p>
            <p className="text-3xl font-black">₹{globalTotalBill}</p>
          </div>
        </div>

        <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Total Received / Credited</p>
            <p className="text-3xl font-black">₹{globalTotalReceived}</p>
          </div>
        </div>

        <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Total Market Due (Pending)</p>
            <p className="text-3xl font-black">₹{globalTotalPending > 0 ? globalTotalPending : 0}</p>
          </div>
        </div>
      </div>

      {/* SMALL ANALYTICS SUMMARY (As requested) */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-bold text-blue-900">Quick Recovery Stats</h3>
          <p className="text-sm text-blue-700">You have successfully collected <span className="font-black">{globalTotalBill > 0 ? Math.round((globalTotalReceived / globalTotalBill) * 100) : 0}%</span> of your total billing.</p>
        </div>
        <div className="hidden sm:block">
           <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
             Total Customers: {customers.length}
           </span>
        </div>
      </div>

      {/* Ledger Section Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold text-slate-800">Customer Khata (Ledger)</h3>
        <div className="relative w-full sm:w-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search customer..."
            className="w-full sm:w-64 rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total Bill</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Pending Due</th>
              <th className="px-6 py-4 text-center">Manage Khata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((c) => {
              const totalBill = c.totalBill || 0;
              const received = c.paidAmount || 0;
              const due = totalBill - received;
              
              let statusLabel = "Unpaid";
              let statusColor = "bg-slate-100 text-slate-600";
              if (received > 0 && due > 0) { statusLabel = "Partial"; statusColor = "bg-amber-100 text-amber-700"; }
              if (received >= totalBill && totalBill > 0) { statusLabel = "Settled"; statusColor = "bg-emerald-100 text-emerald-700"; }

              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-base">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor}`}>{statusLabel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-lg">₹{totalBill}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 text-lg">₹{received}</td>
                  <td className="px-6 py-4">
                    <span className={`font-black text-lg ${due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      ₹{due}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(c, 'bill')} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-200">
                        Update Bill
                      </button>
                      <button onClick={() => handleOpenModal(c, 'received')} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-200">
                        Update Received
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS VIEW */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map((c) => {
          const totalBill = c.totalBill || 0;
          const received = c.paidAmount || 0;
          const due = totalBill - received;

          let statusLabel = "Unpaid";
          let statusColor = "bg-slate-100 text-slate-600";
          if (received > 0 && due > 0) { statusLabel = "Partial"; statusColor = "bg-amber-100 text-amber-700"; }
          if (received >= totalBill && totalBill > 0) { statusLabel = "Settled"; statusColor = "bg-emerald-100 text-emerald-700"; }

          return (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
                  <p className="text-xs text-slate-500">{c.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{statusLabel}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bill</p>
                  <p className="text-sm font-black text-slate-700">₹{totalBill}</p>
                </div>
                <div className="text-center border-l border-r border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Received</p>
                  <p className="text-sm font-black text-emerald-600">₹{received}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Due</p>
                  <p className={`text-sm font-black ${due > 0 ? 'text-rose-600' : 'text-slate-400'}`}>₹{due}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleOpenModal(c, 'bill')} className="w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-all border border-slate-200">
                  Update Bill
                </button>
                <button onClick={() => handleOpenModal(c, 'received')} className="w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-all border border-emerald-200">
                  Update Received
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* --- EDIT KHATA MODAL --- */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative overflow-hidden">
            
            <div className={`absolute top-0 left-0 w-full h-2 ${modalMode === 'bill' ? 'bg-slate-800' : 'bg-emerald-500'}`}></div>

            <div className="flex justify-between items-center mb-6 mt-2">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === 'bill' ? "Set Total Bill" : "Set Total Received"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
            </div>

            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Editing Khata For:</p>
              <p className="font-bold text-slate-800 text-lg">{selectedCustomer.name}</p>
            </div>

            <form onSubmit={handleTransaction}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {modalMode === 'bill' ? "Enter Total Bill Amount (₹)" : "Enter Total Received Amount (₹)"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-bold text-xl text-slate-800"
                  placeholder="Enter amount..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-2">
                  * Note: This will overwrite the previous {modalMode === 'bill' ? 'bill' : 'received'} amount.
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 text-white font-bold rounded-xl transition-colors shadow-md ${
                  modalMode === 'bill' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Save & Update Khata
              </button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";

export default function CustomerLedger() {
  // 1. Core States
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 3. Modals State
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopDesc, setNewShopDesc] = useState("");

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState("Purchase"); // Purchase (Udhari) or Payment (Jamā)
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txDetails, setTxDetails] = useState("");
  const [txNote, setTxNote] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- FIREBASE FETCHING ---

  // Fetch Shops
  useEffect(() => {
    const fetchShops = async () => {
      if (!auth.currentUser) return;
      try {
        const ref = collection(db, "users", auth.currentUser.uid, "shops");
        const snap = await getDocs(ref);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Compute balances locally
        const updatedList = [];
        for (let shop of list) {
          const txRef = collection(db, "users", auth.currentUser.uid, "shops", shop.id, "transactions");
          const txSnap = await getDocs(txRef);
          let bal = 0;
          txSnap.docs.forEach(d => {
            const data = d.data();
            if (data.type === "Purchase") bal += (data.amount || 0); // Udhari increases what you owe
            else if (data.type === "Payment") bal -= (data.amount || 0); // Payment reduces what you owe
          });
          updatedList.push({ ...shop, balance: bal });
        }

        setShops(updatedList);
        if (updatedList.length > 0 && !selectedShopId) {
          setSelectedShopId(updatedList[0].id);
        }
      } catch (error) {
        showToast("Error loading shops", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, [auth.currentUser?.uid]);

  // Fetch Transactions for Selected Shop
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!auth.currentUser || !selectedShopId) return;
      try {
        const ref = collection(db, "users", auth.currentUser.uid, "shops", selectedShopId, "transactions");
        const q = query(ref, orderBy("date", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(list);
      } catch (error) {
        showToast("Error loading ledger statements", "error");
      }
    };
    fetchTransactions();
  }, [selectedShopId, auth.currentUser?.uid]);

  // --- ACTIONS ---

  const handleAddShop = async (e) => {
    e.preventDefault();
    if (!newShopName) return;
    try {
      const ref = collection(db, "users", auth.currentUser.uid, "shops");
      const docRef = await addDoc(ref, {
        name: newShopName,
        phone: newShopPhone || "Not Provided",
        description: newShopDesc || "General Store",
        createdAt: new Date().toISOString()
      });

      const newObj = {
        id: docRef.id,
        name: newShopName,
        phone: newShopPhone || "Not Provided",
        description: newShopDesc || "General Store",
        balance: 0
      };

      setShops([...shops, newObj]);
      setSelectedShopId(docRef.id);
      setIsShopModalOpen(false);
      setNewShopName("");
      setNewShopPhone("");
      setNewShopDesc("");
      showToast("Shop added successfully!");
    } catch (error) {
      showToast("Error adding shop", "error");
    }
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!txAmount || !txDate) return;

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "shops", selectedShopId, "transactions");
      const payload = {
        type: txType,
        amount: Number(txAmount),
        date: txDate,
        details: txDetails || (txType === "Purchase" ? "Goods Purchased" : "Bill Settlement"),
        note: txNote || "",
        timestamp: new Date().toISOString()
      };

      const docRef = await addDoc(ref, payload);

      // Update transactions state
      setTransactions(prev => [{ id: docRef.id, ...payload }, ...prev]);

      // Update local shops state balance
      setShops(prev => prev.map(s => {
        if (s.id === selectedShopId) {
          const delta = txType === "Purchase" ? Number(txAmount) : -Number(txAmount);
          return { ...s, balance: s.balance + delta };
        }
        return s;
      }));

      setIsTxModalOpen(false);
      setTxAmount("");
      setTxDetails("");
      setTxNote("");
      showToast("Ledger entry added successfully!");
    } catch (error) {
      showToast("Failed to record entry", "error");
    }
  };

  const handleDeleteTransaction = async (txId, amount, type) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "shops", selectedShopId, "transactions", txId);
      await deleteDoc(ref);

      setTransactions(prev => prev.filter(t => t.id !== txId));

      // Correct shop balance
      setShops(prev => prev.map(s => {
        if (s.id === selectedShopId) {
          const delta = type === "Purchase" ? -Number(amount) : Number(amount);
          return { ...s, balance: s.balance + delta };
        }
        return s;
      }));

      showToast("Ledger entry deleted.");
    } catch (error) {
      showToast("Failed to delete entry", "error");
    }
  };

  const selectedShop = shops.find(s => s.id === selectedShopId);

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Loading Khata Ledger...</div>;

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
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">📓 Customer Ledger (Khata)</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Manage shop purchases, udhari credits, payments & jamā entries.</p>
        </div>

        <button
          onClick={() => setIsShopModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shadow-md flex items-center gap-2"
        >
          ➕ Add Shop / Business
        </button>
      </div>

      {shops.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📓</div>
          <h2 className="text-2xl font-black text-slate-800">No Shops Registered</h2>
          <p className="text-slate-500 font-semibold mt-2 max-w-md mx-auto">
            Create shop cards (like local grocery, dairy, or vegetable vendor) to manage your credits/udhari statements.
          </p>
          <button
            onClick={() => setIsShopModalOpen(true)}
            className="mt-6 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
          >
            Add New Shop Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left panel - Shops List (1 column) */}
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="bg-slate-900 p-5 text-white font-black text-sm uppercase tracking-wider">
              My Shops & Dues
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[30rem] overflow-y-auto">
              {shops.map(s => {
                const isDebt = s.balance > 0;
                const isPaidAhead = s.balance < 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShopId(s.id)}
                    className={`p-5 cursor-pointer transition-all flex flex-col justify-between gap-2 border-l-4 ${
                      selectedShopId === s.id
                        ? "bg-blue-50 border-blue-500"
                        : "hover:bg-slate-50 border-transparent"
                    }`}
                  >
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{s.name}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{s.description}</p>
                    </div>

                    <div className="text-right">
                      {isDebt && (
                        <p className="text-xs font-bold text-rose-500">
                          You Owe: <span className="text-sm font-black">₹{s.balance}</span>
                        </p>
                      )}
                      {isPaidAhead && (
                        <p className="text-xs font-bold text-emerald-500">
                          Paid Extra: <span className="text-sm font-black">₹{Math.abs(s.balance)}</span>
                        </p>
                      )}
                      {s.balance === 0 && (
                        <p className="text-xs font-bold text-slate-400">Settled</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel - Ledger Table (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            {selectedShop ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-6">
                
                {/* Shop Header Details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedShop.name}</h2>
                    <p className="text-sm font-semibold text-slate-400 mt-1">📞 Phone: {selectedShop.phone} • {selectedShop.description}</p>
                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-center w-full sm:w-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Balance</p>
                    <p className={`text-xl font-black ${selectedShop.balance > 0 ? "text-rose-600" : selectedShop.balance < 0 ? "text-emerald-600" : "text-slate-500"}`}>
                      {selectedShop.balance > 0 ? `You Owe ₹${selectedShop.balance}` : selectedShop.balance < 0 ? `Paid Extra ₹${Math.abs(selectedShop.balance)}` : "Settled"}
                    </p>
                  </div>
                </div>

                {/* Ledger entries list */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">Ledger Statement</h3>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-slate-400 font-semibold text-sm">
                      No purchase or payment logs registered for this shop.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {transactions.map(tx => {
                        const isPurchase = tx.type === "Purchase"; // Red (Udhari)
                        return (
                          <div key={tx.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group transition-all">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-800">{tx.details}</p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {tx.date} {tx.note && `• ${tx.note}`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`text-base font-black ${isPurchase ? "text-rose-500" : "text-emerald-500"}`}>
                                  {isPurchase ? `+ ₹${tx.amount}` : `- ₹${tx.amount}`}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {isPurchase ? "Udhari" : "Jamā"}
                                </p>
                              </div>

                              <button
                                onClick={() => handleDeleteTransaction(tx.id, tx.amount, tx.type)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick actions buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => { setTxType("Purchase"); setIsTxModalOpen(true); }}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    🔴 Purchase (Udhari)
                  </button>
                  <button
                    onClick={() => { setTxType("Payment"); setIsTxModalOpen(true); }}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                  >
                    🟢 Paid (Jamā)
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-[2rem] shadow-sm text-slate-400 font-bold">
                Select a shop from the list to manage your ledger transactions.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: ADD SHOP */}
      {isShopModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Add Shop Details</h3>
              <button onClick={() => setIsShopModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleAddShop} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Shop Name</label>
                <input
                  type="text" required
                  value={newShopName} onChange={(e) => setNewShopName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Verma Groceries"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Contact Number (Optional)</label>
                <input
                  type="tel"
                  value={newShopPhone} onChange={(e) => setNewShopPhone(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Shop Category / Description</label>
                <input
                  type="text"
                  value={newShopDesc} onChange={(e) => setNewShopDesc(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Daily Groceries / Curd"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Add Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEDGER TRANSACTION */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">
                Record {txType === "Purchase" ? "Udhari (Credit)" : "Jamā (Payment)"}
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                <input
                  type="number" required
                  value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input
                  type="date" required
                  value={txDate} onChange={(e) => setTxDate(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Items / Transaction Details</label>
                <input
                  type="text"
                  value={txDetails} onChange={(e) => setTxDetails(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder={txType === "Purchase" ? "e.g. Rice, Soap, Oil" : "e.g. GPay Settlement"}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Note (Optional)</label>
                <input
                  type="text"
                  value={txNote} onChange={(e) => setTxNote(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Self collect / Sent via child"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all ${
                    txType === "Purchase" ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  Log Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

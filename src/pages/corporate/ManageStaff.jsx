import { useState, useEffect } from "react";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function ManageStaff() {
  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("Office Staff");
  const [selectedRoleIcon, setSelectedRoleIcon] = useState("🏢");
  const [workType, setWorkType] = useState("Monthly");
  const [wage, setWage] = useState("");
  
  // App States
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Client ke diye gaye roles configuration
  const roles = [
    { name: "Shop Owner", icon: "🏪" },
    { name: "Milkman", icon: "🥛" },
    { name: "Delivery Staff", icon: "📦" },
    { name: "Maid", icon: "🧹" },
    { name: "Driver", icon: "🚗" },
    { name: "Security", icon: "🛡️" },
    { name: "Freelancer", icon: "💻" },
    { name: "Daily Wage", icon: "👨‍🔧" },
    { name: "Office Staff", icon: "🏢" },
    { name: "Other", icon: "➕" },
  ];

  // 1. Real-time Fetch Staff from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    // Sirf logged-in boss ka staff nikalne ke liye query
    const q = query(
      collection(db, "staff"),
      where("adminId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employees = [];
      snapshot.forEach((doc) => {
        employees.push({ id: doc.id, ...doc.data() });
      });
      setStaffList(employees);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching staff:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Save New Staff to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");
    if (!name || !wage) return alert("Name and Wage are required!");

    setSubmitting(true);
    try {
      await addDoc(collection(db, "staff"), {
        adminId: auth.currentUser.uid,
        name,
        phone: phone || "Not Provided",
        role: selectedRole,
        roleIcon: selectedRoleIcon,
        workType,
        wage: Number(wage),
        joined: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });

      // Reset Form & Close Modal
      setName("");
      setPhone("");
      setWage("");
      setIsModalOpen(false);
      alert("Employee added successfully!");
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add employee.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Delete Staff (Optional Action)
  const handleDelete = async (id, empName) => {
    if (window.confirm(`Are you sure you want to remove ${empName}?`)) {
      try {
        await deleteDoc(doc(db, "staff", id));
        alert("Employee removed successfully.");
      } catch (error) {
        console.error("Error deleting staff:", error);
      }
    }
  };

  // CSS Progress Bars ke liye dynamic payroll calculation
  const totalPayroll = staffList.reduce((sum, emp) => {
    if (emp.workType === "Monthly") return sum + emp.wage;
    if (emp.workType === "Daily") return sum + (emp.wage * 30); // Est. monthly
    return sum + (emp.wage * 8 * 30); // Est. hourly assuming 8hrs/day
  }, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading staff database...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your employees, their work types, and daily wages.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            Add New Staff
          </button>
        </div>

        {/* 📊 Live Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">👥</div>
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm">Total Active Staff</p>
              <h2 className="text-4xl font-black text-slate-800">{staffList.length}</h2>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-600/20 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl backdrop-blur-md">💰</div>
            </div>
            <div className="relative z-10">
              <p className="text-indigo-100 font-medium text-sm">Est. Monthly Payroll</p>
              <h2 className="text-4xl font-black">₹{totalPayroll.toLocaleString()}<span className="text-lg font-medium opacity-80">/mo</span></h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <p className="text-slate-800 font-bold mb-4">Work Type Breakdown</p>
            <div className="space-y-4">
              {["Monthly", "Daily", "Hourly"].map((type) => {
                const count = staffList.filter(e => e.workType === type).length;
                const pct = staffList.length ? (count / staffList.length) * 100 : 0;
                const colors = type === "Monthly" ? "bg-blue-500" : type === "Daily" ? "bg-orange-500" : "bg-purple-500";
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600 font-semibold">{type} Base</span>
                      <span className="text-slate-900">{pct.toFixed(0)}% ({count})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className={`${colors} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📋 Staff List Table */}
        <div className="bg-white border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-800">Your Employees ({staffList.length})</h2>
          </div>
          
          {staffList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">Koi staff member nahi mila. Naya staff add karne ke liye upar button par click karein!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 pl-6">Profile & Role</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Work Type</th>
                    <th className="p-4">Salary / Wage</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 pl-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-200">
                          {staff.roleIcon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{staff.name}</p>
                          <p className="text-xs font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md mt-1">{staff.role}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-700 text-sm">{staff.phone}</p>
                        <p className="text-xs text-slate-400 mt-1">Joined: {staff.joined}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5
                          ${staff.workType === 'Monthly' ? 'bg-blue-50 text-blue-700' : 
                            staff.workType === 'Daily' ? 'bg-orange-50 text-orange-700' : 
                            'bg-purple-50 text-purple-700'}`}
                        >
                          {staff.workType}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-extrabold text-slate-800">
                          ₹{staff.wage}
                          <span className="text-xs font-medium text-slate-500 ml-1">
                            {staff.workType === 'Monthly' ? '/mo' : staff.workType === 'Daily' ? '/day' : '/hr'}
                          </span>
                        </p>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          onClick={() => handleDelete(staff.id, staff.name)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ➕ ADD STAFF MODAL WITH FIREBASE SUBMIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)}></div>
          
          <form onSubmit={handleSubmit} className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Add New Staff</h2>
              <button type="button" disabled={submitting} onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all text-slate-800" placeholder="e.g. Ramesh Kumar" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all text-slate-800" placeholder="WhatsApp Number" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Role / Profile</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r, i) => (
                    <button 
                      key={i} 
                      type="button"
                      onClick={() => { setSelectedRole(r.name); setSelectedRoleIcon(r.icon); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all
                        ${selectedRole === r.name ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      <span>{r.icon}</span> {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Work Type</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["Monthly", "Daily", "Hourly"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setWorkType(type)}
                      className={`p-3 rounded-xl border-2 font-bold text-sm transition-all text-center
                        ${workType === type ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <label className="block text-sm font-bold text-slate-700 mb-1.5">Wage / Rate Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold text-slate-400">₹</div>
                  <input type="number" required value={wage} onChange={(e) => setWage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-bold text-slate-800 transition-all" placeholder="e.g. 15000 or 400" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? "Saving Employee..." : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
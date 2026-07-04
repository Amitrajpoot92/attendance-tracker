import { useState, useEffect } from "react";
import AddCustomerModal from "../../components/Vendor/AddCustomerModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function ManageCustomers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit & Delete ke liye nayi states
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "customers"), 
      where("vendorId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // EDIT Logic - Modal open karo aur data pass karo
  const handleEdit = (customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  // DELETE Logic - Custom modal open karo
  const confirmDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const executeDelete = async () => {
    try {
      await deleteDoc(doc(db, "customers", deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, name: "" }); // Modal band karo
    } catch (error) {
      console.error("Error deleting customer: ", error);
      alert("Failed to delete customer.");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
  );

  const planStats = [
    { name: "Monthly", value: customers.filter(c => c.plan === "Monthly").length, color: "#3b82f6" }, 
    { name: "Daily", value: customers.filter(c => c.plan === "Daily").length, color: "#a855f7" }    
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading AttendanceTrackers data...</div>;
  }

  return (
    <div className="pb-8 relative">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Customers</h1>
          <p className="text-slate-500">
            View, search, and manage your delivery network on <span className="font-semibold text-blue-600">AttendanceTrackers</span>.
          </p>
        </div>
        <button 
          onClick={() => {
            setCustomerToEdit(null); // Naya add karte time edit state clear rakho
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Customer
        </button>
      </div>

      {/* Analytics & Stats Section */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Customers</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Daily Qty</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {customers.reduce((acc, curr) => acc + (curr.qty || 0), 0)} Units
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planStats} innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none">
                    {planStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Plan Distribution</h3>
              <div className="space-y-1">
                {planStats.map((stat, i) => (
                  <div key={i} className="flex items-center text-xs text-slate-600">
                    <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: stat.color }}></div>
                    <span>{stat.name}: <strong className="text-slate-800">{stat.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name, address, or phone..."
          className="w-full max-w-lg rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm text-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- DESKTOP VIEW: Table --- */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer Info</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Plan Type</th>
              <th className="px-6 py-4 text-center">Qty / Day</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {customer.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{customer.address}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${customer.plan === 'Monthly' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {customer.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 text-center">{customer.qty}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  {/* EDIT BUTTON */}
                  <button onClick={() => handleEdit(customer)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  {/* DELETE BUTTON */}
                  <button onClick={() => confirmDelete(customer.id, customer.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                  {searchTerm ? "No matching customers found." : "No customers yet. Click '+ Add New Customer' to start!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW: Cards --- */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {customer.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{customer.name}</h3>
                  <p className="text-sm text-slate-500">{customer.phone}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${customer.plan === 'Monthly' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                {customer.plan}
              </span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-4 border border-slate-100">
              <p className="flex items-start gap-2 mb-2">
                <svg className="w-4 h-4 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                {customer.address}
              </p>
              <p className="flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                Quantity: <span className="text-slate-900 font-bold">{customer.qty} / Day</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(customer)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Edit
              </button>
              <button onClick={() => confirmDelete(customer.id, customer.name)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 bg-red-50 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
            {searchTerm ? "No matching customers found." : "No customers yet. Click '+ Add New Customer' to start!"}
          </div>
        )}
      </div>

      {/* Components rendering */}
      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setCustomerToEdit(null); // Band hone par state clear karo
        }} 
        customerToEdit={customerToEdit} // Pass the data to Edit
      />

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Customer?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to remove <span className="font-bold text-slate-800">{deleteModal.name}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null, name: "" })} 
                className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Deny
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md shadow-red-200"
              >
                OK, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
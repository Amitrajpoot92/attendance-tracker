import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import AddCustomerModal from "../../components/Vendor/AddCustomerModal";

// --- DUMMY DATA (Baad mein Firebase se aayega) ---
const revenueData = [
  { name: "Mon", amount: 1200 },
  { name: "Tue", amount: 1900 },
  { name: "Wed", amount: 1500 },
  { name: "Thu", amount: 2200 },
  { name: "Fri", amount: 1800 },
  { name: "Sat", amount: 2500 },
  { name: "Sun", amount: 2100 },
];

const deliveryData = [
  { name: "Delivered", value: 85, color: "#10B981" }, // Emerald green
  { name: "Pending", value: 15, color: "#F43F5E" },   // Rose red
];

const recentCustomers = [
  { id: 1, name: "Rahul Kumar", address: "Flat 101, B Wing", plan: "Monthly" },
  { id: 2, name: "Amit Singh", address: "House 42, Sector 4", plan: "Daily" },
  { id: 3, name: "Priya Sharma", address: "A-204, Galaxy Apts", plan: "Monthly" },
];
// -------------------------------------------------

export default function VendorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendor Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here is your business overview.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          + Add Customer
        </button>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Customers</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Today's Deliveries</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">85 / 100</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Pending Amount</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">₹4,500</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Bar Chart (Takes 2 columns on large screens) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Revenue (₹)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Status Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Status</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for Donut Chart */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">85%</span>
              <span className="text-xs text-slate-500 font-medium">Completed</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-slate-600">Delivered</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-sm text-slate-600">Pending</span></div>
          </div>
        </div>
      </div>

      {/* Recent Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Recent Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{customer.name}</td>
                  <td className="px-6 py-4">{customer.address}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${customer.plan === 'Monthly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {customer.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
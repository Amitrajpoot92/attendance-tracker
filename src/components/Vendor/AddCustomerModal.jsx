import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Naya prop add kiya: customerToEdit
export default function AddCustomerModal({ isOpen, onClose, customerToEdit }) {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(""); 
  const [quantity, setQuantity] = useState(1);
  const [subscriptionPlan, setSubscriptionPlan] = useState("Monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jab bhi Modal khule, check karo ki Edit mode hai ya Add mode
  useEffect(() => {
    if (customerToEdit && isOpen) {
      // Edit Mode: Purana data form mein daal do
      setCustomerName(customerToEdit.name || "");
      setAddress(customerToEdit.address || "");
      setPhone(customerToEdit.phone || "");
      setQuantity(customerToEdit.qty || 1);
      setSubscriptionPlan(customerToEdit.plan || "Monthly");
    } else if (isOpen) {
      // Add Mode: Form ko khaali (reset) kar do
      setCustomerName("");
      setAddress("");
      setPhone("");
      setQuantity(1);
      setSubscriptionPlan("Monthly");
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Error: You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (customerToEdit) {
        // UPDATE LOGIC (Agar pehle se id hai)
        const customerRef = doc(db, "customers", customerToEdit.id);
        await updateDoc(customerRef, {
          name: customerName,
          address: address,
          phone: phone,
          plan: subscriptionPlan,
          qty: Number(quantity)
        });
      } else {
        // ADD NEW LOGIC (Naya customer)
        await addDoc(collection(db, "customers"), {
          vendorId: auth.currentUser.uid, 
          name: customerName,
          address: address,
          phone: phone,
          plan: subscriptionPlan,
          qty: Number(quantity),
          createdAt: serverTimestamp() 
        });
      }
      
      onClose(); 
    } catch (error) {
      console.error("Error saving customer: ", error);
      alert("Failed to save customer. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
        
        <div className="flex justify-between items-center mb-6">
          {/* Header dynamic kar diya */}
          <h2 className="text-xl font-bold text-slate-800">
            {customerToEdit ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Rahul Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">House/Flat Number</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Flat 101, B Wing"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Qty / Day</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Plan</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 text-white font-bold rounded-lg transition-colors mt-4 flex justify-center items-center gap-2 
              ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (customerToEdit ? "Update Customer" : "Save Customer")}
          </button>
        </form>
      </div>
    </div>
  );
}
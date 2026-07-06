import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Environment variables se Cloudinary configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function CorporateSettings() {
  // Form States
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [logoPic, setLogoPic] = useState("");
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Available Currencies for Global Support
  const currencies = [
    { symbol: "₹", name: "Indian Rupee (INR)" },
    { symbol: "$", name: "US Dollar (USD)" },
    { symbol: "€", name: "Euro (EUR)" },
    { symbol: "£", name: "British Pound (GBP)" },
    { symbol: "د.إ", name: "UAE Dirham (AED)" },
    { symbol: "৳", name: "Bangladeshi Taka (BDT)" },
    { symbol: "Rs", name: "Pakistani Rupee (PKR)" },
  ];

  // 1. Fetch Existing Settings on Load
  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      try {
        const settingsRef = doc(db, "corporate_settings", auth.currentUser.uid);
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompanyName(data.companyName || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setAddress(data.address || "");
          setCurrency(data.currency || "₹");
          setLogoPic(data.logoPic || "");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Upload Logo to Cloudinary
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Cloudinary upload failed");

      const data = await response.json();
      const newLogoUrl = data.secure_url;

      setLogoPic(newLogoUrl);
      
      // Auto-save logo to Firebase
      if (auth.currentUser) {
        await setDoc(doc(db, "corporate_settings", auth.currentUser.uid), { logoPic: newLogoUrl }, { merge: true });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Logo upload failed. Please check your internet or Cloudinary settings.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // 3. Save Text Settings to Firebase
  const handleSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");

    setSaving(true);
    try {
      const settingsRef = doc(db, "corporate_settings", auth.currentUser.uid);
      await setDoc(settingsRef, {
        adminId: auth.currentUser.uid,
        companyName,
        phone,
        email,
        address,
        currency,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Corporate settings and currency updated globally!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative overflow-hidden pb-24">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Company Settings</h1>
          <p className="text-slate-500 font-medium">
            Manage your brand profile, contact details, and global currency preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Business Profile Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">🏢</span>
                Business Profile
              </h2>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company / Shop Name</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-semibold transition-all text-slate-800" 
                    placeholder="Enter business name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all text-slate-800" 
                      placeholder="+91"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all text-slate-800" 
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Office / Shop Address</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all text-slate-800 resize-none" 
                    placeholder="Enter full address"
                  ></textarea>
                </div>

                {/* Mobile Save Button (Hidden on Desktop) */}
                <button 
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="w-full lg:hidden bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] mt-4"
                >
                  {saving ? "Saving Updates..." : "Save Corporate Settings"}
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Logo & App Preferences */}
          <div className="space-y-6">
            
            {/* Global Currency Setup */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm border border-white/10">
                  🌍
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Global App Currency</h3>
                  <p className="text-xs text-slate-400 font-medium">Applies to all calculations</p>
                </div>
              </div>

              <div className="relative z-10">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white font-bold text-lg rounded-xl pl-4 pr-10 py-3.5 outline-none focus:border-blue-400 cursor-pointer appearance-none"
                >
                  {currencies.map(curr => (
                    <option key={curr.symbol} value={curr.symbol} className="text-slate-900">
                      {curr.symbol} - {curr.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Logo Upload Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-indigo-100/50 p-6 flex flex-col items-center text-center">
              <h3 className="font-bold text-slate-800 mb-2">Company Logo</h3>
              <p className="text-xs text-slate-500 mb-5">Appears on Salary PDFs & Reports</p>
              
              <label className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all relative overflow-hidden group">
                {logoPic ? (
                  <img src={logoPic} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-xs font-bold">Upload Logo</span>
                  </div>
                )}
                
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                    <span className="w-6 h-6 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></span>
                  </div>
                )}

                <div className="absolute inset-0 bg-slate-900/60 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    Change
                  </span>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
            </div>

            {/* Desktop Save Button */}
            <button 
              onClick={handleSave}
              disabled={saving || uploadingLogo}
              className={`hidden lg:flex w-full py-4 rounded-xl font-bold items-center justify-center gap-2 transition-all shadow-xl
                ${(saving || uploadingLogo) ? 'bg-indigo-400 text-white cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 active:scale-[0.98]'}`}
            >
              {saving ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving Updates...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  Save Corporate Settings
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
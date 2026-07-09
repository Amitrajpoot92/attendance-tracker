import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Environment variables se Cloudinary configuration le rahe hain
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function SettingsProfile() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [currency, setCurrency] = useState("₹");
  
  const [profilePic, setProfilePic] = useState("");
  const [qrCodePic, setQrCodePic] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Uploading states
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        // Ab 'users' collection use kar rahe hain personal tracker ke liye
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setUpiId(data.upiId || "");
          setCurrency(data.currency || "₹");
          setProfilePic(data.profilePic || "");
          setQrCodePic(data.qrCodePic || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // 2. Direct Cloudinary Upload Logic
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") setUploadingProfile(true);
    if (type === "qr") setUploadingQr(true);

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
      const newImageUrl = data.secure_url;

      // Update State & Auto-save to Firebase
      if (type === "profile") {
        setProfilePic(newImageUrl);
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), { profilePic: newImageUrl }, { merge: true });
        }
      } else if (type === "qr") {
        setQrCodePic(newImageUrl);
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), { qrCodePic: newImageUrl }, { merge: true });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed. Please check your internet or Cloudinary settings.");
    } finally {
      if (type === "profile") setUploadingProfile(false);
      if (type === "qr") setUploadingQr(false);
    }
  };

  // 3. Save Text Details to Firebase
  const handleSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return alert("Please login first!");

    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        fullName,
        phone,
        upiId,
        currency,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Profile settings saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12 bg-slate-50 relative overflow-hidden">
      
      {/* 🌟 Premium Background Effects */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">My Profile</h1>
          <p className="text-slate-500 font-medium">
            Manage your personal details and payment setup for <span className="text-blue-600 font-bold">Personal Tracker</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden relative group">
              
              {/* Premium Gradient Cover */}
              <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              
              <div className="px-6 sm:px-10 pb-10 relative">
                
                {/* 📸 Profile Avatar Upload */}
                <div className="absolute -top-14 left-6 sm:left-10 flex flex-col items-center">
                  <div className="w-28 h-28 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-blue-600 overflow-hidden relative group/avatar cursor-pointer">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
                    )}
                    
                    {/* Loading State */}
                    {uploadingProfile && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <label className="absolute inset-0 bg-black/60 hidden group-hover/avatar:flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                      <svg className="w-7 h-7 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        onChange={(e) => handleImageUpload(e, "profile")}
                        disabled={uploadingProfile}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="pt-20 mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{fullName || "Your Full Name"}</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    User ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{auth.currentUser?.uid.slice(0, 8)}</span>
                  </p>
                </div>

                {/* 📝 Settings Form */}
                <form onSubmit={handleSave} className="space-y-6">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <input type="text" required className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
                    </div>
                  </div>

                  {/* Phone & Currency Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <input type="tel" required className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
                      </div>
                    </div>

                    {/* Currency Select */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Currency</label>
                      <select 
                        value={currency} onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-slate-50 rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800"
                      >
                        <option value="₹">₹ (INR - Rupee)</option>
                        <option value="$">$ (USD - Dollar)</option>
                        <option value="€">€ (EUR - Euro)</option>
                        <option value="£">£ (GBP - Pound)</option>
                        <option value="AED">AED (Dirham)</option>
                      </select>
                    </div>
                  </div>

                  {/* UPI ID */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
                      UPI ID (Optional)
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Receive Money</span>
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                      </div>
                      <input type="text" className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@ybl" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={saving || uploadingProfile || uploadingQr} className={`relative flex items-center justify-center w-full sm:w-auto px-10 py-4 text-white rounded-xl font-bold text-lg overflow-hidden transition-all duration-200 ${saving || uploadingProfile || uploadingQr ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 shadow-xl shadow-slate-900/20 active:scale-[0.97]"}`}>
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <span className="relative z-10">Save Details</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: QR Preview & Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-indigo-200/50 flex flex-col items-center text-center relative">
              
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-6">Payment QR</h3>
              
              {/* QR Upload Box */}
              <label className="w-56 h-56 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all relative overflow-hidden group/qr shadow-inner">
                {qrCodePic ? (
                  <img src={qrCodePic} alt="QR Code" className="w-full h-full object-cover p-2" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover/qr:text-indigo-500 transition-colors">
                    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-sm font-bold">Upload QR Image</span>
                  </div>
                )}
                
                {/* Uploading Spinner */}
                {uploadingQr && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <span className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-2"></span>
                      <span className="text-xs font-bold text-indigo-600">Uploading...</span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-indigo-900/80 hidden group-hover/qr:flex items-center justify-center backdrop-blur-sm transition-all">
                  <span className="text-white text-sm font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    Change QR Code
                  </span>
                </div>
                
                <input 
                  type="file" accept="image/*" className="hidden" 
                  onChange={(e) => handleImageUpload(e, "qr")}
                  disabled={uploadingQr}
                />
              </label>

              <div className="w-full p-4 bg-indigo-50/80 border border-indigo-100 text-indigo-800 text-xs rounded-2xl font-semibold leading-relaxed text-left flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Upload your payment QR code here. Share this directly with contractors or clients when sending your bill.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
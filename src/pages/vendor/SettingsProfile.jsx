import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Environment variables se Cloudinary configuration le rahe hain
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function SettingsProfile() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  
  const [profilePic, setProfilePic] = useState("");
  const [qrCodePic, setQrCodePic] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dono uploads ke liye alag loading states taaki UI smooth rahe
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!auth.currentUser) return;
      try {
        const vendorRef = doc(db, "vendors", auth.currentUser.uid);
        const docSnap = await getDoc(vendorRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShopName(data.shopName || "");
          setPhone(data.phone || "");
          setUpiId(data.upiId || "");
          setProfilePic(data.profilePic || "");
          setQrCodePic(data.qrCodePic || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, []);

  // 2. Direct Cloudinary Upload Logic (No Backend Needed)
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") setUploadingProfile(true);
    if (type === "qr") setUploadingQr(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      // Cloudinary API call
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
          await setDoc(doc(db, "vendors", auth.currentUser.uid), { profilePic: newImageUrl }, { merge: true });
        }
      } else if (type === "qr") {
        setQrCodePic(newImageUrl);
        if (auth.currentUser) {
          await setDoc(doc(db, "vendors", auth.currentUser.uid), { qrCodePic: newImageUrl }, { merge: true });
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
      const vendorRef = doc(db, "vendors", auth.currentUser.uid);
      await setDoc(vendorRef, {
        shopName,
        phone,
        upiId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Profile settings saved successfully on AttendanceTrackers!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Profile Data...</div>;

  return (
    <div className="pb-8">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings & Profile</h1>
        <p className="text-slate-500">
          Manage your business details and payment setup on <span className="font-semibold text-blue-600">AttendanceTrackers</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Profile Avatar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>
          
          <div className="px-6 pb-6 relative">
            {/* Profile Upload Avatar */}
            <div className="absolute -top-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-blue-600 overflow-hidden relative group cursor-pointer">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{shopName ? shopName.charAt(0).toUpperCase() : "V"}</span>
                )}
                
                {uploadingProfile && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}

                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {/* Standard File Input instead of IKUpload */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, "profile")}
                    disabled={uploadingProfile}
                  />
                </label>
              </div>
            </div>
            
            <div className="pt-16 mb-6">
              <h2 className="text-xl font-bold text-slate-800">{shopName || "Your Business Name"}</h2>
              <p className="text-sm text-slate-500">Vendor Account ID: <span className="font-mono text-xs">{auth.currentUser?.uid.slice(0, 8)}...</span></p>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Business / Shop Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <input type="text" required className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 shadow-sm" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Enter Shop Name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <input type="tel" required className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">UPI ID (For Customer Payments)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <input type="text" className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 shadow-sm" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@upi" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button type="submit" disabled={saving || uploadingProfile || uploadingQr} className={`w-full sm:w-auto text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md ${saving || uploadingProfile || uploadingQr ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}>
                  {saving ? "Saving Data..." : "Save Profile Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: QR Preview & Upload */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
            <h3 className="font-bold text-slate-800 mb-4">Payment QR Setup</h3>
            
            <label className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden group">
              {qrCodePic ? (
                <img src={qrCodePic} alt="QR Code" className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  <span className="text-xs font-semibold text-slate-500">Upload QR Image</span>
                </>
              )}
              
              {uploadingQr && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
              )}

              <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center">
                <span className="text-white text-xs font-bold flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  Change QR
                </span>
              </div>
              
              {/* Standard File Input instead of IKUpload */}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleImageUpload(e, "qr")}
                disabled={uploadingQr}
              />
            </label>

            <p className="text-sm font-semibold text-slate-700">{shopName || "Shop Name"}</p>
            <p className="text-xs text-slate-500 mt-1">UPI: <span className="font-medium text-blue-600">{upiId || "Not set"}</span></p>
            
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium w-full text-left flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Upload your PhonePe/Paytm QR code screenshot here. This will be shown to customers for easy scanning.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
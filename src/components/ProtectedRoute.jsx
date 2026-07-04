import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom"; // <-- 1. Outlet import kiya
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"; 

export default function ProtectedRoute() { // <-- 2. { children } hata diya
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase se live check karo ki koi login hai ya nahi
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Check complete ho gaya
    });

    return () => unsubscribe();
  }, []);

  // Jab tak Firebase check kar raha hai, loading dikhao
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-500">Securing your route...</p>
      </div>
    );
  }

  // Agar user nahi mila (bina login ke aaya hai), toh seedha login page par fek do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Agar user mil gaya, toh Outlet return karo (Ye tumhare Dashboard ko render karega)
  return <Outlet />;
}
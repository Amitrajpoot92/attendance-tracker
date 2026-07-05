import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-x-hidden">
      
      {/* 🌟 Mobile-Optimized Background Blobs */}
      <div className="absolute top-0 left-[-20%] w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 pointer-events-none"></div>

      <Header />

      {/* Main Container - Optimized for Phone Width */}
      <main className="flex-grow flex flex-col items-center px-4 py-12 relative z-10 w-full max-w-md mx-auto sm:max-w-5xl">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-5 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/60 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Smart Management System
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Har Din Ka Hisaab, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Ab Ungliyon Par!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed px-2">
            Unorganized sector ki daily deliveries ho ya corporate office ki attendance—sab kuch ek single platform par bina kisi jhanjhat ke manage karein.
          </p>
        </div>

        {/* VENDOR DETAILED SECTION */}
        <div className="w-full bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-blue-900/5 border border-blue-50 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm">
              🛵
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Vendor Panel</h2>
              <p className="text-sm font-bold text-blue-600 mt-0.5">Daily Deliveries ke liye</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            <strong className="text-slate-800 font-bold">Kiske liye hai?</strong> Paperboy, Dudh wale bhaiya, Tiffin services, Water supply aur un sabhi ke liye jo daily basis par items deliver karte hain.
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>1-Click Daily Entry:</strong> Roz subah copy-pen dhoondhne ki tension khatam. Mobile se ek click me sabhi customers ki entry.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>Auto Billing:</strong> Mahine ke end me har customer ka bill automatic calculate hoga. Hisaab me 1 rupye ki galti nahi.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>Direct UPI Payments:</strong> Apna personal QR code app me lagao aur customer se direct apne account me payment lo.</span>
              </li>
            </ul>
          </div>

          <Link
            to="/register"
            className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-[0.97] transition-transform duration-200"
          >
            Register as Vendor
          </Link>
        </div>

        {/* CORPORATE DETAILED SECTION */}
        <div className="w-full bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-indigo-900/5 border border-indigo-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm">
              🏢
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Corporate Panel</h2>
              <p className="text-sm font-bold text-indigo-600 mt-0.5">Offices & Agencies ke liye</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            <strong className="text-slate-800 font-bold">Kiske liye hai?</strong> HR Managers, Startup Founders, Retail Shops aur Team Leads ke liye jinhe staff manage karna hai.
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-indigo-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>Smart Attendance:</strong> Apne employees ka daily Punch-In aur Punch-Out easily track karein bina kisi biometric device ke.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-indigo-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>Leave Management:</strong> Staff ki chhuttiyon (leaves) ka record ek jagah maintain rahega, aage chal kar koi bahas ya confusion nahi.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span className="text-indigo-500 mt-0.5 text-lg leading-none">✅</span>
                <span><strong>Salary Ready Reports:</strong> Mahine ke aakhri me bas 1 click se poori team ki attendance report nikalein aur aasani se salary banayein.</span>
              </li>
            </ul>
          </div>

          <Link
            to="/register"
            className="block w-full py-4 bg-white border-2 border-indigo-600 text-indigo-700 text-center rounded-xl font-bold text-lg shadow-sm active:scale-[0.97] active:bg-indigo-50 transition-all duration-200"
          >
            Register as Corporate
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
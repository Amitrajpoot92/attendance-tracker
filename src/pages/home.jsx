import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-x-hidden">
      
      {/* 🌟 Premium Tech Grid Background & Animated Glowing Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Header />

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center px-4 py-16 relative z-10 w-full max-w-md mx-auto sm:max-w-5xl">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 mb-16 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 text-slate-700 text-xs font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Next-Gen Management
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Har Din Ka Hisaab, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 drop-shadow-sm">
              Ab Ungliyon Par!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed px-4 font-medium max-w-2xl mx-auto">
            Unorganized sector ki daily deliveries ho ya corporate office ki attendance—sab kuch ek single platform par bina kisi jhanjhat ke manage karein.
          </p>
        </div>

        {/* VENDOR DETAILED SECTION (Glassmorphism UI) */}
        <div className="w-full relative group mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-10 shadow-2xl shadow-blue-900/5 border border-white">
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Vendor Panel</h2>
                <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mt-1">Daily Deliveries</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">
              <span className="text-slate-900 font-bold bg-blue-100 px-2 py-0.5 rounded">Target:</span> Paperboy, Dudh wale bhaiya, Tiffin services, aur Daily Needs suppliers.
            </p>

            <div className="space-y-5 mb-8">
              {[
                { title: "1-Click Daily Entry", desc: "Roz subah copy-pen dhoondhne ki tension khatam. Ek click me sabhi customers ki entry." },
                { title: "Auto Billing", desc: "Mahine ke end me har customer ka bill automatic calculate hoga. 1 rupye ki galti nahi." },
                { title: "Direct UPI Payments", desc: "Apna personal QR code lagao aur customer se direct apne account me payment lo." }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="relative flex items-center justify-center w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg overflow-hidden active:scale-[0.97] transition-all duration-200 shadow-xl shadow-slate-900/20"
            >
              <span className="relative z-10">Start as Vendor 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        {/* CORPORATE DETAILED SECTION (Glassmorphism UI) */}
        <div className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-10 shadow-2xl shadow-indigo-900/5 border border-white">
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Corporate Panel</h2>
                <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-1">Offices & Teams</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">
              <span className="text-slate-900 font-bold bg-indigo-100 px-2 py-0.5 rounded">Target:</span> HR Managers, Startup Founders, Retail Shops, aur Team Leads.
            </p>

            <div className="space-y-5 mb-8">
              {[
                { title: "Smart Attendance", desc: "Employees ka daily Punch-In/Out easily track karein bina kisi expensive biometric device ke." },
                { title: "Leave Management", desc: "Staff ki chhuttiyon ka record maintain rahega, aage chal kar deduction me koi confusion nahi." },
                { title: "Salary Ready Reports", desc: "Mahine ke aakhri me bas 1 click se poori team ki attendance report nikalein aur salary banayein." }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="flex items-center justify-center w-full py-4 bg-white border-2 border-indigo-600 text-indigo-700 rounded-2xl font-bold text-lg active:scale-[0.97] active:bg-indigo-50 transition-all duration-200 shadow-lg shadow-indigo-100"
            >
              Start as Corporate 🏢
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("App is already installed, or your browser restricts direct installation. Tap the 3-dots menu in your browser and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const targetUsers = [
    { icon: "👨‍🔧", name: "Daily Workers" },
    { icon: "🧹", name: "House Helpers" },
    { icon: "🚗", name: "Drivers" },
    { icon: "🥛", name: "Daily Suppliers" },
    { icon: "💻", name: "Freelancers" },
    { icon: "🛡️", name: "Security Guards" },
    { icon: "📦", name: "Delivery Partners" },
    { icon: "🏪", name: "Shop Owners" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-x-hidden">
      
      {/* 🌟 Premium Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-16 relative z-10 w-full max-w-md mx-auto sm:max-w-5xl">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 mb-16 relative">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-sm hover:shadow-md transition-all">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            #1 Earning & Attendance App
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Har Din Ka Hisaab, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 drop-shadow-sm">
              Ab Ungliyon Par!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed px-4 font-medium max-w-2xl mx-auto">
            Track your personal daily earnings effortlessly, or manage your staff's attendance and salary on a single, highly-secure platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
              Get Started for Free
            </Link>
            <button onClick={handleInstallClick} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-bold text-lg shadow-sm hover:border-blue-500 hover:text-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install App
            </button>
          </div>
        </div>

        {/* 🎯 TARGET USERS GRID (Premium Upgrade) */}
        <div className="w-full mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Who is this for?</h2>
            <p className="text-slate-500 font-medium mt-2">Perfect for independent professionals and growing businesses.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {targetUsers.map((user, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-300 transition-all duration-300 cursor-default group">
                <div className="text-4xl mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">{user.icon}</div>
                <h3 className="font-bold text-slate-700 text-sm">{user.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* 💎 PANELS SECTION: Personal & Corporate (High-End SaaS UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-24">
          
          {/* PERSONAL EARNING TRACKER CARD */}
          <div className="relative w-full group rounded-[2rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            
            <div className="p-8 sm:p-10 flex-grow flex flex-col">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-blue-100 shrink-0">
                  💰
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Personal Earning Tracker</h2>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1.5">For Independent Workers</p>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Set your personal daily rate or wage structure.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Mark your daily presence on an interactive calendar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Auto-calculate your total monthly earnings instantly.</span>
                </li>
              </ul>
              
              <Link to="/register" className="w-full text-center py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow-md">
                Track My Earnings
              </Link>
            </div>
          </div>

          {/* BUSINESS ATTENDANCE TRACKER CARD */}
          <div className="relative w-full group rounded-[2rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            
            <div className="p-8 sm:p-10 flex-grow flex flex-col">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100 shrink-0">
                  📋
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Business Attendance</h2>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1.5">For Shops, Agencies & SMEs</p>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Manage multiple staff members and diverse profiles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Auto-calculate exact payroll, overtime, and deductions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span className="text-slate-600 font-medium leading-relaxed">Generate professional PDF & WhatsApp Payslips.</span>
                </li>
              </ul>
              
              <Link to="/register" className="w-full text-center py-4 bg-white border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-lg active:scale-95 transition-all shadow-sm">
                Manage My Staff
              </Link>
            </div>
          </div>
        </div>

        {/* 🚀 SEO CONTENT SECTION */}
        <article className="w-full bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200 text-slate-700 mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-6">What is the Personal Earning & Attendance Tracker?</h2>
          <p className="mb-6 leading-relaxed">
            Whether you are an independent professional keeping track of your daily earnings or a business managing team attendance, our platform replaces traditional pen-and-paper ledgers with a smart, automated, and secure digital platform. Keep your <strong>Online Hisab Diary</strong> up to date in real-time.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">How to Use the Tracker</h3>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li><strong>Register:</strong> Create an account as an Individual Worker or a Business Manager.</li>
            <li><strong>Setup Profile:</strong> Set your custom daily rate, or add your staff details.</li>
            <li><strong>Mark Attendance:</strong> Simply tap on the calendar to mark presence, absence, or half-days.</li>
            <li><strong>Auto Calculate:</strong> Let the system instantly calculate the accurate monthly wages based on your live calendar logs.</li>
          </ol>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Benefits of Using Our Platform</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Zero paperwork and no missing or damaged records.</li>
            <li>Accurate, real-time earning and salary calculations.</li>
            <li>Instant PDF generation and WhatsApp sharing functionality.</li>
            <li>Cloud-synced data ensures your records are safe even if you switch devices.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Attendance Status Meaning</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>P (Present):</strong> Full day logged.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>A (Absent):</strong> No work logged.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>HD (Half Day):</strong> Half a shift logged.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>H (Holiday):</strong> Paid holiday.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-2"><strong>L (Leave):</strong> Approved leave.</div>
          </div>

          <hr className="border-slate-200 mb-8 mt-10" />

          <h3 className="text-2xl font-black text-slate-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800">Is this application free to use?</h4>
              <p className="text-sm mt-1 text-slate-600">Yes, the core earning and attendance tracking features are completely free to use for individuals and small teams.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Can I use this app on my mobile phone?</h4>
              <p className="text-sm mt-1 text-slate-600">Absolutely! The platform is highly mobile-optimized. You can even click the "Install App" button to save it directly to your home screen like a native app.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Is my personal data safe?</h4>
              <p className="text-sm mt-1 text-slate-600">Yes, your data is securely stored in cloud databases. This means your earnings and records are safe and accessible from any device.</p>
            </div>
          </div>
        </article>

      </main>

      <Footer />

      {/* 📱 FLOATING APK INSTALL BUTTON */}
      <button 
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white pl-4 pr-5 py-3 rounded-full font-bold shadow-2xl shadow-green-600/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
      >
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

    </div>
  );
}
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Browser jab app install karne ke liye ready hota hai, toh ye event fire hota hai
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const targetUsers = [
    { icon: "🏪", name: "Shop Owners" },
    { icon: "🥛", name: "Milkman" },
    { icon: "📰", name: "Newspaper Delivery" },
    { icon: "🧹", name: "Maid" },
    { icon: "🚗", name: "Drivers" },
    { icon: "🛡️", name: "Security Guards" },
    { icon: "📦", name: "Delivery Staff" },
    { icon: "💻", name: "Freelancers" },
    { icon: "🎓", name: "Students" },
    { icon: "👨‍🔧", name: "Daily Wage Workers" },
    { icon: "🏢", name: "Office Employees" },
    { icon: "➕", name: "Other" },
  ];

  // NAYA INSTALL LOGIC (Purana alert hata diya gaya hai)
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Asli Chrome/Safari/Edge ka install prompt dikhao
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Agar browser prompt block kar de ya app pehle se install ho
      alert("App is already installed, or your browser restricts direct installation. Tap the 3-dots menu in your browser and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 relative overflow-x-hidden">
      
      {/* 🌟 Premium Tech Grid Background */}
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
              Get Started for Free
            </Link>
            
            {/* HERO INSTALL BUTTON */}
            <button onClick={handleInstallClick} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-bold text-lg shadow-sm hover:border-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Install APK
            </button>
          </div>
        </div>

        {/* 🎯 TARGET USERS GRID */}
        <div className="w-full mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Who is this for?</h2>
            <p className="text-slate-500 font-medium mt-2">Perfect for every business size and daily operations.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {targetUsers.map((user, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl text-center hover:shadow-lg hover:border-blue-300 transition-all cursor-default group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{user.icon}</div>
                <h3 className="font-bold text-slate-700 text-sm">{user.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* VENDOR & CORPORATE PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-20">
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-white flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0">🛵</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Vendor Panel</h2>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Daily Deliveries</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-blue-500">✅</span> 1-Click Daily Entry for customers.</li>
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-blue-500">✅</span> Auto Billing at month-end.</li>
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-blue-500">✅</span> Direct UPI Payments via QR.</li>
              </ul>
              <Link to="/register" className="text-center py-4 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-all">Start as Vendor</Link>
            </div>
          </div>

          <div className="w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-white flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0">🏢</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800">Corporate Panel</h2>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Offices & Teams</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-indigo-500">✅</span> Smart Attendance (P, A, HD, H, L).</li>
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-indigo-500">✅</span> Auto Salary & Overtime Calculation.</li>
                <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><span className="text-indigo-500">✅</span> Generate PDF & WhatsApp Payslips.</li>
              </ul>
              <Link to="/register" className="text-center py-4 bg-white border-2 border-indigo-600 text-indigo-700 rounded-xl font-bold active:scale-95 transition-all">Start as Corporate</Link>
            </div>
          </div>
        </div>

        {/* 🚀 SEO CONTENT SECTION */}
        <article className="w-full bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 text-slate-700 mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-6">What is Daily Attendance & Salary Tracker?</h2>
          <p className="mb-6 leading-relaxed">
            The Daily Attendance & Salary Tracker is your ultimate <strong>Online Hisab Diary</strong>. Whether you are managing a small retail shop, handling a delivery fleet, or running a corporate office, this application replaces traditional pen-and-paper ledgers with a smart, automated, and secure digital platform.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">How to Use the Attendance Tracker</h3>
          <ol className="list-decimal pl-5 space-y-2 mb-6">
            <li><strong>Register:</strong> Create an account as a Vendor or Corporate employer.</li>
            <li><strong>Add Profiles:</strong> Add your employees, delivery staff, or daily wage workers with their joining dates and salary types.</li>
            <li><strong>Mark Attendance:</strong> Simply tap to mark daily presence or leave.</li>
            <li><strong>Auto Calculate:</strong> Let the system automatically calculate the monthly, daily, or hourly wages based on the attendance logs.</li>
          </ol>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Benefits for Small Businesses</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Zero paperwork and no missing records.</li>
            <li>Instant PDF payslip generation for transparency.</li>
            <li>Direct WhatsApp sharing functionality.</li>
            <li>Multi-currency support for global business operations.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Attendance Status Meaning</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>P (Present):</strong> Full day worked.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>A (Absent):</strong> Did not report to work.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>HD (Half Day):</strong> Worked for half shift.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><strong>H (Holiday):</strong> Paid company holiday.</div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-2"><strong>L (Leave):</strong> Approved leave of absence.</div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">How Salary is Calculated</h3>
          <p className="mb-6 leading-relaxed">
            Our powerful Salary Screen automatically calculates wages based on the profile type you select. For <strong>Monthly Salary</strong>, it uses a pro-rata basis. For <strong>Daily Wage</strong> and <strong>Hourly Rate</strong>, it multiplies the base rate by the exact days or hours logged. You can dynamically add Overtime, Bonuses, Advances, and Penalties to instantly get the final Net Salary.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Why Choose Our Online Hisab Diary?</h3>
          <p className="mb-8 leading-relaxed">
            We provide a 100% secure, fast, and mobile-optimized experience. With dedicated panels for both service vendors and corporate HRs, managing daily operations has never been this seamless.
          </p>

          <hr className="border-slate-200 mb-8" />

          <h3 className="text-2xl font-black text-slate-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800">Is this application free to use?</h4>
              <p className="text-sm mt-1 text-slate-600">Yes, the basic attendance and tracking features are free to use for small teams and individual vendors.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Can I share the salary slip on WhatsApp?</h4>
              <p className="text-sm mt-1 text-slate-600">Absolutely! You can instantly generate a PDF or send a formatted salary breakdown directly to your employee's WhatsApp.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Does it support offline mode?</h4>
              <p className="text-sm mt-1 text-slate-600">Currently, it requires an active internet connection to sync data securely to our cloud servers in real-time.</p>
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
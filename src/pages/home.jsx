import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-4xl text-center space-y-8">
          
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Smart Daily Management & <br className="hidden sm:block" />
            <span className="text-blue-600">Attendance Tracker</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Unorganized sector ki daily deliveries ho ya corporate teams ki attendance, 
            ab sab kuch ek single platform par manage karein. Fast, secure, aur bilkul aasaan.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center"
            >
              <span className="text-lg">🚀 Register as Vendor</span>
              <span className="text-xs font-normal text-blue-200 mt-1">Paperboy / Milkman Setup</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 border-2 border-slate-200 rounded-2xl font-semibold shadow-sm hover:border-indigo-600 hover:text-indigo-600 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center"
            >
              <span className="text-lg">🏢 Register as Corporate</span>
              <span className="text-xs font-normal text-slate-500 mt-1">HR / Org Head Setup</span>
            </Link>

          </div>
          
          <p className="text-sm text-slate-500 mt-8 font-medium">
            Join thousands of users managing their daily tasks effortlessly.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
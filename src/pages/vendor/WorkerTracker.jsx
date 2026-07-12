import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, addDoc, query, where } from "firebase/firestore";

export default function WorkerTracker() {
  // 1. Core States
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 2. Custom Toast / Popup State (Console warnings aur alerts ki jagah)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 3. Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 4. Modals State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState("");
  const [newJobRate, setNewJobRate] = useState("");

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [entryStatus, setEntryStatus] = useState("P");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryNote, setEntryNote] = useState("");

  // Helper function for Toast notifications
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- FIREBASE DATA FETCHING ---
  
  useEffect(() => {
    const fetchJobs = async () => {
      if (!auth.currentUser) return;
      try {
        const jobsRef = collection(db, "users", auth.currentUser.uid, "jobs");
        const snapshot = await getDocs(jobsRef);
        const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
        
        if (jobsList.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsList[0].id);
        }
      } catch (error) {
        showToast("Failed to load jobs", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [auth.currentUser?.uid]); // Safe dependency

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!auth.currentUser || !selectedJobId) return;
      
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      try {
        const attRef = collection(db, "users", auth.currentUser.uid, "jobs", selectedJobId, "attendance");
        const q = query(attRef, where("yearMonth", "==", yearMonth));
        const snapshot = await getDocs(q);
        
        const dataObj = {};
        snapshot.docs.forEach(doc => {
          dataObj[doc.id] = doc.data();
        });
        setAttendanceData(dataObj);
      } catch (error) {
        showToast("Failed to load attendance", "error");
      }
    };
    fetchAttendance();
  }, [selectedJobId, currentDate, auth.currentUser?.uid]);


  // --- ACTIONS ---

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newJobName || !newJobRate) return;
    try {
      const jobsRef = collection(db, "users", auth.currentUser.uid, "jobs");
      const docRef = await addDoc(jobsRef, {
        name: newJobName,
        defaultRate: Number(newJobRate),
        createdAt: new Date()
      });
      setJobs([...jobs, { id: docRef.id, name: newJobName, defaultRate: Number(newJobRate) }]);
      setSelectedJobId(docRef.id);
      setIsJobModalOpen(false);
      setNewJobName("");
      setNewJobRate("");
      showToast("New job added successfully!");
    } catch (error) {
      showToast("Error adding new job", "error");
    }
  };

  const openDateModal = (dateStr) => {
    if (!selectedJobId) {
      showToast("Please add and select a job first!", "error");
      return;
    }
    const existing = attendanceData[dateStr];
    const job = jobs.find(j => j.id === selectedJobId);
    
    setSelectedDateStr(dateStr);
    setEntryStatus(existing?.status || "P");
    setEntryAmount(existing?.amount ?? (job?.defaultRate || ""));
    setEntryNote(existing?.note || "");
    setIsDateModalOpen(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    const yearMonth = selectedDateStr.substring(0, 7); 
    
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "jobs", selectedJobId, "attendance", selectedDateStr);
      const payload = {
        date: selectedDateStr,
        yearMonth,
        status: entryStatus,
        amount: entryStatus === "A" ? 0 : Number(entryAmount),
        note: entryNote,
        timestamp: new Date()
      };
      
      await setDoc(docRef, payload, { merge: true });
      
      setAttendanceData(prev => ({
        ...prev,
        [selectedDateStr]: payload
      }));
      
      setIsDateModalOpen(false);
      showToast(`Entry saved for ${selectedDateStr}`);
    } catch (error) {
      showToast("Failed to save entry", "error");
    }
  };

  // --- CALENDAR LOGIC ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  let totalPresent = 0, totalAbsent = 0, totalHalf = 0, totalEarned = 0;
  Object.values(attendanceData).forEach(entry => {
    if (entry.status === 'P') totalPresent++;
    if (entry.status === 'A') totalAbsent++;
    if (entry.status === 'HD') totalHalf++;
    totalEarned += (entry.amount || 0);
  });

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500 animate-pulse">Loading your calendar...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10 relative">
      
      {/* 🚀 CUSTOM TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-bold text-sm shadow-2xl transition-all ${
          toast.type === "error" ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* 1. TOP HEADER & JOB SELECTOR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Worker Attendance Tracker</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Select your job and mark daily attendance.</p>
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          <select 
            className="flex-grow md:w-56 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.length === 0 && <option value="">No Jobs Added</option>}
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.name} (₹{job.defaultRate}/d)</option>
            ))}
          </select>
          <button 
            onClick={() => setIsJobModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all whitespace-nowrap shadow-md"
          >
            + Add Job
          </button>
        </div>
      </div>

      {/* 2. CALENDAR SECTION */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden mb-8">
        
        {/* Calendar Nav */}
        <div className="bg-slate-900 px-4 sm:px-6 py-5 flex justify-between items-center text-white">
          <button onClick={prevMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold tracking-widest text-xs sm:text-sm active:scale-95">◀ PREV</button>
          <h2 className="text-lg sm:text-xl font-black tracking-widest uppercase">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-bold tracking-widest text-xs sm:text-sm active:scale-95">NEXT ▶</button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-6 bg-slate-50">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center font-bold text-slate-400 uppercase text-[10px] sm:text-xs tracking-wider">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {/* Empty boxes for start day offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            
            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const data = attendanceData[dateStr];
              
              // Color Logic
              let bgClass = "bg-white border-slate-200 hover:border-slate-400 text-slate-700 shadow-sm";
              let statusText = "";
              
              if (data?.status === "P") { bgClass = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30"; statusText = "P"; }
              else if (data?.status === "A") { bgClass = "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/30"; statusText = "A"; }
              else if (data?.status === "HD") { bgClass = "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30"; statusText = "HD"; }
              else if (data?.status === "H") { bgClass = "bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-500/30"; statusText = "H"; }

              return (
                <div 
                  key={day} 
                  onClick={() => openDateModal(dateStr)}
                  className={`aspect-square rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${bgClass}`}
                >
                  <span className="text-base sm:text-xl font-black leading-none">{day}</span>
                  {statusText && <span className="text-[9px] sm:text-[10px] font-bold mt-1 bg-black/20 px-2 py-0.5 rounded-full">{statusText}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MONTHLY SUMMARY WIDGET */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Present</p>
          <p className="text-2xl font-black text-emerald-600">{totalPresent}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Absent</p>
          <p className="text-2xl font-black text-rose-600">{totalAbsent}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Half Day</p>
          <p className="text-2xl font-black text-amber-500">{totalHalf}</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-lg text-center flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-2xl font-black text-white">₹{totalEarned}</p>
        </div>
      </div>


      {/* --- MODALS --- */}

      {/* A. Date Entry Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Entry for {selectedDateStr}</h3>
              <button onClick={() => setIsDateModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>
            
            <form onSubmit={handleSaveAttendance} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Select Status</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['P', 'A', 'HD', 'H'].map(status => (
                    <button
                      key={status} type="button"
                      onClick={() => {
                        setEntryStatus(status);
                        if (status === 'A') setEntryAmount(0);
                      }}
                      className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                        entryStatus === status 
                          ? (status==='P'?'bg-emerald-50 border-emerald-500 text-emerald-700':status==='A'?'bg-rose-50 border-rose-500 text-rose-700':status==='HD'?'bg-amber-50 border-amber-500 text-amber-700':'bg-blue-50 border-blue-500 text-blue-700')
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                <input 
                  type="number" required
                  disabled={entryStatus === 'A'}
                  value={entryAmount} onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none disabled:opacity-50 transition-all"
                  placeholder="e.g. 400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Note / Remark (Optional)</label>
                <input 
                  type="text" 
                  value={entryNote} onChange={(e) => setEntryNote(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="e.g. Worked 2 hours extra"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Add Job Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800">Add New Job</h3>
              <button onClick={() => setIsJobModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-light">&times;</button>
            </div>
            
            <form onSubmit={handleAddJob} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Job Name</label>
                <input 
                  type="text" required
                  value={newJobName} onChange={(e) => setNewJobName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. Road Construction"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Daily Rate (₹)</label>
                <input 
                  type="number" required
                  value={newJobRate} onChange={(e) => setNewJobRate(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="e.g. 500"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function AttendanceTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Real Data States
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { empId: { status: 'P', overtime: 0 } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Status config with colors for premium UI
  const statusConfig = {
    P: { label: "Present", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200", active: "bg-green-500 text-white border-green-600 shadow-md shadow-green-500/30" },
    A: { label: "Absent", color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200", active: "bg-red-500 text-white border-red-600 shadow-md shadow-red-500/30" },
    HD: { label: "Half Day", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200", active: "bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/30" },
    H: { label: "Holiday", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200", active: "bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/30" },
    L: { label: "Leave", color: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200", active: "bg-slate-600 text-white border-slate-700 shadow-md shadow-slate-600/30" },
  };

  // 1. Fetch Staff & Existing Attendance for Selected Date
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      
      try {
        // A. Pehle saare staff ko Firebase se nikalenge
        const staffQuery = query(collection(db, "staff"), where("adminId", "==", auth.currentUser.uid));
        const staffSnapshot = await getDocs(staffQuery);
        const fetchedStaff = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStaffList(fetchedStaff);

        // B. Phir check karenge kya aaj (ya selected date) ki attendance pehle se mark hai?
        const attendanceRef = doc(db, "daily_attendance", `${auth.currentUser.uid}_${selectedDate}`);
        const attendanceSnap = await getDoc(attendanceRef);

        if (attendanceSnap.exists()) {
          // Agar pehle se save hai, toh purana data state me daal do
          setAttendanceData(attendanceSnap.data().records || {});
        } else {
          // Agar naya din hai, toh sabko default empty kardo
          const defaultData = {};
          fetchedStaff.forEach(emp => {
            defaultData[emp.id] = { status: null, overtime: 0 };
          });
          setAttendanceData(defaultData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]); // Jab bhi date badlegi, ye wapas chalega

  // Handle Status Change
  const handleStatusChange = (empId, newStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...prev[empId], status: newStatus }
    }));
  };

  // Handle Overtime Change
  const handleOvertimeChange = (empId, hours) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...prev[empId], overtime: hours }
    }));
  };

  // Mark All Present
  const markAllPresent = () => {
    const updatedData = {};
    staffList.forEach(emp => {
      updatedData[emp.id] = { ...attendanceData[emp.id], status: "P" };
    });
    setAttendanceData(updatedData);
  };

  // 2. Save Attendance to Firebase
  const handleSave = async () => {
    if (!auth.currentUser) return alert("Please login first!");
    setSaving(true);
    
    try {
      // Document ID adminId_date format me hogi (e.g., admin123_2026-07-06)
      const attendanceRef = doc(db, "daily_attendance", `${auth.currentUser.uid}_${selectedDate}`);
      
      await setDoc(attendanceRef, {
        adminId: auth.currentUser.uid,
        date: selectedDate,
        records: attendanceData,
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge: true se purana data nahi udega agar sirf update kar rahe hain

      alert(`Attendance for ${selectedDate} saved successfully!`);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading attendance records...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header & Date Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Mark daily presence, leaves, and overtime for your staff.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={markAllPresent}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              Mark All Present
            </button>

            <div className="relative w-full sm:w-auto">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/30 cursor-pointer shadow-lg shadow-slate-900/20"
              />
            </div>
          </div>
        </div>

        {/* 📋 Attendance List */}
        {staffList.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">You don't have any staff added yet.</p>
            <p className="text-sm text-slate-400 mt-2">Go to Manage Staff to add employees first.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {staffList.map((emp) => {
              // Current employee's attendance state fallback
              const empData = attendanceData[emp.id] || { status: null, overtime: 0 };

              return (
                <div key={emp.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    
                    {/* Employee Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-200/60 shrink-0">
                        {emp.roleIcon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{emp.name}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{emp.role}</span>
                      </div>
                    </div>

                    {/* Attendance Toggles & Overtime */}
                    <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                      
                      {/* Status Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(emp.id, key)}
                            className={`w-12 h-10 sm:w-14 sm:h-11 rounded-xl font-black text-sm sm:text-base border transition-all duration-200 active:scale-90 flex items-center justify-center
                              ${empData.status === key ? config.active : config.color}
                            `}
                            title={config.label}
                          >
                            {key}
                          </button>
                        ))}
                      </div>

                      {/* Overtime Input */}
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-xs font-bold text-slate-600">Overtime (Hrs)</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOvertimeChange(emp.id, Math.max(0, empData.overtime - 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90"
                          >-</button>
                          <span className="font-bold text-slate-800 w-4 text-center">{empData.overtime}</span>
                          <button 
                            onClick={() => handleOvertimeChange(emp.id, empData.overtime + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90"
                          >+</button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Save Button */}
        {staffList.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 px-4 z-20 flex justify-center md:pl-64 transition-all">
            <div className="w-full max-w-5xl">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                )}
                {saving ? "Saving Data..." : `Save Attendance for ${selectedDate}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
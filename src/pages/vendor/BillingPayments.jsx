import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";

export default function BillingPayments() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Stats
  const [advance, setAdvance] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // 1. Fetch Jobs
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
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [auth.currentUser]);

  // 2. Fetch Attendance History & Monthly Stats
  useEffect(() => {
    const fetchMonthData = async () => {
      if (!auth.currentUser || !selectedJobId) return;
      
      try {
        // Fetch Attendance
        const attRef = collection(db, "users", auth.currentUser.uid, "jobs", selectedJobId, "attendance");
        const q = query(attRef, where("yearMonth", "==", yearMonth));
        const snapshot = await getDocs(q);
        
        const list = snapshot.docs.map(doc => doc.data());
        // Sort by date (latest first)
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceList(list);

        // Fetch Monthly Advance/Bonus
        const statsRef = doc(db, "users", auth.currentUser.uid, "jobs", selectedJobId, "monthlyStats", yearMonth);
        // Using getDocs doesn't work for a single doc directly, we use alternative if doc exists, but for simplicity we fetch it
        // Note: In real firebase use getDoc, but standard way:
        const { getDoc } = await import("firebase/firestore");
        const statSnap = await getDoc(statsRef);
        if (statSnap.exists()) {
          setAdvance(statSnap.data().advance || 0);
          setBonus(statSnap.data().bonus || 0);
        } else {
          setAdvance(0);
          setBonus(0);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchMonthData();
  }, [selectedJobId, currentDate, auth.currentUser]);

  // 3. Save Advance/Bonus to DB when user changes them
  const handleStatChange = async (type, value) => {
    const numValue = Number(value);
    if (type === 'advance') setAdvance(numValue);
    if (type === 'bonus') setBonus(numValue);

    if (!auth.currentUser || !selectedJobId) return;
    try {
      const statsRef = doc(db, "users", auth.currentUser.uid, "jobs", selectedJobId, "monthlyStats", yearMonth);
      await setDoc(statsRef, {
        advance: type === 'advance' ? numValue : advance,
        bonus: type === 'bonus' ? numValue : bonus
      }, { merge: true });
    } catch (error) {
      console.error("Error saving stats:", error);
    }
  };

  // 4. Calculations
  const totalEarned = attendanceList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netPayable = totalEarned - advance + bonus;

  // 5. WhatsApp Share
  const handleWhatsAppShare = () => {
    const jobName = jobs.find(j => j.id === selectedJobId)?.name || "Job";
    
    let pCount = 0, aCount = 0, hdCount = 0;
    attendanceList.forEach(entry => {
      if(entry.status === 'P') pCount++;
      if(entry.status === 'A') aCount++;
      if(entry.status === 'HD') hdCount++;
    });

    const text = `📋 *Mera Hisaab / Bill*
*Kaam:* ${jobName}
*Mahina:* ${displayMonth}
------------------------
✅ Present: ${pCount} din
🟠 Half Day: ${hdCount} din
🔴 Absent: ${aCount} din

💰 *Total Kamayi:* ₹${totalEarned}
🎁 *Bonus:* ₹${bonus}
↗️ *Advance Liya:* ₹${advance}
------------------------
🏁 *Bacha Hua Lena Hai (Net Due):* ₹${netPayable}

_Sent via Personal Earning Tracker_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500">Loading your Hisaab...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Payments & Hisaab</h1>
          <p className="text-sm text-slate-500 font-medium">Generate your monthly bill and track history.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="px-3 py-1 font-bold text-slate-500 hover:text-slate-800">&lt;</button>
            <span className="px-4 font-black text-slate-700 whitespace-nowrap">{displayMonth}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="px-3 py-1 font-bold text-slate-500 hover:text-slate-800">&gt;</button>
          </div>

          <select 
            className="w-full sm:w-48 bg-slate-50 border border-slate-300 text-slate-700 rounded-xl px-4 py-2 font-bold outline-none"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.length === 0 && <option value="">No Jobs Added</option>}
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BILLING SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-2xl font-black text-slate-800">₹{totalEarned}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Advance Taken (-)</p>
          <div className="flex items-center mt-1">
            <span className="text-lg font-bold text-slate-400 mr-1">₹</span>
            <input 
              type="number" min="0"
              value={advance || ""}
              onChange={(e) => handleStatChange('advance', e.target.value)}
              className="w-full text-xl font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bonus (+)</p>
          <div className="flex items-center mt-1">
            <span className="text-lg font-bold text-slate-400 mr-1">₹</span>
            <input 
              type="number" min="0"
              value={bonus || ""}
              onChange={(e) => handleStatChange('bonus', e.target.value)}
              className="w-full text-xl font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Net Payable</p>
          <p className="text-3xl font-black text-white">₹{netPayable}</p>
        </div>
      </div>

      {/* WHATSAPP ACTION */}
      <button 
        onClick={handleWhatsAppShare}
        className="w-full mb-8 flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 active:scale-95 transition-all"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Share Hisaab on WhatsApp
      </button>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Daily Entry History</h3>
        </div>
        
        {attendanceList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No entries found for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((entry, idx) => {
                  let statusColor = "bg-slate-100 text-slate-600";
                  let statusLabel = "N/A";
                  if(entry.status === 'P') { statusColor = "bg-green-100 text-green-700"; statusLabel = "Present"; }
                  if(entry.status === 'A') { statusColor = "bg-red-100 text-red-700"; statusLabel = "Absent"; }
                  if(entry.status === 'HD') { statusColor = "bg-orange-100 text-orange-700"; statusLabel = "Half Day"; }
                  if(entry.status === 'H') { statusColor = "bg-blue-100 text-blue-700"; statusLabel = "Holiday"; }

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{entry.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-700">₹{entry.amount || 0}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{entry.note || "-"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
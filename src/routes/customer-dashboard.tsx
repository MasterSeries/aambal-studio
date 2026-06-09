import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot,
  deleteDoc, doc, updateDoc, getDocs 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import hero from "@/assets/hero-festival.jpg"; 

export const Route = createFileRoute("/customer-dashboard")({
  component: CustomerDashboard,
});

// ── Light Glassmorphism Aesthetic Tokens ─────────────────────────────────────
const G = {
  glass: "rgba(255, 255, 255, 0.45)",
  glassStrong: "rgba(255, 255, 255, 0.7)",
  border: "rgba(255, 255, 255, 0.8)",
  darkPanel: "#111111",
  textMain: "#1a1a1c",
  textMuted: "rgba(26, 26, 28, 0.6)",
  textLight: "#ffffff",
  accent: "#111111",
};

// ── Icons ───────────────────────────────────────────────────────────────────
// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Camera: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  FileText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  QrCode: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
};

// ── Shared UI Components ──────────────────────────────────────────────────────
function GlassPanel({ children, className = "", style = {} }: any) {
  return (
    <div className={`rounded-[32px] overflow-hidden ${className}`} style={{ background: G.glass, border: `1px solid ${G.border}`, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 50px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.4)", ...style }}>
      {children}
    </div>
  );
}

const CircularProgress = ({ value, label, sublabel }: any) => {
  const radius = 35; 
  const circumference = 2 * Math.PI * radius; 
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[90px] h-[90px]">
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
          <circle cx="45" cy="45" r={radius} fill="none" stroke={G.accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-in-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{label}</p>
        {sublabel && <p className="text-[9px] text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [homestayBookings, setHomestayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [viewQrBooking, setViewQrBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlots, setNewSlots] = useState("");

  // ── FIREBASE FETCH LOGIC ──
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      
      setUserName(user.displayName || "Guest");
      const emailToSearch = user.email || "";
      setUserEmail(emailToSearch);

      if (!emailToSearch) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Photography Bookings
        const qPhotos1 = query(collection(db, "bookings"), where("clientEmail", "==", emailToSearch));
        const qPhotos2 = query(collection(db, "bookings"), where("email", "==", emailToSearch));
        
        // Fetch Homestay Bookings
        const qHomestay = query(collection(db, "homestayBookings"), where("email", "==", emailToSearch));

        const [snapP1, snapP2, snapH] = await Promise.all([
          getDocs(qPhotos1),
          getDocs(qPhotos2),
          getDocs(qHomestay)
        ]);

        const allPhotos: any[] = [];
        const seenIds = new Set();
        
        // Merge Photo Bookings Safely
        [...snapP1.docs, ...snapP2.docs].forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            allPhotos.push({ id: doc.id, type: "photo", ...doc.data() });
          }
        });

        // Merge Homestay Bookings
        const allHomestays: any[] = [];
        snapH.docs.forEach(doc => {
          allHomestays.push({ id: doc.id, type: "homestay", ...doc.data() });
        });

        // Sort Photo Bookings by Date
        allPhotos.sort((a,b) => {
          const timeA = a.createdTimestamp?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdTimestamp?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setBookings(allPhotos);
        setHomestayBookings(allHomestays);
        setLoading(false);

      } catch (err) {
        console.error("Query Setup Error:", err);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try { await deleteDoc(doc(db, "bookings", id)); setBookings(bookings.filter(b => b.id !== id)); }
    catch (err) { console.error(err); alert("Cancellation failed"); }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/customer-login";
  }

  function openReschedule(booking: any) {
    setRescheduleBooking(booking);
    setNewDate(booking.date || "");
    setNewSlots(booking.timeSlots?.join(", ") || booking.time || "");
  }

  async function submitReschedule() {
    try {
      await updateDoc(doc(db, "bookings", rescheduleBooking.id), {
        date: newDate,
        timeSlots: newSlots.split(",").map(s => s.trim()),
        status: "reschedule_requested",
      });
      alert("Reschedule requested successfully.");
      setRescheduleBooking(null);
    } catch (err) { console.error(err); alert("Failed to reschedule"); }
  }

  function downloadInvoice(booking: any) {
    const pdf = new jsPDF();
    pdf.setFillColor(17, 17, 17);
    pdf.rect(0, 0, 210, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDIO HUT", 20, 26);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    pdf.text("DIGITAL BOOKING INVOICE", 20, 34);
    
    pdf.setTextColor(0, 0, 0);
    const rows = [
      ["Reference ID", booking.referenceId || booking.reference || "N/A"],
      ["Primary Guest", booking.clientName || booking.name],
      ["Partner / Plus One", booking.partnerName || "—"],
      ["Contact Email", booking.clientEmail || booking.email],
      ["Contact Phone", booking.clientPhone || booking.phone],
      ["Package", booking.packageName || booking.package || "Festival Package"],
      ["Date", booking.date],
      ["Timeline", booking.timeSlots?.join(", ") || booking.time],
      ["Status", (booking.status || "Pending").toUpperCase()],
    ];

    rows.forEach(([k, v], i) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(k, 20, 60 + i * 10);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(v ?? "—"), 80, 60 + i * 10);
    });

    pdf.save(`${booking.clientName || booking.name}-invoice.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Combine items for the Timeline / Calendar View
  const timelineItems = [...bookings, ...homestayBookings]
    .filter(item => item.date || item.checkIn)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.checkIn).getTime();
      const dateB = new Date(b.date || b.checkIn).getTime();
      return dateA - dateB;
    });

  const activeBookings = bookings.filter(b => b.status === "approved" || b.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending" || !b.status || b.status === "reschedule_requested");

  // Format the current month for the calendar widget
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const prevMonthName = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'short' });
  const nextMonthName = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'short' });

  // Map timeline items to days of the week for the calendar view
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const eventsByDay: Record<string, any[]> = { "Mon": [], "Tue": [], "Wed": [], "Thu": [], "Fri": [], "Sat": [], "Sun": [] };
  
  timelineItems.forEach(item => {
    const d = new Date(item.date || item.checkIn);
    // getDay() is 0 (Sun) to 6 (Sat). We want 0 to be Mon, 6 to be Sun.
    let dayIdx = d.getDay() - 1;
    if (dayIdx === -1) dayIdx = 6;
    if (eventsByDay[daysOfWeek[dayIdx]]) {
      eventsByDay[daysOfWeek[dayIdx]].push(item);
    }
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body { background: #eef2f6; color: ${G.textMain}; font-family: 'Outfit', sans-serif; margin: 0; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* ── BACKGROUND LAYER ── */}
      <div className="fixed inset-0 z-[-1]">
        <img src={hero} alt="bg" className="w-full h-full object-cover blur-[90px] brightness-125 saturate-150 scale-110" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20" />
      </div>

      <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto relative z-10 flex gap-6">
        
        {/* ── LEFT DARK NAVIGATION BAR ── */}
        <aside className="hidden lg:flex w-20 bg-[#111111] rounded-[32px] flex-col items-center py-6 shadow-2xl flex-shrink-0 z-20">
           <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-12 shadow-inner">
             <Icons.Grid />
           </div>
           
           <div className="flex flex-col gap-8 text-white/40">
             <button className="text-white bg-white/10 p-3 rounded-2xl"><Icons.Calendar /></button>
             <button className="hover:text-white transition-colors p-3"><Icons.Image /></button>
             <button className="hover:text-white transition-colors p-3"><Icons.FileText /></button>
           </div>

           <button onClick={handleLogout} className="mt-auto text-orange-400 hover:text-orange-300 transition-colors p-3 bg-white/5 rounded-full">
             <Icons.LogOut />
           </button>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900">
              Dashboard
            </h1>
            <div className="lg:hidden">
              <button onClick={handleLogout} className="bg-black/5 hover:bg-black/10 text-black px-6 py-2.5 rounded-full font-semibold text-sm transition-all border border-black/10 flex items-center gap-2">
                <Icons.LogOut /> Logout
              </button>
            </div>
          </div>

          {/* ── MAIN BENTO GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: Profile & Progress (Left) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* User Profile Card */}
              <GlassPanel className="p-8 flex flex-col h-full bg-white/30 relative">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <Icons.User />
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Passholder Profile</p>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight truncate">{userName}</h2>
                <p className="text-sm font-medium text-gray-500 truncate">{userEmail}</p>
                
                <div className="mt-auto pt-8">
                  <a href="/customer-gallery" className="w-full bg-black text-white py-3.5 rounded-2xl flex items-center justify-center font-bold text-sm hover:scale-[1.02] transition-transform">
                    Access Gallery
                  </a>
                </div>
              </GlassPanel>

              {/* Quick Stats */}
              <GlassPanel className="p-6 flex justify-around items-center bg-white/40">
                <CircularProgress value={Math.round((activeBookings.length / (bookings.length || 1)) * 100)} label="Approved" sublabel="Ready to go" />
                <div className="w-px h-16 bg-black/10" />
                <CircularProgress value={Math.round((pendingBookings.length / (bookings.length || 1)) * 100)} label="Pending" sublabel="Under review" />
              </GlassPanel>

            </div>

            {/* COLUMN 2: Calendar & Schedule View (Center) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <GlassPanel className="p-8 flex-1 bg-white/50 flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Your Itinerary</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Schedules & Stays</p>
                  </div>
                  <div className="text-4xl font-light text-gray-900">{timelineItems.length}<span className="text-lg text-gray-400 font-medium ml-1">events</span></div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {timelineItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                      No scheduled events yet.
                    </div>
                  ) : (
                    timelineItems.map((item, idx) => {
                      const isHomestay = item.type === "homestay";
                      const itemDate = isHomestay ? item.checkIn : item.date;
                      const displayDate = itemDate?.includes("-") ? new Date(itemDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : itemDate;
                      
                      return (
                        <div key={idx} className="flex gap-4 group">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-black shadow-[0_0_0_4px_rgba(0,0,0,0.1)] relative z-10" />
                            {idx !== timelineItems.length - 1 && <div className="w-0.5 h-full bg-black/10 mt-1" />}
                          </div>
                          
                          {/* Event Content Pill */}
                          <div className="flex-1 pb-6">
                            <p className="text-xs font-bold text-gray-500 mb-2">{displayDate}</p>
                            <div className="bg-black text-white rounded-3xl p-5 flex justify-between items-center shadow-lg group-hover:scale-[1.01] transition-transform">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                  {isHomestay ? <Icons.Home /> : <Icons.Clock />}
                                </div>
                                <div>
                                  <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-0.5">
                                    {isHomestay ? 'Homestay' : 'Photography'}
                                  </p>
                                  <p className="font-bold text-lg">
                                    {isHomestay ? `${item.rooms} Room(s)` : (item.time || item.timeSlots?.join(", ") || "TBD")}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right hidden sm:block">
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                  {item.status || "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </GlassPanel>
            </div>

            {/* COLUMN 3: Analytics & Pass Management (Right) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              <GlassPanel className="p-6 bg-white/40">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account Analytics</h3>
                <div className="flex gap-3">
                  <div className="flex-1 bg-black text-white rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold">{bookings.length}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold mt-1">Total</span>
                  </div>
                  <div className="flex-1 bg-black text-white rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold">{activeBookings.length}</span>
                    <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold mt-1">Active</span>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 flex-1 bg-white/60 overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pass Management</h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-10">No passes available.</p>
                  ) : (
                    bookings.map((b) => {
                      const isAppr = b.status === "approved" || b.status === "completed";
                      return (
                        <div key={b.id} className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-sm text-gray-900 truncate">{b.packageName || b.package}</p>
                            <span className={`w-2 h-2 rounded-full ${isAppr ? 'bg-green-500' : 'bg-orange-400'}`} />
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium mb-3 truncate">{b.date}</p>
                          
                          <div className="flex gap-2">
                            <button onClick={() => setViewQrBooking(b)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-xl text-xs font-bold transition-colors">
                              View QR
                            </button>
                            <button onClick={() => downloadInvoice(b)} className="w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-colors">
                              <Icons.FileText />
                            </button>
                          </div>
                          {!isAppr && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => openReschedule(b)} className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-colors">Reschedule</button>
                              <button onClick={() => cancelBooking(b.id)} className="flex-1 border border-red-100 text-red-500 hover:bg-red-50 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-colors">Cancel</button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </GlassPanel>

            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* DIGITAL PASS QR MODAL */}
      <AnimatePresence>
        {viewQrBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[40px] w-full max-w-md p-8 relative shadow-2xl">
              
              <button onClick={() => setViewQrBooking(null)} className="absolute top-6 right-6 w-8 h-8 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-black/50 transition-colors">✕</button>

              <div className="text-center mt-4">
                <div className="inline-block px-3 py-1 bg-black/5 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 border border-black/10">
                  Digital Access Pass
                </div>
                <h2 className="text-gray-900 font-bold text-2xl mb-1 leading-tight">{viewQrBooking.packageName || viewQrBooking.package || "Premium Session"}</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Ref: {viewQrBooking.referenceId || viewQrBooking.reference || "N/A"}</p>
                
                <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-xl border border-gray-100">
                  <img 
                    src={viewQrBooking.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/verify-booking?ref=' + (viewQrBooking.referenceId || viewQrBooking.reference))}`} 
                    alt="QR Code" 
                    className={`w-48 h-48 ${viewQrBooking.status === 'approved' || viewQrBooking.status === 'completed' ? '' : 'blur-sm opacity-30'}`} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                   <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                     <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Primary</p>
                     <p className="text-gray-900 text-sm font-bold truncate">{viewQrBooking.clientName || viewQrBooking.name}</p>
                   </div>
                   <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                     <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-1">Partner</p>
                     <p className="text-gray-900 text-sm font-bold truncate">{viewQrBooking.partnerName || "—"}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESCHEDULE MODAL */}
      <AnimatePresence>
        {rescheduleBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 pb-0 sm:pb-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white/95 backdrop-blur-3xl border border-white/50 rounded-[40px] w-full max-w-md p-8 shadow-2xl">
              <h2 className="text-gray-900 font-bold text-2xl mb-2">Reschedule Session</h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">Choose a new date and time for your booking.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-2">New Date</label>
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-black/5 border border-black/10 text-gray-900 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-2">New Time Slot</label>
                  <input type="text" placeholder="e.g. 08:30 AM" value={newSlots} onChange={(e) => setNewSlots(e.target.value)} className="w-full bg-black/5 border border-black/10 text-gray-900 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-black transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button onClick={() => setRescheduleBooking(null)} className="bg-gray-200 text-gray-900 font-bold py-4 rounded-2xl hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={submitReschedule} className="bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors shadow-lg">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
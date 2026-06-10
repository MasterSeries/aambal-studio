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
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
          <circle cx="45" cy="45" r={radius} fill="none" stroke="#111111" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-in-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{label}</p>
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
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [daySchedules, setDaySchedules] = useState<any[]>([]);
  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
const openDaySchedule = (date: Date) => {
  const schedules = timelineItems.filter((item) => {
    const itemDate = new Date(item.date || item.checkIn);

    return (
      itemDate.getFullYear() === date.getFullYear() &&
      itemDate.getMonth() === date.getMonth() &&
      itemDate.getDate() === date.getDate()
    );
  });

  setSelectedDate(date);
  setDaySchedules(schedules);
};
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
        const qPhotos1 = query(collection(db, "bookings"), where("clientEmail", "==", emailToSearch));
        const qPhotos2 = query(collection(db, "bookings"), where("email", "==", emailToSearch));
        const qHomestay = query(collection(db, "homestayBookings"), where("email", "==", emailToSearch));

        const [snapP1, snapP2, snapH] = await Promise.all([
          getDocs(qPhotos1),
          getDocs(qPhotos2),
          getDocs(qHomestay)
        ]);

        const allPhotos: any[] = [];
        const seenIds = new Set();
        
        [...snapP1.docs, ...snapP2.docs].forEach(doc => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            allPhotos.push({ id: doc.id, type: "photo", ...doc.data() });
          }
        });

        const allHomestays: any[] = [];
        snapH.docs.forEach(doc => {
          allHomestays.push({ id: doc.id, type: "homestay", ...doc.data() });
        });

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

  const timelineItems = [...bookings, ...homestayBookings]
    .filter(item => item.date || item.checkIn)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.checkIn).getTime();
      const dateB = new Date(b.date || b.checkIn).getTime();
      return dateA - dateB;
    });

  const activeBookings = bookings.filter(b => b.status === "approved" || b.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending" || !b.status || b.status === "reschedule_requested");

  // ── CALENDAR LOGIC ──
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));

  const monthName = calendarDate.toLocaleString('default', { month: 'long' });
  const year = calendarDate.getFullYear();
  const daysInMonth = new Date(year, calendarDate.getMonth() + 1, 0).getDate();
  let firstDayOfMonth = new Date(year, calendarDate.getMonth(), 1).getDay() - 1; 
  if (firstDayOfMonth === -1) firstDayOfMonth = 6; // Adjust so Monday is 0, Sunday is 6

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @font-face {
          font-family: 'DormyCustom';
          src: url('https://fonts.gstatic.com/s/syne/v18/8vIX7w4MziK8_y-aOwc.woff2') format('woff2');
        }
        body { background: #fdfcfb; color: ${G.textMain}; font-family: 'Outfit', sans-serif; margin: 0; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* ── BRIGHT AIRY BACKGROUND LAYER ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img src={hero} alt="bg" className="w-full h-full object-cover blur-[100px] brightness-150 saturate-100 scale-110 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40" />
      </div>

      <div className="min-h-screen flex p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto relative z-10 gap-6">
        
        {/* ── LEFT DARK NAVIGATION BAR ── */}
        <aside
  className="hidden lg:flex flex-col items-center justify-between
  w-[95px] h-[calc(100vh-64px)]
  bg-[#f4f4f5]
  rounded-[48px]
  py-8
  shadow-sm
  border border-[#ececec]
  flex-shrink-0"
>
  {/* TOP */}
  <div className="flex flex-col items-center">
    {/* Logo */}
    <div
      className="w-16 h-16 rounded-[20px]
      bg-[#5c8d5e]
      flex items-center justify-center
      text-2xl mb-14"
    >
      🪷
    </div>

    {/* Navigation */}
    <div className="flex flex-col gap-12">
      
      {/* Active Item */}
      <button className="relative flex items-center justify-center">
        <span className="absolute -left-5 w-[4px] h-10 rounded-full bg-black"></span>

        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-[#111827]"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Location */}
      <button className="text-[#777b87] hover:text-black transition">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </button>

      {/* Calendar */}
      <button className="text-[#777b87] hover:text-black transition">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Settings */}
      <button className="text-[#777b87] hover:text-black transition">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
        </svg>
      </button>
    </div>
  </div>

  {/* BOTTOM */}
  <div className="flex flex-col items-center gap-10">
    
    {/* Bell */}
    <div className="relative text-[#777b87]">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <span
        className="absolute top-0 right-0
        w-3 h-3 rounded-full bg-red-500"
      />
    </div>

    {/* Profile */}
    <div
      className="w-16 h-16 rounded-full
      bg-[#e9e9eb]
      flex items-center justify-center
      text-2xl font-bold text-[#111827]"
    >
      {userName?.charAt(0)?.toUpperCase() || "G"}
    </div>
  </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-10">
            
            {/* COLUMN 1: Profile & Progress (Left) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* User Profile Card */}
              <GlassPanel className="p-8 flex flex-col h-full bg-white/40 border-white/60 shadow-sm relative overflow-hidden min-h-[400px]">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl relative z-10">
                  <Icons.User />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Passholder Profile</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight truncate">{userName}</h2>
                  <p className="text-sm font-medium text-gray-500 truncate mt-1">{userEmail}</p>
                </div>
                
                <div className="mt-auto pt-8 relative z-10">
                  <a href="/customer-gallery" className="w-full bg-white/60 border border-white/80 text-black py-3.5 rounded-2xl flex items-center justify-center font-bold text-sm hover:bg-white transition-colors shadow-sm">
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

            {/* COLUMN 2: Contained Monthly Calendar (Center) */}
            <div className="lg:col-span-6 flex flex-col">
              <GlassPanel className="p-6 sm:p-8 bg-white/50 border-white/60 shadow-sm flex flex-col">
                
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900">{monthName} {year}</h3>
                     <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Your Schedule & Itinerary</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors border border-black/5 shadow-sm text-gray-900 font-bold">{'<'}</button>
                      <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors border border-black/5 shadow-sm text-gray-900 font-bold">{'>'}</button>
                   </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {daysOfWeek.map(d => (
                     <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                {/* Main Calendar Grid - Fixed height cells to prevent layout stretching loops */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Empty offset cells */}
                  {blanks.map(b => <div key={`blank-${b}`} className="h-[80px] sm:h-[100px] bg-transparent" />)}
                  
                  {/* Actual Day Cells */}
                  {days.map(day => {
                    const cellDate = new Date(year, calendarDate.getMonth(), day);
                    const isToday = new Date().toDateString() === cellDate.toDateString();
                    
                    // Filter events for this specific day
                    const dayEvents = timelineItems.filter(item => {
                      if (!item.date && !item.checkIn) return false;
                      const itemDate = new Date(item.date || item.checkIn);
                      return itemDate.getFullYear() === cellDate.getFullYear() &&
                             itemDate.getMonth() === cellDate.getMonth() &&
                             itemDate.getDate() === cellDate.getDate();
                    });

                    return (
                      <div
 key={day}
 onClick={() => openDaySchedule(cellDate)}
 className="
 h-[80px]
 sm:h-[100px]
 bg-white/40
 border
 rounded-xl
 sm:rounded-2xl
 p-2
 cursor-pointer
 hover:scale-[1.03]
 hover:shadow-lg
 transition-all
 duration-300
 "
>
                        
                        <span className={`text-[10px] sm:text-xs font-bold mb-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shrink-0 ${isToday ? 'bg-black text-white shadow-md' : 'text-gray-500'}`}>
                          {day}
                        </span>
                        
                        {/* Events inside the day */}
                        <div
  className="
  flex
  flex-col
  gap-1
  mt-1
  h-[48px]
  overflow-hidden
  "
>
                          {dayEvents.slice(0, 2).map((ev, i) => {
                            {dayEvents.length > 2 && (
  <div
    className="
      text-[8px]
      font-bold
      text-gray-500
      bg-gray-100
      rounded-md
      px-2
      py-1
      text-center
    "
  >
    +{dayEvents.length - 2} more
  </div>
)}
                            const isHome = ev.type === 'homestay';
                            return (
                              <div key={i} className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-1 rounded-md truncate shadow-sm ${isHome ? 'bg-[#ffb38a]/20 text-orange-700 border border-orange-200/50' : 'bg-black text-white'}`} title={ev.packageName || ev.package || "Booking"}>
                                 {isHome ? '🏡 ' : '📸 '} {ev.time || ev.timeSlots?.[0] || 'TBD'}
                              </div>
                            )
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>

            {/* COLUMN 3: Analytics & Pass Management (Right) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Dark Analytics Card */}
              <GlassPanel className="p-6 bg-white/40 border-white/60 shadow-sm">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Account Analytics</h3>
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#0a0a0c] text-white rounded-[24px] p-5 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold">{bookings.length}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Total</span>
                  </div>
                  <div className="flex-1 bg-[#0a0a0c] text-white rounded-[24px] p-5 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold">{activeBookings.length}</span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-1">Active</span>
                  </div>
                </div>
              </GlassPanel>

              {/* Pass Management List */}
              <GlassPanel
  className="
  p-5
  bg-white/60
  border-white/60
  shadow-sm
  overflow-hidden
  flex flex-col
  h-[420px]
  max-h-[420px]
  "
>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Pass Management</h3>
                
                <div
  className="
  flex-1
  overflow-y-auto
  pr-2
  space-y-3
  scrollbar-thin
  "
>
                  {bookings.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center mt-10">No passes available.</p>
                  ) : (
                    bookings.map((b) => {
                      const isAppr = b.status === "approved" || b.status === "completed";
                      return (
                        <div key={b.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm text-gray-900 truncate pr-2">{b.packageName || b.package}</p>
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isAppr ? 'bg-green-500' : 'bg-orange-400'}`} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mb-4 truncate">{b.date?.includes("-") ? b.date : b.date}</p>
                          
                          <div className="flex gap-2">
                            <button onClick={() => setViewQrBooking(b)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-3 rounded-2xl text-xs font-bold transition-colors border border-gray-100 flex justify-center items-center gap-1.5">
                              <Icons.QrCode /> View Pass
                            </button>
                            <button onClick={() => downloadInvoice(b)} className="w-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl transition-colors border border-gray-100">
                              <Icons.FileText />
                            </button>
                          </div>
                          {!isAppr && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => openReschedule(b)} className="flex-1 bg-white text-gray-600 border border-gray-100 py-2 rounded-2xl text-[9px] font-bold uppercase transition-colors">Reschedule</button>
                              <button onClick={() => cancelBooking(b.id)} className="flex-1 bg-white text-red-500 hover:bg-red-50 border border-red-50 py-2 rounded-2xl text-[9px] font-bold uppercase transition-colors">Cancel</button>
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

<AnimatePresence>
  {selectedDate && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
      fixed inset-0
      z-[100]
      bg-black/40
      backdrop-blur-md
      flex items-center justify-center
      p-6
      "
    >
      <motion.div
        initial={{ scale: .9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: .9, y: 20 }}
        className="
        w-full
        max-w-xl
        bg-white
        rounded-[32px]
        p-8
        shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedDate.toLocaleDateString()}
            </h2>

            <p className="text-gray-500 text-sm">
              Schedule for selected day
            </p>
          </div>

          <button
            onClick={() => setSelectedDate(null)}
            className="w-10 h-10 rounded-full bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Content */}

        {daySchedules.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">📅</div>

            <h3 className="text-xl font-bold">
              No Schedule Found
            </h3>

            <p className="text-gray-500 mt-2">
              There are no bookings on this date.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto">
            {daySchedules.map((schedule, index) => (
              <div
                key={index}
                className="
                bg-gray-50
                border
                rounded-2xl
                p-5
                "
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    {schedule.packageName ||
                      schedule.package ||
                      "Booking"}
                  </h3>

                  <span className="text-green-600 text-sm font-semibold">
                    {schedule.status || "Pending"}
                  </span>
                </div>

                <p className="text-gray-500 mt-2">
                  {schedule.timeSlots?.join(", ") ||
                    schedule.time ||
                    "Time TBD"}
                </p>

                <p className="text-sm mt-2">
                  {schedule.clientName ||
                    schedule.name ||
                    "Guest"}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  </>
  );
}
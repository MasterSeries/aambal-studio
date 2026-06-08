import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import RealtimeNotification from "@/components/RealtimeNotification";
import { GalleryUpload } from "@/components/GalleryUpload";
import { RealCalendar } from "@/components/BookingComponents";
import {
  collection, onSnapshot, query, orderBy, updateDoc, doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Area, AreaChart,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hero from "@/assets/hero-festival.jpg"; 

export const Route = createFileRoute("/admin")({ component: AdminPage });

// ── Light Glassmorphism Tokens (Matching Bento Reference) ───────────────────
const G = {
  glassBg: "rgba(255, 255, 255, 0.45)",
  glassBgStrong: "rgba(255, 255, 255, 0.65)",
  glassBorder: "rgba(255, 255, 255, 0.8)",
  darkBg: "rgba(40, 40, 42, 0.85)",
  darkBorder: "rgba(60, 60, 65, 0.5)",
  textMain: "#1a1a1c",
  textMuted: "rgba(26, 26, 28, 0.5)",
  textLight: "#ffffff",
  textLightMuted: "rgba(255, 255, 255, 0.6)",
  accentBlack: "#111111",
  accentGrey: "#e5e5e5",
  success: "#10b981",
  danger: "#ef4444",
  info: "#3b82f6",
  warning: "#f59e0b",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending:     { bg: "rgba(245,158,11,.15)",  text: "#d97706", dot: "#f59e0b" },
  approved:    { bg: "rgba(16,185,129,.15)",  text: "#047857", dot: "#10b981" },
  completed:   { bg: "rgba(59,130,246,.15)",  text: "#1d4ed8", dot: "#3b82f6" },
  rejected:    { bg: "rgba(239,68,68,.15)",   text: "#b91c1c", dot: "#ef4444" },
  rescheduled: { bg: "rgba(14,165,233,.15)",  text: "#0369a1", dot: "#0ea5e9" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "4px 10px", borderRadius: 100,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function GlassPanel({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; }) {
  return (
    <div style={{
      background: G.glassBg, border: `1px solid ${G.glassBorder}`,
      borderRadius: 32, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
      boxShadow: "0 24px 50px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.4)",
      ...style,
    }} className={className}>
      {children}
    </div>
  );
}

function DarkPanel({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; }) {
  return (
    <div style={{
      background: G.darkBg, border: `1px solid ${G.darkBorder}`,
      borderRadius: 24, backdropFilter: "blur(20px)",
      color: G.textLight, ...style,
    }} className={className}>
      {children}
    </div>
  );
}

const LightTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", border: `1px solid rgba(0,0,0,0.05)`, borderRadius: 16, padding: "12px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
      <p style={{ color: G.textMuted, fontSize: 11, marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <p style={{ color: G.textMain, fontWeight: 700, fontSize: 16 }}>{payload[0].value}</p>
    </div>
  );
};

const CircularProgress = ({ value, label, sublabel }: { value: number, label: string, sublabel?: string }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="8" />
          <circle cx="45" cy="45" r={radius} fill="none" stroke={G.accentBlack} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: G.textMain }}>{value}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: G.textMain }}>{label}</p>
        {sublabel && <p style={{ fontSize: 9, color: G.textMuted, marginTop: 2 }}>{sublabel}</p>}
      </div>
    </div>
  );
};


// ── Main Page ─────────────────────────────────────────────────────────────────
function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [photographerInputs, setPhotographerInputs] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSection, setActiveSection] = useState<"bookings" | "calendar" | "gallery">("bookings");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { window.location.href = "/login"; return; }
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const unsubBookings = onSnapshot(q, (snap) => {
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return () => unsubBookings();
    });
    return () => unsub();
  }, []);

  async function updateStatus(id: string, status: string) {
    try { await updateDoc(doc(db, "bookings", id), { status }); }
    catch (err) { console.error(err); alert("Update failed"); }
  }

  async function assignPhotographer(id: string) {
    const photographer = photographerInputs[id];
    if (!photographer) { alert("Enter photographer name"); return; }
    try {
      await updateDoc(doc(db, "bookings", id), { photographer });
      alert("Photographer assigned");
    } catch (err) { console.error(err); alert("Assignment failed"); }
  }

  function openReschedule(booking: any) {
    setSelectedBooking(booking);
    setNewDate(booking.date || "");
    setNewSlot(booking.timeSlots?.[0] || booking.time || "");
  }

  async function saveReschedule() {
    if (!selectedBooking) return;
    try {
      await updateDoc(doc(db, "bookings", selectedBooking.id), {
        date: newDate, timeSlots: [newSlot], status: "rescheduled", updatedAt: new Date(),
      });
      alert("Booking rescheduled");
      setSelectedBooking(null);
    } catch (err) { console.error(err); alert("Reschedule failed"); }
  }

  function generateInvoice(booking: any) {
    const pdf = new jsPDF();
    pdf.setFillColor(17, 17, 17); 
    pdf.rect(0, 0, 210, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDIO HUT", 20, 20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    pdf.text("OFFICIAL BOOKING INVOICE", 20, 28);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CLIENT DETAILS", 20, 55);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Name: ${booking.name}`, 20, 65);
    pdf.text(`Email: ${booking.email}`, 20, 72);
    pdf.text(`Phone: ${booking.phone}`, 20, 79);

    autoTable(pdf, {
      startY: 95,
      theme: 'grid',
      headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: 50, fontSize: 10, cellPadding: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      head: [["Service Detail", "Information"]],
      body: [
        ["Selected Package", booking.package || "Custom Session"],
        ["Scheduled Date", booking.date || "TBD"],
        ["Reserved Time Slot", booking.timeSlots?.join(", ") || booking.time || "TBD"],
        ["Booking Status", (booking.status || "Pending").toUpperCase()],
        ["Assigned Photographer", booking.photographer || "Pending Assignment"]
      ]
    });
    pdf.save(`StudioHut_Invoice_${booking.name.replace(/\s+/g, '_')}.pdf`);
  }

  function downloadAnalyticsPDF() {
    const pdf = new jsPDF();
    pdf.setFillColor(17, 17, 17); 
    pdf.rect(0, 0, 210, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDIO HUT", 20, 22);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    pdf.text("OPERATIONAL ANALYTICS & DASHBOARD REPORT", 20, 30);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 130, 22);

    autoTable(pdf, {
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: 50, halign: 'center', fontSize: 11, cellPadding: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      head: [["Metric", "Current Value"]],
      body: [
        ["Total Bookings", totalBookings.toString()], 
        ["Pending Actions", pendingCount.toString()],
        ["Approved & Scheduled", approvedCount.toString()], 
        ["Completed Shoots", completedCount.toString()],
        ["Today's Activity", todayCount.toString()], 
        ["Estimated Revenue", `Rs. ${estimatedRevenue}`],
      ],
    });
    pdf.save("StudioHut_Analytics_Report.pdf");
  }

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const approvedCount = bookings.filter(b => b.status === "approved").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const rejectedCount = bookings.filter(b => b.status === "rejected").length;
  const todayCount = bookings.filter(b => b.date === new Date().toDateString()).length;
  const estimatedRevenue = approvedCount * 5000;

  const chartData = [
    { name: "Pending", value: pendingCount },
    { name: "Approved", value: approvedCount },
    { name: "Completed", value: completedCount },
    { name: "Rejected", value: rejectedCount },
  ];

  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" ? true : b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#fdfdfd", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid rgba(0,0,0,0.05)`, borderTop: `3px solid #000`, animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { 
          background: #eef2f6; 
          color: ${G.textMain}; 
          font-family: 'Outfit', sans-serif; 
          overflow-x: hidden;
          margin: 0;
        }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        input, select { outline: none; font-family: 'Outfit', sans-serif; }
        button { font-family: 'Outfit', sans-serif; cursor: pointer; border: none; }
        
        .floating-nav {
          position: fixed; z-index: 100; background: ${G.darkBg}; backdrop-filter: blur(20px);
          border: 1px solid ${G.darkBorder}; border-radius: 100px; display: flex;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .nav-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%; transition: 0.2s; }
        .nav-icon:hover { background: rgba(255,255,255,0.1); }
        .nav-icon.active { background: white; color: black; }

        .glass-btn { background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.8); color: ${G.textMain}; border-radius: 100px; padding: 10px 20px; font-weight: 600; font-size: 13px; transition: 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .glass-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
        .dark-btn { background: ${G.accentBlack}; color: white; border-radius: 100px; padding: 10px 20px; font-weight: 600; font-size: 13px; transition: 0.2s; }
        .dark-btn:hover { opacity: 0.85; }
        
        .bento-grid {
          display: grid; grid-template-columns: 320px 1fr 340px; gap: 24px;
          height: calc(100vh - 200px); min-height: 700px;
        }
        @media (max-width: 1200px) { .bento-grid { grid-template-columns: 1fr; height: auto; } }

        /* Chart Customization */
        .recharts-cartesian-axis-tick-value { fill: ${G.textMuted}; font-weight: 500; }
        .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: rgba(0,0,0,0.04); }

        /* ── CALENDAR OVERRIDES FOR HIGH-END UI ── */
        .react-calendar { 
          width: 100% !important; border: none !important; background: transparent !important; 
          font-family: 'Outfit', sans-serif !important; color: #1a1a1c;
        }
        .react-calendar__navigation { margin-bottom: 1rem; }
        .react-calendar__navigation button {
          color: #1a1a1c; min-width: 44px; background: none; font-size: 16px; margin-top: 8px; font-weight: 600; border-radius: 12px; transition: 0.2s;
        }
        .react-calendar__navigation button:enabled:hover { background: rgba(0,0,0,0.05); }
        .react-calendar__month-view__weekdays { text-transform: uppercase; font-weight: 700; font-size: 10px; color: rgba(26,26,28,0.4); padding: 12px 0; }
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .react-calendar__month-view__days__day {
          padding: 14px !important; font-weight: 500; font-size: 14px; border-radius: 16px; transition: 0.2s; border: 2px solid transparent !important;
        }
        .react-calendar__month-view__days__day:hover { background: rgba(0,0,0,0.04); transform: scale(0.95); }
        .react-calendar__tile--active { background: #111111 !important; color: white !important; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border-radius: 16px; transform: scale(1.05); }
        .react-calendar__tile--now { background: rgba(0,0,0,0.05) !important; color: #111 !important; border-radius: 16px; font-weight: 700; }
      `}</style>

      {/* ── BACKGROUND LAYER ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1 }}>
        {/* Using the hero image heavily blurred and brightened to create the glassmorphism environment */}
        <img src={hero} alt="bg" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(90px) brightness(1.4) saturate(1.2)", transform: "scale(1.1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)" }} />
      </div>

      <RealtimeNotification />

      {/* ── FLOATING NAVIGATION (LEFT) ── */}
      <div className="floating-nav" style={{ left: 24, top: "50%", transform: "translateY(-50%)", flexDirection: "column", padding: 8, gap: 8 }}>
        <button className={`nav-icon ${activeSection === 'bookings' ? 'active' : ''}`} onClick={() => setActiveSection("bookings")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button className={`nav-icon ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => setActiveSection("calendar")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </button>
        <button className={`nav-icon ${activeSection === 'gallery' ? 'active' : ''}`} onClick={() => setActiveSection("gallery")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
        <button className="nav-icon" onClick={downloadAnalyticsPDF} title="Download Analytics PDF">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
      </div>

      {/* ── FLOATING NAVIGATION (BOTTOM - ALL BUTTONS) ── */}
      <div className="floating-nav" style={{ bottom: 32, left: "50%", transform: "translateX(-50%)", padding: "6px 6px", alignItems: "center", maxWidth: "90vw", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 4, whiteSpace: "nowrap" }}>
          <Link to="/shoot-manager"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>🎬 Shoots</button></Link>
          <Link to="/media-manager"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>🖼 Media</button></Link>
          <Link to="/package-editor"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>💎 Packages</button></Link>
          <Link to="/homestay-editor"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>🏡 Homestay</button></Link>
          <Link to="/admin-enquiries"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>📩 Enquiries</button></Link>
          <Link to="/hero-editor"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>✨ Hero Editor</button></Link>
          <Link to="/enquiry-editor"><button style={{ background: "transparent", color: "white", padding: "10px 20px", fontSize: 13, borderRadius: 100, fontWeight: 500 }}>✏️ Page Editor</button></Link>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ padding: "3rem 6rem 8rem 6rem", maxWidth: 1800, margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Top Header Text */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "5rem", fontWeight: 300, color: G.textMain, letterSpacing: "-0.02em", margin: 0 }}>
            Dashboard
          </h1>
        </div>

        {/* ── BENTO GRID CONTAINER ── */}
        <GlassPanel className="bento-grid" style={{ padding: "24px" }}>
          
          {/* ── COLUMN 1 (Left) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Dark Profile / System Status Card */}
            <DarkPanel style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)", borderRadius: "50%" }}></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Studio Hut Ops</h3>
              <p style={{ fontSize: 11, color: G.textLightMuted }}>Welcome back, Rayaan</p>
              
              <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                 <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #444, #111)", border: "1px solid #555", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}>
                    <span style={{ fontSize: 32 }}>📸</span>
                 </div>
                 <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: G.textLightMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Revenue</p>
                    <p style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>₹{(estimatedRevenue/1000).toFixed(0)}k</p>
                 </div>
              </div>
            </DarkPanel>

            {/* Line Chart Card (Orders over time) */}
            <GlassPanel style={{ padding: 24, flex: 1.2, background: "rgba(255,255,255,0.3)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Booking Volume</h3>
              <p style={{ fontSize: 11, color: G.textMuted, marginBottom: 20 }}>Frequency by status</p>
              <div style={{ height: 160, width: "100%", marginLeft: -15 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <Tooltip content={<LightTooltip />} />
                    <Line type="monotone" dataKey="value" stroke={G.accentBlack} strokeWidth={3} dot={{ r: 4, fill: G.accentBlack }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>
          </div>

          {/* ── COLUMN 2 (Center) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Top Bar Chart (Weekly/Status Activity) */}
            <GlassPanel style={{ padding: 24, height: 180, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Active Workload</h3>
                  <p style={{ fontSize: 11, color: G.textMuted }}>Bookings & processing</p>
                </div>
                <div style={{ fontSize: 32, fontWeight: 300, lineHeight: 1 }}>{pendingCount + approvedCount}<span style={{ fontSize: 16, color: G.textMuted }}> tasks</span></div>
              </div>
              <div style={{ flex: 1, width: "100%" }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} barSize={12}>
                    <Tooltip content={<LightTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]} fill={G.accentBlack} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            {/* Central Dynamic Content Area (Bookings / Calendar / Gallery) */}
            <GlassPanel style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.7)" }}>
               <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(0,0,0,0.05)` }}>
                 <h3 style={{ fontSize: 18, fontWeight: 600, textTransform: "capitalize" }}>{activeSection}</h3>
                 
                 {/* Quick Search/Filter for Bookings */}
                 {activeSection === "bookings" && (
                   <div style={{ display: "flex", gap: 8 }}>
                     <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                        style={{ background: "rgba(255,255,255,0.5)", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12, width: 140 }} />
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.5)", border: "none", borderRadius: 100, padding: "6px 14px", fontSize: 12 }}>
                        {["all","pending","approved","completed","rejected","rescheduled"].map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                 )}
               </div>

               <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                 <AnimatePresence mode="wait">
                    
                    {/* BOOKINGS LIST (Bento Card Style) */}
                    {activeSection === "bookings" && (
                      <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {filteredBookings.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "40px 20px", color: G.textMuted }}>No bookings found.</div>
                        ) : (
                          filteredBookings.map((booking) => {
                            const isExpanded = expandedId === booking.id;
                            return (
                              <div key={booking.id} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.8)", overflow: "hidden", transition: "0.2s", boxShadow: isExpanded ? "0 10px 20px rgba(0,0,0,0.03)" : "none" }}>
                                <div onClick={() => setExpandedId(isExpanded ? null : booking.id)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{booking.date || "No Date"}</span>
                                    <span style={{ width: 1, height: 12, background: "rgba(0,0,0,0.1)" }}></span>
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{booking.name}</span>
                                  </div>
                                  <StatusPill status={booking.status || "pending"} />
                                </div>

                                {isExpanded && (
                                  <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 12 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                                      <div><p style={{ fontSize: 10, color: G.textMuted }}>Package</p><p style={{ fontSize: 13, fontWeight: 500 }}>{booking.package}</p></div>
                                      <div><p style={{ fontSize: 10, color: G.textMuted }}>Contact</p><p style={{ fontSize: 13, fontWeight: 500 }}>{booking.phone}</p></div>
                                      <div><p style={{ fontSize: 10, color: G.textMuted }}>Time</p><p style={{ fontSize: 13, fontWeight: 500 }}>{booking.timeSlots?.join(", ") || booking.time}</p></div>
                                      
                                      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                                        <div style={{ flex: 1 }}>
                                          <p style={{ fontSize: 10, color: G.textMuted }}>Photographer</p>
                                          <input value={photographerInputs[booking.id] || ""} onChange={e => setPhotographerInputs({ ...photographerInputs, [booking.id]: e.target.value })} placeholder={booking.photographer || "Assign..."} style={{ width: "100%", background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 12 }} />
                                        </div>
                                        <button onClick={() => assignPhotographer(booking.id)} className="dark-btn" style={{ padding: "4px 10px", fontSize: 11 }}>Save</button>
                                      </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                      <button onClick={() => updateStatus(booking.id, "approved")} className="glass-btn" style={{ borderColor: G.success, color: G.success }}>Approve</button>
                                      <button onClick={() => updateStatus(booking.id, "completed")} className="glass-btn" style={{ borderColor: G.info, color: G.info }}>Complete</button>
                                      <button onClick={() => updateStatus(booking.id, "rejected")} className="glass-btn" style={{ borderColor: G.danger, color: G.danger }}>Reject</button>
                                      <button onClick={() => openReschedule(booking)} className="glass-btn">Reschedule</button>
                                      <button onClick={() => generateInvoice(booking)} className="dark-btn" style={{ marginLeft: "auto" }}>Invoice</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </motion.div>
                    )}

                    {/* CALENDAR */}
                    {activeSection === "calendar" && (
                      <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: "100%", minHeight: 400 }}>
                        <RealCalendar />
                      </motion.div>
                    )}

                    {/* GALLERY */}
                    {activeSection === "gallery" && (
                      <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GalleryUpload />
                      </motion.div>
                    )}
                 </AnimatePresence>
               </div>
            </GlassPanel>

          </div>

          {/* ── COLUMN 3 (Right) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Top Right Circles */}
            <GlassPanel style={{ padding: "24px", display: "flex", justifyContent: "space-around", alignItems: "center", background: "rgba(255,255,255,0.4)" }}>
              <CircularProgress value={Math.round((completedCount / (totalBookings || 1)) * 100)} label="Completed" sublabel="Tasks Done" />
              <div style={{ width: 1, height: 60, background: "rgba(0,0,0,0.05)" }}></div>
              <CircularProgress value={Math.round((pendingCount / (totalBookings || 1)) * 100)} label="Pending" sublabel="In Pipeline" />
            </GlassPanel>

            {/* Quick Stats Black Pills */}
            <GlassPanel style={{ padding: 24, background: "rgba(255,255,255,0.35)" }}>
               <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Operational Analytics</h3>
               <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                 {[
                   { val: totalBookings, label: "Total" },
                   { val: todayCount, label: "Today" },
                   { val: approvedCount, label: "Active" }
                 ].map(stat => (
                   <div key={stat.label} style={{ background: G.accentBlack, color: "white", borderRadius: 100, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", flex: 1, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                     <span style={{ fontSize: 18, fontWeight: 600 }}>{stat.val}</span>
                     <span style={{ fontSize: 9, opacity: 0.6, marginTop: 4, textTransform: "uppercase" }}>{stat.label}</span>
                   </div>
                 ))}
               </div>
            </GlassPanel>

            {/* Project Settings / Status Breakdown */}
            <DarkPanel style={{ padding: 24, flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Pipeline Status</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Pending Review", value: pendingCount, col: G.warning },
                  { label: "Approved & Scheduled", value: approvedCount, col: G.success },
                  { label: "Completed Deliveries", value: completedCount, col: G.info },
                ].map(s => {
                  const pct = Math.round((s.value / (totalBookings || 1)) * 100);
                  return (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: G.textLightMuted, marginBottom: 6 }}>
                        <span>{s.label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: s.col, borderRadius: 4 }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Area chart placeholder in dark panel */}
               <div style={{ marginTop: "auto", paddingTop: 20 }}>
                 <p style={{ fontSize: 11, color: G.textLightMuted, marginBottom: 8 }}>Weekly Spread</p>
                 <div style={{ height: 60 }}>
                   <ResponsiveContainer>
                    <AreaChart data={chartData}>
                      <Area type="monotone" dataKey="value" stroke={G.textLight} strokeWidth={2} fill="rgba(255,255,255,0.1)" />
                    </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </DarkPanel>
          </div>
        </GlassPanel>

      </div>

      {/* ══════════════ RESCHEDULE MODAL (Glass Styled) ══════════════ */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(40px)", border: `1px solid rgba(255,255,255,0.5)`, borderRadius: 32, padding: "32px", boxShadow: `0 30px 60px rgba(0,0,0,0.12)` }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: G.textMain, margin: 0 }}>Reschedule</h2>
                <button onClick={() => setSelectedBooking(null)}
                  style={{ background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: G.textMuted, marginBottom: "1.5rem" }}>
                Updating slot for <strong style={{ color: G.textMain }}>{selectedBooking.name}</strong>
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "New Date", value: newDate, onChange: setNewDate, placeholder: "e.g. 15 August 2026" },
                  { label: "New Time Slot", value: newSlot, onChange: setNewSlot, placeholder: "e.g. 6:00 PM – 7:00 PM" },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: G.textMain, marginBottom: 6 }}>{label}</p>
                    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                      style={{ width: "100%", background: "rgba(255,255,255,0.5)", border: `1px solid rgba(0,0,0,0.1)`, borderRadius: 16, padding: "14px 16px", fontSize: 14, color: G.textMain }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <button onClick={() => setSelectedBooking(null)} className="glass-btn" style={{ flex: 1, padding: "14px", border: "none", background: "rgba(0,0,0,0.05)" }}>Cancel</button>
                  <button onClick={saveReschedule} className="dark-btn" style={{ flex: 1.5, padding: "14px" }}>Confirm Update</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
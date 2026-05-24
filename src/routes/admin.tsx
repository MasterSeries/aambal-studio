import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import RealtimeNotification from "@/components/RealtimeNotification";
import { Link } from "@tanstack/react-router";
import { GalleryUpload } from "@/components/GalleryUpload";
import { RealCalendar } from "@/components/RealCalendar";
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

export const Route = createFileRoute("/admin")({ component: AdminPage });

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  gold: "#c8a84a",
  goldLight: "#e8c97a",
  goldDim: "rgba(200,168,74,0.15)",
  ink: "#060910",
  ink2: "#0b0f1a",
  ink3: "#111827",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(200,168,74,0.2)",
  text: "#f0ede6",
  muted: "rgba(240,237,230,0.4)",
  green: "#34d399",
  red: "#f87171",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  amber: "#fbbf24",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending:     { bg: "rgba(251,191,36,.1)",  text: "#fbbf24", dot: "#fbbf24" },
  approved:    { bg: "rgba(52,211,153,.1)",  text: "#34d399", dot: "#34d399" },
  completed:   { bg: "rgba(96,165,250,.1)",  text: "#60a5fa", dot: "#60a5fa" },
  rejected:    { bg: "rgba(248,113,113,.1)", text: "#f87171", dot: "#f87171" },
  rescheduled: { bg: "rgba(34,211,238,.1)",  text: "#22d3ee", dot: "#22d3ee" },
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "4px 12px", borderRadius: 100,
      border: `1px solid ${c.dot}30`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function GlassCard({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 20, backdropFilter: "blur(20px)", ...style,
    }} className={className}>
      {children}
    </div>
  );
}
<a
  href="/media-manager"
  className="rounded-2xl bg-pink-500 px-5 py-3 font-bold text-white"
>
  Media Manager
</a>
function StatCard({ label, value, accent, icon, delay = 0 }: {
  label: string; value: any; accent?: string; icon: string; delay?: number;
}) {
  const col = accent ?? T.gold;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: `linear-gradient(140deg, ${col}10 0%, ${T.ink2} 100%)`,
        border: `1px solid ${col}25`, borderRadius: 20,
        padding: "1.5rem 1.75rem", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${col}18, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 600, color: col, lineHeight: 1 }}>{value}</div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.ink3, border: `1px solid ${T.borderGold}`, borderRadius: 12, padding: "10px 16px", fontFamily: "Raleway, sans-serif" }}>
      <p style={{ color: T.muted, fontSize: 11, marginBottom: 4 }}>{label}</p>
      <p style={{ color: T.gold, fontWeight: 700 }}>{payload[0].value}</p>
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
    const docPdf = new jsPDF();
    docPdf.setFontSize(28); docPdf.text("Booking Invoice", 20, 20);
    docPdf.setFontSize(14);
    [
      [`Name: ${booking.name}`, 50], [`Email: ${booking.email}`, 65],
      [`Phone: ${booking.phone}`, 80], [`Date: ${booking.date}`, 95],
      [`Slots: ${booking.timeSlots?.join(", ") || booking.time}`, 110],
      [`Package: ${booking.package}`, 125], [`Status: ${booking.status}`, 140],
    ].forEach(([t, y]) => docPdf.text(t as string, 20, y as number));
    docPdf.save(`${booking.name}-invoice.pdf`);
  }

  function downloadAnalyticsPDF() {
    const pdf = new jsPDF();
    pdf.setFontSize(28); pdf.text("Analytics Report", 20, 25);
    autoTable(pdf, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: [
        ["Total Bookings", totalBookings], ["Pending", pendingCount],
        ["Approved", approvedCount], ["Completed", completedCount],
        ["Today's Bookings", todayCount], ["Revenue", `₹${estimatedRevenue}`],
      ],
    });
    pdf.save("analytics-report.pdf");
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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: T.ink, flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes spinGold{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${T.goldDim}`, borderTop: `2px solid ${T.gold}`, animation: "spinGold 1s linear infinite" }} />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: T.muted, letterSpacing: "0.2em" }}>Loading dashboard…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;500;600&family=Cinzel:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: ${T.ink}; color: ${T.text}; font-family: 'Raleway', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.ink}; } ::-webkit-scrollbar-thumb { background: ${T.gold}40; border-radius: 4px; }
        input, select { outline: none; font-family: 'Raleway', sans-serif; color: ${T.text}; }
        input::placeholder { color: ${T.muted}; }
        button { font-family: 'Raleway', sans-serif; cursor: pointer; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes pulseGlow { 0%,100%{opacity:.5}50%{opacity:1} }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(200,168,74,0.08); }
        .action-btn { display: flex; align-items: center; justify-content: center; gap: 7px; border: none; border-radius: 12px; padding: 11px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: opacity 0.15s, transform 0.15s; width: 100%; }
        .action-btn:hover { opacity: 0.88; transform: scale(0.98); }
        .tab-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; border: none; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
      `}</style>

      {/* ── PAGE SHELL ── */}
      <div style={{ minHeight: "100vh", background: T.ink, position: "relative" }}>

        {/* grain texture */}
        <div style={{ position: "fixed", inset: 0, opacity: 0.025, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "180px", pointerEvents: "none", zIndex: 0 }} />

        {/* ambient glow */}
        <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${T.gold}07 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
          <RealtimeNotification />

          {/* ══════════════ HEADER ══════════════ */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: "3rem" }}>

            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: T.gold, marginBottom: 8, opacity: 0.8 }}>Aambal Vasantham Studio</p>
              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 500, color: T.text, margin: 0, lineHeight: 1.1 }}>
                Admin Dashboard
              </h1>
              <p style={{ marginTop: 6, color: T.muted, fontSize: "0.85rem" }}>Booking management & analytics</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { label: "Analytics PDF", icon: "⬇", onClick: downloadAnalyticsPDF, color: T.gold },
                { label: "Manage Shoots", icon: "🎬", to: "/shoot-manager", color: "#a78bfa" },
                { label: "Shoot Details", icon: "📋", to: "/shoot-details", color: T.cyan },
              ].map((btn) =>
                btn.to ? (
                  <Link key={btn.label} to={btn.to}>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, background: `${btn.color}15`, border: `1px solid ${btn.color}30`, color: btn.color, borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s" }}>
                      <span>{btn.icon}</span> {btn.label}
                    </button>
                  </Link>
                ) : (
                  <button key={btn.label} onClick={btn.onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: `${btn.color}15`, border: `1px solid ${btn.color}30`, color: btn.color, borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s" }}>
                    <span>{btn.icon}</span> {btn.label}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* ══════════════ STAT CARDS ══════════════ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            <StatCard label="Total" value={totalBookings}  icon="📁" accent={T.gold}  delay={0} />
            <StatCard label="Pending" value={pendingCount}   icon="⏳" accent={T.amber} delay={0.08} />
            <StatCard label="Approved" value={approvedCount} icon="✓"  accent={T.green} delay={0.12} />
            <StatCard label="Completed" value={completedCount} icon="🎞" accent={T.blue}  delay={0.16} />
            <StatCard label="Today" value={todayCount}       icon="📅" accent={T.cyan}  delay={0.2} />
            <StatCard label="Revenue" value={`₹${(estimatedRevenue/1000).toFixed(0)}k`} icon="₹" accent={T.goldLight} delay={0.24} />
          </div>

          {/* ══════════════ CHARTS ══════════════ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>

            <GlassCard style={{ padding: "1.75rem" }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: "1.5rem" }}>Booking Trend</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.gold} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke={T.muted} tick={{ fontSize: 11, fontFamily: "Raleway" }} />
                    <YAxis stroke={T.muted} tick={{ fontSize: 11, fontFamily: "Raleway" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={T.gold} strokeWidth={2.5} fill="url(#goldGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: "1.75rem" }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: "1.5rem" }}>Status Overview</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke={T.muted} tick={{ fontSize: 11, fontFamily: "Raleway" }} />
                    <YAxis stroke={T.muted} tick={{ fontSize: 11, fontFamily: "Raleway" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}
                      fill="url(#barGrad)"
                    />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.gold} />
                        <stop offset="100%" stopColor="#8a6a20" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* ══════════════ SECTION TABS ══════════════ */}
          <div style={{ display: "flex", gap: 8, marginBottom: "2rem", padding: "6px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, width: "fit-content" }}>
            {(["bookings", "calendar", "gallery"] as const).map(tab => (
              <button key={tab} className="tab-btn"
                onClick={() => setActiveSection(tab)}
                style={{
                  background: activeSection === tab ? `${T.gold}18` : "transparent",
                  border: activeSection === tab ? `1px solid ${T.gold}35` : "1px solid transparent",
                  color: activeSection === tab ? T.gold : T.muted,
                }}>
                {tab === "bookings" ? "📋" : tab === "calendar" ? "📅" : "🖼"}{" "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══════════════ BOOKINGS TAB ══════════════ */}
            {activeSection === "bookings" && (
              <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

                {/* Search + filter bar */}
                <GlassCard style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14 }}>🔍</span>
                      <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px 10px 38px", fontSize: 13, color: T.text, transition: "border-color 0.2s" }}
                      />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                      style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: T.text, minWidth: 140 }}>
                      {["all","pending","approved","completed","rejected","rescheduled"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                      ))}
                    </select>
                    <div style={{ background: `${T.gold}18`, border: `1px solid ${T.gold}30`, borderRadius: 12, padding: "10px 18px", fontSize: 12, color: T.gold, fontWeight: 600, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                      {filteredBookings.length} {filteredBookings.length === 1 ? "result" : "results"}
                    </div>
                  </div>
                </GlassCard>

                {filteredBookings.length === 0 && (
                  <GlassCard style={{ padding: "4rem", textAlign: "center" }}>
                    <p style={{ fontSize: "2rem", marginBottom: 12 }}>🔎</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: T.muted }}>No bookings found</p>
                    <p style={{ fontSize: "0.85rem", color: T.muted, opacity: 0.6, marginTop: 6 }}>Try adjusting your search or filter</p>
                  </GlassCard>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {filteredBookings.map((booking, idx) => {
                    const isExpanded = expandedId === booking.id;
                    return (
                      <motion.div key={booking.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                        className="hover-lift"
                        style={{
                          background: `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
                          border: `1px solid ${isExpanded ? T.gold + "35" : T.border}`,
                          borderRadius: 20, overflow: "hidden",
                          transition: "border-color 0.25s",
                        }}
                      >
                        {/* ── Card header row ── */}
                        <div
                          style={{ padding: "1.25rem 1.5rem", cursor: "pointer", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 }}
                          onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                        >
                          {/* avatar */}
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${T.gold}18`, border: `1.5px solid ${T.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: T.gold, flexShrink: 0 }}>
                            {(booking.name || "?")[0].toUpperCase()}
                          </div>

                          <div style={{ flex: 1, minWidth: 160 }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", color: T.text, fontWeight: 600, margin: 0 }}>{booking.name}</p>
                            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{booking.email}</p>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            <StatusPill status={booking.status || "pending"} />
                            <span style={{ fontSize: 11, color: T.muted, background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 8, letterSpacing: "0.05em" }}>
                              {booking.date}
                            </span>
                            {booking.package && (
                              <span style={{ fontSize: 11, color: T.goldLight, background: `${T.gold}10`, border: `1px solid ${T.gold}20`, padding: "4px 10px", borderRadius: 8 }}>
                                {booking.package}
                              </span>
                            )}
                          </div>

                          <div style={{ color: T.muted, fontSize: 16, transition: "transform 0.25s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>⌄</div>
                        </div>

                        {/* ── Expanded content ── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{ borderTop: `1px solid ${T.border}`, padding: "1.5rem" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", flexWrap: "wrap" }}>

                                  {/* ── Info grid ── */}
                                  <div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                                      {[
                                        { label: "Phone", value: booking.phone },
                                        { label: "Time Slots", value: booking.timeSlots?.join(", ") || booking.time },
                                        { label: "Package", value: booking.package },
                                        { label: "Photographer", value: booking.photographer || "Unassigned" },
                                      ].map(({ label, value }) => (
                                        <div key={label} style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
                                          <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: T.muted, marginBottom: 5 }}>{label}</p>
                                          <p style={{ fontSize: 14, color: T.text, fontWeight: 500, wordBreak: "break-all" }}>{value || "—"}</p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Photographer assign */}
                                    <div style={{ display: "flex", gap: 8 }}>
                                      <input
                                        placeholder="Assign photographer…"
                                        value={photographerInputs[booking.id] || ""}
                                        onChange={e => setPhotographerInputs({ ...photographerInputs, [booking.id]: e.target.value })}
                                        style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: T.text }}
                                      />
                                      <button onClick={() => assignPhotographer(booking.id)}
                                        style={{ background: `#a78bfa20`, border: "1px solid #a78bfa30", color: "#a78bfa", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer" }}>
                                        Assign
                                      </button>
                                    </div>
                                  </div>

                                  {/* ── Action buttons ── */}
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", width: 240, alignContent: "start" }}>
                                    {[
                                      { label: "Approve",    fn: () => updateStatus(booking.id, "approved"),    bg: "#22c55e", col: "#fff" },
                                      { label: "Reject",     fn: () => updateStatus(booking.id, "rejected"),    bg: "#ef4444", col: "#fff" },
                                      { label: "Complete",   fn: () => updateStatus(booking.id, "completed"),   bg: "#3b82f6", col: "#fff" },
                                      { label: "Reschedule", fn: () => openReschedule(booking),                 bg: T.cyan,    col: T.ink },
                                      { label: "Invoice",    fn: () => generateInvoice(booking),                bg: T.gold,    col: T.ink },
                                    ].map(a => (
                                      <button key={a.label} onClick={a.fn} className="action-btn"
                                        style={{ background: `${a.bg}18`, border: `1px solid ${a.bg}35`, color: a.col === T.ink ? a.bg : "#fff", gridColumn: a.label === "Invoice" ? "span 2" : undefined }}>
                                        {a.label}
                                      </button>
                                    ))}
                                  </div>

                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════ CALENDAR TAB ══════════════ */}
            {activeSection === "calendar" && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <GlassCard style={{ padding: "1.75rem" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: "1.5rem" }}>Booking Calendar</p>
                  <div style={{ height: 640, overflow: "hidden", borderRadius: 16, background: "#fff" }}>
                    <RealCalendar />
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ══════════════ GALLERY TAB ══════════════ */}
            {activeSection === "gallery" && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <GlassCard style={{ padding: "1.75rem" }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.25em", color: T.gold, textTransform: "uppercase", marginBottom: "1.5rem" }}>Gallery Upload</p>
                  <GalleryUpload />
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════ RESCHEDULE MODAL ══════════════ */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 440, background: T.ink3, border: `1px solid ${T.gold}30`, borderRadius: 24, padding: "2rem", boxShadow: `0 0 60px ${T.gold}12, 0 40px 80px rgba(0,0,0,0.7)` }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.2rem", color: T.goldLight, margin: 0 }}>Reschedule Booking</h2>
                <button onClick={() => setSelectedBooking(null)}
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: "1.5rem" }}>
                Rescheduling for <strong style={{ color: T.text }}>{selectedBooking.name}</strong>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "New Date", value: newDate, onChange: setNewDate, placeholder: "e.g. 15 August 2026" },
                  { label: "New Time Slot", value: newSlot, onChange: setNewSlot, placeholder: "e.g. 6:00 PM – 7:00 PM" },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>{label}</p>
                    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                      style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "11px 14px", fontSize: 13, color: T.text }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={saveReschedule}
                    style={{ flex: 1, background: `${T.gold}20`, border: `1px solid ${T.gold}40`, color: T.gold, borderRadius: 12, padding: "12px", fontWeight: 600, letterSpacing: "0.08em", fontSize: 13, cursor: "pointer" }}>
                    Save Changes
                  </button>
                  <button onClick={() => setSelectedBooking(null)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 12, padding: "12px", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot,
  deleteDoc, doc, updateDoc, getDocs 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/customer-dashboard")({
  component: CustomerDashboard,
});

// ── Tokens ────────────────────────────────────────────────────────────────────
const G = {
  green: "#4a9460", greenLight: "#6db87a", greenPale: "#a8e6b0",
  gold: "#c8a84a", goldLight: "#e8c97a",
  ink: "#040d08", ink2: "#071009", ink3: "#0d1f10",
  text: "#f0ede6", muted: "rgba(240,237,230,0.45)",
  border: "rgba(109,184,122,0.15)", error: "#e87a6a",
};

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending:              { color: G.gold,       bg: `${G.gold}15`,       label: "Pending" },
  approved:             { color: G.greenLight, bg: `${G.green}15`,      label: "Approved" },
  completed:            { color: "#7ab8e8",    bg: "rgba(122,184,232,0.12)", label: "Completed" },
  rejected:             { color: G.error,      bg: `${G.error}12`,      label: "Rejected" },
  reschedule_requested: { color: "#c8a4e8",    bg: "rgba(200,164,232,0.12)", label: "Reschedule Req." },
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, opacity: 0.8, marginBottom: 6 }}>
      ✦ {children} ✦
    </p>
  );
}

function StatCard({ label, value, accent = G.greenPale }: { label: string; value: number; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`,
        borderRadius: 20, padding: "1.4rem 1.6rem",
        backdropFilter: "blur(12px)",
      }}
    >
      <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: G.muted, marginBottom: 12 }}>{label}</p>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "3.2rem", fontWeight: 300, color: accent, lineHeight: 1 }}>{value}</p>
    </motion.div>
  );
}

function ProgressBar({ status }: { status: string }) {
  const steps = ["pending", "approved", "completed"];
  const idx = steps.indexOf(status);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((s, i) => {
          const active = i <= idx;
          const meta = STATUS_META[s] ?? STATUS_META.pending;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                background: active ? meta.color : G.border,
                boxShadow: active ? `0 0 10px ${meta.color}60` : "none",
                transition: "all 0.4s",
              }} />
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 1,
                  background: i < idx ? `linear-gradient(90deg,${meta.color},${STATUS_META[steps[i + 1]].color})` : G.border,
                  transition: "background 0.4s",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {steps.map((s) => (
          <span key={s} style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [viewQrBooking, setViewQrBooking] = useState<any>(null); // State for QR Modal
  const [newDate, setNewDate] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      setUserName(user.email || "");
      
      // Query bookings connected to this email
      const q = query(collection(db, "bookings"), where("clientEmail", "==", user.email));
      
      const unsubBookings = onSnapshot(q, (snap) => {
        const data: any[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
        
        // Fallback for older booking schema 
        if(data.length === 0) {
           const legacyQ = query(collection(db, "bookings"), where("email", "==", user.email));
           getDocs(legacyQ).then(legacySnap => {
              const legacyData: any[] = [];
              legacySnap.forEach(ld => legacyData.push({ id: ld.id, ...ld.data() }));
              setBookings(legacyData);
              setLoading(false);
           });
        } else {
           setBookings(data);
           setLoading(false);
        }
      });
      return () => unsubBookings();
    });
    return () => unsubAuth();
  }, []);

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    try { await deleteDoc(doc(db, "bookings", id)); }
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
      setRescheduleBooking(null);
    } catch (err) { console.error(err); alert("Failed to reschedule"); }
  }

  function downloadInvoice(booking: any) {
    const pdf = new jsPDF();
    pdf.setFillColor(4, 13, 8);
    pdf.rect(0, 0, 210, 297, "F");
    pdf.setTextColor(160, 220, 176);
    pdf.setFontSize(22);
    pdf.text("The Aambal Retreat", 20, 28);
    pdf.setTextColor(240, 237, 230);
    pdf.setFontSize(13);
    pdf.text("Booking Invoice", 20, 42);
    pdf.setDrawColor(109, 184, 122, 0.3);
    pdf.line(20, 50, 190, 50);
    const rows = [
      ["Primary Guest", booking.clientName || booking.name],
      ["Partner / Plus One", booking.partnerName || "—"],
      ["Contact Email", booking.clientEmail || booking.email],
      ["Contact Phone", booking.clientPhone || booking.phone],
      ["Package", booking.packageName || booking.package || "Festival Package"],
      ["Date", booking.date],
      ["Timeline", booking.timeSlots?.join(", ") || booking.time],
      ["Status", booking.status],
    ];
    rows.forEach(([k, v], i) => {
      pdf.setTextColor(160, 220, 176);
      pdf.text(k, 20, 68 + i * 14);
      pdf.setTextColor(240, 237, 230);
      pdf.text(String(v ?? "—"), 80, 68 + i * 14);
    });
    pdf.setTextColor(109, 184, 122);
    pdf.text("Thank you for your booking. We look forward to capturing your vision.", 20, 240);
    pdf.save(`${booking.clientName || booking.name}-invoice.pdf`);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: G.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "floatLotus 3s ease-in-out infinite" }}>🪷</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: G.greenPale, marginTop: 16 }}>Loading…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600&family=Cinzel:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body,#root{background:${G.ink};color:${G.text};font-family:'Raleway',sans-serif}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${G.green}50;border-radius:3px}
        @keyframes floatLotus{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ambientPulse{0%,100%{opacity:.3}50%{opacity:.55}}
        input:focus,select:focus,textarea:focus{outline:none;border-color:${G.green}!important}
        input::placeholder{color:rgba(240,237,230,0.2)}
        select option{background:${G.ink2};color:${G.text}}
      `}</style>

      <div style={{ minHeight: "100vh", background: G.ink, position: "relative", overflow: "hidden" }}>
        {/* ambient glows */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${G.green}07,transparent 70%)`, animation: "ambientPulse 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 400, height: 350, borderRadius: "50%", background: `radial-gradient(circle,${G.gold}05,transparent 70%)`, animation: "ambientPulse 8s ease-in-out infinite 2s" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}03 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,${G.green}03 80px)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: "3.5rem" }}>
            <div>
              <SectionLabel>Customer Portal</SectionLabel>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.4rem,5vw,4rem)", fontWeight: 300, color: G.text, lineHeight: 1.05 }}>
                My <em style={{ fontStyle: "italic", color: G.greenPale }}>Bookings</em>
              </h1>
              <p style={{ color: G.muted, fontSize: "0.85rem", marginTop: 6, letterSpacing: "0.05em" }}>{userName}</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/customer-profile" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "10px 20px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.08em", transition: "border-color .2s" }}>My Profile</a>
              <a href="/customer-history" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "10px 20px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.08em" }}>History</a>
              <button onClick={handleLogout} style={{ background: `${G.error}15`, border: `1px solid ${G.error}30`, color: G.error, borderRadius: 100, padding: "10px 20px", fontSize: "0.82rem", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "'Raleway',sans-serif" }}>Sign out</button>
            </div>
          </motion.div>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: "3.5rem" }}>
            {[
              { label: "Total", value: bookings.length, accent: G.greenPale },
              { label: "Pending", value: bookings.filter(b => b.status === "pending" || !b.status).length, accent: G.gold },
              { label: "Approved", value: bookings.filter(b => b.status === "approved").length, accent: G.greenLight },
              { label: "Completed", value: bookings.filter(b => b.status === "completed").length, accent: "#7ab8e8" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          {/* BOOKINGS */}
          {bookings.length === 0 && (
            <div style={{ textAlign: "center", padding: "5rem 2rem", border: `1px solid ${G.border}`, borderRadius: 24, color: G.muted }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>🪷</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem" }}>No bookings yet</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {bookings.map((booking, i) => {
              const meta = STATUS_META[booking.status] ?? STATUS_META.pending;
              const expanded = expandedId === booking.id;
              
              const primaryName = booking.clientName || booking.name;
              const partnerName = booking.partnerName;
              const packageDisplay = booking.packageName || booking.package || "Premium Package";

              return (
                <motion.div key={booking.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  style={{ background: "rgba(7,16,9,0.85)", border: `1px solid ${G.border}`, borderRadius: 24, overflow: "hidden", backdropFilter: "blur(16px)" }}>

                  {/* CARD HEADER – always visible */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : booking.id)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.75rem", cursor: "pointer", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${meta.color}18`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: meta.color, flexShrink: 0 }}>
                        {primaryName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.35rem", color: G.text, fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {primaryName} {partnerName && <span style={{fontSize: "1rem", color: G.muted}}> & {partnerName}</span>}
                        </p>
                        <p style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>📅 {booking.date} &nbsp;·&nbsp; {packageDisplay}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ background: meta.bg, color: meta.color, borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{meta.label}</span>
                      <span style={{ color: G.muted, fontSize: 16, transition: "transform .3s", transform: expanded ? "rotate(180deg)" : "none" }}>⌄</span>
                    </div>
                  </div>

                  {/* EXPANDED BODY */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{ overflow: "hidden", borderTop: `1px solid ${G.border}` }}>
                        <div style={{ padding: "1.5rem 1.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" }}>

                          {/* LEFT – info */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            
                            {/* Guest Details Panel */}
                            <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                               <div>
                                 <p style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>Primary Guest</p>
                                 <p style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{primaryName}</p>
                                 <p style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{booking.clientPhone || booking.phone}</p>
                               </div>
                               {partnerName && (
                                 <div style={{ borderLeft: `1px solid ${G.border}`, paddingLeft: 10 }}>
                                   <p style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>Partner</p>
                                   <p style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{partnerName}</p>
                                   <p style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{booking.partnerPhone}</p>
                                 </div>
                               )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              {[
                                ["Date", `📅 ${booking.date}`],
                                ["Time", `⏰ ${booking.timeSlots?.join(", ") || booking.time}`],
                                ["Package", packageDisplay],
                                ["Reference ID", booking.referenceId || booking.reference || "N/A"],
                              ].map(([k, v]) => (
                                <div key={k} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "10px 12px" }}>
                                  <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>{k}</p>
                                  <p style={{ fontSize: 13, color: G.text }}>{v}</p>
                                </div>
                              ))}
                            </div>

                            {booking.photographer && (
                              <div style={{ background: `rgba(74,148,96,0.07)`, border: `1px solid ${G.green}25`, borderRadius: 12, padding: "12px 14px" }}>
                                <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: G.greenPale, opacity: 0.7, marginBottom: 6 }}>Assigned Photographer</p>
                                <p style={{ fontSize: 14, color: G.text, fontWeight: 500 }}>📸 {booking.photographer}</p>
                              </div>
                            )}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "14px 16px" }}>
                              <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 12 }}>Progress</p>
                              <ProgressBar status={booking.status} />
                            </div>
                          </div>

                          {/* RIGHT – actions */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>Pass & Actions</p>
                            
                            {/* DIGITAL PASS BUTTON */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewQrBooking(booking); }}
                              style={{ background: `linear-gradient(135deg, ${G.gold}15, ${G.goldLight}15)`, border: `1px solid ${G.gold}40`, color: G.goldLight, borderRadius: 14, padding: "14px 18px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                              <span>View Digital Pass</span>
                              <span style={{ fontSize: 18 }}>🎫</span>
                            </button>

                            <a href="/customer-gallery"
                              style={{ background: `rgba(200,164,232,0.08)`, border: `1px solid rgba(200,164,232,0.2)`, color: "#c8a4e8", borderRadius: 14, padding: "12px 18px", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em", display: "block", textAlign: "left" }}>
                              View Photo Gallery
                            </a>

                            {[
                              { label: "Download Invoice", color: G.green, onClick: () => downloadInvoice(booking) },
                              { label: "Request Reschedule", color: "#7ab8e8", onClick: () => openReschedule(booking) },
                              { label: "Cancel Booking", color: G.error, onClick: () => cancelBooking(booking.id) },
                            ].map(({ label, color, onClick }) => (
                              <button key={label} onClick={(e) => { e.stopPropagation(); onClick(); }}
                                style={{ background: `${color}12`, border: `1px solid ${color}30`, color, borderRadius: 14, padding: "12px 18px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em", textAlign: "left", transition: "background .2s" }}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── DIGITAL PASS QR MODAL ── */}
        <AnimatePresence>
          {viewQrBooking && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,13,8,0.92)", backdropFilter: "blur(10px)", padding: "1.5rem" }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ background: G.ink2, border: `1px solid ${G.border}`, borderRadius: 24, padding: "2.5rem", width: "100%", maxWidth: 400, textAlign: "center", position: "relative" }}>
                
                <button 
                  onClick={() => setViewQrBooking(null)}
                  style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>

                <SectionLabel>Digital Access Pass</SectionLabel>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: G.text, marginBottom: 8, lineHeight: 1.1 }}>
                  {viewQrBooking.packageName || viewQrBooking.package || "Premium Session"}
                </h2>
                <p style={{ color: G.gold, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, marginBottom: 24 }}>
                  Ref: {viewQrBooking.referenceId || viewQrBooking.reference || "N/A"}
                </p>
                
                <div style={{ background: "#ffffff", padding: "1.2rem", borderRadius: 16, display: "inline-block", marginBottom: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/verify-booking?ref=' + (viewQrBooking.referenceId || viewQrBooking.reference))}`} 
                    alt="Booking QR Code" 
                    style={{ width: 200, height: 200, display: "block" }} 
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: viewQrBooking.partnerName ? "1fr 1fr" : "1fr", gap: 12, textAlign: "left", marginBottom: 24 }}>
                   <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 14, border: `1px solid ${G.border}`}}>
                     <p style={{ fontSize: 9, color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Primary Guest</p>
                     <p style={{ fontSize: 13, color: G.text, fontWeight: 600 }}>{viewQrBooking.clientName || viewQrBooking.name}</p>
                   </div>
                   {viewQrBooking.partnerName && (
                     <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 14, border: `1px solid ${G.border}`}}>
                       <p style={{ fontSize: 9, color: G.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Partner</p>
                       <p style={{ fontSize: 13, color: G.text, fontWeight: 600 }}>{viewQrBooking.partnerName}</p>
                     </div>
                   )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${G.border}`, paddingTop: 16 }}>
                   <span style={{ fontSize: 11, color: G.muted }}>📅 {viewQrBooking.date}</span>
                   <span style={{ fontSize: 11, color: G.muted }}>⏰ {viewQrBooking.time || viewQrBooking.timeSlots?.join(", ")}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESCHEDULE MODAL */}
        <AnimatePresence>
          {rescheduleBooking && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,13,8,0.92)", backdropFilter: "blur(10px)", padding: "1.5rem" }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ background: G.ink2, border: `1px solid ${G.border}`, borderRadius: 24, padding: "2.5rem", width: "100%", maxWidth: 440 }}>
                <SectionLabel>Modify your booking</SectionLabel>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: G.text, marginBottom: 28 }}>Reschedule</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "New date", value: newDate, onChange: setNewDate, type: "date" },
                    { label: "Time slots", value: newSlots, onChange: setNewSlots, type: "text", placeholder: "e.g. 08:00, 10:00" },
                  ].map(({ label, value, onChange, type, placeholder }) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, opacity: 0.7, marginBottom: 6 }}>{label}</p>
                      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 14px", color: G.text, fontSize: "0.9rem", fontFamily: "'Raleway',sans-serif", colorScheme: "dark" }} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button onClick={submitReschedule}
                      style={{ flex: 1, background: `linear-gradient(135deg,${G.green},${G.greenLight})`, border: "none", borderRadius: 14, padding: "13px", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.9rem" }}>
                      Confirm
                    </button>
                    <button onClick={() => setRescheduleBooking(null)}
                      style={{ flex: 1, background: "transparent", border: `1px solid ${G.border}`, borderRadius: 14, padding: "13px", color: G.muted, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: "0.9rem" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
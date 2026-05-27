import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/customer-history")({
  component: CustomerHistory,
});

const G = {
  green: "#4a9460", greenLight: "#6db87a", greenPale: "#a8e6b0",
  gold: "#c8a84a", ink: "#040d08", ink2: "#071009", ink3: "#0d1f10",
  text: "#f0ede6", muted: "rgba(240,237,230,0.45)",
  border: "rgba(109,184,122,0.15)", error: "#e87a6a",
};

const STATUS_META: Record<string, { color: string; bg: string; dot: string }> = {
  pending:   { color: G.gold,       bg: `${G.gold}12`,       dot: G.gold },
  approved:  { color: G.greenLight, bg: `${G.green}12`,      dot: G.greenLight },
  completed: { color: "#7ab8e8",    bg: "rgba(122,184,232,0.1)", dot: "#7ab8e8" },
  rejected:  { color: G.error,      bg: `${G.error}10`,      dot: G.error },
};

const FILTERS = ["All", "pending", "approved", "completed", "rejected"];

export default function CustomerHistory() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      const q = query(collection(db, "bookings"), where("email", "==", user.email));
      const unsubBookings = onSnapshot(q, (snap) => {
        const data: any[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
        // sort newest first
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setBookings(data);
        setLoading(false);
      });
      return () => unsubBookings();
    });
    return () => unsub();
  }, []);

  function downloadInvoice(booking: any) {
    const pdf = new jsPDF();
    pdf.setFillColor(4, 13, 8);
    pdf.rect(0, 0, 210, 297, "F");
    pdf.setTextColor(160, 220, 176);
    pdf.setFontSize(20);
    pdf.text("Aambal Vasantham Studio", 20, 28);
    pdf.setTextColor(200, 168, 74);
    pdf.setFontSize(11);
    pdf.text("INVOICE", 20, 40);
    pdf.setDrawColor(109, 184, 122, 0.25);
    pdf.line(20, 46, 190, 46);
    pdf.setTextColor(240, 237, 230);
    pdf.setFontSize(12);
    const rows = [
      ["Invoice ID", booking.id],
      ["Customer", booking.name],
      ["Email", booking.email],
      ["Phone", booking.phone],
      ["Package", booking.package],
      ["Date", booking.date],
      ["Time", booking.time],
      ["Status", booking.status],
    ];
    rows.forEach(([k, v], i) => {
      pdf.setTextColor(160, 220, 176);
      pdf.text(String(k), 20, 62 + i * 15);
      pdf.setTextColor(240, 237, 230);
      pdf.text(String(v ?? "—"), 80, 62 + i * 15);
    });
    pdf.setTextColor(109, 184, 122);
    pdf.text("Thank you for booking with Aambal Vasantham.", 20, 210);
    pdf.save(`invoice-${booking.id}.pdf`);
  }

  const filtered = bookings
    .filter((b) => filter === "All" || b.status === filter)
    .filter((b) => !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.package?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: G.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "floatLotus 3s ease-in-out infinite" }}>🪷</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: G.greenPale, marginTop: 16 }}>Loading history…</p>
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
        input:focus{outline:none;border-color:${G.green}!important}
        input::placeholder{color:rgba(240,237,230,0.2)}
      `}</style>

      <div style={{ minHeight: "100vh", background: G.ink, position: "relative", overflow: "hidden" }}>
        {/* ambient */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "5%", right: "10%", width: 450, height: 350, borderRadius: "50%", background: `radial-gradient(circle,${G.gold}05,transparent 70%)`, animation: "ambientPulse 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}03 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,${G.green}03 80px)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: "3rem" }}>
            <div>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, opacity: 0.8, marginBottom: 6 }}>✦ Aambal Vasantham ✦</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300, color: G.text, lineHeight: 1.05 }}>
                Booking <em style={{ fontStyle: "italic", color: G.greenPale }}>History</em>
              </h1>
              <p style={{ color: G.muted, fontSize: "0.8rem", marginTop: 6 }}>{bookings.length} booking{bookings.length !== 1 ? "s" : ""} on record</p>
            </div>
            <a href="/customer-profile" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "10px 20px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.08em" }}>← Profile</a>
          </motion.div>

          {/* FILTERS + SEARCH */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "2rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? `${G.green}20` : "transparent",
                    border: `1px solid ${filter === f ? G.green + "50" : G.border}`,
                    color: filter === f ? G.greenPale : G.muted,
                    borderRadius: 100, padding: "7px 16px", cursor: "pointer",
                    fontSize: 11, letterSpacing: "0.1em", textTransform: "capitalize",
                    fontFamily: "'Raleway',sans-serif", transition: "all .2s",
                  }}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings…"
                style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 100, padding: "8px 16px 8px 36px", color: G.text, fontSize: "0.82rem", fontFamily: "'Raleway',sans-serif" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14 }}>⌕</span>
            </div>
          </motion.div>

          {/* TIMELINE LIST */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", border: `1px solid ${G.border}`, borderRadius: 24, color: G.muted }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.35 }}>🌿</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem" }}>No bookings match your filter</p>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* vertical line */}
              <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 1, background: G.border, zIndex: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filtered.map((booking, i) => {
                  const meta = STATUS_META[booking.status] ?? STATUS_META.pending;
                  return (
                    <motion.div key={booking.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ display: "flex", gap: 18, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                      {/* dot */}
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: meta.bg, border: `1px solid ${meta.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: meta.dot, boxShadow: `0 0 8px ${meta.dot}80` }} />
                      </div>
                      {/* card */}
                      <div style={{ flex: 1, background: "rgba(7,16,9,0.85)", border: `1px solid ${G.border}`, borderRadius: 20, padding: "1.25rem 1.5rem", backdropFilter: "blur(12px)", cursor: "pointer", transition: "border-color .2s" }}
                        onClick={() => setSelected(selected?.id === booking.id ? null : booking)}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", color: G.text, fontWeight: 400 }}>{booking.package || "Festival Package"}</p>
                            <p style={{ fontSize: 12, color: G.muted, marginTop: 3 }}>📅 {booking.date} &nbsp;·&nbsp; {booking.name}</p>
                          </div>
                          <span style={{ background: meta.bg, color: meta.color, borderRadius: 100, padding: "3px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {booking.status}
                          </span>
                        </div>

                        <AnimatePresence>
                          {selected?.id === booking.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ overflow: "hidden", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${G.border}` }}>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
                                {[
                                  ["Time", booking.time || "—"],
                                  ["Phone", booking.phone || "—"],
                                  ["Drone", booking.addDrone ? "Yes ✓" : "No"],
                                  ["Status", booking.status],
                                ].map(([k, v]) => (
                                  <div key={k} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "8px 10px" }}>
                                    <p style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: G.muted, marginBottom: 4 }}>{k}</p>
                                    <p style={{ fontSize: 12, color: G.text }}>{v}</p>
                                  </div>
                                ))}
                              </div>
                              {booking.notes && (
                                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: G.muted, lineHeight: 1.6 }}>
                                  {booking.notes}
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button onClick={(e) => { e.stopPropagation(); downloadInvoice(booking); }}
                                  style={{ background: `${G.green}18`, border: `1px solid ${G.green}35`, color: G.greenPale, borderRadius: 12, padding: "9px 18px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontWeight: 600, fontSize: "0.82rem" }}>
                                  Download Invoice
                                </button>
                                <a href="/" onClick={(e) => e.stopPropagation()}
                                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, color: G.muted, borderRadius: 12, padding: "9px 18px", textDecoration: "none", fontWeight: 600, fontSize: "0.82rem" }}>
                                  Book Again
                                </a>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
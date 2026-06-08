// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/routes/admin-enquiries.tsx
// Full standalone admin page for managing enquiries
// Route: /admin-enquiries
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection, onSnapshot, query, orderBy, updateDoc, deleteDoc,
  doc, addDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/admin-enquiries")({
  component: EnquiriesAdminPage,
});

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  gold: "#c8a84a", goldLight: "#e8c97a", ink: "#060910", ink2: "#0b0f1a",
  ink3: "#111827", surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(200,168,74,0.2)", text: "#f0ede6", muted: "rgba(240,237,230,0.4)",
  green: "#34d399", red: "#f87171", blue: "#60a5fa", cyan: "#22d3ee", amber: "#fbbf24",
};

const SERVICE_ICONS: Record<string, string> = {
  portrait: "📸", bridal: "💍", graduation: "🎓",
  newborn: "👶", reels: "🎬", corporate: "🏢",
};
const SERVICE_COLORS: Record<string, string> = {
  portrait: "#ff6b6b", bridal: "#ffd93d", graduation: "#6bcb77",
  newborn: "#4d96ff", reels: "#c77dff", corporate: "#f4a261",
};
const SERVICE_LABELS: Record<string, string> = {
  portrait: "Portrait Sessions", bridal: "Bridal & Wedding",
  graduation: "Graduation & Events", newborn: "Newborn & Kids",
  reels: "Reels & Short Films", corporate: "Corporate & Brand",
};

const ENQUIRY_STATUSES = [
  { id: "new",         label: "New",          color: "#fbbf24" },
  { id: "contacted",   label: "Contacted",    color: "#60a5fa" },
  { id: "quoted",      label: "Quoted",       color: "#a78bfa" },
  { id: "confirmed",   label: "Confirmed",    color: "#34d399" },
  { id: "converted",   label: "Converted",    color: "#c8a84a" },
  { id: "closed",      label: "Closed",       color: "#f87171" },
];

function statusMeta(id: string) {
  return ENQUIRY_STATUSES.find(s => s.id === id) ?? ENQUIRY_STATUSES[0];
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  const s = statusMeta(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${s.color}18`,
      color: s.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", padding: "4px 11px", borderRadius: 100, border: `1px solid ${s.color}35` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: T.text, lineHeight: 1.5, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // ── new enquiry form state ──
  const [newEnq, setNewEnq] = useState({
    name: "", phone: "", email: "", service: "portrait",
    date: "", guests: "1", message: "", droneAddon: false,
  });

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  useEffect(() => {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEnquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function updateField(id: string, data: Record<string, any>) {
    try { await updateDoc(doc(db, "enquiries", id), { ...data, updatedAt: serverTimestamp() }); }
    catch (e) { console.error(e); }
  }

  async function saveNote(id: string) {
    await updateField(id, { adminNote: editingNote[id] ?? "" });
    toast("Note saved ✓");
  }

  async function saveReply(id: string) {
    const text = replyText[id];
    if (!text?.trim()) return;
    await updateField(id, {
      reply: text,
      repliedAt: serverTimestamp(),
      status: "contacted",
    });
    setReplyText(prev => ({ ...prev, [id]: "" }));
    toast("Reply saved & status set to Contacted ✓");
  }

  async function deleteEnquiry(id: string) {
    try { await deleteDoc(doc(db, "enquiries", id)); toast("Enquiry deleted"); }
    catch (e) { console.error(e); }
    setDeleteConfirm(null);
  }

  async function addManualEnquiry() {
    if (!newEnq.name || !newEnq.phone) { toast("Name and phone are required"); return; }
    await addDoc(collection(db, "enquiries"), {
      ...newEnq, status: "new", source: "manual",
      createdAt: serverTimestamp(), adminNote: "", reply: "",
    });
    setShowAddModal(false);
    setNewEnq({ name: "", phone: "", email: "", service: "portrait", date: "", guests: "1", message: "", droneAddon: false });
    toast("Enquiry added ✓");
  }

  // ── derived ──
  const filtered = enquiries.filter(e => {
    const s = (e.name + e.email + e.phone + e.message).toLowerCase().includes(search.toLowerCase());
    const sv = serviceFilter === "all" || e.service === serviceFilter;
    const st = statusFilter === "all" || e.status === statusFilter;
    return s && sv && st;
  });

  const counts = ENQUIRY_STATUSES.reduce((acc, s) => {
    acc[s.id] = enquiries.filter(e => e.status === s.id).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: T.ink, flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid rgba(200,168,74,0.15)`, borderTop: `2px solid ${T.gold}`, animation: "spin 1s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <p style={{ color: T.muted, letterSpacing: "0.2em", fontSize: "0.85rem" }}>Loading enquiries…</p>
    </div>
  );

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body{background:${T.ink};color:${T.text};font-family:'Raleway',sans-serif}
        input,select,textarea{outline:none;color:${T.text};font-family:inherit}
        input::placeholder,textarea::placeholder{color:${T.muted}}
        button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.gold}30;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: T.ink }}>
        {/* ambient */}
        <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse,${T.gold}06 0%,transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>

          {/* ── HEADER ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "2.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Link to="/admin" style={{ fontSize: 12, color: T.muted, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, border: `1px solid ${T.border}`, borderRadius: 100, padding: "5px 14px" }}>← Admin</Link>
              </div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.4em", textTransform: "uppercase", color: T.gold, marginBottom: 6, opacity: 0.8 }}>Studio Hut · CMS</p>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 500, color: T.text, margin: 0 }}>Enquiries Manager</h1>
              <p style={{ marginTop: 5, color: T.muted, fontSize: "0.8rem" }}>View, respond, update, and convert service enquiries</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setShowAddModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, background: `${T.gold}18`, border: `1px solid ${T.gold}35`, color: T.gold, borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                + Add Enquiry
              </button>
              <button onClick={() => {
                const csv = ["Name,Phone,Email,Service,Date,Status,Message,Note,Reply"].concat(
                  enquiries.map(e => [e.name, e.phone, e.email, e.service, e.date, e.status, e.message, e.adminNote, e.reply].map(v => `"${v ?? ""}"`).join(","))
                ).join("\n");
                const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "enquiries.csv"; a.click();
                toast("CSV exported ✓");
              }}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: T.green, borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 700 }}>
                ⬇ Export CSV
              </button>
            </div>
          </motion.div>

          {/* ── STATUS SUMMARY CHIPS ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
            <button onClick={() => setStatusFilter("all")}
              style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${statusFilter === "all" ? T.gold : T.border}`, background: statusFilter === "all" ? `${T.gold}12` : "transparent", color: statusFilter === "all" ? T.gold : T.muted, fontSize: 12, fontWeight: 600 }}>
              All ({enquiries.length})
            </button>
            {ENQUIRY_STATUSES.map(s => (
              <button key={s.id} onClick={() => setStatusFilter(s.id)}
                style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${statusFilter === s.id ? s.color : T.border}`, background: statusFilter === s.id ? `${s.color}12` : "transparent", color: statusFilter === s.id ? s.color : T.muted, fontSize: 12, fontWeight: 600 }}>
                {s.label} ({counts[s.id] ?? 0})
              </button>
            ))}
          </div>

          {/* ── SEARCH + FILTER BAR ── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.5rem", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1rem 1.25rem", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…"
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px 9px 36px", fontSize: 13 }} />
            </div>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
              style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, minWidth: 160 }}>
              <option value="all">All Services</option>
              {Object.entries(SERVICE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <div style={{ background: `${T.gold}12`, border: `1px solid ${T.gold}25`, borderRadius: 10, padding: "9px 16px", fontSize: 12, color: T.gold, fontWeight: 700, letterSpacing: "0.1em" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── ENQUIRY CARDS ── */}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "5rem 2rem", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20 }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1.3rem", color: T.muted }}>No enquiries found</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((enq, idx) => {
              const isOpen = expandedId === enq.id;
              const svcColor = SERVICE_COLORS[enq.service] ?? T.gold;
              const createdDate = enq.createdAt?.toDate ? enq.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

              return (
                <motion.div key={enq.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  style={{
                    background: `linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))`,
                    border: `1px solid ${isOpen ? svcColor + "40" : T.border}`,
                    borderRadius: 20, overflow: "hidden", transition: "border-color 0.25s",
                  }}>

                  {/* ── Card header ── */}
                  <div onClick={() => setExpandedId(isOpen ? null : enq.id)}
                    style={{ padding: "1.1rem 1.4rem", cursor: "pointer", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                    {/* Service icon badge */}
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${svcColor}15`, border: `1.5px solid ${svcColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {SERVICE_ICONS[enq.service] ?? "📋"}
                    </div>

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: T.text, margin: 0, fontWeight: 500 }}>{enq.name}</p>
                      <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{enq.phone}{enq.email ? ` · ${enq.email}` : ""}</p>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: svcColor, background: `${svcColor}10`, border: `1px solid ${svcColor}25`, padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>
                        {SERVICE_LABELS[enq.service] ?? enq.service}
                      </span>
                      <Pill status={enq.status ?? "new"} />
                      {enq.droneAddon && (
                        <span style={{ fontSize: 10, color: "#7dd3fc", background: "rgba(125,211,252,0.1)", border: "1px solid rgba(125,211,252,0.2)", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>🚁 + Drone</span>
                      )}
                      <span style={{ fontSize: 10, color: T.muted, letterSpacing: "0.06em" }}>{createdDate}</span>
                      {enq.source === "manual" && <span style={{ fontSize: 9, color: T.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, padding: "3px 8px", borderRadius: 6 }}>Manual</span>}
                    </div>

                    <div style={{ color: T.muted, fontSize: 16, transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>⌄</div>
                  </div>

                  {/* ── Expanded detail ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                        <div style={{ borderTop: `1px solid ${T.border}`, padding: "1.5rem 1.4rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

                            {/* LEFT: details + reply + note */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                              {/* Info grid */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
                                <Field label="Phone" value={enq.phone} />
                                <Field label="Email" value={enq.email} />
                                <Field label="Preferred Date" value={enq.date} />
                                <Field label="Guests / People" value={enq.guests} />
                                <Field label="Drone Add-on" value={enq.droneAddon ? "Yes (+₹6,500)" : "No"} />
                                <Field label="Source" value={enq.source === "manual" ? "Manually Added" : "Website Form"} />
                              </div>

                              {/* Message */}
                              {enq.message && (
                                <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
                                  <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Client message</p>
                                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{enq.message}</p>
                                </div>
                              )}

                              {/* Admin reply */}
                              <div>
                                <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Reply / Quote to send</p>
                                {enq.reply && (
                                  <div style={{ background: `${T.gold}08`, border: `1px solid ${T.gold}20`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                                    <p style={{ fontSize: 11, color: T.gold, marginBottom: 4, letterSpacing: "0.1em" }}>Last reply sent</p>
                                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{enq.reply}</p>
                                  </div>
                                )}
                                <textarea
                                  rows={3}
                                  value={replyText[enq.id] ?? ""}
                                  onChange={e => setReplyText(prev => ({ ...prev, [enq.id]: e.target.value }))}
                                  placeholder="Type a quote, follow-up message, or reply…"
                                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }}
                                />
                                <button onClick={() => saveReply(enq.id)}
                                  style={{ marginTop: 8, background: `${T.gold}18`, border: `1px solid ${T.gold}35`, color: T.gold, borderRadius: 10, padding: "9px 20px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                                  Save Reply & Mark Contacted
                                </button>
                              </div>

                              {/* Admin note */}
                              <div>
                                <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>Internal admin note</p>
                                <textarea
                                  rows={2}
                                  value={editingNote[enq.id] ?? (enq.adminNote ?? "")}
                                  onChange={e => setEditingNote(prev => ({ ...prev, [enq.id]: e.target.value }))}
                                  placeholder="Private notes visible only to admin…"
                                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(125,211,252,0.15)`, borderRadius: 10, padding: "11px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                                />
                                <button onClick={() => saveNote(enq.id)}
                                  style={{ marginTop: 8, background: "rgba(125,211,252,0.1)", border: "1px solid rgba(125,211,252,0.25)", color: T.cyan, borderRadius: 10, padding: "9px 20px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                                  Save Note
                                </button>
                              </div>
                            </div>

                            {/* RIGHT: status changer + actions */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                              {/* Status selector */}
                              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px" }}>
                                <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>Update status</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {ENQUIRY_STATUSES.map(s => (
                                    <button key={s.id}
                                      onClick={() => { updateField(enq.id, { status: s.id }); toast(`Status → ${s.label}`); }}
                                      style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        padding: "9px 14px", borderRadius: 10, border: `1px solid ${enq.status === s.id ? s.color : "transparent"}`,
                                        background: enq.status === s.id ? `${s.color}18` : "rgba(255,255,255,0.03)",
                                        color: enq.status === s.id ? s.color : T.muted, fontSize: 12, fontWeight: 600,
                                        transition: "all 0.15s", textAlign: "left",
                                      }}>
                                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                      {s.label}
                                      {enq.status === s.id && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Convert to booking */}
                              <button onClick={() => {
                                window.open(`/enquiry?service=${enq.service}`, "_blank");
                                toast("Opened service page — copy details to booking form");
                              }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${T.gold}18`, border: `1px solid ${T.gold}35`, color: T.gold, borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
                                🎯 Convert to Booking
                              </button>

                              {/* WhatsApp */}
                              <a href={`https://wa.me/${(enq.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${enq.name}, thank you for enquiring about our ${SERVICE_LABELS[enq.service] ?? "photography"} service. `)}`}
                                target="_blank" rel="noreferrer"
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80", borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                💬 Open WhatsApp
                              </a>

                              {/* Call */}
                              <a href={`tel:${enq.phone}`}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: T.blue, borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                📞 Call Client
                              </a>

                              {/* Delete */}
                              {deleteConfirm === enq.id ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button onClick={() => deleteEnquiry(enq.id)} style={{ flex: 1, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: T.red, borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 700 }}>Confirm Delete</button>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, padding: "10px", fontSize: 12 }}>Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(enq.id)}
                                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", color: "rgba(248,113,113,0.6)", borderRadius: 12, padding: "10px", fontSize: 11, fontWeight: 600 }}>
                                  🗑 Delete Enquiry
                                </button>
                              )}
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
        </div>
      </div>

      {/* ── ADD ENQUIRY MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 520, background: T.ink3, border: `1px solid ${T.gold}30`, borderRadius: 24, padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.2rem", color: T.goldLight, margin: 0 }}>Add Enquiry Manually</h2>
                <button onClick={() => setShowAddModal(false)}
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name *", key: "name", placeholder: "Client's full name" },
                  { label: "Phone / WhatsApp *", key: "phone", placeholder: "+91 98xxx xxxxx" },
                  { label: "Email", key: "email", placeholder: "client@email.com" },
                  { label: "Preferred Date", key: "date", placeholder: "e.g. 20 July 2026" },
                  { label: "Guests / People", key: "guests", placeholder: "e.g. 2" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>{label}</p>
                    <input value={(newEnq as any)[key]} onChange={e => setNewEnq(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13 }} />
                  </div>
                ))}

                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Service</p>
                  <select value={newEnq.service} onChange={e => setNewEnq(prev => ({ ...prev, service: e.target.value }))}
                    style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                    {Object.entries(SERVICE_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="droneChk" checked={newEnq.droneAddon} onChange={e => setNewEnq(prev => ({ ...prev, droneAddon: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: T.gold }} />
                  <label htmlFor="droneChk" style={{ fontSize: 13, color: T.muted, cursor: "pointer" }}>Include Drone Add-on (+₹6,500)</label>
                </div>

                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Notes / Message</p>
                  <textarea rows={3} value={newEnq.message} onChange={e => setNewEnq(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Any requirements, location, theme…"
                    style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={addManualEnquiry}
                    style={{ flex: 1, background: `${T.gold}20`, border: `1px solid ${T.gold}40`, color: T.gold, borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em" }}>
                    Add Enquiry
                  </button>
                  <button onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 12, padding: "13px", fontWeight: 500, fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: T.ink3, border: `1px solid ${T.gold}35`, borderRadius: 100, padding: "12px 28px", fontSize: 13, color: T.gold, fontWeight: 600, letterSpacing: "0.06em", boxShadow: `0 8px 40px rgba(0,0,0,0.5)`, whiteSpace: "nowrap" }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
// src/routes/reserve.tsx
// Aambal Retreat — Reservation Page
// Collects guest details and writes to Firestore "reservations" collection.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve Your Stay · The Aambal Retreat" },
      { name: "description", content: "Reserve a room at the Aambal Retreat for Aambal Vasantham festival guests." },
    ],
  }),
  component: ReservePage,
});

// ── Design tokens (matching homestay) ─────────────────────────────────────────
const G = {
  green:     "#4a9460",
  greenLight:"#6db87a",
  greenPale: "#a8e6b0",
  gold:      "#c8a84a",
  goldLight: "#e8c97a",
  ink:       "#040d08",
  ink2:      "#071009",
  ink3:      "#0d1f10",
  text:      "#f0ede6",
  muted:     "rgba(240,237,230,0.45)",
  border:    "rgba(109,184,122,0.15)",
  surface:   "rgba(255,255,255,0.03)",
  error:     "#e87a6a",
};

// ── Room options ───────────────────────────────────────────────────────────────
const ROOMS = [
  { id: "lotus",       label: "Lotus Suite",              price: "₹8,500 / night", icon: "🪷", badge: "Most requested", accent: G.green },
  { id: "temple",      label: "Temple View Room",         price: "₹6,500 / night", icon: "🛕", accent: G.gold },
  { id: "garden",      label: "Garden Cottage",           price: "₹5,500 / night", icon: "🌿", accent: G.greenLight },
  { id: "studio",      label: "Photographer's Studio",    price: "₹7,200 / night", icon: "📸", badge: "Unique to us", accent: "#a78bfa" },
];

const PACKAGES = [
  "Full Day Photography Package",
  "Bridal Photography Package",
  "Heritage Documentation Package",
  "Drone & Aerial Package",
];

const MEAL_PREFS = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain"];

// ── Shared micro components ────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.6rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, marginBottom: 10, opacity: 0.85 }}>
      ✦ {children} ✦
    </p>
  );
}

function FloatingLabel({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, opacity: 0.75 }}>
        {label}{required && <span style={{ color: G.gold, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  border: `1px solid ${G.border}`,
  borderRadius: 12,
  padding: "13px 16px",
  color: G.text,
  fontSize: "0.9rem",
  fontFamily: "'Raleway', sans-serif",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, background 0.2s",
};

// ── Success overlay ────────────────────────────────────────────────────────────
function SuccessScreen({ refId, onBack }: { refId: string; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", padding: "4rem 2rem" }}
    >
      {/* Ripple lotus */}
      <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 32px" }}>
        {[1, 2, 3].map((k) => (
          <div key={k} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `1px solid ${G.greenLight}`,
            animation: `ripple 2.4s ease-out infinite ${k * 0.5}s`,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
          🪷
        </div>
      </div>

      <SectionLabel>Reservation confirmed</SectionLabel>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, color: G.text, lineHeight: 1.15, marginBottom: 16 }}>
        Your stay is <em style={{ fontStyle: "italic", color: G.greenPale }}>awaiting.</em>
      </h2>
      <p style={{ color: G.muted, fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 420, margin: "0 auto 24px" }}>
        We've received your reservation request. Our team will confirm availability and send you details within 24 hours.
      </p>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: `${G.green}10`, border: `1px solid ${G.green}30`, borderRadius: 100, padding: "10px 20px", marginBottom: 36 }}>
        <span style={{ fontSize: 12, color: G.muted }}>Reference ID</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: G.greenPale, letterSpacing: "0.15em", fontFamily: "'Cinzel', serif" }}>{refId}</span>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          to="/homestay"
          style={{ background: `linear-gradient(135deg,${G.green},${G.greenLight})`, color: "#fff", borderRadius: 100, padding: "13px 28px", textDecoration: "none", fontWeight: 600, fontSize: "0.88rem", letterSpacing: "0.06em" }}
        >
          ← Back to Retreat
        </Link>
        <button
          onClick={onBack}
          style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "13px 28px", background: "transparent", cursor: "pointer", fontSize: "0.88rem", letterSpacing: "0.06em" }}
        >
          Make another reservation
        </button>
      </div>
    </motion.div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i < step ? `linear-gradient(90deg,${G.green},${G.greenLight})` : G.border,
            transition: "background 0.4s",
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ReservePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const [form, setForm] = useState({
    // Step 1 – Guest info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    // Step 2 – Stay details
    room: "",
    packageRef: "",
    packageType: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    mealPref: "",
    specialRequests: "",
    // Step 3 – Confirmation extras
    arrivalTime: "",
    flightOrTrain: "",
    wantsTransfer: "yes",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Validation per step ──
  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim())  e.lastName  = "Required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 8) e.phone = "Valid phone required";
    }
    if (s === 2) {
      if (!form.room)          e.room     = "Select a room";
      if (!form.packageType)   e.packageType = "Select your package";
      if (!form.packageRef.trim()) e.packageRef = "Required";
      if (!form.checkIn)       e.checkIn  = "Required";
      if (!form.checkOut)      e.checkOut = "Required";
      if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) e.checkOut = "Must be after check-in";
    }
    if (s === 3) {
      if (!form.agreeTerms) e.agreeTerms = "Please agree to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime();
    return Math.max(0, Math.round(diff / 86400000));
  })();

  const selectedRoom = ROOMS.find((r) => r.id === form.room);

  // ── Submit ──
  const submit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "reservations"), {
        ...form,
        nights,
        roomLabel: selectedRoom?.label ?? "",
        roomPrice: selectedRoom?.price ?? "",
        createdAt: serverTimestamp(),
        status: "pending",
      });
      const id = `AAM-${docRef.id.slice(0, 6).toUpperCase()}`;
      setRefId(id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // input focus ring
  const focusStyle = {
    borderColor: G.green,
    background: "rgba(74,148,96,0.06)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600&family=Cinzel:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body, #root { background: ${G.ink}; color: ${G.text}; font-family: 'Raleway', sans-serif; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${G.green}50; border-radius: 3px; }

        @keyframes floatLotus {
          0%,100%{transform:translateY(0) rotate(0deg)}
          33%{transform:translateY(-10px) rotate(4deg)}
          66%{transform:translateY(5px) rotate(-2deg)}
        }
        @keyframes ripple {
          0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.8);opacity:0}
        }
        @keyframes ambientPulse {
          0%,100%{opacity:.3} 50%{opacity:.6}
        }
        @keyframes shimmerGold {
          0%{background-position:200% 0} 100%{background-position:-200% 0}
        }

        input:focus, select:focus, textarea:focus {
          border-color: ${G.green} !important;
          background: rgba(74,148,96,0.06) !important;
          outline: none;
        }
        input::placeholder, textarea::placeholder {
          color: rgba(240,237,230,0.2);
        }
        select option { background: ${G.ink2}; color: ${G.text}; }

        .room-option:hover { border-color: rgba(109,184,122,0.4) !important; }
        .room-option.selected { box-shadow: 0 0 0 2px ${G.green}60; }

        .btn-next {
          background: linear-gradient(135deg, ${G.green}, ${G.greenLight});
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 14px 36px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          font-family: 'Raleway', sans-serif;
          box-shadow: 0 8px 30px rgba(74,148,96,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-next:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(74,148,96,0.45); }
        .btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-back {
          background: transparent;
          border: 1px solid ${G.border};
          color: ${G.muted};
          border-radius: 100px;
          padding: 14px 28px;
          font-size: 0.88rem;
          cursor: pointer;
          font-family: 'Raleway', sans-serif;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-back:hover { border-color: ${G.green}50; color: ${G.greenPale}; }

        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 580px) { .form-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Floating nav ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 100, display: "flex", alignItems: "center", gap: 24,
          background: "rgba(4,13,8,0.88)", backdropFilter: "blur(20px)",
          border: `1px solid ${G.border}`, borderRadius: 100, padding: "11px 24px",
        }}
      >
        <Link to="/homestay" style={{ color: G.muted, textDecoration: "none", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ← The Retreat
        </Link>
        <span style={{ width: 1, height: 14, background: G.border }} />
        <span style={{ fontSize: 11, letterSpacing: "0.18em", color: G.greenPale, textTransform: "uppercase" }}>
          Reserve your stay
        </span>
      </motion.nav>

      <div ref={containerRef} style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>

        {/* ── Background elements ── */}
        <motion.div style={{ y: bgY, position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 30%, ${G.green}08 0%, transparent 55%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 70%, ${G.gold}06 0%, transparent 50%)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}04 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,${G.green}04 80px)` }} />
        </motion.div>

        {/* Floating lotus decorations */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "fixed", left: `${5 + i * 22}%`, top: `${10 + (i % 3) * 30}%`,
            fontSize: `${14 + (i % 3) * 6}px`, opacity: 0.12,
            animation: `floatLotus ${5 + i}s ease-in-out infinite ${i * 0.8}s`,
            pointerEvents: "none", zIndex: 0,
          }}>🪷</div>
        ))}

        {/* ── Hero heading ── */}
        <div style={{ position: "relative", zIndex: 1, paddingTop: "8rem", paddingBottom: "2rem", textAlign: "center", padding: "8rem 1.5rem 0" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <SectionLabel>Exclusive for package guests</SectionLabel>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 300, lineHeight: 1.05,
              color: G.text, marginBottom: 16,
            }}>
              Reserve your <br />
              <em style={{
                fontStyle: "italic", fontWeight: 400,
                background: `linear-gradient(135deg,${G.greenPale},${G.greenLight},${G.gold},${G.greenLight})`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmerGold 4s linear infinite",
              }}>private sanctuary.</em>
            </h1>
            <p style={{ color: G.muted, fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 460, margin: "0 auto" }}>
              Complete the form below and our team will confirm your room within 24 hours. No payment required now.
            </p>
          </motion.div>
        </div>

        {/* ── Form card ── */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "3rem auto 6rem", padding: "0 1.5rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              background: "rgba(7,16,9,0.85)",
              border: `1px solid ${G.border}`,
              borderRadius: 28,
              padding: "clamp(2rem,5vw,3.5rem)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(74,148,96,0.05)",
            }}
          >
            {submitted ? (
              <SuccessScreen refId={refId} onBack={() => { setSubmitted(false); setStep(1); setForm(f => ({ ...f })); }} />
            ) : (
              <>
                <StepBar step={step} total={TOTAL_STEPS} />

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                    >
                      <SectionLabel>Step 1 of 3</SectionLabel>
                      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: G.text, marginBottom: 32 }}>
                        Your <em style={{ fontStyle: "italic", color: G.greenPale }}>details</em>
                      </h2>

                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div className="form-grid-2">
                          <FloatingLabel label="First name" required>
                            <input
                              style={{ ...inputStyle, borderColor: errors.firstName ? G.error : G.border }}
                              value={form.firstName}
                              onChange={(e) => set("firstName", e.target.value)}
                              placeholder="Arjun"
                            />
                            {errors.firstName && <span style={{ fontSize: 11, color: G.error }}>{errors.firstName}</span>}
                          </FloatingLabel>
                          <FloatingLabel label="Last name" required>
                            <input
                              style={{ ...inputStyle, borderColor: errors.lastName ? G.error : G.border }}
                              value={form.lastName}
                              onChange={(e) => set("lastName", e.target.value)}
                              placeholder="Nair"
                            />
                            {errors.lastName && <span style={{ fontSize: 11, color: G.error }}>{errors.lastName}</span>}
                          </FloatingLabel>
                        </div>

                        <FloatingLabel label="Email address" required>
                          <input
                            type="email"
                            style={{ ...inputStyle, borderColor: errors.email ? G.error : G.border }}
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@example.com"
                          />
                          {errors.email && <span style={{ fontSize: 11, color: G.error }}>{errors.email}</span>}
                        </FloatingLabel>

                        <div className="form-grid-2">
                          <FloatingLabel label="Phone / WhatsApp" required>
                            <input
                              type="tel"
                              style={{ ...inputStyle, borderColor: errors.phone ? G.error : G.border }}
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                              placeholder="+91 98765 43210"
                            />
                            {errors.phone && <span style={{ fontSize: 11, color: G.error }}>{errors.phone}</span>}
                          </FloatingLabel>
                          <FloatingLabel label="Nationality">
                            <input
                              style={inputStyle}
                              value={form.nationality}
                              onChange={(e) => set("nationality", e.target.value)}
                              placeholder="Indian"
                            />
                          </FloatingLabel>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                    >
                      <SectionLabel>Step 2 of 3</SectionLabel>
                      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: G.text, marginBottom: 28 }}>
                        Your <em style={{ fontStyle: "italic", color: G.greenPale }}>stay</em>
                      </h2>

                      {/* Room picker */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, opacity: 0.75, display: "block", marginBottom: 10 }}>
                          Select a room <span style={{ color: G.gold }}>*</span>
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                          {ROOMS.map((r) => (
                            <button
                              key={r.id}
                              className={`room-option${form.room === r.id ? " selected" : ""}`}
                              onClick={() => set("room", r.id)}
                              style={{
                                background: form.room === r.id ? `${r.accent}18` : "rgba(255,255,255,0.025)",
                                border: `1px solid ${form.room === r.id ? r.accent + "60" : G.border}`,
                                borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                                textAlign: "left", transition: "all 0.2s", position: "relative",
                              }}
                            >
                              {r.badge && (
                                <span style={{ position: "absolute", top: -8, right: 8, background: r.accent, color: G.ink, fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 100 }}>
                                  {r.badge}
                                </span>
                              )}
                              <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{r.icon}</span>
                              <p style={{ fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 2, lineHeight: 1.3 }}>{r.label}</p>
                              <p style={{ fontSize: 11, color: r.accent }}>{r.price}</p>
                            </button>
                          ))}
                        </div>
                        {errors.room && <span style={{ fontSize: 11, color: G.error, display: "block", marginTop: 6 }}>{errors.room}</span>}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <FloatingLabel label="Photography package type" required>
                          <select
                            style={{ ...inputStyle, borderColor: errors.packageType ? G.error : G.border, appearance: "none" }}
                            value={form.packageType}
                            onChange={(e) => set("packageType", e.target.value)}
                          >
                            <option value="">Select your package…</option>
                            {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          {errors.packageType && <span style={{ fontSize: 11, color: G.error }}>{errors.packageType}</span>}
                        </FloatingLabel>

                        <FloatingLabel label="Package reference number" required>
                          <input
                            style={{ ...inputStyle, borderColor: errors.packageRef ? G.error : G.border }}
                            value={form.packageRef}
                            onChange={(e) => set("packageRef", e.target.value)}
                            placeholder="e.g. AV-2025-0312"
                          />
                          {errors.packageRef && <span style={{ fontSize: 11, color: G.error }}>{errors.packageRef}</span>}
                        </FloatingLabel>

                        <div className="form-grid-2">
                          <FloatingLabel label="Check-in date" required>
                            <input
                              type="date"
                              style={{ ...inputStyle, borderColor: errors.checkIn ? G.error : G.border, colorScheme: "dark" }}
                              value={form.checkIn}
                              onChange={(e) => set("checkIn", e.target.value)}
                            />
                            {errors.checkIn && <span style={{ fontSize: 11, color: G.error }}>{errors.checkIn}</span>}
                          </FloatingLabel>
                          <FloatingLabel label="Check-out date" required>
                            <input
                              type="date"
                              style={{ ...inputStyle, borderColor: errors.checkOut ? G.error : G.border, colorScheme: "dark" }}
                              value={form.checkOut}
                              onChange={(e) => set("checkOut", e.target.value)}
                            />
                            {errors.checkOut && <span style={{ fontSize: 11, color: G.error }}>{errors.checkOut}</span>}
                          </FloatingLabel>
                        </div>

                        {nights > 0 && selectedRoom && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            style={{ display: "flex", alignItems: "center", gap: 14, background: `${G.green}08`, border: `1px solid ${G.green}20`, borderRadius: 12, padding: "12px 16px" }}
                          >
                            <span style={{ fontSize: 20 }}>{selectedRoom.icon}</span>
                            <div>
                              <p style={{ fontSize: 13, color: G.text, fontWeight: 600 }}>{selectedRoom.label} · {nights} night{nights > 1 ? "s" : ""}</p>
                              <p style={{ fontSize: 11, color: G.muted }}>{selectedRoom.price} per night</p>
                            </div>
                          </motion.div>
                        )}

                        <div className="form-grid-2">
                          <FloatingLabel label="Number of guests">
                            <select
                              style={{ ...inputStyle, appearance: "none" }}
                              value={form.guests}
                              onChange={(e) => set("guests", e.target.value)}
                            >
                              {["1","2","3","4"].map((n) => <option key={n} value={n}>{n} guest{n !== "1" ? "s" : ""}</option>)}
                            </select>
                          </FloatingLabel>
                          <FloatingLabel label="Meal preference">
                            <select
                              style={{ ...inputStyle, appearance: "none" }}
                              value={form.mealPref}
                              onChange={(e) => set("mealPref", e.target.value)}
                            >
                              <option value="">No preference</option>
                              {MEAL_PREFS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </FloatingLabel>
                        </div>

                        <FloatingLabel label="Special requests or notes">
                          <textarea
                            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                            value={form.specialRequests}
                            onChange={(e) => set("specialRequests", e.target.value)}
                            placeholder="Allergies, accessibility needs, room preferences…"
                          />
                        </FloatingLabel>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.35 }}
                    >
                      <SectionLabel>Step 3 of 3</SectionLabel>
                      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: G.text, marginBottom: 28 }}>
                        Arrival & <em style={{ fontStyle: "italic", color: G.greenPale }}>confirm</em>
                      </h2>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="form-grid-2">
                          <FloatingLabel label="Expected arrival time">
                            <input
                              type="time"
                              style={{ ...inputStyle, colorScheme: "dark" }}
                              value={form.arrivalTime}
                              onChange={(e) => set("arrivalTime", e.target.value)}
                            />
                          </FloatingLabel>
                          <FloatingLabel label="Flight / Train number">
                            <input
                              style={inputStyle}
                              value={form.flightOrTrain}
                              onChange={(e) => set("flightOrTrain", e.target.value)}
                              placeholder="6E 234 / 16305"
                            />
                          </FloatingLabel>
                        </div>

                        <FloatingLabel label="Festival transfer required?">
                          <div style={{ display: "flex", gap: 10 }}>
                            {[["yes","Yes, please"], ["no","No, I'll manage"]].map(([val, lbl]) => (
                              <button
                                key={val}
                                onClick={() => set("wantsTransfer", val)}
                                style={{
                                  flex: 1, background: form.wantsTransfer === val ? `${G.green}18` : "rgba(255,255,255,0.025)",
                                  border: `1px solid ${form.wantsTransfer === val ? G.green + "60" : G.border}`,
                                  borderRadius: 12, padding: "11px 14px", cursor: "pointer",
                                  color: form.wantsTransfer === val ? G.greenPale : G.muted,
                                  fontSize: 13, fontFamily: "'Raleway',sans-serif",
                                  transition: "all 0.2s",
                                }}
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </FloatingLabel>

                        {/* Summary card */}
                        {selectedRoom && (
                          <div style={{ background: `linear-gradient(160deg,${G.green}08,rgba(7,16,9,0.9))`, border: `1px solid ${G.border}`, borderRadius: 18, padding: "20px 22px" }}>
                            <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, marginBottom: 14, opacity: 0.75 }}>Reservation summary</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {[
                                ["Guest",    `${form.firstName} ${form.lastName}`],
                                ["Room",     `${selectedRoom.icon} ${selectedRoom.label}`],
                                ["Dates",    form.checkIn && form.checkOut ? `${form.checkIn} → ${form.checkOut} (${nights}n)` : "—"],
                                ["Package",  form.packageType || "—"],
                                ["Guests",   form.guests],
                                ["Transfer", form.wantsTransfer === "yes" ? "Requested ✓" : "Not needed"],
                              ].map(([label, val]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13, borderBottom: `1px solid ${G.border}`, paddingBottom: 7 }}>
                                  <span style={{ color: G.muted }}>{label}</span>
                                  <span style={{ color: G.text, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Terms */}
                        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                          <div
                            onClick={() => set("agreeTerms", !form.agreeTerms)}
                            style={{
                              width: 20, height: 20, flexShrink: 0,
                              border: `1px solid ${errors.agreeTerms ? G.error : form.agreeTerms ? G.green : G.border}`,
                              borderRadius: 5, background: form.agreeTerms ? `${G.green}30` : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.2s", marginTop: 1,
                            }}
                          >
                            {form.agreeTerms && <span style={{ fontSize: 11, color: G.greenPale }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 12.5, color: G.muted, lineHeight: 1.6 }}>
                            I confirm that I hold an active Aambal Vasantham photography package and agree to the{" "}
                            <a href="#" style={{ color: G.greenPale, textDecoration: "underline" }}>cancellation policy</a>.
                            Rooms are confirmed upon availability and full payment is due on arrival.
                          </span>
                        </label>
                        {errors.agreeTerms && <span style={{ fontSize: 11, color: G.error }}>{errors.agreeTerms}</span>}

                        {errors.submit && (
                          <div style={{ background: `${G.error}12`, border: `1px solid ${G.error}30`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: G.error }}>
                            {errors.submit}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nav buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, gap: 12 }}>
                  <div>
                    {step > 1 && (
                      <button className="btn-back" onClick={prevStep}>← Back</button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: G.muted, letterSpacing: "0.1em" }}>{step} / {TOTAL_STEPS}</span>
                    {step < TOTAL_STEPS ? (
                      <button className="btn-next" onClick={nextStep}>Continue →</button>
                    ) : (
                      <button className="btn-next" onClick={submit} disabled={submitting}>
                        {submitting ? "Submitting…" : "Confirm Reservation 🪷"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Trust badges */}
          {!submitted && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 24, flexWrap: "wrap" }}
            >
              {[
                { icon: "💳", text: "No payment now" },
                { icon: "🔄", text: "Free cancellation (7 days)" },
                { icon: "🔒", text: "Secure & private" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: G.muted }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Footer strip ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: "2rem 1.5rem", background: G.ink, textAlign: "center" }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: G.greenPale, marginBottom: 4 }}>The Aambal Retreat</p>
        <p style={{ fontSize: 11, color: G.muted }}>Kottayam · Kerala · India · Est. 1924</p>
      </footer>
    </>
  );
}
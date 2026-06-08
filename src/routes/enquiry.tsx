import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/enquiry")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: (search.service as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Book a Session · Studio Hut Photography" },
      { name: "description", content: "Enquire and book a photography session at Studio Hut — portraits, weddings, events, newborns, reels, and corporate shoots." },
    ],
  }),
  component: EnquiryPage,
});

// ─── SERVICE DATA ─────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "portrait",
    icon: "📸",
    title: "Portrait Sessions",
    color: "#ff6b6b",
    tagline: "Solo, couple & family portraits",
    duration: "1–2 hours",
    startingAt: "₹3,999",
    desc: "Studio-lit portraits with seamless backdrops, ring lights and professional retouching. Perfect for individuals, couples, and small families.",
    includes: ["Professional studio lighting setup", "Choice of 3 backdrop colours", "Same-day 5 preview images", "Full edited gallery in 48 hrs", "Digital prints, high-resolution"],
    faqs: [
      { q: "How many people can join?", a: "Up to 5 people for a portrait session. For larger groups, book Family & Group." },
      { q: "What should I wear?", a: "We recommend solid colours and avoid busy patterns. Our team shares a style guide before your shoot." },
      { q: "Do I need to bring anything?", a: "Just yourself! We provide all studio equipment, backdrops, and props." },
    ],
  },
  {
    id: "bridal",
    icon: "💍",
    title: "Bridal & Wedding",
    color: "#ffd93d",
    tagline: "Full-day wedding coverage",
    duration: "Full day (8–12 hrs)",
    startingAt: "₹24,999",
    desc: "Full-day bridal coverage from mehendi to reception, indoor & outdoor. Two photographers, cinematic BTS video, and a same-day highlight reel.",
    includes: ["2 professional photographers", "Mehendi to reception coverage", "Cinematic highlight reel (3–5 min)", "Same-day teaser reel before midnight", "500+ edited photos delivered in 5 days", "Private password-protected gallery"],
    faqs: [
      { q: "Do you travel outside Kottayam?", a: "Yes — we cover weddings across Kerala and beyond. Travel fees apply outside a 50km radius." },
      { q: "Is an advance required?", a: "A 30% advance confirms your date. Balance due on the wedding day." },
      { q: "Can we add drone coverage?", a: "Absolutely — drone add-on is ₹6,500 for 90 minutes of aerial footage." },
    ],
  },
  {
    id: "graduation",
    icon: "🎓",
    title: "Graduation & Events",
    color: "#6bcb77",
    tagline: "Milestone moments, beautifully captured",
    duration: "2–6 hours",
    startingAt: "₹7,999",
    desc: "College convocations, corporate events, product launches, and milestone celebrations. We handle logistics, crowd management, and rapid turnaround.",
    includes: ["Event coverage photographer", "Group & individual shots", "Product / stage photography", "Edited gallery in 48 hrs", "Print-ready high-resolution files"],
    faqs: [
      { q: "Can you handle large crowds?", a: "Yes — we regularly cover convocations with 500+ attendees. We scout the venue in advance." },
      { q: "Do you do corporate headshots?", a: "Yes, we offer a dedicated Corporate & Brand package with individual headshots on white or branded backdrops." },
      { q: "How fast is turnaround?", a: "Event galleries are delivered within 48 hours of the event." },
    ],
  },
  {
    id: "newborn",
    icon: "👶",
    title: "Newborn & Kids",
    color: "#4d96ff",
    tagline: "Gentle, warm studio sessions",
    duration: "2–3 hours",
    startingAt: "₹5,999",
    desc: "Gentle, safe newborn posing in our temperature-controlled warm studio. Maternity, newborn (0–14 days), and baby milestone sessions up to 12 months.",
    includes: ["Temperature-controlled studio", "Certified safe posing techniques", "3 backdrop / wrap setups", "Parent & sibling portraits", "Edited gallery of 40+ images in 5 days"],
    faqs: [
      { q: "When is the best time for newborn photos?", a: "Within the first 5–14 days when babies sleep most deeply and are most flexible." },
      { q: "Is it safe?", a: "Absolutely. Our posing is parent-assisted and we never force a pose. Baby's comfort is always first." },
      { q: "How long does the session take?", a: "2–3 hours, allowing time for feeding and settling. We are completely flexible — baby leads the pace." },
    ],
  },
  {
    id: "reels",
    icon: "🎬",
    title: "Reels & Short Films",
    color: "#c77dff",
    tagline: "Social-ready video content",
    duration: "Half day / Full day",
    startingAt: "₹9,999",
    desc: "Social-media reels, product videos and short films produced in-studio. Scripted or unscripted, we handle concept, shoot, and edit.",
    includes: ["Concept & storyboard session", "Studio + on-location options", "Professional lighting & gimbal", "Colour-graded edit with music", "Deliverables in Reels / YouTube / TVC formats"],
    faqs: [
      { q: "Do you handle the script?", a: "Yes — we offer a pre-shoot creative brief session to align on concept, tone, and deliverables." },
      { q: "What formats do you deliver?", a: "9:16 for Reels/Shorts, 16:9 for YouTube, 1:1 for feed — all formats in one package." },
      { q: "Can you shoot on-location?", a: "Absolutely — we shoot in-studio or at your location of choice." },
    ],
  },
  {
    id: "corporate",
    icon: "🏢",
    title: "Corporate & Brand",
    color: "#f4a261",
    tagline: "LinkedIn headshots & brand identity",
    duration: "2–4 hours",
    startingAt: "₹6,999",
    desc: "LinkedIn headshots, brand identity shoots and catalogue photography. We serve startups, agencies, and enterprise teams with consistent professional imagery.",
    includes: ["White / branded backdrop setup", "Individual headshots for up to 10 people", "Brand lifestyle photography", "Product catalogue shots", "Edited gallery in 48 hrs, web + print ready"],
    faqs: [
      { q: "Can you come to our office?", a: "Yes — we offer on-site corporate sessions anywhere in Kottayam and major Kerala cities." },
      { q: "How many headshots per person?", a: "Each person receives 3–5 fully retouched final images to choose from a larger gallery." },
      { q: "Do you sign NDAs?", a: "Yes — we are comfortable signing NDAs for product launches and confidential brand work." },
    ],
  },
];

const DRONE_ADDON = {
  icon: "🚁",
  title: "Drone Aerial Add-on",
  color: "#7dd3fc",
  price: "+ ₹6,500",
  desc: "DGCA-certified 90-minute aerial flight with DJI Mavic 3 Pro. Available with any package.",
};

// ─── ENQUIRY PAGE ─────────────────────────────────────────────────────────────
function EnquiryPage() {
  const { service: preselected } = useSearch({ from: "/enquiry" });
  const [selectedService, setSelectedService] = useState(
    SERVICES.find(s => s.id === preselected)?.id ?? SERVICES[0].id
  );
  const [droneAddon, setDroneAddon] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", date: "", message: "", guests: "1",
  });

  const current = SERVICES.find(s => s.id === selectedService)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", overflowX: "clip" }}>

      {/* ── NAV ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,6,15,0.92)", backdropFilter: "blur(20px)", padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#c8a84a,#ffd93d)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "#0a0a14" }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>Studio Hut</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Photography</div>
          </div>
        </Link>
        <Link to="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "7px 16px" }}>
          ← Back to home
        </Link>
      </div>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 2.5rem 3rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(200,168,74,0.7)", marginBottom: 16 }}>Studio Hut Photography · Book a Session</p>
          <h1 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 400, lineHeight: 0.95, margin: "0 0 16px", color: "white" }}>
            Let's create<br />
            <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#c8a84a,#ffd93d 50%,#ff9a3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              something beautiful.
            </em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", maxWidth: 480, lineHeight: 1.7 }}>
            Choose your session type, tell us what you need, and we'll confirm within 24 hours with a personalised quote and shoot plan.
          </p>
        </motion.div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem 6rem", display: "grid", gridTemplateColumns: "1fr 420px", gap: "4rem", alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div>

          {/* 1. Service selector */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Step 01 — Choose a service</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {SERVICES.map(s => (
                <motion.button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setActiveFaq(null); }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
                    padding: "16px 18px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                    border: selectedService === s.id ? `2px solid ${s.color}` : `1px solid ${s.color}20`,
                    background: selectedService === s.id ? `${s.color}12` : `${s.color}06`,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedService === s.id ? "white" : "rgba(255,255,255,0.6)", marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: selectedService === s.id ? s.color : "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.1em" }}>{s.startingAt}</div>
                  </div>
                  {selectedService === s.id && (
                    <div style={{ width: "100%", height: 2, borderRadius: 1, background: `linear-gradient(90deg,${s.color},transparent)` }} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 2. Selected service detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedService}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              style={{ marginBottom: "3rem" }}
            >
              {/* Service header */}
              <div style={{
                borderRadius: 20, overflow: "hidden",
                border: `1px solid ${current.color}20`,
                background: `linear-gradient(160deg,${current.color}08,rgba(6,6,15,0.95))`,
                marginBottom: 16,
              }}>
                <div style={{ padding: "28px 28px 20px", borderBottom: `1px solid ${current.color}12` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 32 }}>{current.icon}</span>
                      <div>
                        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.6rem", fontWeight: 400, color: "white", margin: 0, lineHeight: 1.1 }}>{current.title}</h2>
                        <p style={{ fontSize: 11, fontFamily: "monospace", color: current.color, letterSpacing: "0.2em", textTransform: "uppercase", margin: "4px 0 0" }}>{current.tagline}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "1.8rem", color: current.color, lineHeight: 1 }}>{current.startingAt}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 3 }}>Starting at</div>
                    </div>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>{current.desc}</p>
                </div>

                {/* What's included */}
                <div style={{ padding: "20px 28px 24px" }}>
                  <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>What's included</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                    {current.includes.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: current.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>✦</span>
                        <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drone add-on */}
              <motion.button
                onClick={() => setDroneAddon(!droneAddon)}
                whileHover={{ y: -1 }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  border: droneAddon ? "2px solid #7dd3fc" : "1px solid rgba(125,211,252,0.18)",
                  background: droneAddon ? "rgba(125,211,252,0.08)" : "rgba(125,211,252,0.03)",
                  transition: "all 0.25s", marginBottom: 24,
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(125,211,252,0.12)", border: "1px solid rgba(125,211,252,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚁</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: droneAddon ? "white" : "rgba(255,255,255,0.55)" }}>Add Drone Aerial Coverage</div>
                  <div style={{ fontSize: 11, color: "rgba(125,211,252,0.6)", marginTop: 2 }}>DGCA-certified · 90 min · DJI Mavic 3 Pro · 4K ProRes</div>
                </div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", color: "#7dd3fc", flexShrink: 0 }}>+ ₹6,500</div>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", border: `2px solid ${droneAddon ? "#7dd3fc" : "rgba(255,255,255,0.2)"}`,
                  background: droneAddon ? "#7dd3fc" : "transparent", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {droneAddon && <span style={{ fontSize: 11, color: "#0a0a14", fontWeight: 900 }}>✓</span>}
                </div>
              </motion.button>

              {/* FAQs */}
              <div>
                <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Common questions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {current.faqs.map((faq, i) => (
                    <div key={i}
                      style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
                      <button
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                          padding: "14px 18px", background: "transparent", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{faq.q}</span>
                        <motion.span animate={{ rotate: activeFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                          style={{ fontSize: 18, color: "rgba(200,168,74,0.6)", flexShrink: 0, lineHeight: 1 }}>+</motion.span>
                      </button>
                      <AnimatePresence>
                        {activeFaq === i && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ overflow: "hidden" }}>
                            <p style={{ padding: "0 18px 16px", fontSize: "0.85rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN — Booking form */}
        <div style={{ position: "sticky", top: 80 }}>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                {/* Summary chip */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                  borderRadius: 100, border: `1px solid ${current.color}30`,
                  background: `${current.color}0a`, marginBottom: 16, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 16 }}>{current.icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{current.title}</span>
                  <span style={{ fontSize: 11, color: current.color, marginLeft: "auto" }}>{current.startingAt}</span>
                  {droneAddon && <span style={{ fontSize: 11, color: "#7dd3fc" }}>+ Drone</span>}
                </div>

                {/* Form card */}
                <div style={{
                  borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)", padding: "28px 28px 24px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle,${current.color}15,transparent 70%)`, pointerEvents: "none", transition: "background 0.4s" }} />

                  <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>Step 02 — Your details</p>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Name */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>Full name *</label>
                      <input
                        required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>WhatsApp / Phone *</label>
                      <input
                        required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98xxx xxxxx"
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>Email</label>
                      <input
                        type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    {/* Date + Guests row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>Preferred date *</label>
                        <input
                          required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box", colorScheme: "dark" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>No. of people</label>
                        <select
                          value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
                          style={{ width: "100%", background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                        >
                          {["1","2","3–5","6–10","10–20","20+"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.1em" }}>Tell us more (optional)</label>
                      <textarea
                        rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Location, special requirements, theme ideas..."
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ background: `linear-gradient(135deg,${current.color},${current.color}bb)`, color: "#0a0a0a", fontWeight: 800, fontSize: 14, padding: "14px 0", borderRadius: 100, border: "none", cursor: "pointer", width: "100%", letterSpacing: "0.05em", marginTop: 4 }}
                    >
                      Send enquiry →
                    </motion.button>

                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6, margin: "4px 0 0" }}>
                      We reply within 24 hours · No spam, ever
                    </p>
                  </form>
                </div>

                {/* WhatsApp CTA */}
                <a href={`https://wa.me/919999999999?text=Hi!%20I%27d%20like%20to%20enquire%20about%20a%20${encodeURIComponent(current.title)}%20session.`}
                  target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, padding: "13px 0", borderRadius: 100, border: "1px solid rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.05)", color: "#4ade80", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.2s" }}>
                  💬 Or message us on WhatsApp
                </a>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                style={{ borderRadius: 24, border: `1px solid ${current.color}25`, background: `${current.color}08`, padding: "3rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
                <h3 style={{ fontFamily: "Georgia,serif", fontSize: "1.8rem", color: "white", fontWeight: 400, marginBottom: 12 }}>Enquiry sent!</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: 24 }}>
                  Thank you, <strong style={{ color: "white" }}>{form.name}</strong>. We've received your enquiry for a <strong style={{ color: current.color }}>{current.title}</strong> session and will reply within 24 hours on WhatsApp or email.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/" style={{ display: "block", padding: "13px", borderRadius: 100, background: `linear-gradient(135deg,${current.color},${current.color}bb)`, color: "#0a0a0a", fontWeight: 800, fontSize: 13, textDecoration: "none", textAlign: "center" }}>
                    Back to Studio Hut →
                  </Link>
                  <button onClick={() => setSubmitted(false)} style={{ padding: "13px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>
                    Submit another enquiry
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── All services at a glance ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2.5rem" }}>
          <p style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 24, textAlign: "center" }}>All services at a glance</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {SERVICES.map(s => (
              <button key={s.id} onClick={() => { setSelectedService(s.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 10px", borderRadius: 14, border: `1px solid ${s.color}15`, background: `${s.color}05`, cursor: "pointer" }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.3 }}>{s.title}</span>
                <span style={{ fontSize: 10, color: s.color, fontFamily: "monospace" }}>{s.startingAt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Studio Hut Photography · Kottayam</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>hello@studiohut.in · +91 98xxx xxxxx</p>
      </div>
    </div>
  );
}
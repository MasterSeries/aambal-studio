// src/routes/homestay.tsx
// Full-page Aambal Retreat experience — cinematic animations, image gallery,
// amenities, room cards, testimonials, booking CTA.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/homestay")({
  head: () => ({
    meta: [
      { title: "The Aambal Retreat · Premium Homestay" },
      { name: "description", content: "A century-old garden villa exclusively for Aambal Vasantham premium package guests. Seven rooms, lotus pond, temple views." },
    ],
  }),
  component: HomestayPage,
});

// ── Tokens ────────────────────────────────────────────────────────────────────
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
  borderGold:"rgba(200,168,74,0.2)",
  surface:   "rgba(255,255,255,0.03)",
};

// ── Data ──────────────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id: "lotus",
    name: "Lotus Suite",
    tagline: "Pond-facing · King bed",
    price: "₹8,500 / night",
    size: "42 sqm",
    icon: "🪷",
    color: G.green,
    features: ["King bed with canopy", "Private balcony over lotus pond", "Claw-foot soaking tub", "Handwoven silk drapes", "Complimentary breakfast"],
    badge: "Most requested",
  },
  {
    id: "temple",
    name: "Temple View Room",
    tagline: "Temple-facing · Queen bed",
    price: "₹6,500 / night",
    size: "34 sqm",
    icon: "🛕",
    color: G.gold,
    features: ["Queen bed with heritage frame", "Floor-to-ceiling temple view", "Rainfall shower", "Traditional Kerala teak floors", "Evening lamp ritual included"],
  },
  {
    id: "garden",
    name: "Garden Cottage",
    tagline: "Private garden · Twin or King",
    price: "₹5,500 / night",
    size: "38 sqm",
    icon: "🌿",
    color: G.greenLight,
    features: ["Twin or King configuration", "Private walled garden", "Outdoor rain shower", "Hammock & swing", "Bicycle to festival included"],
  },
  {
    id: "studio",
    name: "Photographer's Studio",
    tagline: "Edit suite · North light",
    price: "₹7,200 / night",
    size: "55 sqm",
    icon: "📸",
    color: "#a78bfa",
    features: ["North-light edit suite", "Dual 4K monitor setup", "Calibrated display", "Gear drying/charging station", "Soundproof walls for audio edit"],
    badge: "Unique to us",
  },
];

const AMENITIES = [
  { icon: "🍃", title: "Ayurvedic Breakfast", desc: "Kerala breakfast prepared fresh — puttu, kadala, appam, homemade chai." },
  { icon: "🌅", title: "Sunrise Temple Walk", desc: "Guided 45-minute walk to the temple tank at golden hour, every morning." },
  { icon: "🚁", title: "Drone Prep Lounge", desc: "Battery charging wall, flight planning desk, weather-monitoring screens." },
  { icon: "🎞", title: "Edit Suite", desc: "Calibrated iMac + two 4K monitors, 10Gbps NVMe NAS, Lightroom & Resolve licensed." },
  { icon: "🛶", title: "Boat on Lotus Pond", desc: "Private punting boat at dawn — row through the water lilies yourself." },
  { icon: "🌿", title: "Ayurvedic Therapy", desc: "In-house therapist, evening Abhyanga oil massage available on request." },
  { icon: "🏛️", title: "Heritage Library", desc: "300+ volumes on Kerala art, temple architecture, photography & cinema." },
  { icon: "🌙", title: "Rooftop Stargazing", desc: "Telescope and sky maps provided. Dark-sky certified location." },
];

const TESTIMONIALS = [
  {
    name: "Priya & Arun",
    pkg: "Bridal Package",
    text: "We stayed two nights and I genuinely didn't want to leave. The lotus pond at 5am with mist rising — our photographer got a shot we'll frame forever. The edit suite meant we reviewed our photos the same night.",
    stars: 5,
  },
  {
    name: "The Krishnamurthy Family",
    pkg: "Full Day Coverage",
    text: "All 12 of us stayed in three rooms. The breakfast alone was worth it. The hosts know every nuance of the festival schedule — they woke us before the procession started.",
    stars: 5,
  },
  {
    name: "Deepa Nair",
    pkg: "Full Day + Drone",
    text: "As a solo traveller this felt completely safe and extraordinarily peaceful. The temple view room is magical at twilight. Would not cover this festival without staying here.",
    stars: 5,
  },
];

const INCLUSIONS = [
  { icon: "🛏️", label: "1–3 night stay",         note: "Per package tier" },
  { icon: "🍳", label: "Ayurvedic breakfast",    note: "All mornings" },
  { icon: "🚐", label: "Festival transfers",      note: "Morning & evening" },
  { icon: "🎒", label: "Gear safe storage",      note: "24h access" },
  { icon: "💧", label: "Welcome ritual",         note: "Flower bath & chai" },
  { icon: "📶", label: "100 Mbps wifi",          note: "Edit-grade speed" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.62rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, marginBottom: 14, opacity: 0.85 }}>
      ✦ {children} ✦
    </p>
  );
}

function DisplayHeading({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "clamp(2.2rem, 5vw, 4rem)",
      fontWeight: 400, color: G.text, lineHeight: 1.1, margin: 0,
      ...style,
    }}>
      {children}
    </h2>
  );
}

// ── Parallax hero image placeholder ──────────────────────────────────────────
function HeroImagePlaceholder({ style = {} }: { style?: React.CSSProperties }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#071a0a,#0d2b12,#04120a)", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <div style={{ textAlign: "center", opacity: 0.3 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🌿</div>
        <p style={{ color: G.greenLight, fontSize: 12, letterSpacing: "0.2em" }}>ADD YOUR IMAGE HERE</p>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(109,184,122,0.03) 30px,rgba(109,184,122,0.03) 31px)" }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function HomestayPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.08]);

  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [testimonyIdx, setTestimonyIdx] = useState(0);

  // auto-cycle testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonyIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const galleryImages = Array.from({ length: 9 }, (_, i) => i);

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
          33%{transform:translateY(-12px) rotate(5deg)}
          66%{transform:translateY(6px) rotate(-3deg)}
        }
        @keyframes shimmerGold {
          0%{background-position:200% 0} 100%{background-position:-200% 0}
        }
        @keyframes ripple {
          0%{transform:scale(1);opacity:.6} 100%{transform:scale(3);opacity:0}
        }
        @keyframes ambientPulse {
          0%,100%{opacity:.4} 50%{opacity:.7}
        }
        @keyframes textReveal {
          from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)}
        }
        @keyframes lineGrow {
          from{transform:scaleX(0)} to{transform:scaleX(1)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 20px rgba(74,148,96,0.15)} 50%{box-shadow:0 0 50px rgba(74,148,96,0.35)}
        }

        .room-card:hover { transform: translateY(-6px); }
        .amenity-card:hover { border-color: rgba(109,184,122,0.4) !important; background: rgba(109,184,122,0.07) !important; }
      `}</style>

      {/* ── FLOATING NAV ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 100, display: "flex", alignItems: "center", gap: 32,
          background: "rgba(4,13,8,0.85)", backdropFilter: "blur(20px)",
          border: `1px solid ${G.border}`, borderRadius: 100,
          padding: "12px 28px", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em",
        }}
      >
        <Link to="/" style={{ color: G.muted, textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}>← Home</Link>
        {["Rooms", "Amenities", "Gallery", "Reserve"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            style={{ color: G.muted, textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s", fontSize: 11 }}>
            {item}
          </a>
        ))}
        <a href="#reserve" style={{ background: `${G.green}20`, border: `1px solid ${G.green}40`, color: G.greenPale, borderRadius: 100, padding: "6px 16px", textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>
          Reserve
        </a>
      </motion.nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <div ref={heroRef} style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* parallax bg */}
        <motion.div style={{ y: heroY, scale: heroScale, position: "absolute", inset: 0 }}>
          <HeroImagePlaceholder />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,13,8,0.3) 0%, rgba(4,13,8,0.1) 40%, rgba(4,13,8,0.8) 100%)" }} />
        </motion.div>

        {/* floating lotus particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
            fontSize: `${16 + (i % 3) * 8}px`,
            opacity: 0.25,
            animation: `floatLotus ${4 + i * 0.7}s ease-in-out infinite ${i * 0.5}s`,
            pointerEvents: "none",
          }}>🪷</div>
        ))}

        {/* ambient glow circles */}
        <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${G.green}12, transparent 70%)`, animation: "ambientPulse 4s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "25%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${G.gold}10, transparent 70%)`, animation: "ambientPulse 5s ease-in-out infinite 1s", pointerEvents: "none" }} />

        {/* hero content */}
        <motion.div style={{ opacity: heroOpacity, position: "relative", textAlign: "center", padding: "0 1.5rem", maxWidth: 900 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: "0.65rem", letterSpacing: "0.45em", textTransform: "uppercase", color: G.greenPale, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            <span style={{ width: 30, height: 1, background: G.greenLight, display: "inline-block" }} />
            The Aambal Retreat · Kottayam · Kerala
            <span style={{ width: 30, height: 1, background: G.greenLight, display: "inline-block" }} />
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 9vw, 7rem)", fontWeight: 300, lineHeight: 1, color: G.text, marginBottom: 24 }}
          >
            Where the festival<br />
            <em style={{
              fontStyle: "italic", fontWeight: 400,
              background: `linear-gradient(135deg, ${G.greenPale}, ${G.greenLight}, ${G.gold}, ${G.greenLight})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmerGold 4s linear infinite",
            }}>comes to rest.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
            style={{ fontSize: "1.1rem", color: "rgba(240,237,230,0.6)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}
          >
            A heritage garden villa, exclusively for our premium photography guests. Seven rooms. One lotus pond. Ten minutes from the temple.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="#rooms" style={{ background: `linear-gradient(135deg,${G.green},${G.greenLight})`, color: "#fff", borderRadius: 100, padding: "14px 32px", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", boxShadow: `0 8px 30px ${G.green}40` }}>
              View rooms
            </a>
            <a href="#amenities" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "14px 32px", textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.06em", backdropFilter: "blur(8px)" }}>
              Explore amenities →
            </a>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontSize: 10, letterSpacing: "0.3em", color: G.muted, textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom,${G.greenLight},transparent)`, animation: "fadeUp 2s ease-in-out infinite" }} />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          INCLUSION STRIP
      ══════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(90deg,${G.green}08,${G.gold}06,${G.green}08)`, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, padding: "1.5rem 0", overflow: "hidden" }}>
        <motion.div
          initial={{ x: 0 }} animate={{ x: "-50%" }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          style={{ display: "flex", gap: 40, whiteSpace: "nowrap", width: "max-content" }}
        >
          {[...INCLUSIONS, ...INCLUSIONS].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: G.text, letterSpacing: "0.08em" }}>{item.label}</span>
              <span style={{ fontSize: 11, color: G.muted }}>— {item.note}</span>
              <span style={{ color: G.border, margin: "0 8px" }}>✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════ */}
      <section style={{ padding: "8rem 1.5rem", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "5rem", alignItems: "center" }}>

        {/* left text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
        >
          <SectionLabel>About the Retreat</SectionLabel>
          <DisplayHeading>
            A century lived in<br />
            <em style={{ fontStyle: "italic", color: G.greenPale }}>ceremony & stillness.</em>
          </DisplayHeading>
          <div style={{ width: 50, height: 1, background: `linear-gradient(90deg,${G.green},transparent)`, margin: "24px 0", animation: "lineGrow 1s ease both" }} />
          <p style={{ color: G.muted, lineHeight: 1.9, marginBottom: 20, fontSize: "0.95rem" }}>
            Built in 1924 by the Pillai family as a spice-trader's mansion, the Aambal Retreat has witnessed a century of Vasantham festivals from its verandas. We restored it with the same patience that governs the festival itself — slowly, reverently, leaving the original Travancore teak and lime-plaster walls intact.
          </p>
          <p style={{ color: G.muted, lineHeight: 1.9, fontSize: "0.95rem" }}>
            Today seven rooms house photographers, families, and couples who want the festival not just as visitors, but as participants — people who smell the lotus before the gates open.
          </p>
        </motion.div>

        {/* right — stacked image grid */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "200px 200px", gap: 12, position: "relative" }}
        >
          {[
            { gridArea: "1/1/2/2", emoji: "🌿", label: "Garden courtyard" },
            { gridArea: "1/2/3/3", emoji: "🪷", label: "Lotus pond" },
            { gridArea: "2/1/3/2", emoji: "🛕", label: "Temple view" },
          ].map((cell, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              style={{
                gridArea: cell.gridArea, borderRadius: 18,
                background: `linear-gradient(160deg,${G.ink3},${G.ink2})`,
                border: `1px solid ${G.border}`, overflow: "hidden",
                position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 48, opacity: 0.35, animation: `floatLotus ${3 + i}s ease-in-out infinite` }}>{cell.emoji}</span>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(45deg,transparent,rgba(109,184,122,0.03))" }} />
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: G.greenPale, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>{cell.label}</div>
              {/* corner marks */}
              <div style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, borderTop: `1.5px solid ${G.greenLight}50`, borderRight: `1.5px solid ${G.greenLight}50` }} />
              <div style={{ position: "absolute", bottom: 10, left: 10, width: 14, height: 14, borderBottom: `1.5px solid ${G.gold}50`, borderLeft: `1.5px solid ${G.gold}50` }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          ROOMS
      ══════════════════════════════════════════ */}
      <section id="rooms" style={{ padding: "6rem 1.5rem", background: `linear-gradient(180deg,${G.ink} 0%,${G.ink2} 50%,${G.ink} 100%)` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ textAlign: "center", marginBottom: "4rem" }}
          >
            <SectionLabel>Accommodation</SectionLabel>
            <DisplayHeading>
              Seven rooms, <em style={{ fontStyle: "italic", color: G.greenPale }}>seven stories.</em>
            </DisplayHeading>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "1.25rem" }}>
            {ROOMS.map((room, i) => (
              <motion.div
                key={room.id}
                className="room-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                onClick={() => setActiveRoom(activeRoom === room.id ? null : room.id)}
                style={{
                  background: `linear-gradient(160deg,${room.color}10 0%,rgba(7,16,9,0.97) 60%)`,
                  border: `1px solid ${room.color}30`,
                  borderRadius: 22, padding: "2rem 1.75rem",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  boxShadow: activeRoom === room.id ? `0 0 50px ${room.color}20, 0 24px 60px rgba(0,0,0,0.6)` : "0 16px 40px rgba(0,0,0,0.45)",
                  animation: "glowPulse 4s ease-in-out infinite",
                }}
              >
                {room.badge && (
                  <span style={{ position: "absolute", top: 16, right: 16, background: room.color, color: "#050d06", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100 }}>
                    {room.badge}
                  </span>
                )}

                {/* glow corner */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at top right,${room.color}15,transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ fontSize: 36, marginBottom: 16, animation: `floatLotus 3s ease-in-out infinite ${i * 0.4}s` }}>{room.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", fontWeight: 400, color: G.text, marginBottom: 4 }}>{room.name}</h3>
                <p style={{ color: room.color, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", marginBottom: 6 }}>{room.tagline}</p>
                <p style={{ fontSize: 11, color: G.muted, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>{room.size}</p>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: room.color, marginBottom: 20 }}>{room.price}</div>

                <AnimatePresence>
                  {activeRoom === room.id && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      style={{ listStyle: "none", padding: 0, marginBottom: 20, overflow: "hidden" }}
                    >
                      {room.features.map((f, fi) => (
                        <motion.li key={fi} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: fi * 0.06 }}
                          style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.05)`, fontSize: 13, color: G.muted }}>
                          <span style={{ color: room.color, flexShrink: 0, marginTop: 1 }}>✦</span> {f}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: room.color, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                  <span>{activeRoom === room.id ? "Hide details ↑" : "See details ↓"}</span>
                  <a href="#reserve" onClick={e => e.stopPropagation()} style={{ background: `${room.color}18`, border: `1px solid ${room.color}35`, color: room.color, borderRadius: 100, padding: "6px 16px", textDecoration: "none", fontSize: 12 }}>
                    Reserve
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AMENITIES
      ══════════════════════════════════════════ */}
      <section id="amenities" style={{ padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, background: `radial-gradient(ellipse,${G.green}07,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}
          >
            <SectionLabel>What awaits you</SectionLabel>
            <DisplayHeading>
              Every morning a <em style={{ fontStyle: "italic", color: G.greenPale }}>small ceremony.</em>
            </DisplayHeading>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem" }}>
            {AMENITIES.map((a, i) => (
              <motion.div
                key={a.title}
                className="amenity-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${G.border}`,
                  borderRadius: 18, padding: "1.5rem",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{a.icon}</div>
                <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", color: G.text, marginBottom: 8, fontWeight: 500 }}>{a.title}</h4>
                <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.65 }}>{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHOTO GALLERY
      ══════════════════════════════════════════ */}
      <section id="gallery" style={{ padding: "6rem 1.5rem", background: G.ink2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <SectionLabel>Gallery</SectionLabel>
            <DisplayHeading>
              The retreat <em style={{ fontStyle: "italic", color: G.greenPale }}>in every light.</em>
            </DisplayHeading>
            <p style={{ color: G.muted, marginTop: 16, fontSize: "0.9rem" }}>Replace placeholders with your actual homestay photography</p>
          </motion.div>

          {/* masonry-style grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {galleryImages.map((_, i) => {
              const tall = i % 5 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  whileHover={{ scale: 1.02, zIndex: 2 }}
                  style={{
                    gridRow: tall ? "span 2" : "span 1",
                    aspectRatio: tall ? "3/5" : "4/3",
                    borderRadius: 16, overflow: "hidden",
                    border: `1px solid ${G.border}`,
                    cursor: "pointer", position: "relative",
                    transition: "transform 0.25s",
                  }}
                  onClick={() => setGalleryIdx(i)}
                >
                  <HeroImagePlaceholder />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(4,13,8,0.5),transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, color: G.greenPale, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>
                    {["Lotus pond","Temple view","Garden","Suite","Breakfast","Corridor","Courtyard","Drone prep","Rooftop"][i % 9]}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(109,184,122,0.02) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(109,184,122,0.02) 61px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <SectionLabel>Guest voices</SectionLabel>
          <DisplayHeading style={{ marginBottom: "3rem" }}>
            <em style={{ fontStyle: "italic", color: G.greenPale }}>Heard at checkout.</em>
          </DisplayHeading>

          <AnimatePresence mode="wait">
            <motion.div key={testimonyIdx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                background: `linear-gradient(160deg,${G.green}08,rgba(7,16,9,0.95) 100%)`,
                border: `1px solid ${G.border}`, borderRadius: 24, padding: "3rem 2.5rem",
              }}
            >
              <div style={{ fontSize: 20, letterSpacing: 4, color: G.gold, marginBottom: 20 }}>
                {"★".repeat(TESTIMONIALS[testimonyIdx].stars)}
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontStyle: "italic", color: G.text, lineHeight: 1.7, marginBottom: 24 }}>
                "{TESTIMONIALS[testimonyIdx].text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${G.green}20`, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", color: G.greenPale, fontSize: 14 }}>
                  {TESTIMONIALS[testimonyIdx].name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{TESTIMONIALS[testimonyIdx].name}</p>
                  <p style={{ fontSize: 11, color: G.greenPale, letterSpacing: "0.1em" }}>{TESTIMONIALS[testimonyIdx].pkg}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonyIdx(i)}
                style={{ width: i === testimonyIdx ? 20 : 6, height: 6, borderRadius: 3, border: "none", background: i === testimonyIdx ? G.greenLight : G.border, transition: "all 0.3s", cursor: "pointer" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAP / LOCATION
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem 1.5rem", background: G.ink2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionLabel>How to find us</SectionLabel>
            <DisplayHeading style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
              Ten minutes from<br /><em style={{ color: G.greenPale }}>everywhere that matters.</em>
            </DisplayHeading>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "🛕", label: "Main temple tank", dist: "800 m · 10 min walk" },
                { icon: "🚂", label: "Kottayam railway station", dist: "4 km · 8 min drive" },
                { icon: "✈️", label: "Cochin International Airport", dist: "74 km · 90 min drive" },
                { icon: "🏥", label: "KIMS Hospital", dist: "2 km · emergency" },
              ].map(({ icon, label, dist }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 16px" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: 11, color: G.muted }}>{dist}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* map placeholder */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ height: 380, borderRadius: 22, overflow: "hidden", border: `1px solid ${G.border}`, position: "relative" }}>
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg,${G.ink3},#071a09)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 48, opacity: 0.4 }}>🗺️</span>
              <p style={{ color: G.muted, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Embed Google Maps here</p>
            </div>
            {/* ripple effect */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: G.greenLight }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ position: "absolute", inset: -i*12, borderRadius: "50%", border: `1px solid ${G.greenLight}`, animation: `ripple 2s ease-out infinite ${i * 0.6}s` }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RESERVE CTA
      ══════════════════════════════════════════ */}
      <section id="reserve" style={{ padding: "8rem 1.5rem", position: "relative", overflow: "hidden" }}>
        {/* dramatic bg */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%,${G.green}12 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}05 80px)`, pointerEvents: "none" }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}
        >
          <div style={{ fontSize: 52, marginBottom: 24, animation: "floatLotus 4s ease-in-out infinite" }}>🪷</div>
          <SectionLabel>Reserve your stay</SectionLabel>
          <DisplayHeading style={{ marginBottom: 20 }}>
            Only <em style={{ color: G.greenPale }}>Full Day & Bridal</em><br />guests may book.
          </DisplayHeading>
          <p style={{ color: G.muted, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px", fontSize: "0.95rem" }}>
            Confirm your photography package first, then reach us on WhatsApp with your package reference number to reserve a room. Rooms fill each festival season by April.
          </p>

          {/* info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { icon: "💳", label: "No payment now",  note: "Settle on arrival" },
              { icon: "🔄", label: "Free cancellation", note: "Up to 7 days prior" },
              { icon: "🎁", label: "Breakfast included", note: "All mornings" },
              { icon: "🚐", label: "Free festival transfer", note: "Both directions" },
            ].map(({ icon, label, note }) => (
              <div key={label} style={{ background: `${G.green}08`, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 11, color: G.muted }}>{note}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/919800000000?text=Hi%2C%20I%27d%20like%20to%20reserve%20a%20room%20at%20the%20Aambal%20Retreat"
              target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg,#1a7a40,#25a244)",
                color: "#fff", borderRadius: 100, padding: "16px 32px",
                textDecoration: "none", fontWeight: 600, fontSize: "0.95rem",
                letterSpacing: "0.06em", boxShadow: "0 8px 30px rgba(37,162,68,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Reserve on WhatsApp
            </a>
            <a
  href="/#book"
  style={{
    border: `1px solid ${G.border}`,
    color: G.muted,
    borderRadius: 100,
    padding: "16px 28px",
    textDecoration: "none",
    fontSize: "0.9rem",
    letterSpacing: "0.06em",
  }}
>
  Book Now
</a>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: "3rem 1.5rem", background: G.ink }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: G.greenPale }}>The Aambal Retreat</p>
            <p style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>Kottayam · Kerala · India · Est. 1924</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: G.muted }}>
            <p>hello@aambalstudio.in</p>
            <p>+91 98xxx xxxxx</p>
            <Link to="/" style={{ color: G.greenPale, textDecoration: "none", fontSize: 12, marginTop: 8, display: "inline-block" }}>← Back to Studio</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
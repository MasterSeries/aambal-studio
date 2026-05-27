// src/routes/homestay.tsx
// Full-page Aambal Retreat experience — every section driven by CMS data from
// Firestore. Click any section to post a SELECT_SECTION message to the parent
// editor shell. Responds to SCROLL_TO_SECTION from the editor.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";




export const Route = createFileRoute("/homestay")({
  head: () => ({
    meta: [
      { title: "The Aambal Retreat · Premium Homestay" },
      { name: "description", content: "A century-old garden villa exclusively for Aambal Vasantham premium package guests." },
    ],
  }),
  component: HomestayPage,
});

// ── Design tokens ──────────────────────────────────────────────────────────────
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
};

// ── Static data ────────────────────────────────────────────────────────────────
const STATIC_AMENITIES = [
  { icon: "🍃", title: "Ayurvedic Breakfast",  desc: "Kerala breakfast prepared fresh — puttu, kadala, appam, homemade chai." },
  { icon: "🌅", title: "Sunrise Temple Walk",  desc: "Guided 45-minute walk to the temple tank at golden hour, every morning." },
  { icon: "🚁", title: "Drone Prep Lounge",    desc: "Battery charging wall, flight planning desk, weather-monitoring screens." },
  { icon: "🎞", title: "Edit Suite",           desc: "Calibrated iMac + two 4K monitors, 10Gbps NVMe NAS, Lightroom & Resolve licensed." },
  { icon: "🛶", title: "Boat on Lotus Pond",   desc: "Private punting boat at dawn — row through the water lilies yourself." },
  { icon: "🌿", title: "Ayurvedic Therapy",    desc: "In-house therapist, evening Abhyanga oil massage available on request." },
  { icon: "🏛️", title: "Heritage Library",     desc: "300+ volumes on Kerala art, temple architecture, photography & cinema." },
  { icon: "🌙", title: "Rooftop Stargazing",   desc: "Telescope and sky maps provided. Dark-sky certified location." },
];

const CTA_PERKS = [
  { icon: "💳", label: "No payment now",       note: "Settle on arrival" },
  { icon: "🔄", label: "Free cancellation",    note: "Up to 7 days prior" },
  { icon: "🎁", label: "Breakfast included",   note: "All mornings" },
  { icon: "🚐", label: "Free festival transfer",note: "Both directions" },
];

// ── Shared micro components ────────────────────────────────────────────────────
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

// Falls back to a decorative placeholder when no image is set
function ImageBg({ src, style = {} }: { src?: string; style?: React.CSSProperties }) {
  if (src) {
    return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />;
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(160deg,#071a0a,#0d2b12,#04120a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", ...style,
    }}>
      <div style={{ textAlign: "center", opacity: 0.3 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🌿</div>
        <p style={{ color: G.greenLight, fontSize: 11, letterSpacing: "0.2em" }}>ADD IMAGE IN CMS</p>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(109,184,122,0.03) 30px,rgba(109,184,122,0.03) 31px)" }} />
    </div>
  );
}

// Wraps a section so clicking it in iframe context notifies the editor
function EditableSection({
  id, children, style = {},
}: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const handleClick = () => {
    try { window.parent.postMessage({ type: "SELECT_SECTION", section: id }, "*"); } catch {}
  };
  return (
    <section
      id={`section-${id}`}
      onClick={handleClick}
      style={{
        position: "relative", cursor: "default",
        outline: "2px solid transparent", transition: "outline-color .2s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.outlineColor = `${G.green}50`)}
      onMouseLeave={(e) => (e.currentTarget.style.outlineColor = "transparent")}
    >
      {children}
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomestayPage() {
  
  const [cms, setCms] = useState<Record<string, any>>({});

  // Live Firestore subscription
  useEffect(() => {

  const unsub =
    onSnapshot(
      doc(
        db,
        "homestayContent",
        "main"
      ),

      (snap) => {

        if (snap.exists()) {
          setCms(snap.data());
        }

      }
    );

  return () => unsub();

}, []);

  // Scroll-to-section from editor
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.type === "SCROLL_TO_SECTION") {
        document.getElementById(`section-${e.data.section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  // Parallax hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(heroScroll, [0, 1], [0, 180]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale   = useTransform(heroScroll, [0, 1], [1, 1.08]);

  // Room expand
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  // Testimonial ticker
  const testimonials = [
    { text: cms.t1Text, name: cms.t1Name, pkg: cms.t1Pkg },
    { text: cms.t2Text, name: cms.t2Name, pkg: cms.t2Pkg },
    { text: cms.t3Text, name: cms.t3Name, pkg: cms.t3Pkg },
  ].filter((t) => t.text && t.name);
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setTIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  // Rooms config (4 rooms, overridable from CMS)
  const ROOMS = [1, 2, 3, 4].map((i) => ({
    id: String(i),
    name:    cms[`room${i}Name`]    ?? ["Lotus Suite","Temple View Room","Garden Cottage","Photographer's Studio"][i-1],
    tagline: cms[`room${i}Tagline`] ?? ["Pond-facing · King bed","Temple-facing · Queen bed","Private garden · Twin or King","Edit suite · North light"][i-1],
    price:   cms[`room${i}Price`]   ?? ["₹8,500 / night","₹6,500 / night","₹5,500 / night","₹7,200 / night"][i-1],
    icon:    cms[`room${i}Icon`]    ?? ["🪷","🛕","🌿","📸"][i-1],
    accent:  cms[`room${i}Accent`]  ?? ["#4a9460","#c8a84a","#6db87a","#a78bfa"][i-1],
    image:   cms[`room${i}Image`]   ?? "",
    features:[
      ["King bed with canopy","Private balcony over lotus pond","Claw-foot soaking tub","Complimentary breakfast"],
      ["Queen bed with heritage frame","Floor-to-ceiling temple view","Rainfall shower","Evening lamp ritual included"],
      ["Twin or King configuration","Private walled garden","Outdoor rain shower","Bicycle to festival included"],
      ["North-light edit suite","Dual 4K monitor setup","Calibrated display","Soundproof walls for audio edit"],
    ][i-1],
    badge: i === 1 ? "Most requested" : i === 4 ? "Unique to us" : undefined,
  }));

  const locationItems = [1, 2, 3, 4].map((i) => ({
    icon: cms[`loc${i}Icon`] ?? ["🛕","🚂","✈️","🏥"][i-1],
    name: cms[`loc${i}Name`] ?? ["Main temple tank","Kottayam railway station","Cochin International Airport","KIMS Hospital"][i-1],
    dist: cms[`loc${i}Dist`] ?? ["800 m · 10 min walk","4 km · 8 min drive","74 km · 90 min drive","2 km · emergency"][i-1],
  }));

  // Helpers to split multi-line CMS headings
  const splitHeading = (raw: string, fallback: string) => {
    const str = raw || fallback;
    const [line1, ...rest] = str.split("\n");
    return { line1: line1 ?? str, line2: rest.join(" ") };
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
        @keyframes lineGrow {
          from{transform:scaleX(0)} to{transform:scaleX(1)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 20px rgba(74,148,96,0.15)} 50%{box-shadow:0 0 50px rgba(74,148,96,0.35)}
        }
        .room-card { transition: transform 0.25s, box-shadow 0.25s; }
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
          border: `1px solid ${G.border}`, borderRadius: 100, padding: "12px 28px",
          fontSize: 12, fontWeight: 500, letterSpacing: "0.12em",
        }}
      >
        <Link to="/" style={{ color: G.muted, textDecoration: "none", textTransform: "uppercase", fontSize: 11 }}>← Home</Link>
        {["Rooms", "Amenities", "Gallery", "Reserve"].map((item) => (
          <a key={item} href={`#section-${item.toLowerCase()}`} style={{ color: G.muted, textDecoration: "none", textTransform: "uppercase", fontSize: 11, transition: "color 0.2s" }}>
            {item}
          </a>
        ))}
        <a href="#section-cta" style={{ background: `${G.green}20`, border: `1px solid ${G.green}40`, color: G.greenPale, borderRadius: 100, padding: "6px 16px", textDecoration: "none", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>
          Reserve
        </a>
      </motion.nav>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <div
        id="section-hero"
        ref={heroRef}
        style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}
        onClick={() => { try { window.parent.postMessage({ type: "SELECT_SECTION", section: "hero" }, "*"); } catch {} }}
        onMouseEnter={(e) => (e.currentTarget.style.outline = `2px solid ${G.green}50`)}
        onMouseLeave={(e) => (e.currentTarget.style.outline = "2px solid transparent")}
      >
        {/* BG */}
        <motion.div style={{ y: heroY, scale: heroScale, position: "absolute", inset: 0 }}>
          <ImageBg src={cms.heroImage} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(4,13,8,0.3) 0%, rgba(4,13,8,0.1) 40%, ${cms.heroBg || "rgba(4,13,8,0.8)"} 100%)` }} />
        </motion.div>

        {/* Floating lotus */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 25}%`, fontSize: `${16 + (i % 3) * 8}px`, opacity: 0.25, animation: `floatLotus ${4 + i * 0.7}s ease-in-out infinite ${i * 0.5}s`, pointerEvents: "none" }}>🪷</div>
        ))}

        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "20%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${G.green}12, transparent 70%)`, animation: "ambientPulse 4s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "25%", right: "10%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${G.gold}10, transparent 70%)`, animation: "ambientPulse 5s ease-in-out infinite 1s", pointerEvents: "none" }} />

        {/* Content */}
        <motion.div style={{ opacity: heroOpacity, position: "relative", textAlign: "center", padding: "0 1.5rem", maxWidth: 900 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: "0.65rem", letterSpacing: "0.45em", textTransform: "uppercase", color: G.greenPale, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            <span style={{ width: 30, height: 1, background: G.greenLight, display: "inline-block" }} />
            {cms.heroEyebrow || "The Aambal Retreat · Kottayam · Kerala"}
            <span style={{ width: 30, height: 1, background: G.greenLight, display: "inline-block" }} />
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 9vw, 7rem)", fontWeight: 300, lineHeight: 1, color: G.text, marginBottom: 24 }}
          >
            {cms.heroTitle ? (
              <span dangerouslySetInnerHTML={{ __html: cms.heroTitle.replace(/\n/g, "<br />") }} />
            ) : (
              <>Where the festival <br />
                <em style={{ fontStyle: "italic", fontWeight: 400, background: `linear-gradient(135deg, ${G.greenPale}, ${G.greenLight}, ${G.gold}, ${G.greenLight})`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmerGold 4s linear infinite" }}>comes to rest.</em>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
            style={{ fontSize: "1.1rem", color: "rgba(240,237,230,0.6)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}
          >
            {cms.heroSubtitle || "A heritage garden villa, exclusively for our premium photography guests. Seven rooms. One lotus pond. Ten minutes from the temple."}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#section-rooms" style={{ background: `linear-gradient(135deg, ${cms.heroBtn1Color || G.green}, ${G.greenLight})`, color: "#fff", borderRadius: 100, padding: "14px 32px", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", boxShadow: `0 8px 30px ${G.green}40` }}>
              {cms.heroBtn1Text || "View rooms"}
            </a>
            <a href="#section-amenities" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "14px 32px", textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.06em", backdropFilter: "blur(8px)" }}>
              {cms.heroBtn2Text || "Explore amenities →"}
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", color: G.muted, textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom,${G.greenLight},transparent)`, animation: "fadeUp 2s ease-in-out infinite" }} />
        </motion.div>
      </div>

      {/* ══════════════════════════════
          INCLUSION STRIP
      ══════════════════════════════ */}
      {cms.stripVisible !== false && (
        <EditableSection id="strip" style={{ background: cms.stripBg || `linear-gradient(90deg,${G.green}08,${G.gold}06,${G.green}08)`, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, padding: "1.5rem 0", overflow: "hidden" }}>
          <motion.div
            initial={{ x: 0 }} animate={{ x: "-50%" }}
            transition={{ duration: Number(cms.stripSpeed) || 30, ease: "linear", repeat: Infinity }}
            style={{ display: "flex", gap: 40, whiteSpace: "nowrap", width: "max-content" }}
          >
            {[...Array(2)].flatMap(() =>
              [
                { icon: "🛏️", label: "1–3 night stay",       note: "Per package tier" },
                { icon: "🍳", label: "Ayurvedic breakfast",  note: "All mornings" },
                { icon: "🚐", label: "Festival transfers",   note: "Morning & evening" },
                { icon: "🎒", label: "Gear safe storage",    note: "24h access" },
                { icon: "💧", label: "Welcome ritual",       note: "Flower bath & chai" },
                { icon: "📶", label: "100 Mbps wifi",        note: "Edit-grade speed" },
              ]
            ).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: G.text, letterSpacing: "0.08em" }}>{item.label}</span>
                <span style={{ fontSize: 11, color: G.muted }}>— {item.note}</span>
                <span style={{ color: G.border, margin: "0 8px" }}>✦</span>
              </div>
            ))}
          </motion.div>
        </EditableSection>
      )}

      {/* ══════════════════════════════
          ABOUT
      ══════════════════════════════ */}
      <EditableSection id="about" style={{ padding: "8rem 1.5rem", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "5rem", alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <SectionLabel>About the Retreat</SectionLabel>
          {(() => {
            const { line1, line2 } = splitHeading(cms.aboutTitle, "A century lived in\nceremony & stillness.");
            return (
              <DisplayHeading>
                {line1}<br /><em style={{ fontStyle: "italic", color: cms.aboutAccent || G.greenPale }}>{line2}</em>
              </DisplayHeading>
            );
          })()}
          <div style={{ width: 50, height: 1, background: `linear-gradient(90deg,${cms.aboutAccent || G.green},transparent)`, margin: "24px 0", animation: "lineGrow 1s ease both" }} />
          {cms.aboutImage && <img src={cms.aboutImage} alt="" style={{ width: "100%", borderRadius: 16, maxHeight: 180, objectFit: "cover", marginBottom: 20 }} />}
          <p style={{ color: G.muted, lineHeight: 1.9, fontSize: "0.95rem", whiteSpace: "pre-line" }}>
            {cms.aboutText || "Built in 1924 by the Pillai family as a spice-trader's mansion, the Aambal Retreat has witnessed a century of Vasantham festivals from its verandas."}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "200px 200px", gap: 12 }}>
          {[
            { gridArea: "1/1/2/2", emoji: "🌿", label: "Garden courtyard" },
            { gridArea: "1/2/3/3", emoji: "🪷", label: "Lotus pond" },
            { gridArea: "2/1/3/2", emoji: "🛕", label: "Temple view" },
          ].map((cell, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              style={{ gridArea: cell.gridArea, borderRadius: 18, background: `linear-gradient(160deg,${G.ink3},${G.ink2})`, border: `1px solid ${G.border}`, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ fontSize: 48, opacity: 0.35, animation: `floatLotus ${3 + i}s ease-in-out infinite` }}>{cell.emoji}</span>
              <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 10, color: G.greenPale, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>{cell.label}</div>
              <div style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, borderTop: `1.5px solid ${G.greenLight}50`, borderRight: `1.5px solid ${G.greenLight}50` }} />
              <div style={{ position: "absolute", bottom: 10, left: 10, width: 14, height: 14, borderBottom: `1.5px solid ${G.gold}50`, borderLeft: `1.5px solid ${G.gold}50` }} />
            </motion.div>
          ))}
        </motion.div>
      </EditableSection>

      {/* ══════════════════════════════
          ROOMS
      ══════════════════════════════ */}
      <EditableSection id="rooms" style={{ padding: "6rem 1.5rem", background: `linear-gradient(180deg,${G.ink} 0%,${G.ink2} 50%,${G.ink} 100%)` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionLabel>{cms.roomsLabel || "Accommodation"}</SectionLabel>
            {(() => {
              const h = cms.roomsHeading || "Seven rooms, seven stories.";
              const parts = h.split(",");
              return (
                <DisplayHeading>
                  {parts[0]}{parts[1] ? <>,<em style={{ fontStyle: "italic", color: G.greenPale }}>{parts[1]}</em></> : null}
                </DisplayHeading>
              );
            })()}
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
                onClick={(e) => { e.stopPropagation(); setActiveRoom(activeRoom === room.id ? null : room.id); }}
                style={{
                  background: room.image
                    ? `linear-gradient(to top, rgba(7,16,9,0.98) 30%, rgba(7,16,9,0.6)), url(${room.image}) center/cover`
                    : `linear-gradient(160deg,${room.accent}10 0%,rgba(7,16,9,0.97) 60%)`,
                  border: `1px solid ${room.accent}30`, borderRadius: 22, padding: "2rem 1.75rem",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  boxShadow: activeRoom === room.id ? `0 0 50px ${room.accent}20, 0 24px 60px rgba(0,0,0,0.6)` : "0 16px 40px rgba(0,0,0,0.45)",
                  animation: room.image ? "none" : "glowPulse 4s ease-in-out infinite",
                }}
              >
                {room.badge && (
                  <span style={{ position: "absolute", top: 16, right: 16, background: room.accent, color: "#050d06", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, zIndex: 2 }}>
                    {room.badge}
                  </span>
                )}
                <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at top right,${room.accent}15,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div style={{ fontSize: 36, marginBottom: 16, animation: `floatLotus ${3 + i * 0.4}s ease-in-out infinite` }}>{room.icon}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", fontWeight: 400, color: G.text, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{room.name}</h3>
                  <p style={{ color: room.accent, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", fontSize: "0.9rem", marginBottom: 6 }}>{room.tagline}</p>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: room.accent, marginBottom: 20 }}>{room.price}</div>

                  <AnimatePresence>
                    {activeRoom === room.id && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ listStyle: "none", padding: 0, marginBottom: 20, overflow: "hidden" }}
                      >
                        {room.features.map((f, fi) => (
                          <motion.li
                            key={fi}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: fi * 0.06 }}
                            style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.05)`, fontSize: 13, color: G.muted, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                          >
                            <span style={{ color: room.accent, flexShrink: 0, marginTop: 1 }}>✦</span> {f}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: room.accent, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                    <span>{activeRoom === room.id ? "Hide details ↑" : "See details ↓"}</span>
                    <a href="#section-cta" onClick={(e) => e.stopPropagation()} style={{ background: `${room.accent}18`, border: `1px solid ${room.accent}35`, color: room.accent, borderRadius: 100, padding: "6px 16px", textDecoration: "none", fontSize: 12, backdropFilter: "blur(4px)" }}>
                      Reserve
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </EditableSection>

      {/* ══════════════════════════════
          AMENITIES
      ══════════════════════════════ */}
      <EditableSection id="amenities" style={{ padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, background: `radial-gradient(ellipse,${G.green}07,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SectionLabel>{cms.amenitiesLabel || "What awaits you"}</SectionLabel>
            {(() => {
              const { line1, line2 } = splitHeading(cms.amenitiesHeading, "Every morning a\nsmall ceremony.");
              return (
                <DisplayHeading>
                  {line1}<br /><em style={{ fontStyle: "italic", color: G.greenPale }}>{line2}</em>
                </DisplayHeading>
              );
            })()}
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1rem" }}>
            {STATIC_AMENITIES.map((a, i) => (
              <motion.div
                key={a.title}
                className="amenity-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 18, padding: "1.5rem", transition: "border-color 0.2s, background 0.2s" }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{a.icon}</div>
                <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", color: G.text, marginBottom: 8, fontWeight: 500 }}>{a.title}</h4>
                <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.65 }}>{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </EditableSection>

      {/* ══════════════════════════════
          GALLERY
      ══════════════════════════════ */}
      <EditableSection id="gallery" style={{ padding: "6rem 1.5rem", background: G.ink2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <SectionLabel>{cms.galleryLabel || "Gallery"}</SectionLabel>
            <DisplayHeading>
              {cms.galleryHeading || <>The retreat <em style={{ fontStyle: "italic", color: G.greenPale }}>in every light.</em></>}
            </DisplayHeading>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {Array.from({ length: 9 }, (_, i) => {
              const tall = i % 5 === 0;
              const imgSrc = i === 0 ? cms.galleryImg1 : i === 1 ? cms.galleryImg2 : i === 2 ? cms.galleryImg3 : null;
              const labels = ["Lotus pond","Temple view","Garden","Suite","Breakfast","Corridor","Courtyard","Drone prep","Rooftop"];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  whileHover={{ scale: 1.02, zIndex: 2 }}
                  style={{ gridRow: tall ? "span 2" : "span 1", aspectRatio: tall ? "3/5" : "4/3", borderRadius: 16, overflow: "hidden", border: `1px solid ${G.border}`, position: "relative" }}
                >
                  <ImageBg src={imgSrc ?? undefined} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(4,13,8,0.5),transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 10, color: G.greenPale, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>
                    {labels[i % 9]}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </EditableSection>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <EditableSection id="testimonials" style={{ padding: "7rem 1.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(109,184,122,0.02) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(109,184,122,0.02) 61px)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <SectionLabel>{cms.testimonialLabel || "Guest voices"}</SectionLabel>
          <DisplayHeading style={{ marginBottom: "3rem" }}>
            <em style={{ fontStyle: "italic", color: G.greenPale }}>{cms.testimonialHeading || "Heard at checkout."}</em>
          </DisplayHeading>

          {testimonials.length > 0 && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tIdx}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ background: `linear-gradient(160deg,${G.green}08,rgba(7,16,9,0.95) 100%)`, border: `1px solid ${G.border}`, borderRadius: 24, padding: "3rem 2.5rem" }}
                >
                  <div style={{ fontSize: 20, letterSpacing: 4, color: G.gold, marginBottom: 20 }}>★★★★★</div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontStyle: "italic", color: G.text, lineHeight: 1.7, marginBottom: 24 }}>
                    "{testimonials[tIdx]?.text}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${G.green}20`, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", color: G.greenPale, fontSize: 14 }}>
                      {testimonials[tIdx]?.name?.[0]}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{testimonials[tIdx]?.name}</p>
                      <p style={{ fontSize: 11, color: G.greenPale, letterSpacing: "0.1em" }}>{testimonials[tIdx]?.pkg}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {testimonials.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setTIdx(i); }}
                      style={{ width: i === tIdx ? 20 : 6, height: 6, borderRadius: 3, border: "none", background: i === tIdx ? G.greenLight : G.border, transition: "all 0.3s", cursor: "pointer" }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </EditableSection>

      {/* ══════════════════════════════
          LOCATION
      ══════════════════════════════ */}
      <EditableSection id="location" style={{ padding: "5rem 1.5rem", background: G.ink2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionLabel>{cms.locationLabel || "How to find us"}</SectionLabel>
            {(() => {
              const { line1, line2 } = splitHeading(cms.locationHeading, "Ten minutes from\neverywhere that matters.");
              return (
                <DisplayHeading style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
                  {line1}<br /><em style={{ color: G.greenPale }}>{line2}</em>
                </DisplayHeading>
              );
            })()}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              {locationItems.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "12px 16px" }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, color: G.text, fontWeight: 500 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: G.muted }}>{item.dist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ height: 380, borderRadius: 22, overflow: "hidden", border: `1px solid ${G.border}`, position: "relative" }}>
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg,${G.ink3},#071a09)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 48, opacity: 0.4 }}>🗺️</span>
              <p style={{ color: G.muted, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Embed Google Maps here</p>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 20, height: 20, borderRadius: "50%", background: G.greenLight }}>
              {[1, 2, 3].map((k) => (
                <div key={k} style={{ position: "absolute", inset: -k * 12, borderRadius: "50%", border: `1px solid ${G.greenLight}`, animation: `ripple 2s ease-out infinite ${k * 0.6}s` }} />
              ))}
            </div>
          </motion.div>
        </div>
      </EditableSection>

      {/* ══════════════════════════════
          RESERVE CTA
      ══════════════════════════════ */}
      <EditableSection id="cta" style={{ padding: "8rem 1.5rem", position: "relative", overflow: "hidden", background: cms.ctaBg || G.ink }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%,${G.green}12 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}05 80px)`, pointerEvents: "none" }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}
        >
          <div style={{ fontSize: 52, marginBottom: 24, animation: "floatLotus 4s ease-in-out infinite" }}>🪷</div>
          <SectionLabel>Reserve your stay</SectionLabel>
          <DisplayHeading style={{ marginBottom: 20 }}>
            <span dangerouslySetInnerHTML={{ __html: (cms.ctaTitle || "Only Full Day & Bridal\nguests may book.").replace(/\n/g, "<br />") }} />
          </DisplayHeading>

          <p style={{ color: G.muted, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 40px", fontSize: "0.95rem" }}>
            Confirm your photography package first, then reach us on WhatsApp with your package reference number to reserve a room. Rooms fill each festival season by April.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 40 }}>
            {CTA_PERKS.map(({ icon, label, note }) => (
              <div key={label} style={{ background: `${G.green}08`, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{icon}</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 11, color: G.muted }}>{note}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/reserve"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: `linear-gradient(135deg, ${cms.ctaBtn1Color || G.green}, ${G.greenLight})`,
                color: "#fff", borderRadius: 100, padding: "16px 36px",
                textDecoration: "none", fontWeight: 600, fontSize: "0.95rem",
                letterSpacing: "0.06em",
                boxShadow: `0 8px 30px ${G.green}40`,
              }}
            >
              🪷 {cms.ctaBtn1Text || "Reserve your room"}
            </Link>
            <a
              href={cms.ctaBtn2Link || "/?scroll=book"}
              style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "16px 28px", textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.06em" }}
            >
              {cms.ctaBtn2Text || "Book photography package"}
            </a>
          </div>
           

        </motion.div>
      </EditableSection>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer
        id="section-footer"
        style={{ borderTop: `1px solid ${G.border}`, padding: "3rem 1.5rem", background: G.ink, cursor: "default" }}
        onClick={() => { try { window.parent.postMessage({ type: "SELECT_SECTION", section: "footer" }, "*"); } catch {} }}
        onMouseEnter={(e) => (e.currentTarget.style.outline = `2px solid ${G.green}50`)}
        onMouseLeave={(e) => (e.currentTarget.style.outline = "2px solid transparent")}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: G.greenPale }}>
              {cms.footerName || "The Aambal Retreat"}
            </p>
            <p style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
              {cms.footerTagline || "Kottayam · Kerala · India · Est. 1924"}
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: G.muted }}>
            <p>{cms.footerEmail || "hello@aambalstudio.in"}</p>
            <p>{cms.footerPhone || "+91 98xxx xxxxx"}</p>
            <Link to="/" style={{ color: G.greenPale, textDecoration: "none", fontSize: 12, marginTop: 8, display: "inline-block" }}>
              ← Back to Studio
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
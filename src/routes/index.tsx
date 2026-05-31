import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/Nav";
import { FlyingDrone } from "@/components/FlyingDrone";
import { BookingForm } from "@/components/BookingForm";
import hero from "@/assets/hero-festival.jpg";
import aerial from "@/assets/drone-aerial.jpg";
import portrait from "@/assets/portrait-festival.jpg";
import { InstagramFeed } from "@/components/InstagramFeed";
import { GallerySection } from "@/components/GallerySection";
import { HomestaySection } from "@/components/HomestaySection";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StudioIntroSection } from "@/components/StudioIntroSection";
import { StudioEquipment } from "@/components/StudioEquipment";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Hut Photography · Aambal Vasantham Festival Studio" },
      { name: "description", content: "Book festival portraits, family coverage and cinematic drone shots for the Aambal Vasantham festival. Limited slots — reserve now." },
    ],
  }),
  component: Home,
});

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<"visible" | "exiting">("visible");

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const step = Math.random() * 7 + 2;
      current = Math.min(100, current + step);
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("exiting");
          setTimeout(() => {
            setDone(true);
            onComplete?.();
          }, 700);
        }, 300);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  if (done) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exiting" ? 0 : 1, scale: phase === "exiting" ? 1.03 : 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: `
linear-gradient(
  180deg,
  #030308 0%,
  #0a0a14 25%,
  #120f1f 60%,
  #0a0a14 100%
)
` }}
    >
      {/* Ambient pulsing rings */}
      {[500, 380, 260].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full"
          style={{
            width: size, height: size,
            border: "1px solid rgba(200,168,74,0.08)",
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1.1, ease: "easeInOut" }}
        />
      ))}

      {/* Slowly spinning dashed orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{ width: 380, height: 380, border: "1px dashed rgba(200,168,74,0.06)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-full"
          style={{ width: 280, height: 280, border: "1px dashed rgba(200,168,74,0.04)" }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.018,
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">

        {/* Lotus illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 80 80" width="68" height="68">
            <ellipse cx="40" cy="54" rx="22" ry="10" fill="#c8a84a" opacity="0.15" />
            <path d="M40 52 Q30 38 32 24 Q36 16 40 22 Q44 16 48 24 Q50 38 40 52Z" fill="#c8a84a" opacity="0.88" />
            <path d="M40 52 Q22 42 20 28 Q22 18 28 22 Q30 30 40 52Z" fill="#c8a84a" opacity="0.6" />
            <path d="M40 52 Q58 42 60 28 Q58 18 52 22 Q50 30 40 52Z" fill="#c8a84a" opacity="0.6" />
            <path d="M40 52 Q14 48 12 34 Q16 24 22 30 Q28 38 40 52Z" fill="#c8a84a" opacity="0.32" />
            <path d="M40 52 Q66 48 68 34 Q64 24 58 30 Q52 38 40 52Z" fill="#c8a84a" opacity="0.32" />
            <circle cx="40" cy="52" r="3.5" fill="#ffd93d" opacity="0.92" />
            <circle cx="40" cy="52" r="1.5" fill="white" opacity="0.95" />
          </svg>
        </motion.div>

        {/* Monogram badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center font-black text-[26px] rounded-[18px]"
          style={{
            width: 68, height: 68,
            background: "linear-gradient(135deg, #c8a84a, #ffd93d)",
            color: "#0a0a14",
            boxShadow: "0 0 0 8px rgba(200,168,74,0.08), 0 0 0 16px rgba(200,168,74,0.04)",
          }}
        >
          S
        </motion.div>

        {/* Studio name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.65 }}
          className="flex flex-col items-center gap-1.5"
        >
          <h1
            className="font-display leading-none tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 2.8rem)" }}
          >
            Studio Hut
          </h1>
          <p
            className="font-display italic"
            style={{ fontSize: "clamp(1rem, 3vw, 1.2rem)", color: "rgba(200,168,74,0.75)" }}
          >
            Photography
          </p>
          <p
            className="font-mono uppercase text-white/20"
            style={{ fontSize: 10, letterSpacing: "0.32em", marginTop: 4 }}
          >
            Kottayam · Kerala · Est. 1994
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          style={{ width: 1, height: 32, background: "rgba(200,168,74,0.22)" }}
        />

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center gap-8"
        >
          {[
            { n: "30+", l: "Years of craft" },
            { n: "1,200+", l: "Families served" },
            { n: "7", l: "Festival seasons" },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-8">
              <div className="text-center">
                <div className="font-display text-2xl leading-none text-primary">{s.n}</div>
                <div
                  className="uppercase text-white/25 mt-1"
                  style={{ fontSize: 9, letterSpacing: "0.22em" }}
                >
                  {s.l}
                </div>
              </div>
              {i < 2 && (
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)" }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Studio intro quote */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-display italic text-center"
          style={{
            maxWidth: 320,
            fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
            color: "rgba(255,255,255,0.28)",
            lineHeight: 1.75,
          }}
        >
          "Since 1994, we have photographed the light of Kerala — its festivals, families, and the quiet moments between."
        </motion.p>

        {/* Studio detail pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.55 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {[
            { icon: "📸", label: "Portraits" },
            { icon: "🚁", label: "Aerial" },
            { icon: "🎬", label: "Cinematic" },
            { icon: "🛕", label: "Festival" },
          ].map((tag) => (
            <div
              key={tag.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                border: "1px solid rgba(200,168,74,0.18)",
                background: "rgba(200,168,74,0.06)",
              }}
            >
              <span style={{ fontSize: 11 }}>{tag.icon}</span>
              <span
                className="font-mono uppercase text-white/35"
                style={{ fontSize: 9, letterSpacing: "0.22em" }}
              >
                {tag.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
          style={{ marginTop: 4 }}
        >
          <div
            style={{
              width: 180, height: 1,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 1,
                width: `${Math.min(progress, 100)}%`,
                background: "linear-gradient(90deg, #c8a84a, #ffd93d)",
                transition: "width 0.08s linear",
              }}
            />
          </div>
          <div
            className="font-mono uppercase text-white/20 flex items-center gap-1.5"
            style={{ fontSize: 9, letterSpacing: "0.28em" }}
          >
            Preparing your experience
            <motion.span
              animate={{ opacity: [1, 0.15, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              style={{
                display: "inline-block", width: 4, height: 4,
                borderRadius: "50%", background: "#c8a84a", verticalAlign: "middle",
              }}
            />
          </div>
        </motion.div>

        {/* Bottom service tags line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="flex items-center gap-5"
        >
          {["Portraits", "Aerial", "Festival", "Cinematic"].map((s, i) => (
            <div key={s} className="flex items-center gap-5">
              <span
                className="font-mono uppercase text-white/12"
                style={{ fontSize: 8, letterSpacing: "0.28em" }}
              >
                {s}
              </span>
              {i < 3 && (
                <span style={{ color: "rgba(200,168,74,0.15)", fontSize: 7 }}>◆</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const EQUIPMENT = [
  {
    id: "camera", index: "01", category: "Primary Camera", name: "Canon EOS R5",
    tagline: "45 Megapixels · 8K RAW",
    desc: "Every strand of silk sari, every flame reflected in a water lily — captured in breathtaking resolution. The R5 is our primary workhorse for all portrait and ceremonial work.",
    stats: [{ k: "Sensor", v: "45MP Full-Frame" }, { k: "Dynamic Range", v: "14+ Stops" }, { k: "AF Points", v: "1053 Zones" }],
    color: "#c8a84a",
  },
  {
    id: "drone", index: "02", category: "Aerial Platform", name: "DJI Mavic 3 Pro",
    tagline: "5.1K Hasselblad · Triple Camera",
    desc: "The temple from 80 metres up. The lily pond as a geometric painting. The procession as a river of colour winding through the streets. Aerial storytelling redefined.",
    stats: [{ k: "Resolution", v: "5.1K ProRes" }, { k: "Altitude", v: "120m DGCA" }, { k: "Flight Time", v: "43 Minutes" }],
    color: "#7dd3fc",
  },
  {
    id: "light", index: "03", category: "Studio Lighting", name: "Profoto B10X Plus",
    tagline: "500Ws · TTL · HSS",
    desc: "When the festival light fails, we bring our own sun. 500 watt-seconds of power in a package smaller than your lunch box — precision light, anywhere.",
    stats: [{ k: "Power", v: "500 Ws" }, { k: "Recycle Time", v: "0.05–1.9s" }, { k: "Battery", v: "400+ Shots" }],
    color: "#ffd93d",
  },
  {
    id: "lens", index: "04", category: "Portrait Lens", name: "RF 85mm f/1.2 L",
    tagline: "Portrait Perfection · f/1.2",
    desc: "An aperture so wide it drinks the darkness. At f/1.2, festival lamps become liquid gold bokeh. Faces emerge from shadow as if lit from within by something divine.",
    stats: [{ k: "Aperture", v: "f/1.2 – f/16" }, { k: "Focal Length", v: "85mm" }, { k: "Elements", v: "13 in 9 Groups" }],
    color: "#d4b0ff",
  },
  {
    id: "gimbal", index: "05", category: "Stabilisation", name: "DJI RS 3 Pro",
    tagline: "6.5kg Payload · 3-Axis",
    desc: "Cinema-smooth tracking through temple corridors. The procession filmed as a continuous, flowing poem. No shake. No cuts. Just movement that breathes.",
    stats: [{ k: "Payload", v: "6.5kg" }, { k: "Stabilisation", v: "3-Axis" }, { k: "Runtime", v: "12 Hours" }],
    color: "#6bcb77",
  },
];

const droneFeatures = [
  { title: "4K Cinematic Aerials", text: "DJI Mavic 3 Pro · Hasselblad sensor · 5.1K ProRes ready.", icon: "🎬" },
  { title: "Licensed & Insured", text: "DGCA certified pilots, public liability cover up to ₹50L.", icon: "🛡️" },
  { title: "Festival Specialist", text: "Crowd-safe flight plans tuned for processions, temple aartis and fireworks.", icon: "🛕" },
  { title: "Same-Day Teaser", text: "Edited 60-second aerial reel delivered before midnight.", icon: "⚡" },
];

const packageTeasers = [
  { id: "portrait", name: "Festival Portrait", price: "₹4,999", duration: "1 hr", icon: "📸", color: "#c8a84a", desc: "Solo & couple portraits" },
  { id: "family", name: "Family & Group", price: "₹8,999", duration: "2 hrs", icon: "👨‍👩‍👧‍👦", color: "#e8c97a", desc: "Up to 12 members", hot: true },
  { id: "bridal", name: "Bridal / Couple", price: "₹14,999", duration: "Half day", icon: "🎬", color: "#d4b0ff", desc: "Cinematic reel included" },
  { id: "fullday", name: "Full Day", price: "₹24,999", duration: "Sunrise→Night", icon: "🚁", color: "#7dd3fc", desc: "Drone aerials + film" },
];

const testimonials = [
  { name: "Meena & Rajesh", pkg: "Bridal Package", quote: "They knew exactly when the lamps would reflect on the water. We didn't even have to direct — just exist, and they found the light.", stars: 5 },
  { name: "The Iyer Family", pkg: "Family & Group", quote: "All 11 of us, chaos and all, somehow made into the most beautiful portrait we've ever taken. The same-day preview had us in tears.", stars: 5 },
  { name: "Divya Krishnan", pkg: "Full Day + Drone", quote: "The aerial of the procession at dusk is framed in our living room. People think it's fine art. It is.", stars: 5 },
  { name: "Anand & Preethi", pkg: "Festival Portrait", quote: "We've been to Aambal Vasantham five years running. This was the first time we came home with photos worthy of the festival.", stars: 5 },
];

const processSteps = [
  { n: "01", title: "Reserve your slot", desc: "Fill the form or message us on WhatsApp. We confirm within 24 hours with your shoot schedule.", icon: "📅" },
  { n: "02", title: "We arrive before dawn", desc: "Our team scouts your positions the night before. On shoot day we're at the festival before you.", icon: "🌅" },
  { n: "03", title: "Same-day previews", desc: "Five curated preview images on WhatsApp before midnight. You'll sleep well.", icon: "⚡" },
  { n: "04", title: "Full gallery in 48hrs", desc: "Every edited image delivered to a private gallery. Yours forever.", icon: "🖼️" },
];

const studioServices = [
  { icon: "📸", title: "Portrait Sessions", desc: "Studio-lit portraits with seamless backdrops, ring lights and professional retouching.", color: "#ff6b6b" },
  { icon: "💍", title: "Bridal & Wedding", desc: "Full-day bridal coverage from mehendi to reception, indoor & outdoor.", color: "#ffd93d" },
  { icon: "🎓", title: "Graduation & Events", desc: "Milestone moments — college convocations, corporate events, product launches.", color: "#6bcb77" },
  { icon: "👶", title: "Newborn & Kids", desc: "Gentle, safe newborn posing in our warm studio. Maternity & baby milestone sessions.", color: "#4d96ff" },
  { icon: "🎬", title: "Reels & Short Films", desc: "Social-media reels, product videos and short films produced in-studio.", color: "#c77dff" },
  { icon: "🏢", title: "Corporate & Brand", desc: "LinkedIn headshots, brand identity shoots and catalogue photography.", color: "#f4a261" },
];

const studioEquipment = [
  { name: "Canon EOS R5", category: "Camera", spec: "45MP Full-Frame", icon: "📷" },
  { name: "Sony A7 IV", category: "Camera", spec: "33MP Mirrorless", icon: "📷" },
  { name: "Profoto B10X", category: "Lighting", spec: "500Ws Flash", icon: "💡" },
  { name: "Aputure 600D", category: "Lighting", spec: "600W LED COB", icon: "💡" },
  { name: "Manfrotto 055", category: "Support", spec: "Carbon Tripod", icon: "🎯" },
  { name: "DJI RS 3 Pro", category: "Gimbal", spec: "6.5kg Payload", icon: "🎥" },
  { name: "Savage Seamless", category: "Backdrop", spec: "9ft Paper Rolls", icon: "🎨" },
  { name: "Westcott Rapid", category: "Modifier", spec: "Strip Softbox", icon: "⬜" },
];

// ─────────────────────────────────────────────────────────────────────────────
// FESTIVAL FRAMES
// ─────────────────────────────────────────────────────────────────────────────
const FESTIVAL_FRAMES = [
  {
    id: "lotus", name: "Lotus Gold", color: "#c8a84a",
    svgFrame: (
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect x="8" y="8" width="384" height="384" rx="4" fill="none" stroke="#c8a84a" strokeWidth="3"/>
        <rect x="16" y="16" width="368" height="368" rx="2" fill="none" stroke="#c8a84a" strokeWidth="1" strokeDasharray="6 4"/>
        {[[20,20],[380,20],[20,380],[380,380]].map(([cx,cy],i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${i*90})`}>
            <path d="M0,0 L20,0 M0,0 L0,20" stroke="#c8a84a" strokeWidth="3" fill="none"/>
            <circle cx="0" cy="0" r="3" fill="#c8a84a"/>
          </g>
        ))}
        <g transform="translate(200,14)">
          <ellipse cx="0" cy="0" rx="22" ry="10" fill="#0a0a14" stroke="#c8a84a" strokeWidth="1.5"/>
          <path d="M-10,0 Q0,-14 10,0 Q0,-8 -10,0" fill="#c8a84a" opacity="0.7"/>
          <path d="M-16,2 Q-5,-10 5,-2 Q-5,-4 -16,2" fill="#c8a84a" opacity="0.5"/>
          <path d="M16,2 Q5,-10 -5,-2 Q5,-4 16,2" fill="#c8a84a" opacity="0.5"/>
        </g>
        <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#c8a84a" fontFamily="Georgia,serif" letterSpacing="4" opacity="0.7">AAMBAL VASANTHAM 2026</text>
      </svg>
    ),
  },
  {
    id: "temple", name: "Temple Blue", color: "#7dd3fc",
    svgFrame: (
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect x="6" y="6" width="388" height="388" rx="3" fill="none" stroke="#7dd3fc" strokeWidth="2.5"/>
        <rect x="14" y="14" width="372" height="372" rx="2" fill="none" stroke="#7dd3fc" strokeWidth="0.75" opacity="0.5"/>
        <path d="M140,8 Q200,-10 260,8" fill="none" stroke="#7dd3fc" strokeWidth="2"/>
        {[80,160,240,320].map((y,i) => (
          <g key={i}>
            <ellipse cx="6" cy={y} rx="4" ry="6" fill="#7dd3fc" opacity="0.6"/>
            <ellipse cx="394" cy={y} rx="4" ry="6" fill="#7dd3fc" opacity="0.6"/>
          </g>
        ))}
        <text x="200" y="393" textAnchor="middle" fontSize="9" fill="#7dd3fc" fontFamily="monospace" letterSpacing="3" opacity="0.8">✦ STUDIO HUT PHOTOGRAPHY ✦</text>
      </svg>
    ),
  },
  {
    id: "cinematic", name: "Cinematic", color: "#d4b0ff",
    svgFrame: (
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect x="0" y="0" width="400" height="40" fill="#0a0a14" opacity="0.85"/>
        <rect x="0" y="360" width="400" height="40" fill="#0a0a14" opacity="0.85"/>
        {[20,60,100,140,180,220,260,300,340,380].map((x,i) => (
          <g key={i}>
            <rect x={x-8} y="8" width="16" height="24" rx="3" fill="#d4b0ff" opacity="0.3"/>
            <rect x={x-8} y="368" width="16" height="24" rx="3" fill="#d4b0ff" opacity="0.3"/>
          </g>
        ))}
        <rect x="0" y="38" width="400" height="2" fill="#d4b0ff" opacity="0.4"/>
        <rect x="0" y="360" width="400" height="2" fill="#d4b0ff" opacity="0.4"/>
        <rect x="0" y="40" width="3" height="320" fill="#d4b0ff" opacity="0.4"/>
        <rect x="397" y="40" width="3" height="320" fill="#d4b0ff" opacity="0.4"/>
        <text x="200" y="28" textAnchor="middle" fontSize="9" fill="#d4b0ff" fontFamily="monospace" letterSpacing="5" opacity="0.9">STUDIO HUT · 35mm</text>
        <text x="200" y="386" textAnchor="middle" fontSize="8" fill="#d4b0ff" fontFamily="monospace" letterSpacing="3" opacity="0.7">AAMBAL VASANTHAM 2026</text>
      </svg>
    ),
  },
  {
    id: "vintage", name: "Vintage Warm", color: "#f4a261",
    svgFrame: (
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect x="4" y="4" width="392" height="392" rx="20" fill="none" stroke="#f4a261" strokeWidth="3"/>
        <rect x="12" y="12" width="376" height="376" rx="16" fill="none" stroke="#f4a261" strokeWidth="1" opacity="0.4"/>
        {[[24,24,0],[376,24,90],[24,376,270],[376,376,180]].map(([cx,cy,rot],i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <circle cx="0" cy="0" r="8" fill="#f4a261" opacity="0.2"/>
            <circle cx="0" cy="0" r="4" fill="#f4a261" opacity="0.5"/>
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#f4a261" strokeWidth="1" opacity="0.4"/>
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#f4a261" strokeWidth="1" opacity="0.4"/>
          </g>
        ))}
        <text x="200" y="394" textAnchor="middle" fontSize="9" fill="#f4a261" fontFamily="Georgia,serif" letterSpacing="4" opacity="0.8">✿ FESTIVAL MEMORIES ✿</text>
      </svg>
    ),
  },
];

type MediaItem = { id?: string; type: "image" | "video"; src: string; caption: string; };

// ─────────────────────────────────────────────────────────────────────────────
// FESTIVAL PHOTO FRAME
// ─────────────────────────────────────────────────────────────────────────────
function FestivalPhotoFrame() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [filter, setFilter] = useState("none");
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const filters = [
    { id: "none", name: "Original", css: "none" },
    { id: "warm", name: "Festival Warm", css: "sepia(0.4) saturate(1.3) brightness(1.05)" },
    { id: "golden", name: "Golden Hour", css: "sepia(0.6) saturate(1.5) hue-rotate(-10deg) brightness(1.1)" },
    { id: "moody", name: "Moody", css: "contrast(1.2) saturate(0.8) brightness(0.9)" },
    { id: "vivid", name: "Vivid", css: "saturate(1.6) contrast(1.1) brightness(1.05)" },
    { id: "bw", name: "Black & White", css: "grayscale(1) contrast(1.1)" },
  ];

  const handleFileChange = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const downloadFrame = async () => {
    if (!uploadedImage || !frameRef.current) return;
    setDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setDownloading(false); return; }
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(0, 0, 800, 800);
      const scale = Math.max(800 / img.width, 800 / img.height);
      const sw = 800 / scale, sh = 800 / scale;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, 800, 800);
      const svgEl = frameRef.current!.querySelector("svg");
      if (!svgEl) { setDownloading(false); return; }
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgImg = new Image();
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, 800, 800);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `studio-hut-festival-${FESTIVAL_FRAMES[selectedFrame].id}.jpg`;
          a.click();
          setDownloading(false);
        }, "image/jpeg", 0.92);
      };
      svgImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
    };
    img.src = uploadedImage;
  };

  const currentFilter = filters.find(f => f.id === filter)?.css ?? "none";
  const currentFrame = FESTIVAL_FRAMES[selectedFrame];

  return (
    <section id="try-frame" className="relative py-32 bg-[#060610] overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${currentFrame.color}, transparent 70%)`, filter: "blur(80px)", transition: "background 0.6s" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 flex flex-col items-center text-center">
          <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/80">
            <span className="h-px w-6 bg-primary/50 inline-block" />Try It On<span className="h-px w-6 bg-primary/50 inline-block" />
          </p>
          <h2 className="font-display text-5xl md:text-6xl leading-[0.93] mb-5 text-white">
            Your photo in a<br />
            <span style={{ background: "linear-gradient(135deg,#c8a84a,#ffd93d 50%,#ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontStyle: "italic" }}>festival frame.</span>
          </h2>
          <p className="max-w-md text-white/40 text-base">Upload your photo, pick a frame, and see how your memory looks Studio Hut style. Download it instantly.</p>
        </motion.div>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
          <div className="flex flex-col items-center gap-6">
            <div ref={frameRef} className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden"
              style={{ background: "#0a0a14", border: `2px solid ${currentFrame.color}30` }}>
              {uploadedImage ? (
                <img src={uploadedImage} alt="Your photo" className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: currentFilter, transition: "filter 0.4s ease" }} />
              ) : (
                <div className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? "bg-white/5" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  <motion.div animate={{ scale: isDragging ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                      style={{ background: `${currentFrame.color}15`, border: `2px dashed ${currentFrame.color}40`, transition: "all 0.4s" }}>📷</div>
                    <div className="text-center px-8">
                      <p className="text-white/70 text-sm font-medium mb-1">Drop your photo here</p>
                      <p className="text-white/30 text-xs">or click to browse · JPG, PNG, WEBP</p>
                    </div>
                    <div className="px-6 py-2.5 rounded-full text-xs font-semibold"
                      style={{ border: `1px solid ${currentFrame.color}50`, color: currentFrame.color, background: `${currentFrame.color}10` }}>
                      Browse photo →
                    </div>
                  </motion.div>
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={selectedFrame} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }} className="absolute inset-0 pointer-events-none">
                  {currentFrame.svgFrame}
                </motion.div>
              </AnimatePresence>
              {uploadedImage && (
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-10"
                  style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
                  onClick={() => fileInputRef.current?.click()} title="Change photo">
                  <span className="text-white text-sm">↺</span>
                </div>
              )}
            </div>
            {uploadedImage && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={downloadFrame} disabled={downloading}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm transition-all"
                style={{ background: `linear-gradient(135deg, ${currentFrame.color}, ${currentFrame.color}bb)`, color: "#0a0a14", opacity: downloading ? 0.7 : 1 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {downloading ? "Preparing..." : "⬇ Download your frame"}
              </motion.button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }} className="hidden" />
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-4 font-semibold">Choose frame</p>
              <div className="grid grid-cols-2 gap-3">
                {FESTIVAL_FRAMES.map((frame, i) => (
                  <motion.button key={frame.id} onClick={() => setSelectedFrame(i)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    className="relative rounded-2xl p-4 text-left transition-all duration-300 overflow-hidden"
                    style={{ border: i === selectedFrame ? `2px solid ${frame.color}` : `1px solid ${frame.color}25`, background: i === selectedFrame ? `${frame.color}12` : `${frame.color}06` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${frame.color}20`, border: `1px solid ${frame.color}40` }}>
                        <div className="w-3 h-3 rounded-sm" style={{ background: frame.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/80">{frame.name}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: frame.color }}>Frame {i + 1} of 4</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-4 font-semibold">Photo filter</p>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className="px-4 py-2 rounded-full text-xs font-medium transition-all"
                    style={{ border: filter === f.id ? `1.5px solid ${currentFrame.color}` : "1px solid rgba(255,255,255,0.12)", background: filter === f.id ? `${currentFrame.color}18` : "transparent", color: filter === f.id ? currentFrame.color : "rgba(255,255,255,0.45)" }}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-3 font-semibold">How it works</p>
              <div className="space-y-3">
                {[{ n: "01", t: "Upload your photo — any portrait works" }, { n: "02", t: "Pick a festival frame & filter" }, { n: "03", t: "Download & share on Instagram" }].map(({ n, t }) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/25 shrink-0">{n}</span>
                    <div className="h-px flex-1 bg-white/8" />
                    <span className="text-xs text-white/50">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {uploadedImage && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5">
                <p className="text-xs text-pink-300/70 mb-2 font-semibold uppercase tracking-wider">Share it!</p>
                <p className="text-sm text-white/50">Tag <span className="text-pink-300">@studiohutphotography</span> and use <span className="text-pink-300">#AambalVasantham2026</span> for a chance to be featured.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EQUIPMENT ILLUSTRATIONS
// ─────────────────────────────────────────────────────────────────────────────
function CameraIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 320" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs><radialGradient id="camGlow" cx="50%" cy="55%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="210" cy="195" rx="130" ry="110" fill="url(#camGlow)"/>
      <rect x="55" y="90" width="290" height="185" rx="18" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <rect x="55" y="90" width="66" height="185" rx="16" fill="#0d0d1a"/>
      {[0,1,2,3,4,5].map(i => <line key={i} x1="68" y1={112+i*22} x2="68" y2={125+i*22} stroke={`${color}40`} strokeWidth="2.5" strokeLinecap="round"/>)}
      <path d="M155 90 L155 65 Q155 57 163 57 L215 57 Q223 57 223 65 L223 90 Z" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="306" cy="79" r="19" fill="#0d0d1a" stroke={color} strokeWidth="1.5"/>
      <circle cx="306" cy="79" r="11" fill={`${color}18`}/>
      <text x="306" y="83" textAnchor="middle" fontSize="9" fill={color} fontFamily="monospace" fontWeight="bold">AV</text>
      <circle cx="272" cy="82" r="14" fill="#0d0d1a" stroke={color} strokeWidth="2"/>
      <circle cx="272" cy="82" r="8" fill={color} opacity="0.85"><animate attributeName="opacity" values="0.85;0.35;0.85" dur="2.5s" repeatCount="indefinite"/></circle>
      <rect x="160" y="61" width="52" height="28" rx="5" fill="#050509" stroke={`${color}50`} strokeWidth="1"/>
      <circle cx="210" cy="192" r="82" fill="#040408" stroke={color} strokeWidth="3"/>
      <circle cx="210" cy="192" r="68" fill="#030306" stroke={`${color}55`} strokeWidth="1.5"/>
      <circle cx="210" cy="192" r="52" fill="#020204" stroke={`${color}30`} strokeWidth="1.5"/>
      <circle cx="210" cy="192" r="32" fill={`${color}08`} stroke={`${color}55`} strokeWidth="1.5"/>
      <ellipse cx="197" cy="180" rx="9" ry="6" fill="white" opacity="0.1" transform="rotate(-30, 197, 180)"/>
      <circle cx="200" cy="178" r="4" fill="white" opacity="0.18"/>
      {Array.from({length: 18}).map((_, i) => { const a = i * 20 * Math.PI / 180; return <line key={i} x1={210+76*Math.cos(a)} y1={192+76*Math.sin(a)} x2={210+81*Math.cos(a)} y2={192+81*Math.sin(a)} stroke={color} strokeWidth={i%3===0?1.5:0.7} opacity="0.35"/>; })}
      <circle cx="330" cy="99" r="5" fill="#ff4444"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/></circle>
      <text x="210" y="296" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">EOS R5 · 45MP CMOS</text>
    </svg>
  );
}

function DroneIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 340" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs><radialGradient id="droneGlow" cx="50%" cy="45%" r="45%"><stop offset="0%" stopColor={color} stopOpacity="0.1"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="200" cy="155" rx="160" ry="130" fill="url(#droneGlow)"/>
      <circle cx="200" cy="160" r="130" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="4 6" opacity="0.2"><animateTransform attributeName="transform" type="rotate" values="0 200 160;360 200 160" dur="12s" repeatCount="indefinite"/></circle>
      <polygon points="188,210 212,210 240,315 160,315" fill={`${color}05`}/>
      <ellipse cx="200" cy="318" rx="48" ry="7" fill="rgba(0,0,0,0.5)"/>
      <line x1="65" y1="100" x2="192" y2="154" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="335" y1="100" x2="208" y2="154" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="65" y1="225" x2="192" y2="158" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="335" y1="225" x2="208" y2="158" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <rect x="174" y="140" width="52" height="36" rx="10" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <rect x="185" y="176" width="30" height="26" rx="8" fill="#0a0a14" stroke={color} strokeWidth="1.5"/>
      <circle cx="200" cy="189" r="9" fill="#050509" stroke={`${color}70`} strokeWidth="1.5"/>
      <circle cx="200" cy="189" r="5" fill={color} opacity="0.75"/>
      {[[65,100],[335,100],[65,225],[335,225]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="13" fill="#0a0a14" stroke={color} strokeWidth="1.5"/>
          <ellipse cx={cx} cy={cy} rx="28" ry="4" fill={color} opacity="0.5"/>
          <circle cx={cx} cy={cy+14} r="3.5" fill={i<2?"#ff4444":"#44ff88"}><animate attributeName="opacity" values="1;0.15;1" dur={`${0.9+i*0.22}s`} repeatCount="indefinite"/></circle>
        </g>
      ))}
      <rect x="276" y="116" width="82" height="44" rx="8" fill={`${color}10`} stroke={`${color}30`} strokeWidth="1"/>
      <text x="317" y="133" textAnchor="middle" fontSize="9" fill={`${color}60`} fontFamily="monospace" letterSpacing="2">ALTITUDE</text>
      <text x="317" y="151" textAnchor="middle" fontSize="15" fill={color} fontFamily="monospace" fontWeight="bold">78 m</text>
      <text x="200" y="318" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">MAVIC 3 PRO · DCIM</text>
    </svg>
  );
}

function StudioLightIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 360" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="lightBeam2" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient>
        <radialGradient id="bulbGlow2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="white" stopOpacity="0.9"/><stop offset="50%" stopColor={color} stopOpacity="0.6"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient>
      </defs>
      <polygon points="200,100 60,340 340,340" fill="url(#lightBeam2)" opacity="0.7"><animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/></polygon>
      <line x1="200" y1="340" x2="200" y2="135" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round"/>
      <line x1="200" y1="340" x2="130" y2="355" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"/>
      <line x1="200" y1="340" x2="270" y2="355" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="200" cy="100" rx="75" ry="20" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <path d="M125,100 Q150,50 200,45 Q250,50 275,100 Q250,92 200,90 Q150,92 125,100 Z" fill="#18181f" stroke={`${color}40`} strokeWidth="1"/>
      <ellipse cx="200" cy="90" rx="12" ry="5" fill="url(#bulbGlow2)"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/></ellipse>
      {Array.from({length:8}).map((_,i) => { const a = i*45*Math.PI/180; return <line key={i} x1={200+73*Math.cos(a)} y1={100+19*Math.sin(a)} x2={200+80*Math.cos(a)} y2={100+21*Math.sin(a)} stroke={color} strokeWidth="2.5" opacity="0.7"/>; })}
      <text x="200" y="350" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">PROFOTO B10X · 500Ws</text>
    </svg>
  );
}

function LensIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="lensGlass2" cx="42%" cy="42%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.08"/><stop offset="40%" stopColor={color} stopOpacity="0.06"/><stop offset="100%" stopColor="#000010" stopOpacity="0.9"/></radialGradient>
        <radialGradient id="lensGlow2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.15"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="200" cy="200" r="175" fill="url(#lensGlow2)"/>
      <circle cx="200" cy="200" r="160" fill="#080810" stroke={color} strokeWidth="3"/>
      <circle cx="200" cy="200" r="145" fill="#0a0a14" stroke={`${color}40`} strokeWidth="1.5"/>
      {Array.from({length:36}).map((_,i) => { const a=i*10*Math.PI/180; const inner=i%3===0?128:133; return <line key={i} x1={200+inner*Math.cos(a)} y1={200+inner*Math.sin(a)} x2={200+140*Math.cos(a)} y2={200+140*Math.sin(a)} stroke={color} strokeWidth={i%3===0?2:0.8} opacity={i%3===0?0.6:0.3}/>; })}
      <circle cx="200" cy="200" r="120" fill="#06060c" stroke={`${color}50`} strokeWidth="2"/>
      <g style={{ transformOrigin: "200px 200px", animation: "slowSpin 8s linear infinite" }}>
        {Array.from({length:7}).map((_,i) => { const a=i*(360/7)*Math.PI/180; const bx=200+115*Math.cos(a),by=200+115*Math.sin(a); const a2=(i+1)*(360/7)*Math.PI/180; const bx2=200+115*Math.cos(a2),by2=200+115*Math.sin(a2); return <path key={i} d={`M 200 200 L ${bx} ${by} Q ${200+130*Math.cos((a+a2)/2)} ${200+130*Math.sin((a+a2)/2)} ${bx2} ${by2} Z`} fill="#0a0a14" stroke={`${color}25`} strokeWidth="1"/>; })}
      </g>
      <circle cx="200" cy="200" r="75" fill="url(#lensGlass2)" stroke={`${color}60`} strokeWidth="2"/>
      <circle cx="200" cy="200" r="35" fill="#030308" stroke={`${color}70`} strokeWidth="1.5"/>
      <circle cx="200" cy="200" r="10" fill="#000002"/>
      <ellipse cx="178" cy="178" rx="14" ry="9" fill="white" opacity="0.07" transform="rotate(-35, 178, 178)"/>
      <circle cx="182" cy="175" r="5" fill="white" opacity="0.12"/>
      <text x="200" y="376" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">RF 85mm f/1.2 L USM</text>
      <style>{"@keyframes slowSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </svg>
  );
}

function GimbalIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
      <defs><radialGradient id="gimbalGlow2" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor={color} stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="200" cy="200" rx="150" ry="180" fill="url(#gimbalGlow2)"/>
      <rect x="180" y="290" width="40" height="100" rx="16" fill="#0d0d1a" stroke={color} strokeWidth="2"/>
      <rect x="170" y="268" width="60" height="28" rx="10" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <rect x="90" y="205" width="220" height="18" rx="9" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="90" cy="214" r="22" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="90" cy="214" r="6" fill={`${color}30`}><animateTransform attributeName="transform" type="rotate" values="0 90 214;360 90 214" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="310" cy="214" r="22" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="310" cy="214" r="6" fill={`${color}30`}><animateTransform attributeName="transform" type="rotate" values="360 310 214;0 310 214" dur="3s" repeatCount="indefinite"/></circle>
      <rect x="178" y="140" width="44" height="80" rx="8" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="200" cy="148" r="20" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <rect x="148" y="65" width="104" height="72" rx="12" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <circle cx="200" cy="101" r="22" fill="#040408" stroke={`${color}60`} strokeWidth="2"/>
      <circle cx="200" cy="101" r="9" fill={`${color}10`} stroke={`${color}55`} strokeWidth="1"/>
      <circle cx="236" cy="73" r="7" fill="#ff4444" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/></circle>
      <text x="200" y="388" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">DJI RS3 PRO · 3-AXIS</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL EQUIPMENT HERO
// ─────────────────────────────────────────────────────────────────────────────
function ScrollEquipmentHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const elTop = el.offsetTop;
      const elHeight = el.offsetHeight;
      const scrollable = elHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = window.scrollY - elTop;
      const raw = Math.max(0, Math.min(1, scrolled / scrollable));
      setSmoothProgress(raw);
      const idx = Math.min(EQUIPMENT.length - 1, Math.round(raw * (EQUIPMENT.length - 1)));
      setActiveIndex(idx);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const item = EQUIPMENT[activeIndex];
  const illustrations = [
    <CameraIllustration key="camera" color={item.color} />,
    <DroneIllustration key="drone" color={item.color} />,
    <StudioLightIllustration key="light" color={item.color} />,
    <LensIllustration key="lens" color={item.color} />,
    <GimbalIllustration key="gimbal" color={item.color} />,
  ];

  return (
    <div ref={containerRef} style={{ height: `${EQUIPMENT.length * 100}vh`, position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, left: 0, width: "100%", height: "100vh",
        overflow: "hidden", background: "#060610", display: "flex", flexDirection: "column", willChange: "transform",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "background 0.8s ease",
          background: `radial-gradient(ellipse 60% 50% at 25% 60%, ${item.color}10 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 75% 40%, ${item.color}06 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px" }} />
        {[{t:"2%",l:"2%"},{t:"2%",r:"2%"},{b:"12%",l:"2%"},{b:"12%",r:"2%"}].map((pos,i) => (
          <div key={i} style={{ position:"absolute", width:28, height:28, ...(pos as any) }}>
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:2, background:`${item.color}50`, transition:"background 0.6s" }} />
            <div style={{ position:"absolute", top:0, left:0, width:2, height:"100%", background:`${item.color}50`, transition:"background 0.6s" }} />
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.5rem 2.5rem", flexShrink:0, position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#c8a84a,#ffd93d)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#0a0a14" }}>S</div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.9)", letterSpacing:"0.05em" }}>Studio Hut</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase" }}>Photography · Kottayam</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#3fb950", boxShadow:"0 0 8px #3fb950" }} />
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.2em" }}>Studio Open</span>
          </div>
        </div>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, alignItems:"center", padding:"0 4rem 2rem", position:"relative", zIndex:5, minHeight:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <AnimatePresence mode="wait">
              <motion.div key={item.id} initial={{ opacity:0, scale:0.88, y:30 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:1.05, y:-30 }}
                transition={{ duration:0.65, ease:[0.22,1,0.36,1] }} style={{ width:"100%", maxWidth:460 }}>
                {illustrations[activeIndex]}
              </motion.div>
            </AnimatePresence>
            <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", border:`1px solid ${item.color}15`, pointerEvents:"none", animation:"slowSpin2 20s linear infinite" }} />
            <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", border:`1px dashed ${item.color}10`, pointerEvents:"none", animation:"slowSpin2Rev 15s linear infinite" }} />
            <style>{`@keyframes slowSpin2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes slowSpin2Rev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}`}</style>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={item.id + "text"} initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.5, ease:[0.22,1,0.36,1] }} style={{ paddingLeft:"2rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <span style={{ fontFamily:"monospace", fontSize:11, color:item.color, letterSpacing:"0.3em", opacity:0.7 }}>{item.index}</span>
                <div style={{ height:1, width:30, background:`${item.color}50` }} />
                <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.25em", color:"rgba(255,255,255,0.4)" }}>{item.category}</span>
              </div>
              <h1 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(2.8rem,4.5vw,4.5rem)", fontWeight:400, lineHeight:0.95, marginBottom:12, color:"white" }}>{item.name}</h1>
              <p style={{ fontFamily:"monospace", fontSize:12, color:item.color, letterSpacing:"0.2em", marginBottom:24, opacity:0.85, textTransform:"uppercase" }}>{item.tagline}</p>
              <motion.div style={{ height:1, background:`linear-gradient(90deg,${item.color}60,transparent)`, width:200, marginBottom:24 }}
                initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.6, delay:0.2 }}/>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.95rem", lineHeight:1.75, marginBottom:32, maxWidth:420 }}>{item.desc}</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:36 }}>
                {item.stats.map((s, i) => (
                  <motion.div key={s.k} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.06 }}
                    style={{ background:`${item.color}08`, border:`1px solid ${item.color}20`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
                    <div style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:5 }}>{s.k}</div>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:15, color:item.color, fontWeight:600 }}>{s.v}</div>
                  </motion.div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href="#studio-services" style={{ background:`linear-gradient(135deg,${item.color},${item.color}bb)`, color:"#0a0a14", fontWeight:700, fontSize:12, padding:"12px 24px", borderRadius:100, textDecoration:"none", letterSpacing:"0.08em" }}>Explore Services</a>
                <a href="#book" style={{ border:`1px solid ${item.color}30`, color:item.color, fontSize:12, padding:"12px 22px", borderRadius:100, textDecoration:"none", background:`${item.color}08`, letterSpacing:"0.08em" }}>Book a Shoot →</a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ padding:"1rem 2.5rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {EQUIPMENT.map((eq, i) => (
              <button key={eq.id}
                onClick={() => {
                  const el = containerRef.current;
                  if (!el) return;
                  const scrollable = el.offsetHeight - window.innerHeight;
                  const targetProgress = (i / EQUIPMENT.length) + 0.01;
                  window.scrollTo({ top: el.offsetTop + targetProgress * scrollable, behavior: "smooth" });
                }}
                style={{ height:6, borderRadius:3, width:i===activeIndex?28:6, background:i===activeIndex?eq.color:"rgba(255,255,255,0.15)", transition:"all 0.4s ease", border:"none", cursor:"pointer", padding:0 }}
                aria-label={`Go to ${eq.name}`}
              />
            ))}
          </div>
          <motion.div style={{ display:"flex", alignItems:"center", gap:8 }} animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:2.5, repeat:Infinity }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.25em" }}>Scroll to explore</span>
            <motion.span style={{ fontSize:14, color:"rgba(255,255,255,0.3)" }} animate={{ y:[0,4,0] }} transition={{ duration:1.5, repeat:Infinity }}>↓</motion.span>
          </motion.div>
          <div style={{ width:120, height:2, background:"rgba(255,255,255,0.08)", borderRadius:1, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:1, width:`${smoothProgress*100}%`, background:`linear-gradient(90deg,${item.color},${item.color}80)`, transition:"width 0.05s linear" }} />
          </div>
        </div>
        <div style={{ position:"absolute", bottom:72, left:"50%", transform:"translateX(-50%)", display:"flex", gap:24, fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.15)", textTransform:"uppercase", letterSpacing:"0.25em", pointerEvents:"none" }}>
          {["ISO 400","1/250s","f/2.8","5500K","RAW+JPEG"].map((v,i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100vh", pointerEvents: "none" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={`relative mx-auto max-w-7xl px-6 py-24 md:py-32 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/80">
      <span className="h-px w-6 bg-primary/50 inline-block" />{children}<span className="h-px w-6 bg-primary/50 inline-block" />
    </p>
  );
}

function EquipmentTicker() {
  return (
    <div className="overflow-hidden border-y border-white/8 py-3 bg-white/[0.02]">
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, ease: "linear", repeat: Infinity }} className="flex gap-0 whitespace-nowrap w-max">
        {[...Array(2)].map((_, rep) => (
          <div key={rep} className="flex items-center">
            {studioEquipment.map(({ name, category, icon }) => (
              <div key={name+rep} className="flex items-center gap-3 px-8">
                <span className="text-sm">{icon}</span>
                <span className="text-xs font-mono text-white/50 uppercase tracking-widest">{category}</span>
                <span className="text-xs text-white/25">·</span>
                <span className="text-xs font-medium text-white/70">{name}</span>
                <span className="text-white/15 ml-6">◆</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function StudioServicesSection() {
  return (
    <section id="studio-services" className="relative py-32 bg-[#060610] overflow-hidden">
      <motion.div className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        animate={{ top: ["10%", "90%"] }} transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "linear" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-20 flex flex-col items-center text-center">
          <Eyebrow>What We Shoot</Eyebrow>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.93] mb-5 text-white">
            Studio built for<br />
            <span style={{ background:"linear-gradient(135deg,#c8a84a,#ffd93d 50%,#ff6b6b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>every moment.</span>
          </h2>
          <p className="max-w-md text-white/40 text-base">From newborns to boardrooms — Studio Hut has the space, gear, and eye for it.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studioServices.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-40px" }} transition={{ duration:0.5, delay:i*0.07 }}
              whileHover={{ y:-6 }} className="group relative rounded-2xl border border-white/8 p-6 cursor-pointer overflow-hidden"
              style={{ background:`linear-gradient(160deg,${s.color}06 0%,rgba(8,8,16,0.95) 60%)` }}>
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background:`radial-gradient(circle,${s.color}30,transparent 70%)`, filter:"blur(20px)" }} />
              <motion.div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background:s.color }}
                initial={{ scaleY:0 }} whileInView={{ scaleY:1 }} viewport={{ once:true }} transition={{ delay:0.3+i*0.07 }} />
              <div className="relative">
                <motion.div className="text-3xl mb-4" animate={{ rotate:[0,-5,5,0] }} transition={{ duration:4, repeat:Infinity, delay:i*0.5 }}>{s.icon}</motion.div>
                <h3 className="font-display text-xl text-white mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:s.color }}>Enquire <span className="ml-1">→</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudioGearSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  return (
    <section id="studio-gear" ref={containerRef} className="relative py-32 bg-[#060610] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="font-display text-[20vw] font-black text-white/[0.015] uppercase tracking-tight">GEAR</span>
      </div>
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-16 grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <Eyebrow>Studio Arsenal</Eyebrow>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.93] text-white">
              Professional gear.<br />
              <span style={{ background:"linear-gradient(135deg,#c8a84a,#ffd93d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontStyle:"italic" }}>Flawless results.</span>
            </h2>
          </div>
          <p className="text-white/40 text-base leading-relaxed lg:text-right">Everything maintained, calibrated, and ready to shoot.</p>
        </motion.div>
        <div className="overflow-hidden">
          <motion.div style={{ x }} className="flex gap-4 pb-2">
            {studioEquipment.map((item, i) => (
              <motion.div key={item.name} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.4, delay:i*0.06 }}
                className="group flex-shrink-0 w-44 rounded-2xl border border-white/8 p-5 bg-white/[0.03] hover:border-primary/30 hover:bg-primary/4 transition-all">
                <motion.div className="text-2xl mb-3" animate={{ rotateY:[0,360] }} transition={{ duration:4, repeat:Infinity, delay:i*0.8, ease:"linear" }}>{item.icon}</motion.div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/25 mb-1">{item.category}</div>
                <div className="font-medium text-sm text-white/80 leading-tight mb-1">{item.name}</div>
                <div className="text-[10px] text-primary/60 font-mono">{item.spec}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{n:"1,200 sq.ft",l:"Studio Floor"},{n:"6",l:"Backdrop Options"},{n:"12+",l:"Light Modifiers"},{n:"2",l:"Shooting Bays"}].map(({n,l}) => (
            <div key={l} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center hover:border-primary/20 transition-colors">
              <div className="font-display text-3xl text-primary mb-1">{n}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/30">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ShutterReel() {
  return (
    <div className="relative py-20 bg-[#060610] overflow-hidden">
      <div className="flex items-center gap-0 mb-8 overflow-hidden opacity-20">
        {[...Array(30)].map((_,i) => <div key={i} className="flex-shrink-0 w-8 h-12 border border-white/30 mx-0.5 rounded-sm flex flex-col justify-between py-1 px-0.5"><div className="w-1 h-1 rounded-full bg-white/60 mx-auto" /><div className="w-1 h-1 rounded-full bg-white/60 mx-auto" /></div>)}
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.9 }}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-white/30 text-xs uppercase tracking-widest">Studio Hut Photography</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <p className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-white mb-6" style={{ fontStyle:"italic" }}>
            <span style={{ background:"linear-gradient(135deg,#c8a84a,#ffd93d 50%,#ff6b6b)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>"Light is the language.</span>
            <br /><span className="text-white/60">We're fluent."</span>
          </p>
          <p className="text-xs uppercase tracking-[0.4em] text-white/25">— Studio Hut Photography, Kottayam</p>
          <motion.div initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }} className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="tel:+919999999999" className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-medium text-white/60 hover:text-primary hover:border-primary/40 transition">📞 Call Studio</a>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="rounded-full border border-green-500/30 bg-green-500/8 px-6 py-2.5 text-xs font-medium text-green-400 hover:bg-green-500/20 transition">💬 WhatsApp Us</a>
            <a href="https://instagram.com/studiohutphotography" target="_blank" rel="noreferrer" className="rounded-full border border-pink-500/30 bg-pink-500/8 px-6 py-2.5 text-xs font-medium text-pink-400 hover:bg-pink-500/20 transition">📷 @studiohut</a>
          </motion.div>
        </motion.div>
      </div>
      <div className="flex items-center gap-0 mt-8 overflow-hidden opacity-20">
        {[...Array(30)].map((_,i) => <div key={i} className="flex-shrink-0 w-8 h-12 border border-white/30 mx-0.5 rounded-sm flex flex-col justify-between py-1 px-0.5"><div className="w-1 h-1 rounded-full bg-white/60 mx-auto" /><div className="w-1 h-1 rounded-full bg-white/60 mx-auto" /></div>)}
      </div>
    </div>
  );
}

function StudioToFestivalBridge() {
  return (
    <div className="relative py-20 overflow-hidden bg-[#060610]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#060610] via-[#060610]/80 to-background" />
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="flex items-center gap-4 justify-center mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
          <div className="text-xl">✦</div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
        </div>
        <p className="text-white/30 text-sm uppercase tracking-[0.35em] mb-2">Also specialists in</p>
        <h3 className="font-display text-4xl md:text-5xl text-white" style={{ fontStyle:"italic" }}>Festival <span className="text-gradient-gold">Photography</span></h3>
        <p className="mt-4 text-white/30 text-sm max-w-sm mx-auto">Studio Hut is the official photography studio for the Aambal Vasantham festival.</p>
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }} className="mt-8 text-primary/50 text-xl">↓</motion.div>
      </motion.div>
    </div>
  );
}

function SocialProofBar() {
  const stats = [{ n:"7", l:"years at the festival" }, { n:"1,200+", l:"families served" }, { n:"48h", l:"delivery promise" }, { n:"4K", l:"cinematic aerials" }, { n:"100%", l:"DGCA certified" }, { n:"5★", l:"average rating" }];
  return (
    <div className="border-y border-primary/10 overflow-hidden bg-gradient-to-r from-primary/[0.03] via-primary/[0.06] to-primary/[0.03]">
      <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:32, ease:"linear", repeat:Infinity }} className="flex gap-0 whitespace-nowrap w-max py-[14px]">
        {[...Array(2)].map((_,rep) => (
          <div key={rep} className="flex items-center">
            {stats.map(({ n, l }) => (
              <div key={n+l} className="flex items-center gap-8 px-10">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-2xl text-primary">{n}</span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{l}</span>
                </div>
                <span className="text-primary/20 text-sm">◆</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PackagesSection() {
  return (
    <section id="packages" className="relative py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage:"linear-gradient(rgba(200,168,74,1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,74,1) 1px,transparent 1px)", backgroundSize:"80px 80px" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-20 flex flex-col items-center text-center">
          <Eyebrow>Services & Pricing</Eyebrow>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mb-6">Four packages.<br /><span className="italic text-gradient-gold">One festival.</span></h2>
          <p className="max-w-md text-muted-foreground">Every package built for the Aambal Vasantham light.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {packageTeasers.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.5, delay:i*0.08 }}
              className="group relative rounded-3xl border p-6 flex flex-col gap-5 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
              style={{ borderColor:`${p.color}20`, background:`linear-gradient(160deg,${p.color}08 0%,rgba(10,10,15,0.9) 70%)` }}>
              {(p as any).hot && <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full" style={{ background:p.color, color:"#0a0a0a" }}>Popular</span>}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background:`${p.color}10`, border:`1px solid ${p.color}20` }}>{p.icon}</div>
              <div className="flex-1">
                <h3 className="font-display text-xl leading-tight mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground/60 tracking-widest uppercase mb-2">{p.duration}</p>
                <p className="text-sm text-muted-foreground/70">{p.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor:`${p.color}15` }}>
                <span className="font-display text-2xl" style={{ color:p.color }}>{p.price}</span>
                <Link to="/booking-confirmed" search={{ plan: p.id }} className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
                  style={{ background:`${p.color}18`, color:p.color, border:`1px solid ${p.color}30` }} onClick={e => e.stopPropagation()}>Book →</Link>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/6 via-primary/10 to-primary/6 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🚁</div>
            <div><p className="font-semibold text-sm text-foreground">Drone Add-on · attach to any package</p><p className="text-xs text-muted-foreground mt-0.5">90-min flight · DGCA certified · 4K ProRes</p></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl text-gradient-gold">+ ₹6,500</span>
            <Link to="/packages" className="rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all">View all →</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <Section id="process">
      <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-20 text-center">
        <Eyebrow>Simple & certain</Eyebrow>
        <h2 className="font-display text-5xl md:text-6xl">How it <span className="italic text-gradient-gold">works.</span></h2>
      </motion.div>
      <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="hidden lg:block absolute top-[28px] left-[16%] right-[16%] h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(200,168,74,0.25) 20%,rgba(200,168,74,0.25) 80%,transparent)" }} />
        {processSteps.map((step, i) => (
          <motion.div key={step.n} initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.5, delay:i*0.1 }}
            className="relative flex flex-col items-center text-center group">
            <div className="relative mb-8 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent z-10">
              {step.icon}
              <span className="absolute -top-2.5 -right-2.5 text-[10px] font-black tracking-widest text-primary/50 bg-background px-1 rounded">{step.n}</span>
            </div>
            <h3 className="font-display text-xl mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(200,168,74,0.03) 80px)" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-16 text-center">
          <Eyebrow>Guest voices</Eyebrow>
          <h2 className="font-display text-5xl md:text-6xl">What they <span className="italic text-gradient-gold">said after.</span></h2>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-12 items-start">
          <div className="flex flex-col gap-2">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setActive(i)} className={`text-left rounded-2xl border px-5 py-4 transition-all duration-300 ${i===active?"border-primary/40 bg-primary/8":"border-border/30 hover:border-primary/20 hover:bg-primary/4"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display shrink-0 ${i===active?"bg-primary text-primary-foreground":"bg-primary/10 text-primary"}`}>{t.name[0]}</div>
                  <div>
                    <p className={`font-semibold text-sm ${i===active?"text-primary":"text-muted-foreground"}`}>{t.name}</p>
                    <p className="text-[10px] text-muted-foreground/50 tracking-wider">{t.pkg}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} transition={{ duration:0.35 }}
              className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/6 to-transparent p-8 md:p-12 relative overflow-hidden">
              <div className="font-display text-[120px] leading-none text-primary/8 absolute top-0 left-6 select-none">"</div>
              <div className="relative">
                <div className="mb-6" style={{ letterSpacing:4, color:"#c8a84a", fontSize:18 }}>{"★".repeat(testimonials[active].stars)}</div>
                <p className="font-display text-2xl md:text-3xl lg:text-4xl leading-[1.35] text-foreground mb-8 italic">{testimonials[active].quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center font-display text-primary">{testimonials[active].name[0]}</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonials[active].name}</p>
                    <p className="text-xs text-primary/60 tracking-widest uppercase">{testimonials[active].pkg}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DroneSection() {
  return (
    <Section id="drone">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
        <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }} className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border/40">
            <img src={aerial} alt="Aerial drone view of festival" loading="lazy" className="w-full object-cover aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
          <motion.div initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:0.4, type:"spring" }}
            className="absolute -bottom-6 -left-6 rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl p-5 shadow-2xl max-w-[200px]">
            <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Feed</span></div>
            <div className="font-display text-lg leading-tight">Altitude 78m</div>
            <div className="text-xs text-muted-foreground mt-1">4K · Hold for procession</div>
          </motion.div>
          <motion.div initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:0.6, type:"spring" }}
            className="absolute -top-4 -right-4 rounded-2xl border border-primary/25 bg-background/95 backdrop-blur-xl p-4 shadow-xl">
            <div className="font-display text-3xl text-primary">4K</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">ProRes Ready</div>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}>
          <Eyebrow>Drone Shots</Eyebrow>
          <h2 className="font-display text-5xl md:text-6xl mb-6 leading-[0.95]">See the festival<br /><span className="italic text-gradient-gold">from above.</span></h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">A drone changes everything. The lamp-pattern around the temple, the procession winding through the streets, the lily-pond reflecting fireworks.</p>
          <div className="grid gap-3 sm:grid-cols-2 mb-10">
            {droneFeatures.map(f => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-card/20 p-5 hover:border-primary/30 hover:bg-primary/4 transition-all group">
                <div className="text-xl mb-3">{f.icon}</div>
                <div className="font-medium text-sm text-foreground mb-1.5 group-hover:text-primary transition-colors">{f.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.text}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-6 flex items-center justify-between gap-4 flex-wrap">
            <div><div className="font-display text-xl mb-1">Drone Add-on</div><div className="text-xs text-muted-foreground">Attach to any package · 90-min flight</div></div>
            <div className="font-display text-3xl text-gradient-gold">+ ₹6,500</div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function QuoteBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.08]);
  return (
    <div ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <motion.div style={{ y, scale }} className="pointer-events-none absolute inset-0">
        <img src={portrait} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80" />
      </motion.div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.9 }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/60 text-xs uppercase tracking-widest">Seven years. One festival.</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <p className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] italic text-gradient-gold mb-8">"We know which corner of the tank glows at 6:42pm."</p>
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/50">— Seven years covering the same festival</p>
        </motion.div>
      </div>
    </div>
  );
}

function PressBar() {
  return (
    <section className="py-14 border-y border-border/20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground/35 mb-8">As featured in</p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 items-center">
          {["Kerala Tourism","The Hindu","Mathrubhumi","Wedding Wire India","Photography.in"].map(name => (
            <span key={name} className="font-display text-base text-muted-foreground/25 hover:text-muted-foreground/55 transition-colors cursor-default tracking-widest">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function UrgencyStrip() {
  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      className="rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/8 via-primary/6 to-accent/8 p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="relative"><span className="inline-flex h-3 w-3 rounded-full bg-accent animate-ping absolute" /><span className="inline-flex h-3 w-3 rounded-full bg-accent relative" /></div>
        <p className="font-semibold text-sm text-foreground">Festival season 2026 — <span className="text-primary">limited slots remaining</span></p>
      </div>
      <a href="#book" className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/85 transition glow-gold">Reserve now →</a>
    </motion.div>
  );
}

function BookingSection() {
  return (
    <Section id="book">
      <div className="grid gap-12 xl:grid-cols-[0.9fr_1.4fr] items-start">
        <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="max-w-[440px]">
          <Eyebrow>Reserve a slot</Eyebrow>
          <h2 className="font-display text-5xl xl:text-6xl leading-[0.95] mb-6">The dates fill<br /><span className="italic text-gradient-gold">fast.</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-10">Limited bookings each festival night so every family gets undivided attention.</p>
          <div className="space-y-4">
            {[{ title:"No advance for portrait sittings", sub:"Pay only on the day of shoot." }, { title:"20% advance for full-day & bridal", sub:"Refundable up to 7 days prior." }, { title:"Drone subject to weather clearance", sub:"Free reschedule if grounded." }].map(({ title, sub }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-border/30 hover:border-primary/20 hover:bg-primary/3 transition-all">
                <span className="text-primary mt-0.5 flex-shrink-0">✦</span>
                <div><div className="font-medium text-sm text-foreground mb-0.5">{title}</div><div className="text-xs text-muted-foreground">{sub}</div></div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
          className="rounded-3xl border border-border/50 bg-card/30 p-4 sm:p-7 md:p-10 backdrop-blur-2xl overflow-hidden relative">
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background:"radial-gradient(circle,#c8a84a,transparent 70%)", filter:"blur(60px)" }} />
          <div className="relative"><BookingForm selectedPlan={{ name:"Festival Portrait", price:"₹4,999" }} onBookingComplete={() => {}} /></div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "media_gallery"), orderBy("createdAt", "desc"), limit(6));
    const unsub = onSnapshot(q, (snap) => {
      setMediaItems(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    });
    return () => unsub();
  }, []);

  return (
    <div id="top" className="relative" style={{ overflowX: "clip" }}>
      {/* ── LOADING SCREEN ── renders on top until progress hits 100% */}
      <LoadingScreen onComplete={() => setAppReady(true)} />

      <Toaster theme="dark" position="top-center" richColors />
      <FlyingDrone />
      <Nav />

      {/* Customer portal FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.a href="/customer-login" whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-5 py-3.5 text-white shadow-2xl backdrop-blur-2xl hover:border-pink-400/40 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-lg shrink-0">👤</div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight">Customer Portal</div>
            <div className="text-[10px] text-white/40">View bookings</div>
          </div>
        </motion.a>
      </div>

      <StudioIntroSection />
      <StudioEquipment/>
      <FestivalPhotoFrame />
      <div style={{ position: "relative", zIndex: 50 }} />
      <EquipmentTicker />

      <StudioServicesSection />
      <StudioGearSection />
      <ShutterReel />
      <StudioToFestivalBridge />

      {/* Festival Hero */}
      <section id="festival-hero" className="relative flex min-h-screen items-end overflow-hidden pb-24 pt-32">
        <img src={hero} alt="Aambal Vasantham festival night" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/10 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-6">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-background/50 px-4 py-2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary/80 font-medium">Aambal Vasantham · 2026</span>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.1, ease:[0.22,1,0.36,1] }}
            className="font-display text-6xl md:text-8xl lg:text-[110px] leading-[0.92] tracking-tight mb-8">
            The festival,<br /><span className="italic text-gradient-gold">remembered</span><br /><span className="text-foreground/60">in light.</span>
          </motion.h1>
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.4 }}
            className="max-w-lg text-lg text-muted-foreground leading-relaxed mb-12">
            A boutique studio crafting photographs and cinematic drone films of the Aambal Vasantham water-lily festival.
          </motion.p>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.55 }} className="flex flex-wrap gap-3 mb-24">
            <a href="#book" className="rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground hover:bg-primary/85 transition glow-gold text-sm tracking-wide">Book a shoot</a>
            <a href="#drone" className="rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-8 py-4 font-medium text-foreground/80 hover:border-primary/40 hover:text-primary transition text-sm">See drone work ↓</a>
            <Link to="/packages" className="rounded-full border border-pink-500/30 bg-pink-500/8 px-8 py-4 font-medium text-pink-300 hover:bg-pink-500/20 transition text-sm">View packages →</Link>
          </motion.div>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }} className="flex items-end justify-between text-[10px] uppercase tracking-[0.28em] text-muted-foreground/40">
            <span>Scroll · watch the drone land below ↓</span>
            <span className="hidden md:block">Madurai · Tamil Nadu</span>
          </motion.div>
        </div>
      </section>

      {/* Drone landing pad */}
      <div id="drone-landing-pad" className="pointer-events-none relative" style={{ height: 0, marginTop: "-1px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: "spring" }}
          className="absolute left-[8%] -top-6 flex flex-col items-center gap-1 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
            className="w-20 h-20 rounded-full border border-primary/30 absolute -top-5 -left-5" />
          <div className="w-10 h-10 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary/60" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.3em] text-primary/30 font-mono mt-1">Landing</span>
        </motion.div>
      </div>

      <SocialProofBar />
      <PackagesSection />

      <Section id="about" className="relative">
        <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background:"radial-gradient(circle,#c8a84a,transparent)", filter:"blur(80px)" }} />
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-28">
          <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <Eyebrow>About the festival</Eyebrow>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.95]">Three nights of<br /><span className="italic text-gradient-gold">lilies, lamps</span><br />& song.</h2>
          </motion.div>
          <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} className="space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">Aambal Vasantham — the "spring of the water lily" — gathers families around lotus-lit ponds and lamp-lined temple corridors.</p>
            <p className="text-lg leading-relaxed">We've covered it for seven years. We know which corner of the tank glows at 6:42pm, which procession route the elephants take, and which roof gives the drone the cleanest line.</p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/30">
              {[["7","Years covering"],["1.2k","Families"],["48h","Delivery"]].map(([n,l]) => (
                <div key={l} className="text-center"><div className="font-display text-4xl text-primary mb-1">{n}</div><div className="text-xs text-muted-foreground/60 uppercase tracking-wider">{l}</div></div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      <div className="lotus-divider mx-auto max-w-5xl" />
      <ProcessSection />
      <DroneSection />
      <QuoteBreak />
      <TestimonialsSection />
      <PressBar />

      {mediaItems.length > 0 && (
        <Section id="dynamic-gallery">
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-14 text-center">
            <Eyebrow>Latest Work</Eyebrow>
            <h2 className="font-display text-4xl md:text-5xl">From the <span className="italic text-gradient-gold">field.</span></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mediaItems.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity:0, scale:0.96 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                className="group relative overflow-hidden rounded-2xl border border-white/6 bg-card/20" style={{ aspectRatio:i===0?"16/9":"4/3" }}>
                {item.type==="image" ? <img src={item.src} alt={item.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/> : <video src={item.src} autoPlay muted loop playsInline className="h-full w-full object-cover"/>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <p className="text-xs font-medium text-white/80">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      <InstagramFeed />
      <HomestaySection />

      <Section id="gallery">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-14 text-center">
          <Eyebrow>Gallery</Eyebrow>
          <h2 className="font-display text-5xl md:text-6xl">Moments we've <span className="italic text-gradient-gold">captured.</span></h2>
        </motion.div>
        <GallerySection />
      </Section>

      <div className="px-6 py-8 max-w-7xl mx-auto"><UrgencyStrip /></div>
      <BookingSection />

      <footer className="border-t border-border/30 mt-10 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row justify-between gap-8 text-sm text-muted-foreground">
          <div>
            <div className="font-display text-2xl text-gradient-gold mb-1">Studio Hut Photography</div>
            <div className="font-display text-sm text-muted-foreground/50 mb-2">× Aambal Vasantham Studio</div>
            <p>Kottayam · Kerala · India</p>
            <div className="flex gap-4 mt-4">
              <Link to="/packages" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">Packages</Link>
              <Link to="/homestay" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">Homestay</Link>
              <a href="#book" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">Book</a>
            </div>
          </div>
          <div className="md:text-right space-y-1">
            <p>hello@studiohut.in</p>
            <p>+91 98xxx xxxxx</p>
            <p className="text-xs mt-4 opacity-40">© {new Date().getFullYear()} Studio Hut Photography · Kottayam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

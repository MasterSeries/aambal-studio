import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";


import { db } from "@/lib/firebase";
// ── Camera shutter SVG animation ──────────────────────────────────────────────
function CameraAnimation() {
  return (
    <div style={{ width: 120, height: 120, margin: "0 auto" }}>
      <style>{`
        @keyframes shutter { 0%,100%{transform:scale(1)} 50%{transform:scale(0.85)} }
        @keyframes flash { 0%,90%,100%{opacity:0} 95%{opacity:1} }
        @keyframes lens-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .cam-shutter { animation: shutter 2s ease-in-out infinite; }
        .cam-flash   { animation: flash 3s ease-in-out infinite; }
        .cam-lens    { animation: lens-spin 6s linear infinite; }
      `}</style>
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <g className="cam-shutter">
          <rect x="20" y="35" width="80" height="58" rx="8" fill="#1a1a2e" stroke="#d4a843" strokeWidth="2"/>
          <rect x="30" y="28" width="25" height="10" rx="3" fill="#d4a843"/>
          <rect x="78" y="33" width="12" height="8" rx="2" fill="#2a2a3e"/>
          <circle cx="60" cy="64" r="20" fill="#0f0f1e" stroke="#d4a843" strokeWidth="2"/>
          <g className="cam-lens">
            <circle cx="60" cy="64" r="14" fill="#1a1a2e" stroke="#c8a84a" strokeWidth="1"/>
            <circle cx="60" cy="64" r="8"  fill="#0a0a18" stroke="#b89840" strokeWidth="1"/>
            <circle cx="56" cy="60" r="2.5" fill="#d4a843" opacity="0.6"/>
          </g>
          <circle cx="60" cy="64" r="3" fill="#e8c97a"/>
        </g>
        <rect x="10" y="20" width="100" height="80" rx="10" fill="white" opacity="0" className="cam-flash"/>
      </svg>
    </div>
  );
}

// ── Drone SVG animation ────────────────────────────────────────────────────────
function DroneAnimation() {
  return (
    <div style={{ width: 140, height: 120, margin: "0 auto" }}>
      <style>{`
        @keyframes drone-hover  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes drone-rotor  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes drone-light  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes drone-beam   { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        .drone-body { animation: drone-hover 2s ease-in-out infinite; transform-origin: 70px 55px; }
        .drone-r1   { animation: drone-rotor 0.1s linear infinite;         transform-origin: 30px  40px; }
        .drone-r2   { animation: drone-rotor 0.1s linear infinite reverse; transform-origin: 110px 40px; }
        .drone-r3   { animation: drone-rotor 0.1s linear infinite;         transform-origin: 30px  70px; }
        .drone-r4   { animation: drone-rotor 0.1s linear infinite reverse; transform-origin: 110px 70px; }
        .drone-led  { animation: drone-light 1s ease-in-out infinite; }
        .drone-led2 { animation: drone-light 1s ease-in-out infinite 0.5s; }
        .drone-beam { animation: drone-beam  2s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg">
        <polygon points="55,80 85,80 95,110 45,110" fill="#d4a843" opacity="0.15" className="drone-beam"/>
        <g className="drone-body">
          <line x1="30"  y1="40" x2="110" y2="40" stroke="#2a2a3e" strokeWidth="3" strokeLinecap="round"/>
          <line x1="30"  y1="70" x2="110" y2="70" stroke="#2a2a3e" strokeWidth="3" strokeLinecap="round"/>
          <line x1="30"  y1="40" x2="30"  y2="70" stroke="#2a2a3e" strokeWidth="3" strokeLinecap="round"/>
          <line x1="110" y1="40" x2="110" y2="70" stroke="#2a2a3e" strokeWidth="3" strokeLinecap="round"/>
          <rect x="55" y="48" width="30" height="14" rx="4" fill="#1a1a2e" stroke="#d4a843" strokeWidth="1.5"/>
          <circle cx="70" cy="55" r="5" fill="#0f0f1e" stroke="#c8a84a" strokeWidth="1"/>
          <circle cx="70" cy="55" r="2" fill="#e8c97a"/>
          <g className="drone-r1">
            <ellipse cx="30" cy="40" rx="14" ry="2.5" fill="#444" opacity="0.8"/>
            <ellipse cx="30" cy="40" rx="14" ry="2.5" fill="#666" opacity="0.5" transform="rotate(60,30,40)"/>
          </g>
          <g className="drone-r2">
            <ellipse cx="110" cy="40" rx="14" ry="2.5" fill="#444" opacity="0.8"/>
            <ellipse cx="110" cy="40" rx="14" ry="2.5" fill="#666" opacity="0.5" transform="rotate(60,110,40)"/>
          </g>
          <g className="drone-r3">
            <ellipse cx="30" cy="70" rx="14" ry="2.5" fill="#444" opacity="0.8"/>
            <ellipse cx="30" cy="70" rx="14" ry="2.5" fill="#666" opacity="0.5" transform="rotate(60,30,70)"/>
          </g>
          <g className="drone-r4">
            <ellipse cx="110" cy="70" rx="14" ry="2.5" fill="#444" opacity="0.8"/>
            <ellipse cx="110" cy="70" rx="14" ry="2.5" fill="#666" opacity="0.5" transform="rotate(60,110,70)"/>
          </g>
          <circle cx="30"  cy="40" r="2" fill="#ff4444" className="drone-led"/>
          <circle cx="110" cy="40" r="2" fill="#44ff44" className="drone-led2"/>
          <circle cx="110" cy="70" r="2" fill="#ffffff" className="drone-led"/>
        </g>
      </svg>
    </div>
  );
}

// ── Film reel animation ────────────────────────────────────────────────────────
function FilmAnimation() {
  return (
    <div style={{ width: 140, height: 120, margin: "0 auto" }}>
      <style>{`
        @keyframes reel-spin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes film-strip { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }
        .reel-spin  { animation: reel-spin 3s linear infinite;         transform-origin: 35px  55px; }
        .reel-spin2 { animation: reel-spin 3s linear infinite reverse; transform-origin: 105px 55px; }
        .film-strip { animation: film-strip 1s linear infinite; }
      `}</style>
      <svg viewBox="0 0 140 110" xmlns="http://www.w3.org/2000/svg">
        <g className="reel-spin">
          <circle cx="35" cy="55" r="28" fill="#1a1a2e" stroke="#d4a843" strokeWidth="2"/>
          <circle cx="35" cy="55" r="8"  fill="#d4a843"/>
          {[0,60,120,180,240,300].map((angle, i) => (
            <rect key={i} x="32" y="27" width="6" height="12" rx="2"
              fill="#d4a843" opacity="0.7" transform={`rotate(${angle},35,55)`}/>
          ))}
        </g>
        <g className="reel-spin2">
          <circle cx="105" cy="55" r="28" fill="#1a1a2e" stroke="#d4a843" strokeWidth="2"/>
          <circle cx="105" cy="55" r="8"  fill="#d4a843"/>
          {[0,60,120,180,240,300].map((angle, i) => (
            <rect key={i} x="102" y="27" width="6" height="12" rx="2"
              fill="#d4a843" opacity="0.7" transform={`rotate(${angle},105,55)`}/>
          ))}
        </g>
        <rect x="20" y="48" width="100" height="14" fill="#2a2a3e"/>
        <clipPath id="filmclip">
          <rect x="20" y="48" width="100" height="14"/>
        </clipPath>
        <g className="film-strip" clipPath="url(#filmclip)">
          {[0,1,2,3,4,5,6].map(i => (
            <rect key={i} x={20 + i * 40} y="50" width="36" height="10" rx="1"
              fill={i % 2 === 0 ? "#d4a843" : "#8a6a20"} opacity="0.6"/>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ── All-in-one animation (camera + drone + film) ──────────────────────────────
function PremiumAnimation() {
  return (
    <div style={{ width: 160, height: 120, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes premium-cam   { 0%,100%{transform:translateX(0) scale(1)} 33%{transform:translateX(-20px) scale(0.9)} 66%{transform:translateX(20px) scale(0.9)} }
        @keyframes premium-drone { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes premium-glow  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .prem-cam   { animation: premium-cam   4s ease-in-out infinite; }
        .prem-drone { animation: premium-drone 2s ease-in-out infinite; }
        .prem-glow  { animation: premium-glow  2s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="60" r="50" fill="#d4a843" opacity="0.05" className="prem-glow"/>
        <circle cx="80" cy="60" r="35" fill="#d4a843" opacity="0.08" className="prem-glow"/>
        <g className="prem-drone">
          <rect x="55" y="20" width="50" height="6" rx="2" fill="#2a2a3e" stroke="#d4a843" strokeWidth="1"/>
          <rect x="55" y="30" width="50" height="6" rx="2" fill="#2a2a3e" stroke="#d4a843" strokeWidth="1"/>
          <rect x="68" y="23" width="24" height="10" rx="3" fill="#1a1a2e" stroke="#c8a84a" strokeWidth="1"/>
          <circle cx="80" cy="28" r="4" fill="#0f0f1e" stroke="#d4a843" strokeWidth="1"/>
          <circle cx="80" cy="28" r="1.5" fill="#e8c97a"/>
        </g>
        <g className="prem-cam">
          <rect x="45" y="55" width="36" height="26" rx="4" fill="#1a1a2e" stroke="#d4a843" strokeWidth="1.5"/>
          <rect x="50" y="50" width="10" height="7"  rx="2" fill="#d4a843"/>
          <circle cx="63" cy="68" r="9" fill="#0f0f1e" stroke="#c8a84a" strokeWidth="1"/>
          <circle cx="63" cy="68" r="5" fill="#1a1a2e"/>
          <circle cx="61" cy="66" r="1.5" fill="#e8c97a" opacity="0.7"/>
        </g>
        <g transform="translate(88,52)">
          <circle cx="0" cy="18" r="16" fill="#1a1a2e" stroke="#d4a843" strokeWidth="1.5"/>
          <circle cx="0" cy="18" r="5"  fill="#d4a843"/>
          {[0,60,120,180,240,300].map((a, i) => (
            <rect key={i} x="-2" y="3" width="4" height="7" rx="1"
              fill="#d4a843" opacity="0.6" transform={`rotate(${a},0,18)`}/>
          ))}
        </g>
        <text x="80" y="108" textAnchor="middle" fontFamily="Georgia,serif"
          fontSize="8" fill="#d4a843" opacity="0.8" letterSpacing="2">
          FULL DAY · ALL FORMATS
        </text>
      </svg>
    </div>
  );
}

// ── Package data ───────────────────────────────────────────────────────────────
const defaultPackages = [
  {
    id: "portrait" as const,
    name: "Festival Portrait",
    tagline: "Intimate. Timeless.",
    price: "₹4,999",
    originalPrice: "₹6,500",
    duration: "1 Hour",
    badge: null,
    color: "#c8a84a",
    accent: "#e8c97a",
    animation: <CameraAnimation />,
    includes: ["photography"],
    items: [
      { icon: "📸", label: "Solo / couple portraits",      detail: "Up to 2 people, multiple locations within the festival" },
      { icon: "🖼️", label: "30+ edited photographs",       detail: "Professionally retouched in our signature warm tone" },
      { icon: "⚡", label: "Same-day preview (5 photos)",   detail: "Delivered to WhatsApp within 4 hours of shoot" },
      { icon: "🌐", label: "Private online gallery",        detail: "Password-protected gallery valid for 90 days" },
      { icon: "📱", label: "Mobile-ready exports",          detail: "Full resolution + Instagram-optimised sizes" },
    ],
    highlight: "Perfect for couples and solo festival-goers wanting a beautiful keepsake.",
    cta: "Book Portrait Session",
  },
  {
    id: "family" as const,
    name: "Family & Group",
    tagline: "Every face. Every moment.",
    price: "₹8,999",
    originalPrice: "₹12,000",
    duration: "2 Hours",
    badge: "Most Booked",
    color: "#e8c97a",
    accent: "#c8a84a",
    animation: <CameraAnimation />,
    includes: ["photography"],
    items: [
      { icon: "👨‍👩‍👧‍👦", label: "Up to 12 family members",      detail: "Multiple group formations + individual portraits" },
      { icon: "🖼️",        label: "80+ edited photographs",       detail: "Candid moments + posed family portraits" },
      { icon: "📸",        label: "Candid + posed coverage",       detail: "Natural storytelling mixed with classic compositions" },
      { icon: "🖨️",        label: "4 printed 8×12 photos",        detail: "Premium glossy print, delivered within 7 days" },
      { icon: "⚡",        label: "Same-day preview (10 photos)",  detail: "Delivered to WhatsApp within 4 hours" },
      { icon: "🌐",        label: "Private online gallery",        detail: "Password-protected gallery valid for 90 days" },
    ],
    highlight: "Our most popular package — designed for large families at the festival.",
    cta: "Book Family Session",
  },
  {
    id: "bridal" as const,
    name: "Bridal / Couple",
    tagline: "Cinematic. Unforgettable.",
    price: "₹14,999",
    originalPrice: "₹20,000",
    duration: "Half Day (4–5 hrs)",
    badge: "Premium",
    color: "#f5dfa0",
    accent: "#d4a843",
    animation: <FilmAnimation />,
    includes: ["photography", "film"],
    items: [
      { icon: "👩‍❤️‍👨", label: "2 dedicated photographers",       detail: "One for candids, one for posed — maximum coverage" },
      { icon: "🖼️",       label: "150+ edited photographs",        detail: "Full ceremony + candid moments throughout the day" },
      { icon: "🎬",       label: "Cinematic highlight reel",        detail: "60-second film edited to music, delivered in 48hrs" },
      { icon: "📖",       label: "Premium photo album",             detail: "Lay-flat 30-page album with custom cover" },
      { icon: "⚡",       label: "Same-day preview (20 photos)",    detail: "Delivered to WhatsApp within 4 hours" },
      { icon: "🌐",       label: "Private online gallery",          detail: "Password-protected gallery valid for 1 year" },
      { icon: "📱",       label: "Social media package",            detail: "5 portrait-ratio exports ready for Instagram" },
    ],
    highlight: "The most cinematic couple coverage we offer — two photographers, a film and a premium album.",
    cta: "Book Bridal Package",
  },
  {
    id: "fullday" as const,
    name: "Full Day Coverage",
    tagline: "Sunrise to last lamp.",
    price: "₹24,999",
    originalPrice: "₹35,000",
    duration: "Sunrise → Night",
    badge: "Best Value",
    color: "#d4a843",
    accent: "#f5dfa0",
    animation: <PremiumAnimation />,
    includes: ["photography", "drone", "film"],
    items: [
      { icon: "🌅", label: "Full procession + temple + reception", detail: "Complete end-to-end coverage of the festival day" },
      { icon: "🖼️", label: "300+ edited photographs",              detail: "Every key moment documented in stunning detail" },
      { icon: "🚁", label: "Drone aerial coverage included",        detail: "DJI Mavic 3 Pro · 90-min flight · 4K cinematic aerials" },
      { icon: "🎬", label: "4K highlight film",                     detail: "3–5 minute cinematic documentary of your day" },
      { icon: "📖", label: "Premium lay-flat album",                detail: "40-page premium album with custom design" },
      { icon: "⚡", label: "Same-day aerial teaser reel",           detail: "60-second drone reel delivered before midnight" },
      { icon: "👥", label: "3 photographers",                       detail: "Ground + aerial + dedicated portrait photographer" },
      { icon: "🖨️", label: "8 printed 12×16 photos",               detail: "Large format premium glossy prints" },
    ],
    highlight: "Everything we do, in one package. The complete Aambal Vasantham story.",
    cta: "Book Full Day",
  },
];

type Package =
  typeof defaultPackages[number];

// ── Detail modal ───────────────────────────────────────────────────────────────
function PackageModal({
  pkg,
  onClose,
  onBook,
}: {
  pkg: Package;
  onClose: () => void;
  onBook: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", overflowY: "auto",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 680,
          background: "linear-gradient(135deg,#0d1117 0%,#0a0f1a 100%)",
          border: `1.5px solid ${pkg.color}40`,
          borderRadius: 28, overflow: "hidden",
          boxShadow: `0 0 60px ${pkg.color}20, 0 30px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg,${pkg.color}18 0%,${pkg.color}06 100%)`,
          padding: "2.5rem 2.5rem 2rem",
          borderBottom: `1px solid ${pkg.color}20`,
          position: "relative",
        }}>
          {/* close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white", borderRadius: "50%",
              width: 36, height: 36, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>

          {pkg.badge && (
            <div style={{
              display: "inline-block", marginBottom: 12,
              background: pkg.color, color: "#0a0a0a",
              fontSize: 10, fontWeight: 800, letterSpacing: 3,
              textTransform: "uppercase", padding: "4px 14px", borderRadius: 100,
            }}>{pkg.badge}</div>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 400,
                color: "white", margin: 0, lineHeight: 1.1,
              }}>{pkg.name}</h2>
              <p style={{
                color: pkg.color, fontFamily: "Georgia, serif",
                fontStyle: "italic", marginTop: 4, fontSize: "1.1rem",
              }}>{pkg.tagline}</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", color: pkg.color, fontWeight: 400 }}>
                  {pkg.price}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", textDecoration: "line-through", fontSize: "1.1rem" }}>
                  {pkg.originalPrice}
                </span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
                {pkg.duration}
              </div>
            </div>
            <div>{pkg.animation}</div>
          </div>

          {/* includes badges */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {pkg.includes.includes("photography") && (
              <span style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.3)", color: "#d4a843", padding: "4px 12px", borderRadius: 100, fontSize: 12, letterSpacing: 1 }}>
                📸 Photography
              </span>
            )}
            {pkg.includes.includes("drone") && (
              <span style={{ background: "rgba(100,180,255,0.12)", border: "1px solid rgba(100,180,255,0.3)", color: "#7dd3fc", padding: "4px 12px", borderRadius: 100, fontSize: 12, letterSpacing: 1 }}>
                🚁 Drone Aerials
              </span>
            )}
            {pkg.includes.includes("film") && (
              <span style={{ background: "rgba(200,150,255,0.12)", border: "1px solid rgba(200,150,255,0.3)", color: "#d8b4fe", padding: "4px 12px", borderRadius: 100, fontSize: 12, letterSpacing: 1 }}>
                🎬 Cinematic Film
              </span>
            )}
          </div>
        </div>

        {/* ── Items ── */}
        <div style={{ padding: "2rem 2.5rem" }}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", marginBottom: 24, fontStyle: "italic", lineHeight: 1.6 }}>
            {pkg.highlight}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pkg.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "14px 16px",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}>{item.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.83rem", marginTop: 3, lineHeight: 1.5 }}>{item.detail}</div>
                </div>
                <span style={{ marginLeft: "auto", color: pkg.color, fontSize: 18, flexShrink: 0 }}>✦</span>
              </motion.div>
            ))}
          </div>

          {/* ── CTA — navigates to booking-confirmed page ── */}
          <button
            onClick={onBook}
            style={{
              display: "block", width: "100%", textAlign: "center", marginTop: 28,
              background: `linear-gradient(135deg,${pkg.color} 0%,${pkg.color}cc 100%)`,
              color: "#0a0a0a", fontWeight: 800, fontSize: "1rem",
              padding: "16px 32px", borderRadius: 100, border: "none",
              cursor: "pointer", letterSpacing: 1,
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: `0 8px 30px ${pkg.color}40`,
            }}
          >
            {pkg.cta} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PackagesShowcase() {

  const navigate = useNavigate();
  const [selected, setSelected] = useState<Package | null>(null);
const [
  packages,
  setPackages,
] = useState(defaultPackages);
useEffect(() => {

  const ref =
    doc(
      db,
      "siteContent",
      "packages"
    );

  async function initPackages() {

    const snap =
      await getDoc(
        ref
      );

    // AUTO CREATE FIREBASE DOC
    if (
      !snap.exists()
    ) {

      const firebaseData =
  Object.fromEntries(

    defaultPackages.map(
      (p) => [

        p.id,

        {

          id: p.id,
          name: p.name,
          tagline: p.tagline,
          price: p.price,
          originalPrice:
            p.originalPrice,
          duration:
            p.duration,
          badge:
            p.badge,
          color:
            p.color,
          accent:
            p.accent,
          includes:
            p.includes,
          items:
            p.items,
          highlight:
            p.highlight,
          cta:
            p.cta,

        },

      ]
    )
  );

      await setDoc(
        ref,
        firebaseData
      );
    }
  }

  initPackages();

  const unsub =
    onSnapshot(
      ref,

      (snap) => {

        // FALLBACK
        if (
          !snap.exists()
        ) {

          setPackages(
            defaultPackages
          );

          return;
        }

        const data =
          snap.data();

        const merged =
          defaultPackages.map(
            (
              defaultPkg
            ) => {

              const adminPkg =
                data[
                  defaultPkg.id
                ];

              if (
                !adminPkg
              ) {

                return defaultPkg;
              }

              return {

                ...defaultPkg,

                ...(adminPkg || {}),

                // SAFE FALLBACKS
                includes:
                  adminPkg.includes ||
                  defaultPkg.includes,

                items:
                  adminPkg.items ||
                  defaultPkg.items,

                color:
                  adminPkg.color ||
                  defaultPkg.color,

                accent:
                  adminPkg.accent ||
                  defaultPkg.accent,

                animation:
  defaultPkg.animation || null,
              };
            }
          );

        setPackages(
          merged
        );
      }
    );

  return () =>
    unsub();

}, []);
  /** Close modal + navigate to the cinematic booking-confirmed page */
  function handleBook(pkg: Package) {
    setSelected(null);
    navigate({ to: "/booking-confirmed", search: { plan: pkg.id } });
  }

  return (
    <section
      id="packages-showcase"
      style={{
        background: "linear-gradient(180deg,#060f1e 0%,#030810 100%)",
        padding: "6rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse,rgba(212,168,67,0.06) 0%,transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <p style={{ color: "#d4a843", fontSize: "0.7rem", letterSpacing: 6, textTransform: "uppercase", marginBottom: 16 }}>
            Services & Pricing
          </p>
          <h2 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 400, color: "white", margin: 0, lineHeight: 1.05,
          }}>
            Choose your{" "}
            <span style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg,#d4a843,#f5dfa0,#c8a84a)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>coverage.</span>
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.45)", marginTop: 16, fontSize: "1.05rem",
            maxWidth: 480, margin: "16px auto 0",
          }}>
            Every package crafted for the Aambal Vasantham festival. Tap a package to see everything included.
          </p>
        </motion.div>

        {/* ── Cards grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {packages.map((pkg, i) => (
            <motion.button
              key={pkg.id}
              onClick={() => setSelected(pkg)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                background: `linear-gradient(160deg,${pkg.color}12 0%,rgba(10,15,26,0.95) 60%)`,
                border: pkg.badge === "Most Booked"
                  ? `2px solid ${pkg.color}70`
                  : `1px solid ${pkg.color}30`,
                borderRadius: 24, padding: "2rem 1.75rem",
                cursor: "pointer", textAlign: "left",
                position: "relative", overflow: "hidden",
                boxShadow: pkg.badge === "Most Booked"
                  ? `0 0 40px ${pkg.color}20, 0 20px 50px rgba(0,0,0,0.6)`
                  : "0 20px 50px rgba(0,0,0,0.5)",
                transition: "box-shadow 0.3s",
              }}
            >
              {/* glow corner */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: 120, height: 120,
                background: `radial-gradient(circle at top right,${pkg.color}18,transparent 70%)`,
                pointerEvents: "none",
              }}/>

              {pkg.badge && (
                <div style={{
                  display: "inline-block", marginBottom: 16,
                  background: pkg.badge === "Most Booked" ? pkg.color : "transparent",
                  border: pkg.badge === "Most Booked" ? "none" : `1px solid ${pkg.color}60`,
                  color: pkg.badge === "Most Booked" ? "#0a0a0a" : pkg.color,
                  fontSize: 9, fontWeight: 800, letterSpacing: 3,
                  textTransform: "uppercase", padding: "4px 14px", borderRadius: 100,
                }}>{pkg.badge}</div>
              )}

              {/* animation */}
              <div style={{ marginBottom: 16 }}>{pkg.animation}</div>

              {/* name */}
              <h3 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "1.5rem", fontWeight: 400, color: "white",
                margin: 0, lineHeight: 1.15,
              }}>{pkg.name}</h3>
              <p style={{ color: pkg.color, fontStyle: "italic", fontFamily: "Georgia,serif", fontSize: "0.9rem", marginTop: 4 }}>
                {pkg.tagline}
              </p>

              {/* duration */}
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>
                {pkg.duration}
              </div>

              {/* price */}
              <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: pkg.color }}>{pkg.price}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", textDecoration: "line-through", fontSize: "0.9rem" }}>{pkg.originalPrice}</span>
              </div>

              {/* includes pills */}
              <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                {pkg.includes.includes("photography") && (
                  <span style={{ fontSize: 11, color: "rgba(212,168,67,0.8)", background: "rgba(212,168,67,0.1)", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(212,168,67,0.2)" }}>
                    📸 Photo
                  </span>
                )}
                {pkg.includes.includes("drone") && (
                  <span style={{ fontSize: 11, color: "rgba(125,211,252,0.8)", background: "rgba(125,211,252,0.1)", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(125,211,252,0.2)" }}>
                    🚁 Drone
                  </span>
                )}
                {pkg.includes.includes("film") && (
                  <span style={{ fontSize: 11, color: "rgba(216,180,254,0.8)", background: "rgba(216,180,254,0.1)", padding: "3px 10px", borderRadius: 100, border: "1px solid rgba(216,180,254,0.2)" }}>
                    🎬 Film
                  </span>
                )}
              </div>

              {/* CTA hint */}
              <div style={{
                marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
                color: pkg.color, fontSize: "0.85rem", fontWeight: 600, letterSpacing: 1,
              }}>
                <span>View full details</span>
                <span style={{ fontSize: 18 }}>→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Drone add-on banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            marginTop: "3rem",
            background: "linear-gradient(135deg,rgba(100,180,255,0.08),rgba(212,168,67,0.08))",
            border: "1px solid rgba(125,211,252,0.25)",
            borderRadius: 20, padding: "1.5rem 2rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 28 }}>🚁</span>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1.1rem" }}>Drone Add-on</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                Add to any package · 90-min flight · DGCA certified
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "1.8rem", color: "#7dd3fc" }}>+ ₹6,500</div>
        </motion.div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selected && (
          <PackageModal
            pkg={selected}
            onClose={() => setSelected(null)}
            onBook={() => handleBook(selected)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
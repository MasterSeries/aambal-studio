// src/routes/booking-confirmed.tsx
// Drop this file into your routes folder. It reads ?plan=portrait|family|bridal|fullday
// from the URL so each package card's "Book this" link just navigates to
//   /booking-confirmed?plan=portrait   (etc.)
// and the page plays the matching cinematic sequence.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/booking-confirmed")({
  head: () => ({
    meta: [{ title: "Booking Confirmed · Aambal Vasantham Studio" }],
  }),
  component: BookingConfirmed,
});

// ─────────────────────────────────────────────
// Package metadata
// ─────────────────────────────────────────────
const PLANS = {
  portrait: {
    name: "Festival Portrait",
    tagline: "Intimate. Timeless.",
    price: "₹4,999",
    duration: "1 Hour",
    detail: "Solo / couple · 30+ edited photos · Same-day preview",
    includes: ["photography"],
    color: "#c89a30",
    accent: "#e8c97a",
    bg: "radial-gradient(ellipse at 60% 20%, #1a0f00 0%, #04080f 70%)",
    phases: ["camera", "confirm"] as Phase[],
  },
  family: {
    name: "Family & Group",
    tagline: "Every face. Every moment.",
    price: "₹8,999",
    duration: "2 Hours",
    detail: "Up to 12 members · 80+ photos · 4 printed 8×12",
    includes: ["photography"],
    color: "#e8c97a",
    accent: "#c89a30",
    bg: "radial-gradient(ellipse at 40% 30%, #0f1a08 0%, #04080f 70%)",
    phases: ["camera", "family", "confirm"] as Phase[],
  },
  bridal: {
    name: "Bridal / Couple",
    tagline: "Cinematic. Unforgettable.",
    price: "₹14,999",
    duration: "Half Day",
    detail: "2 photographers · 150+ photos · Cinematic reel · Premium album",
    includes: ["photography", "film"],
    color: "#d4b0ff",
    accent: "#9b7fe8",
    bg: "radial-gradient(ellipse at 50% 10%, #120820 0%, #04080f 70%)",
    phases: ["camera", "film", "confirm"] as Phase[],
  },
  fullday: {
    name: "Full Day Coverage",
    tagline: "Sunrise to last lamp.",
    price: "₹24,999",
    duration: "Sunrise → Night",
    detail: "300+ photos · Drone aerials · 4K film · 3 photographers",
    includes: ["photography", "drone", "film"],
    color: "#7dd3fc",
    accent: "#c89a30",
    bg: "radial-gradient(ellipse at 50% 80%, #001428 0%, #04080f 70%)",
    phases: ["camera", "drone", "film", "confirm"] as Phase[],
  },
};

type PlanKey = keyof typeof PLANS;
type Phase = "camera" | "family" | "drone" | "film" | "confirm";

// ─────────────────────────────────────────────
// Stars background (memo-stable)
// ─────────────────────────────────────────────
function Starfield() {
  const stars = useRef(
    Array.from({ length: 140 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      dur: 2 + Math.random() * 4,
      del: Math.random() * 6,
      minO: 0.05 + Math.random() * 0.15,
      maxO: 0.5 + Math.random() * 0.5,
    }))
  ).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            animation: `twinkle ${s.dur}s ease-in-out infinite ${s.del}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Floating petals
// ─────────────────────────────────────────────
function Petals() {
  const [petals, setPetals] = useState<{ id: number; left: number; size: number; dur: number; dx: number; emoji: string }[]>([]);
  const counter = useRef(0);
  useEffect(() => {
    const emojis = ["🌸", "🪷", "🌺", "✿"];
    const interval = setInterval(() => {
      const id = counter.current++;
      setPetals((p) => [
        ...p.slice(-18),
        { id, left: Math.random() * 100, size: 10 + Math.random() * 18, dur: 7 + Math.random() * 7, dx: (Math.random() - 0.5) * 80, emoji: emojis[Math.floor(Math.random() * emojis.length)] },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            bottom: -40,
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `floatUp ${p.dur}s ease-in forwards`,
            ["--dx" as string]: `${p.dx}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PHASE: CAMERA  (portrait + all plans open here)
// ─────────────────────────────────────────────
function CameraPhase({ color, accent }: { color: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 280, height: 280, marginBottom: "2.5rem" }}>
        {/* pulse rings */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: `${-i * 14}%`, borderRadius: "50%", border: `1.5px solid ${color}`, opacity: 0.3, animation: `pulseRing 2.4s ease-out ${i * 0.5}s infinite` }} />
        ))}
        {/* shutter blades */}
        <div style={{ position: "absolute", inset: 0, animation: "shutterSpin 3s linear infinite" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 3, transformOrigin: "0 50%", transform: `rotate(${i * 36}deg)`, background: `linear-gradient(90deg, ${color}99, transparent)` }} />
          ))}
        </div>
        {/* camera SVG */}
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", inset: 0, animation: "camBob 2s ease-in-out infinite" }}>
          <rect x="30" y="80" width="220" height="150" rx="20" fill="#0a1020" stroke={color} strokeWidth="2.5" />
          <rect x="80" y="58" width="60" height="28" rx="9" fill={color} />
          <rect x="16" y="106" width="14" height="90" rx="7" fill="rgba(200,154,48,.07)" stroke={`${color}30`} strokeWidth="1" />
          <rect x="172" y="85" width="52" height="32" rx="6" fill="#070e18" stroke={`${color}50`} strokeWidth="1" />
          <rect x="177" y="89" width="42" height="24" rx="4" fill={`${color}08`} />
          <circle cx="120" cy="68" r="10" fill={accent} />
          <circle cx="120" cy="68" r="6" fill={color} />
          {/* lens assembly */}
          <circle cx="130" cy="155" r="62" fill="#040810" stroke={color} strokeWidth="2.5" />
          <circle cx="130" cy="155" r="50" fill="#04080f" stroke={`${color}60`} strokeWidth="1.5" />
          <g style={{ animation: "lensAper 5s linear infinite", transformOrigin: "130px 155px" }}>
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <line key={a} x1="130" y1="155" x2={130 + 46 * Math.cos((a * Math.PI) / 180)} y2={155 + 46 * Math.sin((a * Math.PI) / 180)} stroke={`${color}25`} strokeWidth="1.5" />
            ))}
          </g>
          <circle cx="130" cy="155" r="28" fill="#020609" stroke={`${color}80`} strokeWidth="1.5" />
          <circle cx="118" cy="143" r="9" fill={color} opacity="0.45" style={{ animation: "lensDot 1.6s ease-in-out infinite" }} />
          <circle cx="130" cy="155" r="8" fill={color} style={{ animation: "lensDot 1.6s ease-in-out infinite 0.3s" }} />
          {/* shutter button */}
          <circle cx="228" cy="90" r="12" fill={color} />
          <circle cx="228" cy="90" r="7" fill={accent} />
          {/* flash */}
          <rect x="108" y="55" width="36" height="8" rx="3" fill="#1a2535" stroke={`${color}60`} strokeWidth="1" />
        </svg>
        {/* shutter click flash */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "white", animation: "shutterFlash 2.4s ease-in-out infinite", opacity: 0 }} />
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.35em", color, opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>Aambal Vasantham Studio</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem,4vw,2.8rem)", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Preparing your <em style={{ fontStyle: "italic", color: accent }}>cinematic journey…</em>
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────
// PHASE: FAMILY  (warm golden group portrait feel)
// ─────────────────────────────────────────────
function FamilyPhase({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 320, height: 240, marginBottom: "2rem" }}>
        {/* warm bokeh circles */}
        {[
          { x: 20, y: 30, r: 50, o: 0.07, d: "2s" }, { x: 75, y: 60, r: 70, o: 0.05, d: "3s" },
          { x: 10, y: 70, r: 40, o: 0.06, d: "2.5s" }, { x: 85, y: 20, r: 55, o: 0.04, d: "3.5s" },
        ].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, width: b.r, height: b.r, borderRadius: "50%", background: color, opacity: b.o, animation: `bokehPulse ${b.d} ease-in-out infinite ${i * 0.4}s`, transform: "translate(-50%,-50%)" }} />
        ))}
        <svg width="320" height="240" viewBox="0 0 320 240">
          {/* ground line */}
          <line x1="20" y1="210" x2="300" y2="210" stroke={`${color}30`} strokeWidth="1" />
          {/* family silhouettes — back row */}
          {[60, 110, 160, 210, 260].map((x, i) => (
            <g key={i} style={{ animation: `familyBob ${1.8 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }}>
              <circle cx={x} cy={i % 2 === 0 ? 148 : 160} r={i === 2 ? 14 : 12} fill={color} opacity={0.7 - i * 0.05} />
              <rect x={x - (i === 2 ? 12 : 10)} y={i % 2 === 0 ? 162 : 172} width={i === 2 ? 24 : 20} height={i === 2 ? 42 : 36} rx="6" fill={color} opacity={0.5 - i * 0.04} />
            </g>
          ))}
          {/* front row — children */}
          {[85, 160, 235].map((x, i) => (
            <g key={i} style={{ animation: `familyBob ${1.5 + i * 0.4}s ease-in-out infinite ${i * 0.3 + 0.5}s` }}>
              <circle cx={x} cy={190} r={9} fill={color} opacity={0.9} />
              <rect x={x - 8} y={199} width={16} height={24} rx="4" fill={color} opacity={0.65} />
            </g>
          ))}
          {/* camera flash arc */}
          <path d="M 160 30 Q 280 60 290 160" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" style={{ animation: "dashMove 3s linear infinite" }} />
          {/* lens circle top left */}
          <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
          <circle cx="50" cy="50" r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
          <circle cx="50" cy="50" r="8" fill={color} opacity="0.2" />
          {/* frame corners */}
          {([[20, 20], [300, 20], [20, 220], [300, 220]] as [number, number][]).map(([cx, cy], i) => (
            <g key={i}>
              <line x1={cx} y1={cy} x2={cx + (i % 2 === 0 ? 16 : -16)} y2={cy} stroke={color} strokeWidth="2" opacity="0.5" />
              <line x1={cx} y1={cy} x2={cx} y2={cy + (i < 2 ? 16 : -16)} stroke={color} strokeWidth="2" opacity="0.5" />
            </g>
          ))}
        </svg>
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.35em", color, opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>Family & Group</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem,4vw,2.8rem)", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Every face, <em style={{ fontStyle: "italic", color }}>every smile captured.</em>
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────
// PHASE: DRONE  (aerial, full day)
// ─────────────────────────────────────────────
function DronePhase({ color }: { color: string }) {
  const [alt, setAlt] = useState(78);
  useEffect(() => {
    const t = setInterval(() => setAlt((a) => Math.round(Math.max(60, Math.min(95, a + (Math.random() - 0.4) * 3)))), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
      {/* aerial grid overlay */}
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none" }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="agrid" width="55" height="55" patternUnits="userSpaceOnUse"><path d="M55 0L0 0 0 55" fill="none" stroke="white" strokeWidth="0.6" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#agrid)" />
        {[200, 400, 600].map((x) => <line key={x} x1={x} y1="600" x2={x < 400 ? 0 : x === 400 ? 400 : 800} y2="0" stroke="white" strokeWidth="0.4" opacity="0.6" />)}
      </svg>
      {/* scan line */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "100%", height: 1, background: `linear-gradient(90deg,transparent,${color}60,transparent)`, animation: "scanDown 4s linear infinite", opacity: 0.5 }} />
      </div>
      <div style={{ position: "relative", width: 300, height: 280, marginBottom: "1.5rem" }}>
        {/* light beam */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "55px solid transparent", borderRight: "55px solid transparent", borderTop: `140px solid ${color}12`, animation: "beamPulse 3s ease-in-out infinite" }} />
        {/* shadow on ground */}
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 90, height: 10, borderRadius: "50%", background: color, opacity: 0.12, animation: "shadowPulse 3s ease-in-out infinite" }} />
        {/* drone body */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", animation: "droneFloat 3s ease-in-out infinite" }}>
          <svg width="220" height="150" viewBox="0 0 220 150">
            {/* frame */}
            <line x1="22" y1="48" x2="198" y2="48" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="80" x2="198" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="48" x2="22" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="198" y1="48" x2="198" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            {/* diagonal struts */}
            <line x1="22" y1="48" x2="110" y2="64" stroke={`${color}40`} strokeWidth="1" />
            <line x1="198" y1="48" x2="110" y2="64" stroke={`${color}40`} strokeWidth="1" />
            <line x1="22" y1="80" x2="110" y2="64" stroke={`${color}40`} strokeWidth="1" />
            <line x1="198" y1="80" x2="110" y2="64" stroke={`${color}40`} strokeWidth="1" />
            {/* center box */}
            <rect x="76" y="54" width="68" height="20" rx="7" fill="#080f1a" stroke={color} strokeWidth="2" />
            <circle cx="110" cy="64" r="6" fill={`${color}80`} style={{ animation: "lensDot 1.5s ease-in-out infinite" }} />
            {/* gimbal */}
            <rect x="86" y="74" width="48" height="30" rx="7" fill="#050c18" stroke={color} strokeWidth="1.5" />
            <circle cx="110" cy="89" r="12" fill="#030810" stroke={`${color}80`} strokeWidth="1.5" />
            <circle cx="110" cy="89" r="5" fill={color} opacity="0.85" />
            <circle cx="104" cy="83" r="3" fill={`${color}60`} />
            {/* rotors */}
            {([[22, 48], [198, 48], [22, 80], [198, 80]] as [number, number][]).map(([cx, cy], i) => (
              <g key={i} style={{ animation: `rotorBlur 0.06s linear infinite ${i % 2 === 0 ? "" : "reverse"}`, transformOrigin: `${cx}px ${cy}px` }}>
                <ellipse cx={cx} cy={cy} rx="26" ry="4.5" fill={color} opacity="0.5" />
                <ellipse cx={cx} cy={cy} rx="26" ry="4.5" fill={`${color}40`} transform={`rotate(55,${cx},${cy})`} />
              </g>
            ))}
            {/* LEDs */}
            <circle cx="22" cy="48" r="3.5" fill="#ff4444"><animate attributeName="opacity" values="1;.15;1" dur="0.9s" repeatCount="indefinite" /></circle>
            <circle cx="198" cy="48" r="3.5" fill="#44ff88"><animate attributeName="opacity" values="1;.15;1" dur="0.9s" begin="0.45s" repeatCount="indefinite" /></circle>
            <circle cx="22" cy="80" r="3.5" fill="#fff"><animate attributeName="opacity" values=".8;.1;.8" dur="1.4s" repeatCount="indefinite" /></circle>
            <circle cx="198" cy="80" r="3.5" fill="#4488ff"><animate attributeName="opacity" values=".8;.1;.8" dur="1.2s" begin="0.3s" repeatCount="indefinite" /></circle>
            {/* landing legs */}
            <line x1="88" y1="104" x2="76" y2="128" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="132" y1="104" x2="144" y2="128" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="62" y1="128" x2="90" y2="128" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="130" y1="128" x2="158" y2="128" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
        {/* HUD panels */}
        <div style={{ position: "absolute", right: "-5%", top: "5%", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: "10px 16px", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color, backdropFilter: "blur(8px)" }}>
          <div style={{ opacity: 0.55, marginBottom: 3, fontSize: "0.55rem" }}>ALTITUDE</div>
          <div style={{ fontSize: "1.3rem" }}>{alt} m</div>
          <div style={{ opacity: 0.45, marginTop: 4, fontSize: "0.55rem" }}>4K · PRORES</div>
        </div>
        <div style={{ position: "absolute", left: "-5%", top: "10%", background: "rgba(68,136,255,.08)", border: "1px solid rgba(68,136,255,.25)", borderRadius: 10, padding: "8px 14px", fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#7dd3fc", backdropFilter: "blur(6px)" }}>
          <div style={{ opacity: 0.5, marginBottom: 2, fontSize: "0.55rem" }}>SIGNAL</div>
          <div>●●●● <span style={{ opacity: 0.25 }}>●</span></div>
          <div style={{ marginTop: 3, opacity: 0.45, fontSize: "0.55rem" }}>DGCA CERT</div>
        </div>
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.35em", color, opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>Full Day · Drone Aerials</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem,4vw,2.8rem)", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Eyes in the sky, <em style={{ fontStyle: "italic", color }}>capturing everything.</em>
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────
// PHASE: FILM REEL  (bridal + fullday)
// ─────────────────────────────────────────────
function FilmPhase({ color, accent }: { color: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 340, height: 200, marginBottom: "2rem" }}>
        <svg width="340" height="200" viewBox="0 0 340 200">
          {/* left reel */}
          <g style={{ animation: "reelSpin 3s linear infinite", transformOrigin: "75px 95px" }}>
            <circle cx="75" cy="95" r="68" fill="#06101c" stroke={color} strokeWidth="2" />
            <circle cx="75" cy="95" r="20" fill={color} />
            <circle cx="75" cy="95" r="10" fill="#06101c" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="72" y="27" width="6" height="16" rx="3" fill={color} opacity="0.65" transform={`rotate(${a},75,95)`} />
            ))}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <circle key={a} cx={75 + 48 * Math.cos(((a - 22.5) * Math.PI) / 180)} cy={95 + 48 * Math.sin(((a - 22.5) * Math.PI) / 180)} r="5" fill="#06101c" />
            ))}
          </g>
          {/* right reel */}
          <g style={{ animation: "reelSpin 3s linear infinite reverse", transformOrigin: "265px 95px" }}>
            <circle cx="265" cy="95" r="68" fill="#06101c" stroke={accent} strokeWidth="2" />
            <circle cx="265" cy="95" r="20" fill={accent} />
            <circle cx="265" cy="95" r="10" fill="#06101c" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="262" y="27" width="6" height="16" rx="3" fill={accent} opacity="0.65" transform={`rotate(${a},265,95)`} />
            ))}
          </g>
          {/* film strip */}
          <clipPath id="stripClip"><rect x="62" y="82" width="216" height="26" /></clipPath>
          <rect x="62" y="82" width="216" height="26" fill="#040c18" />
          <g clipPath="url(#stripClip)" style={{ animation: "stripSlide 0.9s linear infinite" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={i}>
                <rect x={62 + i * 44} y="85" width="40" height="20" rx="2" fill={i % 2 === 0 ? color : accent} opacity="0.5" />
                <rect x={65 + i * 44} y="88" width="10" height="14" rx="1" fill="#040c18" />
                <rect x={77 + i * 44} y="88" width="10" height="14" rx="1" fill="#040c18" />
                <rect x={89 + i * 44} y="88" width="10" height="14" rx="1" fill="#040c18" />
              </g>
            ))}
          </g>
          {/* sprocket holes */}
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <rect x={72 + i * 36} y="80" width="8" height="6" rx="1" fill="#020810" />
              <rect x={72 + i * 36} y="108" width="8" height="6" rx="1" fill="#020810" />
            </g>
          ))}
          {/* clapperboard accent */}
          <g transform="translate(140,140)" style={{ animation: "clapperShake 3s ease-in-out infinite" }}>
            <rect x="0" y="10" width="60" height="40" rx="4" fill="#0a1525" stroke={color} strokeWidth="1.5" />
            <rect x="0" y="0" width="60" height="14" rx="3" fill={color} opacity="0.8" />
            {[10, 22, 34, 46].map((x) => <line key={x} x1={x} y1="0" x2={x - 7} y2="14" stroke="#040c18" strokeWidth="2" />)}
            <text x="8" y="36" fill="white" fontFamily="'Cinzel',serif" fontSize="8" opacity="0.6">SCENE 1</text>
          </g>
        </svg>
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.35em", color, opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>Cinematic Film</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem,4vw,2.8rem)", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Your story, <em style={{ fontStyle: "italic", color }}>rolling in 4K.</em>
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────
// PHASE: CONFIRM
// ─────────────────────────────────────────────
function ConfirmPhase({ plan }: { plan: typeof PLANS[PlanKey] & { key: PlanKey } }) {
  const navigate = useNavigate();
  const ref = useRef("AV-2026-" + String(1000 + Math.floor(Math.random() * 9000))).current;
  const includeBadges = [
    plan.includes.includes("photography") && { label: "📸 Photography", cls: "photo" },
    plan.includes.includes("drone") && { label: "🚁 Drone aerials", cls: "drone" },
    plan.includes.includes("film") && { label: "🎬 Cinematic film", cls: "film" },
  ].filter(Boolean) as { label: string; cls: string }[];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "2rem 1rem" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(160deg, rgba(200,154,48,.07) 0%, rgba(8,15,26,.97) 100%)",
          border: `1px solid ${plan.color}35`,
          borderRadius: 28,
          padding: "clamp(1.5rem,4vw,3rem) clamp(1.2rem,4vw,2.5rem)",
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 80px ${plan.color}12, 0 40px 80px rgba(0,0,0,.6)`,
        }}
      >
        {/* grid texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,${plan.color}06 40px)`, pointerEvents: "none" }} />

        <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", damping: 14 }} style={{ display: "block", fontSize: "3.5rem", marginBottom: "1.25rem" }}>🪷</motion.span>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,4vw,1.9rem)", letterSpacing: "0.12em", color: plan.accent, marginBottom: "0.4rem" }}>
          Booking Confirmed
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.2rem", color: "rgba(255,255,255,.5)", marginBottom: "1.5rem" }}>
          Your story is in our hands.
        </motion.p>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.75, duration: 0.6 }} style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${plan.color},transparent)`, margin: "0 auto 1.5rem" }} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.25em", color: plan.color, opacity: 0.65, textTransform: "uppercase" }}>Booking Reference</p>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", color: "#fff", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>{ref}</p>
        </motion.div>

        {/* include badges */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: "1.5rem" }}>
          {includeBadges.map((b) => (
            <span key={b.label} style={{
              fontSize: 11, padding: "4px 14px", borderRadius: 100, letterSpacing: "0.05em",
              background: b.cls === "photo" ? "rgba(200,154,48,.12)" : b.cls === "drone" ? "rgba(74,159,212,.1)" : "rgba(155,127,232,.1)",
              border: `1px solid ${b.cls === "photo" ? "rgba(200,154,48,.28)" : b.cls === "drone" ? "rgba(74,159,212,.28)" : "rgba(155,127,232,.28)"}`,
              color: b.cls === "photo" ? plan.color : b.cls === "drone" ? "#7dd3fc" : "#c4b5fd",
            }}>{b.label}</span>
          ))}
        </motion.div>

        {/* summary table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ background: `${plan.color}07`, border: `1px solid ${plan.color}15`, borderRadius: 16, padding: "1.25rem 1.5rem", textAlign: "left", marginBottom: "1.5rem" }}>
          {[
            ["Package", plan.name],
            ["Duration", plan.duration],
            ["Delivery", "Within 48 hours"],
            ["Advance", plan.key === "portrait" ? "Pay on the day" : "20% advance required"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: "0.88rem" }}>
              <span style={{ color: "rgba(255,255,255,.45)", letterSpacing: "0.05em", fontSize: "0.78rem" }}>{label}</span>
              <span style={{ color: "#fff", fontFamily: "'Cormorant Garamond',serif", fontSize: "0.98rem" }}>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <span style={{ color: plan.color, fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em" }}>Total</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: plan.accent }}>{plan.price}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={`https://wa.me/919800000000?text=Hi%2C%20I%20booked%20${encodeURIComponent(plan.name)}%20%28${encodeURIComponent(plan.price)}%29%20%E2%80%94%20Ref%3A%20${ref}`}
            target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "linear-gradient(135deg,#1a7a40,#25a244)", color: "#fff", fontFamily: "'Raleway',sans-serif", fontWeight: 500, fontSize: "0.9rem", letterSpacing: "0.1em", padding: "14px 28px", borderRadius: 100, textDecoration: "none", transition: "transform .2s, box-shadow .2s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Confirm via WhatsApp
          </a>
          <button
            onClick={() => navigate({ to: "/" })}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.3)", fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", padding: "8px", transition: "color .2s" }}
          >
            ← Back to home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
function BookingConfirmed() {
  const search = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const planKey = (search.get("plan") ?? "portrait") as PlanKey;
  const plan = { ...(PLANS[planKey] ?? PLANS.portrait), key: planKey };

  const [phaseIdx, setPhaseIdx] = useState(0);
  const phases = plan.phases;

  useEffect(() => {
    if (phaseIdx >= phases.length - 1) return;
    // Each intro phase shows for 3.2s
    const t = setTimeout(() => setPhaseIdx((i) => i + 1), 3200);
    return () => clearTimeout(t);
  }, [phaseIdx, phases.length]);

  const progress = ((phaseIdx) / (phases.length - 1)) * 100;

  function renderPhase(phase: Phase) {
    switch (phase) {
      case "camera": return <CameraPhase color={plan.color} accent={plan.accent} />;
      case "family": return <FamilyPhase color={plan.color} />;
      case "drone": return <DronePhase color={plan.color} />;
      case "film": return <FilmPhase color={plan.color} accent={plan.accent} />;
      case "confirm": return <ConfirmPhase plan={plan} />;
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Raleway:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow-x: hidden; }

        @keyframes twinkle { 0%,100%{opacity:.1} 50%{opacity:.8} }
        @keyframes floatUp { 0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:0} 10%{opacity:.7} 80%{opacity:.3} 100%{transform:translateY(-110vh) rotate(720deg) translateX(var(--dx,30px));opacity:0} }
        @keyframes shutterSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes camBob { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(.97)} }
        @keyframes pulseRing { 0%{transform:scale(.85);opacity:.4} 100%{transform:scale(1.05);opacity:0} }
        @keyframes shutterFlash { 0%,88%,100%{opacity:0} 92%,96%{opacity:.18} }
        @keyframes lensAper { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes lensDot { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes droneFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-16px)} }
        @keyframes beamPulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
        @keyframes shadowPulse { 0%,100%{transform:translateX(-50%) scaleX(1);opacity:.15} 50%{transform:translateX(-50%) scaleX(.55);opacity:.05} }
        @keyframes rotorBlur { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes scanDown { 0%{top:-2px} 100%{top:100%} }
        @keyframes reelSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes stripSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-44px)} }
        @keyframes clapperShake { 0%,90%,100%{transform:rotate(0)} 94%{transform:rotate(-8deg)} 97%{transform:rotate(3deg)} }
        @keyframes familyBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes bokehPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.08} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:.04} }
        @keyframes dashMove { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-30} }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: plan.bg, zIndex: -2 }} />
      <Starfield />
      <Petals />

      {/* progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 2, background: `linear-gradient(90deg,${plan.color},${plan.accent})`, width: `${progress}%`, transition: "width .5s ease", zIndex: 100 }} />

      {/* phase dots */}
      <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 50 }}>
        {phases.map((_, i) => (
          <div key={i} style={{ height: 6, width: i === phaseIdx ? 20 : 6, borderRadius: 3, background: i === phaseIdx ? plan.color : `${plan.color}40`, transition: "all .4s" }} />
        ))}
      </div>

      {/* phase renderer */}
      <div style={{ position: "fixed", inset: 0, zIndex: 10, overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={phases[phaseIdx]}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}
          >
            {renderPhase(phases[phaseIdx])}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookingForm } from "@/components/BookingForm";
import {
  sendWhatsAppMessage,
} from "@/lib/sendWhatsapp";

export const Route = createFileRoute("/booking-confirmed")({
  validateSearch: (search) => ({
    plan: (search.plan as string) || "portrait",
  }),

  head: () => ({
    meta: [
      {
        title:
          "Book Your Session · Aambal Vasantham Studio",
      },
    ],
  }),

  component: BookingConfirmed,
});


const PLANS = {
  portrait: {
    name: "Festival Portrait",
    tagline: "Intimate. Timeless.",
    price: "₹4,999",
    duration: "1 Hour",
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
    includes: ["photography", "drone", "film"],
    color: "#7dd3fc",
    accent: "#c89a30",
    bg: "radial-gradient(ellipse at 50% 80%, #001428 0%, #04080f 70%)",
    phases: ["camera", "drone", "film", "confirm"] as Phase[],
  },
};

type PlanKey = keyof typeof PLANS;
type Phase = "camera" | "family" | "drone" | "film" | "confirm";

function Starfield() {
  const stars = useRef(
    Array.from({ length: 140 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      dur: 2 + Math.random() * 4,
      del: Math.random() * 6,
    }))
  ).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: "absolute", top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: "50%", background: "#fff",
          animation: `twinkle ${s.dur}s ease-in-out infinite ${s.del}s`,
        }} />
      ))}
    </div>
  );
}

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
        <div key={p.id} style={{
          position: "absolute", bottom: -40, left: `${p.left}%`,
          fontSize: p.size, animation: `floatUp ${p.dur}s ease-in forwards`,
          ["--dx" as string]: `${p.dx}px`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

function CameraPhase({ color, accent }: { color: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 280, height: 280, marginBottom: "2.5rem" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", inset: `${-i * 14}%`, borderRadius: "50%", border: `1.5px solid ${color}`, opacity: 0.3, animation: `pulseRing 2.4s ease-out ${i * 0.5}s infinite` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, animation: "shutterSpin 3s linear infinite" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 3, transformOrigin: "0 50%", transform: `rotate(${i * 36}deg)`, background: `linear-gradient(90deg, ${color}99, transparent)` }} />
          ))}
        </div>
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: "absolute", inset: 0, animation: "camBob 2s ease-in-out infinite" }}>
          <rect x="30" y="80" width="220" height="150" rx="20" fill="#0a1020" stroke={color} strokeWidth="2.5" />
          <rect x="80" y="58" width="60" height="28" rx="9" fill={color} />
          <circle cx="120" cy="68" r="10" fill={accent} />
          <circle cx="120" cy="68" r="6" fill={color} />
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
          <circle cx="228" cy="90" r="12" fill={color} />
          <circle cx="228" cy="90" r="7" fill={accent} />
        </svg>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "white", animation: "shutterFlash 2.4s ease-in-out infinite", opacity: 0 }} />
      </div>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.35em", color, opacity: 0.7, marginBottom: "0.75rem", textTransform: "uppercase" }}>Aambal Vasantham Studio</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem,4vw,2.8rem)", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        Preparing your <em style={{ fontStyle: "italic", color: accent }}>cinematic journey…</em>
      </h2>
    </div>
  );
}

function FamilyPhase({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 320, height: 240, marginBottom: "2rem" }}>
        {[{ x: 20, y: 30, r: 50, d: "2s" }, { x: 75, y: 60, r: 70, d: "3s" }, { x: 10, y: 70, r: 40, d: "2.5s" }, { x: 85, y: 20, r: 55, d: "3.5s" }].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, width: b.r, height: b.r, borderRadius: "50%", background: color, opacity: 0.07, animation: `bokehPulse ${b.d} ease-in-out infinite ${i * 0.4}s`, transform: "translate(-50%,-50%)" }} />
        ))}
        <svg width="320" height="240" viewBox="0 0 320 240">
          <line x1="20" y1="210" x2="300" y2="210" stroke={`${color}30`} strokeWidth="1" />
          {[60, 110, 160, 210, 260].map((x, i) => (
            <g key={i} style={{ animation: `familyBob ${1.8 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }}>
              <circle cx={x} cy={i % 2 === 0 ? 148 : 160} r={i === 2 ? 14 : 12} fill={color} opacity={0.7 - i * 0.05} />
              <rect x={x - (i === 2 ? 12 : 10)} y={i % 2 === 0 ? 162 : 172} width={i === 2 ? 24 : 20} height={i === 2 ? 42 : 36} rx="6" fill={color} opacity={0.5 - i * 0.04} />
            </g>
          ))}
          {[85, 160, 235].map((x, i) => (
            <g key={i} style={{ animation: `familyBob ${1.5 + i * 0.4}s ease-in-out infinite ${i * 0.3 + 0.5}s` }}>
              <circle cx={x} cy={190} r={9} fill={color} opacity={0.9} />
              <rect x={x - 8} y={199} width={16} height={24} rx="4" fill={color} opacity={0.65} />
            </g>
          ))}
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

function DronePhase({ color }: { color: string }) {
  const [alt, setAlt] = useState(78);
  useEffect(() => {
    const t = setInterval(() => setAlt((a) => Math.round(Math.max(60, Math.min(95, a + (Math.random() - 0.4) * 3)))), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none" }} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="agrid" width="55" height="55" patternUnits="userSpaceOnUse"><path d="M55 0L0 0 0 55" fill="none" stroke="white" strokeWidth="0.6" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#agrid)" />
      </svg>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "100%", height: 1, background: `linear-gradient(90deg,transparent,${color}60,transparent)`, animation: "scanDown 4s linear infinite", opacity: 0.5 }} />
      </div>
      <div style={{ position: "relative", width: 300, height: 280, marginBottom: "1.5rem" }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "55px solid transparent", borderRight: "55px solid transparent", borderTop: `140px solid ${color}12`, animation: "beamPulse 3s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 90, height: 10, borderRadius: "50%", background: color, opacity: 0.12, animation: "shadowPulse 3s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", animation: "droneFloat 3s ease-in-out infinite" }}>
          <svg width="220" height="150" viewBox="0 0 220 150">
            <line x1="22" y1="48" x2="198" y2="48" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="80" x2="198" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="48" x2="22" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="198" y1="48" x2="198" y2="80" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <rect x="76" y="54" width="68" height="20" rx="7" fill="#080f1a" stroke={color} strokeWidth="2" />
            <circle cx="110" cy="64" r="6" fill={`${color}80`} style={{ animation: "lensDot 1.5s ease-in-out infinite" }} />
            <rect x="86" y="74" width="48" height="30" rx="7" fill="#050c18" stroke={color} strokeWidth="1.5" />
            <circle cx="110" cy="89" r="12" fill="#030810" stroke={`${color}80`} strokeWidth="1.5" />
            <circle cx="110" cy="89" r="5" fill={color} opacity="0.85" />
            {([[22, 48], [198, 48], [22, 80], [198, 80]] as [number, number][]).map(([cx, cy], i) => (
              <g key={i} style={{ animation: `rotorBlur 0.06s linear infinite ${i % 2 === 0 ? "" : "reverse"}`, transformOrigin: `${cx}px ${cy}px` }}>
                <ellipse cx={cx} cy={cy} rx="26" ry="4.5" fill={color} opacity="0.5" />
                <ellipse cx={cx} cy={cy} rx="26" ry="4.5" fill={`${color}40`} transform={`rotate(55,${cx},${cy})`} />
              </g>
            ))}
            <circle cx="22" cy="48" r="3.5" fill="#ff4444"><animate attributeName="opacity" values="1;.15;1" dur="0.9s" repeatCount="indefinite" /></circle>
            <circle cx="198" cy="48" r="3.5" fill="#44ff88"><animate attributeName="opacity" values="1;.15;1" dur="0.9s" begin="0.45s" repeatCount="indefinite" /></circle>
            <circle cx="22" cy="80" r="3.5" fill="#fff"><animate attributeName="opacity" values=".8;.1;.8" dur="1.4s" repeatCount="indefinite" /></circle>
            <circle cx="198" cy="80" r="3.5" fill="#4488ff"><animate attributeName="opacity" values=".8;.1;.8" dur="1.2s" begin="0.3s" repeatCount="indefinite" /></circle>
          </svg>
        </div>
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

function FilmPhase({ color, accent }: { color: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ position: "relative", width: 340, height: 200, marginBottom: "2rem" }}>
        <svg width="340" height="200" viewBox="0 0 340 200">
          <g style={{ animation: "reelSpin 3s linear infinite", transformOrigin: "75px 95px" }}>
            <circle cx="75" cy="95" r="68" fill="#06101c" stroke={color} strokeWidth="2" />
            <circle cx="75" cy="95" r="20" fill={color} />
            <circle cx="75" cy="95" r="10" fill="#06101c" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="72" y="27" width="6" height="16" rx="3" fill={color} opacity="0.65" transform={`rotate(${a},75,95)`} />
            ))}
          </g>
          <g style={{ animation: "reelSpin 3s linear infinite reverse", transformOrigin: "265px 95px" }}>
            <circle cx="265" cy="95" r="68" fill="#06101c" stroke={accent} strokeWidth="2" />
            <circle cx="265" cy="95" r="20" fill={accent} />
            <circle cx="265" cy="95" r="10" fill="#06101c" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <rect key={a} x="262" y="27" width="6" height="16" rx="3" fill={accent} opacity="0.65" transform={`rotate(${a},265,95)`} />
            ))}
          </g>
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
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <rect x={72 + i * 36} y="80" width="8" height="6" rx="1" fill="#020810" />
              <rect x={72 + i * 36} y="108" width="8" height="6" rx="1" fill="#020810" />
            </g>
          ))}
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

function ConfirmPhase({ plan }: { plan: typeof PLANS[PlanKey] & { key: PlanKey } }) {
  const includeBadges = [
    plan.includes.includes("photography") && { label: "📸 Photography", cls: "photo" },
    plan.includes.includes("drone") && { label: "🚁 Drone aerials", cls: "drone" },
    plan.includes.includes("film") && { label: "🎬 Cinematic film", cls: "film" },
  ].filter(Boolean) as { label: string; cls: string }[];
const [
  showBooking,
  setShowBooking,
] = useState(false);

const [
  bookingConfirmed,
  setBookingConfirmed,
] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(160deg, rgba(200,154,48,.07) 0%, rgba(8,15,26,.97) 100%)",
          border: `1px solid ${plan.color}35`,
          borderRadius: 28,
          padding: "clamp(1.5rem,4vw,3rem) clamp(1.2rem,4vw,2.5rem)",
          boxShadow: `0 0 80px ${plan.color}12, 0 40px 80px rgba(0,0,0,.6)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,${plan.color}06 40px)`, pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 14 }}
            style={{ display: "block", fontSize: "3rem", marginBottom: "1rem" }}
          >
            🪷
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,4vw,1.9rem)", letterSpacing: "0.12em", color: plan.accent, marginBottom: "0.4rem" }}
          >
            {plan.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "rgba(255,255,255,.5)", marginBottom: "1rem" }}
          >
            {plan.tagline} · {plan.price}
          </motion.p>

          {/* Include badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: "0.5rem" }}
          >
            {includeBadges.map((b) => (
              <span key={b.label} style={{
                fontSize: 11, padding: "4px 14px", borderRadius: 100, letterSpacing: "0.05em",
                background: b.cls === "photo" ? "rgba(200,154,48,.12)" : b.cls === "drone" ? "rgba(74,159,212,.1)" : "rgba(155,127,232,.1)",
                border: `1px solid ${b.cls === "photo" ? "rgba(200,154,48,.28)" : b.cls === "drone" ? "rgba(74,159,212,.28)" : "rgba(155,127,232,.28)"}`,
                color: b.cls === "photo" ? plan.color : b.cls === "drone" ? "#7dd3fc" : "#c4b5fd",
              }}>{b.label}</span>
            ))}
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${plan.color},transparent)`, margin: "1.5rem auto 0" }}
          />
        </div>

        {/* BOOKING CTA */}

<motion.div
  initial={{
    opacity: 0,
    y: 20,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.7,
  }}
>

  <p
    style={{
      color:
        "rgba(255,255,255,0.5)",
      fontSize: "0.85rem",
      marginBottom: "1.5rem",
      textAlign: "center",
      fontStyle: "italic",
    }}
  >
    Select your date and
    time slot below to
    reserve your session
  </p>

  {bookingConfirmed ? (

    <div
      style={{
        width: "100%",
        padding:
          "18px",
        borderRadius:
          999,
        background:
          "#16a34a",
        textAlign:
          "center",
        fontWeight: 700,
        fontSize:
          "1rem",
      }}
    >
      ✅ Booking Confirmed
    </div>

  ) : (

    <button
      onClick={() =>
        setShowBooking(
          true
        )
      }
      style={{
        width: "100%",
        padding:
          "18px",
        border: "none",
        borderRadius:
          999,
        background:
          `linear-gradient(135deg,${plan.color},${plan.accent})`,
        color: "#000",
        fontWeight: 700,
        fontSize:
          "1rem",
        cursor:
          "pointer",
      }}
    >
      📅 Select Date &
      Continue
    </button>

  )}

</motion.div>

{/* BOOKING POPUP */}

<AnimatePresence>

  {showBooking && (

    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      style={{
        position:
          "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,.85)",
        backdropFilter:
          "blur(20px)",
        zIndex: 9999,
        overflowY: "auto",
        padding: "2rem",
      }}
    >

      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.9,
          opacity: 0,
        }}
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >

        <BookingForm

          selectedPlan={{
            name:
              plan.name,
            price:
              plan.price,
          }}

          onBookingComplete={async (
            bookingData: any
          ) => {

            try {

              const message = `
🌸 Aambal Vasantham Studio

✅ Booking Confirmed

📦 Package:
${plan.name}

💰 Price:
${plan.price}

👤 Name:
${bookingData.name}

📞 Phone:
${bookingData.phone}

📅 Date:
${bookingData.date}

⏰ Time:
${bookingData.time}

🆔 Ref:
${bookingData.reference}
`;

              await sendWhatsAppMessage(
  bookingData.phone,

  {
    name:
      bookingData.name,

    packageName:
      plan.name,

    price:
      plan.price,

    date:
      bookingData.date,

    time:
      bookingData.time,

    reference:
      bookingData.reference,
  }
);

              setBookingConfirmed(
                true
              );

              setShowBooking(
                false
              );

            } catch (err) {

              console.error(
                err
              );

              alert(
                "Booking failed"
              );

            }

          }}
        />

      </motion.div>

    </motion.div>

  )}

</AnimatePresence>
      </motion.div>
    </div>
  );
}

function BookingConfirmed() {
  const { plan: selectedPlan } =
    Route.useSearch();

  const planKey =
    (selectedPlan ?? "portrait") as PlanKey;

  const plan = {
    ...(PLANS[planKey] ?? PLANS.portrait),
    key: planKey,
  };

  const [phaseIdx, setPhaseIdx] =
    useState(0);

  const phases = plan.phases;

  useEffect(() => {
    if (phaseIdx >= phases.length - 1)
      return;

    const t = setTimeout(
      () => setPhaseIdx((i) => i + 1),
      3200
    );

    return () => clearTimeout(t);
  }, [phaseIdx, phases.length]);

  const progress =
    (phaseIdx /
      (phases.length - 1)) *
    100;

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes twinkle { 0%,100%{opacity:.1} 50%{opacity:.8} }
        @keyframes floatUp { 0%{transform:translateY(0) rotate(0deg);opacity:0} 10%{opacity:.7} 80%{opacity:.3} 100%{transform:translateY(-110vh) rotate(720deg) translateX(var(--dx,30px));opacity:0} }
        @keyframes shutterSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes camBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
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
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: plan.bg, zIndex: -2 }} />
      <Starfield />
      <Petals />

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: 2, background: `linear-gradient(90deg,${plan.color},${plan.accent})`, width: `${progress}%`, transition: "width .5s ease", zIndex: 100 }} />

      {/* Phase dots */}
      <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 50 }}>
        {phases.map((_, i) => (
          <div key={i} style={{ height: 6, width: i === phaseIdx ? 20 : 6, borderRadius: 3, background: i === phaseIdx ? plan.color : `${plan.color}40`, transition: "all .4s" }} />
        ))}
      </div>

      {/* Phase renderer */}
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
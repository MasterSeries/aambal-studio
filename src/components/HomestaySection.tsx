// src/components/HomestaySection.tsx
// Drop into your homepage (index.tsx) between the Gallery and Booking sections.
// Clicking "Explore the Retreat →" navigates to /homestay

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@tanstack/react-router";

const amenities = [
  { icon: "🌿", label: "Private garden villa" },
  { icon: "🪷", label: "Lotus pond view" },
  { icon: "🍃", label: "Ayurvedic breakfast" },
  { icon: "🚁", label: "Drone prep lounge" },
  { icon: "🎞", label: "Edit suite access" },
  { icon: "🌅", label: "Sunrise temple walks" },
];

export function HomestaySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      id="homestay"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "10rem 1.5rem",
        background: "linear-gradient(180deg, var(--background) 0%, #040d08 50%, var(--background) 100%)",
      }}
    >
      {/* ── atmospheric background ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* radial green glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(52,120,60,0.12) 0%, transparent 70%)" }} />
        {/* lotus pattern overlay */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <text key={`${r}-${c}`} x={c * 55 - 20} y={r * 70 + 35} fontSize="28" fill="#c8a84a" textAnchor="middle">🪷</text>
            ))
          )}
        </svg>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>

        {/* ── eyebrow ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "#6db87a", marginBottom: 16 }}>
            ✦ Exclusively for premium guests ✦
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 400,
              color: "var(--foreground, #f0ede6)",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Stay where the
            <br />
            <em style={{
              fontStyle: "italic",
              background: "linear-gradient(135deg, #6db87a, #a8e6b0, #4a9460)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>festival breathes.</em>
          </h2>
          <p style={{ marginTop: 20, color: "rgba(240,237,230,0.5)", fontSize: "1.05rem", maxWidth: 520, margin: "20px auto 0", lineHeight: 1.7 }}>
            A heritage garden villa minutes from the temple tanks — exclusively for our Full Day and Bridal package guests. Wake to lotus ponds. Sleep to temple bells.
          </p>
        </motion.div>

        {/* ── main content grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "5rem" }}>

          {/* left — image stack with parallax */}
          <div style={{ position: "relative", height: 520 }}>
            {/* back card */}
            <motion.div
              style={{ y: y2, position: "absolute", top: "8%", right: "-5%", width: "70%", height: "65%", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(109,184,122,0.25)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
            >
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0d2b14 0%, #1a4a22 50%, #0a1f0e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 64, opacity: 0.4 }}>🌿</span>
              </div>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(109,184,122,0.03) 20px, rgba(109,184,122,0.03) 21px)" }} />
            </motion.div>

            {/* front card */}
            <motion.div
              style={{ y: y1, position: "absolute", bottom: "5%", left: 0, width: "72%", height: "62%", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,168,74,0.3)", boxShadow: "0 50px 100px rgba(0,0,0,0.6)" }}
            >
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg, #1a1205 0%, #2d2008 50%, #0f0c02 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 64, opacity: 0.4 }}>🪷</span>
              </div>
              {/* floating label */}
              <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", borderRadius: 12, padding: "10px 16px", border: "1px solid rgba(200,168,74,0.25)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#c8a84a", textTransform: "uppercase", marginBottom: 3 }}>Kottayam · Kerala</p>
                <p style={{ fontSize: 14, color: "#f0ede6", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>Garden Villa · Est. 1924</p>
              </div>
            </motion.div>

            {/* floating availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring" }}
              style={{
                position: "absolute", top: "2%", left: "10%",
                background: "rgba(109,184,122,0.12)", border: "1px solid rgba(109,184,122,0.3)",
                borderRadius: 100, padding: "8px 16px", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6db87a", boxShadow: "0 0 8px #6db87a", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12, color: "#a8e6b0", fontWeight: 600, letterSpacing: "0.08em" }}>3 nights available</span>
            </motion.div>
          </div>

          {/* right — text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6db87a", marginBottom: 20 }}>
              The Aambal Retreat
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 400, color: "#f0ede6", lineHeight: 1.2, marginBottom: 20 }}>
              A century-old villa,<br />
              <em style={{ color: "#a8e6b0" }}>reimagined for storytellers.</em>
            </h3>
            <p style={{ color: "rgba(240,237,230,0.55)", lineHeight: 1.8, marginBottom: 32, fontSize: "0.95rem" }}>
              Seven rooms. Private courtyard. A lotus pond that mirrors the morning sky. Complimentary Ayurvedic breakfast. We built this retreat so our premium guests could wake up ten minutes from the festival, cameras charged, minds calm.
            </p>

            {/* amenity pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
              {amenities.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(109,184,122,0.07)",
                    border: "1px solid rgba(109,184,122,0.2)",
                    borderRadius: 100, padding: "7px 14px",
                    fontSize: 13, color: "rgba(240,237,230,0.75)",
                  }}
                >
                  <span>{a.icon}</span> {a.label}
                </motion.div>
              ))}
            </div>

            {/* exclusive badge + CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link to="/homestay">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "linear-gradient(135deg, #4a9460, #6db87a)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 100,
                    padding: "15px 32px",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    boxShadow: "0 8px 30px rgba(74,148,96,0.35)",
                    fontFamily: "inherit",
                  }}
                >
                  Explore the Retreat →
                </motion.button>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8a84a" }} />
                <span style={{ fontSize: 12, color: "rgba(240,237,230,0.4)", letterSpacing: "0.1em" }}>Premium packages only</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── bottom stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {[
            { n: "7",    l: "Rooms",          sub: "Private en-suite" },
            { n: "10m",  l: "From temple",    sub: "Walking distance" },
            { n: "100+", l: "Years of history", sub: "Est. 1924 villa" },
            { n: "∞",    l: "Lotus pond",     sub: "Sunrise view" },
          ].map(({ n, l, sub }) => (
            <div key={l} style={{ padding: "2rem 1.5rem", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", color: "#6db87a", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: "0.8rem", color: "#f0ede6", marginTop: 6, fontWeight: 500 }}>{l}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(240,237,230,0.35)", marginTop: 3, letterSpacing: "0.08em" }}>{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
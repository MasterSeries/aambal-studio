import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const stats = [
  { n: "30+", l: "Years of craft" },
  { n: "1,200+", l: "Families served" },
  { n: "7", l: "Festival seasons" },
];

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDone(true);
            onComplete?.();
          }, 400);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060610] overflow-hidden"
        >
          {/* Ambient rings */}
          {[500, 380, 260].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border border-primary/8"
              style={{ width: size, height: size }}
              animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
            />
          ))}

          {/* Spinning dashed rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-primary/6"
              style={{ borderSpacing: "8px 12px" }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-primary/4"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5 px-6">
            {/* Lotus */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg viewBox="0 0 80 80" width="72" height="72">
                <ellipse cx="40" cy="54" rx="22" ry="10" fill="#c8a84a" opacity="0.15" />
                <path d="M40 52 Q30 38 32 24 Q36 16 40 22 Q44 16 48 24 Q50 38 40 52Z" fill="#c8a84a" opacity="0.85" />
                <path d="M40 52 Q22 42 20 28 Q22 18 28 22 Q30 30 40 52Z" fill="#c8a84a" opacity="0.6" />
                <path d="M40 52 Q58 42 60 28 Q58 18 52 22 Q50 30 40 52Z" fill="#c8a84a" opacity="0.6" />
                <path d="M40 52 Q14 48 12 34 Q16 24 22 30 Q28 38 40 52Z" fill="#c8a84a" opacity="0.35" />
                <path d="M40 52 Q66 48 68 34 Q64 24 58 30 Q52 38 40 52Z" fill="#c8a84a" opacity="0.35" />
                <circle cx="40" cy="52" r="3.5" fill="#ffd93d" opacity="0.9" />
                <circle cx="40" cy="52" r="1.5" fill="white" opacity="0.9" />
              </svg>
            </motion.div>

            {/* Monogram */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-[#0a0a14]"
              style={{ background: "linear-gradient(135deg, #c8a84a, #ffd93d)", boxShadow: "0 0 0 8px rgba(200,168,74,0.08), 0 0 0 16px rgba(200,168,74,0.04)" }}
            >
              S
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <h1 className="font-display text-[40px] text-white leading-none tracking-tight">Studio Hut</h1>
              <p className="font-display text-lg italic" style={{ color: "rgba(200,168,74,0.75)" }}>Photography</p>
              <p className="text-[10px] font-mono uppercase tracking-[0.32em] text-white/20 mt-1">Kottayam · Kerala · Est. 1994</p>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="w-px h-8 bg-primary/20"
            />

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex items-center gap-8"
            >
              {stats.map((s, i) => (
                <div key={s.l} className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="font-display text-2xl text-primary leading-none">{s.n}</div>
                    <div className="text-[9px] uppercase tracking-[0.22em] text-white/25 mt-1">{s.l}</div>
                  </div>
                  {i < stats.length - 1 && <div className="w-px h-7 bg-white/6" />}
                </div>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="font-display text-sm italic text-center max-w-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              "Since 1994, we have photographed the light of Kerala — its festivals, families, and the quiet moments between."
            </motion.p>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-44 h-px bg-white/8 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full absolute left-0 top-0"
                  style={{ background: "linear-gradient(90deg, #c8a84a, #ffd93d)", width: `${Math.min(progress, 100)}%`, transition: "width 0.08s linear" }}
                />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/20">
                Preparing your experience
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-block w-1 h-1 rounded-full bg-primary ml-1.5 align-middle"
                />
              </p>
            </motion.div>

            {/* Service tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="flex gap-5 items-center"
            >
              {["Portraits", "Aerial", "Festival", "Cinematic"].map((s, i) => (
                <div key={s} className="flex items-center gap-5">
                  <span className="text-[9px] font-mono uppercase tracking-[0.28em] text-white/12">{s}</span>
                  {i < 3 && <span className="text-primary/15 text-[8px]">◆</span>}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
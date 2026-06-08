import { motion } from "motion/react";
import studioBg from "@/assets/studio-intro.jpeg";
import logo from "@/assets/logo.png";


export function StudioIntroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image with Ken Burns zoom */}
      <motion.img
        src={studioBg}
        alt="Studio Hut Photography vintage studio interior"
        width={1920}
        height={1080}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />

      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />

      {/* Floating dust particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-primary/40"
          style={{
            width: 1 + (i % 3),
            height: 1 + (i % 3),
            left: `${(i * 47) % 100}%`,
            top: `${(i * 31) % 100}%`,
            boxShadow: "0 0 6px 1px oklch(0.80 0.13 350 / 0.5)",
          }}
          animate={{
            y: [0, -40 - (i % 30), -80 - (i % 40)],
            x: [0, (i % 2 === 0 ? 15 : -15), (i % 2 === 0 ? -10 : 10)],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 6 + (i % 5),
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 text-center">
        {/* Top label */}
        <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="mb-16 flex justify-center"
>
 <div
  className="flex items-center gap-3 rounded-full px-6 py-3"
  style={{
    background: "rgba(15,15,15,0.85)",
    border: "1px solid rgba(212,175,55,0.35)",
    backdropFilter: "blur(20px)",
    color: "#ffffff",
    letterSpacing: "0.25em",
    fontSize: "12px",
    textTransform: "uppercase",
    boxShadow: "0 0 30px rgba(212,175,55,0.2)",
  }}

  >
    <span
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "999px",
        background: "#22c55e",
        boxShadow: "0 0 12px #22c55e",
      }}
    />
    Est. 1996 • Kottayam, Kerala
  </div>
</motion.div>

        {/* Studio name */}
        {/* Studio Logo */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.6 }}
  className="flex justify-center"
>
  <img
    src={logo}
    alt="Aambal Vasantham Studio"
    className="w-[280px] sm:w-[380px] md:w-[500px] h-auto object-contain"
    style={{
      filter:
        "drop-shadow(0 0 20px rgba(255,255,255,0.15)) drop-shadow(0 0 40px rgba(200,168,74,0.25))",
    }}
  />
</motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mx-auto mt-10 max-w-3xl text-lg text-white/80 md:text-2xl leading-relaxed"
        >
          Three decades of capturing light, love, and the soul of South Indian
          celebrations. From film to 4K — we remember every frame.
        </motion.p>

        {/* Decorative line + scroll prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <div className="h-16 w-px bg-gradient-to-b from-primary/60 to-transparent" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Scroll to enter
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

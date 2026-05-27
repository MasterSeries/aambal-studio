import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aambal Vasantham Festival Photography & Drone Studio" },
      { name: "description", content: "Book festival portraits, family coverage and cinematic drone shots for the Aambal Vasantham festival. Limited slots — reserve now." },
      { property: "og:title", content: "Aambal Vasantham Festival Photography" },
      { property: "og:description", content: "Cinematic photo & drone coverage for the Aambal Vasantham festival." },
    ],
  }),
  component: Home,
});

// ── data ──────────────────────────────────────────────────────────────────────
const droneFeatures = [
  { title: "4K Cinematic Aerials",  text: "DJI Mavic 3 Pro · Hasselblad sensor · 5.1K ProRes ready." },
  { title: "Licensed & Insured",    text: "DGCA certified pilots, public liability cover up to ₹50L." },
  { title: "Festival Specialist",   text: "Crowd-safe flight plans tuned for processions, temple aartis and fireworks." },
  { title: "Same-Day Teaser",       text: "Edited 60-second aerial reel delivered before midnight." },
];

// Package teaser data — just enough to intrigue, not the full detail
const packageTeasers = [
  { id: "portrait", name: "Festival Portrait", price: "₹4,999", duration: "1 hr",          icon: "📸", color: "#c8a84a" },
  { id: "family",   name: "Family & Group",    price: "₹8,999", duration: "2 hrs",         icon: "👨‍👩‍👧‍👦", color: "#e8c97a", hot: true },
  { id: "bridal",   name: "Bridal / Couple",   price: "₹14,999", duration: "Half day",     icon: "🎬", color: "#d4b0ff" },
  { id: "fullday",  name: "Full Day",          price: "₹24,999", duration: "Sunrise→Night", icon: "🚁", color: "#7dd3fc" },
];

// Testimonials
const testimonials = [
  { name: "Meena & Rajesh",    pkg: "Bridal Package",        quote: "They knew exactly when the lamps would reflect on the water. We didn't even have to direct — just exist, and they found the light.", stars: 5 },
  { name: "The Iyer Family",   pkg: "Family & Group",        quote: "All 11 of us, chaos and all, somehow made into the most beautiful portrait we've ever taken. The same-day preview had us in tears.", stars: 5 },
  { name: "Divya Krishnan",    pkg: "Full Day + Drone",      quote: "The aerial of the procession at dusk is framed in our living room. People think it's fine art. It is.", stars: 5 },
  { name: "Anand & Preethi",   pkg: "Festival Portrait",     quote: "We've been to Aambal Vasantham five years running. This was the first time we came home with photos worthy of the festival.", stars: 5 },
];

// Process steps
const processSteps = [
  { n: "01", title: "Reserve your slot",     desc: "Fill the form or message us on WhatsApp. We confirm within 24 hours with your shoot schedule.", icon: "📅" },
  { n: "02", title: "We arrive before dawn", desc: "Our team scouts your positions the night before. On shoot day we're at the festival before you.", icon: "🌅" },
  { n: "03", title: "Same-day previews",     desc: "Five curated preview images on WhatsApp before midnight. You'll sleep well.", icon: "⚡" },
  { n: "04", title: "Full gallery in 48hrs", desc: "Every edited image delivered to a private gallery. Yours forever.", icon: "🖼️" },
];

// ── types ─────────────────────────────────────────────────────────────────────
type MediaItem = {
  id?: string;
  type: "image" | "video";
  src: string;
  caption: string;
};

// ── layout wrapper ────────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-6 py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
}

// ── Testimonial carousel ──────────────────────────────────────────────────────
function TestimonialsSection() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* bg texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(200,168,74,0.04) 80px)", opacity: 0.6 }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary mb-4">✦ Guest voices ✦</p>
          <h2 className="font-display text-5xl md:text-6xl">
            What they <span className="italic text-gradient-gold">said after.</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16 items-center">
          {/* left — name list */}
          <div className="flex flex-col gap-3">
            {testimonials.map((t, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`text-left rounded-2xl border px-5 py-4 transition-all duration-300 ${
                  i === active
                    ? "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(200,168,74,0.1)]"
                    : "border-border/40 bg-transparent hover:border-primary/30"
                }`}>
                <p className={`font-semibold text-sm transition-colors ${i === active ? "text-primary" : "text-muted-foreground"}`}>{t.name}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 tracking-wide">{t.pkg}</p>
              </button>
            ))}
          </div>

          {/* right — quote */}
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-8 md:p-10 relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-40 h-40"
                style={{ background: "radial-gradient(circle at top right, rgba(200,168,74,0.1), transparent 70%)" }} />
              <div className="text-3xl mb-5" style={{ color: "#c8a84a", letterSpacing: 4 }}>
                {"★".repeat(testimonials[active].stars)}
              </div>
              <p className="font-display text-2xl md:text-3xl leading-relaxed text-foreground mb-6 italic">
                "{testimonials[active].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center font-display text-primary text-lg">
                  {testimonials[active].name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonials[active].name}</p>
                  <p className="text-xs text-primary/70 tracking-widest uppercase">{testimonials[active].pkg}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function ProcessSection() {
  return (
    <Section id="process">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mb-14 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-primary mb-4">Simple & certain</p>
        <h2 className="font-display text-5xl md:text-6xl">
          How it <span className="italic text-gradient-gold">works.</span>
        </h2>
      </motion.div>

      <div className="relative">
        {/* connecting line */}
        <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center">
              {/* number circle */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/15 to-transparent text-2xl">
                {step.icon}
                <span className="absolute -top-2 -right-2 text-[10px] font-bold tracking-widest text-primary/60">{step.n}</span>
              </div>
              <h3 className="font-display text-xl mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Package teaser (replaces old packages section) ────────────────────────────
function PackageTeaserSection() {
  return (
    <Section id="packages">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-start">
        {/* left — drone landing pad (kept) */}
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Touchdown</p>
          <h2 className="font-display text-5xl md:text-6xl mb-6">
            The drone <span className="italic text-gradient-gold">lands here.</span>
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md">
            Four packages, one festival. From intimate portrait sessions to full-day cinematic coverage with drone aerials.
          </p>
          <div id="drone-landing-pad" className="relative mx-auto h-64 w-64 md:h-72 md:w-72" aria-hidden>
            <div className="absolute inset-0 rounded-full border border-primary/40 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-primary/30" />
            <div className="absolute inset-10 rounded-full border border-dashed border-primary/40" />
            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl text-primary/80 tracking-widest">H</span>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-accent/60 animate-ping" />
          </div>
          <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Active services · pick one →</p>
        </div>

        {/* right — teaser cards + CTA to full packages page */}
        <div>
          <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Starting from</p>
            <Link to="/packages" className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase">
              See full details →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {packageTeasers.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.45, delay: i * 0.07 }}
                className="group relative rounded-2xl border p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                style={{
                  borderColor: `${p.color}25`,
                  background: `linear-gradient(135deg, ${p.color}08 0%, transparent 60%)`,
                }}
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at top right, ${p.color}18, transparent 70%)` }} />

                {p.hot && (
                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
                    style={{ background: p.color, color: "#0a0a0a" }}>
                    Popular
                  </span>
                )}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: `${p.color}12`, border: `1px solid ${p.color}25` }}>
                  {p.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">{p.duration}</p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="font-display text-xl" style={{ color: p.color }}>{p.price}</div>
                  <div className="text-[10px] text-muted-foreground/50 tracking-widest mt-0.5">onwards</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.35 }}
            className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-transparent p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-foreground text-sm">Includes drone add-on option</p>
              <p className="text-xs text-muted-foreground mt-0.5">All packages · 90-min flight · DGCA certified</p>
            </div>
            <Link to="/packages"
              className="rounded-full border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
              Compare all packages →
            </Link>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ── Stats / social proof bar ──────────────────────────────────────────────────
function SocialProofBar() {
  return (
    <div className="border-y border-border/40 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        className="flex gap-0 whitespace-nowrap w-max py-4">
        {[...Array(2)].map((_, rep) => (
          <div key={rep} className="flex items-center gap-0">
            {[
              { n: "7",    l: "years at the festival" },
              { n: "1,200+", l: "families served"       },
              { n: "48h",  l: "delivery promise"        },
              { n: "4K",   l: "cinematic aerials"       },
              { n: "100%", l: "DGCA certified"          },
              { n: "5★",   l: "average rating"          },
            ].map(({ n, l }) => (
              <div key={n+l} className="flex items-center gap-8 px-10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl text-primary">{n}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{l}</span>
                </div>
                <span className="text-primary/30 text-lg">✦</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Award / press bar ─────────────────────────────────────────────────────────
function PressBar() {
  return (
    <section className="py-14 border-b border-border/30">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-muted-foreground/50 mb-8">As featured in</p>
        <div className="flex flex-wrap justify-center gap-x-14 gap-y-4 items-center">
          {["Kerala Tourism", "The Hindu", "Mathrubhumi", "Wedding Wire India", "Photography.in"].map(name => (
            <span key={name} className="font-display text-lg text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors tracking-widest">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Parallax quote break ──────────────────────────────────────────────────────
function QuoteBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div ref={ref} className="relative overflow-hidden py-28 md:py-40">
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0">
        <img src={portrait} alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      </motion.div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight italic text-gradient-gold">
          "We know which corner of the tank glows at 6:42pm."
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="mt-6 text-sm uppercase tracking-[0.35em] text-muted-foreground/50">
          — Seven years covering the same festival
        </motion.p>
      </div>
    </div>
  );
}

// ── Urgency / scarcity strip ──────────────────────────────────────────────────
function UrgencyStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-6 my-0 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-primary/8 to-accent/10 p-5 flex items-center justify-between gap-4 flex-wrap max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
        <p className="text-sm font-semibold text-foreground">
          Festival season 2026 — <span className="text-primary">limited slots remaining</span>
        </p>
      </div>
      <a href="#book"
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition glow-gold">
        Reserve now
      </a>
    </motion.div>
  );
}

// ── Main Home ─────────────────────────────────────────────────────────────────
function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Fetch gallery items in real-time
  useEffect(() => {
    const q = query(
      collection(db, "media_gallery"),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const arr: MediaItem[] = [];
      snap.forEach((d) => {
        arr.push({ id: d.id, ...(d.data() as MediaItem) });
      });
      setMediaItems(arr);
    });
    
    return () => unsub();
  }, []);

  return (
    <div id="top" className="relative overflow-hidden">
      <Toaster theme="dark" position="top-center" richColors />
      <FlyingDrone />
      <Nav />

      {/* ── FLOATING QUICK ACCESS ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        <a href="/customer-login"
          className="group flex items-center gap-3 rounded-full border border-pink-500/20 bg-black/60 px-5 py-4 text-white shadow-2xl backdrop-blur-2xl transition hover:scale-105 hover:border-pink-400">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500 text-xl">👤</div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">Customer Portal</div>
            <div className="text-xs text-white/50">View bookings</div>
          </div>
        </a>
      </div>

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex min-h-screen items-end overflow-hidden pb-20 pt-32">
        <img src={hero} alt="Aambal Vasantham festival night with floating water lilies and lit temple"
          width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="relative mx-auto w-full max-w-7xl px-6">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background/40 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Aambal Vasantham · 2026
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-6xl leading-[1.05] md:text-8xl lg:text-9xl">
            The festival,<br />
            <span className="italic text-gradient-gold">remembered in light.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground">
            A boutique studio crafting photographs and cinematic drone films of the Aambal Vasantham
            water-lily festival. Family portraits, processions, temple aerials.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-4">
            <a href="#book" className="rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition hover:bg-primary/90 glow-gold">
              Book a shoot
            </a>
            <a href="#drone" className="rounded-full border border-border px-8 py-4 font-medium text-foreground transition hover:border-primary hover:text-primary">
              See drone work →
            </a>
            <Link to="/packages" className="rounded-full border border-pink-500 bg-pink-500/10 px-8 py-4 font-medium text-pink-300 transition hover:bg-pink-500 hover:text-white">
              View Packages
            </Link>
          </motion.div>
          <div className="mt-20 flex items-end justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>Scroll · watch the drone land below ↓</span>
            <span className="hidden md:block">Madurai · Tamil Nadu</span>
          </div>
        </div>
      </section>

      {/* ══════════ SOCIAL PROOF MARQUEE ══════════ */}
      <SocialProofBar />

      {/* ══════════ CMS GALLERY FEED ══════════ */}
      {mediaItems.length > 0 && (
        <Section id="dynamic-gallery" className="py-24 bg-black/40">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Latest Work</p>
            <h2 className="font-display text-4xl md:text-5xl">
              From the <span className="italic text-gradient-gold">field.</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaItems.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <video
                    src={item.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                )}
                
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                  <p className="text-sm font-medium text-white">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* ══════════ PACKAGES TEASER (replaces old grid) ══════════ */}
      <PackageTeaserSection />

      {/* ══════════ ABOUT FESTIVAL ══════════ */}
      <Section id="about">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">About the festival</p>
            <h2 className="font-display text-5xl md:text-6xl">
              Three nights of <span className="italic text-gradient-gold">lilies, lamps & song.</span>
            </h2>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Aambal Vasantham — the "spring of the water lily" — gathers families around lotus-lit
              ponds and lamp-lined temple corridors. It is colour at its loudest, silence at its
              softest, and one of the hardest festivals to photograph well.
            </p>
            <p>
              We've covered it for seven years. We know which corner of the tank glows at 6:42pm,
              which procession route the elephants take, and which roof gives the drone the cleanest line.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              {[["7","Years covering"],["1.2k","Families served"],["48h","Delivery promise"]].map(([n,l]) => (
                <div key={l}>
                  <div className="font-display text-4xl text-primary">{n}</div>
                  <div className="text-sm text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="lotus-divider mx-auto max-w-5xl" />

      {/* ══════════ HOW IT WORKS ══════════ */}
      <ProcessSection />

      {/* ══════════ DRONE ══════════ */}
      <Section id="drone">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
            <img src={aerial} alt="Aerial drone view of festival temple lit with thousands of lamps"
              loading="lazy" width={1600} height={1000} className="rounded-3xl border border-border shadow-2xl" />
            <div className="absolute -bottom-6 -right-6 rounded-2xl border border-primary/40 bg-background/90 backdrop-blur p-5 max-w-[220px]">
              <div className="text-xs uppercase tracking-widest text-primary mb-1">Live feed</div>
              <div className="font-display text-xl">Altitude 78m · 4K</div>
              <div className="text-xs text-muted-foreground mt-1">Hold for procession pass</div>
            </div>
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Drone Shots</p>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              See the festival <span className="italic text-gradient-gold">from above.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              A drone changes everything. The lamp-pattern around the temple, the procession winding
              through the streets, the lily-pond reflecting fireworks — these shots simply don't
              exist from the ground.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {droneFeatures.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card/30 p-5">
                  <div className="font-medium text-foreground mb-1">{f.title}</div>
                  <div className="text-sm text-muted-foreground">{f.text}</div>
                </div>
              ))}
            </div>
            <div className="drone-card mt-10 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-display text-2xl">Drone Add-on</div>
                <div className="text-sm text-muted-foreground">Attach to any package · 90-min flight</div>
              </div>
              <div className="font-display text-3xl text-gradient-gold">+ ₹6,500</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ PARALLAX QUOTE ══════════ */}
      <QuoteBreak />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection />

      {/* ══════════ PRESS BAR ══════════ */}
      <PressBar />

      {/* ══════════ INSTAGRAM ══════════ */}
      <InstagramFeed />

      {/* ══════════ HOMESTAY ══════════ */}
      <HomestaySection />

      {/* ══════════ GALLERY ══════════ */}
      <Section id="gallery">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Gallery</p>
          <h2 className="font-display text-5xl md:text-6xl">
            Moments we've <span className="italic text-gradient-gold">captured.</span>
          </h2>
        </div>
        <GallerySection />
      </Section>

      {/* ══════════ URGENCY STRIP ══════════ */}
      <div className="px-6 py-8">
        <UrgencyStrip />
      </div>

      {/* ══════════ BOOKING ══════════ */}
      <Section id="book">
        <div className="grid gap-10 xl:grid-cols-[0.9fr_1.4fr] items-start">
          <div className="max-w-[440px]">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Reserve a slot</p>
            <h2 className="font-display max-w-[400px] text-4xl leading-[0.95] tracking-[-0.03em] md:text-5xl xl:text-6xl mb-5">
              The dates fill <span className="italic text-gradient-gold">fast.</span>
            </h2>
            <p className="max-w-[400px] text-base leading-relaxed text-muted-foreground mb-8 xl:text-lg">
              We take a limited number of bookings each festival night so every family gets undivided
              attention. Tell us what you need — we'll confirm by WhatsApp within 24 hours.
            </p>
            <div className="max-w-[400px] space-y-5 text-sm">
              {[
                ["No advance for portrait sittings", "Pay only on the day of shoot."],
                ["20% advance for full-day & bridal", "Refundable up to 7 days prior."],
                ["Drone subject to weather clearance", "Free reschedule if grounded."],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">✦</span>
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-muted-foreground">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-border bg-card/40 p-3 sm:p-6 md:p-10 backdrop-blur-2xl overflow-hidden">
            <BookingForm
              selectedPlan={{ name: "Festival Portrait", price: "₹4,999" }}
              onBookingComplete={() => {}}
            />
          </div>
        </div>
      </Section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-border/60 mt-10">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div>
            <div className="font-display text-2xl text-gradient-gold">Aambal Vasantham Studio</div>
            <p className="mt-1">Kottayam · Kerala · India</p>
          </div>
          <div className="space-y-1 md:text-right">
            <p>hello@aambalstudio.in</p>
            <p>+91 98xxx xxxxx</p>
            <p className="text-xs mt-3 opacity-70">© {new Date().getFullYear()} Aambal Vasantham Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/Nav";
import { FlyingDrone } from "@/components/FlyingDrone";
import { BookingForm } from "@/components/BookingForm";
import hero from "@/assets/hero-festival.jpg";
import aerial from "@/assets/drone-aerial.jpg";
import portrait from "@/assets/portrait-festival.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aambal Vasantham Festival Photography & Drone Studio" },
      {
        name: "description",
        content:
          "Book festival portraits, family coverage and cinematic drone shots for the Aambal Vasantham festival. Limited slots — reserve now.",
      },
      { property: "og:title", content: "Aambal Vasantham Festival Photography" },
      {
        property: "og:description",
        content: "Cinematic photo & drone coverage for the Aambal Vasantham festival.",
      },
    ],
  }),
  component: Home,
});

const packages = [
  {
    name: "Festival Portrait",
    price: "₹4,999",
    duration: "1 hour",
    items: ["Solo / couple portraits", "30+ edited photos", "Same-day previews", "Online gallery"],
  },
  {
    name: "Family & Group",
    price: "₹8,999",
    duration: "2 hours",
    items: ["Up to 12 members", "80+ edited photos", "Candid + posed", "Printed 8×12 (×4)"],
    featured: true,
  },
  {
    name: "Bridal / Couple",
    price: "₹14,999",
    duration: "Half day",
    items: ["2 photographers", "150+ edits", "Cinematic reel", "Premium album"],
  },
  {
    name: "Full Day Coverage",
    price: "₹24,999",
    duration: "Sunrise → night",
    items: ["Procession + temple + reception", "300+ edits", "4K highlight film", "Drone add-on ready"],
  },
];

const droneFeatures = [
  { title: "4K Cinematic Aerials", text: "DJI Mavic 3 Pro · Hasselblad sensor · 5.1K ProRes ready." },
  { title: "Licensed & Insured", text: "DGCA certified pilots, public liability cover up to ₹50L." },
  { title: "Festival Specialist", text: "Crowd-safe flight plans tuned for processions, temple aartis and fireworks." },
  { title: "Same-Day Teaser", text: "Edited 60-second aerial reel delivered before midnight." },
];

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-6 py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
}

function Home() {
  return (
    <div id="top" className="relative overflow-hidden">
      <Toaster theme="dark" position="top-center" richColors />
      <FlyingDrone />
      <Nav />

{/* FLOATING QUICK ACCESS */}
<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
  
  {/* CUSTOMER DASHBOARD */}
  <a
    href="/customer-login"
    className="group flex items-center gap-3 rounded-full border border-pink-500/20 bg-black/60 px-5 py-4 text-white shadow-2xl backdrop-blur-2xl transition hover:scale-105 hover:border-pink-400"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500 text-xl">
      👤
    </div>

    <div className="hidden sm:block">
      <div className="text-sm font-semibold">
        Customer Portal
      </div>

      <div className="text-xs text-white/50">
        View bookings
      </div>
    </div>
  </a>

 
</div>

      {/* HERO */}
      <section className="relative flex min-h-screen items-end overflow-hidden pb-20 pt-32">
        <img
          src={hero}
          alt="Aambal Vasantham festival night with floating water lilies and lit temple"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />

        <div className="relative mx-auto w-full max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-background/40 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Aambal Vasantham · 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-6xl leading-[1.05] md:text-8xl lg:text-9xl"
          >
            The festival,
            <br />
            <span className="italic text-gradient-gold">remembered in light.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            A boutique studio crafting photographs and cinematic drone films of the Aambal Vasantham
            water-lily festival. Family portraits, processions, temple aerials.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#book"
              className="rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition hover:bg-primary/90 glow-gold"
            >
              Book a shoot
            </a>
            <a
              href="#drone"
              className="rounded-full border border-border px-8 py-4 font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              See drone work →
            </a>
          </motion.div>

          <div className="mt-20 flex items-end justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>Scroll · watch the drone land below ↓</span>
            <span className="hidden md:block">Madurai · Tamil Nadu</span>
          </div>
        </div>
      </section>

      {/* PACKAGES — where the drone lands */}
      <Section id="packages">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-start">
          {/* Landing pad column */}
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Touchdown</p>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              The drone <span className="italic text-gradient-gold">lands here.</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md">
              Every service we offer for the Aambal Vasantham festival — photo, drone, cinematic
              films and full-day coverage — all on one landing pad.
            </p>

            {/* The actual landing pad */}
            <div
              id="drone-landing-pad"
              className="relative mx-auto h-64 w-64 md:h-72 md:w-72"
              aria-hidden
            >
              {/* concentric rings */}
              <div className="absolute inset-0 rounded-full border border-primary/40 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-primary/30" />
              <div className="absolute inset-10 rounded-full border border-dashed border-primary/40" />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl text-primary/80 tracking-widest">H</span>
              </div>
              {/* pulse ring */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/60 animate-ping" />
            </div>
            <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Active services · pick one →
            </p>
          </div>

          {/* Packages grid */}
          <div>
            <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Services & Packages</p>
              <p className="text-xs text-muted-foreground max-w-xs text-right">
                Photo · Drone · Cinematic · Full-day
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {packages.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`rounded-2xl border p-6 flex flex-col gap-4 transition hover:-translate-y-1 ${
                    p.featured
                      ? "border-primary bg-gradient-to-b from-primary/15 to-transparent glow-gold"
                      : "border-border bg-card/40 hover:border-primary/50"
                  }`}
                >
                  {p.featured && (
                    <span className="self-start rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-widest text-primary-foreground">
                      Most booked
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-2xl">{p.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{p.duration}</p>
                  </div>
                  <div className="font-display text-3xl text-gradient-gold">{p.price}</div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground border-t border-border/60 pt-4">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="text-primary">✦</span> {it}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#book"
                    className="mt-auto rounded-full border border-border px-4 py-2 text-center text-sm font-medium hover:border-primary hover:text-primary transition"
                  >
                    Book this
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ABOUT FESTIVAL */}
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
              {[
                ["7", "Years covering"],
                ["1.2k", "Families served"],
                ["48h", "Delivery promise"],
              ].map(([n, l]) => (
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

      {/* DRONE SECTION — where the drone "lands" */}
      <Section id="drone">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img
              src={aerial}
              alt="Aerial drone view of festival temple lit with thousands of lamps"
              loading="lazy"
              width={1600}
              height={1000}
              className="rounded-3xl border border-border shadow-2xl"
            />
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
            <div className="mt-10 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-display text-2xl">Drone Add-on</div>
                <div className="text-sm text-muted-foreground">Attach to any package · 90-min flight</div>
              </div>
              <div className="font-display text-3xl text-gradient-gold">+ ₹6,500</div>
            </div>
          </div>
        </div>
      </Section>

      {/* GALLERY */}
      <Section id="gallery">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Recent work</p>
        <h2 className="font-display text-5xl md:text-6xl mb-16 max-w-2xl">
          Quiet moments, <span className="italic text-gradient-gold">loud festival.</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[hero, portrait, aerial, hero, aerial, portrait, hero, aerial].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className={`overflow-hidden rounded-2xl border border-border ${
                i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img
                src={src}
                alt="Festival photography sample"
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* BOOKING */}
      <Section id="book">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Reserve a slot</p>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              The dates fill <span className="italic text-gradient-gold">fast.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              We take a limited number of bookings each festival night so every family gets undivided
              attention. Tell us what you need — we'll confirm by WhatsApp within 24 hours.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">✦</span>
                <div>
                  <div className="font-medium">No advance for portrait sittings</div>
                  <div className="text-muted-foreground">Pay only on the day of shoot.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">✦</span>
                <div>
                  <div className="font-medium">20% advance for full-day & bridal</div>
                  <div className="text-muted-foreground">Refundable up to 7 days prior.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">✦</span>
                <div>
                  <div className="font-medium">Drone subject to weather clearance</div>
                  <div className="text-muted-foreground">Free reschedule if grounded.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card/40 p-3 sm:p-6 md:p-10 backdrop-blur-2xl overflow-hidden">
            <BookingForm />
          </div>
        </div>
      </Section>

      {/* FOOTER */}
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

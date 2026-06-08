import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import hero from "@/assets/hero-festival.jpg";
import aerial from "@/assets/drone-aerial.jpg";
import portrait from "@/assets/portrait-festival.jpg";
export const Route = createFileRoute("/homestay")({
  head: () => ({
    meta: [
      { title: "The Aambal Retreat · Premium Homestay" },
      { name: "description", content: "A century-old garden villa exclusively for Aambal Vasantham premium package guests." },
    ],
  }),
  component: HomestayPage,
});

// ── Static data & Configurations ──────────────────────────────────────────────
const STATIC_AMENITIES = [
  { icon: "🍃", title: "Ayurvedic Breakfast",  desc: "Kerala breakfast prepared fresh — puttu, kadala, appam, homemade chai." },
  { icon: "🌅", title: "Sunrise Temple Walk",  desc: "Guided 45-minute walk to the temple tank at golden hour, every morning." },
  { icon: "🚁", title: "Drone Lounge",         desc: "Battery charging wall, flight planning desk, weather-monitoring screens." },
  { icon: "🎞", title: "Edit Suite",           desc: "Calibrated iMac + two 4K monitors, 10Gbps NVMe NAS, Lightroom licensed." },
  { icon: "🛶", title: "Boat on Lotus Pond",   desc: "Private punting boat at dawn — row through the water lilies yourself." },
  { icon: "🌿", title: "Ayurvedic Therapy",    desc: "In-house therapist, evening Abhyanga oil massage available on request." },
  { icon: "🏛️", title: "Heritage Library",     desc: "300+ volumes on Kerala art, temple architecture, photography & cinema." },
  { icon: "🌙", title: "Rooftop Stargazing",   desc: "Telescope and sky maps provided. Dark-sky certified location." },
];

const CTA_PERKS = [
  { icon: "💳", label: "No payment now",       note: "Settle on arrival" },
  { icon: "🔄", label: "Free cancellation",    note: "Up to 7 days prior" },
  { icon: "🎁", label: "Breakfast included",   note: "All mornings" },
  { icon: "🚐", label: "Festival transfer",    note: "Both directions" },
];

const FALLBACK_HERO = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop";

const HOTSPOT_POSITIONS = [
  { top: "35%", left: "30%" },
  { top: "45%", left: "65%" },
  { top: "65%", left: "20%" },
  { top: "75%", left: "70%" },
];

// ── Shared micro components ────────────────────────────────────────────────────
function ImageBg({ src, style = {}, className = "" }: { src?: string; style?: React.CSSProperties, className?: string }) {
  if (src) {
    return <img src={src} alt="Homestay" className={`w-full h-full object-cover ${className}`} style={style} />;
  }
  return (
    <div className={`w-full h-full bg-white/40 flex flex-col items-center justify-center relative ${className}`} style={style}>
      <div className="text-center opacity-40 z-10">
        <div className="text-5xl mb-2">🌿</div>
        <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em]">ADD IMAGE IN CMS</p>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')]"></div>
    </div>
  );
}

function BentoEditableSection({
  id, children, eyebrow, title, noPadding = false, className = "", style = {}
}: { id: string; children: ReactNode; eyebrow?: string; title?: ReactNode; noPadding?: boolean; className?: string; style?: React.CSSProperties }) {
  
  const handleClick = () => {
    try { window.parent.postMessage({ type: "SELECT_SECTION", section: id }, "*"); } catch {}
  };

  return (
    <div
      id={`section-${id}`}
      onClick={handleClick}
      style={style}
      className={`scroll-mt-24 relative z-10 w-full max-w-[1400px] mx-auto mb-6 bg-white/60 backdrop-blur-3xl rounded-[40px] border-2 border-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden group hover:border-primary/40 transition-colors duration-300 cursor-default ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>
      
      <div className={`relative z-10 ${noPadding ? '' : 'p-8 md:p-12'}`}>
        {(eyebrow || title) && (
          <div className="mb-10 flex flex-col items-start">
            {eyebrow && (
              <span className="border border-black/5 bg-white/80 shadow-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-gray-500 mb-4">
                {eyebrow}
              </span>
            )}
            {title && <h2 className="font-display text-4xl md:text-5xl text-gray-900">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function RoomHotspot({ feature, pos }: { feature: string, pos: { top: string, left: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute flex flex-col items-center z-20"
      style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full flex flex-col shadow-2xl">
         <span className="text-white/60 text-[9px] uppercase tracking-widest mb-0.5">Commodities</span>
         <span className="font-semibold text-sm whitespace-nowrap">{feature}</span>
      </div>
      <div className="w-px h-16 bg-white/40"></div>
      <div className="w-4 h-4 bg-white/90 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-white/50 ring-4 ring-white/10"></div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomestayPage() {
  const [cms, setCms] = useState<Record<string, any>>({});
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const [tIdx, setTIdx] = useState(0);

  // Mobile App View States
  const [mobileViewRoom, setMobileViewRoom] = useState<any | null>(null);
  const [mobileTab, setMobileTab] = useState("home");
  const [mobileHeroIdx, setMobileHeroIdx] = useState(0);

  // Live Firestore subscription
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "homestayContent", "main"), (snap) => {
      if (snap.exists()) setCms(snap.data());
    });
    return () => unsub();
  }, []);

  // Scroll-to-section from editor shell
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.type === "SCROLL_TO_SECTION") {
        document.getElementById(`section-${e.data.section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);

  const handleCmsSectionSelect = (sectionId: string) => {
    try { window.parent.postMessage({ type: "SELECT_SECTION", section: sectionId }, "*"); } catch {}
  };

  const testimonials = [
    { text: cms.t1Text, name: cms.t1Name, pkg: cms.t1Pkg },
    { text: cms.t2Text, name: cms.t2Name, pkg: cms.t2Pkg },
    { text: cms.t3Text, name: cms.t3Name, pkg: cms.t3Pkg },
  ].filter((t) => t.text && t.name);
  
  const ROOMS = [1, 2, 3, 4].map((i) => ({
    id: String(i),
    name:    cms[`room${i}Name`]    ?? ["Lotus Suite","Temple View Room","Garden Cottage","Photographer's Studio"][i-1],
    tagline: cms[`room${i}Tagline`] ?? ["Pond-facing · King bed","Temple-facing · Queen bed","Private garden · Twin or King","Edit suite · North light"][i-1],
    price:   cms[`room${i}Price`]   ?? ["₹8,500 / night","₹6,500 / night","₹5,500 / night","₹7,200 / night"][i-1],
    icon:    cms[`room${i}Icon`]    ?? ["🪷","🛕","🌿","📸"][i-1],
    accent:  cms[`room${i}Accent`]  ?? ["#4a9460","#c8a84a","#6db87a","#a78bfa"][i-1],
    image:   cms[`room${i}Image`]   ?? FALLBACK_HERO,
    features: cms[`room${i}Features`] 
      ? cms[`room${i}Features`].split('\n').filter((f: string) => f.trim() !== '')
      : [
          ["King size bed","Private balcony over lotus pond","Claw-foot soaking tub","Complimentary breakfast"],
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

  const prevIdx = (activeRoomIdx - 1 + ROOMS.length) % ROOMS.length;
  const nextIdx = (activeRoomIdx + 1) % ROOMS.length;

  return (
    <>
      {/* ══════════════════════════════
          DESKTOP VIEW (Bento Style)
      ══════════════════════════════ */}
      <div id="top" className="hidden md:block relative min-h-screen bg-[#f4f4f6]" style={{ overflowX: "clip" }}>
        
        <div 
          onClick={() => handleCmsSectionSelect("hero")}
          className="relative z-30 w-full h-screen min-h-[700px] bg-[#0c0d12] overflow-hidden flex flex-col justify-between cursor-pointer border-b border-white/5" 
          id="section-hero"
        >
          <img src={cms.heroImage || FALLBACK_HERO} className="absolute inset-0 w-full h-full object-cover opacity-85 scale-100 transition-transform duration-700 hover:scale-105" alt="Hero Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40"></div>
          
          <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1300px] bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 flex justify-between items-center z-50 shadow-2xl">
            <div className="text-white font-display text-xl font-bold tracking-widest uppercase">
              <Link to="/">{cms.footerName || "AAMBAL"}</Link>
            </div>
            <div className="hidden lg:flex gap-8 text-white/70 text-[11px] font-semibold uppercase tracking-widest">
              <a href="#section-about" className="hover:text-white transition-colors">{cms.navLink1 || "Why Us"}</a>
              <a href="#section-rooms" className="hover:text-white transition-colors">{cms.navLink2 || "Villas"}</a>
              <a href="#section-amenities" className="hover:text-white transition-colors">{cms.navLink3 || "Amenities"}</a>
              <a href="#section-gallery" className="hover:text-white transition-colors">{cms.navLink4 || "Gallery"}</a>
            </div>
            <div className="flex gap-3">
              <a href="#section-cta" className="bg-white text-black px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition shadow-lg">
                {cms.navCtaText || "Sign Up"}
              </a>
            </div>
          </nav>

          <div className="absolute bottom-12 lg:bottom-16 w-[90%] max-w-[1300px] left-1/2 -translate-x-1/2 flex flex-col lg:flex-row justify-between lg:items-end z-40 gap-8">
            <div className="max-w-2xl">
              <h1 className="text-white font-display text-5xl md:text-7xl lg:text-[76px] leading-[1.05] tracking-tight font-bold">
                {cms.heroTitle ? (
                  <span dangerouslySetInnerHTML={{ __html: cms.heroTitle.replace(/\n/g, "<br />") }} />
                ) : (
                  <>Where the festival <br /> comes to rest.</>
                )}
              </h1>
              <p className="text-white/60 text-sm md:text-base font-medium mt-4 max-w-lg leading-relaxed">
                {cms.heroSubtitle || "A heritage garden villa, exclusively for our premium photography guests. Ten minutes from the temple tank."}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <a href="#section-rooms" className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold shadow-md transition hover:bg-white/90 flex items-center gap-2">
                  <span>{cms.heroBtn1Text || "Book a Free Call"}</span>
                  <span className="text-xs">↗</span>
                </a>
                <a href="#section-cta" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-xs font-bold transition hover:bg-white/20">
                  {cms.heroBtn2Text || "Get a Free Quote"}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4 shrink-0 lg:w-[400px]">
              <div className="flex flex-wrap lg:justify-end gap-6 md:gap-10 text-white">
                <div className="border-l border-white/20 pl-4">
                  <div className="text-2xl font-display font-bold mb-0.5">{cms.stat1Value || "1-3"}</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{cms.stat1Label || "Nights Stay"}</div>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <div className="text-2xl font-display font-bold mb-0.5">{cms.stat2Value || "10 min"}</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{cms.stat2Label || "To Temple"}</div>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <div className="text-2xl font-display font-bold mb-0.5">{cms.stat3Value || "1924"}</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{cms.stat3Label || "Heritage Est"}</div>
                </div>
              </div>
              
              <div className="lg:self-end bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 w-max text-white/80 text-[11px] font-bold uppercase tracking-wider tracking-widest shadow-inner mt-2">
                {cms.heroBadgeText || "Eco-Friendly Energy"}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full px-4 md:px-8 mt-6 mb-12" id="section-rooms">
          <div className="w-full h-[85vh] min-h-[600px] max-w-[1500px] mx-auto bg-[#1a1a1a] rounded-[40px] border border-white/20 overflow-hidden relative shadow-2xl ring-1 ring-black/5">
            
            <AnimatePresence mode="wait">
              <motion.img
                key={activeRoomIdx}
                src={ROOMS[activeRoomIdx].image}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/10"></div>

            <AnimatePresence mode="wait">
              <motion.div key={activeRoomIdx} className="absolute inset-0">
                {ROOMS[activeRoomIdx].features.slice(0, 4).map((feat: string, idx: number) => {
                  const roomNum = activeRoomIdx + 1;
                  const customTop = cms[`room${roomNum}Hotspot${idx}Top`];
                  const customLeft = cms[`room${roomNum}Hotspot${idx}Left`];
                  const pos = {
                    top: customTop !== undefined ? `${customTop}%` : HOTSPOT_POSITIONS[idx].top,
                    left: customLeft !== undefined ? `${customLeft}%` : HOTSPOT_POSITIONS[idx].left,
                  };
                  return <RoomHotspot key={idx} feature={feat} pos={pos} />;
                })}
              </motion.div>
            </AnimatePresence>

            <button onClick={() => setActiveRoomIdx(prevIdx)} className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/50 hover:text-white transition z-20 group">
              <span className="text-lg group-hover:-translate-x-1 transition-transform">{'<'}</span>
              <span className="text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {ROOMS[prevIdx].name.split(' ')[0]}
              </span>
            </button>

            <button onClick={() => setActiveRoomIdx(nextIdx)} className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white/50 hover:text-white transition z-20 group">
              <span className="text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                {ROOMS[nextIdx].name.split(' ')[0]}
              </span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">{'>'}</span>
            </button>

            <div className="absolute bottom-8 left-0 w-full flex justify-center z-30 pointer-events-none">
              <div className="pointer-events-auto relative flex items-center justify-center gap-2 md:gap-3 bg-black/40 backdrop-blur-2xl p-2 rounded-full border border-white/20 w-max shadow-2xl">
                
                {ROOMS.map((room, idx) => (
                  <div key={room.id} className="relative">
                    <AnimatePresence>
                      {activeRoomIdx === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white/90 backdrop-blur-xl p-2 rounded-[24px] shadow-2xl border border-white/50 flex flex-col items-center"
                        >
                          <img src={room.image} className="w-40 h-28 object-cover rounded-[16px] mb-3" />
                          <span className="text-black font-bold text-sm mb-1">{room.name.split(' ')[0]}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setActiveRoomIdx(idx)}
                      className={`relative z-10 px-6 md:px-8 py-3.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${idx === activeRoomIdx ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                      {room.name.split(' ')[0]}
                    </button>
                  </div>
                ))}
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center ml-1 md:ml-2 hover:bg-white/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </button>
              </div>
            </div>
            
          </div>
        </div>

        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={cms.heroImage || FALLBACK_HERO} alt="Background" className="w-full h-full object-cover scale-105 opacity-10 filter brightness-110" />
          <div className="absolute inset-0 bg-[#f4f4f6]/80 backdrop-blur-[80px]"></div>
        </div>

        <div className="relative z-10 px-4 md:px-8 pb-24 space-y-6">

          {cms.stripVisible !== false && (
            <BentoEditableSection id="strip" className="!py-6">
              <motion.div
                initial={{ x: 0 }} animate={{ x: "-50%" }}
                transition={{ duration: Number(cms.stripSpeed) || 30, ease: "linear", repeat: Infinity }}
                className="flex gap-12 whitespace-nowrap w-max"
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
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    <span className="text-xs text-gray-500 font-medium">— {item.note}</span>
                    <span className="text-gray-300 ml-6">✦</span>
                  </div>
                ))}
              </motion.div>
            </BentoEditableSection>
          )}

          <BentoEditableSection id="about" eyebrow="About the Retreat" title={<>A century lived in <br/><span className="italic text-primary">ceremony & stillness.</span></>}>
            <div className="grid lg:grid-cols-[1fr_1fr] gap-12 mt-4 items-center">
              <div>
                <div className="w-12 h-1 bg-primary mb-8 rounded-full" />
                {cms.aboutImage && <img src={cms.aboutImage} alt="" className="w-full h-48 object-cover rounded-[24px] shadow-sm mb-6 border border-white/80" />}
                <p className="text-gray-600 leading-relaxed font-medium">
                  {cms.aboutText || "Built in 1924 by the Pillai family as a spice-trader's mansion, the Aambal Retreat has witnessed a century of Vasantham festivals from its verandas. We restored it specifically to serve as a sanctuary for our photography clients."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[400px]">
                {[
                  { gridArea: "1/1/2/2", emoji: "🌿", label: "Garden courtyard" },
                  { gridArea: "1/2/3/3", emoji: "🪷", label: "Lotus pond" },
                  { gridArea: "2/1/3/2", emoji: "🛕", label: "Temple view" },
                ].map((cell, i) => (
                  <div key={i} style={{ gridArea: cell.gridArea }} className="bg-white/50 border border-white/80 rounded-[24px] shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">{cell.emoji}</span>
                    <span className="absolute bottom-4 left-4 text-[9px] font-bold tracking-widest text-gray-500 uppercase">{cell.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </BentoEditableSection>

          <BentoEditableSection id="amenities" eyebrow={cms.amenitiesLabel || "What awaits you"} title={<>Every morning a <br/><span className="italic text-primary">small ceremony.</span></>}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {STATIC_AMENITIES.map((a, i) => (
                <div key={a.title} className="bg-white/40 border border-white/80 rounded-[24px] p-6 shadow-sm hover:bg-white/80 transition-colors">
                  <div className="text-3xl mb-4">{a.icon}</div>
                  <h4 className="font-display text-xl font-bold text-gray-900 mb-2">{a.title}</h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </BentoEditableSection>

          <BentoEditableSection id="gallery" eyebrow={cms.galleryLabel || "Gallery"} title={<>The retreat <span className="italic text-primary">in every light.</span></>}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {Array.from({ length: 6 }, (_, i) => {
                const tall = i === 0 || i === 3;
                const imgSrc = i === 0 ? cms.galleryImg1 : i === 1 ? cms.galleryImg2 : i === 2 ? cms.galleryImg3 : null;
                const labels = ["Lotus pond","Temple view","Garden","Suite","Breakfast","Corridor"];
                return (
                  <div key={i} className={`relative rounded-[24px] overflow-hidden border border-white/80 shadow-sm group bg-gray-100 ${tall ? "row-span-2 aspect-[3/4]" : "aspect-[4/3]"}`}>
                    <ImageBg src={imgSrc ?? undefined} className="group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="absolute bottom-4 left-4 text-[10px] font-bold text-white tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      {labels[i % 6]}
                    </span>
                  </div>
                );
              })}
            </div>
          </BentoEditableSection>

          <div className="grid lg:grid-cols-2 gap-6">
            <BentoEditableSection id="testimonials" eyebrow="Guest Voices" title={<>Heard at <span className="italic text-primary">checkout.</span></>}>
               {testimonials.length > 0 && (
                  <div className="bg-white/50 border border-white/80 rounded-[32px] p-8 shadow-sm mt-8 relative overflow-hidden">
                    <div className="font-display text-[120px] leading-none text-black/5 absolute top-4 left-6 select-none pointer-events-none">"</div>
                    <div className="relative z-10 flex flex-col h-full min-h-[200px]">
                      <div className="text-primary text-lg tracking-[4px] mb-4">★★★★★</div>
                      <p className="font-display text-2xl md:text-3xl text-gray-900 italic mb-8">"{testimonials[tIdx]?.text}"</p>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">{testimonials[tIdx]?.name?.[0]}</div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{testimonials[tIdx]?.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{testimonials[tIdx]?.pkg}</p>
                          </div>
                        </div>
                        
                        {testimonials.length > 1 && (
                          <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                              <button key={i} onClick={(e) => { e.stopPropagation(); setTIdx(i); }} className={`w-2 h-2 rounded-full transition-all ${i === tIdx ? 'bg-primary scale-125' : 'bg-gray-300'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
               )}
            </BentoEditableSection>

            <BentoEditableSection id="location" eyebrow="Location" title={<>Ten minutes <br/><span className="italic text-primary">from everywhere.</span></>}>
              <div className="flex flex-col gap-3 mt-8">
                {locationItems.map((item, i) => (
                  <div key={i} className="bg-white/50 border border-white/80 rounded-[20px] p-4 flex items-center gap-4 shadow-sm">
                    <span className="text-2xl bg-white border border-gray-100 w-12 h-12 flex items-center justify-center rounded-full shadow-sm">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{item.dist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoEditableSection>
          </div>

          <BentoEditableSection id="cta" className="text-center !py-20">
            <div className="text-5xl mb-6">🪷</div>
            <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
              Only Full Day & Bridal guests may book.
            </h2>
            <p className="text-sm text-gray-600 font-medium max-w-lg mx-auto mb-10">
              Confirm your photography package first, then reach us on WhatsApp with your package reference number to reserve a room. Rooms fill each festival season by April.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
              {CTA_PERKS.map(({ icon, label, note }) => (
                <div key={label} className="bg-white/50 border border-white/80 rounded-[24px] p-5 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-2xl mb-2">{icon}</span>
                  <p className="text-[11px] font-bold text-gray-900 mb-1">{label}</p>
                  <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">{note}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/reserve" className="bg-gray-900 text-white hover:bg-black px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase shadow-md transition-colors flex items-center gap-2">
                <span>🪷</span> {cms.ctaBtn1Text || "Reserve your room"}
              </Link>
              <a href={cms.ctaBtn2Link || "/?scroll=book"} className="bg-white/60 border border-white/80 text-gray-700 hover:bg-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm transition-colors">
                {cms.ctaBtn2Text || "Book photography"}
              </a>
            </div>
          </BentoEditableSection>

          <BentoEditableSection id="footer" noPadding>
            <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold font-display text-xl shadow-sm">A</div>
                <div>
                  <h4 className="text-gray-900 font-bold tracking-wide font-display text-lg">{cms.footerName || "The Aambal Retreat"}</h4>
                  <p className="text-gray-500 text-[10px] mt-0.5 font-bold uppercase tracking-widest">{cms.footerTagline || "Kottayam · Kerala · Est. 1924"}</p>
                </div>
              </div>
              <div className="flex flex-col md:items-end text-sm text-gray-600 font-medium gap-1">
                <p>{cms.footerEmail || "hello@aambalstudio.in"}</p>
                <p>{cms.footerPhone || "+91 98xxx xxxxx"}</p>
                <Link to="/" className="text-primary font-bold text-[10px] uppercase tracking-widest mt-2 hover:underline">
                  ← Back to Studio
                </Link>
              </div>
            </div>
          </BentoEditableSection>

        </div>
      </div>

      {/* ══════════════════════════════
          MOBILE VIEW (Light Nature/Sage Glassmorphism)
      ══════════════════════════════ */}
      <div className="flex md:hidden w-full min-h-[100dvh] bg-[#eef3ea] flex-col relative overflow-hidden font-sans pb-24 z-50">
        
        <AnimatePresence mode="wait">
          {!mobileViewRoom ? (
            /* ── MOBILE HOME VIEW ── */
            <motion.div 
              key="mobile-home"
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              className="flex flex-col w-full h-full overflow-y-auto"
            >
              {/* Top Bar */}
              <div className="px-6 pt-12 flex justify-between items-center mb-6">
                <div>
                  <p className="text-2xl font-bold text-[#111] tracking-tight">Hi, Rayaan 👋</p>
                </div>
                <div className="bg-white rounded-full pl-2 pr-4 py-2 flex items-center gap-2 shadow-sm">
                  <div className="w-6 h-6 bg-[#fcd043] rounded-full flex items-center justify-center">☀️</div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-500 leading-none">Kerala</span>
                    <span className="text-[11px] font-bold text-[#111] leading-tight mt-0.5">32 °C</span>
                  </div>
                </div>
              </div>

              {/* Huge Headline & Search */}
              <div className="px-6 flex justify-between items-start mb-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span className="text-lg">🇮🇳</span> INDIA
                  </p>
                  <h1 className="text-[44px] font-medium leading-[1.1] text-[#111] tracking-tight">
                    Aambal<br/>Retreat
                  </h1>
                </div>
                <div className="w-[50px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-sm border border-white/50 text-gray-400 mt-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>

              {/* Pill Categories */}
              <div className="px-6 flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-2">
                <button className="flex items-center gap-2 bg-[#0e2614] text-white px-5 py-3 rounded-full text-[13px] font-medium shadow-md whitespace-nowrap">
                  <span className="text-lg leading-none">🛏️</span> Suites
                </button>
                <button className="flex items-center gap-2 bg-white text-[#111] px-5 py-3 rounded-full text-[13px] font-medium shadow-sm whitespace-nowrap">
                  <span className="text-lg leading-none">🌿</span> Amenities
                </button>
                <button className="flex items-center gap-2 bg-white text-[#111] px-5 py-3 rounded-full text-[13px] font-medium shadow-sm whitespace-nowrap">
                  <span className="text-lg leading-none">📸</span> Packages
                </button>
              </div>

              {/* Swipeable Domed Hero Image */}
              <div className="w-full relative z-10 px-4 mt-2 mb-10">
                <motion.div 
                  drag="x" dragConstraints={{ left: 0, right: 0 }} 
                  onDragEnd={(e, { offset }) => { 
                    if (offset.x < -80) setMobileHeroIdx(nextIdx);
                    if (offset.x > 80) setMobileHeroIdx(prevIdx);
                  }}
                  onClick={() => setMobileViewRoom(ROOMS[mobileHeroIdx])}
                  className="relative w-full h-[420px] rounded-t-full overflow-hidden cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={mobileHeroIdx}
                      src={ROOMS[mobileHeroIdx].image} 
                      initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  </AnimatePresence>
                  
                  {/* Faded bottom mask matching reference */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#eef3ea] via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-0 right-0 px-8 text-center flex flex-col items-center">
                    <h3 className="text-[28px] font-medium text-white mb-2 leading-tight tracking-tight drop-shadow-md">
                      {ROOMS[mobileHeroIdx].name}
                    </h3>
                    <p className="text-[13px] text-white/80 font-medium leading-relaxed mb-5 max-w-[250px] drop-shadow-sm">
                      {ROOMS[mobileHeroIdx].tagline}
                    </p>
                    
                    {/* Stats inside image */}
                    <div className="flex items-center gap-4 text-white font-medium text-[11px] tracking-wide mb-6">
                      <div className="flex items-center gap-1.5"><span className="text-sm">📅</span> 1-3 days</div>
                      <div className="flex items-center gap-1.5"><span className="text-sm">🚶</span> 10 min</div>
                      <div className="flex items-center gap-1.5"><span className="text-sm">👥</span> 2/room</div>
                    </div>
                    
                    <button className="bg-white/20 backdrop-blur-xl border border-white/40 text-white px-8 py-3.5 rounded-full text-[13px] font-medium shadow-lg hover:bg-white/30 transition-colors w-max">
                      Explore Suite
                    </button>
                  </div>
                </motion.div>
                
                {/* Dots */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {ROOMS.map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === mobileHeroIdx ? 'bg-[#0e2614] w-4' : 'bg-[#0e2614]/20'}`} />
                  ))}
                </div>
              </div>

              {/* Popular Rooms Dark Cards */}
              <div className="px-6 pb-8">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-2xl font-medium text-[#111]">Other Suites</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {ROOMS.filter((_, i) => i !== mobileHeroIdx).map((room) => (
                    <div key={room.id} onClick={() => setMobileViewRoom(room)} className="bg-[#0e2614] rounded-[32px] p-5 flex items-center justify-between shadow-xl cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-20 rounded-[20px] overflow-hidden shrink-0">
                          <img src={room.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[9px] text-[#a3e635] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full"></span> India
                          </p>
                          <h4 className="text-white font-medium text-[17px] mb-2">{room.name}</h4>
                          <div className="flex -space-x-2">
                            <img src={portrait} className="w-6 h-6 rounded-full border border-[#0e2614] object-cover" />
                            <img src={hero} className="w-6 h-6 rounded-full border border-[#0e2614] object-cover" />
                            <div className="w-6 h-6 rounded-full bg-[#a3e635] text-[#0e2614] flex items-center justify-center text-[8px] font-bold border border-[#0e2614]">+12</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            /* ── MOBILE DETAIL VIEW ── */
            <motion.div 
              key="mobile-detail"
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-[100] bg-[#eef3ea] flex flex-col overflow-hidden"
            >
              {/* Full Screen Image Top */}
              <div className="relative h-[55vh] w-full shrink-0">
                <img src={mobileViewRoom.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                
                {/* Top Actions */}
                <div className="absolute top-12 left-5 right-5 flex justify-between items-center z-50">
                  <button onClick={() => setMobileViewRoom(null)} className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <div className="bg-black/30 backdrop-blur-md rounded-full pl-2 pr-4 py-2 flex items-center gap-2 border border-white/20">
                    <div className="w-6 h-6 bg-[#fcd043] rounded-full flex items-center justify-center text-[10px]">☀️</div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/80 leading-none">Kerala</span>
                      <span className="text-[11px] font-bold text-white leading-tight mt-0.5">32 °C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Curved Content Body */}
              <div className="flex-1 bg-[#eef3ea] rounded-t-[40px] -mt-12 relative z-10 flex flex-col pt-10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                
                {/* Floating Yellow Star Button */}
                <div className="absolute -top-6 right-8 w-14 h-14 bg-[#fcd043] rounded-full flex items-center justify-center shadow-lg border-4 border-[#eef3ea] z-20">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>

                <div className="px-6 pb-24 overflow-y-auto">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-lg">🇮🇳</span> INDIA
                  </p>
                  <h1 className="text-4xl font-medium leading-[1.1] text-[#111] tracking-tight mb-6 pr-12">
                    Discovering <br/>{mobileViewRoom.name}
                  </h1>

                  <div className="flex items-center gap-6 text-[#111] font-medium text-[12px] tracking-wide mb-8 bg-white/60 p-4 rounded-2xl border border-white">
                    <div className="flex items-center gap-2"><span className="text-lg">📅</span> 1-3 days</div>
                    <div className="flex items-center gap-2"><span className="text-lg">🚶</span> 10 min</div>
                    <div className="flex items-center gap-2"><span className="text-lg">👥</span> 2/room</div>
                  </div>

                  <h3 className="text-[20px] font-medium text-[#111] mb-4">Amenities Included</h3>
                  <div className="flex flex-col gap-3 mb-6">
                    {mobileViewRoom.features.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white/50 p-3.5 rounded-2xl shadow-sm border border-white">
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0e2614] shadow-sm text-sm">✓</span>
                        <span className="text-[13px] font-medium text-gray-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Booking Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-[32px] flex items-center justify-between shadow-xl z-50">
                   <div className="pl-2">
                     <p className="text-[11px] text-gray-500 font-medium mb-0.5">Total Cost</p>
                     <p className="text-[20px] font-bold text-[#111]">
                       {mobileViewRoom.price.split(' ')[0]} <span className="text-[11px] text-gray-400 font-medium">/ night</span>
                     </p>
                   </div>
                   <Link to="/reserve" className="bg-[#0e2614] text-white px-8 py-4 rounded-full text-[14px] font-medium shadow-md active:scale-95 transition-transform">
                     Reserve Room
                   </Link>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLOATING DARK GREEN BOTTOM NAV (Persists on Home) ── */}
        {!mobileViewRoom && (
          <div className="absolute bottom-6 left-6 right-6 h-[70px] bg-[#0e2614] rounded-full flex items-center justify-around px-2 z-50 shadow-[0_15px_40px_rgba(14,38,20,0.4)]">
            <button onClick={() => setMobileTab('home')} className="flex items-center justify-center w-14 h-14">
              <svg width="24" height="24" viewBox="0 0 24 24" fill={mobileTab === 'home' ? "#a3e635" : "none"} stroke={mobileTab === 'home' ? "#a3e635" : "rgba(255,255,255,0.4)"} strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button onClick={() => setMobileTab('explore')} className="flex items-center justify-center w-14 h-14">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button onClick={() => setMobileTab('saved')} className="flex items-center justify-center w-14 h-14 relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#a3e635] rounded-full"></span>
            </button>
            <button onClick={() => setMobileTab('profile')} className="flex items-center justify-center w-14 h-14">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                <img src={hero} className="w-full h-full object-cover" />
              </div>
            </button>
          </div>
        )}

      </div>
    </>
  );
}
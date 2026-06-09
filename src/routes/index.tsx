import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/Nav";
import { FlyingDrone } from "@/components/FlyingDrone";

import hero from "@/assets/hero-festival.jpg";
import aerial from "@/assets/drone-aerial.jpg";
import portrait from "@/assets/portrait-festival.jpg";
import { InstagramFeed } from "@/components/InstagramFeed";
import { GallerySection } from "@/components/GallerySection";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import logo from "@/assets/logo.png";
import ambal2 from "@/assets/ambal2.mp4";

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
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const droneFeatures = [
  { title: "4K Cinematic Aerials", text: "DJI Mavic 3 Pro · Hasselblad sensor · 5.1K ProRes ready.", icon: "🎬" },
  { title: "Licensed & Insured", text: "DGCA certified pilots, public liability cover up to ₹50L.", icon: "🛡️" },
  { title: "Festival Specialist", text: "Crowd-safe flight plans tuned for processions, temple aartis and fireworks.", icon: "🛕" },
  { title: "Same-Day Teaser", text: "Edited 60-second aerial reel delivered before midnight.", icon: "⚡" },
];

const processSteps = [
  { n: "01", title: "Reserve your slot", desc: "Fill the form or message us on WhatsApp. We confirm within 24 hours.", icon: "📅" },
  { n: "02", title: "We arrive before dawn", desc: "Our team scouts your positions the night before. We're ready.", icon: "🌅" },
  { n: "03", title: "Same-day previews", desc: "Five curated preview images on WhatsApp before midnight.", icon: "⚡" },
  { n: "04", title: "Full gallery in 48hrs", desc: "Every edited image delivered to a private gallery. Yours forever.", icon: "🖼️" },
];

const testimonials = [
  { name: "Meena & Rajesh", pkg: "Bridal Package", quote: "They knew exactly when the lamps would reflect on the water. We didn't even have to direct — just exist, and they found the light.", stars: 5 },
  { name: "The Iyer Family", pkg: "Family & Group", quote: "All 11 of us, chaos and all, somehow made into the most beautiful portrait we've ever taken. The same-day preview had us in tears.", stars: 5 },
  { name: "Divya Krishnan", pkg: "Full Day + Drone", quote: "The aerial of the procession at dusk is framed in our living room. People think it's fine art. It is.", stars: 5 },
  { name: "Anand & Preethi", pkg: "Festival Portrait", quote: "We've been to Aambal Vasantham five years running. This was the first time we came home with photos worthy of the festival.", stars: 5 },
];

const studioServices = [
  { id: "portrait",   icon: "📸", title: "Portrait Sessions",   desc: "Studio-lit portraits with seamless backdrops.", color: "#a855f7" },
  { id: "bridal",     icon: "💍", title: "Bridal & Wedding",      desc: "Full-day bridal coverage, indoor & outdoor.", color: "#c084fc" },
  { id: "graduation", icon: "🎓", title: "Graduation & Events",  desc: "Milestone moments and corporate events.", color: "#7e22ce" },
  { id: "newborn",    icon: "👶", title: "Newborn & Kids",        desc: "Gentle, safe newborn posing in our warm studio.", color: "#e879f9" },
  { id: "reels",      icon: "🎬", title: "Reels & Short Films",  desc: "Social-media reels produced in-studio.", color: "#d946ef" },
  { id: "corporate",  icon: "🏢", title: "Corporate & Brand",    desc: "LinkedIn headshots and brand identity.", color: "#8b5cf6" },
];

type MediaItem = { id?: string; type: "image" | "video"; src: string; caption: string; };

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL WHITE BENTO WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function BentoWrapper({ children, eyebrow, title, id, noPadding = false, className = "" }: { children: ReactNode, eyebrow?: string, title?: ReactNode, id?: string, noPadding?: boolean, className?: string }) {
  return (
    <div id={id} className={`scroll-mt-24 relative z-10 w-full max-w-[1400px] mx-auto mb-6 bg-white/60 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] border border-white/80 shadow-[0_8px_40px_rgba(168,85,247,0.06)] overflow-hidden group ${className}`}>
      <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>
      <div className={`relative z-10 ${noPadding ? '' : 'p-6 md:p-8 lg:p-12'}`}>
        {(eyebrow || title) && (
          <div className="mb-8 md:mb-10 flex flex-col items-start">
            {eyebrow && (
              <span className="border border-black/5 bg-white/80 shadow-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-gray-500 mb-4">
                {eyebrow}
              </span>
            )}
            {title && <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-gray-900">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(100, current + (Math.random() * 10 + 5));
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => { setDone(true); onComplete?.(); }, 800);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  if (done) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }} animate={{ opacity: progress === 100 ? 0 : 1 }} transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf5ff]"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center z-10">
        <img src={logo} alt="Studio Hut" className="w-[240px] md:w-[280px] object-contain drop-shadow-sm invert" />
        <div className="w-[180px] h-[2px] bg-black/10 rounded-full overflow-hidden mt-8">
          <div style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} className="h-full bg-purple-500 rounded-full"></div>
        </div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 font-bold">Initializing Experience</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DUAL-VIEW DASHBOARD: Desktop Bento + Mobile Glassmorphic Gallery UI
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_HERO_DATA = {
  leftTitle: "STUDIO HUT",
  leftSubtitle: "Find Your Signature Memory",
  leftDescription: "Explore curated photography styles designed around timeless interior and festival lighting.",
  leftPreviewMedia: ambal2,

  styles: [
    {
      id: "festival-video",
      name: "Aambal Vasantham",
      subtitle: "Festival Film",
      media: [{ type: "video", url: ambal2 }],
    },
    {
      id: "cinematic",
      name: "Cinematic Depth",
      subtitle: "24 Packages",
      media: [{ type: "image", url: portrait }],
    },
    {
      id: "aerial",
      name: "Drone Aerials",
      subtitle: "18 Packages",
      media: [{ type: "image", url: aerial }],
    },
  ],
};

function BentoDashboardUI() {
  const [heroData, setHeroData] = useState<any>(DEFAULT_HERO_DATA);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const [mediaSlideIndex, setMediaSlideIndex] = useState(0);

  const [showDetailView, setShowDetailView] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "heroContent", "main"), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.styles && data.styles.length > 0) setHeroData(data);
      }
    });
    return () => unsub();
  }, []);

  const activeStyle = heroData.styles[activeStyleIndex] || heroData.styles[0];
  const activeMediaList = activeStyle?.media || [];
  const currentMedia = activeMediaList[mediaSlideIndex];

  useEffect(() => {
    if (activeMediaList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setMediaSlideIndex((prev) => (prev + 1) % activeMediaList.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [activeStyleIndex, activeMediaList.length, isPaused]);

  const handleNext = () => {
    if (mediaSlideIndex < activeMediaList.length - 1) {
      setMediaSlideIndex((prev) => prev + 1);
    } else {
      setActiveStyleIndex((prev) => (prev + 1) % heroData.styles.length);
      setMediaSlideIndex(0);
    }
  };

  const handlePrev = () => {
    if (mediaSlideIndex > 0) {
      setMediaSlideIndex((prev) => prev - 1);
    } else {
      const prevStyleIdx = (activeStyleIndex - 1 + heroData.styles.length) % heroData.styles.length;
      setActiveStyleIndex(prevStyleIdx);
      setMediaSlideIndex(Math.max(0, (heroData.styles[prevStyleIdx]?.media?.length || 1) - 1));
    }
  };

  const handleStyleChange = (index: number) => {
    setActiveStyleIndex(index);
    setMediaSlideIndex(0); 
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div className="hidden md:flex w-full min-h-screen lg:h-screen flex-col items-center justify-center pt-24 lg:pt-6 pb-6 px-4 md:px-6 relative z-10">
        <div className="max-w-[1400px] w-full h-auto lg:h-full lg:max-h-[900px] bg-white/50 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 border border-white/80 shadow-[0_12px_60px_rgba(168,85,247,0.08)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.3] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>

          <div className="w-full lg:w-[280px] h-auto lg:h-full flex flex-col gap-3 md:gap-4 relative z-10">
            <div className="bg-white/60 rounded-[28px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between flex-1 border border-white/80 shadow-sm">
              <h2 className="text-gray-900 font-display font-bold text-xl md:text-2xl tracking-wide uppercase">{heroData.leftTitle}</h2>
              <div className="rounded-[20px] md:rounded-[24px] overflow-hidden h-[150px] md:h-[180px] mt-4 relative group shadow-md">
                {String(heroData.leftPreviewMedia).includes(".mp4") ? (
                  <video src={heroData.leftPreviewMedia} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <img src={heroData.leftPreviewMedia || hero} alt="Studio Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
              </div>
            </div>
            <div className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 text-gray-900 shadow-sm border border-white/80 shrink-0">
              <h3 className="font-bold text-lg md:text-xl leading-tight">{heroData.leftSubtitle}</h3>
              <p className="text-xs text-gray-500 mt-2 md:mt-3 font-medium leading-relaxed">{heroData.leftDescription}</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[50vh] lg:min-h-0 lg:h-full bg-white/40 rounded-[28px] md:rounded-[32px] relative overflow-hidden flex flex-col shadow-sm border border-white/80 z-10">
            <AnimatePresence mode="wait">
              {currentMedia?.type === 'video' ? (
                <motion.video key={currentMedia.url} src={currentMedia.url} autoPlay muted loop playsInline initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <motion.img key={currentMedia?.url || 'fallback'} src={currentMedia?.url || portrait} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-gradient-to-t from-purple-50/95 via-purple-50/10 to-purple-50/70 pointer-events-none"></div>

            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap justify-between items-center z-20 gap-4">
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 border border-white/80 hover:bg-white transition shadow-sm shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="hidden lg:flex bg-white/50 backdrop-blur-md rounded-full p-1 border border-white/80 shadow-sm">
                  <a href="#homestay" onClick={(e) => handleScrollTo(e, 'homestay')} className="px-6 py-2.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white/80 text-xs font-bold transition-all cursor-pointer">Homestay</a>
                  <a href="#packages" onClick={(e) => handleScrollTo(e, 'packages')} className="px-6 py-2.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white/80 text-xs font-bold transition-all cursor-pointer">Festival Booking</a>
                  <a href="#gallery" onClick={(e) => handleScrollTo(e, 'gallery')} className="px-6 py-2.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white/80 text-xs font-bold transition-all cursor-pointer">Photography</a>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 md:bottom-24 left-6 md:left-12 z-20 pointer-events-none pr-6">
              <AnimatePresence mode="wait">
                <motion.h2 key={activeStyle?.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="text-gray-900 font-display text-4xl sm:text-5xl md:text-7xl lg:text-[80px] leading-[1.05] max-w-2xl drop-shadow-sm">
                  {activeStyle?.name?.split(' ').map((word: string, i: number) => <span key={i} className="block">{word}</span>)}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 flex flex-wrap justify-between items-end z-20 gap-3 md:gap-4">
              <div className="flex flex-col gap-2 md:gap-3">
                {activeMediaList.length > 1 && (
                  <div className="flex gap-1.5 ml-2">
                    {activeMediaList.map((_: any, i: number) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === mediaSlideIndex ? 'bg-purple-500 w-3' : 'bg-gray-400/50'}`} />)}
                  </div>
                )}
                <div className="flex items-center gap-2 md:gap-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-full pl-1.5 md:pl-2 pr-4 md:pr-5 py-1.5 md:py-2 shadow-sm">
                  <div className="flex -space-x-2">
                    {['M', 'A'].map((l: string, i: number) => <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-purple-400 to-fuchsia-400 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-sm">{l}</div>)}
                  </div>
                  <span className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-wider">Designed By Studio</span>
                </div>
              </div>
              <a href="#packages" className="bg-white/80 backdrop-blur-md border border-white/80 rounded-full px-4 md:px-6 py-2 md:py-3 text-gray-900 text-[10px] md:text-xs font-bold hover:bg-white transition shadow-sm">
                Book {activeStyle?.name?.split(' ')[0]}
              </a>
            </div>
          </div>

          <div className="w-full lg:w-[320px] h-auto lg:h-full bg-white/60 rounded-[28px] md:rounded-[32px] p-4 md:p-6 flex flex-col relative z-10 border border-white/80 shadow-sm">
            <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
              <h3 className="text-gray-900 font-bold text-sm">Photo Styles</h3>
              <span className="w-5 h-5 rounded-full border border-black/10 bg-white/50 flex items-center justify-center text-gray-500 text-[10px] font-bold">i</span>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide pr-2 max-h-[250px] lg:max-h-none">
              {heroData.styles.map((style: any, idx: number) => (
                <button key={style.id || idx} onClick={() => handleStyleChange(idx)} className={`flex items-center justify-between p-2 md:p-3 rounded-[20px] md:rounded-[24px] transition-all duration-300 ${activeStyleIndex === idx ? 'bg-white shadow-sm border border-white/80' : 'hover:bg-white/50 border border-transparent'}`}>
                  <div className="flex items-center gap-3 md:gap-4">
                    {style.media?.[0]?.type === 'video' ? (
                      <video src={style.media[0].url} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0 shadow-sm" muted />
                    ) : (
                      <img src={style.media?.[0]?.url || portrait} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0 shadow-sm" />
                    )}
                    <div className="text-left">
                      <p className={`text-xs md:text-sm font-bold ${activeStyleIndex === idx ? 'text-gray-900' : 'text-gray-600'}`}>{style.name}</p>
                      <p className={`text-[9px] md:text-[10px] mt-0.5 font-bold ${activeStyleIndex === idx ? 'text-purple-500' : 'text-gray-400'}`}>{style.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${activeStyleIndex === idx ? 'text-gray-900' : 'text-gray-300'}`}>›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SWIPE UI CAN GO HERE */}
    </>
  );
}

function HubDashboard() {
  // Changed default active tab to "festival" since "studio" is removed
  const [activeTab, setActiveTab] = useState("festival");

  const HUB_DATA: Record<string, any> = {
    festival: {
      id: "festival",
      label: "FESTIVAL",
      icon: "🛕",
      title: "Aambal Vasantham",
      desc: "We are the official visual storytellers of the festival. From drone aerials to intimate crowd portraits, we capture the divine chaos and the quiet moments in between.",
      image: hero,
      linkProps: { to: "/packages" },
      btnText: "VIEW PACKAGES",
      btnColor: "bg-[#f5a623]", // Orange/Gold
      widgets: [
        { title: "COVERAGE", value: "Full Day", icon: "🚁" },
        { title: "TEAM", value: "4 Shooters", icon: "👥" },
        { title: "SPECIALTY", value: "Night Aarti", icon: "🕯️" }
      ]
    },
    homestay: {
      id: "homestay",
      label: "HOMESTAY",
      icon: "🏡",
      title: "Premium Accommodation",
      desc: "Stay right in the heart of the action. Our premium homestay offers air-conditioned comfort, traditional Kerala architecture, and immediate access to the temple grounds.",
      image: aerial,
      linkProps: { to: "/enquiry", search: { service: "custom" } },
      btnText: "EXPLORE ROOMS",
      btnColor: "bg-[#10b981]", // Emerald Green
      widgets: [
        { title: "ROOMS", value: "3 Suites", icon: "🛏️" },
        { title: "DISTANCE", value: "200m", icon: "🚶" },
        { title: "AMENITIES", value: "Free Wi-Fi", icon: "📶" }
      ]
    }
  };

  const active = HUB_DATA[activeTab];

  return (
    <BentoWrapper id="hub" eyebrow="Explore" title={<>Discover our <span className="italic text-purple-500">spaces.</span></>}>
      
      {/* ── Main Outer Dark Container ── */}
      <div className="w-full bg-[#1c1c1e] rounded-[32px] md:rounded-[40px] p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 shadow-2xl overflow-hidden mt-6 h-auto lg:h-[480px]">
        
        {/* ── LEFT SIDEBAR (Tabs) ── */}
        <div className="w-full lg:w-[110px] bg-[#141415] rounded-[24px] md:rounded-[32px] p-2 md:p-3 flex flex-row lg:flex-col gap-2 md:gap-4 overflow-x-auto scrollbar-hide items-center justify-start lg:py-6 shadow-inner shrink-0 snap-x">
          <div className="hidden lg:flex w-12 h-12 bg-white/10 rounded-full items-center justify-center text-white mb-2 shrink-0">
             <span className="text-lg font-bold">S</span>
          </div>
          
          {Object.values(HUB_DATA).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-center flex flex-col items-center justify-center min-w-[76px] h-[76px] lg:w-[84px] lg:h-[84px] rounded-[20px] lg:rounded-[24px] transition-all duration-300 shrink-0 ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-md lg:scale-105"
                  : "bg-transparent text-gray-400 hover:bg-white/10"
              }`}
            >
              <span className="text-xl md:text-2xl mb-1">{tab.icon}</span>
              <span className={`text-[8px] md:text-[9px] font-bold tracking-wider uppercase ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── CENTER AREA (Text & Widgets) ── */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div 
              key={active.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }} 
              className="flex-1 flex flex-col h-full gap-3 md:gap-4"
            >
              {/* Main Info Card */}
              <div className="bg-[#262629] rounded-[24px] md:rounded-[32px] p-6 md:p-8 lg:p-10 flex-1 flex flex-col justify-center relative overflow-hidden">
                <span className="bg-white/10 text-white w-max px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/5">
                  {active.label} SECTION
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-4 leading-tight font-medium">
                  {active.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg font-medium">
                  {active.desc}
                </p>
              </div>

              {/* Bottom Light-Blue Widgets */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 shrink-0 h-[100px]">
                {active.widgets.map((widget: any, i: number) => (
                  <div key={i} className="bg-[#d2dce3] rounded-[20px] md:rounded-[24px] p-3 md:p-4 flex flex-col justify-center items-center text-center shadow-inner hover:scale-[1.02] transition-transform">
                    <span className="text-xl md:text-2xl mb-1">{widget.icon}</span>
                    <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">{widget.title}</p>
                    <p className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{widget.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── RIGHT AREA (Image & Action Button) ── */}
        <div className="w-full lg:w-[320px] flex flex-col gap-3 md:gap-4 shrink-0 h-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={active.id + '-img'} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ duration: 0.4 }} 
              className="h-[250px] lg:flex-1 bg-[#262629] rounded-[24px] md:rounded-[32px] relative overflow-hidden group"
            >
              <img src={active.image} alt={active.title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent"></div>

              {/* Inner Image Label Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#1c1c1e]/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-white text-[11px] font-bold">{active.title}</p>
                  <p className="text-gray-400 text-[8px] uppercase tracking-widest mt-0.5">Explore {active.label}</p>
                </div>
                <div className={`w-8 h-8 rounded-full ${active.btnColor} flex items-center justify-center text-white shadow-md`}>
                  <span className="text-[10px] ml-0.5">▶</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dynamic Link Button */}
          <Link 
            {...active.linkProps} 
            className={`h-[60px] md:h-[70px] ${active.btnColor} rounded-[20px] md:rounded-[28px] flex items-center justify-center text-white font-bold text-xs md:text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg`}
          >
            {active.btnText}
          </Link>
        </div>

      </div>
    </BentoWrapper>
  );
}

function BentoGalleryBanner() {
  const galleryImages = [ portrait, hero, aerial, portrait, hero, aerial, portrait, hero, aerial, portrait, hero, aerial ];
  return (
    <BentoWrapper id="gallery-banner" noPadding>
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {galleryImages.map((img: string, i: number) => (
            <div key={i} className="relative aspect-[4/3] rounded-[20px] md:rounded-[24px] overflow-hidden group bg-gray-200 shadow-inner">
              <img src={img} alt="Gallery Portfolio Item" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </BentoWrapper>
  );
}

function StudioServicesBento() {
  return (
    <BentoWrapper id="studio-services" eyebrow="What We Shoot" title={<>Studio built for <span className="italic text-purple-500">every moment.</span></>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        {studioServices.map((service) => (
          <Link key={service.id} to="/enquiry" search={{ service: service.id }} className="block">
            <div className="bg-white/50 border border-white/80 rounded-[24px] md:rounded-[32px] p-6 md:p-8 hover:bg-white/80 transition-colors group cursor-pointer shadow-sm relative overflow-hidden h-full">
              <div className="absolute top-6 md:top-8 left-6 md:left-8 h-[3px] w-8 md:w-10 rounded-full" style={{ background: service.color }} />
              <div className="mt-6 md:mt-8 mb-3 md:mb-4 text-3xl md:text-4xl group-hover:scale-110 transition-transform origin-left">{service.icon}</div>
              <h3 className="mb-2 font-display text-xl md:text-2xl text-gray-900">{service.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">{service.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </BentoWrapper>
  );
}

// Notice we pass in the packages prop here 👇
function PackagesBento({ packages }: { packages: any[] }) {
  const isEditor = window.self !== window.top;

  // Don't render if there are no packages yet
  if (!packages || packages.length === 0) return null;

  return (
    <BentoWrapper id="packages" eyebrow="Services & Pricing" title={<>Festival <span className="italic text-purple-500">Packages.</span></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 md:mt-8">
        
        {/* 👇 FIX: map over 'packages' and explicitly type 'p' as 'any' */}
        {packages.map((p: any) => (
          
          <div 
            key={p.id} 
            onClick={() => isEditor && window.parent.postMessage({ type: "EDIT_PACKAGE", id: p.id }, "*")}
            className={`bg-white/50 rounded-[24px] md:rounded-[32px] border border-white/80 p-5 md:p-6 flex flex-col gap-4 md:gap-5 hover:-translate-y-1 transition-transform shadow-sm relative overflow-hidden h-full ${isEditor ? 'cursor-pointer hover:outline outline-4 outline-emerald-500' : ''}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-purple-200 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex-1 relative z-10 flex flex-col">
              <h3 className="font-display text-lg md:text-xl text-gray-900 mb-1 font-bold">{p.name}</h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 tracking-widest uppercase mb-3 font-bold">{p.duration}</p>
              
              {p.image && (
                <div className="w-full h-32 md:h-40 rounded-[20px] overflow-hidden mb-4 shadow-inner">
                  <img src={p.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <p className="text-xs md:text-sm text-gray-600 font-medium line-clamp-2">{p.description}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-black/5 relative z-10 mt-auto">
              <span className="font-display text-lg md:text-xl font-bold text-purple-600">{p.price}</span>
              <Link to="/booking-confirmed" search={{ plan: p.id }} className="text-[10px] font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-gray-900 text-white hover:bg-purple-600 transition-colors z-20 shadow-md uppercase tracking-wider">
                Book Now
              </Link>
            </div>
          </div>
        ))}

      </div>
      <div className="mt-8 md:mt-10 flex justify-center relative z-20">
        <Link to="/packages" className="rounded-full border border-purple-200 bg-white/60 backdrop-blur-md px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 shadow-sm transition-all duration-200">
          Compare all packages →
        </Link>
      </div>
    </BentoWrapper>
  );
}

function DroneBento() {
  return (
    <BentoWrapper id="drone" noPadding>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[300px] md:min-h-[400px] overflow-hidden rounded-t-[32px] md:rounded-t-[40px] lg:rounded-l-[40px] lg:rounded-tr-none">
          <img src={aerial} alt="Drone" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 to-transparent"></div>
          <div className="relative z-10 p-6 md:p-8 lg:p-12 flex flex-col justify-center h-full">
            <span className="border border-black/10 bg-white/60 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest text-purple-600 mb-4 md:mb-6 w-fit shadow-sm">DRONE SHOTS</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-3 md:mb-4">See the festival <br className="hidden md:block"/><span className="italic text-purple-500">from above.</span></h2>
            <p className="text-gray-600 text-xs md:text-sm max-w-sm font-medium">A drone changes everything. The lamp-pattern around the temple, the procession winding through the streets.</p>
          </div>
        </div>
        <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center gap-3 md:gap-4 bg-white/40 border-t lg:border-t-0 lg:border-l border-white/60">
          {droneFeatures.map(f => (
            <div key={f.title} className="bg-white/60 border border-white/80 rounded-[20px] md:rounded-[24px] p-4 md:p-5 flex items-start gap-3 md:gap-4 shadow-sm">
              <div className="text-xl md:text-2xl mt-1">{f.icon}</div>
              <div>
                <h4 className="text-gray-900 text-sm md:text-base font-bold mb-1">{f.title}</h4>
                <p className="text-xs md:text-sm text-gray-500 font-medium">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BentoWrapper>
  );
}

function ProcessBento() {
  return (
    <BentoWrapper id="process" eyebrow="Simple & Certain" title={<>How it <span className="italic text-purple-500">works.</span></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 md:mt-8">
        {processSteps.map((step) => (
          <div key={step.n} className="bg-white/50 border border-white/80 rounded-[24px] md:rounded-[32px] p-6 md:p-8 relative flex flex-col items-center text-center shadow-sm group hover:bg-white transition-colors">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl md:text-2xl mb-4 md:mb-6 shadow-md relative">
              {step.icon}
              <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-full">{step.n}</span>
            </div>
            <h3 className="font-display text-base md:text-lg text-gray-900 font-bold mb-2">{step.title}</h3>
            <p className="text-xs md:text-sm text-gray-500 font-medium">{step.desc}</p>
          </div>
        ))}
      </div>
    </BentoWrapper>
  );
}

// ── NEW: PREMIUM ENQUIRY CTA SECTION ──
function PremiumEnquiryCTA() {
  return (
    <div className="relative w-full max-w-[1400px] mx-auto mb-6 rounded-[32px] md:rounded-[40px] overflow-hidden group p-1 z-20">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 opacity-50 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
      
      <div className="relative bg-[#0a0a0c] rounded-[30px] md:rounded-[38px] p-8 md:p-16 lg:p-20 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Background noise/texture */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>
        
        {/* Lighting accents */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/30 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] uppercase tracking-widest font-bold mb-6">
            Exclusive Commissions
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-white leading-tight mb-4">
            Have a unique <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">vision?</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto md:mx-0 font-medium">
            Beyond festivals and standard packages, we take on select private commissions, commercial shoots, and destination weddings. Let's discuss your masterpiece.
          </p>
        </div>

        <div className="relative z-10 shrink-0 mt-4 md:mt-0">
          <Link to="/enquiry" search={{ service: "" }} className="relative inline-flex h-16 md:h-20 items-center justify-center rounded-full bg-white px-8 md:px-12 font-bold text-gray-900 transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
            <span className="text-sm md:text-base uppercase tracking-widest">Start a Conversation</span>
            <svg className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── NEW: PREMIUM HOMESTAY SECTION ──
// ── PREMIUM HOMESTAY SECTION (WHITE THEME) ──
function PremiumHomestaySection() {
  return (
    <div id="homestay" className="relative w-full max-w-[1400px] mx-auto mb-6 rounded-[32px] md:rounded-[40px] overflow-hidden group z-20 bg-white border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      
      {/* Background Image with Light Overlay */}
      <div className="absolute inset-0">
         <img src={aerial} alt="Homestay View" className="w-full h-full object-cover opacity-[0.12] mix-blend-multiply group-hover:scale-105 transition-transform duration-1000" />
         {/* White gradients to blend the image smoothly */}
         <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12">
         {/* Text Content */}
         <div className="flex-1 text-center md:text-left">
            <span className="inline-block py-1.5 px-4 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-[10px] uppercase tracking-widest font-bold mb-6 shadow-sm">
              VIP Accommodation
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4">
              Stay at the <br className="hidden md:block"/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 drop-shadow-sm">Heart of the Festival.</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">
              Immerse yourself completely. Our premium homestay offers air-conditioned comfort, traditional Kerala architecture, and immediate access to the Aambal Vasantham temple grounds—just 200 meters away.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto md:mx-0">
               {[
                 { icon: "❄️", text: "Air Conditioned" },
                 { icon: "🚶", text: "200m to Temple" },
                 { icon: "📶", text: "High-Speed Wi-Fi" },
                 { icon: "☕", text: "Morning Breakfast" }
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-3 bg-white/60 border border-gray-200 rounded-2xl p-3 backdrop-blur-md shadow-sm hover:-translate-y-0.5 transition-transform cursor-default">
                   <span className="text-lg bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center border border-gray-100">{f.icon}</span>
                   <span className="text-xs font-bold text-gray-800">{f.text}</span>
                 </div>
               ))}
            </div>

            <a href="#enquiry" className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-8 font-bold text-white transition-transform hover:scale-105 shadow-[0_10px_30px_rgba(249,115,22,0.25)]">
              Reserve a Suite
            </a>
         </div>

         {/* Right Image/Cards */}
         <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 relative">
            <div className="aspect-[4/5] rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative z-10 group/img">
               <img src={hero} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
               
               {/* Note: The bottom gradient stays dark here so the white price text is readable over the photo */}
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex items-end p-6 md:p-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-full flex justify-between items-center">
                     <div>
                       <div className="text-white text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Per night / Suite</div>
                       <div className="text-orange-400 font-bold text-2xl drop-shadow-md">₹3,499</div>
                     </div>
                     <div className="text-gray-300 text-sm font-bold line-through opacity-60">
                       ₹5,000
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Soft decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-400/15 rounded-full blur-[80px] -z-10"></div>
         </div>
      </div>
    </div>
  );
}

function TestimonialsBento() {
  const [active, setActive] = useState(0);
  return (
    <BentoWrapper id="testimonials" eyebrow="Guest Voices" title={<>What they <span className="italic text-purple-500">said after.</span></>}>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 md:gap-8 mt-6 md:mt-8">
        <div className="flex flex-col gap-2 md:gap-3">
          {testimonials.map((t, i) => (
            <button key={i} onClick={() => setActive(i)} className={`text-left rounded-[20px] md:rounded-[24px] border px-5 py-4 md:px-6 md:py-5 transition-all ${i===active ? "border-purple-300 bg-purple-50 shadow-sm" : "border-transparent bg-white/60 hover:bg-white"}`}>
              <p className={`font-bold text-xs md:text-sm ${i===active ? "text-purple-700" : "text-gray-600"}`}>{t.name}</p>
              <p className={`text-[9px] md:text-[10px] ${i===active ? "text-purple-500" : "text-gray-400"} tracking-wider mt-1 uppercase font-bold`}>{t.pkg}</p>
            </button>
          ))}
        </div>
        <div className="bg-white/60 rounded-[24px] md:rounded-[32px] border border-white/80 p-6 md:p-8 lg:p-12 relative shadow-sm overflow-hidden flex flex-col justify-center">
          <div className="font-display text-[80px] md:text-[160px] leading-none text-purple-200/40 absolute top-2 left-4 md:top-4 md:left-6 select-none pointer-events-none">"</div>
          <div className="relative z-10">
            <div className="mb-4 md:mb-6 tracking-[2px] md:tracking-[4px] text-purple-400 text-lg md:text-xl">{"★".repeat(testimonials[active].stars)}</div>
            <p className="font-display text-xl md:text-2xl lg:text-4xl leading-snug text-gray-900 mb-6 md:mb-8 italic">"{testimonials[active].quote}"</p>
            <div className="flex items-center gap-3 md:gap-4 border-t border-purple-100 pt-4 md:pt-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-purple-200 bg-white flex items-center justify-center font-display text-purple-600 text-lg md:text-xl shadow-sm">{testimonials[active].name[0]}</div>
              <div>
                <p className="font-bold text-sm md:text-base text-gray-900">{testimonials[active].name}</p>
                <p className="text-[9px] md:text-xs text-purple-500 tracking-widest uppercase mt-0.5 font-bold">{testimonials[active].pkg}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BentoWrapper>
  );
}

function ShutterReel() {
  return (
    <div className="relative py-16 md:py-20 bg-transparent overflow-hidden">
      <div className="flex items-center gap-0 mb-6 md:mb-8 overflow-hidden opacity-20">
        {[...Array(30)].map((_: any, i: number) => <div key={i} className="flex-shrink-0 w-6 h-10 md:w-8 md:h-12 border border-black/10 mx-0.5 rounded-sm flex flex-col justify-between py-1 px-0.5"><div className="w-1 h-1 rounded-full bg-black/20 mx-auto" /><div className="w-1 h-1 rounded-full bg-black/20 mx-auto" /></div>)}
      </div>
      <div className="relative mx-auto max-w-4xl px-4 md:px-6 text-center">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.9 }}>
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-purple-400" />
            <span className="text-gray-500 text-[9px] md:text-xs uppercase tracking-widest font-bold">Studio Hut Photography</span>
            <div className="h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-purple-400" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.1] text-gray-900 mb-4 md:mb-6 italic">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[#ff6b6b]">Light is the language.</span>
            <br /><span className="text-gray-400">We're fluent.</span>
          </h2>
          <p className="text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-400 font-bold">— Studio Hut Photography, Kottayam</p>
          <motion.div initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4 }} className="mt-8 md:mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
            <a href="tel:+919999999999" className="rounded-full border border-gray-200 bg-white/60 px-4 py-2 md:px-6 md:py-2.5 text-[10px] md:text-xs font-bold text-gray-700 hover:text-purple-500 hover:border-purple-400 shadow-sm transition">📞 Call Studio</a>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="rounded-full border border-green-500/30 bg-green-50 px-4 py-2 md:px-6 md:py-2.5 text-[10px] md:text-xs font-bold text-green-600 hover:bg-green-100 shadow-sm transition">💬 WhatsApp Us</a>
            <a href="https://instagram.com/studiohutphotography" target="_blank" rel="noreferrer" className="rounded-full border border-pink-500/30 bg-pink-50 px-4 py-2 md:px-6 md:py-2.5 text-[10px] md:text-xs font-bold text-pink-600 hover:bg-pink-100 shadow-sm transition">📷 @studiohut</a>
          </motion.div>
        </motion.div>
      </div>
      <div className="flex items-center gap-0 mt-6 md:mt-8 overflow-hidden opacity-20">
        {[...Array(30)].map((_: any, i: number) => <div key={i} className="flex-shrink-0 w-6 h-10 md:w-8 md:h-12 border border-black/10 mx-0.5 rounded-sm flex flex-col justify-between py-1 px-0.5"><div className="w-1 h-1 rounded-full bg-black/20 mx-auto" /><div className="w-1 h-1 rounded-full bg-black/20 mx-auto" /></div>)}
      </div>
    </div>
  );
}

function StudioToFestivalBridge() {
  return (
    <div className="relative py-16 md:py-20 overflow-hidden bg-transparent">
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="relative mx-auto max-w-3xl px-4 md:px-6 text-center">
        <div className="flex items-center gap-3 md:gap-4 justify-center mb-4 md:mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200" />
          <div className="text-lg md:text-xl text-purple-500">✦</div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200" />
        </div>
        <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.35em] mb-2 font-bold">Also specialists in</p>
        <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-gray-900 italic">Festival <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[#ff6b6b]">Photography</span></h3>
        <p className="mt-3 md:mt-4 text-gray-600 text-xs md:text-sm max-w-sm mx-auto font-medium">Studio Hut is the official photography studio for the Aambal Vasantham festival.</p>
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }} className="mt-6 md:mt-8 text-purple-500 text-lg md:text-xl">↓</motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────
function Home() {
  const [appReady, setAppReady] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "media_gallery"), orderBy("createdAt", "desc"), limit(6));
    const unsub = onSnapshot(q, (snap) => {
      setMediaItems(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    });
    return () => unsub();
  }, []);

  return (
    <div id="top" className="relative min-h-screen bg-[#faf5ff]" style={{ overflowX: "clip" }}>
      
      {/* ── UNIVERSAL FIXED BACKGROUND (Purple Theme) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={hero} alt="Background" className="w-full h-full object-cover scale-105 opacity-20 filter brightness-110 saturate-150 mix-blend-overlay" />
        <div className="absolute inset-0 bg-purple-50/60 backdrop-blur-[80px]"></div>
      </div>

      <LoadingScreen onComplete={() => setAppReady(true)} />
      <Toaster theme="light" position="top-center" richColors />
      
      <FlyingDrone />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.a href="/customer-login" whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 md:gap-3 rounded-full border border-purple-200 bg-white/90 px-4 py-3 md:px-5 md:py-3.5 text-gray-900 shadow-[0_8px_30px_rgba(168,85,247,0.15)] backdrop-blur-3xl hover:bg-white transition-colors">
          <div className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-purple-500 text-white text-sm md:text-lg font-bold shadow-sm">👤</div>
          <div className="hidden sm:block">
            <div className="text-xs md:text-sm font-bold leading-tight text-gray-900">Customer Portal</div>
            <div className="text-[9px] md:text-[10px] text-gray-500 font-medium">View bookings</div>
          </div>
        </motion.a>
      </div>

      {/* ── SECTIONS IN BENTO/GLASS STYLE ── */}
      <div className="relative z-10 space-y-4 md:space-y-6 pb-24">
        
        {/* Full Screen Hero Dashboard (Dual View for Desktop/Mobile) */}
        <BentoDashboardUI />
        
        <div className="px-4 md:px-8 space-y-4 md:space-y-6 mt-4 md:mt-6 hidden md:block">
          <BentoGalleryBanner />
        </div>
        
        {/* ── RESUME LIGHT BENTO LAYOUT ── */}
        <div className="px-4 md:px-8 space-y-4 md:space-y-6 mt-4 md:mt-6">
          <HubDashboard />
        
          
          <ProcessBento />

          {/* NEW PREMIUM CTA SECTION */}
          <PremiumEnquiryCTA />

          <BentoWrapper id="shutter-reel" noPadding>
             <ShutterReel />
          </BentoWrapper>
          
       
          
          <TestimonialsBento />

          {/* DYNAMIC GALLERY */}
          {mediaItems.length > 0 && (
            <BentoWrapper id="dynamic-gallery" eyebrow="Latest Work" title={<>From the <span className="italic text-purple-500">field.</span></>}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {mediaItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity:0, scale:0.96 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
                    className="group relative overflow-hidden rounded-[20px] md:rounded-[24px] border border-white/80 bg-white/50 shadow-sm" style={{ aspectRatio:i===0?"16/9":"4/3" }}>
                    {item.type==="image" ? <img src={item.src} alt={item.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/> : <video src={item.src} autoPlay muted loop playsInline className="h-full w-full object-cover"/>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 md:p-5">
                      <p className="text-[10px] md:text-xs font-bold text-white shadow-sm">{item.caption}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </BentoWrapper>
          )}

          {/* NEW PREMIUM HOMESTAY SECTION */}
          <PremiumHomestaySection />

          {/* GALLERY / PHOTOGRAPHY TARGET SECTION */}
       

          <BentoWrapper id="instagram" noPadding className="py-8 md:py-12">
             <InstagramFeed />
          </BentoWrapper>

          {/* Footer Bento Pill */}
          <div className="w-full max-w-[1400px] mx-auto mt-8 md:mt-12 bg-white/60 backdrop-blur-3xl rounded-[24px] md:rounded-[32px] border border-white/80 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>
            
            <div className="flex items-center gap-3 md:gap-4 relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold font-display text-lg md:text-xl shadow-md">S</div>
              <div>
                <h4 className="text-gray-900 text-sm md:text-base font-bold tracking-wide">Studio Hut Photography</h4>
                <p className="text-gray-500 text-[10px] md:text-xs mt-1 font-medium">Kottayam · Kerala · India</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <a href="#packages" className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Packages</a>
              <a href="#drone" className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Drone Aerials</a>
              <a href="#process" className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
import { HomestaySection } from "@/components/HomestaySection";
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

const packageTeasers = [
  { id: "portrait", name: "Festival Portrait", price: "₹4,999", duration: "1 hr", icon: "📸", color: "#a855f7", desc: "Solo & couple portraits" },
  { id: "family", name: "Family & Group", price: "₹8,999", duration: "2 hrs", icon: "👨‍👩‍👧‍👦", color: "#c084fc", desc: "Up to 12 members", hot: true },
  { id: "bridal", name: "Bridal / Couple", price: "₹14,999", duration: "Half day", icon: "🎬", color: "#d8b4fe", desc: "Cinematic reel included" },
  { id: "fullday", name: "Full Day", price: "₹24,999", duration: "Sunrise→Night", icon: "🚁", color: "#7e22ce", desc: "Drone aerials + film" },
];

const testimonials = [
  { name: "Meena & Rajesh", pkg: "Bridal Package", quote: "They knew exactly when the lamps would reflect on the water. We didn't even have to direct — just exist, and they found the light.", stars: 5 },
  { name: "The Iyer Family", pkg: "Family & Group", quote: "All 11 of us, chaos and all, somehow made into the most beautiful portrait we've ever taken. The same-day preview had us in tears.", stars: 5 },
  { name: "Divya Krishnan", pkg: "Full Day + Drone", quote: "The aerial of the procession at dusk is framed in our living room. People think it's fine art. It is.", stars: 5 },
  { name: "Anand & Preethi", pkg: "Festival Portrait", quote: "We've been to Aambal Vasantham five years running. This was the first time we came home with photos worthy of the festival.", stars: 5 },
];

const processSteps = [
  { n: "01", title: "Reserve your slot", desc: "Fill the form or message us on WhatsApp. We confirm within 24 hours.", icon: "📅" },
  { n: "02", title: "We arrive before dawn", desc: "Our team scouts your positions the night before. We're ready.", icon: "🌅" },
  { n: "03", title: "Same-day previews", desc: "Five curated preview images on WhatsApp before midnight.", icon: "⚡" },
  { n: "04", title: "Full gallery in 48hrs", desc: "Every edited image delivered to a private gallery. Yours forever.", icon: "🖼️" },
];

const studioServices = [
  { id: "portrait",   icon: "📸", title: "Portrait Sessions",   desc: "Studio-lit portraits with seamless backdrops.", color: "#a855f7" },
  { id: "bridal",     icon: "💍", title: "Bridal & Wedding",      desc: "Full-day bridal coverage, indoor & outdoor.", color: "#c084fc" },
  { id: "graduation", icon: "🎓", title: "Graduation & Events",  desc: "Milestone moments and corporate events.", color: "#7e22ce" },
  { id: "newborn",    icon: "👶", title: "Newborn & Kids",        desc: "Gentle, safe newborn posing in our warm studio.", color: "#e879f9" },
  { id: "reels",      icon: "🎬", title: "Reels & Short Films",  desc: "Social-media reels produced in-studio.", color: "#d946ef" },
  { id: "corporate",  icon: "🏢", title: "Corporate & Brand",    desc: "LinkedIn headshots and brand identity.", color: "#8b5cf6" },
];

const FESTIVAL_FRAMES = [
  {
    id: "lotus", name: "Purple Aesthetic", color: "#a855f7", 
    svgFrame: (
      <svg viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <rect x="8" y="8" width="384" height="384" rx="4" fill="none" stroke="#a855f7" strokeWidth="3"/>
        <rect x="16" y="16" width="368" height="368" rx="2" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="6 4"/>
        <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#a855f7" fontFamily="Georgia,serif" letterSpacing="4" opacity="0.9">AAMBAL VASANTHAM</text>
      </svg>
    ),
  },
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
      media: [
        {
          type: "video",
          url: ambal2,
        },
      ],
    },

    {
      id: "cinematic",
      name: "Cinematic Depth",
      subtitle: "24 Packages",
      media: [
        {
          type: "image",
          url: portrait,
        },
      ],
    },

    {
      id: "aerial",
      name: "Drone Aerials",
      subtitle: "18 Packages",
      media: [
        {
          type: "image",
          url: aerial,
        },
      ],
    },
  ],
};

function BentoDashboardUI() {
  // Shared States (Controls both Desktop and Mobile CMS traversal)
  const [heroData, setHeroData] = useState<any>(DEFAULT_HERO_DATA);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const [mediaSlideIndex, setMediaSlideIndex] = useState(0);

  // Mobile States
  const [showDetailView, setShowDetailView] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isPaused, setIsPaused] = useState(false);

  // Fetch Hero CMS Data Live from Firestore
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

  // Auto-Play Timer Logic (Desktop & Mobile)
  useEffect(() => {
    if (activeMediaList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setMediaSlideIndex((prev) => (prev + 1) % activeMediaList.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [activeStyleIndex, activeMediaList.length, isPaused]);

  // Swipe Navigation Logic (Cycles Media -> then Styles)
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
      {/* ── DESKTOP BENTO VIEW ── */}
      <div className="hidden md:flex w-full min-h-screen lg:h-screen flex-col items-center justify-center pt-24 lg:pt-6 pb-6 px-4 md:px-6 relative z-10">
        <div className="max-w-[1400px] w-full h-auto lg:h-full lg:max-h-[900px] bg-white/50 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 border border-white/80 shadow-[0_12px_60px_rgba(168,85,247,0.08)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.3] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>

          {/* Left Column (Stats/Text) */}
          <div className="w-full lg:w-[280px] h-auto lg:h-full flex flex-col gap-3 md:gap-4 relative z-10">
            <div className="bg-white/60 rounded-[28px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-between flex-1 border border-white/80 shadow-sm">
              <h2 className="text-gray-900 font-display font-bold text-xl md:text-2xl tracking-wide uppercase">{heroData.leftTitle}</h2>
              <div className="rounded-[20px] md:rounded-[24px] overflow-hidden h-[150px] md:h-[180px] mt-4 relative group shadow-md">
                {String(heroData.leftPreviewMedia).includes(".mp4") ? (
  <video
    src={heroData.leftPreviewMedia}
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
  />
) : (
  <img
    src={heroData.leftPreviewMedia || hero}
    alt="Studio Preview"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
  />
)}
              </div>
            </div>
            <div className="bg-white rounded-[28px] md:rounded-[32px] p-6 md:p-8 text-gray-900 shadow-sm border border-white/80 shrink-0">
              <h3 className="font-bold text-lg md:text-xl leading-tight">{heroData.leftSubtitle}</h3>
              <p className="text-xs text-gray-500 mt-2 md:mt-3 font-medium leading-relaxed">{heroData.leftDescription}</p>
            </div>
          </div>

          {/* Middle Column (Main Slideshow) */}
          <div className="flex-1 w-full min-h-[50vh] lg:min-h-0 lg:h-full bg-white/40 rounded-[28px] md:rounded-[32px] relative overflow-hidden flex flex-col shadow-sm border border-white/80 z-10">
            <AnimatePresence mode="wait">
              {currentMedia?.type === 'video' ? (
                <motion.video 
                  key={currentMedia.url} src={currentMedia.url} autoPlay muted loop playsInline
                  initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <motion.img 
                  key={currentMedia?.url || 'fallback'} src={currentMedia?.url || portrait}
                  initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }} className="absolute inset-0 w-full h-full object-cover"
                />
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
                <motion.h2 
                  key={activeStyle?.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                  className="text-gray-900 font-display text-4xl sm:text-5xl md:text-7xl lg:text-[80px] leading-[1.05] max-w-2xl drop-shadow-sm"
                >
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

          {/* Right Column (Style Picker) */}
          <div className="w-full lg:w-[320px] h-auto lg:h-full bg-white/60 rounded-[28px] md:rounded-[32px] p-4 md:p-6 flex flex-col relative z-10 border border-white/80 shadow-sm">
            <div className="flex justify-between items-center mb-4 md:mb-6 shrink-0">
              <h3 className="text-gray-900 font-bold text-sm">Photo Styles</h3>
              <span className="w-5 h-5 rounded-full border border-black/10 bg-white/50 flex items-center justify-center text-gray-500 text-[10px] font-bold">i</span>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide pr-2 max-h-[250px] lg:max-h-none">
              {heroData.styles.map((style: any, idx: number) => (
                <button 
                  key={style.id || idx} onClick={() => handleStyleChange(idx)}
                  className={`flex items-center justify-between p-2 md:p-3 rounded-[20px] md:rounded-[24px] transition-all duration-300 ${activeStyleIndex === idx ? 'bg-white shadow-sm border border-white/80' : 'hover:bg-white/50 border border-transparent'}`}
                >
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

      {/* ── MOBILE VIEW (Dark Earthy Glassmorphism Stories) ── */}
      <div className="flex md:hidden w-full h-[100dvh] bg-[#1a1814] relative flex-col overflow-hidden text-[#f4f3f0] font-sans z-50">
        
        {/* Soft Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8a9a3b]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c4a163]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* ── SCREEN 1: SWIPE CARDS (Navigates CMS Data directly) ── */}
        <AnimatePresence mode="wait">
          {!showDetailView && activeStyle && (
            <motion.div 
              key="swipe-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Instagram-style Top Progress Bar */}
              <div className="absolute top-4 left-6 right-6 flex gap-1.5 z-50">
                {activeMediaList.map((_: any, i: number) => (
                  <div key={i} className={`h-1 flex-1 rounded-full overflow-hidden bg-white/20`}>
                    <div className={`h-full bg-white transition-all duration-300 ${i <= mediaSlideIndex ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
              </div>

              {/* Top Nav */}
              <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-50">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                  <img src={logo} className="w-full h-full object-cover invert" />
                </div>
                <div className="flex gap-3">
                  <button className="relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1a1814] text-[8px] font-bold flex items-center justify-center text-white">8</span>
                  </button>
                  <button onClick={() => handleScrollTo({preventDefault:()=>{}} as any, 'packages')} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </button>
                </div>
              </div>

              {/* Main Image Card */}
              <div className="absolute top-[90px] left-5 right-5 bottom-[110px] z-10">
                <motion.div 
                  key={`${activeStyleIndex}-${mediaSlideIndex}`} // Force re-render for crisp swipe animations
                  initial={{ x: 100, opacity: 0, rotate: 5 }} animate={{ x: 0, opacity: 1, rotate: 0 }}
                  drag="x" dragConstraints={{ left: 0, right: 0 }} 
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(e, { offset }) => { 
                    setIsPaused(false);
                    if (offset.x < -80) handleNext();
                    if (offset.x > 80) handlePrev();
                  }}
                  className="w-full h-full rounded-[40px] overflow-hidden relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer"
                  onClick={() => setShowDetailView(true)}
                >
                  {currentMedia?.type === 'video' ? (
                    <video src={currentMedia.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <img src={currentMedia?.url || portrait} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  
                  {/* Card Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Text Details (Pulled from CMS Style) */}
                  <div className="absolute bottom-8 left-6 right-20">
                    <h2 className="text-3xl font-semibold tracking-tight text-white mb-1 drop-shadow-md">
                      {activeStyle.name} <span className="font-light opacity-60 ml-1 text-xl">{mediaSlideIndex + 1}/{activeMediaList.length}</span>
                    </h2>
                    <p className="text-sm text-white/70 flex items-center gap-1.5 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      {activeStyle.subtitle || "Aambal Retreat"}
                    </p>
                  </div>

                  {/* Inner Heart Button */}
                  <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute bottom-6 right-6 w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30 shadow-lg hover:bg-white/30 transition">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </motion.div>

                {/* Overlapping Close/Back Button on edge */}
                <button onClick={handlePrev} className="absolute bottom-6 left-0 -translate-x-1/2 w-12 h-12 bg-[#2a2624] border border-white/10 rounded-full flex items-center justify-center text-white/50 shadow-xl z-20 hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SCREEN 3: FULL SCREEN DETAIL ── */}
        <AnimatePresence>
          {showDetailView && activeStyle && (
            <motion.div 
              key="detail-view"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ type: "spring", damping: 25 }}
              className="absolute inset-0 z-[100] bg-black flex flex-col"
            >
              {/* Full Background Image */}
              {currentMedia?.type === 'video' ? (
                <video src={currentMedia.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <img src={currentMedia?.url || portrait} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#1a1814]/90 pointer-events-none" />

              {/* Detail Top Nav */}
              <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-50">
                <button onClick={() => setShowDetailView(false)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                
                {/* Horizontal Avatars (Shows preview of other Styles) */}
                <div className="flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 -space-x-2">
                  {heroData.styles.slice(0, 4).map((style: any, i: number) => (
                    <img 
                      key={i} src={style.media?.[0]?.url || portrait} 
                      className={`w-8 h-8 rounded-full border-2 border-[#1a1814] object-cover transition-all ${activeStyleIndex === i ? 'ring-2 ring-[#a3b838] scale-110 z-10' : 'opacity-60'}`} 
                    />
                  ))}
                </div>

                <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>

              {/* Detail Text & Tags */}
              <div className="absolute bottom-[110px] left-6 right-6 z-10 flex flex-col items-center text-center">
                <h2 className="text-4xl font-semibold tracking-tight text-white mb-2 drop-shadow-md">
                  {activeStyle.name} <span className="font-light opacity-60 ml-1 text-2xl">{mediaSlideIndex + 1}/{activeMediaList.length}</span>
                </h2>
                <p className="text-sm text-white/70 flex items-center justify-center gap-1.5 font-medium mb-6">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  {activeStyle.subtitle || "Aambal Retreat"}
                </p>

                {/* Glass Pills */}
                <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
                  {(['Photography', 'Lighting', 'Festival']).map((tag: string, i: number) => (
                    <span key={i} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] text-gray-300 tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detail Bottom Action Bar */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-50 gap-4">
                <button onClick={() => setShowDetailView(false)} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <button className="relative w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">4</span>
                </button>
                <a href="#packages" className="flex-1 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 font-semibold gap-2 hover:bg-[#a3b838] hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  Book Slot
                </a>
                <button onClick={() => setShowDetailView(false)} className="w-14 h-14 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FLOATING BOTTOM NAV (Persists on Screen 1) ── */}
        {!showDetailView && (
          <div className="absolute bottom-6 left-6 right-6 h-[72px] bg-white/10 backdrop-blur-3xl rounded-[36px] border border-white/10 flex items-center justify-between px-6 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'home' ? 'bg-[#a3b838] text-black shadow-[0_0_15px_rgba(163,184,56,0.5)]' : 'text-white/50 group-hover:text-white'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            </button>
            <button onClick={() => setActiveTab('map')} className="flex flex-col items-center gap-1 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'map' ? 'bg-[#a3b838] text-black shadow-[0_0_15px_rgba(163,184,56,0.5)]' : 'text-white/50 group-hover:text-white'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </button>
            <button onClick={() => setActiveTab('heart')} className="flex flex-col items-center gap-1 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'heart' ? 'bg-[#a3b838] text-black shadow-[0_0_15px_rgba(163,184,56,0.5)]' : 'text-white/50 group-hover:text-white'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={activeTab === 'heart' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
            </button>
            <button onClick={() => setActiveTab('game')} className="flex flex-col items-center gap-1 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'game' ? 'bg-[#a3b838] text-black shadow-[0_0_15px_rgba(163,184,56,0.5)]' : 'text-white/50 group-hover:text-white'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/></svg>
              </div>
            </button>
          </div>
        )}

      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB DASHBOARD SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HubDashboard() {
  const [activeTab, setActiveTab] = useState("studio");

  const HUB_DATA: Record<string, any> = {
    studio: {
      id: "studio",
      label: "Studio",
      icon: "📸",
      title: "The Studio Experience",
      desc: "Step into our controlled environment. We craft the perfect light for portraits, bridals, and product photography using industry-leading modifiers and cinema-grade glass.",
      image: portrait,
      link: "#gallery",
      btnText: "View Portfolio",
      widgets: [
        { title: "Lighting", value: "Profoto B10X", icon: "💡" },
        { title: "Backdrops", value: "Seamless", icon: "🎨" },
        { title: "Delivery", value: "48 Hours", icon: "⚡" },
      ]
    },
    festival: {
      id: "festival",
      label: "Festival",
      icon: "🛕",
      title: "Aambal Vasantham",
      desc: "We are the official visual storytellers of the festival. From drone aerials to intimate crowd portraits, we capture the divine chaos and the quiet moments in between.",
      image: hero,
      link: "#packages",
      btnText: "Book Festival Slot",
      widgets: [
        { title: "Coverage", value: "Full Day", icon: "🚁" },
        { title: "Team", value: "4 Shooters", icon: "👥" },
        { title: "Specialty", value: "Night Aarti", icon: "🕯️" },
      ]
    },
    homestay: {
      id: "homestay",
      label: "Homestay",
      icon: "🏡",
      title: "Premium Accommodation",
      desc: "Stay right in the heart of the action. Our premium homestay offers air-conditioned comfort, traditional Kerala architecture, and immediate access to the temple grounds.",
      image: aerial,
      link: "#homestay",
      btnText: "Explore Rooms",
      widgets: [
        { title: "Rooms", value: "3 Suites", icon: "🛏️" },
        { title: "Distance", value: "200m", icon: "🚶" },
        { title: "Amenities", value: "Free Wi-Fi", icon: "📶" },
      ]
    }
  };

  const active = HUB_DATA[activeTab];

  return (
    <BentoWrapper id="hub" eyebrow="Explore" title={<>Discover our <span className="italic text-purple-500">spaces.</span></>}>
      {/* Dashboard Container mimicking the screenshot */}
      <div className="w-full bg-[#1e1e24] rounded-[32px] md:rounded-[40px] p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 shadow-2xl overflow-hidden mt-6 h-auto lg:h-[500px]">
        
        {/* Left Sidebar (Navigation) - Swipes horizontally on mobile */}
        <div className="w-full lg:w-[120px] bg-[#2a2a32] rounded-[24px] md:rounded-[32px] p-2 md:p-3 flex flex-row lg:flex-col gap-2 md:gap-4 overflow-x-auto scrollbar-hide items-center justify-start lg:justify-start lg:py-6 shadow-inner shrink-0 snap-x">
          <div className="hidden lg:flex w-12 h-12 bg-white/5 rounded-full items-center justify-center text-white mb-4 shrink-0">
             <span className="text-xl">S</span>
          </div>
          
          {Object.values(HUB_DATA).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`snap-center flex flex-col items-center justify-center min-w-[80px] h-[80px] lg:w-20 lg:h-20 rounded-[20px] lg:rounded-[24px] transition-all duration-300 shrink-0 ${
                activeTab === tab.id 
                  ? "bg-white text-gray-900 shadow-md lg:scale-105" 
                  : "bg-transparent text-gray-400 hover:bg-white/10"
              }`}
            >
              <span className="text-xl md:text-2xl mb-1">{tab.icon}</span>
              <span className={`text-[8px] md:text-[9px] font-bold tracking-wider uppercase ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Center Area (Details & Widgets) */}
        <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div 
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col gap-3 md:gap-4"
            >
              {/* Main Info Card */}
              <div className="bg-[#2a2a32] rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex-1 flex flex-col justify-center relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <span className="bg-white/10 text-white w-max px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6 border border-white/10">
                  {active.label} Section
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-display text-white mb-3 md:mb-4 leading-tight">
                  {active.title}
                </h2>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-md font-medium">
                  {active.desc}
                </p>
              </div>

              {/* Mini Widgets Row */}
              <div className="grid grid-cols-3 gap-2 md:gap-4 shrink-0">
                {active.widgets.map((widget: any, i: number) => (
                  <div key={i} className="bg-[#b3c5d7] rounded-[20px] md:rounded-[28px] p-3 md:p-4 flex flex-col justify-center items-center text-center shadow-inner hover:scale-[1.02] transition-transform">
                    <span className="text-xl md:text-2xl mb-1 md:mb-2">{widget.icon}</span>
                    <p className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wider line-clamp-1">{widget.title}</p>
                    <p className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">{widget.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Area (Media & Action) */}
        <div className="w-full lg:w-[340px] flex flex-col gap-3 md:gap-4 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={active.id + '-img'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="h-[250px] lg:flex-1 bg-[#2a2a32] rounded-[24px] md:rounded-[32px] relative overflow-hidden border border-white/5 group"
            >
              <img src={active.image} alt={active.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24] via-transparent to-transparent"></div>
              
              {/* Media Player styled overlay */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-[#2a2a32]/90 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/10 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-white text-[10px] md:text-xs font-bold">{active.title}</p>
                  <p className="text-gray-400 text-[8px] md:text-[10px] uppercase tracking-wider mt-0.5">Explore Gallery</p>
                </div>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500 flex items-center justify-center text-white cursor-pointer hover:bg-purple-400 transition-colors">
                  <span className="text-[10px] md:text-xs ml-0.5">▶</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <a href={active.link} className="h-[60px] md:h-[70px] bg-purple-500 rounded-[20px] md:rounded-[28px] flex items-center justify-center text-white font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-purple-400 transition-colors shadow-[0_8px_20px_rgba(168,85,247,0.3)] border border-purple-400">
            {active.btnText}
          </a>
        </div>

      </div>
    </BentoWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENTO GALLERY & BANNER SECTION
// ─────────────────────────────────────────────────────────────────────────────
function BentoGalleryBanner() {
  const galleryImages = [
    portrait, hero, aerial, portrait,
    hero, aerial, portrait, hero,
    aerial, portrait, hero, aerial
  ];

  return (
    <BentoWrapper id="gallery-banner" noPadding>
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 w-full">
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {galleryImages.map((img: string, i: number) => (
            <div key={i} className="relative aspect-[4/3] rounded-[20px] md:rounded-[24px] overflow-hidden group bg-gray-200 shadow-inner">
              <img 
                src={img} 
                alt="Gallery Portfolio Item" 
                className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
              />
            </div>
          ))}
        </div>
      </div>
    </BentoWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-STYLED BENTO SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
function InteractivePhotoFrame() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = [
    { id: "none", name: "Original", css: "none" },
    { id: "warm", name: "Festival Warm", css: "sepia(0.4) saturate(1.3) brightness(1.05)" },
    { id: "bw", name: "Black & White", css: "grayscale(1) contrast(1.1)" },
  ];

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <BentoWrapper id="try-on" eyebrow="Interactive" title={<>Your photo in a <span className="italic text-purple-500">festival frame.</span></>}>
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mt-4 md:mt-0">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-full md:max-w-[400px] aspect-square rounded-[24px] md:rounded-[32px] overflow-hidden bg-purple-50 border-2 border-purple-200 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-purple-100/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            {uploadedImage ? (
              <img src={uploadedImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" style={{ filter: filters.find(f => f.id === filter)?.css }} />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl bg-purple-100 text-purple-500 border-2 border-dashed border-purple-300">📷</div>
                <div className="text-center px-8">
                  <p className="text-gray-900 text-xs md:text-sm font-bold">Click to upload photo</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none">
              {FESTIVAL_FRAMES[0].svgFrame}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        
        <div className="flex flex-col gap-6 md:gap-8">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.28em] text-gray-500 mb-3 md:mb-4 font-bold">Photo filter</p>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all ${filter === f.id ? 'border border-purple-400 bg-purple-100 text-purple-700 shadow-sm' : 'border border-purple-200 bg-white/60 text-slate-500 hover:bg-white'}`}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] md:rounded-[24px] border border-white/80 bg-white/50 p-5 md:p-6 shadow-sm">
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mb-3 md:mb-4 font-bold">How it works</p>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-[9px] md:text-[10px] font-mono text-purple-400 font-bold">01</span>
                <div className="h-px flex-1 bg-black/5" />
                <span className="text-[11px] md:text-xs text-gray-600 font-medium">Upload photo</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-[9px] md:text-[10px] font-mono text-purple-400 font-bold">02</span>
                <div className="h-px flex-1 bg-black/5" />
                <span className="text-[11px] md:text-xs text-gray-600 font-medium">Apply filter</span>
              </div>
            </div>
          </div>
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

function PackagesBento() {
  return (
    <BentoWrapper id="packages" eyebrow="Services & Pricing" title={<>Four packages. <span className="italic text-purple-500">One festival.</span></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 md:mt-8">
        {packageTeasers.map((p) => (
          <div key={p.id} className="bg-white/50 rounded-[24px] md:rounded-[32px] border border-white/80 p-5 md:p-6 flex flex-col gap-4 md:gap-5 hover:-translate-y-1 transition-transform shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 opacity-10" style={{ background: `radial-gradient(circle at top right, ${p.color}, transparent)`}}></div>
            <div className="flex h-12 md:h-14 w-12 md:w-14 items-center justify-center rounded-[16px] md:rounded-[20px] text-xl md:text-2xl bg-white border border-white/80 relative z-10 shadow-sm">{p.icon}</div>
            <div className="flex-1 relative z-10">
              <h3 className="font-display text-lg md:text-xl text-gray-900 mb-1 font-bold">{p.name}</h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 tracking-widest uppercase mb-2 md:mb-3 font-bold">{p.duration}</p>
              <p className="text-xs md:text-sm text-gray-600 font-medium">{p.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-black/5 relative z-10">
              <span className="font-display text-lg md:text-xl font-bold" style={{ color:p.color }}>{p.price}</span>
              <Link to="/booking-confirmed" search={{ plan: p.id }} className="text-[9px] md:text-[10px] font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gray-900 text-white hover:bg-black transition-colors z-20 shadow-md">
                BOOK
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 md:mt-10 flex justify-center relative z-20">
        <Link 
          to="/packages"
          className="rounded-full border border-purple-200 bg-white/60 backdrop-blur-md px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-purple-600 hover:bg-purple-500 hover:text-white hover:border-purple-500 shadow-sm transition-all duration-200"
        >
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
          <StudioServicesBento />
          <PackagesBento /> 
          <DroneBento />
          <ProcessBento />

          <BentoWrapper id="shutter-reel" noPadding>
             <ShutterReel />
          </BentoWrapper>
          
          <BentoWrapper id="festival-bridge" noPadding>
             <StudioToFestivalBridge />
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

          {/* HOMESTAY TARGET SECTION */}
          <BentoWrapper id="homestay" title={<>Premium <span className="italic text-purple-500">Homestay.</span></>} eyebrow="Accommodation" noPadding className="pt-8 md:pt-12">
             <HomestaySection />
          </BentoWrapper>

          {/* GALLERY / PHOTOGRAPHY TARGET SECTION */}
          <BentoWrapper id="gallery" title={<>Moments <span className="italic text-purple-500">Captured.</span></>} eyebrow="Portfolio" noPadding className="py-8 md:py-12">
             <GallerySection />
          </BentoWrapper>

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
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Types & Interfaces ──────────────────────────────────────────────────────
export interface Package {
  id: string;
  name: string;
  location: string;
  price: string;
  duration: string;
  image: string;
  description: string;
  features: string[];
  timeline: { step: string; desc: string }[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  location: string;
  persons: string;
  price: string;
  durationText: string;
}

// ── Placeholder Images & Data (Used as fallbacks) ───────────────────────────
const imgHero = "https://images.unsplash.com/photo-1533174000220-149aa52d40e3?auto=format&fit=crop&q=80";
const imgAerial = "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80";
const imgPortrait = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80";
const imgCinematic = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80";
const userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";

const defaultGlobal = { logoText: "f.studios.", logoType: "text", logoImageUrl: "" };
const defaultAbout = {
  titleLine1: "CAPTURING MAGIC", titleLine2: "FOR TIMELESS", titleLine3: "MEMORIES",
  description: "Explore the vibrant grounds of Aambal Vasantham designed to enhance your cultural experience. Discover how our curated photography packages can transform your memories of the blooming lotuses into cinematic art.",
  image1: imgCinematic, image2: imgHero, image3: imgPortrait, image4: imgAerial
};
const defaultHeroMedia: MediaItem[] = [
  { id: "h1", type: 'image', src: 'https://images.unsplash.com/photo-1544473244-f6895e69da8b?auto=format&fit=crop&w=1920&q=80', titleLine1: 'Demodara', titleLine2: 'bridge', description: 'We are your number one creative studio.', location: 'Bangladesh', persons: '3 Adult', price: '$4050', durationText: '3 days 2 nights' }
];
const defaultPackages: Package[] = [
  { id: "portrait", name: "Portrait", location: "Studio Hut", price: "₹4,999", duration: "1 Hour", image: imgPortrait, description: "Intimate, warmly toned portraits capturing your authentic festival moments. Perfect for couples or solo attendees.", features: ["1 Hour Coverage", "30+ Retouched Photos", "Same-day Preview"], timeline: [{ step: "Meetup", desc: "Studio Hut Entrance" }, { step: "Session", desc: "Golden Hour Shooting" }, { step: "Delivery", desc: "Digital Gallery via WhatsApp" }] },
  { id: "group", name: "Group", location: "Main Stage", price: "₹8,999", duration: "2 Hours", image: imgHero, description: "Comprehensive coverage for your entire group. We capture candid interactions and beautifully posed group shots.", features: ["Up to 10 People", "80+ Retouched Photos", "Candid & Posed Shots"], timeline: [{ step: "Rendezvous", desc: "Main Stage VIP Area" }, { step: "Coverage", desc: "Following your group" }, { step: "Prints", desc: "Physical photos delivered" }] },
  { id: "cinematic", name: "Cinematic", location: "All Access", price: "₹14,999", duration: "Half Day", image: imgCinematic, description: "A beautifully edited, music-driven highlight film of your festival experience. Shot on cinema cameras.", features: ["1 Cinematographer", "60-sec Highlight Reel", "Color Graded Film"], timeline: [{ step: "Briefing", desc: "Discussing the vibe" }, { step: "Filming", desc: "Multi-angle coverage" }, { step: "Premiere", desc: "Video sent in 48 hours" }] },
  { id: "fullday", name: "Full Story", location: "Complete Venue", price: "₹24,999", duration: "Full Day", image: imgAerial, description: "The ultimate package. Complete coverage from arrival to the final act, including spectacular aerial drone shots.", features: ["Photo + Video", "Drone Coverage", "3-5 min Mini Doc"], timeline: [{ step: "Arrival", desc: "Drone intro shot" }, { step: "Immersive", desc: "Photo & Video all day" }, { step: "Archived", desc: "Complete Drive link" }] }
];
const defaultReferral = {
  titleLine1: "Bring Your Squad",
  titleLine2: "Unlock Exclusive Perks",
  description: "Invite friends. Earn rewards.",
  rewards: [{ threshold: 1, reward: "10% Discount" }]
};
// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ArrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  ArrowUpRight: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Play: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Bag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Heart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Chart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Star: () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
),
};

// ── Components ──────────────────────────────────────────────────────────────

// ── 1. TRAVEL HERO ──
function TravelHero({ slides, globalData }: { slides: MediaItem[], globalData: any }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isEditor = window.self !== window.top;

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const currentMedia = slides[activeIndex];
    let timer: ReturnType<typeof setTimeout>;
    
    if (currentMedia?.type === 'image') {
      timer = setTimeout(() => handleNext(), 5000);
    }
    
    if (sliderRef.current && sliderRef.current.children[activeIndex]) {
      const container = sliderRef.current;
      const activeEl = container.children[activeIndex] as HTMLElement;
      const scrollPos = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
    
    return () => clearTimeout(timer);
  }, [activeIndex, slides]);
// ── Add these missing icons to your Icons object ───────────────────────────


// ── 2. Add these missing constants above PackagesShowcase ──

  const handleNext = () => {
    if (slides && slides.length > 0) setActiveIndex((prev) => (prev + 1) % slides.length);
  };
  const scrollToPackages = () => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });

  if (!slides || slides.length === 0) return null;
  const activeMedia = slides[activeIndex];

  return (
    <div className="relative w-full h-screen min-h-[700px] overflow-hidden bg-black text-white font-sans flex flex-col">
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMedia.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {activeMedia.type === 'video' ? (
              <video src={activeMedia.src} autoPlay muted onEnded={handleNext} className="w-full h-full object-cover" />
            ) : (
              <img src={activeMedia.src} alt="Background" className="w-full h-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px)] bg-[size:25%_100%] pointer-events-none"></div>
      </div>

      <nav className="relative z-10 flex justify-between items-center px-8 py-6">
        <div 
          onClick={() => {
            if (isEditor) window.parent.postMessage({ type: "EDIT_GLOBAL" }, "*");
          }}
          className={`text-2xl font-bold tracking-tighter flex items-center gap-2 ${isEditor ? 'hover:outline hover:outline-2 hover:outline-emerald-500 hover:outline-offset-8 rounded-lg cursor-pointer transition-all' : ''}`}
        >
          {globalData.logoType === 'image' && globalData.logoImageUrl ? (
            <img src={globalData.logoImageUrl} alt="Logo" className="h-8 object-contain" />
          ) : (
            <>
              <span className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <span className="bg-white rounded-sm"></span><span className="bg-white rounded-sm"></span>
                <span className="bg-white/50 rounded-sm"></span><span className="bg-white rounded-sm"></span>
              </span>
              {globalData.logoText || "travelmate"}
            </>
          )}
        </div>
        <div className="flex items-center gap-6 text-sm">
          <button className="hover:text-[#f5a623] transition-colors"><Icons.User /></button>
          <button className="hover:text-[#f5a623] transition-colors"><Icons.Menu /></button>
          <button className="hover:text-[#f5a623] transition-colors"><Icons.Search /></button>
        </div>
      </nav>

      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-8 text-xs tracking-widest text-white/60">
        <span className="rotate-180 hover:text-white cursor-pointer transition-colors" style={{ writingMode: 'vertical-rl' }}>Facebook</span>
        <span className="rotate-180 hover:text-white cursor-pointer transition-colors" style={{ writingMode: 'vertical-rl' }}>Twitter</span>
        <span className="rotate-180 hover:text-white cursor-pointer transition-colors" style={{ writingMode: 'vertical-rl' }}>Dribble</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center pl-24 pr-8 md:pl-32 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="w-full md:w-1/2">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-4 drop-shadow-lg">
              {activeMedia.titleLine1} <br/><span className="font-light text-white/90">{activeMedia.titleLine2}</span>
            </h1>
            <p className="max-w-md text-white/90 text-sm md:text-base leading-relaxed mb-12 drop-shadow-md">
              {activeMedia.description}
            </p>
            <div className="flex flex-wrap gap-12 mt-12">
              <div><p className="text-xs text-white/50 mb-1 drop-shadow-sm">Location</p><p className="font-semibold text-lg drop-shadow-md">{activeMedia.location}</p></div>
              <div><p className="text-xs text-white/50 mb-1 drop-shadow-sm">Persons</p><p className="font-semibold text-lg drop-shadow-md">{activeMedia.persons}</p></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 overflow-hidden flex items-center justify-end relative">
            <div ref={sliderRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-10 px-4 w-full md:w-[600px] snap-x snap-mandatory">
              {slides.map((media, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={media.id}
                    className={`relative rounded-xl overflow-hidden shrink-0 w-32 md:w-48 h-48 md:h-64 snap-center ${isEditor ? 'hover:outline hover:outline-4 hover:outline-emerald-500 hover:outline-offset-2 transition-all cursor-pointer' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (isEditor) {
                        window.parent.postMessage({ type: "EDIT_HERO", id: idx }, "*");
                      } else {
                        setActiveIndex(idx);
                      }
                    }}
                  >
                    <img src={media.poster || media.src} className="w-full h-full object-cover" alt={media.titleLine1} />
                    {media.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className={`rounded-full flex items-center justify-center transition-all ${isActive ? 'w-16 h-16 bg-[#f5a623]' : 'w-12 h-12 bg-white/30 backdrop-blur-sm'}`}>
                          <Icons.Play />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end px-8 md:px-32 pb-8 pt-4 border-t border-white/20 mx-8">
        <div className="flex items-center gap-4">
          <button onClick={scrollToPackages} className="text-sm tracking-widest uppercase flex flex-col items-center gap-2 hover:text-[#f5a623] transition-colors drop-shadow-md">
            <span className="w-[1px] h-6 bg-white block"></span>Scroll Down
          </button>
          <button onClick={scrollToPackages} className="flex items-center gap-2 ml-8 group drop-shadow-md">
            <span className="font-semibold text-sm">discover</span>
            <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <Icons.ArrowRight />
            </div>
          </button>
        </div>
        <div className="flex items-end gap-16">
          <div><h3 className="text-4xl font-bold tracking-tight mb-1 drop-shadow-lg">{activeMedia.price}</h3><p className="text-xs text-white/90 tracking-wider drop-shadow-md">{activeMedia.durationText}</p></div>
          <div className="hidden md:flex gap-8 text-sm text-white/80 mb-1 drop-shadow-md">
            <button className="text-white border-b-2 border-white pb-1 font-semibold">Overview</button>
            <button className="hover:text-white transition-colors">Route</button>
            <button className="hover:text-white transition-colors">Photos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. E-COMMERCE DASHBOARD HERO (Dynamic Package Viewer) ──
function EcommerceDashboardHero({ packages, onOpenDetails, globalData }: { packages: Package[], onOpenDetails: (pkg: Package) => void, globalData: any }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!packages || packages.length === 0) return null;
  const activePkg = packages[activeIdx] || packages[0];
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  
  // Safe extraction of the first letter for the logo icon
  const logoInitial = globalData?.logoText ? globalData.logoText.charAt(0).toLowerCase() : "f";

  return (
    <div className="w-full bg-[#f4f5f7] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 h-auto lg:h-[840px]">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-full lg:w-[340px] flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-full p-2 pl-3 flex items-center shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#f5a623] text-white flex items-center justify-center shrink-0"><Icons.Search /></div>
            <input type="text" placeholder="Search any package..." className="flex-1 bg-transparent text-sm px-3 outline-none text-gray-700" />
            <button className="text-gray-400 hover:text-gray-700 pr-2"><Icons.Filter /></button>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm flex-1 flex flex-col">
             <div className="flex items-center gap-2 mb-6 text-gray-800">
               <span className="text-[#f5a623]"><Icons.Chart /></span><h3 className="font-bold text-sm">All Packages</h3>
             </div>
             <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1 custom-scrollbar" style={{ maxHeight: '420px' }}>
               {packages.map((pkg, idx) => {
                 const isActive = activeIdx === idx;
                 return (
                   <div key={pkg.id} onClick={() => setActiveIdx(idx)} className={`relative rounded-2xl overflow-hidden group cursor-pointer border shadow-sm transition-all duration-300 ${isActive ? 'border-[#f5a623] ring-2 ring-[#f5a623]/30 scale-[1.02]' : 'border-gray-100 hover:border-gray-300 hover:scale-[1.01]'}`}>
                     <div className="h-32 bg-gray-100 relative">
                       <img src={pkg.image} alt={pkg.name} className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                     </div>
                     <div className="absolute bottom-3 left-3 text-white">
                       <p className="font-semibold text-xs mb-0.5">{pkg.name}</p><p className="text-[10px] text-white/80">{pkg.price}</p>
                     </div>
                     {isActive && <div className="absolute top-3 right-3 w-2 h-2 bg-[#f5a623] rounded-full shadow-[0_0_8px_#f5a623]"></div>}
                   </div>
                 );
               })}
             </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm h-[180px]">
            <div className="flex items-center gap-2 mb-5 text-gray-800"><span className="text-[#f5a623]"><Icons.Bag /></span><h3 className="font-bold text-sm">Recent Bookings</h3></div>
             <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-3"><img src={userAvatar} className="w-8 h-8 rounded-full object-cover" alt="User" /><span className="text-xs font-semibold text-gray-600 group-hover:text-black">Family Coverage</span></div><span className="text-gray-400">⋮</span>
               </div>
             </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 bg-[#12141a] rounded-[48px] relative overflow-hidden flex flex-col lg:flex-row shadow-xl transition-colors duration-500">
             <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center relative z-10">
               <AnimatePresence mode="wait">
                 <motion.div key={activePkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                    <p className="text-[#f5a623] text-xs font-bold uppercase tracking-widest mb-2">{activePkg.duration} · {activePkg.location}</p>
                    <h1 className="text-white text-4xl lg:text-5xl font-black uppercase tracking-wide mb-4">{activePkg.name}</h1>
                    <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">{activePkg.description}</p>
                    <button onClick={() => onOpenDetails(activePkg)} className="bg-[#f5a623] hover:bg-[#e0941d] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-3 transition-transform hover:scale-105 shadow-[0_4px_20px_rgba(245,166,35,0.4)]">
                      VIEW DETAILS & BOOK <Icons.Pin />
                    </button>
                 </motion.div>
               </AnimatePresence>
             </div>

             <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-0 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={activePkg.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.6, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <img src={activePkg.image} className="w-full h-full object-cover mix-blend-screen" alt={activePkg.name} />
                  </motion.div>
                </AnimatePresence>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="relative z-10 w-[280px] h-[280px] rounded-full bg-[#1c1f26] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-[16px] border-[#0a0c10] flex items-center justify-center">
                  <div className="w-[180px] h-[180px] rounded-full border border-gray-700/50 relative">
                     {[...Array(12)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-gray-500 rounded-full" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-80px)` }} />))}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#f5a623]"><Icons.Play /></div>
                  </div>
                </motion.div>
             </div>
          </div>

          <div className="h-auto lg:h-[220px] flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[45%] bg-[#f5a623] rounded-[40px] p-8 flex flex-col justify-between shadow-lg">
               <h3 className="text-black font-bold text-lg mb-4">Quick Filters</h3>
               <div className="flex flex-wrap gap-3">
                 <button onClick={() => scrollTo("packages")} className="px-4 py-2 rounded-full border border-black/20 text-black text-xs font-semibold hover:bg-black/5 flex items-center gap-1.5"><Icons.Pin/> Studio</button>
                 <button onClick={() => scrollTo("packages")} className="px-4 py-2 rounded-full bg-[#12141a] text-white text-xs font-semibold shadow-md flex items-center gap-1.5"><Icons.Play/> Cinematic</button>
               </div>
            </div>
            <div className="flex-1 bg-[#12141a] rounded-[40px] p-8 shadow-lg relative overflow-hidden flex items-center">
               <img src={imgAerial} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" alt="Drone Coverage" />
               <div className="relative z-10 flex justify-between w-full items-center">
                 <div><p className="text-[#f5a623] text-[10px] font-bold uppercase tracking-widest mb-2">Aerial Services</p><h3 className="text-white text-2xl font-bold">Drone Coverage</h3></div>
                 <button onClick={() => scrollTo("packages")} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"><Icons.ArrowUpRight/></button>
               </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT NAVIGATION PILL ── */}
        <div className="hidden lg:flex flex-col w-[80px] bg-white rounded-full py-8 items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.06)] shrink-0 z-50">
           <div className="w-12 h-12 bg-[#f5a623] rounded-full flex items-center justify-center text-white font-serif italic text-3xl shadow-md cursor-pointer pb-2 font-bold">
             {logoInitial}
           </div>
           <div className="flex flex-col gap-6 text-gray-400">
             <button className="w-12 h-12 rounded-full bg-[#12141a] text-white flex items-center justify-center shadow-lg"><Icons.Home/></button>
             <button className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors"><Icons.User/></button>
             <button className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center relative transition-colors"><Icons.Search/></button>
           </div>
           <div className="flex flex-col gap-4 items-center mt-4">
             <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Icons.ArrowLeft/></button>
             <img src={userAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="User" />
           </div>
        </div>
      </div>
    </div>
  );
}
function ReferralDashboard({ referralData }: { referralData: any }) {
  const [referrals, setReferrals] = useState(0);
  const [copied, setCopied] = useState(false);
  const isEditor = window.self !== window.top;
  
  if (!referralData) return null;

  const referralCode = "AAMBAL-26-GUEST";
  const referralLink = `https://aambal.com/join/${referralCode}`;
  const sortedRewards = [...(referralData.rewards || [])].sort((a, b) => a.threshold - b.threshold);
  const maxThreshold = sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].threshold : 1;
  const progressPercent = Math.min(100, (referrals / maxThreshold) * 100);

  return (
    <div id="referral" className="w-full bg-[#f4f5f7] pt-12 pb-6 px-4 md:px-6 lg:px-10 font-sans">
      <div 
        onClick={() => isEditor && window.parent.postMessage({ type: "EDIT_REFERRAL" }, "*")}
        className={`max-w-[1600px] mx-auto bg-[#12141a] rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative ${isEditor ? 'hover:outline outline-4 outline-emerald-500 cursor-pointer' : ''}`}
      >
        <div className="lg:w-[45%] p-10 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/20 text-[#f5a623] w-max mb-6">
            <Icons.Star />
            <span className="text-[10px] uppercase font-bold tracking-widest">Rewards Hub</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            {referralData.titleLine1} <br/> <span className="text-[#f5a623]">{referralData.titleLine2}</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">{referralData.description}</p>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 pl-5">
            <span className="text-white/80 font-mono text-sm truncate flex-1">{referralLink}</span>
            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(referralLink); setCopied(true); }} className="ml-3 px-6 py-3 rounded-xl font-bold text-xs uppercase bg-[#f5a623] text-black">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="lg:w-[55%] p-10 lg:p-16 flex flex-col justify-center bg-[#0d0e12]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-widest text-white/50 mb-1">Successful Referrals</p>
              <p className="text-5xl font-black text-white">{referrals} <span className="text-xl text-white/30 font-medium">/ {maxThreshold}</span></p>
            </div>
            <button onClick={() => setReferrals(r => r + 1)} className="text-[10px] text-white/20 hover:text-white">[Test]</button>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-10"><motion.div className="h-full bg-[#f5a623]" animate={{ width: `${progressPercent}%` }} /></div>
          <div className="space-y-4">
            {sortedRewards.map((rw: any, i: number) => (
              <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${referrals >= rw.threshold ? 'bg-white/5 border-emerald-500/30' : 'bg-transparent border-white/5 opacity-50'}`}>
                <p className="text-sm text-white">{rw.reward}</p>
                {referrals >= rw.threshold && <span className="text-[10px] uppercase font-bold text-emerald-400">Unlocked</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5. MAIN EXPORT COMPONENT ──
         
// ── 3. SPLIT SCREEN DETAIL (Booking Modal) ──
function SplitScreenDetail({ pkg, onClose, onBook }: { pkg: Package; onClose: () => void; onBook: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-[#15171e] overflow-y-auto lg:overflow-hidden font-sans">
      <button onClick={onClose} className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50 text-white bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors"><Icons.Close /></button>
      <motion.div initial={{ y: "10%" }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full lg:w-[45%] h-[50vh] lg:h-full relative shrink-0">
        <img src={pkg.image} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15171e] via-black/40 to-black/20 lg:bg-black/40"></div>
        <div className="absolute bottom-8 left-6 right-6 lg:bottom-12 lg:left-12 lg:right-12 text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 lg:mb-8">{pkg.name}</h2>
          <div className="relative pl-6 border-l-2 border-white/30 space-y-6 lg:space-y-8 hidden md:block">
            {pkg.timeline?.map((item, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#f5a623] rounded-full"></div>
                <h4 className="text-sm font-bold tracking-wider uppercase mb-1">{item.step}</h4>
                <p className="text-xs text-white/70">{item.desc}</p>
              </div>
            ))}
            <div className="absolute top-0 -left-[2px] w-[2px] h-full bg-[#f5a623] origin-top animate-pulse"></div>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ y: "10%" }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }} className="w-full lg:w-[55%] flex-1 bg-[#15171e] relative p-6 md:p-12 lg:p-20 flex flex-col justify-start lg:justify-center text-white">
        <p className="text-[#f5a623] text-xs font-bold uppercase tracking-[0.2em] mb-4">Package Details</p>
        <h3 className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">{pkg.description}</h3>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mb-8 border-y border-white/10 py-6">
          <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Duration</p><p className="font-bold text-lg md:text-xl">{pkg.duration}</p></div>
          <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Location</p><p className="font-bold text-lg md:text-xl">{pkg.location}</p></div>
        </div>
        <div className="mb-12">
           <ul className="space-y-4">
            {pkg.features?.map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-sm md:text-base font-medium text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mt-2 shrink-0"></div> {feat}
              </li>
            ))}
           </ul>
        </div>
        <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total investment</p><p className="text-4xl md:text-5xl font-bold">{pkg.price}</p></div>
          <button onClick={onBook} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#15171e] hover:bg-[#f5a623] px-8 py-4 rounded-full font-bold tracking-widest text-xs uppercase transition-colors">BOOK NOW <Icons.ArrowRight /></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── 4. ABOUT FESTIVAL SECTION ──
function AboutFestivalSection({ aboutData }: { aboutData: any }) {
  const isEditor = window.self !== window.top;
  const editableHoverClass = isEditor ? "hover:outline hover:outline-4 hover:outline-emerald-500 hover:outline-offset-8 cursor-pointer transition-all duration-200 rounded-3xl" : "";

  const triggerEdit = () => {
    if (isEditor) window.parent.postMessage({ type: "EDIT_ABOUT" }, "*");
  };

  if (!aboutData) return null;
  return (
    <section id="about" className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 py-12 md:py-24 font-sans bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className={`lg:col-span-8 flex flex-col ${editableHoverClass}`} onClick={triggerEdit}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-8 md:mb-12">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="w-1.5 bg-gray-300 rounded-full" style={{ height: `${36 - i * 5}px` }}></div>))}
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#12141a] leading-[1.1] tracking-tight uppercase">
                {aboutData.titleLine1} <br /><span className="font-semibold">{aboutData.titleLine2}</span> <br />{aboutData.titleLine3}
              </h2>
            </div>
          </motion.div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2 mb-8 md:mb-12 h-auto md:h-[280px] lg:h-[320px]">
            <motion.div whileHover={{ scale: 0.98 }} className="w-full md:w-1/3 h-[200px] md:h-[220px] lg:h-[260px] rounded-[32px] md:rounded-r-none md:rounded-l-[80px] overflow-hidden relative cursor-pointer"><img src={aboutData.image1} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 md:grayscale hover:grayscale-0" /></motion.div>
            <motion.div whileHover={{ scale: 0.98 }} className="w-full md:w-1/3 h-[240px] md:h-full rounded-[32px] md:rounded-[40px] overflow-hidden relative z-10 cursor-pointer shadow-lg md:shadow-2xl"><img src={aboutData.image2} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" /></motion.div>
            <motion.div whileHover={{ scale: 0.98 }} className="w-full md:w-1/3 h-[200px] md:h-[220px] lg:h-[260px] rounded-[32px] md:rounded-l-none md:rounded-r-[80px] overflow-hidden relative cursor-pointer"><img src={aboutData.image3} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 md:grayscale hover:grayscale-0" /></motion.div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 h-40 lg:h-48 rounded-[24px] lg:rounded-[32px] overflow-hidden hidden md:block shrink-0"><img src={aboutData.image4} className="w-full h-full object-cover grayscale opacity-60" /></div>
            <div className="w-full bg-[#f4f5f7] rounded-[24px] lg:rounded-[32px] p-6 lg:p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-gray-600 text-sm lg:text-[15px] leading-relaxed mb-6 lg:mb-8 font-medium">{aboutData.description}</p>
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" }); }} className="flex-1 md:flex-none bg-[#12141a] text-white px-6 lg:px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#f5a623] transition-colors shadow-lg">All Packages</button>
                <button onClick={(e) => { e.stopPropagation(); document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" }); }} className="w-12 h-12 bg-[#12141a] text-white rounded-full flex items-center justify-center hover:bg-[#f5a623] transition-colors shadow-lg shrink-0"><Icons.ArrowUpRight /></button>
              </div>
            </div>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          className={`lg:col-span-4 w-full h-[400px] sm:h-[500px] lg:h-full min-h-[400px] relative mt-4 lg:mt-0 ${editableHoverClass}`}
          onClick={triggerEdit}
        >
          <div className="w-full h-full rounded-[32px] lg:rounded-[48px] overflow-hidden relative group shadow-xl lg:shadow-2xl">
            <img src={aboutData.image3} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 bg-white/70 backdrop-blur-xl border border-white/60 p-5 lg:p-8 rounded-[24px] lg:rounded-[32px] shadow-xl">
              <div className="flex justify-between items-start mb-3 lg:mb-5">
                <span className="bg-white text-[#12141a] px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">Last Event</span>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#12141a] text-white rounded-full flex items-center justify-center shadow-md"><Icons.ArrowUpRight /></div>
              </div>
              <p className="text-[#12141a] font-semibold text-xs lg:text-sm leading-relaxed">Immersive visual solutions and expert cinematography documenting your journey.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── 5. MAIN EXPORT COMPONENT ──
export function PackagesShowcase() {
  const navigate = useNavigate();
  const isEditor = window.self !== window.top;
  
  // Data States
  const [globalData, setGlobalData] = useState<any>(defaultGlobal);
  const [heroData, setHeroData] = useState<any>({ slides: defaultHeroMedia });
  const [aboutData, setAboutData] = useState<any>(defaultAbout);
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [referralData, setReferralData] =useState<any>(defaultReferral);
  // UI States
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Sync with Firebase
  useEffect(() => {
    const refs = {
  global: doc(db, "siteContent", "global"),
  hero: doc(db, "siteContent", "hero"),
  about: doc(db, "siteContent", "about"),
  packages: doc(db, "siteContent", "packages"),
  referral: doc(db, "siteContent", "referral"),
};

    const unsubs = [
      onSnapshot(refs.global, (s) => s.exists() && setGlobalData(s.data())),
      onSnapshot(refs.hero, (s) => s.exists() && setHeroData(s.data())),
      onSnapshot(refs.about, (s) => s.exists() && setAboutData(s.data())),
      onSnapshot(
  refs.referral,
  (s) =>
    s.exists() &&
    setReferralData(s.data())
),
      onSnapshot(refs.packages, (s) => {
        if (s.exists()) {
          const data = s.data();
          setPackages(Object.keys(data).map(k => data[k]));
        }
      })
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ── INCOMING: Listen for Editor scrolling commands ──
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "SYNC_VIEW") {
        const view = e.data.view;
        
        if (view === "about") {
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (view === "packages" || view.startsWith("pkgEdit-")) {
          document.getElementById("packages")?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (view === "hero" || view.startsWith("heroEdit-") || view === "global" || view === "root") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const slideLeft = () => document.getElementById('package-slider')?.scrollBy({ left: -320, behavior: 'smooth' });
  const slideRight = () => document.getElementById('package-slider')?.scrollBy({ left: 320, behavior: 'smooth' });

  return (
    <div className="min-h-screen font-sans bg-[#f4f5f7] pb-12 md:pb-20">
      
      <TravelHero slides={heroData.slides} globalData={globalData} />
      <EcommerceDashboardHero packages={packages} onOpenDetails={setSelectedPkg} globalData={globalData} />
      <AboutFestivalSection aboutData={aboutData} />
      <ReferralDashboard
  referralData={referralData}
/>

      {/* ── PACKAGES CAROUSEL SECTION ── */}
      <div id="packages" className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-10 mt-12 bg-white rounded-[40px] pt-12 pb-24 shadow-sm border border-gray-100 mx-4 lg:mx-8">
        <div className="flex justify-between items-end mb-8 text-[#12141a] px-4">
           <h3 className="text-3xl font-bold tracking-tight">Available Packages</h3>
           <div className="hidden sm:flex gap-2">
              <button onClick={slideLeft} className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"><Icons.ArrowLeft/></button>
              <button onClick={slideRight} className="w-10 h-10 bg-[#12141a] text-white rounded-full flex items-center justify-center hover:bg-black"><Icons.ArrowRight/></button>
           </div>
        </div>

        <div id="package-slider" className="flex gap-4 md:gap-6 overflow-x-auto pb-8 px-4 scrollbar-hide snap-x snap-mandatory">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              className={`relative rounded-[32px] overflow-hidden group shrink-0 w-[280px] md:w-[320px] h-[400px] md:h-[480px] ${isEditor ? 'hover:outline hover:outline-4 hover:outline-emerald-500 hover:outline-offset-4 cursor-pointer transition-all' : 'cursor-pointer'}`}
              onClick={() => {
                if (isEditor) {
                  window.parent.postMessage({ type: "EDIT_PACKAGE", id: pkg.id }, "*");
                } else {
                  setSelectedPkg(pkg);
                }
              }}
            >
              <img src={pkg.image} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/30 to-transparent opacity-90"></div>

              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-white border border-white/30">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[#f5a623] text-[10px] font-bold uppercase tracking-widest mb-1">{pkg.duration}</p>
                <h4 className="text-white text-xl md:text-2xl font-bold tracking-wide mb-3">{pkg.name}</h4>
                <div className="flex justify-between items-center border-t border-white/20 pt-3 mt-2">
                  <span className="text-white/90 text-sm font-semibold">{pkg.price}</span>
                  <div className="w-8 h-8 rounded-full bg-white text-[#12141a] flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.ArrowRight />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPkg && (
          <SplitScreenDetail
            pkg={selectedPkg}
            onClose={() => setSelectedPkg(null)}
            onBook={() => {
              const id = selectedPkg.id;
              setSelectedPkg(null);
              navigate({ to: "/booking-confirmed", search: { plan: id } });
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

function ImageUploader({
  value,
  onUploaded,
}: {
  value: string;
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const storageRef = ref(
      storage,
      `uploads/${Date.now()}-${file.name}`
    );

    await uploadBytes(storageRef, file);

    const url =
      await getDownloadURL(storageRef);

    onUploaded(url);

    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <img
        src={value}
        className="w-full h-40 object-cover rounded-xl"
        alt="Uploaded Preview"
      />

      <label className="cursor-pointer block">
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={uploadImage}
        />

        <div className="bg-emerald-500 hover:bg-emerald-400 transition-colors text-black text-center py-3 rounded-xl font-bold">
          {loading
            ? "Uploading..."
            : "Upload Image"}
        </div>
      </label>
    </div>
  );
}

export const Route = createFileRoute("/package-editor")({
  component: ThemeEditor,
});

// ── 1. Icons ──
const Icons = {
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Globe: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Type: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Layout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

// ── 2. Default Data Models ──
const defaultGlobal = { logoText: "f.studios", contactEmail: "hello@fstudios.com" };
const defaultHero = {
  slides: [
    { id: "h1", type: "video", src: "https://cdn.pixabay.com/video/2021/08/04/83863-584745598_tiny.mp4", poster: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80", titleLine1: "Aerial", titleLine2: "coverage", description: "Creative and professional photography.", location: "Lotus Pond", persons: "All Access", price: "₹14,999", durationText: "Half Day Cinematic" }
  ]
};
const defaultAbout = {
  titleLine1: "CAPTURING MAGIC", titleLine2: "FOR TIMELESS", titleLine3: "MEMORIES",
  description: "Explore the vibrant grounds designed to enhance your cultural experience.",
  image1: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80",
  image2: "https://images.unsplash.com/photo-1533174000220-149aa52d40e3?auto=format&fit=crop&q=80",
  image3: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80",
  image4: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80"
};
const defaultPackages = {
  portrait: { id: "portrait", name: "Portrait", location: "Studio Hut", price: "₹4,999", duration: "1 Hour", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80", description: "Warmly toned portraits.", features: ["1 Hour Coverage", "30+ Edits"], timeline: [{ step: "Meetup", desc: "Studio Hut" }] },
};

// ── 3. Main Editor Component ──
function ThemeEditor() {
  // Navigation Stack (Like Shopify)
  const [history, setHistory] = useState<string[]>(["root"]);
  const currentView = history[history.length - 1];
  
  // 1. Reference to the iframe to send commands
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Use functional updates to prevent stale closures in the event listener
  const pushView = (view: string) => setHistory(prev => [...prev, view]);
  const popView = () => setHistory(prev => prev.slice(0, -1));

  // 2. INCOMING: Listen for clicks from the preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "EDIT_PACKAGE") {
        pushView(`pkgEdit-${e.data.id}`);
      }
      if (e.data?.type === "EDIT_HERO") {
        pushView(`heroEdit-${e.data.id}`);
      }
      if (e.data?.type === "EDIT_ABOUT") {
        pushView("about");
      }
      if (e.data?.type === "EDIT_GLOBAL") {
        pushView("global");
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  // 3. OUTGOING: Tell the iframe to scroll when the sidebar view changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SYNC_VIEW", view: currentView },
        "*"
      );
    }
  }, [currentView]);

  // Data States
  const [globalData, setGlobalData] = useState<any>(null);
  const [heroData, setHeroData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);
  const [packagesData, setPackagesData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data
  useEffect(() => {
    const refs = {
      global: doc(db, "siteContent", "global"),
      hero: doc(db, "siteContent", "hero"),
      about: doc(db, "siteContent", "about"),
      packages: doc(db, "siteContent", "packages"),
    };

    async function init() {
      const snaps = await Promise.all([getDoc(refs.global), getDoc(refs.hero), getDoc(refs.about), getDoc(refs.packages)]);
      if (!snaps[0].exists()) await setDoc(refs.global, defaultGlobal);
      if (!snaps[1].exists()) await setDoc(refs.hero, defaultHero);
      if (!snaps[2].exists()) await setDoc(refs.about, defaultAbout);
      if (!snaps[3].exists()) await setDoc(refs.packages, defaultPackages);
    }
    init();

    const unsubs = [
      onSnapshot(refs.global, (s) => s.exists() && setGlobalData(s.data())),
      onSnapshot(refs.hero, (s) => s.exists() && setHeroData(s.data())),
      onSnapshot(refs.about, (s) => s.exists() && setAboutData(s.data())),
      onSnapshot(refs.packages, (s) => s.exists() && setPackagesData(s.data())),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  async function saveChanges() {
    setIsSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, "siteContent", "global"), globalData),
        setDoc(doc(db, "siteContent", "hero"), heroData),
        setDoc(doc(db, "siteContent", "about"), aboutData),
        setDoc(doc(db, "siteContent", "packages"), packagesData),
      ]);
      alert("Theme saved and published! ✨");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!globalData || !heroData || !aboutData || !packagesData) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Reusable UI Components ──
  const Input = ({ label, value, onChange, type = "text" }: any) => (
    <div className="mb-5">
      <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2 block">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={onChange} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors" rows={4} />
      ) : (
        <input type={type} value={value} onChange={onChange} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500 transition-colors" />
      )}
    </div>
  );

  const NavButton = ({ icon, label, onClick, subtitle }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-[#1c1f26] hover:bg-[#252932] border border-white/5 rounded-2xl mb-3 transition-colors group">
      <div className="flex items-center gap-4 text-sm font-semibold text-white">
        <span className="text-white/30 group-hover:text-emerald-400 transition-colors">{icon}</span>
        <div className="text-left">
          <p>{label}</p>
          {subtitle && <p className="text-[10px] text-white/40 font-normal uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <span className="text-white/20"><Icons.ChevronRight /></span>
    </button>
  );

  // ── Dynamic Views ──
  const renderView = () => {
    // 1. ROOT VIEW
    if (currentView === "root") {
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-1">Theme Settings</h3>
            <NavButton icon={<Icons.Globe />} label="Global Elements" subtitle="Logo & Header" onClick={() => pushView("global")} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-1">Page Sections</h3>
            <NavButton icon={<Icons.Image />} label="Hero Slider" subtitle={`${heroData.slides.length} Slides`} onClick={() => pushView("hero")} />
            <NavButton icon={<Icons.Type />} label="About Festival" subtitle="Text & Grid Images" onClick={() => pushView("about")} />
            <NavButton icon={<Icons.Layout />} label="Booking Packages" subtitle={`${Object.keys(packagesData).length} Packages`} onClick={() => pushView("packages")} />
          </div>
        </div>
      );
    }

    // 2. GLOBAL SETTINGS
    if (currentView === "global") {
      return (
        <div>
          <Input label="Logo Text" value={globalData.logoText} onChange={(e: any) => setGlobalData({...globalData, logoText: e.target.value})} />
          <Input label="Contact Email" value={globalData.contactEmail} onChange={(e: any) => setGlobalData({...globalData, contactEmail: e.target.value})} />
        </div>
      );
    }

    // 3. ABOUT SECTION
    if (currentView === "about") {
      return (
        <div>
          <Input label="Heading Line 1" value={aboutData.titleLine1} onChange={(e: any) => setAboutData({...aboutData, titleLine1: e.target.value})} />
          <Input label="Heading Line 2" value={aboutData.titleLine2} onChange={(e: any) => setAboutData({...aboutData, titleLine2: e.target.value})} />
          <Input label="Heading Line 3" value={aboutData.titleLine3} onChange={(e: any) => setAboutData({...aboutData, titleLine3: e.target.value})} />
          <Input label="Description" type="textarea" value={aboutData.description} onChange={(e: any) => setAboutData({...aboutData, description: e.target.value})} />
          <Input label="Grid Image 1 (Cinematic)" value={aboutData.image1} onChange={(e: any) => setAboutData({...aboutData, image1: e.target.value})} />
          <Input label="Grid Image 2 (Main Event)" value={aboutData.image2} onChange={(e: any) => setAboutData({...aboutData, image2: e.target.value})} />
          <Input label="Grid Image 3 (Portrait)" value={aboutData.image3} onChange={(e: any) => setAboutData({...aboutData, image3: e.target.value})} />
          <Input label="Bottom Aerial Image" value={aboutData.image4} onChange={(e: any) => setAboutData({...aboutData, image4: e.target.value})} />
        </div>
      );
    }

    // 4. HERO LIST
    if (currentView === "hero") {
      return (
        <div>
          {heroData.slides.map((slide: any, idx: number) => (
            <NavButton 
              key={slide.id} 
              icon={<div className="w-10 h-8 rounded bg-black overflow-hidden"><img src={slide.poster || slide.src} className="w-full h-full object-cover opacity-60"/></div>}
              label={slide.titleLine1 || `Slide ${idx + 1}`} 
              subtitle={slide.type}
              onClick={() => pushView(`heroEdit-${idx}`)} 
            />
          ))}
          <button onClick={() => {
            const newSlides = [...heroData.slides, { id: `h${Date.now()}`, type: "image", src: "", titleLine1: "New Slide", titleLine2: "", description: "", location: "", persons: "", price: "", durationText: "" }];
            setHeroData({ slides: newSlides });
            pushView(`heroEdit-${newSlides.length - 1}`);
          }} className="w-full py-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:bg-white/5 font-bold text-sm mt-4 transition-colors">
            + Add Slide
          </button>
        </div>
      );
    }

    // 5. HERO EDIT (Specific Slide)
    if (currentView.startsWith("heroEdit-")) {
      const idx = parseInt(currentView.split("-")[1]);
      const slide = heroData.slides[idx];
      return (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => {
              const u = [...heroData.slides]; u.splice(idx, 1); setHeroData({ slides: u }); popView();
            }} className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20">Delete Slide</button>
          </div>
          <div className="mb-5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Media Type</label>
            <select value={slide.type} onChange={(e) => { const u = [...heroData.slides]; u[idx].type = e.target.value; setHeroData({ slides: u }); }} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <ImageUploader
            value={slide.src}
            onUploaded={(url) => {
              const u = [...heroData.slides];
              u[idx].src = url;
              setHeroData({ slides: u });
            }}
          />
          {slide.type === "video" && <Input label="Poster/Thumbnail URL" value={slide.poster} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].poster = e.target.value; setHeroData({ slides: u }); }} />}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <Input label="Title Line 1" value={slide.titleLine1} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].titleLine1 = e.target.value; setHeroData({ slides: u }); }} />
            <Input label="Title Line 2" value={slide.titleLine2} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].titleLine2 = e.target.value; setHeroData({ slides: u }); }} />
          </div>
          <Input label="Description" type="textarea" value={slide.description} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].description = e.target.value; setHeroData({ slides: u }); }} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={slide.location} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].location = e.target.value; setHeroData({ slides: u }); }} />
            <Input label="Persons" value={slide.persons} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].persons = e.target.value; setHeroData({ slides: u }); }} />
            <Input label="Price" value={slide.price} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].price = e.target.value; setHeroData({ slides: u }); }} />
            <Input label="Duration Label" value={slide.durationText} onChange={(e: any) => { const u = [...heroData.slides]; u[idx].durationText = e.target.value; setHeroData({ slides: u }); }} />
          </div>
        </div>
      );
    }

    // 6. PACKAGES LIST
    if (currentView === "packages") {
      return (
        <div>
          {Object.keys(packagesData).map((k) => (
            <NavButton 
              key={k} 
              icon={<div className="w-10 h-8 rounded bg-black overflow-hidden"><img src={packagesData[k].image} className="w-full h-full object-cover opacity-80"/></div>}
              label={packagesData[k].name} 
              subtitle={packagesData[k].price}
              onClick={() => pushView(`pkgEdit-${k}`)} 
            />
          ))}
          <button onClick={() => {
            const newKey = `pkg_${Date.now()}`;
            setPackagesData({ ...packagesData, [newKey]: { id: newKey, name: "New Package", price: "₹0", duration: "1 Hour", location: "", image: "", description: "", features: [], timeline: [] } });
            pushView(`pkgEdit-${newKey}`);
          }} className="w-full py-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:bg-white/5 font-bold text-sm mt-4 transition-colors">
            + Add Package
          </button>
        </div>
      );
    }

    // 7. PACKAGE EDIT (Specific Package)
    if (currentView.startsWith("pkgEdit-")) {
      const k = currentView.replace("pkgEdit-", "");
      const pkg = packagesData[k];
      return (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => {
              const u = { ...packagesData }; delete u[k]; setPackagesData(u); popView();
            }} className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20">Delete Package</button>
          </div>
          <Input label="Package Name" value={pkg.name} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, name: e.target.value } })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" value={pkg.price} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, price: e.target.value } })} />
            <Input label="Duration" value={pkg.duration} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, duration: e.target.value } })} />
          </div>
          <Input label="Location" value={pkg.location} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, location: e.target.value } })} />
          <div className="mb-5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Package Image</label>
            <ImageUploader
              value={pkg.image}
              onUploaded={(url) => {
                setPackagesData({
                  ...packagesData,
                  [k]: {
                    ...pkg,
                    image: url,
                  },
                });
              }}
            />
          </div>
          <Input label="Description" type="textarea" value={pkg.description} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, description: e.target.value } })} />
          <Input label="Features (Comma Separated)" value={(pkg.features || []).join(", ")} onChange={(e: any) => setPackagesData({ ...packagesData, [k]: { ...pkg, features: e.target.value.split(",").map((i: string) => i.trim()) } })} />
          
          {/* Timeline Builder */}
          <div className="mt-8 border-t border-white/10 pt-6">
             <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-4 block">Event Timeline Steps</label>
             {(pkg.timeline || []).map((step: any, i: number) => (
               <div key={i} className="bg-[#1c1f26] p-4 rounded-2xl mb-3 relative group border border-white/5">
                 <button onClick={() => {
                   const u = { ...packagesData }; u[k].timeline.splice(i, 1); setPackagesData(u);
                 }} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash /></button>
                 <input value={step.step} onChange={(e) => { const u = { ...packagesData }; u[k].timeline[i].step = e.target.value; setPackagesData(u); }} className="bg-transparent text-white font-bold text-sm outline-none w-full mb-1" placeholder="Step Title" />
                 <input value={step.desc} onChange={(e) => { const u = { ...packagesData }; u[k].timeline[i].desc = e.target.value; setPackagesData(u); }} className="bg-transparent text-white/60 text-xs outline-none w-full" placeholder="Step Description" />
               </div>
             ))}
             <button onClick={() => {
                const u = { ...packagesData };
                if (!u[k].timeline) u[k].timeline = [];
                u[k].timeline.push({ step: "New Step", desc: "Description" });
                setPackagesData(u);
             }} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:bg-white/5 font-bold text-xs mt-2 transition-colors">
               + Add Timeline Step
             </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Render Shell ──
  return (
    <div className="flex h-screen w-full bg-[#0a0c10] text-white font-sans overflow-hidden">
      
      {/* ── LEFT SIDEBAR (Shopify Style) ── */}
      <div className="w-[380px] h-full flex flex-col bg-[#0f1115] shadow-2xl z-20 shrink-0">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#0f1115] shrink-0">
          <div className="flex items-center gap-3">
            {currentView !== "root" && (
              <button onClick={popView} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Icons.Back />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Theme Editor</h2>
              {currentView !== "root" && (
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-0.5">
                  {currentView.split("-")[0]}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold text-xs shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Sliding Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto p-6 scrollbar-hide"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT PANEL: LIVE PREVIEW ── */}
      <div className="flex-1 h-full bg-[#050608] flex flex-col relative p-4 lg:p-6">
        <div className="flex-1 w-full bg-white rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
          
          {/* Fake Browser Header */}
          <div className="h-12 bg-gray-100 flex items-center px-4 gap-3 shrink-0 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="mx-auto flex-1 max-w-md bg-white px-4 py-1.5 rounded-md text-[10px] text-gray-400 border border-gray-200 shadow-sm font-mono flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Preview Connected
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          {/* Actual Live Website - Attaching the Ref here */}
          <iframe 
            ref={iframeRef}
            src="/" 
            className="w-full h-full border-none" 
            title="Live Preview" 
          />
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
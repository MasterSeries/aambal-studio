import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import hero from "@/assets/hero-festival.jpg"; 

export const Route = createFileRoute("/customer-gallery")({
  component: CustomerGallery,
});

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ── Shared UI Components ──────────────────────────────────────────────────────
function GlassPanel({ children, className = "", style = {} }: any) {
  return (
    <div className={`rounded-[32px] overflow-hidden ${className}`} style={{ background: "rgba(255, 255, 255, 0.45)", border: "1px solid rgba(255, 255, 255, 0.8)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 50px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.4)", ...style }}>
      {children}
    </div>
  );
}

// ── Main Gallery ────────────────────────────────────────────────────────────
export default function CustomerGallery() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [view, setView] = useState<"grid" | "masonry">("masonry");

  // ── FIREBASE FETCH LOGIC ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      try {
        const galleryRef = ref(storage, `gallery/${user.uid}`);
        const res = await listAll(galleryRef);
        const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
        setImages(urls);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    });
    return () => unsub();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/customer-login";
  }

  function openLightbox(url: string) {
    const idx = images.indexOf(url);
    setLightboxIdx(idx);
    setLightbox(url);
  }

  function prevImage() {
    const idx = (lightboxIdx - 1 + images.length) % images.length;
    setLightboxIdx(idx); setLightbox(images[idx]);
  }

  function nextImage() {
    const idx = (lightboxIdx + 1) % images.length;
    setLightboxIdx(idx); setLightbox(images[idx]);
  }

  // Keyboard Navigation
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, lightboxIdx]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @font-face {
          font-family: 'DormyCustom';
          src: url('https://fonts.gstatic.com/s/syne/v18/8vIX7w4MziK8_y-aOwc.woff2') format('woff2');
        }
        body { background: #fdfcfb; color: #1a1a1c; font-family: 'Outfit', sans-serif; margin: 0; }
        ::-webkit-scrollbar { width: 0px; }
        
        /* Masonry Columns */
        .masonry-grid { columns: 4; column-gap: 16px; }
        .masonry-item { break-inside: avoid; margin-bottom: 16px; }
        @media(max-width: 1200px) { .masonry-grid { columns: 3; } }
        @media(max-width: 768px) { .masonry-grid { columns: 2; } }
        @media(max-width: 480px) { .masonry-grid { columns: 1; } }
      `}</style>

      {/* ── BRIGHT AIRY BACKGROUND LAYER ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img src={hero} alt="bg" className="w-full h-full object-cover blur-[100px] brightness-150 saturate-100 scale-110 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40" />
      </div>

      <div className="min-h-screen flex p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto relative z-10 gap-6">
        
        {/* ── LEFT DARK NAVIGATION BAR ── */}
        <aside className="hidden lg:flex w-20 bg-[#1c1c1e] rounded-[32px] flex-col items-center py-6 shadow-2xl flex-shrink-0 z-20 border border-white/10">
           <a href="/customer-dashboard" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-12 shadow-inner hover:bg-white/20 transition-colors">
             <Icons.Grid />
           </a>
           
           <div className="flex flex-col gap-8 text-white/40">
             <a href="/customer-dashboard" className="hover:text-white transition-colors p-3"><Icons.Calendar /></a>
             <button className="text-white bg-white/10 p-3 rounded-2xl shadow-inner"><Icons.Image /></button>
             <a href="/customer-dashboard" className="hover:text-white transition-colors p-3"><Icons.FileText /></a>
           </div>

           <button onClick={handleLogout} className="mt-auto text-orange-400 hover:text-orange-300 transition-colors p-3 bg-white/5 rounded-full">
             <Icons.LogOut />
           </button>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="flex justify-between items-center mb-8">
            <h1 style={{ fontFamily: 'DormyCustom', fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111' }}>
              Gallery
            </h1>
            <div className="flex gap-3">
              <a href="/customer-dashboard" className="bg-white/60 hover:bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all border border-black/10 flex items-center justify-center shadow-sm">
                Dashboard
              </a>
              <button onClick={handleLogout} className="lg:hidden bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <Icons.LogOut />
              </button>
            </div>
          </div>

          <GlassPanel className="flex-1 p-6 md:p-8 flex flex-col bg-white/50 border-white/60 shadow-sm relative min-h-[500px]">
            
            {/* Gallery Tools Header */}
            <div className="flex flex-wrap justify-between items-end mb-8 gap-4 border-b border-black/5 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Your Photos</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">{images.length} Captured Memories</p>
              </div>
              
              <div className="bg-black/5 p-1 rounded-full flex gap-1 border border-black/5">
                {(["masonry", "grid"] as const).map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setView(v)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === v ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-black/5'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {images.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-4 text-3xl">📸</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No photos yet</h3>
                <p className="text-sm text-gray-600 max-w-sm">Your photographs will appear here once they have been processed and uploaded by your photographer.</p>
              </div>
            )}

            {/* Masonry View */}
            {images.length > 0 && view === "masonry" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="masonry-grid flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {images.map((url, i) => (
                  <motion.div
                    key={url}
                    className="masonry-item group relative cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-white/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => openLightbox(url)}
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full block group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="flex gap-2 w-full">
                        <button className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          View
                        </button>
                        <a href={url} download target="_blank" onClick={(e) => e.stopPropagation()} className="flex-1 bg-black text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center">
                          Save
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Grid View */}
            {images.length > 0 && view === "grid" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {images.map((url, i) => (
                  <motion.div
                    key={url}
                    className="aspect-square group relative cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-white/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => openLightbox(url)}
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                      <button className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        View
                      </button>
                      <a href={url} download target="_blank" onClick={(e) => e.stopPropagation()} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg text-center">
                        Save
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </GlassPanel>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            {/* Close Button */}
            <button 
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >✕</button>

            {/* Counter */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 rounded-full px-6 py-2 text-xs font-bold text-white tracking-widest uppercase">
              {lightboxIdx + 1} / {images.length}
            </div>

            {/* Prev Button */}
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 md:left-12 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors text-2xl"
              >‹</button>
            )}

            {/* Main Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[85vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <img src={lightbox} alt="" className="max-w-[90vw] max-h-[85vh] object-contain block bg-black/50" />
              
              {/* Download Overlay Button */}
              <a href={lightbox} download target="_blank"
                className="absolute bottom-6 right-6 bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
              >
                ↓ Download
              </a>
            </motion.div>

            {/* Next Button */}
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 md:right-12 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors text-2xl"
              >›</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
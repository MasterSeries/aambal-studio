import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/customer-gallery")({
  component: CustomerGallery,
});

const G = {
  green: "#4a9460", greenLight: "#6db87a", greenPale: "#a8e6b0",
  gold: "#c8a84a", ink: "#040d08", ink2: "#071009",
  text: "#f0ede6", muted: "rgba(240,237,230,0.45)",
  border: "rgba(109,184,122,0.15)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, opacity: 0.8, marginBottom: 6 }}>
      ✦ {children} ✦
    </p>
  );
}

export default function CustomerGallery() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [view, setView] = useState<"grid" | "masonry">("masonry");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      try {
        const galleryRef = ref(storage, `gallery/${user.uid}`);
        const res = await listAll(galleryRef);
        const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
        setImages(urls);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

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

  // keyboard nav
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
      <div style={{ minHeight: "100vh", background: G.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "floatLotus 3s ease-in-out infinite" }}>📸</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: G.greenPale, marginTop: 16 }}>Loading gallery…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600&family=Cinzel:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body,#root{background:${G.ink};color:${G.text};font-family:'Raleway',sans-serif}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${G.green}50;border-radius:3px}
        @keyframes floatLotus{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes ambientPulse{0%,100%{opacity:.3}50%{opacity:.55}}

        /* Masonry columns */
        .masonry-grid {
          columns: 4;
          column-gap: 12px;
        }
        .masonry-grid .masonry-item {
          break-inside: avoid;
          margin-bottom: 12px;
        }
        @media(max-width:1100px){.masonry-grid{columns:3}}
        @media(max-width:720px){.masonry-grid{columns:2}}
        @media(max-width:400px){.masonry-grid{columns:1}}

        .img-card { cursor: pointer; }
        .img-card:hover .img-overlay { opacity: 1 !important; }
        .img-card:hover img { transform: scale(1.04); }
        img { transition: transform 0.4s ease; }
      `}</style>

      <div style={{ minHeight: "100vh", background: G.ink, position: "relative", overflow: "hidden" }}>
        {/* ambient */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", right: "5%", width: 500, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${G.green}06,transparent 70%)`, animation: "ambientPulse 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}03 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,${G.green}03 80px)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: "2.5rem" }}>
            <div>
              <SectionLabel>Festival memories</SectionLabel>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300, color: G.text, lineHeight: 1.05 }}>
                My <em style={{ fontStyle: "italic", color: G.greenPale }}>Gallery</em>
              </h1>
              <p style={{ color: G.muted, fontSize: "0.8rem", marginTop: 6 }}>{images.length} photo{images.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* View toggle */}
              <div style={{ display: "flex", gap: 0, border: `1px solid ${G.border}`, borderRadius: 100, overflow: "hidden" }}>
                {(["masonry", "grid"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    style={{ background: view === v ? `${G.green}20` : "transparent", border: "none", color: view === v ? G.greenPale : G.muted, padding: "8px 16px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "capitalize" }}>
                    {v}
                  </button>
                ))}
              </div>
              <a href="/customer-profile" style={{ border: `1px solid ${G.border}`, color: G.muted, borderRadius: 100, padding: "9px 18px", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em" }}>← Profile</a>
            </div>
          </motion.div>

          {/* EMPTY STATE */}
          {images.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "6rem 2rem", border: `1px solid ${G.border}`, borderRadius: 24, color: G.muted }}>
              <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.3 }}>📷</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: G.text, fontWeight: 300, marginBottom: 10 }}>
                No photos yet
              </p>
              <p style={{ fontSize: "0.9rem", color: G.muted, lineHeight: 1.7 }}>
                Your festival photographs will appear here<br />once they've been processed and uploaded.
              </p>
            </motion.div>
          )}

          {/* MASONRY */}
          {images.length > 0 && view === "masonry" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="masonry-grid">
              {images.map((url, i) => (
                <motion.div
                  key={url}
                  className="masonry-item img-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openLightbox(url)}
                  style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${G.border}`, position: "relative" }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", display: "block" }} />
                  <div className="img-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(4,13,8,0.75) 0%,transparent 50%)", opacity: 0, transition: "opacity .3s", display: "flex", alignItems: "flex-end", padding: "14px" }}>
                    <div style={{ display: "flex", gap: 8, width: "100%" }}>
                      <span style={{ flex: 1, background: "rgba(4,13,8,0.7)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "7px 10px", fontSize: 11, color: G.greenPale, textAlign: "center", backdropFilter: "blur(4px)" }}>
                        View
                      </span>
                      <a href={url} download target="_blank" onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, background: `${G.green}25`, border: `1px solid ${G.green}35`, borderRadius: 10, padding: "7px 10px", fontSize: 11, color: G.greenPale, textAlign: "center", textDecoration: "none", backdropFilter: "blur(4px)" }}>
                        Save
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* UNIFORM GRID */}
          {images.length > 0 && view === "grid" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {images.map((url, i) => (
                <motion.div
                  key={url}
                  className="img-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openLightbox(url)}
                  style={{ aspectRatio: "1", borderRadius: 18, overflow: "hidden", border: `1px solid ${G.border}`, position: "relative" }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div className="img-overlay" style={{ position: "absolute", inset: 0, background: "rgba(4,13,8,0.55)", opacity: 0, transition: "opacity .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", padding: 12 }}>
                    <span style={{ background: "rgba(4,13,8,0.7)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "7px 14px", fontSize: 12, color: G.greenPale }}>View</span>
                    <a href={url} download target="_blank" onClick={(e) => e.stopPropagation()}
                      style={{ background: `${G.green}25`, border: `1px solid ${G.green}35`, borderRadius: 10, padding: "7px 14px", fontSize: 12, color: G.greenPale, textDecoration: "none" }}>Save</a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* LIGHTBOX */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(4,13,8,0.96)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

              {/* close */}
              <button onClick={() => setLightbox(null)}
                style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "50%", width: 40, height: 40, color: G.muted, fontSize: 16, cursor: "pointer", fontFamily: "'Raleway',sans-serif" }}>✕</button>

              {/* counter */}
              <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(4,13,8,0.7)", border: `1px solid ${G.border}`, borderRadius: 100, padding: "6px 18px", fontSize: 11, color: G.muted, letterSpacing: "0.15em" }}>
                {lightboxIdx + 1} / {images.length}
              </div>

              {/* prev */}
              {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  style={{ position: "absolute", left: 20, background: "rgba(4,13,8,0.7)", border: `1px solid ${G.border}`, borderRadius: "50%", width: 46, height: 46, color: G.greenPale, fontSize: 18, cursor: "pointer", fontFamily: "'Raleway',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ‹
                </button>
              )}

              {/* image */}
              <motion.div
                key={lightbox}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "85vw", maxHeight: "82vh", position: "relative" }}>
                <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "82vh", objectFit: "contain", borderRadius: 18, border: `1px solid ${G.border}`, display: "block" }} />
                <a href={lightbox} download target="_blank"
                  style={{ position: "absolute", bottom: 14, right: 14, background: `${G.green}25`, border: `1px solid ${G.green}35`, borderRadius: 12, padding: "9px 18px", fontSize: 12, color: G.greenPale, textDecoration: "none", backdropFilter: "blur(8px)", fontWeight: 600 }}>
                  ↓ Download
                </a>
              </motion.div>

              {/* next */}
              {images.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  style={{ position: "absolute", right: 20, background: "rgba(4,13,8,0.7)", border: `1px solid ${G.border}`, borderRadius: "50%", width: 46, height: 46, color: G.greenPale, fontSize: 18, cursor: "pointer", fontFamily: "'Raleway',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ›
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
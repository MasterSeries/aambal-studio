import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/gallery-editor")({ 
  component: GalleryEditor 
});

// ── Light Glassmorphism Tokens ──
const G = {
  glassBg: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  darkBg: "rgba(20, 20, 22, 0.95)",
  textMain: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.5)",
  accentBlack: "#111111",
  success: "#10b981",
  danger: "#ef4444",
};

type MediaItem = {
  id?: string;
  type: "image" | "video";
  src: string;
  caption: string;
};

export default function GalleryEditor() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch from the exact collection your front-end uses
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "media_gallery"), (snap) => {
      const arr: MediaItem[] = [];
      snap.forEach((d) => {
        arr.push({ id: d.id, ...(d.data() as MediaItem) });
      });
      setItems(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Auto-detect type
      setMediaType(selected.type.startsWith("video/") ? "video" : "image");
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image or video to upload.");
    
    setIsUploading(true);
    try {
      // 1. Upload to Firebase Storage
      const fileRef = ref(storage, `media_gallery/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // 2. Save Document to Firestore Collection
      await addDoc(collection(db, "media_gallery"), {
        type: mediaType,
        src: url,
        caption: caption || "Festival Moment",
        createdAt: serverTimestamp()
      });

      // Reset Form
      setFile(null);
      setPreviewUrl(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Media successfully added to the live gallery!");

    } catch (err) {
      console.error(err);
      alert("Upload failed. Please check your network and Firebase Storage rules.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this item from the live gallery?")) {
      try {
        await deleteDoc(doc(db, "media_gallery", id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete item.");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: G.darkBg, color: G.textMain, fontFamily: "'Outfit', sans-serif", padding: "40px 20px" }}>
      
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <Link to="/admin" style={{ color: G.textMuted, textDecoration: "none", fontSize: 13, display: "inline-block", marginBottom: 8 }}>
              ← Back to Admin Dashboard
            </Link>
            <h1 style={{ fontSize: 36, fontWeight: 300, margin: 0 }}>Gallery Editor</h1>
            <p style={{ color: G.textMuted, fontSize: 14, marginTop: 4 }}>Manage the 4-column photo grid on your live website.</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 32 }}>
          
          {/* ── LEFT: UPLOAD FORM ── */}
          <div style={{ background: G.glassBg, border: `1px solid ${G.glassBorder}`, borderRadius: 24, padding: 24, height: "fit-content" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Upload New Media</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Media Preview Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", aspectRatio: "4/3", background: "rgba(0,0,0,0.3)", borderRadius: 16, border: `1px dashed ${G.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", position: "relative" }}
              >
                {previewUrl ? (
                  mediaType === "video" ? (
                    <video src={previewUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )
                ) : (
                  <div style={{ textAlign: "center", color: G.textMuted }}>
                    <p style={{ fontSize: 24, marginBottom: 8 }}>📁</p>
                    <p style={{ fontSize: 12, fontWeight: 500 }}>Click to browse files</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: "none" }} />

              {/* Caption Input */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>Display Caption</label>
                <input 
                  value={caption} 
                  onChange={(e) => setCaption(e.target.value)} 
                  placeholder="e.g. Main Stage Lighting"
                  style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${G.glassBorder}`, borderRadius: 12, padding: "12px 16px", color: G.textMain, fontSize: 14, outline: "none" }}
                />
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleUpload} 
                disabled={isUploading || !file}
                style={{ width: "100%", background: isUploading ? "rgba(255,255,255,0.2)" : "#ffffff", color: isUploading ? "#fff" : "#000", border: "none", borderRadius: 100, padding: "14px", fontWeight: 700, fontSize: 14, cursor: isUploading || !file ? "not-allowed" : "pointer", transition: "0.2s" }}
              >
                {isUploading ? "Uploading to Live Site..." : "Publish to Gallery"}
              </button>
            </div>
          </div>

          {/* ── RIGHT: LIVE GALLERY GRID ── */}
          <div style={{ background: G.glassBg, border: `1px solid ${G.glassBorder}`, borderRadius: 24, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Live Website Gallery</h3>
              <span style={{ background: "rgba(16,185,129,0.15)", color: G.success, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{items.length} ITEMS</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: G.textMuted }}>Loading gallery...</div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: G.textMuted, border: `1px dashed ${G.glassBorder}`, borderRadius: 16 }}>
                No media in your gallery yet. Upload your first image to the left!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${G.glassBorder}`, background: "#000", aspectRatio: "4/3" }}
                    >
                      {/* Delete Overlay Button */}
                      <button 
                        onClick={() => item.id && handleDelete(item.id)}
                        style={{ position: "absolute", top: 8, right: 8, zIndex: 10, background: G.danger, color: "white", border: "none", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>

                      {/* Media */}
                      {item.type === "image" ? (
                        <img src={item.src} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <video src={item.src} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}

                      {/* Caption Bar */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", padding: "20px 12px 12px 12px" }}>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "white" }}>{item.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
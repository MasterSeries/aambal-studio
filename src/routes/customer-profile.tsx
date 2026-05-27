import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "motion/react";

export const Route = createFileRoute("/customer-profile")({
  component: CustomerProfile,
});

const G = {
  green: "#4a9460", greenLight: "#6db87a", greenPale: "#a8e6b0",
  gold: "#c8a84a", goldLight: "#e8c97a",
  ink: "#040d08", ink2: "#071009", ink3: "#0d1f10",
  text: "#f0ede6", muted: "rgba(240,237,230,0.45)",
  border: "rgba(109,184,122,0.15)", error: "#e87a6a",
};

const PACKAGES = ["Festival Portrait", "Family & Group", "Bridal / Couple", "Full Day Coverage"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase", color: G.greenLight, opacity: 0.8, marginBottom: 6 }}>
      ✦ {children} ✦
    </p>
  );
}

function StatCard({ label, value, accent = G.greenPale }: { label: string; value: any; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${G.border}`, borderRadius: 18, padding: "1.2rem 1.4rem" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: G.muted, marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.6rem", fontWeight: 300, color: accent, lineHeight: 1, wordBreak: "break-word" }}>{value}</p>
    </motion.div>
  );
}

function InputField({ label, value, onChange, disabled = false, type = "text", multiline = false }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; type?: string; multiline?: boolean }) {
  const baseStyle: React.CSSProperties = {
    width: "100%", background: disabled ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${G.border}`, borderRadius: 14, padding: "12px 14px",
    color: disabled ? G.muted : G.text, fontSize: "0.88rem",
    fontFamily: "'Raleway',sans-serif", opacity: disabled ? 0.6 : 1,
  };
  return (
    <div>
      <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, opacity: 0.7, marginBottom: 6 }}>{label}</p>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(e) => onChange?.(e.target.value)}
          style={{ ...baseStyle, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} style={baseStyle} />
      )}
    </div>
  );
}

function CompletionItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: done ? G.greenPale : G.muted, padding: "6px 0", borderBottom: `1px solid ${G.border}` }}>
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: done ? `${G.green}25` : "transparent", border: `1px solid ${done ? G.green : G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: done ? G.greenLight : G.muted, flexShrink: 0 }}>
        {done ? "✓" : "·"}
      </span>
      {label}
    </div>
  );
}

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [favoritePackage, setFavoritePackage] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      setUid(user.uid);
      setName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "");
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const d = docSnap.data();
          setPhone(d.phone || ""); setAddress(d.address || "");
          setFavoritePackage(d.favoritePackage || ""); setPhotoURL(d.photoURL || user.photoURL || "");
        } else {
          await setDoc(doc(db, "users", user.uid), { name: user.displayName || "", email: user.email || "", phone: "", address: "", favoritePackage: "", photoURL: user.photoURL || "", createdAt: new Date() });
        }
        const bookingSnap = await getDocs(query(collection(db, "bookings"), where("email", "==", user.email)));
        setTotalBookings(bookingSnap.size);
        let c = 0; bookingSnap.forEach((d) => { if (d.data().status === "completed") c++; });
        setCompletedBookings(c);
        setGalleryCount(Math.floor(Math.random() * 120) + 20);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    });
    return () => unsub();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const storageRef = ref(storage, `profiles/${uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url });
    } catch (err) { console.error(err); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await setDoc(doc(db, "users", uid), { name, email, phone, address, favoritePackage, photoURL, updatedAt: new Date() }, { merge: true });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  const completionScore = [!!name, !!phone, !!address, !!favoritePackage, !!photoURL].filter(Boolean).length;
  const completionPct = Math.round((completionScore / 5) * 100);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: G.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "floatLotus 3s ease-in-out infinite" }}>🪷</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: G.greenPale, marginTop: 16 }}>Loading profile…</p>
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
        @keyframes shimmerGold{0%{background-position:200% 0}100%{background-position:-200% 0}}
        input:focus,select:focus,textarea:focus{outline:none;border-color:${G.green}!important;background:rgba(74,148,96,0.05)!important}
        input::placeholder,textarea::placeholder{color:rgba(240,237,230,0.18)}
        select option{background:${G.ink2};color:${G.text}}
      `}</style>

      <div style={{ minHeight: "100vh", background: G.ink, position: "relative", overflow: "hidden" }}>
        {/* ambient glows */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: 0, left: "20%", width: 600, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${G.green}06,transparent 65%)`, animation: "ambientPulse 7s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 350, borderRadius: "50%", background: `radial-gradient(circle,${G.gold}04,transparent 70%)`, animation: "ambientPulse 9s ease-in-out infinite 2s" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,${G.green}03 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,${G.green}03 80px)` }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

          {/* HERO BANNER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ background: `linear-gradient(135deg,${G.green}10,${G.gold}05,rgba(7,16,9,0.9))`, border: `1px solid ${G.border}`, borderRadius: 28, padding: "2.5rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 280, background: `radial-gradient(circle at top right,${G.green}10,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 110, height: 110, borderRadius: "50%", border: `2px solid ${G.green}35`, overflow: "hidden", background: `${G.green}15` }}>
                  {photoURL ? (
                    <img src={photoURL} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: "2rem", color: G.greenPale }}>
                      {name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <label style={{ position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${G.green},${G.greenLight})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, boxShadow: `0 4px 12px ${G.green}40` }}>
                  ✎
                  <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                </label>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <SectionLabel>Customer Profile</SectionLabel>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 300, color: G.text, lineHeight: 1.05 }}>
                  {name || <em style={{ fontStyle: "italic", color: G.muted }}>Add your name</em>}
                </h1>
                <p style={{ color: G.muted, fontSize: "0.82rem", marginTop: 6 }}>{email}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                  {[
                    { label: "My Bookings", href: "/customer-dashboard", accent: G.green },
                    { label: "Gallery", href: "/customer-gallery", accent: undefined },
                    { label: "History", href: "/customer-history", accent: undefined },
                    { label: "Home", href: "/", accent: undefined },
                  ].map(({ label, href, accent }) => (
                    <a key={href} href={href} style={{
                      background: accent ? `${accent}18` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${accent ? accent + "35" : G.border}`,
                      color: accent ? G.greenPale : G.muted, borderRadius: 100,
                      padding: "8px 16px", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.06em", fontWeight: 500,
                    }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: "2rem" }}>
            <StatCard label="Total bookings" value={totalBookings} />
            <StatCard label="Completed" value={completedBookings} accent={G.greenLight} />
            <StatCard label="Gallery photos" value={galleryCount} accent="#7ab8e8" />
            <StatCard label="Favorite package" value={favoritePackage || "—"} accent={G.gold} />
          </div>

          {/* MAIN GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>

            {/* PERSONAL DETAILS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: "rgba(7,16,9,0.8)", border: `1px solid ${G.border}`, borderRadius: 24, padding: "2rem", backdropFilter: "blur(14px)" }}>
              <SectionLabel>Personal Details</SectionLabel>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: G.text, marginBottom: 24 }}>
                Your <em style={{ fontStyle: "italic", color: G.greenPale }}>information</em>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InputField label="Full name" value={name} onChange={setName} />
                  <InputField label="Phone" value={phone} onChange={setPhone} />
                </div>
                <InputField label="Email" value={email} disabled />
                <InputField label="Address" value={address} onChange={setAddress} multiline />
                <div>
                  <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: G.greenPale, opacity: 0.7, marginBottom: 6 }}>Favorite Package</p>
                  <select value={favoritePackage} onChange={(e) => setFavoritePackage(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, borderRadius: 14, padding: "12px 14px", color: favoritePackage ? G.text : G.muted, fontSize: "0.88rem", fontFamily: "'Raleway',sans-serif", appearance: "none" }}>
                    <option value="">Select a package…</option>
                    {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <button onClick={saveProfile} disabled={saving}
                  style={{ background: `linear-gradient(135deg,${G.green},${G.greenLight})`, border: "none", borderRadius: 100, padding: "13px", color: "#fff", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.07em", cursor: "pointer", fontFamily: "'Raleway',sans-serif", boxShadow: `0 6px 24px ${G.green}35`, transition: "all .2s", marginTop: 4 }}>
                  {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Profile"}
                </button>
              </div>
            </motion.div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* COMPLETION */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: "rgba(7,16,9,0.8)", border: `1px solid ${G.border}`, borderRadius: 24, padding: "1.75rem", backdropFilter: "blur(14px)" }}>
                <SectionLabel>Profile health</SectionLabel>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 300, color: G.text, marginBottom: 18 }}>
                  Completion
                </h2>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "3rem", fontWeight: 300, color: completionPct === 100 ? G.greenLight : G.gold, lineHeight: 1 }}>{completionPct}</span>
                  <span style={{ color: G.muted, fontSize: 14 }}>%</span>
                </div>
                <div style={{ height: 4, background: G.border, borderRadius: 4, overflow: "hidden", marginBottom: 18 }}>
                  <div style={{ height: "100%", width: `${completionPct}%`, background: `linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <CompletionItem label="Full name" done={!!name} />
                  <CompletionItem label="Profile photo" done={!!photoURL} />
                  <CompletionItem label="Phone number" done={!!phone} />
                  <CompletionItem label="Address" done={!!address} />
                  <CompletionItem label="Favorite package" done={!!favoritePackage} />
                </div>
              </motion.div>

              {/* QUICK ACCESS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ background: "rgba(7,16,9,0.8)", border: `1px solid ${G.border}`, borderRadius: 24, padding: "1.75rem", backdropFilter: "blur(14px)" }}>
                <SectionLabel>Navigate</SectionLabel>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 300, color: G.text, marginBottom: 16 }}>
                  Quick access
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "My Bookings", href: "/customer-dashboard", icon: "📋" },
                    { label: "Booking History", href: "/customer-history", icon: "🕒" },
                    { label: "Photo Gallery", href: "/customer-gallery", icon: "📸" },
                    { label: "Book New Event", href: "/#book", icon: "🪷" },
                  ].map(({ label, href, icon }) => (
                    <a key={href} href={href}
                      style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`, borderRadius: 14, padding: "12px 16px", textDecoration: "none", color: G.text, fontSize: "0.88rem", fontWeight: 500, transition: "border-color .2s, background .2s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${G.green}40`; (e.currentTarget as HTMLElement).style.background = `${G.green}06`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = G.border; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      {label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
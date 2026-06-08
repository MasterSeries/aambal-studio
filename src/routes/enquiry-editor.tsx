// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/routes/enquiry-editor.tsx
// Shopify-style visual editor for the /enquiry page
// Route: /enquiry-editor   (link from admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/enquiry-editor")({
  component: EnquiryPageEditor,
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  color: string;
  tagline: string;
  duration: string;
  startingAt: string;
  desc: string;
  includes: string[];
  faqs: { q: string; a: string }[];
  visible: boolean;
}

interface DroneAddon {
  visible: boolean;
  icon: string;
  title: string;
  price: string;
  desc: string;
  color: string;
}

interface HeroSection {
  eyebrow: string;
  headlineTop: string;
  headlineGold: string;
  subtext: string;
}

interface FormSection {
  title: string;
  replyTimeText: string;
  whatsappNumber: string;
  whatsappLabel: string;
}

interface PageConfig {
  hero: HeroSection;
  form: FormSection;
  droneAddon: DroneAddon;
  services: ServiceCard[];
  seoTitle: string;
  seoDesc: string;
}

// ── Design tokens (dark studio theme) ────────────────────────────────────────
const T = {
  ink:    "#07070f",
  ink2:   "#0d0d1a",
  ink3:   "#12121f",
  panel:  "#0f0f1c",
  border: "rgba(255,255,255,0.07)",
  gold:   "#c8a84a",
  text:   "#f0ede6",
  muted:  "rgba(240,237,230,0.4)",
  green:  "#34d399",
  blue:   "#60a5fa",
  red:    "#f87171",
  cyan:   "#22d3ee",
};

// ── Default config ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: PageConfig = {
  seoTitle: "Book a Session · Studio Hut Photography",
  seoDesc: "Enquire and book a photography session at Studio Hut.",
  hero: {
    eyebrow: "Studio Hut Photography · Book a Session",
    headlineTop: "Let's create",
    headlineGold: "something beautiful.",
    subtext: "Choose your session type, tell us what you need, and we'll confirm within 24 hours with a personalised quote and shoot plan.",
  },
  form: {
    title: "Step 02 — Your details",
    replyTimeText: "We reply within 24 hours · No spam, ever",
    whatsappNumber: "919999999999",
    whatsappLabel: "Or message us on WhatsApp",
  },
  droneAddon: {
    visible: true,
    icon: "🚁",
    title: "Add Drone Aerial Coverage",
    price: "+ ₹6,500",
    desc: "DGCA-certified · 90 min · DJI Mavic 3 Pro · 4K ProRes",
    color: "#7dd3fc",
  },
  services: [
    {
      id: "portrait", icon: "📸", title: "Portrait Sessions", color: "#ff6b6b",
      tagline: "Solo, couple & family portraits", duration: "1–2 hours", startingAt: "₹3,999",
      desc: "Studio-lit portraits with seamless backdrops, ring lights and professional retouching.",
      includes: ["Professional studio lighting setup", "Choice of 3 backdrop colours", "Same-day 5 preview images", "Full edited gallery in 48 hrs", "Digital prints, high-resolution"],
      faqs: [{ q: "How many people can join?", a: "Up to 5 people." }, { q: "What should I wear?", a: "Solid colours work best." }],
      visible: true,
    },
    {
      id: "bridal", icon: "💍", title: "Bridal & Wedding", color: "#ffd93d",
      tagline: "Full-day wedding coverage", duration: "Full day (8–12 hrs)", startingAt: "₹24,999",
      desc: "Full-day bridal coverage from mehendi to reception, indoor & outdoor.",
      includes: ["2 professional photographers", "Mehendi to reception coverage", "Cinematic highlight reel (3–5 min)", "Same-day teaser reel before midnight", "500+ edited photos in 5 days"],
      faqs: [{ q: "Do you travel outside Kottayam?", a: "Yes — travel fees apply outside 50km." }, { q: "Is an advance required?", a: "30% advance confirms the date." }],
      visible: true,
    },
    {
      id: "graduation", icon: "🎓", title: "Graduation & Events", color: "#6bcb77",
      tagline: "Milestone moments, beautifully captured", duration: "2–6 hours", startingAt: "₹7,999",
      desc: "College convocations, corporate events, product launches, and milestone celebrations.",
      includes: ["Event coverage photographer", "Group & individual shots", "Product / stage photography", "Edited gallery in 48 hrs"],
      faqs: [{ q: "Can you handle large crowds?", a: "Yes — we cover 500+ attendee events." }],
      visible: true,
    },
    {
      id: "newborn", icon: "👶", title: "Newborn & Kids", color: "#4d96ff",
      tagline: "Gentle, warm studio sessions", duration: "2–3 hours", startingAt: "₹5,999",
      desc: "Gentle, safe newborn posing in our temperature-controlled warm studio.",
      includes: ["Temperature-controlled studio", "Certified safe posing techniques", "3 backdrop / wrap setups", "40+ edited images in 5 days"],
      faqs: [{ q: "When is the best time?", a: "Within the first 5–14 days." }],
      visible: true,
    },
    {
      id: "reels", icon: "🎬", title: "Reels & Short Films", color: "#c77dff",
      tagline: "Social-ready video content", duration: "Half day / Full day", startingAt: "₹9,999",
      desc: "Social-media reels, product videos and short films produced in-studio.",
      includes: ["Concept & storyboard session", "Studio + on-location options", "Professional lighting & gimbal", "Colour-graded edit with music"],
      faqs: [{ q: "Do you handle the script?", a: "Yes — pre-shoot creative brief included." }],
      visible: true,
    },
    {
      id: "corporate", icon: "🏢", title: "Corporate & Brand", color: "#f4a261",
      tagline: "LinkedIn headshots & brand identity", duration: "2–4 hours", startingAt: "₹6,999",
      desc: "LinkedIn headshots, brand identity shoots and catalogue photography.",
      includes: ["White / branded backdrop setup", "Headshots for up to 10 people", "Brand lifestyle photography", "Edited gallery in 48 hrs"],
      faqs: [{ q: "Can you come to our office?", a: "Yes — on-site sessions available." }],
      visible: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function EnquiryPageEditor() {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [activeServiceId, setActiveServiceId] = useState<string>("portrait");
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState("");
  const [unsaved, setUnsaved] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // Load from Firestore on mount
  useEffect(() => {
    getDoc(doc(db, "siteConfig", "enquiryPage")).then(snap => {
      if (snap.exists()) setConfig(snap.data() as PageConfig);
    });
  }, []);

  // Save to Firestore
  async function saveConfig() {
    setSaving(true);
    try {
      await setDoc(doc(db, "siteConfig", "enquiryPage"), { ...config, updatedAt: serverTimestamp() });
      setSaved(true);
      setUnsaved(false);
      showToast("✓ Changes saved & published");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      showToast("Save failed — check console");
    }
    setSaving(false);
  }

  function updateHero(key: keyof HeroSection, val: string) {
    setConfig(c => ({ ...c, hero: { ...c.hero, [key]: val } }));
    setUnsaved(true);
  }
  function updateForm(key: keyof FormSection, val: string) {
    setConfig(c => ({ ...c, form: { ...c.form, [key]: val } }));
    setUnsaved(true);
  }
  function updateDrone(key: keyof DroneAddon, val: any) {
    setConfig(c => ({ ...c, droneAddon: { ...c.droneAddon, [key]: val } }));
    setUnsaved(true);
  }
  function updateService(id: string, key: keyof ServiceCard, val: any) {
    setConfig(c => ({ ...c, services: c.services.map(s => s.id === id ? { ...s, [key]: val } : s) }));
    setUnsaved(true);
  }
  function updateServiceInclude(id: string, idx: number, val: string) {
    setConfig(c => ({
      ...c,
      services: c.services.map(s => {
        if (s.id !== id) return s;
        const inc = [...s.includes]; inc[idx] = val;
        return { ...s, includes: inc };
      }),
    }));
    setUnsaved(true);
  }
  function addInclude(id: string) {
    setConfig(c => ({ ...c, services: c.services.map(s => s.id === id ? { ...s, includes: [...s.includes, "New item"] } : s) }));
    setUnsaved(true);
  }
  function removeInclude(id: string, idx: number) {
    setConfig(c => ({ ...c, services: c.services.map(s => s.id === id ? { ...s, includes: s.includes.filter((_, i) => i !== idx) } : s) }));
    setUnsaved(true);
  }
  function updateFaq(serviceId: string, faqIdx: number, key: "q" | "a", val: string) {
    setConfig(c => ({
      ...c,
      services: c.services.map(s => {
        if (s.id !== serviceId) return s;
        const faqs = [...s.faqs]; faqs[faqIdx] = { ...faqs[faqIdx], [key]: val };
        return { ...s, faqs };
      }),
    }));
    setUnsaved(true);
  }
  function addFaq(serviceId: string) {
    setConfig(c => ({ ...c, services: c.services.map(s => s.id === serviceId ? { ...s, faqs: [...s.faqs, { q: "New question?", a: "New answer." }] } : s) }));
    setUnsaved(true);
  }
  function removeFaq(serviceId: string, idx: number) {
    setConfig(c => ({ ...c, services: c.services.map(s => s.id === serviceId ? { ...s, faqs: s.faqs.filter((_, i) => i !== idx) } : s) }));
    setUnsaved(true);
  }
  function resetToDefault() {
    if (!confirm("Reset all changes to default? This cannot be undone.")) return;
    setConfig(DEFAULT_CONFIG);
    setUnsaved(true);
    showToast("Reset to default — remember to save");
  }

  const activeService = config.services.find(s => s.id === activeServiceId)!;

  const NAV_SECTIONS = [
    { id: "hero",     label: "Hero banner",    icon: "🏠" },
    { id: "services", label: "Service cards",  icon: "📋" },
    { id: "drone",    label: "Drone add-on",   icon: "🚁" },
    { id: "form",     label: "Booking form",   icon: "📝" },
    { id: "seo",      label: "SEO & meta",     icon: "🔍" },
  ];

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;background:${T.ink};color:${T.text};font-family:'Raleway',system-ui,sans-serif}
        input,select,textarea{outline:none;color:${T.text};font-family:inherit;background:rgba(0,0,0,0.3);border:1px solid ${T.border};border-radius:8px;padding:9px 12px;font-size:13px;width:100%;resize:vertical;transition:border-color 0.15s}
        input:focus,select:focus,textarea:focus{border-color:${T.gold}60}
        input::placeholder,textarea::placeholder{color:${T.muted}}
        select option{background:#12121f;color:${T.text}}
        button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.gold}25;border-radius:3px}
        label{display:block;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${T.muted};margin-bottom:6px}
        .field{display:flex;flex-direction:column;gap:0;margin-bottom:16px}
        .section-card{background:rgba(255,255,255,0.025);border:1px solid ${T.border};border-radius:16px;padding:20px;margin-bottom:14px}
        .section-card h3{font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:${T.gold};margin-bottom:16px;opacity:0.85}
        .tag-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
        .tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid ${T.border};border-radius:6px;padding:5px 10px;font-size:12px;color:${T.text}}
        .tag button{background:none;border:none;color:${T.muted};font-size:14px;line-height:1;padding:0 0 0 4px;cursor:pointer;transition:color 0.15s}
        .tag button:hover{color:${T.red}}
        .toggle{position:relative;display:inline-flex;align-items:center;cursor:pointer;gap:8px;user-select:none}
        .toggle input{opacity:0;width:0;height:0;position:absolute}
        .toggle-track{width:36px;height:20px;background:rgba(255,255,255,0.1);border-radius:10px;position:relative;transition:background 0.2s;flex-shrink:0}
        .toggle input:checked~.toggle-track{background:${T.gold}}
        .toggle-thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;background:white;border-radius:50%;transition:transform 0.2s}
        .toggle input:checked~.toggle-track .toggle-thumb{transform:translateX(16px)}
        @keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh", overflow: "hidden" }}>

        {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
        <div style={{ background: T.panel, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

          {/* Sidebar header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Link to="/admin" style={{ fontSize: 11, color: T.muted, textDecoration: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px" }}>← Admin</Link>
            </div>
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: T.gold, opacity: 0.75, marginBottom: 4 }}>Page Editor</p>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", fontWeight: 500, color: T.text }}>Enquiry Page</h2>
          </div>

          {/* Nav */}
          <div style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: T.muted, padding: "0 8px", marginBottom: 6 }}>Sections</p>
            {NAV_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: activeSection === s.id ? `${T.gold}12` : "transparent", color: activeSection === s.id ? T.gold : T.muted, fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400, textAlign: "left", transition: "all 0.15s", marginBottom: 2 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}

            {/* Services sub-nav */}
            {activeSection === "services" && (
              <div style={{ marginTop: 6, paddingLeft: 8 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: T.muted, padding: "0 4px", marginBottom: 6 }}>Services</p>
                {config.services.map(s => (
                  <button key={s.id} onClick={() => setActiveServiceId(s.id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 8, border: "none", background: activeServiceId === s.id ? `${s.color}12` : "transparent", color: activeServiceId === s.id ? s.color : T.muted, fontSize: 12, textAlign: "left", transition: "all 0.15s", marginBottom: 2, opacity: s.visible ? 1 : 0.45 }}>
                    <span style={{ fontSize: 13 }}>{s.icon}</span>
                    {s.title}
                    {!s.visible && <span style={{ marginLeft: "auto", fontSize: 9, opacity: 0.5 }}>hidden</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save + preview */}
          <div style={{ padding: "12px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            {unsaved && <p style={{ fontSize: 10, color: T.gold, textAlign: "center", marginBottom: 8, opacity: 0.7, letterSpacing: "0.1em" }}>● Unsaved changes</p>}
            <button onClick={saveConfig} disabled={saving}
              style={{ width: "100%", background: saving ? `${T.gold}20` : `linear-gradient(135deg,${T.gold},#e8c97a)`, border: "none", color: saving ? T.gold : "#0a0a0a", borderRadius: 10, padding: "11px", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", marginBottom: 8, transition: "opacity 0.2s", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save & Publish"}
            </button>
            <a href="/enquiry" target="_blank" rel="noreferrer"
              style={{ display: "block", textAlign: "center", padding: "9px", borderRadius: 10, border: `1px solid ${T.border}`, color: T.muted, fontSize: 12, textDecoration: "none" }}>
              Preview live page ↗
            </a>
            <button onClick={resetToDefault}
              style={{ width: "100%", background: "transparent", border: "none", color: "rgba(248,113,113,0.4)", fontSize: 11, marginTop: 10, letterSpacing: "0.1em" }}>
              Reset to default
            </button>
          </div>
        </div>

        {/* ══ MAIN EDITOR AREA ═════════════════════════════════════════════════ */}
        <div style={{ overflowY: "auto", height: "100vh", padding: "28px 32px", background: T.ink }}>

          <AnimatePresence mode="wait">

            {/* ── HERO SECTION ── */}
            {activeSection === "hero" && (
              <motion.div key="hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SectionHeader title="Hero banner" desc="The large headline and intro text at the top of the page." />

                <div className="section-card">
                  <h3>Eyebrow text</h3>
                  <div className="field"><label>Small label above headline</label><input value={config.hero.eyebrow} onChange={e => updateHero("eyebrow", e.target.value)} /></div>
                </div>

                <div className="section-card">
                  <h3>Headline</h3>
                  <div className="field"><label>First line (white)</label><input value={config.hero.headlineTop} onChange={e => updateHero("headlineTop", e.target.value)} /></div>
                  <div className="field">
                    <label>Second line (gold gradient — this is the highlight text)</label>
                    <input value={config.hero.headlineGold} onChange={e => updateHero("headlineGold", e.target.value)} />
                    <PreviewBadge color={T.gold}>{config.hero.headlineGold}</PreviewBadge>
                  </div>
                </div>

                <div className="section-card">
                  <h3>Subtext paragraph</h3>
                  <div className="field"><label>Description below headline</label><textarea rows={3} value={config.hero.subtext} onChange={e => updateHero("subtext", e.target.value)} /></div>
                </div>
              </motion.div>
            )}

            {/* ── SERVICES SECTION ── */}
            {activeSection === "services" && activeService && (
              <motion.div key={`svc-${activeServiceId}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SectionHeader title={`${activeService.icon} ${activeService.title}`} desc="Edit this service card — icon, pricing, description, what's included, and FAQs." />

                {/* Visibility toggle */}
                <div className="section-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Show this service on the page</p>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Hidden services don't appear in the selector grid</p>
                  </div>
                  <ToggleSwitch checked={activeService.visible} onChange={v => updateService(activeServiceId, "visible", v)} />
                </div>

                <div className="section-card">
                  <h3>Card identity</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="field"><label>Emoji icon</label><input value={activeService.icon} onChange={e => updateService(activeServiceId, "icon", e.target.value)} /></div>
                    <div className="field"><label>Accent colour</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={activeService.color} onChange={e => updateService(activeServiceId, "color", e.target.value)}
                          style={{ width: 44, height: 36, padding: 2, borderRadius: 8, cursor: "pointer", background: "none" }} />
                        <input value={activeService.color} onChange={e => updateService(activeServiceId, "color", e.target.value)} style={{ flex: 1 }} />
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: activeService.color, flexShrink: 0 }} />
                      </div>
                    </div>
                    <div className="field"><label>Title</label><input value={activeService.title} onChange={e => updateService(activeServiceId, "title", e.target.value)} /></div>
                    <div className="field"><label>Tagline</label><input value={activeService.tagline} onChange={e => updateService(activeServiceId, "tagline", e.target.value)} /></div>
                  </div>
                </div>

                <div className="section-card">
                  <h3>Pricing & duration</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="field"><label>Starting at price</label><input value={activeService.startingAt} onChange={e => updateService(activeServiceId, "startingAt", e.target.value)} placeholder="₹3,999" /></div>
                    <div className="field"><label>Duration</label><input value={activeService.duration} onChange={e => updateService(activeServiceId, "duration", e.target.value)} placeholder="1–2 hours" /></div>
                  </div>
                </div>

                <div className="section-card">
                  <h3>Description</h3>
                  <div className="field"><label>Paragraph shown under the service title</label><textarea rows={3} value={activeService.desc} onChange={e => updateService(activeServiceId, "desc", e.target.value)} /></div>
                </div>

                <div className="section-card">
                  <h3>What's included</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>Each item appears as a bullet point in the expanded card view.</p>
                  {activeService.includes.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ color: activeService.color, fontSize: 14, flexShrink: 0 }}>✦</span>
                      <input value={item} onChange={e => updateServiceInclude(activeServiceId, i, e.target.value)} />
                      <button onClick={() => removeInclude(activeServiceId, i)}
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: T.red, borderRadius: 7, width: 32, height: 32, flexShrink: 0, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                  ))}
                  <button onClick={() => addInclude(activeServiceId)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: `${activeService.color}10`, border: `1px solid ${activeService.color}25`, color: activeService.color, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                    + Add item
                  </button>
                </div>

                <div className="section-card">
                  <h3>FAQs</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Shown as expandable accordion items at the bottom of the card.</p>
                  {activeService.faqs.map((faq, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, position: "relative" }}>
                      <button onClick={() => removeFaq(activeServiceId, i)}
                        style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: T.muted, fontSize: 14, cursor: "pointer" }}>✕</button>
                      <div className="field" style={{ marginBottom: 10 }}><label>Question</label><input value={faq.q} onChange={e => updateFaq(activeServiceId, i, "q", e.target.value)} /></div>
                      <div className="field" style={{ marginBottom: 0 }}><label>Answer</label><textarea rows={2} value={faq.a} onChange={e => updateFaq(activeServiceId, i, "a", e.target.value)} /></div>
                    </div>
                  ))}
                  <button onClick={() => addFaq(activeServiceId)}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                    + Add FAQ
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── DRONE ADDON ── */}
            {activeSection === "drone" && (
              <motion.div key="drone" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SectionHeader title="Drone add-on toggle" desc="The optional drone aerial add-on checkbox shown on the enquiry page." />

                <div className="section-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Show drone add-on on page</p>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Toggle off to hide the drone upsell completely</p>
                  </div>
                  <ToggleSwitch checked={config.droneAddon.visible} onChange={v => updateDrone("visible", v)} />
                </div>

                <div className="section-card">
                  <h3>Add-on content</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="field"><label>Icon (emoji)</label><input value={config.droneAddon.icon} onChange={e => updateDrone("icon", e.target.value)} /></div>
                    <div className="field"><label>Price label</label><input value={config.droneAddon.price} onChange={e => updateDrone("price", e.target.value)} placeholder="+ ₹6,500" /></div>
                    <div className="field" style={{ gridColumn: "span 2" }}><label>Title</label><input value={config.droneAddon.title} onChange={e => updateDrone("title", e.target.value)} /></div>
                    <div className="field" style={{ gridColumn: "span 2" }}><label>Description / specs line</label><input value={config.droneAddon.desc} onChange={e => updateDrone("desc", e.target.value)} /></div>
                    <div className="field">
                      <label>Accent colour</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={config.droneAddon.color} onChange={e => updateDrone("color", e.target.value)} style={{ width: 44, height: 36, padding: 2, borderRadius: 8, cursor: "pointer", background: "none" }} />
                        <input value={config.droneAddon.color} onChange={e => updateDrone("color", e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── BOOKING FORM ── */}
            {activeSection === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SectionHeader title="Booking form" desc="Text and settings for the sticky enquiry form on the right side of the page." />

                <div className="section-card">
                  <h3>Form labels</h3>
                  <div className="field"><label>Step label</label><input value={config.form.title} onChange={e => updateForm("title", e.target.value)} /></div>
                  <div className="field"><label>Footer micro-copy below submit button</label><input value={config.form.replyTimeText} onChange={e => updateForm("replyTimeText", e.target.value)} /></div>
                </div>

                <div className="section-card">
                  <h3>WhatsApp CTA</h3>
                  <div className="field"><label>WhatsApp number (digits only, with country code)</label><input value={config.form.whatsappNumber} onChange={e => updateForm("whatsappNumber", e.target.value)} placeholder="919999999999" /></div>
                  <div className="field"><label>Button label</label><input value={config.form.whatsappLabel} onChange={e => updateForm("whatsappLabel", e.target.value)} /></div>
                </div>
              </motion.div>
            )}

            {/* ── SEO ── */}
            {activeSection === "seo" && (
              <motion.div key="seo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <SectionHeader title="SEO & meta" desc="Page title and description shown in search engines and link previews." />

                <div className="section-card">
                  <h3>Search engine meta</h3>
                  <div className="field"><label>Page title (shown in browser tab & Google)</label><input value={config.seoTitle} onChange={e => { setConfig(c => ({ ...c, seoTitle: e.target.value })); setUnsaved(true); }} /></div>
                  <div className="field"><label>Meta description (shown in Google search results)</label><textarea rows={3} value={config.seoDesc} onChange={e => { setConfig(c => ({ ...c, seoDesc: e.target.value })); setUnsaved(true); }} /></div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", marginTop: 4 }}>
                    <p style={{ fontSize: 10, color: T.muted, marginBottom: 8, letterSpacing: "0.15em", textTransform: "uppercase" }}>Google preview</p>
                    <p style={{ fontSize: 14, color: "#4d96ff" }}>{config.seoTitle}</p>
                    <p style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.6 }}>{config.seoDesc}</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.ink3, border: `1px solid ${T.gold}35`, borderRadius: 100, padding: "12px 26px", fontSize: 13, color: T.gold, fontWeight: 600, letterSpacing: "0.06em", zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  const T_local = { gold: "#c8a84a", text: "#f0ede6", muted: "rgba(240,237,230,0.4)", border: "rgba(255,255,255,0.07)" };
  return (
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T_local.border}` }}>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", fontWeight: 500, color: T_local.text, marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 13, color: T_local.muted, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function PreviewBadge({ children, color }: { children: string; color: string }) {
  return (
    <span style={{ display: "inline-block", marginTop: 6, fontSize: 13, fontStyle: "italic", background: `linear-gradient(135deg,${color},#e8c97a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
      Preview: {children}
    </span>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
      <span style={{ fontSize: 12, color: checked ? "#c8a84a" : "rgba(240,237,230,0.4)", fontWeight: 600 }}>{checked ? "Visible" : "Hidden"}</span>
    </label>
  );
}
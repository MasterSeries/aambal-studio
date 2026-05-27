// src/routes/homestay-editor.tsx
// Shopify-style page editor — every section fully editable (text, image,
// color, background, buttons). Click any row in the left nav OR click directly
// on a section in the live-preview iframe to jump to its fields.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";



export const Route = createFileRoute("/homestay-editor")({
  component: HomestayEditor,
});

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE FIELD COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TextInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, rows = 3,
}: {
  label: string; value: string;
  onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <textarea
        className="field-input field-textarea"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="field-group">
      <div className="toggle-row">
        <span className="toggle-label">{label}</span>
        <div
          className={`toggle ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        >
          <div className="toggle-dot" />
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="color-row">
        <input
          type="color"
          className="color-swatch"
          value={value || "#4a9460"}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className="field-input"
          type="text"
          value={value || "#4a9460"}
          style={{ flex: 1 }}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function RangeField({
  label, value, onChange, min = 1, max = 100, unit = "",
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="range-row">
        <input
          type="range"
          className="range-input"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="range-val">{value}{unit}</span>
      </div>
    </div>
  );
}

function ImagePicker({
  label,
  value,
  onChange,

}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  
}) {

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

async function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>
) {

  const file =
    e.target.files?.[0];

  if (!file) return;

  setUploading(true);

  const reader =
    new FileReader();

  reader.onload = (event) => {

    const img =
      new Image();

    img.onload = () => {

      const canvas =
        document.createElement(
          "canvas"
        );

      const maxWidth = 800;

      const scale =
        maxWidth / img.width;

      canvas.width =
        maxWidth;

      canvas.height =
        img.height * scale;

      const ctx =
        canvas.getContext("2d");

      ctx?.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const compressed =
        canvas.toDataURL(
          "image/jpeg",
          0.5
        );

      onChange(compressed);

      setUploading(false);

    };

    img.src =
      event.target?.result as string;

  };

  reader.readAsDataURL(file);

}



  return (

    <div className="field-group">

      <label className="field-label">
        {label}
      </label>

      {value ? (

        <div className="img-preview-wrap">

          <img
            src={value}
            alt="Preview"
            className="img-preview-img"
          />

          <div className="img-preview-actions">

            <button
              type="button"
              className="img-action-btn"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              {uploading
                ? `Uploading ${progress}%`
                : "Change"}
            </button>

            <button
              type="button"
              className="img-action-btn danger"
              onClick={() =>
                onChange("")
              }
            >
              Remove
            </button>

          </div>

        </div>

      ) : (

        <div
          className="img-upload"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >

          <i
            className="ti ti-upload img-upload-icon"
            aria-hidden="true"
          />

          <div className="img-upload-text">
            {uploading
              ? `Uploading ${progress}%`
              : "Click to upload image"}
          </div>

          <div className="img-upload-hint">
            JPG, PNG, WebP
          </div>

        </div>

      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

    </div>

  );

}

  function SubHeading({ children }: { children: React.ReactNode }) {
  return <div className="sub-heading">{children}</div>;
}

function FieldDivider() {
  return <div className="divider" />;
}

function HintBadge({ children }: { children: React.ReactNode }) {
  return <div className="hint-badge">{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LIST
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "hero",         icon: "ti-photo",           label: "Hero" },
  { id: "strip",        icon: "ti-marquee",          label: "Inclusion strip" },
  { id: "about",        icon: "ti-building",         label: "About" },
  { id: "rooms",        icon: "ti-bed",              label: "Rooms" },
  { id: "amenities",    icon: "ti-sparkles",         label: "Amenities" },
  { id: "gallery",      icon: "ti-layout-grid",      label: "Gallery" },
  { id: "testimonials", icon: "ti-quote",            label: "Testimonials" },
  { id: "location",     icon: "ti-map-pin",          label: "Location" },
  { id: "cta",          icon: "ti-calendar",         label: "Reserve CTA" },
  { id: "footer",       icon: "ti-layout-bottombar", label: "Footer" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA  (written to Firestore on first load)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS: Record<string, any> = {
  // Hero
  heroEyebrow:   "The Aambal Retreat · Kottayam · Kerala",
  heroTitle:     "Where the festival\ncomes to rest.",
  heroSubtitle:  "A heritage garden villa, exclusively for our premium photography guests.",
  heroBg:        "#040d08",
  heroImage:     "",
  heroBtn1Text:  "View rooms",
  heroBtn1Color: "#4a9460",
  heroBtn2Text:  "Explore amenities →",
  heroBtn2Color: "transparent",
  // Strip
  stripVisible: true,
  stripBg:      "rgba(74,148,96,0.04)",
  stripSpeed:   "30",
  // About
  aboutTitle:  "A century lived in\nceremony & stillness.",
  aboutText:   "Built in 1924 by the Pillai family as a spice-trader's mansion, the Aambal Retreat has witnessed a century of Vasantham festivals from its verandas.\n\nToday seven rooms house photographers, families, and couples who want the festival not just as visitors — but as participants.",
  aboutAccent: "#a8e6b0",
  aboutImage:  "",
  // Rooms
  roomsLabel:   "Accommodation",
  roomsHeading: "Seven rooms, seven stories.",
  room1Name: "Lotus Suite",          room1Tagline: "Pond-facing · King bed",          room1Price: "₹8,500 / night", room1Icon: "🪷", room1Accent: "#4a9460", room1Image: "",
  room2Name: "Temple View Room",     room2Tagline: "Temple-facing · Queen bed",        room2Price: "₹6,500 / night", room2Icon: "🛕", room2Accent: "#c8a84a", room2Image: "",
  room3Name: "Garden Cottage",       room3Tagline: "Private garden · Twin or King",    room3Price: "₹5,500 / night", room3Icon: "🌿", room3Accent: "#6db87a", room3Image: "",
  room4Name: "Photographer's Studio",room4Tagline: "Edit suite · North light",         room4Price: "₹7,200 / night", room4Icon: "📸", room4Accent: "#a78bfa", room4Image: "",
  // Amenities
  amenitiesLabel:   "What awaits you",
  amenitiesHeading: "Every morning a\nsmall ceremony.",
  // Gallery
  galleryLabel:   "Gallery",
  galleryHeading: "The retreat in every light.",
  galleryImg1: "", galleryImg2: "", galleryImg3: "",
  // Testimonials
  testimonialLabel:   "Guest voices",
  testimonialHeading: "Heard at checkout.",
  t1Text: "We stayed two nights and I genuinely didn't want to leave. The lotus pond at 5am with mist rising — our photographer got a shot we'll frame forever.",
  t1Name: "Priya & Arun",             t1Pkg: "Bridal Package",
  t2Text: "All 12 of us stayed in three rooms. The breakfast alone was worth it. The hosts know every nuance of the festival schedule.",
  t2Name: "The Krishnamurthy Family", t2Pkg: "Full Day Coverage",
  t3Text: "As a solo traveller this felt completely safe and extraordinarily peaceful. The temple view room is magical at twilight.",
  t3Name: "Deepa Nair",               t3Pkg: "Full Day + Drone",
  // Location
  locationLabel:   "How to find us",
  locationHeading: "Ten minutes from\neverywhere that matters.",
  loc1Icon: "🛕", loc1Name: "Main temple tank",            loc1Dist: "800 m · 10 min walk",
  loc2Icon: "🚂", loc2Name: "Kottayam railway station",   loc2Dist: "4 km · 8 min drive",
  loc3Icon: "✈️", loc3Name: "Cochin International Airport",loc3Dist: "74 km · 90 min drive",
  loc4Icon: "🏥", loc4Name: "KIMS Hospital",              loc4Dist: "2 km · emergency",
  // CTA
  ctaTitle:    "Only Full Day & Bridal\nguests may book.",
  ctaBg:       "#040d08",
  ctaWAText:   "Reserve on WhatsApp",
  ctaWANumber: "919800000000",
  ctaBtn2Text: "Book photography package",
  ctaBtn2Link: "/?scroll=book",
  // Footer
  footerName:    "The Aambal Retreat",
  footerTagline: "Kottayam · Kerala · India · Est. 1924",
  footerEmail:   "hello@aambalstudio.in",
  footerPhone:   "+91 98xxx xxxxx",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION FIELDS — renders the correct fields for the active section
// ─────────────────────────────────────────────────────────────────────────────

// Replace the SectionFields function in homestay-editor.tsx with this complete version.
// All 10 sections are fully editable.

function SectionFields({
  section, data, onChange,
}: {
  section: string;
  data: Record<string, any>;
  onChange: (k: string, v: any) => void;
}) {
  const ch = (k: string) => (v: any) => onChange(k, v);

  // ── HERO ──────────────────────────────────────────────────────────────────
  if (section === "hero") return (
    <>
      <TextInput label="Eyebrow text" value={data.heroEyebrow || ""} onChange={ch("heroEyebrow")} />
      <TextArea label="Headline" value={data.heroTitle || ""} onChange={ch("heroTitle")} rows={3} />
      <TextArea label="Subheading" value={data.heroSubtitle || ""} onChange={ch("heroSubtitle")} rows={3} />
      <ColorField label="Background color" value={data.heroBg || "#040d08"} onChange={ch("heroBg")} />
      <ImagePicker label="Background image" value={data.heroImage || ""} onChange={ch("heroImage")} />
      <FieldDivider />
      <SubHeading>Primary button</SubHeading>
      <TextInput label="Button text" value={data.heroBtn1Text || ""} onChange={ch("heroBtn1Text")} />
      <ColorField label="Button color" value={data.heroBtn1Color || "#4a9460"} onChange={ch("heroBtn1Color")} />
      <SubHeading>Secondary button</SubHeading>
      <TextInput label="Button text" value={data.heroBtn2Text || ""} onChange={ch("heroBtn2Text")} />
      <ColorField label="Button color" value={data.heroBtn2Color || "transparent"} onChange={ch("heroBtn2Color")} />
    </>
  );

  // ── STRIP ─────────────────────────────────────────────────────────────────
  if (section === "strip") return (
    <>
      <Toggle label="Show section" checked={data.stripVisible ?? true} onChange={ch("stripVisible")} />
      <ColorField label="Background color" value={data.stripBg || "rgba(74,148,96,0.04)"} onChange={ch("stripBg")} />
      <RangeField label="Scroll speed" value={data.stripSpeed || "30"} onChange={ch("stripSpeed")} min={10} max={60} unit="s" />
      <FieldDivider />
      <SubHeading>Inclusion items (shown in marquee)</SubHeading>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: "0 0 44px" }}>
            <TextInput label={`Icon ${i}`} value={data[`stripIcon${i}`] || ""} onChange={ch(`stripIcon${i}`)} />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput label={`Label ${i}`} value={data[`stripLabel${i}`] || ""} onChange={ch(`stripLabel${i}`)} />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput label={`Note ${i}`} value={data[`stripNote${i}`] || ""} onChange={ch(`stripNote${i}`)} />
          </div>
        </div>
      ))}
    </>
  );

  // ── ABOUT ─────────────────────────────────────────────────────────────────
  if (section === "about") return (
    <>
      <TextInput label="Eyebrow label" value={data.aboutLabel || ""} onChange={ch("aboutLabel")} placeholder="About the Retreat" />
      <TextArea label="Section heading" value={data.aboutTitle || ""} onChange={ch("aboutTitle")} rows={3} />
      <TextArea label="Description text" value={data.aboutText || ""} onChange={ch("aboutText")} rows={6} />
      <ColorField label="Accent color" value={data.aboutAccent || "#a8e6b0"} onChange={ch("aboutAccent")} />
      <FieldDivider />
      <SubHeading>Image panels (3 cards)</SubHeading>
      {[1,2,3].map(i => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
          <TextInput label={`Card ${i} emoji`} value={data[`aboutCard${i}Icon`] || ""} onChange={ch(`aboutCard${i}Icon`)} placeholder="🌿" />
          <TextInput label={`Card ${i} label`} value={data[`aboutCard${i}Label`] || ""} onChange={ch(`aboutCard${i}Label`)} placeholder="Garden courtyard" />
          <ImagePicker label={`Card ${i} image`} value={data[`aboutCard${i}Image`] || ""} onChange={ch(`aboutCard${i}Image`)} />
          <FieldDivider />
        </div>
      ))}
    </>
  );

  // ── ROOMS ─────────────────────────────────────────────────────────────────
  if (section === "rooms") return (
    <>
      <TextInput label="Eyebrow label" value={data.roomsLabel || ""} onChange={ch("roomsLabel")} />
      <TextInput label="Main heading" value={data.roomsHeading || ""} onChange={ch("roomsHeading")} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FieldDivider />
          <SubHeading>Room {i} — {data[`room${i}Name`] || `Room ${i}`}</SubHeading>
          <TextInput label="Name" value={data[`room${i}Name`] || ""} onChange={ch(`room${i}Name`)} />
          <TextInput label="Tagline" value={data[`room${i}Tagline`] || ""} onChange={ch(`room${i}Tagline`)} />
          <TextInput label="Price" value={data[`room${i}Price`] || ""} onChange={ch(`room${i}Price`)} />
          <TextInput label="Size" value={data[`room${i}Size`] || ""} onChange={ch(`room${i}Size`)} placeholder="42 sqm" />
          <TextInput label="Icon (emoji)" value={data[`room${i}Icon`] || ""} onChange={ch(`room${i}Icon`)} />
          <TextInput label="Badge text" value={data[`room${i}Badge`] || ""} onChange={ch(`room${i}Badge`)} placeholder="Most requested" />
          <ColorField label="Accent color" value={data[`room${i}Accent`] || "#4a9460"} onChange={ch(`room${i}Accent`)} />
          <ImagePicker label="Room photo" value={data[`room${i}Image`] || ""} onChange={ch(`room${i}Image`)} />
          <TextArea label="Features (one per line)" value={data[`room${i}Features`] || ""} onChange={ch(`room${i}Features`)} rows={4} />
        </div>
      ))}
    </>
  );

  // ── AMENITIES ─────────────────────────────────────────────────────────────
  if (section === "amenities") return (
    <>
      <TextInput label="Eyebrow label" value={data.amenitiesLabel || ""} onChange={ch("amenitiesLabel")} />
      <TextArea label="Main heading" value={data.amenitiesHeading || ""} onChange={ch("amenitiesHeading")} rows={3} />
      <ColorField label="Background glow color" value={data.amenitiesBg || "#071009"} onChange={ch("amenitiesBg")} />
      <FieldDivider />
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SubHeading>Amenity {i}</SubHeading>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: "0 0 52px" }}>
              <TextInput label="Icon" value={data[`am${i}Icon`] || ""} onChange={ch(`am${i}Icon`)} placeholder="🍃" />
            </div>
            <div style={{ flex: 1 }}>
              <TextInput label="Title" value={data[`am${i}Title`] || ""} onChange={ch(`am${i}Title`)} />
            </div>
          </div>
          <TextArea label="Description" value={data[`am${i}Desc`] || ""} onChange={ch(`am${i}Desc`)} rows={2} />
        </div>
      ))}
    </>
  );

  // ── GALLERY ───────────────────────────────────────────────────────────────
  if (section === "gallery") return (
    <>
      <TextInput label="Eyebrow label" value={data.galleryLabel || ""} onChange={ch("galleryLabel")} />
      <TextInput label="Main heading" value={data.galleryHeading || ""} onChange={ch("galleryHeading")} />
      <ColorField label="Background color" value={data.galleryBg || "#071009"} onChange={ch("galleryBg")} />
      <FieldDivider />
      {[1,2,3,4,5,6,7,8,9].map(i => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TextInput label={`Image ${i} label`} value={data[`galleryLabel${i}`] || ""} onChange={ch(`galleryLabel${i}`)} placeholder="Lotus pond" />
          <ImagePicker label={`Image ${i}`} value={data[`galleryImg${i}`] || ""} onChange={ch(`galleryImg${i}`)} />
        </div>
      ))}
    </>
  );

  // ── TESTIMONIALS ──────────────────────────────────────────────────────────
  if (section === "testimonials") return (
    <>
      <TextInput label="Eyebrow label" value={data.testimonialLabel || ""} onChange={ch("testimonialLabel")} />
      <TextInput label="Main heading" value={data.testimonialHeading || ""} onChange={ch("testimonialHeading")} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FieldDivider />
          <SubHeading>Review {i}</SubHeading>
          <TextArea label="Quote text" value={data[`t${i}Text`] || ""} onChange={ch(`t${i}Text`)} rows={4} />
          <TextInput label="Guest name" value={data[`t${i}Name`] || ""} onChange={ch(`t${i}Name`)} />
          <TextInput label="Package" value={data[`t${i}Pkg`] || ""} onChange={ch(`t${i}Pkg`)} />
          <div className="field-group">
            <label className="field-label">Stars</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  onClick={() => onChange(`t${i}Stars`, n)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: n <= (data[`t${i}Stars`] || 5) ? "#c8a84a" : "rgba(255,255,255,0.2)", padding: 0 }}>
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );

  // ── LOCATION ──────────────────────────────────────────────────────────────
  if (section === "location") return (
    <>
      <TextInput label="Eyebrow label" value={data.locationLabel || ""} onChange={ch("locationLabel")} />
      <TextArea label="Main heading" value={data.locationHeading || ""} onChange={ch("locationHeading")} rows={3} />
      <ColorField label="Background color" value={data.locationBg || "#071009"} onChange={ch("locationBg")} />
      <FieldDivider />
      <SubHeading>Map embed</SubHeading>
      <TextArea label="Google Maps embed URL" value={data.locationMapUrl || ""} onChange={ch("locationMapUrl")} rows={2} />
      <HintBadge>Paste the src URL from Google Maps → Share → Embed a map</HintBadge>
      <FieldDivider />
      <SubHeading>Nearby locations</SubHeading>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SubHeading>Location {i}</SubHeading>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: "0 0 44px" }}>
              <TextInput label="Icon" value={data[`loc${i}Icon`] || ""} onChange={ch(`loc${i}Icon`)} />
            </div>
            <div style={{ flex: 1 }}>
              <TextInput label="Name" value={data[`loc${i}Name`] || ""} onChange={ch(`loc${i}Name`)} />
            </div>
          </div>
          <TextInput label="Distance / note" value={data[`loc${i}Dist`] || ""} onChange={ch(`loc${i}Dist`)} />
        </div>
      ))}
    </>
  );

  // ── CTA ───────────────────────────────────────────────────────────────────
  if (section === "cta") return (
    <>
      <TextArea label="Main heading" value={data.ctaTitle || ""} onChange={ch("ctaTitle")} rows={3} />
      <TextArea label="Body text" value={data.ctaBody || ""} onChange={ch("ctaBody")} rows={4} />
      <ColorField label="Background color" value={data.ctaBg || "#040d08"} onChange={ch("ctaBg")} />
      <FieldDivider />
      <SubHeading>Info cards (4 cards)</SubHeading>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: "0 0 44px" }}>
            <TextInput label={`Icon ${i}`} value={data[`ctaCard${i}Icon`] || ""} onChange={ch(`ctaCard${i}Icon`)} />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput label={`Label ${i}`} value={data[`ctaCard${i}Label`] || ""} onChange={ch(`ctaCard${i}Label`)} />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput label={`Note ${i}`} value={data[`ctaCard${i}Note`] || ""} onChange={ch(`ctaCard${i}Note`)} />
          </div>
        </div>
      ))}
      <FieldDivider />
      <SubHeading>WhatsApp button</SubHeading>
      <TextInput label="Button text" value={data.ctaWAText || ""} onChange={ch("ctaWAText")} />
      <TextInput label="WhatsApp number" value={data.ctaWANumber || ""} onChange={ch("ctaWANumber")} placeholder="91XXXXXXXXXX" />
      <SubHeading>Secondary button</SubHeading>
      <TextInput label="Button text" value={data.ctaBtn2Text || ""} onChange={ch("ctaBtn2Text")} />
      <TextInput label="Button link" value={data.ctaBtn2Link || ""} onChange={ch("ctaBtn2Link")} />
    </>
  );

  // ── FOOTER ────────────────────────────────────────────────────────────────
  if (section === "footer") return (
    <>
      <TextInput label="Property name" value={data.footerName || ""} onChange={ch("footerName")} />
      <TextInput label="Tagline / address" value={data.footerTagline || ""} onChange={ch("footerTagline")} />
      <TextInput label="Email" value={data.footerEmail || ""} onChange={ch("footerEmail")} />
      <TextInput label="Phone" value={data.footerPhone || ""} onChange={ch("footerPhone")} />
      <ColorField label="Background color" value={data.footerBg || "#040d08"} onChange={ch("footerBg")} />
      <ColorField label="Text color" value={data.footerTextColor || "#a8e6b0"} onChange={ch("footerTextColor")} />
      <FieldDivider />
      <TextInput label="Back link text" value={data.footerBackText || "← Back to Studio"} onChange={ch("footerBackText")} />
      <TextInput label="Back link URL" value={data.footerBackUrl || "/"} onChange={ch("footerBackUrl")} />
    </>
  );

  return null;
}
// ─────────────────────────────────────────────────────────────────────────────
// MAIN EDITOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function HomestayEditor() {
  const [data, setData]             = useState<Record<string, any> | null>(null);
  const [saving, setSaving]         = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [device, setDevice]         = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [toast, setToast]           = useState<string | null>(null);
  const [isDirty, setIsDirty]       = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Firebase bootstrap ───────────────────────────────────────────────────
  useEffect(() => {
    const ref = doc(db, "homestayContent", "main");
    (async () => {
      const snap = await getDoc(ref);
      if (!snap.exists()) await setDoc(ref, DEFAULTS);
    })();
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) { setData(snap.data()); setIsDirty(false); }
    });
    return () => unsub();
  }, []);

  // ── Field change ─────────────────────────────────────────────────────────
  const handleDataChange = useCallback(
  async (
    key: string,
    value: any
  ) => {

    if (!data) return;

    const updated = {
      ...data,
      [key]: value,
    };

    setData(updated);

    try {

      await setDoc(
        doc(
          db,
          "homestayContent",
          "main"
        ),
        updated
      );

      setIsDirty(true);

    } catch (err) {

      console.error(err);

    }

  },
  [data]
);

  // ── Save ─────────────────────────────────────────────────────────────────
  async function save() {
    if (!data) return;
    try {
      setSaving(true);
      await setDoc(doc(db, "homestayContent", "main"), data);
      setIsDirty(false);
      showToast("Changes saved ✓");
    } catch (err) {
      console.error(err);
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Discard ──────────────────────────────────────────────────────────────
  function discard() {
    setData({ ...DEFAULTS });
    setIsDirty(true);
    showToast("Reset to defaults");
  }

  // ── Two-way iframe <-> editor messaging ──────────────────────────────────
  useEffect(() => {
    // Tell the iframe which section to scroll to
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SCROLL_TO_SECTION", section: activeSection }, "*"
      );
    }
    // Listen for clicks inside the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SELECT_SECTION") {
        setActiveSection(event.data.section);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeSection]);

  if (!data) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#111213",
        color: "#8c9196", fontSize: 13,
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}>
        Loading editor…
      </div>
    );
  }

  const activeMeta = SECTIONS.find((s) => s.id === activeSection);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
      />
      <style>{EDITOR_CSS}</style>

      <div className="admin-shell">

        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sidebar-header">
            <Link
              to="/homestay"
              style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center" }}
            >
              <i
                className="ti ti-arrow-left"
                style={{ fontSize: 13, color: "var(--clr-muted)", cursor: "pointer" }}
                aria-hidden="true"
              />
            </Link>
            <div className="sidebar-logo">A</div>
            <div>
              <div className="sidebar-title">Aambal Retreat</div>
              <div className="sidebar-subtitle">Editing: /homestay</div>
            </div>
          </div>

          <div className="sections-label">Page sections</div>

          <div className="sections-list">
            {SECTIONS.map((sec) => (
              <div
                key={sec.id}
                className={`section-item ${activeSection === sec.id ? "active" : ""}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <i className="ti ti-drag-drop drag-handle" aria-hidden="true" />
                <i className={`ti ${sec.icon} sec-icon`} aria-hidden="true" />
                <span className="sec-label">{sec.label}</span>
                {activeSection === sec.id && <div className="sec-active-dot" />}
                <i className="ti ti-eye sec-eye" aria-hidden="true" />
              </div>
            ))}
            <div className="divider" style={{ margin: "8px 0" }} />
            <button className="add-section-btn">
              <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" />
              Add section
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="live-badge">
              <div className={`live-dot ${isDirty ? "dirty" : ""}`} />
              <span>{isDirty ? "Unsaved changes" : "Live · saved"}</span>
            </div>
          </div>
        </div>

        {/* ── EDITOR PANEL ── */}
        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">{activeMeta?.label}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="panel-action-btn">Duplicate</button>
              <button className="panel-action-btn danger">Remove</button>
            </div>
          </div>

          <div className="panel-body">
            <SectionFields
              section={activeSection}
              data={data}
              onChange={handleDataChange}
            />
          </div>

          <div className="panel-footer">
            <button className="btn-reset" onClick={discard}>Discard</button>
            <button
              className="btn-save"
              onClick={save}
              disabled={saving || !isDirty}
            >
              {saving ? "Saving…" : "Save section"}
            </button>
          </div>
        </div>

        {/* ── PREVIEW PANE ── */}
        <div className="preview-pane">
          <div className="preview-toolbar">
            <span className="preview-label">Preview</span>
            <div className="device-btns">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  className={`device-btn ${device === d ? "active" : ""}`}
                  onClick={() => setDevice(d)}
                  title={d}
                >
                  <i className={`ti ti-device-${d}`} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="preview-url">aambalvasantham.in/homestay</div>
            <div className="preview-actions">
              <button className="btn-preview-ext" title="Open in new tab">
                <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" />
              </button>
              <button
                className="btn-publish"
                onClick={() => showToast("Published to live site ✓")}
              >
                Publish
              </button>
            </div>
          </div>

          <div className="preview-frame">
            <div
              className="preview-inner"
              style={{
                maxWidth:
                  device === "mobile" ? 375
                  : device === "tablet" ? 768
                  : "100%",
                margin: device !== "desktop" ? "0 auto" : "0",
              }}
            >
              <iframe
                ref={iframeRef}
                src="/homestay"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  minHeight: "100vh",
                }}
                title="Storefront Preview"
              />
            </div>
          </div>
        </div>

      </div>

      <div className={`saved-toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const EDITOR_CSS = `
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    --clr-bg-primary:   #111213;
    --clr-bg-secondary: #1a1b1d;
    --clr-bg-tertiary:  #0d0e0f;
    --clr-bg-info:      rgba(74,148,96,0.12);

    --clr-border-primary:   #4a9460;
    --clr-border-secondary: rgba(255,255,255,0.10);
    --clr-border-tertiary:  rgba(255,255,255,0.05);
    --clr-border-info:      rgba(74,148,96,0.35);

    --clr-text-primary:   #e3e5e7;
    --clr-text-secondary: #8c9196;
    --clr-text-info:      #6db87a;
    --clr-text-danger:    #f85149;
    --clr-muted:          #8c9196;

    --clr-green:  #238636;
    --clr-green2: #2ea043;
    --clr-accent: #4a9460;

    --radius: 6px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-shell {
    display: grid;
    grid-template-columns: 240px 320px 1fr;
    height: 100vh;
    overflow: hidden;
    font-family: var(--font-sans);
    font-size: 13px;
    color: var(--clr-text-primary);
    background: var(--clr-bg-tertiary);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    background: var(--clr-bg-primary);
    border-right: 0.5px solid var(--clr-border-tertiary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sidebar-header {
    padding: 12px 14px;
    border-bottom: 0.5px solid var(--clr-border-tertiary);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .sidebar-logo {
    width: 26px; height: 26px;
    background: linear-gradient(135deg, #4a9460, #238636);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .sidebar-title   { font-size: 12px; font-weight: 600; color: var(--clr-text-primary); }
  .sidebar-subtitle{ font-size: 10px; color: var(--clr-text-secondary); margin-top: 1px; }

  .sections-label {
    padding: 10px 14px 4px;
    font-size: 10px; font-weight: 600;
    color: var(--clr-text-secondary);
    letter-spacing: .08em; text-transform: uppercase;
    flex-shrink: 0;
  }
  .sections-list {
    flex: 1; overflow-y: auto; padding: 4px 8px;
  }
  .sections-list::-webkit-scrollbar { width: 2px; }
  .sections-list::-webkit-scrollbar-thumb { background: var(--clr-border-secondary); border-radius: 2px; }

  .section-item {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 10px; border-radius: var(--radius); cursor: pointer;
    border: 0.5px solid transparent; margin-bottom: 2px;
    transition: background .12s, border-color .12s;
    user-select: none;
  }
  .section-item:hover { background: var(--clr-bg-secondary); }
  .section-item.active {
    background: var(--clr-bg-info);
    border-color: var(--clr-border-info);
  }
  .section-item.active .sec-label { color: var(--clr-text-info); }
  .section-item.active .sec-icon  { color: var(--clr-text-info); }

  .drag-handle { font-size: 14px; color: var(--clr-border-secondary); cursor: grab; }
  .sec-icon    { font-size: 14px; color: var(--clr-text-secondary); width: 18px; flex-shrink: 0; }
  .sec-label   { flex: 1; font-size: 12px; font-weight: 500; color: var(--clr-text-primary); }
  .sec-active-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--clr-accent); flex-shrink: 0; }
  .sec-eye     { font-size: 12px; color: var(--clr-text-secondary); opacity: 0; transition: opacity .15s; }
  .section-item:hover .sec-eye { opacity: 1; }

  .add-section-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 10px; border-radius: var(--radius);
    border: 0.5px dashed var(--clr-border-secondary);
    background: none; width: 100%;
    color: var(--clr-text-secondary); font-size: 11px; cursor: pointer;
    transition: background .12s;
    font-family: var(--font-sans);
  }
  .add-section-btn:hover { background: var(--clr-bg-secondary); color: var(--clr-text-primary); }

  .sidebar-footer {
    padding: 10px 12px;
    border-top: 0.5px solid var(--clr-border-tertiary);
    flex-shrink: 0;
  }
  .live-badge {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; background: var(--clr-bg-secondary);
    border-radius: var(--radius);
    font-size: 11px; color: var(--clr-text-secondary);
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #3fb950; flex-shrink: 0;
    box-shadow: 0 0 6px #3fb95060;
    transition: background .3s;
  }
  .live-dot.dirty { background: #e3b341; box-shadow: 0 0 6px #e3b34160; }

  /* ── EDITOR PANEL ── */
  .editor-panel {
    background: var(--clr-bg-primary);
    border-right: 0.5px solid var(--clr-border-tertiary);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .panel-header {
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--clr-border-tertiary);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .panel-title { font-size: 13px; font-weight: 600; color: var(--clr-text-primary); }
  .panel-action-btn {
    padding: 3px 8px; font-size: 10px;
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    background: none; cursor: pointer; color: var(--clr-text-secondary);
    transition: background .12s, color .12s; font-family: var(--font-sans);
  }
  .panel-action-btn:hover { background: var(--clr-bg-secondary); color: var(--clr-text-primary); }
  .panel-action-btn.danger { color: var(--clr-text-danger); }
  .panel-action-btn.danger:hover { background: rgba(248,81,73,.08); }

  .panel-body {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .panel-body::-webkit-scrollbar { width: 2px; }
  .panel-body::-webkit-scrollbar-thumb { background: var(--clr-border-secondary); }

  .panel-footer {
    padding: 12px 16px;
    border-top: 0.5px solid var(--clr-border-tertiary);
    display: flex; gap: 8px; flex-shrink: 0;
  }
  .btn-reset {
    padding: 7px 12px; font-size: 12px;
    color: var(--clr-text-secondary); background: none;
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    cursor: pointer; transition: background .12s; font-family: var(--font-sans);
  }
  .btn-reset:hover { background: var(--clr-bg-secondary); }
  .btn-save {
    flex: 1; padding: 8px; font-size: 12px; font-weight: 600;
    background: var(--clr-green); border: none; border-radius: var(--radius);
    color: #fff; cursor: pointer; transition: background .15s; font-family: var(--font-sans);
  }
  .btn-save:hover:not(:disabled) { background: var(--clr-green2); }
  .btn-save:disabled {
    background: var(--clr-bg-secondary);
    color: var(--clr-text-secondary); cursor: not-allowed;
  }

  /* ── FIELD TYPES ── */
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 10px; font-weight: 600; color: var(--clr-text-secondary);
    text-transform: uppercase; letter-spacing: .07em;
  }
  .field-input {
    font-size: 12px; padding: 7px 9px;
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    background: var(--clr-bg-secondary); color: var(--clr-text-primary);
    width: 100%; font-family: var(--font-sans);
    resize: none; outline: none;
    transition: border-color .15s;
  }
  .field-input:focus { border-color: var(--clr-border-primary); }
  .field-textarea { min-height: 72px; line-height: 1.55; }

  .color-row { display: flex; gap: 7px; align-items: center; }
  .color-swatch {
    width: 32px; height: 32px; border-radius: var(--radius);
    border: 0.5px solid var(--clr-border-secondary); cursor: pointer;
    padding: 2px; background: none; flex-shrink: 0;
  }
  .color-swatch::-webkit-color-swatch-wrapper { padding: 0; border-radius: 4px; }
  .color-swatch::-webkit-color-swatch { border: none; border-radius: 4px; }

  .range-row { display: flex; gap: 10px; align-items: center; }
  .range-input { flex: 1; cursor: pointer; accent-color: var(--clr-accent); }
  .range-val { font-size: 11px; color: var(--clr-text-secondary); width: 34px; text-align: right; flex-shrink: 0; }

  .img-preview-wrap {
    border: 0.5px solid var(--clr-border-secondary);
    border-radius: var(--radius); overflow: hidden;
    background: var(--clr-bg-secondary);
  }
  .img-preview-img { width: 100%; height: 110px; object-fit: cover; display: block; }
  .img-preview-actions { display: flex; border-top: 0.5px solid var(--clr-border-secondary); }
  .img-action-btn {
    flex: 1; padding: 7px; background: transparent; border: none;
    color: var(--clr-text-primary); cursor: pointer; font-size: 11px;
    transition: background .12s; font-family: var(--font-sans);
  }
  .img-action-btn:hover { background: var(--clr-bg-primary); }
  .img-action-btn.danger { color: var(--clr-text-danger); }
  .img-action-btn + .img-action-btn { border-left: 0.5px solid var(--clr-border-secondary); }

  .img-upload {
    border: 1px dashed var(--clr-border-secondary); border-radius: var(--radius);
    padding: 18px 10px; text-align: center; cursor: pointer;
    background: var(--clr-bg-secondary); transition: border-color .2s;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .img-upload:hover { border-color: var(--clr-border-primary); }
  .img-upload-icon { font-size: 20px; color: var(--clr-text-secondary); }
  .img-upload-text { font-size: 11px; color: var(--clr-text-secondary); }
  .img-upload-hint { font-size: 10px; color: var(--clr-border-secondary); }

  .toggle-row { display: flex; align-items: center; justify-content: space-between; }
  .toggle-label { font-size: 12px; color: var(--clr-text-primary); }
  .toggle {
    width: 36px; height: 20px; border-radius: 10px;
    background: var(--clr-bg-secondary);
    border: 0.5px solid var(--clr-border-secondary);
    cursor: pointer; position: relative;
    transition: background .2s, border-color .2s; flex-shrink: 0;
  }
  .toggle.on { background: #1D9E75; border-color: #0F6E56; }
  .toggle-dot {
    width: 14px; height: 14px; border-radius: 50%; background: #fff;
    position: absolute; top: 2px; left: 3px;
    transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.25);
  }
  .toggle.on .toggle-dot { left: 19px; }

  .sub-heading {
    font-size: 10px; font-weight: 600; color: var(--clr-text-secondary);
    text-transform: uppercase; letter-spacing: .07em;
    padding: 4px 0; border-bottom: 0.5px solid var(--clr-border-tertiary);
    margin-top: 4px;
  }
  .divider { height: 0.5px; background: var(--clr-border-tertiary); }
  .hint-badge {
    font-size: 10px; color: var(--clr-text-info);
    background: var(--clr-bg-info);
    border: 0.5px solid var(--clr-border-info);
    border-radius: var(--radius); padding: 6px 9px; line-height: 1.5;
  }

  /* ── PREVIEW PANE ── */
  .preview-pane {
    display: flex; flex-direction: column; overflow: hidden;
  }
  .preview-toolbar {
    padding: 10px 14px;
    border-bottom: 0.5px solid var(--clr-border-tertiary);
    background: var(--clr-bg-primary);
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .preview-label {
    font-size: 10px; font-weight: 600; color: var(--clr-text-secondary);
    text-transform: uppercase; letter-spacing: .07em;
  }
  .device-btns { display: flex; gap: 3px; }
  .device-btn {
    padding: 4px 9px; font-size: 12px;
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    background: none; cursor: pointer; color: var(--clr-text-secondary);
    transition: background .12s, color .12s;
  }
  .device-btn.active {
    background: var(--clr-bg-secondary);
    color: var(--clr-text-primary);
    border-color: var(--clr-border-primary);
  }
  .preview-url {
    flex: 1; background: var(--clr-bg-secondary);
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    padding: 5px 10px; font-size: 11px; color: var(--clr-text-secondary);
    font-family: var(--font-mono);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .preview-actions { display: flex; gap: 6px; }
  .btn-publish {
    padding: 5px 14px; font-size: 11px; font-weight: 600;
    background: var(--clr-accent); border: none; border-radius: var(--radius);
    color: #fff; cursor: pointer; transition: background .15s; font-family: var(--font-sans);
  }
  .btn-publish:hover { background: var(--clr-green2); }
  .btn-preview-ext {
    padding: 5px 9px; font-size: 11px;
    border: 0.5px solid var(--clr-border-secondary); border-radius: var(--radius);
    background: none; cursor: pointer; color: var(--clr-text-secondary);
    transition: background .12s;
  }
  .btn-preview-ext:hover { background: var(--clr-bg-secondary); }

  .preview-frame {
    flex: 1; overflow-y: auto; background: #040d08;
    display: flex; justify-content: center;
  }
  .preview-inner {
    width: 100%; overflow: hidden;
    transition: max-width .3s ease;
    display: flex; flex-direction: column;
  }

  /* ── TOAST ── */
  .saved-toast {
    position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
    background: #1D9E75; color: #fff; font-size: 11px; font-weight: 500;
    padding: 7px 18px; border-radius: 100px;
    opacity: 0; pointer-events: none; transition: opacity .3s;
    z-index: 9999; white-space: nowrap; font-family: var(--font-sans);
  }
  .saved-toast.show { opacity: 1; }
`;
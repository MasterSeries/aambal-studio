import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
const storage = getStorage();
export const Route = createFileRoute("/hero-editor")({
  component: HeroEditorPage,
});

const DEFAULT_DATA = {
  leftTitle: "STUDIO HUT",
  leftSubtitle: "Find Your Signature Memory",
  leftDescription: "Explore curated photography styles designed around timeless interior and festival lighting.",
  leftPreviewMedia: "",
  styles: [
    { id: 'cinematic', name: 'Cinematic Depth', subtitle: '24 Packages', media: [] },
  ]
};

function HeroEditorPage() {
    const uploadMedia = async (
  file: File,
  styleIdx: number,
  mediaIdx: number
) => {
  try {
    const fileRef = ref(
      storage,
      `hero-media/${Date.now()}-${file.name}`
    );

    await uploadBytes(fileRef, file);

    const downloadURL = await getDownloadURL(fileRef);

    updateMedia(styleIdx, mediaIdx, "url", downloadURL);

    if (file.type.startsWith("video")) {
      updateMedia(styleIdx, mediaIdx, "type", "video");
    } else {
      updateMedia(styleIdx, mediaIdx, "type", "image");
    }
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};
  const [data, setData] = useState<any>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const docRef = doc(db, "heroContent", "main");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setData(snap.data());
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "heroContent", "main"), data);
      alert("Hero content saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Error saving data.");
    }
    setSaving(false);
  };

  const updateGlobal = (key: string, value: string) => {
    setData({ ...data, [key]: value });
  };

  const addStyle = () => {
    const newStyle = { id: Date.now().toString(), name: "New Style", subtitle: "Details", media: [] };
    setData({ ...data, styles: [...data.styles, newStyle] });
    setActiveTab(data.styles.length);
  };

  const removeStyle = (idx: number) => {
    const newStyles = [...data.styles];
    newStyles.splice(idx, 1);
    setData({ ...data, styles: newStyles });
    setActiveTab(null);
  };

  const updateStyle = (idx: number, key: string, value: any) => {
    const newStyles = [...data.styles];
    newStyles[idx][key] = value;
    setData({ ...data, styles: newStyles });
  };

  const addMediaToStyle = (idx: number) => {
    const newStyles = [...data.styles];
    newStyles[idx].media.push({ type: 'image', url: '' });
    setData({ ...data, styles: newStyles });
  };
const handleLocalFile = (
  file: File,
  styleIdx: number,
  mediaIdx: number
) => {
  const localUrl = URL.createObjectURL(file);

  const newStyles = [...data.styles];

  newStyles[styleIdx].media[mediaIdx] = {
    ...newStyles[styleIdx].media[mediaIdx],
    url: localUrl,
    type: file.type.startsWith("video")
      ? "video"
      : "image",
  };

  setData({
    ...data,
    styles: newStyles,
  });
};
  const updateMedia = (styleIdx: number, mediaIdx: number, key: string, value: string) => {
    const newStyles = [...data.styles];
    newStyles[styleIdx].media[mediaIdx][key] = value;
    setData({ ...data, styles: newStyles });
  };

  const removeMedia = (styleIdx: number, mediaIdx: number) => {
    const newStyles = [...data.styles];
    newStyles[styleIdx].media.splice(mediaIdx, 1);
    setData({ ...data, styles: newStyles });
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-slate-900 font-sans flex">
      {/* ── SIDEBAR (BLOCKS & SETTINGS) ── */}
      <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col shadow-sm relative z-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <h1 className="font-bold text-lg">Hero Editor</h1>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Global Settings</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-semibold mb-1 block">Left Title</label>
              <input value={data.leftTitle} onChange={e => updateGlobal("leftTitle", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Left Subtitle</label>
              <input value={data.leftSubtitle} onChange={e => updateGlobal("leftSubtitle", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Left Description</label>
              <textarea value={data.leftDescription} onChange={e => updateGlobal("leftDescription", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-purple-400 outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Left Preview Image URL</label>
              <input value={data.leftPreviewMedia} onChange={e => updateGlobal("leftPreviewMedia", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-purple-400 outline-none" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Photo Styles (Blocks)</h2>
            <button onClick={addStyle} className="text-purple-600 hover:bg-purple-50 p-1 rounded transition">+</button>
          </div>
          
          <div className="space-y-2">
            {data.styles.map((style: any, idx: number) => (
              <div 
                key={style.id} 
                onClick={() => setActiveTab(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${activeTab === idx ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}`}
              >
                <div>
                  <p className="text-sm font-bold text-gray-800">{style.name}</p>
                  <p className="text-xs text-gray-400">{style.media?.length || 0} media items</p>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN EDIT AREA ── */}
      <div className="flex-1 overflow-y-auto p-12">
        {activeTab !== null && data.styles[activeTab] ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Edit Photo Style</h2>
              <button onClick={() => removeStyle(activeTab)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition">Remove Block</button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-500">Style Name</label>
                <input value={data.styles[activeTab].name} onChange={e => updateStyle(activeTab, 'name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block text-gray-500">Subtitle (Packages)</label>
                <input value={data.styles[activeTab].subtitle} onChange={e => updateStyle(activeTab, 'subtitle', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg">Slideshow Media</h3>
                <button onClick={() => addMediaToStyle(activeTab)} className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg text-xs font-bold transition">Add Media</button>
              </div>

              <div className="space-y-4">
                {data.styles[activeTab].media?.map((m: any, mIdx: number) => (
                  <div key={mIdx} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex gap-4 items-start">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-300">
                      {m.url ? (
                        m.type === 'video' ? <video
  src={m.url}
  className="w-full h-full object-cover"
  autoPlay
  muted
  loop
  playsInline
/> : <img src={m.url} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">No Media</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input type="radio" checked={m.type === 'image'} onChange={() => updateMedia(activeTab, mIdx, 'type', 'image')} className="text-purple-600 accent-purple-600" /> Image
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input type="radio" checked={m.type === 'video'} onChange={() => updateMedia(activeTab, mIdx, 'type', 'video')} className="text-purple-600 accent-purple-600" /> Video
                        </label>
                      </div>
                      <div className="space-y-2">
  <input
    type="file"
    accept="image/*,video/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadMedia(file, activeTab, mIdx);
      }
    }}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
  />

  <div className="space-y-2">
  <input
    type="file"
    accept="image/*,video/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        handleLocalFile(
          file,
          activeTab,
          mIdx
        );
      }
    }}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
  />

  <input
    placeholder="Or paste URL..."
    value={m.url}
    onChange={(e) =>
      updateMedia(
        activeTab,
        mIdx,
        "url",
        e.target.value
      )
    }
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
  />
</div>
</div>
                    </div>
                    <button onClick={() => removeMedia(activeTab, mIdx)} className="text-gray-400 hover:text-red-500 transition p-2">✕</button>
                  </div>
                ))}
                
                {data.styles[activeTab].media?.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    No media added yet. Add media to create a slideshow.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a block from the sidebar to edit
          </div>
        )}
      </div>
    </div>
  );
}// ... (keep all your existing imports)

// ── EXACT PREVIEW COMPONENT ──
// This uses the same classes and structure as your live BentoDashboardUI
function HeroPreview({ data }: { data: any }) {
  return (
    <div className="w-full h-full p-8 flex items-center justify-center scale-[0.65] origin-center">
      {/* Container matching your production BentoDashboardUI */}
      <div className="max-w-[1400px] w-full h-[700px] bg-[#121212]/80 backdrop-blur-3xl rounded-[40px] p-4 flex gap-4 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Left Column Preview */}
        <div className="w-[260px] h-full flex flex-col gap-4">
          <div className="bg-[#1c1c1e] rounded-[32px] p-6 flex flex-col flex-1 border border-white/5 shadow-inner">
            <h2 className="text-white font-display font-bold text-2xl">{data.leftTitle}</h2>
          </div>
          <div className="bg-white rounded-[32px] p-6 text-[#1c1c1e] shadow-xl">
            <h3 className="font-bold text-xl">{data.leftSubtitle}</h3>
            <p className="text-xs mt-3">{data.leftDescription}</p>
          </div>
        </div>

        {/* Center Viewer Preview */}
        <div className="flex-1 h-full bg-[#1c1c1e] rounded-[32px] relative overflow-hidden flex flex-col border border-white/5">
          {data.styles[0]?.media?.[0]?.url ? (
             <img src={data.styles[0].media[0].url} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-white/20">No Media</div>
          )}
          <h2 className="absolute bottom-20 left-10 text-white font-display text-7xl">{data.styles[0]?.name}</h2>
        </div>

        {/* Right Column Preview */}
        <div className="w-[320px] h-full bg-[#1c1c1e] rounded-[32px] p-6 border border-white/5">
           <h3 className="text-white mb-6">Photo Styles</h3>
           <div className="flex flex-col gap-2">
             {data.styles.map((style: any, i: number) => (
               <div key={i} className="bg-white/5 p-3 rounded-2xl flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-500"></div>
                 <span className="text-white text-sm">{style.name}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

// ... (keep the rest of your HeroEditorPage component logic)
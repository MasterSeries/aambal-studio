import { useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Image: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
};

export function GalleryUpload() {
  const [uid, setUid] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New state for storing the fetched customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Fetch unique customers from bookings on component mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const snap = await getDocs(collection(db, "bookings"));
        const uniqueMap = new Map();
        
        snap.forEach(doc => {
          const data = doc.data();
          // Use UID if available, fallback to email as the unique identifier
          const id = data.uid || data.userId || data.clientEmail || data.email;
          const name = data.clientName || data.name || "Unknown Client";
          const email = data.clientEmail || data.email || "No Email";

          if (id && !uniqueMap.has(id)) {
            uniqueMap.set(id, { uid: id, name, email });
          }
        });

        setCustomers(Array.from(uniqueMap.values()));
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    }
    fetchCustomers();
  }, []);

  async function uploadImages() {
    if (!files || !uid) {
      alert("Please select a customer and images to upload.");
      return;
    }

    try {
      setLoading(true);

      for (const file of Array.from(files)) {
        // Uploads to gallery folder using the selected UID/Email
        const imageRef = ref(storage, `gallery/${uid}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        await getDownloadURL(imageRef);
      }

      alert("Gallery uploaded successfully ✨");
      setUid("");
      setFiles(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[40px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icons.Upload />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Upload Gallery
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Client Media Delivery
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Select Customer Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
              Select Customer
            </label>
            <div className="relative">
              <select
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                disabled={loadingCustomers}
                className="w-full appearance-none rounded-2xl border border-white/50 bg-white/40 px-5 py-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  {loadingCustomers ? "Loading customers..." : "— Select a Customer —"}
                </option>
                {customers.map((c, idx) => (
                  <option key={idx} value={c.uid}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Icons.ChevronDown />
              </div>
            </div>
          </div>

          {/* Styled File Dropzone */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
              Media Files
            </label>
            <div className="relative border-2 border-dashed border-gray-300/80 rounded-[24px] p-10 flex flex-col items-center justify-center bg-white/20 hover:bg-white/60 transition-colors cursor-pointer group">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm group-hover:scale-110 group-hover:text-black transition-all">
                <Icons.Image />
              </div>
              
              <p className="text-sm font-bold text-gray-700">Drag & Drop images here</p>
              <p className="text-xs font-medium text-gray-500 mt-1">or click to browse files</p>
              
              {/* File Count Badge */}
              {files && files.length > 0 && (
                <div className="mt-6 px-4 py-2 bg-[#bdf0cc] text-[#111] rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={uploadImages}
            disabled={loading || !uid || !files}
            className="w-full rounded-2xl bg-black text-white px-6 py-4 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mt-4 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Deploy to Client"
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
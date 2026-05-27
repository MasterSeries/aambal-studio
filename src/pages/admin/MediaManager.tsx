import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable, // IMPORTANT: Use Resumable for large files
} from "firebase/storage";

import { storage, db } from "@/lib/firebase";

type MediaItem = {
  id?: string;
  type: "image" | "video";
  src: string;
  caption: string;
};

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Track upload progress
  const [caption, setCaption] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "media_gallery"), (snap) => {
      const arr: MediaItem[] = [];
      snap.forEach((d) => {
        arr.push({ id: d.id, ...(d.data() as MediaItem) });
      });
      setItems(arr);
    });
    return () => unsub();
  }, []);

  async function addMedia() {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    // Verify file type matches selection (Basic safety check)
    if (type === "video" && !file.type.startsWith("video/")) {
        alert("Please select a valid video file.");
        return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`;
      const fileRef = ref(storage, `media_gallery/${uniqueName}`);

      // Use uploadBytesResumable instead of uploadBytes
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate and update progress percentage
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(currentProgress));
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload failed:", error);
          alert(`Upload failed: ${error.message}`);
          setUploading(false);
          setProgress(0);
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await addDoc(collection(db, "media_gallery"), {
              type,
              src: downloadURL,
              caption: caption || "No caption provided",
              createdAt: new Date()
            });

            // Reset UI
            setFile(null);
            setCaption("");
            setType("image");
            setProgress(0);
          } catch (dbError) {
             console.error("Error saving to database:", dbError);
             alert("File uploaded, but failed to save record to database.");
          } finally {
             setUploading(false);
          }
        }
      );

    } catch (err) {
      console.error("Initialization failed:", err);
      alert("Failed to start upload.");
      setUploading(false);
    }
  }

  async function removeMedia(id?: string) {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "media_gallery", id));
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black mb-10">Media Gallery Manager</h1>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-12">
          <div className="grid gap-6 max-w-2xl">
            
            <div className="flex gap-4">
              {(["image", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-3 rounded-2xl border font-semibold transition-colors ${
                    type === t 
                      ? "bg-pink-500 border-pink-500 text-white" 
                      : "bg-black/30 border-white/10 text-white/50 hover:bg-white/5"
                  }`}
                >
                  {t === "image" ? "🖼️ Image" : "🎥 Video"}
                </button>
              ))}
            </div>

            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging 
                  ? "border-pink-500 bg-pink-500/10" 
                  : "border-white/10 bg-black/30 hover:border-pink-500/50"
              }`}
            >
              <input
                type="file"
                accept={type === "image" ? "image/*" : "video/*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              <div className="text-4xl mb-4 opacity-50">
                {file ? "✅" : "☁️"}
              </div>
              
              {file ? (
                <div className="text-center">
                  <p className="text-pink-400 font-bold text-lg">{file.name}</p>
                  <p className="text-white/40 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white/80 font-medium text-lg">Click to browse or drag file here</p>
                  <p className="text-white/40 text-sm mt-1">Supports {type === "image" ? "JPG, PNG, WebP" : "MP4, WebM"}</p>
                </div>
              )}
            </label>

            <input
              type="text"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="rounded-2xl bg-black/30 px-6 py-4 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder:text-white/30"
            />

            {/* Progress Bar Visualization */}
            {uploading && (
              <div className="w-full bg-white/10 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className="bg-pink-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            <button
              onClick={addMedia}
              disabled={uploading || !file}
              className="rounded-2xl bg-pink-500 py-4 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-400 transition-colors relative overflow-hidden"
            >
              <span className="relative z-10">
                 {uploading ? `Uploading... ${progress}%` : "Upload Media"}
              </span>
            </button>
          </div>
        </div>

        {/* ... Rest of the Gallery Grid code ... */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-black/50">
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={item.caption}
                  />
                ) : (
                  <video
                    src={item.src}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
                  {item.type}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="text-sm text-white/80 font-medium mb-4 flex-1 line-clamp-2">
                  {item.caption}
                </div>
                <button
                  onClick={() => removeMedia(item.id)}
                  className="w-full rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-3 text-sm font-bold transition-colors border border-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/40 border border-dashed border-white/10 rounded-3xl">
              No media items found. Upload something to get started.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
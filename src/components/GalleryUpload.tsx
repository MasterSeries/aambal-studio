import { useState } from "react";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  storage,
} from "@/lib/firebase";

export function GalleryUpload() {
  const [uid, setUid] =
    useState("");

  const [files, setFiles] =
    useState<FileList | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  async function uploadImages() {
    if (!files || !uid) {
      alert(
        "Select customer UID and images"
      );

      return;
    }

    try {
      setLoading(true);

      for (const file of Array.from(
        files
      )) {
        const imageRef = ref(
          storage,
          `gallery/${uid}/${Date.now()}-${file.name}`
        );

        await uploadBytes(
          imageRef,
          file
        );

        await getDownloadURL(
          imageRef
        );
      }

      alert(
        "Gallery uploaded successfully"
      );

      setUid("");

      setFiles(null);
    } catch (err) {
      console.error(err);

      alert(
        "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
      
      <h2 className="mb-8 text-3xl font-bold text-white">
        Upload Customer Gallery
      </h2>

      <div className="space-y-5">
        
        <input
          type="text"
          placeholder="Customer UID"
          value={uid}
          onChange={(e) =>
            setUid(
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
        />

        <input
          type="file"
          multiple
          onChange={(e) =>
            setFiles(
              e.target.files
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
        />

        <button
          onClick={uploadImages}
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 px-6 py-4 text-lg font-bold text-white"
        >
          {loading
            ? "Uploading..."
            : "Upload Gallery"}
        </button>
      </div>
    </div>
  );
}
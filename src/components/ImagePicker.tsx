// src/components/ImagePicker.tsx
// Drop-in replacement for the ImagePicker used in homestay-editor.tsx
// Uploads images to Firebase Storage and saves the download URL to Firestore.
// Usage: <ImagePicker label="Hero image" storageKey="hero/bg" value={data.heroImage} onChange={v => update("heroImage", v)} />

import { useRef, useState } from "react";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  storageKey: string; // e.g. "homestay/hero-bg"
}

export function ImagePicker({ label, value, onChange, storageKey }: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const storage = getStorage();
      const path = `homestay/${storageKey}-${Date.now()}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);

      task.on(
        "state_changed",
        (snap) => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (err) => {
          console.error(err);
          setError("Upload failed. Check Firebase Storage rules.");
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          onChange(url);
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
      setUploading(false);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      {value ? (
        <div className="img-preview-wrap">
          <img src={value} alt="Preview" className="img-preview-img" />
          <div className="img-preview-actions">
            <button
              className="img-action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? `Uploading ${progress}%` : "Change"}
            </button>
            <button
              className="img-action-btn danger"
              onClick={() => onChange("")}
              disabled={uploading}
            >
              Remove
            </button>
          </div>
          {uploading && (
            <div style={{
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: "0 0 6px 6px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "#4a9460",
                transition: "width 0.2s",
              }} />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`img-upload ${uploading ? "uploading" : ""}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{ cursor: uploading ? "wait" : "pointer" }}
        >
          {uploading ? (
            <>
              <div style={{ fontSize: 20, marginBottom: 4 }}>⏳</div>
              <div className="img-upload-text">Uploading… {progress}%</div>
              <div style={{
                width: "80%", height: 3, marginTop: 8,
                background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden",
              }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "#4a9460", transition: "width 0.2s" }} />
              </div>
            </>
          ) : (
            <>
              <i className="ti ti-cloud-upload img-upload-icon" aria-hidden="true" />
              <div className="img-upload-text">Click to upload</div>
              <div className="img-upload-hint">JPG, PNG, WebP · max 10 MB</div>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: "#f85149", marginTop: 4 }}>{error}</div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
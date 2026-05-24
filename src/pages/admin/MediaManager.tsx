import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type MediaItem = {
  id?: string;

  type: "image" | "video";

  src: string;

  caption: string;
};

export default function MediaManager() {

  const [items, setItems] =
    useState<MediaItem[]>([]);

  const [url, setUrl] =
    useState("");

  const [caption, setCaption] =
    useState("");

  const [type, setType] =
    useState<"image" | "video">(
      "image"
    );

  useEffect(() => {

    const unsub =
      onSnapshot(
        collection(
          db,
          "media_gallery"
        ),

        (snap) => {

          const arr: MediaItem[] =
            [];

          snap.forEach((d) => {

            arr.push({
              id: d.id,

              ...(d.data() as MediaItem),
            });

          });

          setItems(arr);

        }
      );

    return () => unsub();

  }, []);

  async function addMedia() {

    if (!url) return;

    await addDoc(
      collection(
        db,
        "media_gallery"
      ),

      {
        type,

        src: url,

        caption,
      }
    );

    setUrl("");

    setCaption("");

    setType("image");

  }

  async function removeMedia(
    id?: string
  ) {

    if (!id) return;

    await deleteDoc(
      doc(
        db,
        "media_gallery",
        id
      )
    );

  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="text-5xl font-black mb-10">
          Media Gallery Manager
        </h1>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-10">

          <div className="grid gap-5">

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target
                    .value as any
                )
              }
              className="rounded-2xl bg-black/30 px-5 py-4"
            >
              <option value="image">
                Image
              </option>

              <option value="video">
                Video
              </option>
            </select>

            <input
              type="text"
              placeholder="Image / Video URL"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              className="rounded-2xl bg-black/30 px-5 py-4"
            />

            <input
              type="text"
              placeholder="Caption"
              value={caption}
              onChange={(e) =>
                setCaption(
                  e.target.value
                )
              }
              className="rounded-2xl bg-black/30 px-5 py-4"
            />

            <button
              onClick={addMedia}
              className="rounded-2xl bg-pink-500 py-4 font-bold"
            >
              Upload Media
            </button>

          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">

          {items.map((item) => (

            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
            >

              {item.type ===
              "image" ? (

                <img
                  src={item.src}
                  className="h-64 w-full object-cover"
                />

              ) : (

                <video
                  src={item.src}
                  controls
                  className="h-64 w-full object-cover"
                />

              )}

              <div className="p-4">

                <div className="text-sm text-white/70">
                  {item.caption}
                </div>

                <button
                  onClick={() =>
                    removeMedia(
                      item.id
                    )
                  }
                  className="mt-4 w-full rounded-xl bg-red-500 py-2 text-sm font-bold"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
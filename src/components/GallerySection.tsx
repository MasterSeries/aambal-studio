import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type MediaItem = {
  id?: string;

  type: "image" | "video";

  src: string;

  caption: string;
};

export function GallerySection() {

  const [items, setItems] =
    useState<MediaItem[]>([]);

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">

      {items.map((item) => (

        <div
          key={item.id}
          className="overflow-hidden rounded-3xl border border-border bg-card/40"
        >

          {item.type ===
          "image" ? (

            <img
              src={item.src}
              className="h-72 w-full object-cover"
            />

          ) : (

            <video
              src={item.src}
              controls
              className="h-72 w-full object-cover"
            />

          )}

          <div className="p-4 text-sm text-muted-foreground">
            {item.caption}
          </div>

        </div>

      ))}

    </div>
  );
}
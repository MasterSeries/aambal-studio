import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  storage,
  db,
} from "@/lib/firebase";

import { v4 as uuid } from "uuid";

export const Route =
  createFileRoute("/gallery")({
    component: GalleryPage,
  });

function GalleryPage() {
  const [image, setImage] =
    useState<File | null>(null);

  const [images, setImages] =
    useState<any[]>([]);

  async function uploadImage() {
    if (!image) return;

    try {
      const imageRef = ref(
        storage,
        `gallery/${uuid()}`
      );

      await uploadBytes(
        imageRef,
        image
      );

      const url =
        await getDownloadURL(
          imageRef
        );

      await addDoc(
        collection(db, "gallery"),
        {
          imageUrl: url,
          createdAt:
            new Date(),
        }
      );

      alert(
        "Image uploaded!"
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(db, "gallery"),
        (snapshot) => {
          const data: any[] =
            [];

          snapshot.forEach(
            (doc) => {
              data.push(
                doc.data()
              );
            }
          );

          setImages(data);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-10 text-5xl font-black">
        Event Gallery
      </h1>

      <div className="mb-10 flex gap-4">
        <input
          type="file"
          onChange={(e) =>
            setImage(
              e.target.files?.[0] ||
                null
            )
          }
        />

        <button
          onClick={
            uploadImage
          }
          className="rounded-2xl bg-pink-500 px-6 py-3 font-bold"
        >
          Upload
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {images.map(
          (
            image,
            index
          ) => (
            <img
              key={index}
              src={
                image.imageUrl
              }
              className="h-[300px] w-full rounded-3xl object-cover"
            />
          )
        )}
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  auth,
  storage,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";

export const Route =
  createFileRoute(
    "/customer-gallery"
  )({
    component: CustomerGallery,
  });

function CustomerGallery() {
  const [loading, setLoading] =
    useState(true);

  const [images, setImages] =
    useState<string[]>([]);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            window.location.href =
              "/customer-login";

            return;
          }

          try {
            const galleryRef = ref(
              storage,
              `gallery/${user.uid}`
            );

            const res =
              await listAll(
                galleryRef
              );

            const urls =
              await Promise.all(
                res.items.map((item) =>
                  getDownloadURL(
                    item
                  )
                )
              );

            setImages(urls);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-3xl font-bold text-white">
        Loading Gallery...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white md:px-10">
      
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          
          <div>
            <h1 className="text-5xl font-black">
              My Gallery
            </h1>

            <p className="mt-3 text-white/50">
              Your festival memories
            </p>
          </div>

          <a
            href="/customer-profile"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold"
          >
            Back to Profile
          </a>
        </div>

        {/* EMPTY */}
        {images.length === 0 && (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-14 text-center text-white/50">
            No photos uploaded yet
          </div>
        )}

        {/* GALLERY */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {images.map(
            (image, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
              >
                
                <div className="relative aspect-square overflow-hidden">
                  
                  <img
                    src={image}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition group-hover:opacity-100" />

                  <a
                    href={image}
                    download
                    target="_blank"
                    className="absolute bottom-4 left-4 right-4 rounded-2xl bg-pink-500 px-5 py-3 text-center font-bold text-white opacity-0 transition group-hover:opacity-100"
                  >
                    Download
                  </a>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
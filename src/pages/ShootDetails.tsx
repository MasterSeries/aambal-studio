import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function ShootDetails() {

  const [posts, setPosts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    try {

      const unsubscribe =
        onSnapshot(

          collection(
            db,
            "instagram_posts"
          ),

          (snapshot) => {

            const arr: any[] = [];

            snapshot.forEach((doc) => {

              arr.push({
                id: doc.id,
                ...doc.data(),
              });

            });

            setPosts(arr);

            setLoading(false);

          },

          (err) => {

            console.error(err);

            setError(
              "Failed to load data"
            );

            setLoading(false);

          }
        );

      return () => unsubscribe();

    } catch (err) {

      console.error(err);

      setError(
        "Something went wrong"
      );

      setLoading(false);

    }

  }, []);

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading...

      </div>
    );

  }

  if (error) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-red-400">

        {error}

      </div>
    );

  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-6xl font-black">

          Luxury Shoots

        </h1>

        {posts.length === 0 && (

          <div className="text-white/50">

            No posts found

          </div>

        )}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {posts.map((post) => (

            <div
              key={post.id}
              className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]"
            >

              <video
                src={post.src}
                controls
                className="h-[500px] w-full object-cover bg-black"
              />

              <div className="p-5">

                <div className="text-2xl font-bold">

                  {post.caption}

                </div>

                <div className="mt-2 text-pink-300">

                  ♥ {post.likes}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}
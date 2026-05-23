import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function ShootManager() {

  const [posts, setPosts] =
    useState<any[]>([]);

  const [caption, setCaption] =
    useState("");

  const [video, setVideo] =
    useState("");

  const [likes, setLikes] =
    useState("");

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "instagram_posts"
        ),

        (snapshot) => {

          const arr: any[] = [];

          snapshot.forEach((docSnap) => {

            arr.push({
              id: docSnap.id,
              ...docSnap.data(),
            });

          });

          setPosts(arr);

        }
      );

    return () => unsubscribe();

  }, []);

  async function addPost() {

    if (!video) {

      alert(
        "Enter video URL"
      );

      return;

    }

    try {

      await addDoc(
        collection(
          db,
          "instagram_posts"
        ),

        {
          src: video,

          caption,

          likes,
        }
      );

      setCaption("");
      setVideo("");
      setLikes("");

      alert("Post Added");

    } catch (err) {

      console.error(err);

      alert("Failed");

    }
  }

  async function removePost(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "instagram_posts",
          id
        )
      );

    } catch (err) {

      console.error(err);

    }
  }

  return (
    <div className="min-h-screen bg-black p-10 text-white">

      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-5xl font-black">
          Shoot Manager
        </h1>

        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8">

          <h2 className="mb-6 text-3xl font-bold">
            Add Instagram Reel
          </h2>

          <div className="grid gap-4">

            <input
              type="text"
              placeholder="Video URL"
              value={video}
              onChange={(e) =>
                setVideo(
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

            <input
              type="text"
              placeholder="Likes"
              value={likes}
              onChange={(e) =>
                setLikes(
                  e.target.value
                )
              }
              className="rounded-2xl bg-black/30 px-5 py-4"
            />

            <button
              onClick={addPost}
              className="rounded-2xl bg-pink-500 py-4 font-bold"
            >
              Add Reel
            </button>

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {posts.map((post) => (

            <div
              key={post.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
            >

              <video
                src={post.src}
                controls
                className="h-[300px] w-full object-cover"
              />

              <div className="p-5">

                <div className="text-2xl font-bold">
                  {post.caption}
                </div>

                <div className="mt-2 text-pink-300">
                  ♥ {post.likes}
                </div>

                <button
                  onClick={() =>
                    removePost(
                      post.id
                    )
                  }
                  className="mt-5 w-full rounded-2xl bg-red-500 py-3 font-bold"
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
import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AdminShootEditor() {

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
          type: "video",

          src: video,

          poster: video,

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
    <div className="min-h-screen bg-[#07070b] text-white p-6 md:p-10">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10">

          <h1 className="text-5xl font-black">
            Shoot Manager
          </h1>

          <p className="mt-3 text-white/50">
            Manage reels, shoot details & offers
          </p>

        </div>

        {/* ADD FORM */}
        <div className="mb-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-8">

          <h2 className="mb-8 text-3xl font-black">
            Add Instagram Reel
          </h2>

          <div className="grid gap-5">

            <input
              type="text"
              value={video}
              onChange={(e) =>
                setVideo(
                  e.target.value
                )
              }
              placeholder="Instagram Reel URL"
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none"
            />

            <input
              type="text"
              value={caption}
              onChange={(e) =>
                setCaption(
                  e.target.value
                )
              }
              placeholder="Caption"
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none"
            />

            <input
              type="text"
              value={likes}
              onChange={(e) =>
                setLikes(
                  e.target.value
                )
              }
              placeholder="Likes"
              className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none"
            />

            <button
              onClick={addPost}
              className="rounded-2xl bg-pink-500 py-4 text-lg font-bold transition hover:bg-pink-400"
            >
              Add Reel
            </button>

          </div>

        </div>

        {/* POSTS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {posts.map((post) => (

            <div
              key={post.id}
              className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]"
            >

              <video
                src={post.src}
                controls
                className="h-[300px] w-full bg-black object-cover"
              />

              <div className="p-5">

                <div className="text-xl font-bold">
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
                  className="mt-5 w-full rounded-2xl bg-red-500 py-3 font-bold transition hover:bg-red-400"
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
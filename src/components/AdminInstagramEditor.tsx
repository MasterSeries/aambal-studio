import { useState } from "react";
import {
  addDoc,
  collection,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AdminInstagramEditor() {

  const [url, setUrl] =
    useState("");

  const [caption, setCaption] =
    useState("");

  async function addPost() {

    await addDoc(
      collection(db, "instagram_posts"),
      {
        type: "video",
        instagramUrl: url,
        caption,
        likes: "0",
      }
    );

    alert("Post Added");

    setUrl("");
    setCaption("");
  }

  return (
    <div className="bg-white/5 p-6 rounded-3xl">

      <h2 className="text-3xl mb-5">
        Instagram Videos
      </h2>

      <input
        value={url}
        onChange={(e) =>
          setUrl(e.target.value)
        }
        placeholder="Instagram Reel URL"
        className="w-full p-4 rounded-xl bg-black/40 mb-4"
      />

      <input
        value={caption}
        onChange={(e) =>
          setCaption(
            e.target.value
          )
        }
        placeholder="Caption"
        className="w-full p-4 rounded-xl bg-black/40 mb-4"
      />

      <button
        onClick={addPost}
        className="bg-primary px-6 py-3 rounded-xl"
      >
        Add Reel
      </button>
    </div>
  );
}
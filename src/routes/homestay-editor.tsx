import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const Route =
  createFileRoute(
    "/homestay-editor"
  )({
    component:
      HomestayEditor,
  });

const defaultData = {
  heroTitle:
    "Stay where the festival breathes.",

  heroSubtitle:
    "Luxury heritage villa experience",

  aboutText:
    "A century-old villa reimagined for storytellers.",

  rooms: [
    {
      id: 1,

      name:
        "Lotus Suite",

      tagline:
        "Garden View",

      price:
        "₹14,999",

      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",

      features: [
        "King Bed",
        "Private Balcony",
      ],
    },
  ],

  amenities: [
    {
      icon: "🌿",

      title:
        "Private Garden",
    },

    {
      icon: "🍃",

      title:
        "Ayurvedic Breakfast",
    },
  ],
};

function HomestayEditor() {

  const [
    data,
    setData,
  ] = useState<any>(
    null
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {

    const ref = doc(
      db,
      "homestayContent",
      "main"
    );

    async function init() {

      const snap =
        await getDoc(ref);

      // AUTO CREATE FIREBASE DATA

      if (!snap.exists()) {

        await setDoc(
          ref,
          defaultData
        );
      }
    }

    init();

    const unsub =
      onSnapshot(
        ref,
        (snap) => {

          if (
            snap.exists()
          ) {

            setData(
              snap.data()
            );
          }
        }
      );

    return () => unsub();

  }, []);

  async function save() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "homestayContent",
          "main"
        ),

        data
      );

      alert(
        "Saved Successfully"
      );

    } catch (err) {

      console.error(err);

      alert(
        "Save Failed"
      );

    } finally {

      setSaving(false);

    }
  }

  if (!data) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      <div className="grid lg:grid-cols-2">

        {/* LEFT EDITOR */}

        <div className="border-r border-white/10 p-10 overflow-y-auto h-screen">

          <h1 className="text-5xl font-black mb-10">
            Homestay CMS
          </h1>

          {/* HERO */}

          <div className="mb-12">

            <h2 className="text-2xl font-bold mb-5">
              Hero Section
            </h2>

            <div className="grid gap-4">

              <input
                value={
                  data.heroTitle
                }

                onChange={(
                  e
                ) =>
                  setData({
                    ...data,

                    heroTitle:
                      e.target
                        .value,
                  })
                }

                className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

                placeholder="Hero Title"
              />

              <input
                value={
                  data.heroSubtitle
                }

                onChange={(
                  e
                ) =>
                  setData({
                    ...data,

                    heroSubtitle:
                      e.target
                        .value,
                  })
                }

                className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

                placeholder="Subtitle"
              />

              <textarea
                value={
                  data.aboutText
                }

                onChange={(
                  e
                ) =>
                  setData({
                    ...data,

                    aboutText:
                      e.target
                        .value,
                  })
                }

                className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 min-h-[140px]"

                placeholder="About"
              />

            </div>

          </div>

          {/* ROOMS */}

          <div className="mb-12">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Rooms
              </h2>

              <button
                onClick={() =>
                  setData({
                    ...data,

                    rooms: [
                      ...data.rooms,

                      {
                        id:
                          Date.now(),

                        name:
                          "",

                        tagline:
                          "",

                        price:
                          "",

                        image:
                          "",

                        features:
                          [],
                      },
                    ],
                  })
                }

                className="rounded-xl bg-emerald-500 px-4 py-2 font-bold"
              >
                + Add Room
              </button>

            </div>

            <div className="grid gap-6">

              {data.rooms.map(
                (
                  room: any,
                  index: number
                ) => (

                  <div
                    key={room.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                  >

                    <div className="grid gap-4">

                      <input
                        value={
                          room.name
                        }

                        onChange={(
                          e
                        ) => {

                          const updated =
                            [
                              ...data.rooms,
                            ];

                          updated[
                            index
                          ].name =
                            e.target.value;

                          setData({
                            ...data,

                            rooms:
                              updated,
                          });
                        }}

                        className="rounded-2xl bg-black/30 px-5 py-4"

                        placeholder="Room Name"
                      />

                      <input
                        value={
                          room.tagline
                        }

                        onChange={(
                          e
                        ) => {

                          const updated =
                            [
                              ...data.rooms,
                            ];

                          updated[
                            index
                          ].tagline =
                            e.target.value;

                          setData({
                            ...data,

                            rooms:
                              updated,
                          });
                        }}

                        className="rounded-2xl bg-black/30 px-5 py-4"

                        placeholder="Tagline"
                      />

                      <input
                        value={
                          room.price
                        }

                        onChange={(
                          e
                        ) => {

                          const updated =
                            [
                              ...data.rooms,
                            ];

                          updated[
                            index
                          ].price =
                            e.target.value;

                          setData({
                            ...data,

                            rooms:
                              updated,
                          });
                        }}

                        className="rounded-2xl bg-black/30 px-5 py-4"

                        placeholder="Price"
                      />

                      <input
                        value={
                          room.image
                        }

                        onChange={(
                          e
                        ) => {

                          const updated =
                            [
                              ...data.rooms,
                            ];

                          updated[
                            index
                          ].image =
                            e.target.value;

                          setData({
                            ...data,

                            rooms:
                              updated,
                          });
                        }}

                        className="rounded-2xl bg-black/30 px-5 py-4"

                        placeholder="Image URL"
                      />

                      <button
                        onClick={() => {

                          const updated =
                            data.rooms.filter(
                              (
                                _: any,
                                i: number
                              ) =>
                                i !==
                                index
                            );

                          setData({
                            ...data,

                            rooms:
                              updated,
                          });
                        }}

                        className="rounded-xl bg-red-500 py-3 font-bold"
                      >
                        Delete Room
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* SAVE */}

          <button
            onClick={save}

            className="w-full rounded-3xl bg-pink-500 py-5 text-xl font-black"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

        {/* RIGHT LIVE PREVIEW */}

        <div className="h-screen overflow-y-auto bg-black p-10">

          <div className="rounded-[40px] border border-white/10 overflow-hidden">

            {/* HERO */}

            <div className="bg-gradient-to-br from-emerald-950 to-black p-14">

              <div className="max-w-3xl">

                <div className="text-sm uppercase tracking-[0.4em] text-emerald-300 mb-5">
                  Luxury Retreat
                </div>

                <h1 className="text-6xl font-black leading-tight">
                  {
                    data.heroTitle
                  }
                </h1>

                <p className="mt-6 text-xl text-white/60">
                  {
                    data.heroSubtitle
                  }
                </p>

                <p className="mt-6 max-w-2xl text-white/50 leading-relaxed">
                  {
                    data.aboutText
                  }
                </p>

              </div>

            </div>

            {/* ROOMS */}

            <div className="grid md:grid-cols-2 gap-6 p-8">

              {data.rooms.map(
                (
                  room: any
                ) => (

                  <div
                    key={room.id}
                    className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]"
                  >

                    <img
                      src={
                        room.image
                      }

                      className="h-72 w-full object-cover"
                    />

                    <div className="p-6">

                      <div className="text-3xl font-black">
                        {
                          room.name
                        }
                      </div>

                      <div className="mt-2 text-white/50">
                        {
                          room.tagline
                        }
                      </div>

                      <div className="mt-5 text-emerald-300 text-2xl font-bold">
                        {
                          room.price
                        }
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
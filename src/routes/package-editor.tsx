import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import {
  motion,
} from "motion/react";

import { db } from "@/lib/firebase";

import { PackagesShowcase } from "@/components/PackagesShowcase";

export const Route =
  createFileRoute(
    "/package-editor"
  )({
    component:
      PackageEditor,
  });

const defaultPackages = {
  portrait: {
    id: "portrait",

    name:
      "Festival Portrait",

    tagline:
      "Intimate. Timeless.",

    price:
      "₹4,999",

    oldPrice:
      "₹6,500",

    duration:
      "1 Hour",

    badge: "",

    icon: "📸",

    includes: [
      "photography",
    ],

    featured:
      false,

    color:
      "#c89a30",

    accent:
      "#e8c97a",
  },

  family: {
    id: "family",

    name:
      "Family & Group",

    tagline:
      "Every face. Every moment.",

    price:
      "₹8,999",

    oldPrice:
      "₹12,000",

    duration:
      "2 Hours",

    badge:
      "Most Booked",

    icon: "📸",

    includes: [
      "photography",
    ],

    featured:
      true,

    color:
      "#e8c97a",

    accent:
      "#c89a30",
  },

  bridal: {
    id: "bridal",

    name:
      "Bridal / Couple",

    tagline:
      "Cinematic. Unforgettable.",

    price:
      "₹14,999",

    oldPrice:
      "₹20,000",

    duration:
      "Half Day",

    badge:
      "Premium",

    icon: "🎥",

    includes: [
      "photography",
      "film",
    ],

    featured:
      false,

    color:
      "#d4b0ff",

    accent:
      "#9b7fe8",
  },

  fullday: {
    id: "fullday",

    name:
      "Full Day Coverage",

    tagline:
      "Sunrise to last lamp.",

    price:
      "₹24,999",

    oldPrice:
      "₹35,000",

    duration:
      "Full Day",

    badge:
      "Best Value",

    icon: "🚁",

    includes: [
      "photography",
      "drone",
      "film",
    ],

    featured:
      false,

    color:
      "#7dd3fc",

    accent:
      "#c89a30",
  },
};

function PackageCard({
  plan,
}: any) {

  return (
    <motion.div
      whileHover={{
        y: -10,
      }}

      className={`relative overflow-hidden rounded-[36px] border bg-gradient-to-b from-[#0b1320] to-[#050505] p-8 transition-all duration-500 ${
        plan.featured
          ? "border-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.2)]"

          : "border-white/10"
      }`}
    >

      {plan.badge && (

        <div
          className="mb-6 inline-flex rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em]"
          style={{
            borderColor:
              plan.color,

            color:
              plan.color,
          }}
        >
          {plan.badge}
        </div>

      )}

      <div className="mb-10 text-7xl">
        {plan.icon}
      </div>

      <h3 className="text-4xl font-black text-white">
        {plan.name}
      </h3>

      <p
        className="mt-3 text-xl italic"
        style={{
          color:
            plan.color,
        }}
      >
        {plan.tagline}
      </p>

      <div className="mt-4 uppercase tracking-[0.3em] text-white/40">
        {plan.duration}
      </div>

      <div className="mt-10 flex items-end gap-3">

        <div
          className="text-5xl font-black"
          style={{
            color:
              plan.color,
          }}
        >
          {plan.price}
        </div>

        <div className="pb-2 text-white/30 line-through">
          {plan.oldPrice}
        </div>

      </div>

      <div className="mt-8 flex flex-wrap gap-3">

        {plan.includes.map(
          (
            item: string
          ) => (

            <div
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
            >
              {item}
            </div>

          )
        )}

      </div>

      <div
        className="mt-10 flex items-center justify-between font-bold"
        style={{
          color:
            plan.color,
        }}
      >
        <span>
          View full details
        </span>

        <span className="text-2xl">
          →
        </span>

      </div>

    </motion.div>
  );
}

function PackageEditor() {

  const [
    packages,
    setPackages,
  ] = useState<any>(
    null
  );

  const [
    selected,
    setSelected,
  ] = useState(
    "portrait"
  );

  useEffect(() => {

    const ref = doc(
      db,
      "siteContent",
      "packages"
    );

    async function init() {

      const snap =
        await getDoc(ref);

      if (
        !snap.exists()
      ) {

        await setDoc(
          ref,
          defaultPackages
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

            setPackages(
              snap.data()
            );
          }
        }
      );

    return () => unsub();

  }, []);

  async function save() {

    await setDoc(
      doc(
        db,
        "siteContent",
        "packages"
      ),

      packages
    );

    alert(
      "Saved Successfully"
    );
  }

  if (!packages) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const plan =
    packages[selected];

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="grid lg:grid-cols-[420px_1fr]">

        {/* LEFT PANEL */}

        <div className="border-r border-white/10 p-8 h-screen overflow-y-auto">

          <div className="mb-10">

            <div className="text-xs uppercase tracking-[0.4em] text-yellow-400 mb-4">
              Visual CMS
            </div>

            <h1 className="text-5xl font-black">
              Package Builder
            </h1>

          </div>

          <div className="mb-8 flex flex-wrap gap-3">

            {Object.keys(
              packages
            ).map((k) => (

              <button
                key={k}

                onClick={() =>
                  setSelected(
                    k
                  )
                }

                className={`rounded-xl px-5 py-3 font-bold capitalize ${
                  selected ===
                  k
                    ? "bg-yellow-500 text-black"

                    : "bg-white/5 text-white"
                }`}
              >
                {k}
              </button>

            ))}

          </div>

          <div className="grid gap-4">

            <input
              value={
                plan.name
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      name:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Name"
            />

            <input
              value={
                plan.tagline
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      tagline:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Tagline"
            />

            <input
              value={
                plan.price
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      price:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Price"
            />

            <input
              value={
                plan.oldPrice
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      oldPrice:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Old Price"
            />

            <input
              value={
                plan.duration
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      duration:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Duration"
            />

            <input
              value={
                plan.badge
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      badge:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Badge"
            />

            <input
              value={
                plan.icon
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      icon:
                        e.target
                          .value,
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Emoji Icon"
            />

            <input
              value={
                plan.includes.join(
                  ", "
                )
              }

              onChange={(e) =>
                setPackages({
                  ...packages,

                  [selected]:
                    {
                      ...plan,

                      includes:
                        e.target.value
                          .split(",")
                          .map(
                            (
                              i: string
                            ) =>
                              i.trim()
                          ),
                    },
                })
              }

              className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4"

              placeholder="Includes"
            />
<div className="mt-6">

  <div className="mb-4 text-xs uppercase tracking-[0.3em] text-yellow-400">
    Package Details
  </div>

  {(plan.items || []).map(
    (
      item: any,
      itemIndex: number
    ) => (

      <div
        key={itemIndex}

        className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4"
      >

        {/* ICON */}

        <input
          value={item.icon}

          onChange={(e) => {

            const updated =
              { ...packages };

            updated[selected]
              .items[
                itemIndex
              ].icon =
              e.target.value;

            setPackages(
              updated
            );
          }}

          className="mb-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"

          placeholder="Emoji Icon"
        />

        {/* LABEL */}

        <input
          value={item.label}

          onChange={(e) => {

            const updated =
              { ...packages };

            updated[selected]
              .items[
                itemIndex
              ].label =
              e.target.value;

            setPackages(
              updated
            );
          }}

          className="mb-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"

          placeholder="Title"
        />

        {/* DETAIL */}

        <textarea
          value={item.detail}

          onChange={(e) => {

            const updated =
              { ...packages };

            updated[selected]
              .items[
                itemIndex
              ].detail =
              e.target.value;

            setPackages(
              updated
            );
          }}

          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3"

          placeholder="Description"

          rows={4}
        />

      </div>
    )
  )}

  {/* ADD ITEM BUTTON */}

  <button
    onClick={() => {

      const updated =
        { ...packages };

      if (
        !updated[selected]
          .items
      ) {

        updated[selected]
          .items = [];
      }

      updated[selected]
        .items.push({

          icon: "✨",

          label:
            "New Feature",

          detail:
            "Feature detail",
        });

      setPackages(
        updated
      );
    }}

    className="mt-2 w-full rounded-2xl border border-dashed border-yellow-500/40 bg-yellow-500/10 py-4 text-sm font-bold text-yellow-400"
  >
    + Add Package Item
  </button>

</div>
            <label className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4">

              <input
                type="checkbox"

                checked={
                  plan.featured
                }

                onChange={(e) =>
                  setPackages({
                    ...packages,

                    [selected]:
                      {
                        ...plan,

                        featured:
                          e.target
                            .checked,
                      },
                  })
                }
              />

              Featured Package

            </label>

            <button
              onClick={save}

              className="mt-6 rounded-2xl bg-emerald-500 py-5 text-xl font-black text-black"
            >
              Save Changes
            </button>

          </div>

        </div>

        {/* RIGHT LIVE WEBSITE */}

        <div className="h-screen overflow-y-auto bg-[#04080f]">

          <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl px-8 py-5 flex items-center justify-between">

            <div>

              <div className="text-xs uppercase tracking-[0.4em] text-yellow-400">
                Live Website Preview
              </div>

              <div className="text-white/60 text-sm mt-1">
                This is the REAL packages page
              </div>

            </div>

            <button
              onClick={save}

              className="rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-black text-black"
            >
              Save Changes
            </button>

          </div>

          <iframe
  src="/packages"

  style={{
    width: "100%",
    height: "100vh",
    border: "none",
    background: "#04080f",
  }}
/>

        </div>

      </div>

    </div>
  );
}
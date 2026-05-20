import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const Route = createFileRoute(
  "/history"
)({
  component: HistoryPage,
});

function HistoryPage() {
  const [phone, setPhone] =
    useState("");

  const [bookings, setBookings] =
    useState<any[]>([]);

  async function fetchBookings() {
    const q = query(
      collection(db, "bookings"),
      where("phone", "==", phone)
    );

    const snapshot = await getDocs(q);

    const data: any[] = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    setBookings(data);
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        My Bookings
      </h1>

      <div className="flex gap-4 mb-10">
        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-5 py-4"
        />

        <button
          onClick={fetchBookings}
          className="rounded-xl bg-primary px-6"
        >
          Search
        </button>
      </div>

      <div className="grid gap-5">
        {bookings.map((booking, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="text-2xl font-bold">
              {booking.date}
            </div>

            <div className="mt-2">
              ⏰ {booking.time}
            </div>

            <div className="mt-3">
              Status:
              <span className="ml-2 text-yellow-400">
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
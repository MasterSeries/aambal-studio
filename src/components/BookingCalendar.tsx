import { useEffect, useState } from "react";

import { DayPicker } from "react-day-picker";

import "react-day-picker/dist/style.css";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const timeSlots = [
  "9:00 AM",
  "11:00 AM",
  "2:00 PM",
  "5:00 PM",
  "7:00 PM",
];

export function BookingCalendar() {
  const [date, setDate] =
    useState(new Date());

  const [selectedSlot, setSelectedSlot] =
    useState("");

  const [bookedSlots, setBookedSlots] =
    useState<string[]>([]);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const formattedDate =
    date.toDateString();

  useEffect(() => {
    fetchBookedSlots();
  }, [date]);

  async function fetchBookedSlots() {
    const q = query(
      collection(db, "bookings"),
      where("date", "==", formattedDate)
    );

    const querySnapshot =
      await getDocs(q);

    const slots: string[] = [];

    querySnapshot.forEach((doc) => {
      slots.push(doc.data().time);
    });

    setBookedSlots(slots);
  }

  async function handleBooking() {
    if (
      !selectedSlot ||
      !name ||
      !phone ||
      !email
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // CHECK IF SLOT EXISTS
      const q = query(
        collection(db, "bookings"),
        where("date", "==", formattedDate),
        where("time", "==", selectedSlot)
      );

      const existing =
        await getDocs(q);

      if (!existing.empty) {
        alert(
          "This slot is already booked"
        );

        return;
      }

      // SAVE BOOKING
      await addDoc(
        collection(db, "bookings"),
        {
          name,
          phone,
          email,
          date: formattedDate,
          time: selectedSlot,
          status: "pending",
          createdAt: new Date(),
        }
      );

      // OPEN WHATSAPP
      window.open(
        `https://wa.me/918075797258?text=${encodeURIComponent(
          `🎉 New Booking Request

Name: ${name}

Phone: ${phone}

Email: ${email}

Date: ${formattedDate}

Time: ${selectedSlot}`
        )}`
      );

      alert(
        "Booking Confirmed Successfully!"
      );

      // RESET
      setSelectedSlot("");
      setName("");
      setPhone("");
      setEmail("");

      fetchBookedSlots();
    } catch (err) {
      console.error(err);

      alert("Booking Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* CALENDAR */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(day) => {
            if (day) {
              setDate(day);
            }
          }}
          disabled={{
            before: new Date(),
          }}
          className="text-white"
        />
      </div>

      {/* SLOTS */}
      <div>
        <h3 className="mb-5 text-2xl font-bold">
          Available Slots
        </h3>

        <div className="flex flex-wrap gap-3">
          {timeSlots.map((slot) => {
            const booked =
              bookedSlots.includes(slot);

            return (
              <button
                key={slot}
                disabled={booked}
                onClick={() =>
                  setSelectedSlot(slot)
                }
                className={`rounded-2xl border px-5 py-3 transition ${
                  booked
                    ? "cursor-not-allowed border-red-500 bg-red-500/20 text-red-300"
                    : selectedSlot === slot
                    ? "bg-primary text-white"
                    : "border-white/10 bg-white/5 hover:border-primary"
                }`}
              >
                {slot}

                {booked
                  ? " (Booked)"
                  : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-bold transition hover:scale-[1.01] disabled:opacity-50"
        >
          {loading
            ? "Booking..."
            : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
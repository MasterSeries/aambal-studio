import { useEffect, useState } from "react";

import { z } from "zod";

import { toast } from "sonner";
import {
  sendWhatsAppMessage,
} from "@/lib/sendWhatsapp";
import {
  motion,
  AnimatePresence,
} from "motion/react";

import { SlotCalendar } from "./SlotCalendar";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  blockedDates,
  blockedSlots,
} from "@/lib/calendar";

const schema = z.object({
  name: z.string().trim().min(2),

  email: z.string().trim().email(),

  phone: z.string().trim().min(7),

  package: z.string(),

  date: z.string().min(1),

  time: z.string().min(1),

  addDrone: z.boolean(),

  notes: z.string().optional(),
});
type BookingFormProps = {

  selectedPlan: {
    name: string;
    price: string;
  };

  onBookingComplete: (
    bookingData: any
  ) => void;
};
const packages = [
  "Festival Portrait — ₹4,999",

  "Family & Group — ₹8,999",

  "Bridal / Couple — ₹14,999",

  "Full Day Coverage — ₹24,999",
];

const ALL_TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];

const PETAL_COLORS = [
  "#f9c0d4",
  "#f48bb0",
  "#ffd9e6",
  "#e07aa2",
  "#ffffff",
];

export function BookingForm({
  selectedPlan,
  onBookingComplete,
}: BookingFormProps) {
  const [pkg, setPkg] =
    useState(packages[0]);

  const [drone, setDrone] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [userEmail, setUserEmail] =
    useState("");

  const [userName, setUserName] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [selectedSlots, setSelectedSlots] =
    useState<string[]>([]);

  const [bookedSlots, setBookedSlots] =
    useState<string[]>([]);

  const [burst, setBurst] =
    useState(0);

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(
        auth.currentUser.email || ""
      );

      setUserName(
        auth.currentUser.displayName ||
          ""
      );
    }
  }, []);

  // LIVE SLOT FETCH
  useEffect(() => {
    if (!selectedDate) return;

    const formattedDate =
      selectedDate.toDateString();

    const q = query(
      collection(db, "bookings"),

      where(
        "date",
        "==",
        formattedDate
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const slots: string[] =
          [];

        snapshot.forEach((doc) => {
          const data =
            doc.data();

          if (
            data.timeSlots
          ) {
            slots.push(
              ...data.timeSlots
            );
          }

          if (data.time) {
            slots.push(data.time);
          }
        });

        setBookedSlots(slots);
      });

    return () => unsubscribe();
  }, [selectedDate]);

  function toggleSlot(slot: string) {
    if (
      selectedSlots.includes(slot)
    ) {
      setSelectedSlots((prev) =>
        prev.filter(
          (s) => s !== slot
        )
      );

      return;
    }

    setSelectedSlots((prev) => [
      ...prev,
      slot,
    ]);
  }

  async function onSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!selectedDate) {
      toast.error(
        "Please select date"
      );

      return;
    }

    if (
      selectedSlots.length === 0
    ) {
      toast.error(
        "Please select slots"
      );

      return;
    }

    const fd = new FormData(
      e.currentTarget
    );

    const parsed = schema.safeParse({
      name:
        fd.get("name") ||
        userName,

      email:
        fd.get("email") ||
        userEmail,

      phone: fd.get("phone"),

      package: pkg,

      date:
        selectedDate.toDateString(),

      time:
        selectedSlots.join(", "),

      addDrone: drone,

      notes:
        fd.get("notes") ?? "",
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message
      );

      return;
    }

    try {
      setLoading(true);

      // DOUBLE CHECK
      for (const slot of selectedSlots) {
        const q = query(
          collection(db, "bookings"),

          where(
            "date",
            "==",
            selectedDate.toDateString()
          ),

          where(
            "timeSlots",
            "array-contains",
            slot
          )
        );

        const existing =
          await getDocs(q);

        if (!existing.empty) {
          toast.error(
            `${slot} already booked`
          );

          return;
        }
      }

      // SAVE
      await addDoc(
  collection(db, "bookings"),
  {
    uid:
      auth.currentUser?.uid ||
      null,

    name:
      parsed.data.name,

    email:
      parsed.data.email,

    phone:
      parsed.data.phone,

    package:
      parsed.data.package,

    date:
      selectedDate.toDateString(),

    timeSlots:
      selectedSlots,

    addDrone:
      drone,

    notes:
      parsed.data.notes,

    status:
      "pending",

    createdAt:
      new Date(),
  }
);

      // WHATSAPP
      // AUTOMATIC WHATSAPP MESSAGE
try {

  await sendWhatsAppMessage(
    parsed.data.phone,

    `✨ Booking Confirmed

👤 ${parsed.data.name}

📅 ${selectedDate.toDateString()}

⏰ ${selectedSlots.join(", ")}

📦 ${parsed.data.package}

🚁 Drone:
${drone ? "Yes" : "No"}

Aambal Vasantham Studio`
  );

} catch (whatsappErr) {

  console.error(
    "WhatsApp failed:",
    whatsappErr
  );
}

setBurst((b) => b + 1);

toast.success(
  "✨ Booking Confirmed Successfully"
);

setLoading(false);

alert(
  "Booking Confirmed"
);

try {

  await Promise.resolve(
    onBookingComplete({
      name:
        parsed.data.name,

      phone:
        parsed.data.phone,

      email:
        parsed.data.email,

      date:
        selectedDate.toDateString(),

      time:
        selectedSlots.join(", "),
    })
  );

} catch (err) {

  console.error(
    "Parent callback failed:",
    err
  );

}

      
      
    } catch (err) {
      console.error(err);

      toast.error(
        "Booking failed"
      );
    } 
    e.currentTarget.reset();

setSelectedDate(null);

setSelectedSlots([]);
  }


  const field =
    "w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white placeholder:text-white/40 outline-none transition focus:border-pink-400";

  const petals = Array.from({
    length: 16,
  }).map((_, i) => ({
    id: i,

    color:
      PETAL_COLORS[
        i % PETAL_COLORS.length
      ],

    size:
      10 + Math.random() * 10,

    left:
      50 +
      (Math.random() - 0.5) * 30,
  }));

  // FILTER AVAILABLE SLOTS
  const availableSlots =
    ALL_TIME_SLOTS.filter(
      (slot) => {
        const formattedDate =
          selectedDate?.toDateString();

        const blocked =
          blockedSlots[
            formattedDate || ""
          ]?.includes(slot);

        const booked =
          bookedSlots.includes(
            slot
          );

        return (
          !blocked && !booked
        );
      }
    );

  return (
    <form
  onSubmit={onSubmit}
  className="grid w-full max-w-full gap-6 overflow-hidden"
>
      <div className="grid gap-8 xl:grid-cols-[1fr_1fr] items-start">
        
        {/* LEFT */}
        <div className="space-y-5">
          
          <div className="slot-grid grid grid-cols-2 gap-2">
            
            <label className="grid gap-2 text-sm">
              <span className="text-white/50">
                Full Name
              </span>

              <input
                name="name"
                required
                defaultValue={userName}
                placeholder="Karthik"
                className={field}
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-white/50">
                Phone
              </span>

              <input
                name="phone"
                required
                placeholder="+91 98xxx"
                className={field}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-white/50">
              Email
            </span>

            <input
              name="email"
              type="email"
              required
              defaultValue={userEmail}
              placeholder="you@email.com"
              className={field}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-white/50">
              Package
            </span>

            <select
              value={pkg}
              onChange={(e) =>
                setPkg(e.target.value)
              }
              className={field}
            >
              {packages.map((p) => (
                <option
                  key={p}
                  value={p}
                  className="bg-black"
                >
                  {p}
                </option>
              ))}
            </select>
          </label>

          {/* SLOT SECTION */}
          <div>
            
            <div className="mb-4 flex items-center justify-between">
              
              <span className="text-sm text-white/50">
                Available Slots
              </span>

              <span className="text-xs text-pink-300">
                {availableSlots.length}
                {" "}available
              </span>
            </div>

            {/* BOOKED SLOTS */}
{bookedSlots.length > 0 && (
  <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
    
    <div className="mb-3 text-sm font-bold text-red-300">
      Already Booked
    </div>

    <div className="flex flex-wrap gap-2">
      
      {bookedSlots.map(
        (slot) => (
          <div
            key={slot}
            className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200"
          >
            {slot}
          </div>
        )
      )}
    </div>
  </div>
)}

{/* AVAILABLE SLOTS */}
<div className="slot-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableSlots.map(
                (slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() =>
                      toggleSlot(
                        slot
                      )
                    }
                    className={`slot-btn w-full rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                      selectedSlots.includes(
                        slot
                      )
                        ? "border-pink-400 bg-pink-500 text-white"
                        : "border-white/10 bg-white/[0.03] text-white hover:border-pink-400"
                    }`}
                  >
                    {slot}
                  </button>
                )
              )}
            </div>

            {availableSlots.length ===
              0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-red-300">
                No slots available
              </div>
            )}
          </div>

          {/* DRONE */}
          <label className="drone-card flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            
            <input
              type="checkbox"
              checked={drone}
              onChange={(e) =>
                setDrone(
                  e.target.checked
                )
              }
              className="mt-1 h-5 w-5 accent-pink-500"
            />

            <span className="text-sm">
              
              <span className="block text-base font-semibold">
                Add Drone Coverage
              </span>

              <span className="text-white/50">
                Cinematic aerial coverage
              </span>
            </span>
          </label>

          {/* NOTES */}
          <label className="grid gap-2 text-sm">
            
            <span className="text-white/50">
              Event Notes
            </span>

            <textarea
              name="notes"
              rows={4}
              placeholder="Additional details..."
              className={field}
            />
          </label>
        </div>

        {/* CALENDAR */}
        <div className="w-full min-w-[340px] rounded-[28px] border border-white/10 bg-white/[0.04] p-3 sm:p-5 backdrop-blur-2xl">
          
          <SlotCalendar
  blockedDates={
    blockedDates
  }

  value={{
    date: selectedDate,
    time:
      selectedSlots[0] ||
      null,
  }}

  onChange={(v) => {

    setSelectedDate(
      v.date
    );

    if (
      v.time &&
      !selectedSlots.includes(
        v.time
      )
    ) {
      setSelectedSlots([
        v.time,
      ]);
    }
  }}
/>
        </div>
      </div>

      {/* BUTTON */}
      <div className="relative">
        
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.96 }}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading
            ? "Booking..."
            : "Book Now ✨"}
        </motion.button>

        {/* PETALS */}
        <AnimatePresence>
          {burst > 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              
              {petals.map((p) => (
                <span
                  key={p.id}
                  className="petal absolute top-1/2 block rounded-full"
                  style={
                    {
                      left: `${p.left}%`,
                      width: p.size,
                      height:
                        p.size * 1.4,

                      background: `radial-gradient(circle at 30% 30%, white, ${p.color} 65%)`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
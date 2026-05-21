import { DayPicker } from "react-day-picker";

import "react-day-picker/dist/style.css";

import {
  useEffect,
  useState,
} from "react";

import {
  getBookedSlots,
} from "@/lib/availability";

type SlotCalendarProps = {
  value: {
    date: Date | null;
    time: string | null;
  };

  onChange: (
    value: {
      date: Date | null;
      time: string | null;
    }
  ) => void;

  blockedDates?: string[];
};

const slots = [
  "9:00 AM",
  "11:00 AM",
  "2:00 PM",
  "5:00 PM",
  "7:00 PM",
];

export function SlotCalendar({
  value,
  onChange,
  blockedDates = [],
}: SlotCalendarProps) {

  const [
    bookedSlots,
    setBookedSlots,
  ] = useState<string[]>([]);

  // LOAD BOOKED SLOTS
  useEffect(() => {
    async function loadSlots() {

      if (!value.date) {
        setBookedSlots([]);

        return;
      }

      try {
        const booked =
          await getBookedSlots(
            value.date.toDateString()
          );

        setBookedSlots(booked);

      } catch (err) {
        console.error(err);
      }
    }

    loadSlots();

  }, [value.date]);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 md:p-6 backdrop-blur-2xl">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        <div>
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Select Date
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Choose your preferred booking day
          </p>
        </div>

        {value.date && (
          <div className="rounded-2xl bg-pink-500/15 px-4 py-3 text-right">
            
            <div className="text-xs uppercase tracking-wider text-pink-200/60">
              Selected
            </div>

            <div className="mt-1 text-sm font-bold text-pink-200">
              {value.date.toDateString()}
            </div>
          </div>
        )}
      </div>

      {/* CALENDAR */}
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-3 md:p-5">
        
        <DayPicker
  mode="single"
  selected={value.date || undefined}

  onSelect={(date) =>
    onChange({
      ...value,
      date: date || null,
    })
  }

  disabled={[
    { before: new Date() },

    (date) =>
      blockedDates.includes(
        date.toDateString()
      ),
  ]}

  className="custom-calendar mx-auto"

  styles={{
  month: {
    width: "100%",
  },

  table: {
    width: "100%",
  },

  head_cell: {
    padding: "10px",
    fontSize: "14px",
  },

  cell: {
    padding: "6px",
  },

  day: {
    width: "44px",
    height: "44px",
    fontSize: "14px",
    borderRadius: "14px",
  },

  caption_label: {
    fontSize: "1.5rem",
    fontWeight: "700",
  },

  nav_button: {
    width: "36px",
    height: "36px",
  },
}}
/>
      </div>

      {/* SLOT SECTION */}
      <div className="mt-8">
        
        <div className="mb-5 flex items-center justify-between">
          
          <h3 className="text-xl font-bold text-white">
            Available Slots
          </h3>

          <div className="rounded-full bg-pink-500/10 px-4 py-1 text-xs font-semibold text-pink-200">
            {
              slots.filter(
                (slot) =>
                  !bookedSlots.includes(
                    slot
                  )
              ).length
            }{" "}
            available
          </div>
        </div>

        {/* SLOT GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          
          {slots.map((slot) => {

            const active =
              value.time === slot;

            const booked =
              bookedSlots.includes(
                slot
              );

            return (
              <button
                key={slot}

                type="button"

                disabled={booked}

                onClick={() =>
                  onChange({
                    ...value,
                    time: slot,
                  })
                }

                className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-sm font-bold transition-all duration-300 md:text-base ${
                  
                  booked
                    ? "cursor-not-allowed border-red-500/20 bg-red-500/10 text-red-300 opacity-50"

                    : active
                    ? "border-pink-400 bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg shadow-pink-500/30"

                    : "border-white/10 bg-white/[0.04] text-white hover:border-pink-400 hover:bg-pink-500/10"
                }`}
              >
                <span className="relative z-10">
                  {slot}
                </span>

                {booked && (
                  <div className="mt-1 text-[10px] uppercase tracking-wider">
                    Booked
                  </div>
                )}

                {!active &&
                  !booked && (
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-pink-300/5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* NO SLOTS */}
        {bookedSlots.length ===
          slots.length && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-red-300">
            No slots available for this date
          </div>
        )}

        {/* HELPER */}
        <div className="mt-5 rounded-2xl border border-pink-500/10 bg-pink-500/5 p-4 text-sm text-pink-100/70">
          ✨ Premium slots are limited during festival season. Early booking recommended.
        </div>
      </div>
    </div>
  );
}
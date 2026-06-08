import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  collection,
  onSnapshot,
  query,
  updateDoc,
  doc,
  addDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getBookedSlots } from "@/lib/availability";
import { z } from "zod";
import { toast } from "sonner";
import { sendWhatsAppMessage } from "@/lib/sendWhatsapp";
import { motion, AnimatePresence } from "framer-motion";
import { blockedDates } from "@/lib/calendar";

// ==========================================
// 1. SLOT CALENDAR COMPONENT
// ==========================================

type SlotCalendarProps = {
  value: { date: Date | null; time: string | null };
  onChange: (value: { date: Date | null; time: string | null }) => void;
  blockedDates?: string[];
};

const slots = ["9:00 AM", "11:00 AM", "2:00 PM", "5:00 PM", "7:00 PM"];

const headerImage = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800";

export function SlotCalendar({ value, onChange, blockedDates = [] }: SlotCalendarProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // LOAD BOOKED SLOTS
  useEffect(() => {
    async function loadSlots() {
      if (!value.date) {
        setBookedSlots([]);
        return;
      }
      try {
        const booked = await getBookedSlots(value.date.toDateString());
        setBookedSlots(booked);
      } catch (err) {
        console.error(err);
      }
    }
    loadSlots();
  }, [value.date]);

  return (
    <div className="relative w-full max-w-[400px] mx-auto overflow-hidden rounded-[48px] bg-gradient-to-b from-[#6b5854]/90 to-[#4a3f3c]/95 backdrop-blur-2xl shadow-2xl border border-white/10 font-sans pb-10">
      
      {/* ── TOP HEADER IMAGE & PILLS ── */}
      <div className="relative h-[220px] w-full">
        <img 
          src={headerImage} 
          alt="Atmosphere" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6b5854]/40 to-[#6b5854]/90"></div>
        
        <div className="absolute top-8 left-0 w-full flex justify-center gap-3 px-6">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm border border-white/10 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            Festival
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-white shadow-sm border border-white/10 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {slots.length - bookedSlots.length} Slots Left
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="px-8 -mt-6 relative z-10">
        
        {/* 1. Date Selection Section */}
        <div className="mb-8">
          <h3 className="text-[15px] font-medium text-white/90 tracking-wide mb-4 border-b border-white/10 pb-3">
            Select Date
          </h3>
          
          <div className="flex justify-center">
            <style>{`
              .minimal-calendar {
                --rdp-cell-size: 36px;
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
              }
              .minimal-calendar .rdp-head_cell { 
                color: rgba(255, 255, 255, 0.4); 
                font-size: 0.7rem; 
                font-weight: 500;
                text-transform: uppercase; 
                letter-spacing: 1px; 
              }
              .minimal-calendar .rdp-caption_label { 
                font-size: 1rem; 
                font-weight: 500; 
                color: white;
              }
              .minimal-calendar .rdp-nav_button {
                color: rgba(255, 255, 255, 0.6);
              }
              .minimal-calendar .rdp-nav_button:hover {
                background-color: rgba(255, 255, 255, 0.1);
              }
              .minimal-calendar .rdp-day { 
                border-radius: 50%; 
                font-weight: 400; 
                font-size: 0.85rem;
              }
              .minimal-calendar .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: rgba(255, 255, 255, 0.1);
              }
              .minimal-calendar .rdp-day_selected, 
              .minimal-calendar .rdp-day_selected:focus-visible, 
              .minimal-calendar .rdp-day_selected:hover {
                background-color: rgba(0, 0, 0, 0.4);
                color: white;
                font-weight: 600;
                border: 1px solid rgba(255,255,255,0.2);
              }
              .minimal-calendar .rdp-day_disabled {
                opacity: 0.2;
              }
            `}</style>

            <DayPicker
              mode="single"
              selected={value.date || undefined}
              onSelect={(date) => onChange({ ...value, date: date || null })}
              disabled={[
                { before: new Date() },
                (date) => blockedDates.includes(date.toDateString()),
              ]}
              className="minimal-calendar"
            />
          </div>
        </div>

        {/* 2. Time Selection Section */}
        <div className="mb-2">
          <h3 className="text-[15px] font-medium text-white/90 tracking-wide mb-2 border-b border-white/10 pb-3 flex justify-between items-end">
            Available Times
            {value.date && (
              <span className="text-[11px] text-white/50 font-normal">
                {value.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </h3>

          <div className="flex flex-col gap-2 mt-4">
            {slots.map((slot) => {
              const active = value.time === slot;
              const booked = bookedSlots.includes(slot);

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={booked}
                  onClick={() => onChange({ ...value, time: slot })}
                  className={`w-full flex justify-between items-center px-5 py-3.5 rounded-[20px] transition-all duration-300 ${
                    booked
                      ? "opacity-30 cursor-not-allowed"
                      : active
                      ? "bg-black/30 border border-white/10 shadow-inner"
                      : "bg-black/10 hover:bg-black/20 border border-transparent"
                  }`}
                >
                  <span className={`text-sm tracking-wide ${active ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
                    {slot}
                  </span>
                  
                  <span className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${active ? 'text-white/90' : 'text-white/40'}`}>
                      {booked ? 'Unavailable' : active ? 'Selected' : 'Select'}
                    </span>
                    {!booked && (
                      <svg 
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform duration-300 ${active ? 'rotate-180 text-white' : 'text-white/40'}`}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          
          {bookedSlots.length === slots.length && value.date && (
            <div className="mt-4 py-3 text-center text-xs font-medium text-white/50 bg-black/20 rounded-[20px]">
              No times remaining for this date.
            </div>
          )}
        </div>
      </div>
      
      {value.date && value.time && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center pb-12 pt-6 bg-gradient-to-t from-[#4a3f3c] to-transparent pointer-events-none">
           <button className="pointer-events-auto bg-white text-black px-10 py-3 rounded-full font-semibold text-sm shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform">
             Confirm 
           </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. REAL CALENDAR COMPONENT (DASHBOARD)
// ==========================================

export function RealCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: any[] = [];

        snapshot.forEach((docSnap) => {
          const booking = docSnap.data();

          const slot =
            booking.timeSlots?.[0] ||
            booking.time ||
            "9:00 AM";

          const eventDate = new Date(booking.date);

          const [time, modifier] = slot.split(" ");

          let [hours, minutes] = time.split(":").map(Number);

          if (modifier === "PM" && hours !== 12) {
            hours += 12;
          }

          if (modifier === "AM" && hours === 12) {
            hours = 0;
          }

          const start = new Date(eventDate);
          start.setHours(hours, minutes, 0, 0);

          const end = new Date(start);
          end.setHours(start.getHours() + 1);

          data.push({
            id: docSnap.id,
            title: `${booking.name} • ${slot}`,
            start,
            end,
            extendedProps: {
              booking,
            },
            backgroundColor:
              booking.status === "approved"
                ? "#22c55e"
                : booking.status === "completed"
                ? "#3b82f6"
                : booking.status === "rejected"
                ? "#ef4444"
                : booking.status === "rescheduled"
                ? "#06b6d4"
                : "#ec4899",
            borderColor: "transparent",
            textColor: "#ffffff",
          });
        });

        setEvents(data);
      });

    return () => unsubscribe();
  }, []);

  async function handleEventDrop(info: any) {
    try {
      const bookingId = info.event.id;
      const newDate = info.event.start;

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          date: newDate.toDateString(),
        }
      );

      alert("Booking updated");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  }

  function handleDateClick(info: any) {
    alert(`Selected ${info.dateStr}`);
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white p-3 md:p-5 text-black shadow-2xl">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        eventStartEditable={true}
        dayMaxEvents={3}
        weekends={true}
        events={events}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
        eventClassNames={() => [
          "!rounded-xl",
          "!border-0",
          "!px-2",
          "!py-1",
          "!font-semibold",
          "!shadow-lg",
        ]}
        dayHeaderClassNames={() => ["bg-black/5", "font-bold", "text-black"]}
        viewClassNames={() => ["rounded-2xl"]}
      />
    </div>
  );
}

// ==========================================
// 3. BOOKING FORM COMPONENT
// ==========================================

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
  selectedPlan: { name: string; price: string };
  onBookingComplete: (bookingData: any) => void;
};

export function BookingForm({ selectedPlan, onBookingComplete }: BookingFormProps) {
  const [pkg, setPkg] = useState(selectedPlan?.name || "Festival Portrait — ₹4,999");
  const [drone, setDrone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || "");
      setUserName(auth.currentUser.displayName || "");
    }
  }, []);

  const inputClass = "w-full rounded-[20px] border border-white/20 bg-white/5 px-5 py-4 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-all";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDate || selectedSlots.length === 0) {
      toast.error("Please select a date and time");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name") || userName,
      email: fd.get("email") || userEmail,
      phone: fd.get("phone"),
      package: pkg,
      date: selectedDate.toDateString(),
      time: selectedSlots.join(", "),
      addDrone: drone,
      notes: fd.get("notes") ?? "",
    });

    if (!parsed.success) {
      toast.error("Invalid form data");
      return;
    }

    try {
      setLoading(true);
      const bookingRef = `AV-${Date.now()}`;
      await addDoc(collection(db, "bookings"), { ...parsed.data, reference: bookingRef, status: "pending", createdAt: new Date() });
      
      await sendWhatsAppMessage(parsed.data.phone, {
        name: parsed.data.name,
        packageName: parsed.data.package,
        price: selectedPlan.price,
        date: selectedDate.toDateString(),
        time: selectedSlots.join(", "),
        reference: bookingRef,
      });

      toast.success("✨ Booking Confirmed");
      onBookingComplete({ ...parsed.data, reference: bookingRef });
      e.currentTarget.reset();
    } catch (err) {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-[#6b5854]/90 to-[#4a3f3c]/95 backdrop-blur-2xl rounded-[48px] border border-white/10 p-8 md:p-12 shadow-2xl">
        
        <h2 className="text-3xl font-light text-white mb-8 tracking-wide">Finalize Booking</h2>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left: Fields */}
          <div className="space-y-6">
            <input name="name" required defaultValue={userName} placeholder="Full Name" className={inputClass} />
            <input name="phone" required placeholder="Phone Number" className={inputClass} />
            <input name="email" required defaultValue={userEmail} placeholder="Email" className={inputClass} />
            
            <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass}>
              <option className="bg-[#4a3f3c]">Festival Portrait — ₹4,999</option>
              <option className="bg-[#4a3f3c]">Family & Group — ₹8,999</option>
              <option className="bg-[#4a3f3c]">Bridal / Couple — ₹14,999</option>
            </select>

            <label className="flex items-center gap-4 text-white/80 p-4 border border-white/10 rounded-[20px] cursor-pointer hover:bg-white/5">
              <input type="checkbox" checked={drone} onChange={(e) => setDrone(e.target.checked)} className="h-5 w-5 accent-[#f5a623]" />
              <span className="text-sm">Include Cinematic Drone Aerials</span>
            </label>
          </div>

          {/* Right: Calendar Integration */}
          <div className="flex flex-col gap-6">
            <SlotCalendar
              blockedDates={[]}
              value={{ date: selectedDate, time: selectedSlots[0] || null }}
              onChange={(v) => {
                setSelectedDate(v.date);
                if (v.time) setSelectedSlots([v.time]);
              }}
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-12 py-4 bg-white text-[#4a3f3c] rounded-full font-bold tracking-widest text-sm uppercase hover:bg-[#f5a623] hover:text-white transition-all shadow-xl"
          >
            {loading ? "Processing..." : "Complete Booking"}
          </button>
        </div>

      </div>
    </form>
  );
}

// ==========================================
// 4. STANDALONE BOOKING CALENDAR COMPONENT
// ==========================================

const timeSlots = [
  "9:00 AM",
  "11:00 AM",
  "2:00 PM",
  "5:00 PM",
  "7:00 PM",
];

export function BookingCalendar() {
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const formattedDate = date.toDateString();

  useEffect(() => {
    fetchBookedSlots();
  }, [date]);

  async function fetchBookedSlots() {
    const q = query(
      collection(db, "bookings"),
      where("date", "==", formattedDate)
    );

    const querySnapshot = await getDocs(q);
    const slotsArr: string[] = [];

    querySnapshot.forEach((doc) => {
      slotsArr.push(doc.data().time);
    });

    setBookedSlots(slotsArr);
  }

  async function handleBooking() {
    if (!selectedSlot || !name || !phone || !email) {
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

      const existing = await getDocs(q);

      if (!existing.empty) {
        alert("This slot is already booked");
        return;
      }

      // SAVE BOOKING
      await addDoc(collection(db, "bookings"), {
        name,
        phone,
        email,
        date: formattedDate,
        time: selectedSlot,
        status: "pending",
        createdAt: new Date(),
      });

      alert("Booking Confirmed Successfully!");

      // OPEN WHATSAPP SAFELY
      try {
        window.open(
          `https://wa.me/918075797258?text=${encodeURIComponent(
            `🎉 New Booking Request\n\nName: ${name}\n\nPhone: ${phone}\n\nEmail: ${email}\n\nDate: ${formattedDate}\n\nTime: ${selectedSlot}`
          )}`
        );
      } catch (whatsappErr) {
        console.error("WhatsApp open failed", whatsappErr);
      }

      // RESET
      setSelectedSlot("");
      setName("");
      setPhone("");
      setEmail("");

      fetchBookedSlots();
    } catch (err) {
      console.error(err);
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

        <div className="slot-grid">
          {timeSlots.map((slot) => {
            const booked = bookedSlots.includes(slot);

            return (
              <button
                key={slot}
                disabled={booked}
                onClick={() => setSelectedSlot(slot)}
                className={`slot-btn rounded-2xl border px-5 py-3 transition ${
                  booked
                    ? "cursor-not-allowed border-red-500 bg-red-500/20 text-red-300"
                    : selectedSlot === slot
                    ? "bg-primary text-white"
                    : "border-white/10 bg-white/5 hover:border-primary"
                }`}
              >
                {slot}
                {booked ? " (Booked)" : ""}
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
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
        />

        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-bold transition hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 5. BOOKING CONFIRMED FLOW (UI ANIMATIONS)
// ==========================================

export function BookingConfirmedFlow({ planKey, defaultPackages, T, CameraAnimation, FamilyAnimation, DroneAnimation, FilmAnimation }: any) {
  const plan = defaultPackages.find((p: any) => p.id === planKey) ?? defaultPackages[0];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phases = plan?.phases || ["confirm"];

  useEffect(() => {
    if (phaseIdx >= phases.length - 1) return;
    const t = setTimeout(() => setPhaseIdx((i) => i + 1), 2800);
    return () => clearTimeout(t);
  }, [phaseIdx, phases.length]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col pt-12 pb-6 max-w-[1200px] mx-auto font-sans" style={{ background: T?.bg || '#fff' }}>
      
      {/* Header Loading State */}
      {phases[phaseIdx] !== "confirm" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
          <p className="text-gray-900 font-bold text-2xl mb-4">Setting up your session</p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center"><span className="text-3xl font-bold text-orange-500">0{3 - phaseIdx}</span><span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Sec</span></div>
          </div>
        </motion.div>
      )}

      {/* Phase Renderer */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phases[phaseIdx]}
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            {phases[phaseIdx] === "camera" && CameraAnimation && <CameraAnimation />}
            {phases[phaseIdx] === "family" && FamilyAnimation && <FamilyAnimation />}
            {phases[phaseIdx] === "drone" && DroneAnimation && <DroneAnimation />}
            {phases[phaseIdx] === "film" && FilmAnimation && <FilmAnimation />}
            {phases[phaseIdx] === "confirm" && <TicketScreen plan={plan} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// 6. THE FINAL TICKET UI (CONFIRM PHASE)
// ==========================================

export function TicketScreen({ plan }: any) {
  // const navigate = useNavigate(); // <-- Uncomment if you are using a router
  const [showBooking, setShowBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  if (bookingConfirmed) {
    return (
      <div className="bg-white rounded-[40px] p-6 md:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-orange-500/10 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 100%)' }}/>
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-4xl mx-auto mb-6 relative z-10 shadow-inner">✓</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative z-10">Spot Reserved!</h2>
        <p className="text-gray-500 mb-8 font-medium text-sm md:text-base relative z-10">Your session for <strong className="text-gray-900">{plan.name}</strong> is confirmed.</p>
        
        <div className="bg-gray-50 rounded-[20px] md:rounded-[24px] p-5 md:p-6 mb-8 text-left text-sm md:text-[15px] font-semibold text-gray-700 shadow-inner border border-gray-100">
          <p className="flex justify-between mb-3 md:mb-4"><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] md:text-xs">Date</span> {bookingData.date}</p>
          <p className="flex justify-between mb-3 md:mb-4"><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] md:text-xs">Time</span> {bookingData.time}</p>
          <div className="w-full border-t border-dashed border-gray-200 my-3 md:my-4" />
          <p className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] md:text-xs">Ref ID</span> <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">{bookingData.reference}</span></p>
        </div>
        
        <button 
          // onClick={() => navigate({ to: "/" })} 
          className="w-full bg-[#111827] text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform text-base md:text-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative pb-28 pt-4 md:pt-8">
      {/* Top Countdown */}
      <div className="text-center mb-6 md:mb-8">
        <p className="text-gray-900 font-bold text-lg md:text-xl mb-2 md:mb-3">Remaining Time</p>
        <div className="flex justify-center gap-4 md:gap-6">
          <div className="flex flex-col items-center"><span className="text-2xl md:text-3xl font-bold text-gray-900">78</span><span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hrs</span></div>
          <span className="text-orange-500 text-xl md:text-2xl font-bold mt-1 md:mt-1.5">✦</span>
          <div className="flex flex-col items-center"><span className="text-2xl md:text-3xl font-bold text-gray-900">24</span><span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Min</span></div>
          <span className="text-orange-500 text-xl md:text-2xl font-bold mt-1 md:mt-1.5">✦</span>
          <div className="flex flex-col items-center"><span className="text-2xl md:text-3xl font-bold text-orange-500">08</span><span className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-widest">Sec</span></div>
        </div>
      </div>

      {/* The White Ticket Card */}
      <div className="bg-white rounded-[32px] md:rounded-[40px] p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden border border-gray-100">
        
        <div className="flex justify-between items-center px-1 md:px-2 mb-4 md:mb-6">
          <button 
            // onClick={() => navigate({ to: "/" })} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition shadow-sm border border-gray-100"
          >
             ←
          </button>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight">{plan?.name}</h3>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1 flex items-center justify-center gap-1">
              <span className="text-orange-500">📍</span> Studio Hut
            </p>
          </div>
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-50 transition shadow-sm">
            ⋮
          </button>
        </div>

        <div className="relative w-full aspect-[4/3] rounded-[24px] md:rounded-[32px] overflow-hidden mb-4 md:mb-6 shadow-md">
          <img src={plan?.image} className="w-full h-full object-cover" alt={plan?.name} />
          <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-[14px] text-xs md:text-sm font-bold shadow-lg flex items-center gap-1 md:gap-1.5">
            ♡ 450
          </div>
        </div>

        <div className="relative h-8 flex items-center mb-2 md:mb-4">
          <div className="absolute -left-8 md:-left-9 w-6 h-6 md:w-8 md:h-8 bg-[#f8f9fa] rounded-full shadow-inner border-r border-gray-100" />
          <div className="absolute -right-8 md:-right-9 w-6 h-6 md:w-8 md:h-8 bg-[#f8f9fa] rounded-full shadow-inner border-l border-gray-100" />
          <div className="w-full border-t-2 border-dashed border-gray-200" />
        </div>

        <div className="text-center px-2 md:px-4 pb-2 md:pb-4">
          <p className="text-orange-500 text-[9px] md:text-[11px] font-bold uppercase tracking-wider mb-2 md:mb-4">More Details Scan This Barcode!</p>
          <div className="flex justify-between items-end h-16 md:h-20 w-full opacity-90 px-1 md:px-2">
            {Array.from({ length: 45 }).map((_, i) => (
              <div key={i} style={{ width: Math.random() * 3 + 1, height: Math.random() > 0.3 ? 60 : 40, background: "#111827", borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Dark Footer Bar */}
      <div className="fixed bottom-4 md:bottom-6 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-[#111827] rounded-3xl md:rounded-[28px] p-2 md:p-2.5 pl-6 md:pl-8 flex justify-between items-center z-50 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="text-white font-bold text-xl md:text-2xl tracking-wide">{plan?.price}</div>
        <button onClick={() => setShowBooking(true)} className="bg-orange-500 text-white font-bold px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[22px] hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 text-base md:text-lg">
          Buy Ticket
        </button>
      </div>

      {/* Responsive Booking Form Modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] overflow-y-auto p-2 sm:p-4 flex items-center justify-center pt-10 pb-10"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-5xl relative mt-12 md:mt-0">
              <button onClick={() => setShowBooking(false)} className="absolute -top-12 right-2 md:-top-14 md:right-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white w-10 h-10 md:w-12 md:h-12 rounded-full font-bold flex items-center justify-center backdrop-blur-md transition-all">✕</button>
              
              <div className="bg-white rounded-[32px] md:rounded-[40px] p-4 sm:p-6 md:p-8 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center">Complete Booking</h3>
                
                <div className="overflow-x-auto w-full pb-2 scrollbar-hide">
                  <BookingForm
                    selectedPlan={{ name: plan?.name, price: plan?.price }}
                    onBookingComplete={(data: any) => {
                      setBookingData(data);
                      setBookingConfirmed(true);
                      setShowBooking(false);
                    }}
                  />
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
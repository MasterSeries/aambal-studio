import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import jsPDF from "jspdf";

export const Route = createFileRoute(
  "/customer-dashboard"
)({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [userName, setUserName] =
    useState("");

  const [
    rescheduleBooking,
    setRescheduleBooking,
  ] = useState<any>(null);

  const [newDate, setNewDate] =
    useState("");

  const [newSlots, setNewSlots] =
    useState("");

  useEffect(() => {
    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            window.location.href =
              "/customer-login";

            return;
          }

          setUserName(
            user.email || ""
          );

          const q = query(
            collection(db, "bookings"),

            where(
              "email",
              "==",
              user.email
            )
          );

          const unsubscribeBookings =
            onSnapshot(
              q,
              (snapshot) => {
                const data: any[] =
                  [];

                snapshot.forEach(
                  (docSnap) => {
                    data.push({
                      id: docSnap.id,
                      ...docSnap.data(),
                    });
                  }
                );

                setBookings(data);

                setLoading(false);
              }
            );

          return () =>
            unsubscribeBookings();
        }
      );

    return () => unsubscribeAuth();
  }, []);

  async function cancelBooking(
    id: string
  ) {
    const confirmCancel = confirm(
      "Cancel booking?"
    );

    if (!confirmCancel) return;

    try {
      await deleteDoc(
        doc(db, "bookings", id)
      );

      alert("Booking cancelled");
    } catch (err) {
      console.error(err);

      alert("Cancellation failed");
    }
  }

  async function handleLogout() {
    await signOut(auth);

    window.location.href =
      "/customer-login";
  }

  function openReschedule(
    booking: any
  ) {
    setRescheduleBooking(
      booking
    );

    setNewDate(
      booking.date || ""
    );

    setNewSlots(
      booking.timeSlots?.join(
        ", "
      ) || booking.time
    );
  }

  async function submitReschedule() {
    try {
      await updateDoc(
        doc(
          db,
          "bookings",
          rescheduleBooking.id
        ),
        {
          date: newDate,

          timeSlots:
            newSlots.split(","),

          status:
            "reschedule_requested",
        }
      );

      alert(
        "Reschedule request sent"
      );

      setRescheduleBooking(
        null
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to reschedule"
      );
    }
  }

  function downloadInvoice(
    booking: any
  ) {
    const pdf = new jsPDF();

    pdf.setFontSize(28);

    pdf.text(
      "Booking Invoice",
      20,
      25
    );

    pdf.setFontSize(14);

    pdf.text(
      `Customer: ${booking.name}`,
      20,
      55
    );

    pdf.text(
      `Email: ${booking.email}`,
      20,
      70
    );

    pdf.text(
      `Phone: ${booking.phone}`,
      20,
      85
    );

    pdf.text(
      `Date: ${booking.date}`,
      20,
      100
    );

    pdf.text(
      `Slots: ${
        booking.timeSlots?.join(
          ", "
        ) || booking.time
      }`,
      20,
      115
    );

    pdf.text(
      `Package: ${
        booking.package ||
        "Festival Package"
      }`,
      20,
      130
    );

    pdf.text(
      `Status: ${booking.status}`,
      20,
      145
    );

    pdf.save(
      `${booking.name}-invoice.pdf`
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070b] text-3xl font-bold text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] px-4 py-8 text-white md:px-8">
      
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          
          <div>
            <h1 className="text-5xl font-black tracking-tight">
              Customer Portal
            </h1>

            <p className="mt-3 text-lg text-white/50">
              Welcome back, {userName}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            
            <a
              href="/profile"
              className="rounded-2xl bg-pink-500 px-6 py-4 font-semibold transition hover:bg-pink-400"
            >
              My Profile
            </a>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-500 px-6 py-4 font-semibold transition hover:bg-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          
          <StatsCard
            title="Total"
            value={bookings.length}
          />

          <StatsCard
            title="Pending"
            value={
              bookings.filter(
                (b) =>
                  b.status ===
                  "pending"
              ).length
            }
          />

          <StatsCard
            title="Approved"
            value={
              bookings.filter(
                (b) =>
                  b.status ===
                  "approved"
              ).length
            }
          />

          <StatsCard
            title="Completed"
            value={
              bookings.filter(
                (b) =>
                  b.status ===
                  "completed"
              ).length
            }
          />
        </div>

        {/* BOOKINGS */}
        <div className="grid gap-8">
          
          {bookings.length ===
            0 && (
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-12 text-center text-xl text-white/50 backdrop-blur-2xl">
              No bookings found
            </div>
          )}

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 md:p-8 backdrop-blur-2xl"
            >
              
              <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-8 xl:flex-row xl:justify-between">
                
                {/* LEFT */}
                <div className="flex-1">
                  
                  <div className="flex items-center gap-4">
                    
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/15 text-2xl font-bold text-pink-300">
                      {booking.name?.charAt(
                        0
                      )}
                    </div>

                    <div>
                      <h2 className="text-3xl font-black">
                        {booking.name}
                      </h2>

                      <p className="mt-1 text-white/50">
                        Booking Details
                      </p>
                    </div>
                  </div>

                  {/* INFO GRID */}
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    
                    <InfoCard
                      title="Booking Date"
                      value={`📅 ${booking.date}`}
                    />

                    <InfoCard
                      title="Time Slots"
                      value={`⏰ ${
                        booking.timeSlots?.join(
                          ", "
                        ) || booking.time
                      }`}
                    />

                    <InfoCard
                      title="Phone"
                      value={booking.phone}
                    />

                    <InfoCard
                      title="Package"
                      value={
                        booking.package ||
                        "Festival Package"
                      }
                    />
                  </div>

                  {/* NOTES */}
                  {booking.notes && (
                    <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-6">
                      
                      <div className="text-sm uppercase tracking-wider text-white/40">
                        Event Notes
                      </div>

                      <div className="mt-3 text-white/80">
                        {booking.notes}
                      </div>
                    </div>
                  )}

                  {/* PHOTOGRAPHER */}
                  {booking.photographer && (
                    <div className="mt-5 rounded-3xl border border-purple-500/20 bg-purple-500/10 p-6">
                      
                      <div className="text-sm uppercase tracking-wider text-purple-200/60">
                        Assigned Photographer
                      </div>

                      <div className="mt-3 text-2xl font-bold text-purple-200">
                        📸 {
                          booking.photographer
                        }
                      </div>
                    </div>
                  )}

                  {/* TIMELINE */}
                  <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
                    
                    <div className="mb-5 text-sm uppercase tracking-wider text-white/40">
                      Booking Progress
                    </div>

                    <div className="flex items-center gap-3">
                      
                      <div
                        className={`h-5 w-5 rounded-full ${
                          booking.status ===
                            "pending" ||
                          booking.status ===
                            "approved" ||
                          booking.status ===
                            "completed"
                            ? "bg-pink-500"
                            : "bg-white/20"
                        }`}
                      />

                      <div className="h-[2px] flex-1 bg-white/10" />

                      <div
                        className={`h-5 w-5 rounded-full ${
                          booking.status ===
                            "approved" ||
                          booking.status ===
                            "completed"
                            ? "bg-green-500"
                            : "bg-white/20"
                        }`}
                      />

                      <div className="h-[2px] flex-1 bg-white/10" />

                      <div
                        className={`h-5 w-5 rounded-full ${
                          booking.status ===
                          "completed"
                            ? "bg-blue-500"
                            : "bg-white/20"
                        }`}
                      />
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-white/40">
                      
                      <span>
                        Pending
                      </span>

                      <span>
                        Approved
                      </span>

                      <span>
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="w-full xl:w-[320px]">
                  
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                    
                    <div className="text-sm uppercase tracking-wider text-white/40">
                      Booking Status
                    </div>

                    <div
                      className={`mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold ${
                        booking.status ===
                        "approved"
                          ? "bg-green-500/15 text-green-300"
                          : booking.status ===
                            "rejected"
                          ? "bg-red-500/15 text-red-300"
                          : booking.status ===
                            "completed"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-yellow-500/15 text-yellow-300"
                      }`}
                    >
                      {booking.status}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-8 grid gap-3">
                      
                      <button
                        onClick={() =>
                          downloadInvoice(
                            booking
                          )
                        }
                        className="rounded-2xl bg-pink-500 px-5 py-4 font-semibold transition hover:bg-pink-400"
                      >
                        Download Invoice
                      </button>

                      <button
                        onClick={() =>
                          openReschedule(
                            booking
                          )
                        }
                        className="rounded-2xl bg-blue-500 px-5 py-4 font-semibold transition hover:bg-blue-400"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() =>
                          cancelBooking(
                            booking.id
                          )
                        }
                        className="rounded-2xl bg-red-500 px-5 py-4 font-semibold transition hover:bg-red-400"
                      >
                        Cancel Booking
                      </button>

                      <a
                        href="/gallery"
                        className="rounded-2xl bg-purple-500 px-5 py-4 text-center font-semibold transition hover:bg-purple-400"
                      >
                        View Gallery
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RESCHEDULE MODAL */}
        {rescheduleBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111] p-8">
              
              <h2 className="mb-8 text-3xl font-black">
                Reschedule Booking
              </h2>

              <div className="space-y-5">
                
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) =>
                    setNewDate(
                      e.target.value
                    )
                  }
                  placeholder="New Date"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
                />

                <input
                  type="text"
                  value={newSlots}
                  onChange={(e) =>
                    setNewSlots(
                      e.target.value
                    )
                  }
                  placeholder="Slots"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
                />

                <div className="flex gap-4">
                  
                  <button
                    onClick={
                      submitReschedule
                    }
                    className="flex-1 rounded-2xl bg-blue-500 py-4 font-bold"
                  >
                    Save
                  </button>

                  <button
                    onClick={() =>
                      setRescheduleBooking(
                        null
                      )
                    }
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
      
      <div className="text-sm uppercase tracking-wider text-white/50">
        {title}
      </div>

      <div className="mt-5 text-5xl font-black">
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      
      <div className="text-sm text-white/40">
        {title}
      </div>

      <div className="mt-2 text-lg font-medium break-all">
        {value}
      </div>
    </div>
  );
}
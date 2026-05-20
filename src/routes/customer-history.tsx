import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import jsPDF from "jspdf";

export const Route =
  createFileRoute(
    "/customer-history"
  )({
    component: CustomerHistory,
  });

function CustomerHistory() {
  const [loading, setLoading] =
    useState(true);

  const [bookings, setBookings] =
    useState<any[]>([]);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            window.location.href =
              "/customer-login";

            return;
          }

          const q = query(
            collection(
              db,
              "bookings"
            ),

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
                  (doc) => {
                    data.push({
                      id: doc.id,
                      ...doc.data(),
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

    return () => unsubscribe();
  }, []);

  function downloadInvoice(
    booking: any
  ) {
    const pdf = new jsPDF();

    pdf.setFontSize(24);

    pdf.text(
      "Aambal Vasantham Studio",
      20,
      25
    );

    pdf.setFontSize(14);

    pdf.text(
      `Invoice ID: ${booking.id}`,
      20,
      45
    );

    pdf.text(
      `Customer: ${booking.name}`,
      20,
      60
    );

    pdf.text(
      `Email: ${booking.email}`,
      20,
      75
    );

    pdf.text(
      `Phone: ${booking.phone}`,
      20,
      90
    );

    pdf.text(
      `Package: ${booking.package}`,
      20,
      105
    );

    pdf.text(
      `Date: ${booking.date}`,
      20,
      120
    );

    pdf.text(
      `Time: ${booking.time}`,
      20,
      135
    );

    pdf.text(
      `Status: ${booking.status}`,
      20,
      150
    );

    pdf.text(
      "Thank you for booking with us.",
      20,
      190
    );

    pdf.save(
      `invoice-${booking.id}.pdf`
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-3xl font-bold text-white">
        Loading History...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white md:px-10">
      
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          
          <div>
            <h1 className="text-5xl font-black">
              Booking History
            </h1>

            <p className="mt-3 text-white/50">
              All your festival bookings
            </p>
          </div>

          <a
            href="/customer-profile"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold"
          >
            Back to Profile
          </a>
        </div>

        {/* EMPTY */}
        {bookings.length === 0 && (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-14 text-center text-white/50">
            No bookings found
          </div>
        )}

        {/* BOOKINGS */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {bookings.map(
            (booking) => (
              <div
                key={booking.id}
                className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
              >
                
                {/* TOP */}
                <div className="border-b border-white/10 p-7">
                  
                  <div className="flex items-start justify-between gap-4">
                    
                    <div>
                      <h2 className="text-3xl font-black">
                        {booking.package}
                      </h2>

                      <p className="mt-3 text-white/50">
                        {booking.date}
                      </p>
                    </div>

                    <div
                      className={`rounded-full px-4 py-2 text-sm font-bold ${
                        booking.status ===
                        "approved"
                          ? "bg-green-500/20 text-green-300"
                          : booking.status ===
                            "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : booking.status ===
                            "completed"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {booking.status}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="space-y-5 p-7">
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50">
                      Time
                    </span>

                    <span className="font-semibold">
                      {booking.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50">
                      Phone
                    </span>

                    <span className="font-semibold">
                      {booking.phone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-white/50">
                      Drone
                    </span>

                    <span className="font-semibold">
                      {booking.addDrone
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>

                  {booking.notes && (
                    <div className="rounded-2xl bg-black/30 p-5 text-sm text-white/70">
                      {booking.notes}
                    </div>
                  )}

                  {/* BUTTONS */}
                  <div className="flex flex-col gap-4 pt-4 md:flex-row">
                    
                    <button
                      onClick={() =>
                        downloadInvoice(
                          booking
                        )
                      }
                      className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 px-6 py-4 text-lg font-bold"
                    >
                      Download Invoice
                    </button>

                    <a
                      href="/"
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold"
                    >
                      Book Again
                    </a>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
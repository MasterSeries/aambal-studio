import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import RealtimeNotifications from "@/components/RealtimeNotifications";

import { GalleryUpload } from "@/components/GalleryUpload";
import { RealCalendar } from "@/components/RealCalendar";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import {
  Calendar,
  momentLocalizer,
} from "react-big-calendar";

import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export const Route =
  createFileRoute("/admin")({
    component: AdminPage,
  });

const localizer =
  momentLocalizer(moment);

function AdminPage() {
  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<any>(null);

  const [newDate, setNewDate] =
    useState("");

  const [newSlot, setNewSlot] =
    useState("");

  const [
    photographerInputs,
    setPhotographerInputs,
  ] = useState<{
    [key: string]: string;
  }>({});
  const [search, setSearch] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("all");

  useEffect(() => {
    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          if (!user) {
            window.location.href =
              "/login";

            return;
          }

          const q = query(
            collection(db, "bookings"),

            orderBy(
              "createdAt",
              "desc"
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

  async function updateStatus(
    id: string,
    status: string
  ) {
    try {
      await updateDoc(
        doc(db, "bookings", id),
        {
          status,
        }
      );
    } catch (err) {
      console.error(err);

      alert("Update failed");
    }
  }

  async function assignPhotographer(
    id: string
  ) {
    const photographer =
      photographerInputs[id];

    if (!photographer) {
      alert(
        "Enter photographer name"
      );

      return;
    }

    try {
      await updateDoc(
        doc(db, "bookings", id),
        {
          photographer,
        }
      );

      alert(
        "Photographer assigned"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Assignment failed"
      );
    }
  }

  function openReschedule(
    booking: any
  ) {
    setSelectedBooking(
      booking
    );

    setNewDate(
      booking.date || ""
    );

    setNewSlot(
      booking.timeSlots?.[0] ||
        booking.time ||
        ""
    );
  }

  async function saveReschedule() {
    if (!selectedBooking)
      return;

    try {
      await updateDoc(
        doc(
          db,
          "bookings",
          selectedBooking.id
        ),
        {
          date: newDate,

          timeSlots: [newSlot],

          status:
            "rescheduled",

          updatedAt:
            new Date(),
        }
      );

      alert(
        "Booking rescheduled"
      );

      setSelectedBooking(
        null
      );
    } catch (err) {
      console.error(err);

      alert(
        "Reschedule failed"
      );
    }
  }

  function generateInvoice(
    booking: any
  ) {
    const docPdf = new jsPDF();

    docPdf.setFontSize(28);

    docPdf.text(
      "Booking Invoice",
      20,
      20
    );

    docPdf.setFontSize(14);

    docPdf.text(
      `Name: ${booking.name}`,
      20,
      50
    );

    docPdf.text(
      `Email: ${booking.email}`,
      20,
      65
    );

    docPdf.text(
      `Phone: ${booking.phone}`,
      20,
      80
    );

    docPdf.text(
      `Date: ${booking.date}`,
      20,
      95
    );

    docPdf.text(
      `Slots: ${
        booking.timeSlots?.join(
          ", "
        ) || booking.time
      }`,
      20,
      110
    );

    docPdf.text(
      `Package: ${booking.package}`,
      20,
      125
    );

    docPdf.text(
      `Status: ${booking.status}`,
      20,
      140
    );

    docPdf.save(
      `${booking.name}-invoice.pdf`
    );
  }

  const totalBookings =
    bookings.length;

  const pendingBookings =
    bookings.filter(
      (b) => b.status === "pending"
    ).length;

  const approvedBookings =
    bookings.filter(
      (b) => b.status === "approved"
    ).length;

  const completedBookings =
    bookings.filter(
      (b) =>
        b.status === "completed"
    ).length;

  const today =
    new Date().toDateString();

  const todayBookings =
    bookings.filter(
      (b) => b.date === today
    ).length;

  const estimatedRevenue =
    approvedBookings * 5000;

  function downloadAnalyticsPDF() {
    const pdf = new jsPDF();

    pdf.setFontSize(28);

    pdf.text(
      "Analytics Report",
      20,
      25
    );

    autoTable(pdf, {
      startY: 50,

      head: [["Metric", "Value"]],

      body: [
        [
          "Total Bookings",
          totalBookings,
        ],

        [
          "Pending",
          pendingBookings,
        ],

        [
          "Approved",
          approvedBookings,
        ],

        [
          "Completed",
          completedBookings,
        ],

        [
          "Today's Bookings",
          todayBookings,
        ],

        [
          "Revenue",
          `₹${estimatedRevenue}`,
        ],
      ],
    });

    pdf.save(
      "analytics-report.pdf"
    );
  }

  const chartData = [
    {
      name: "Pending",
      value: pendingBookings,
    },

    {
      name: "Approved",
      value: approvedBookings,
    },

    {
      name: "Completed",
      value: completedBookings,
    },
  ];

  
    const filteredBookings =
  bookings.filter((booking) => {
    const matchesSearch =
      booking.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      booking.email
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const matchesStatus =
      statusFilter === "all"
        ? true
        : booking.status ===
          statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070b] text-3xl font-bold text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] px-4 py-8 text-white md:px-8">
      
      <RealtimeNotifications />

      <div className="mx-auto max-w-7xl">
        
        {/* HEADER */}
        {/* SEARCH + FILTER */}
<div className="mb-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl">
  
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
    
    {/* SEARCH */}
    <div className="flex-1">
      
      <input
        type="text"
        placeholder="Search bookings..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white outline-none transition focus:border-pink-400"
      />
    </div>

    {/* FILTER */}
    <select
      value={statusFilter}
      onChange={(e) =>
        setStatusFilter(
          e.target.value
        )
      }
      className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-white"
    >
      <option value="all">
        All
      </option>

      <option value="pending">
        Pending
      </option>

      <option value="approved">
        Approved
      </option>

      <option value="completed">
        Completed
      </option>

      <option value="rejected">
        Rejected
      </option>

      <option value="rescheduled">
        Rescheduled
      </option>
    </select>

    {/* COUNTER */}
    <div className="rounded-2xl bg-pink-500 px-6 py-4 text-center">
      
      <div className="text-xs uppercase tracking-wider text-pink-100/70">
        Visible
      </div>

      <div className="text-2xl font-black">
        {
          filteredBookings.length
        }
      </div>
    </div>
  </div>
</div>
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          
          <div>
            <h1 className="text-4xl font-black md:text-5xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-white/50">
              Premium Booking Management
            </p>
          </div>

          <button
            onClick={
              downloadAnalyticsPDF
            }
            className="rounded-2xl bg-pink-500 px-6 py-4 text-lg font-bold transition hover:bg-pink-400"
          >
            Download Analytics PDF
          </button>
        </div>
        

        {/* ANALYTICS */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          
          <AnalyticsCard
            title="Total"
            value={totalBookings}
          />

          <AnalyticsCard
            title="Pending"
            value={pendingBookings}
          />

          <AnalyticsCard
            title="Approved"
            value={approvedBookings}
          />

          <AnalyticsCard
            title="Today"
            value={todayBookings}
          />

          <AnalyticsCard
            title="Revenue"
            value={`₹${estimatedRevenue}`}
          />
        </div>

        {/* CHARTS */}
        <div className="mb-10 grid gap-8 xl:grid-cols-2">
          
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
            
            <h2 className="mb-6 text-3xl font-black">
              Analytics
            </h2>

            <div className="h-[320px]">
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#aaa"
                  />

                  <YAxis stroke="#aaa" />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff5da2"
                    strokeWidth={4}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
            
            <h2 className="mb-6 text-3xl font-black">
              Overview
            </h2>

            <div className="h-[320px]">
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#aaa"
                  />

                  <YAxis stroke="#aaa" />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#ff5da2"
                    radius={[
                      10,
                      10,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="mb-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
          
          <h2 className="mb-6 text-3xl font-black">
            Booking Calendar
          </h2>

          <div className="h-[650px] overflow-hidden rounded-[28px] bg-white p-4 text-black">
            <RealCalendar/>
          </div>
        </div>

        {/* GALLERY */}
        <div className="mb-10">
          <GalleryUpload />
        </div>
{filteredBookings.length ===
  0 && (
  <div className="mb-10 rounded-[32px] border border-white/10 bg-white/[0.03] p-20 text-center">
    
    <div className="text-3xl font-black text-white/30">
      No bookings found
    </div>

    <p className="mt-3 text-white/40">
      Try changing filters
    </p>
  </div>
)}
        {/* BOOKINGS */}
        <div className="grid gap-8">
          
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 md:p-8 backdrop-blur-2xl transition hover:border-pink-500/30"
            >
              
              <div className="flex flex-col gap-8 xl:flex-row xl:justify-between">
                
                {/* LEFT */}
                <div className="flex-1">
                  
                  <h2 className="text-4xl font-black">
                    {booking.name}
                  </h2>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    
                    <InfoCard
                      title="Email"
                      value={
                        booking.email
                      }
                    />

                    <InfoCard
                      title="Phone"
                      value={
                        booking.phone
                      }
                    />

                    <InfoCard
                      title="Date"
                      value={
                        booking.date
                      }
                    />

                    <InfoCard
                      title="Slots"
                      value={
                        booking
                          .timeSlots?.join(
                            ", "
                          ) ||
                        booking.time
                      }
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-5">
                    
                    <div className="text-sm text-pink-200/70">
                      Package
                    </div>

                    <div className="mt-2 text-2xl font-bold text-pink-200">
                      {booking.package}
                    </div>
                  </div>

                  {booking.photographer && (
                    <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5">
                      
                      <div className="text-sm text-purple-200/70">
                        Photographer
                      </div>

                      <div className="mt-2 text-2xl font-bold text-purple-200">
                        📸 {
                          booking.photographer
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT */}
                <div className="w-full xl:w-[320px]">
                  
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                    
                    <div className="text-sm uppercase tracking-wider text-white/40">
                      Status
                    </div>

                    <div
  className={`mt-4 inline-flex rounded-full px-5 py-2 text-sm font-bold ${
    booking.status ===
    "approved"
      ? "bg-green-500/15 text-green-300"

      : booking.status ===
        "completed"
      ? "bg-blue-500/15 text-blue-300"

      : booking.status ===
        "rejected"
      ? "bg-red-500/15 text-red-300"

      : booking.status ===
        "rescheduled"
      ? "bg-cyan-500/15 text-cyan-300"

      : "bg-yellow-500/15 text-yellow-300"
  }`}
>
  {booking.status}
</div>

                    <div className="mt-8 grid gap-3">
                      
                      <button
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            "approved"
                          )
                        }
                        className="rounded-2xl bg-green-500 py-4 font-bold"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            "rejected"
                          )
                        }
                        className="rounded-2xl bg-red-500 py-4 font-bold"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            "completed"
                          )
                        }
                        className="rounded-2xl bg-blue-500 py-4 font-bold"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          generateInvoice(
                            booking
                          )
                        }
                        className="rounded-2xl bg-pink-500 py-4 font-bold"
                      >
                        Invoice
                      </button>

                      <button
                        onClick={() =>
                          openReschedule(
                            booking
                          )
                        }
                        className="rounded-2xl bg-cyan-500 py-4 font-bold"
                      >
                        Reschedule
                      </button>
                    </div>

                    {/* PHOTOGRAPHER */}
                    <div className="mt-6 space-y-3">
                      
                      <input
                        type="text"
                        placeholder="Photographer"
                        value={
                          photographerInputs[
                            booking.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setPhotographerInputs(
                            {
                              ...photographerInputs,

                              [booking.id]:
                                e.target
                                  .value,
                            }
                          )
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
                      />

                      <button
                        onClick={() =>
                          assignPhotographer(
                            booking.id
                          )
                        }
                        className="w-full rounded-2xl bg-purple-500 py-4 font-bold"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RESCHEDULE MODAL */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111] p-8">
              
              <h2 className="mb-6 text-3xl font-black">
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
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
                />

                <input
                  type="text"
                  value={newSlot}
                  onChange={(e) =>
                    setNewSlot(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white"
                />

                <div className="flex gap-4">
                  
                  <button
                    onClick={
                      saveReschedule
                    }
                    className="flex-1 rounded-2xl bg-blue-500 py-4 font-bold"
                  >
                    Save
                  </button>

                  <button
                    onClick={() =>
                      setSelectedBooking(
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

function AnalyticsCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
      
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
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
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase";

import {
  useEffect,
  useState,
} from "react";

export function RealCalendar() {
  const [events, setEvents] =
    useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "bookings")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {
        const data: any[] = [];

        snapshot.forEach((docSnap) => {
          const booking =
            docSnap.data();

          const slot =
            booking.timeSlots?.[0] ||
            booking.time ||
            "9:00 AM";

          const eventDate =
            new Date(
              booking.date
            );

          const [time, modifier] =
            slot.split(" ");

          let [hours, minutes] =
            time
              .split(":")
              .map(Number);

          if (
            modifier === "PM" &&
            hours !== 12
          ) {
            hours += 12;
          }

          if (
            modifier === "AM" &&
            hours === 12
          ) {
            hours = 0;
          }

          const start =
            new Date(eventDate);

          start.setHours(
            hours,
            minutes,
            0,
            0
          );

          const end =
            new Date(start);

          end.setHours(
            start.getHours() + 1
          );

          data.push({
            id: docSnap.id,

            title: `${booking.name} • ${slot}`,

            start,

            end,

            extendedProps: {
              booking,
            },

            backgroundColor:
              booking.status ===
              "approved"
                ? "#22c55e"

                : booking.status ===
                  "completed"
                ? "#3b82f6"

                : booking.status ===
                  "rejected"
                ? "#ef4444"

                : booking.status ===
                  "rescheduled"
                ? "#06b6d4"

                : "#ec4899",

            borderColor:
              "transparent",

            textColor: "#ffffff",
          });
        });

        setEvents(data);
      });

    return () => unsubscribe();
  }, []);

  async function handleEventDrop(
    info: any
  ) {
    try {
      const bookingId =
        info.event.id;

      const newDate =
        info.event.start;

      await updateDoc(
        doc(
          db,
          "bookings",
          bookingId
        ),
        {
          date:
            newDate.toDateString(),
        }
      );

      alert(
        "Booking updated"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Update failed"
      );
    }
  }

  function handleDateClick(
    info: any
  ) {
    alert(
      `Selected ${info.dateStr}`
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white p-3 md:p-5 text-black shadow-2xl">
      
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ]}

        initialView="dayGridMonth"

        editable={true}

        selectable={true}

        eventStartEditable={true}

        dayMaxEvents={3}

        weekends={true}

        events={events}

        dateClick={
          handleDateClick
        }

        eventDrop={
          handleEventDrop
        }

        headerToolbar={{
          left:
            "prev,next today",

          center: "title",

          right:
            "dayGridMonth,timeGridWeek,timeGridDay",
        }}

        height="auto"

        eventClassNames={() =>
          [
            "!rounded-xl",
            "!border-0",
            "!px-2",
            "!py-1",
            "!font-semibold",
            "!shadow-lg",
          ]
        }

        dayHeaderClassNames={() =>
          [
            "bg-black/5",
            "font-bold",
            "text-black",
          ]
        }

        viewClassNames={() =>
          ["rounded-2xl"]
        }
      />
    </div>
  );
}
import { useEffect } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function RealtimeNotifications() {
  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(db, "bookings"),
        (snapshot) => {
          snapshot.docChanges().forEach(
            (change) => {
              if (
                change.type ===
                "added"
              ) {
                const booking =
                  change.doc.data();

                alert(
                  `New Booking: ${booking.name}`
                );
              }
            }
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  return null;
}
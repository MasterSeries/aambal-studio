import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

export async function getBookedSlots(
  date: string
) {
  const q = query(
    collection(db, "bookings"),

    where("date", "==", date)
  );

  const snapshot =
    await getDocs(q);

  const booked: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.timeSlots) {
      booked.push(
        ...data.timeSlots
      );
    }

    else if (data.time) {
      booked.push(data.time);
    }
  });

  return booked;
}
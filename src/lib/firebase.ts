import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOF0Knm8-1NGVIs_6qhzxe0zEULYMs7cY",
  authDomain: "aambal-booking.firebaseapp.com",
  projectId: "aambal-booking",
  storageBucket: "aambal-booking.firebasestorage.app",
  messagingSenderId: "1011185229232",
  appId: "1:1011185229232:web:e62fed228bb90d76564a75",
  measurementId: "G-PTE5TTZ0E8"
};

const app =
  initializeApp(firebaseConfig);

export const db =
  getFirestore(app);

export const auth =
  getAuth(app);

export const storage =
  getStorage(app);
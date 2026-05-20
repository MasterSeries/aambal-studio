import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const Route = createFileRoute(
  "/customer-login"
)({
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      onAuthStateChanged(auth, (user) => {
        if (user) {
          window.location.href =
            "/customer-dashboard";
        }
      });
    } catch (err) {
      console.error(err);

      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-4xl">
            👤
          </div>

          <h1 className="mt-6 text-5xl font-bold">
            Customer Login
          </h1>

          <p className="mt-3 text-white/60">
            Access your bookings &
            appointments
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-primary"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none transition focus:border-primary"
          />

          {/* BUTTONS */}
<div className="space-y-4">
  
  {/* LOGIN */}
  <button
    onClick={handleLogin}
    className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 py-4 text-lg font-bold text-white shadow-lg shadow-pink-500/20 transition duration-300 hover:scale-[1.02]"
  >
    Login
  </button>

  {/* SIGNUP */}
  <a
    href="/customer-signup"
    className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4 text-lg font-semibold text-white transition duration-300 hover:border-pink-400 hover:bg-pink-500/10 hover:text-pink-300"
  >
    Create Customer Account
  </a>
</div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/40">
          Secure Customer Access
        </div>
      </div>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const Route = createFileRoute(
  "/customer-signup"
)({
  component: CustomerSignupPage,
});

function CustomerSignupPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup() {
    if (
      !name ||
      !email ||
      !password
    ) {
      alert(
        "Please fill all fields"
      );

      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert(
        "Account created successfully!"
      );

      window.location.href =
        "/customer-dashboard";
    } catch (err: any) {
      console.error(err);

      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07070b] px-6 text-white">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute left-[-120px] top-[-120px] h-[350px] w-[350px] rounded-full bg-pink-500/20 blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-pink-500/20 blur-3xl" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-[36px] border border-white/10 bg-white/[0.04] p-10 backdrop-blur-3xl">
        
        {/* ICON */}
        <div className="mb-8 flex justify-center">
          
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-500/15 text-5xl">
            ✨
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-center text-5xl font-black tracking-tight">
          Customer Signup
        </h1>

        <p className="mt-4 text-center text-white/50">
          Create your festival account
        </p>

        {/* FORM */}
        <div className="mt-10 space-y-5">
          
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 py-4 text-lg font-bold text-white shadow-lg shadow-pink-500/20 transition duration-300 hover:scale-[1.02]"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </div>

        {/* LOGIN LINK */}
        <div className="mt-8 text-center text-sm text-white/50">
          Already have an account?
          
          <a
            href="/customer-login"
            className="ml-2 text-pink-300 hover:text-pink-200"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
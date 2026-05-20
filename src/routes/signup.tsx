import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const Route = createFileRoute(
  "/signup"
)({
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup() {
    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account Created!");

      window.location.href =
        "/customer-login";
    } catch (err) {
      console.error(err);

      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="mb-8 text-5xl font-bold">
          Customer Signup
        </h1>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
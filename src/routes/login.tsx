import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");

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

      window.location.href = "/admin";
    } catch (err: any) {
      console.error(err);

      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-2xl">
        <div className="mb-10 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-4xl">
            📸
          </div>

          <h1 className="mt-6 text-5xl font-bold">
            Admin Login
          </h1>

          <p className="mt-3 text-white/60">
            Aambal Vasantham Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-bold"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
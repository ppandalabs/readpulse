"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleAuth() {
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");

    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setError(error.message);
      else setMessage("Account created! You can now sign in.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium text-white">
            Read<span className="text-amber-500">Pulse</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Your personal reading companion
          </p>
        </div>

        {/* Card */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900">

          {/* Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-amber-500 text-black"
                  : "text-gray-400"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-amber-500 text-black"
                  : "text-gray-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Fields */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-3 mb-3 outline-none border border-gray-700 focus:border-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-3 mb-4 outline-none border border-gray-700 focus:border-amber-500"
          />

          {/* Error / Message */}
          {error && (
            <p className="text-red-400 text-xs mb-4 text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-400 text-xs mb-4 text-center">{message}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-lg bg-amber-500 text-black text-sm font-medium disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "signin" ? "Sign In" : "Create Account"
            }
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          ReadPulse — Read. Reflect. Remember.
        </p>
      </div>
    </main>
  );
}
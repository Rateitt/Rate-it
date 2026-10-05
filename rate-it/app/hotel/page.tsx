"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function HotelLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (hotelError) {
      await supabase.auth.signOut();
      setError("Unable to load your hotel account. Please try again.");
      setLoading(false);
      return;
    }

    if (!hotel) {
      await supabase.auth.signOut();
      setError("No hotel account is connected to this login.");
      setLoading(false);
      return;
    }

    router.replace("/hotel/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Rate-It
        </h1>

        <h2
          style={{
            fontSize: "24px",
            marginBottom: "8px",
          }}
        >
          Hotel Partner Login
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "28px",
          }}
        >
          Sign in to manage your hotel.
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Hotel account email"
            required
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                background: "#fff1f1",
                color: "#c62828",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "18px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Hotel Owner Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
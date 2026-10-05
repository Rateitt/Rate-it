"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setLoading(false);
        setError(loginError.message);
        return;
      }

      if (!data.user) {
        setLoading(false);
        setError("Login failed. Please try again.");
        return;
      }

      /*
       * We will add the real admin authorization check
       * before allowing access to the admin dashboard.
       */
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);

      setLoading(false);

      if (err instanceof Error) {
        setError(`Connection error: ${err.message}`);
      } else {
        setError("Unable to connect. Please try again.");
      }
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "35px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: "#111827",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          Rate-It
        </button>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "30px",
            color: "#111827",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            margin: "0 0 25px",
            color: "#6b7280",
          }}
        >
          Sign in to manage the Rate-It platform.
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Admin email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "15px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "14px",
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
              background: loading ? "#6b7280" : "#111827",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            marginTop: "20px",
            border: "none",
            background: "transparent",
            color: "#6b7280",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          ← Back to Rate-It
        </button>
      </div>
    </main>
  );
}
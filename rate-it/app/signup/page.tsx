"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CustomerSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setLoading(false);
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setLoading(false);
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

      if (signupError) {
        setLoading(false);
        setError(signupError.message);
        return;
      }

      if (!data.user) {
        setLoading(false);
        setError("Account could not be created. Please try again.");
        return;
      }

      const { error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
          },
          {
            onConflict: "id",
          }
        );

      if (customerError) {
        console.error("CUSTOMER PROFILE ERROR:", customerError);
        setLoading(false);
        setError(
          "Your account was created, but your customer profile could not be saved."
        );
        return;
      }

      setLoading(false);

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setSuccess(
        "Account created successfully. Please check your email to confirm your account, then sign in."
      );
    } catch (err) {
      console.error("CUSTOMER SIGNUP ERROR:", err);

      setLoading(false);

      if (err instanceof Error) {
        setError(`Connection error: ${err.message}`);
      } else {
        setError("Unable to create your account. Please try again.");
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
          maxWidth: "460px",
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
          Create your account
        </h1>

        <p
          style={{
            margin: "0 0 25px",
            color: "#6b7280",
            lineHeight: "1.5",
          }}
        >
          Create a Rate-It account to manage your bookings and stays.
        </p>

        <form onSubmit={handleSignup}>
          <label
            style={{
              display: "block",
              marginBottom: "7px",
              fontWeight: "600",
            }}
          >
            Full name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
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
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
            Confirm password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter your password again"
            autoComplete="new-password"
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

          {success && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "8px",
                background: "#f0fdf4",
                color: "#166534",
                fontSize: "14px",
              }}
            >
              {success}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#111827",
              fontWeight: "700",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sign in
          </button>
        </div>

        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              border: "none",
              background: "transparent",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            ← Back to Rate-It
          </button>
        </div>
      </div>
    </main>
  );
}
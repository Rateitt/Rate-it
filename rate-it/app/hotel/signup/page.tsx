"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function HotelSignupPage() {
  const router = useRouter();

  const [hotelName, setHotelName] = useState("");
  const [location, setLocation] = useState("");
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

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
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

    const { error: hotelError } = await supabase.from("hotels").insert({
      user_id: data.user.id,
      hotel_name: hotelName.trim(),
      location: location.trim(),
    });

    if (hotelError) {
      setLoading(false);
      setError(
        "Your account was created, but your hotel information could not be saved. Please contact support."
      );
      return;
    }

    setLoading(false);

    if (data.session) {
      router.push("/hotel/dashboard");
      return;
    }

    setSuccess(
      "Hotel account created successfully. Please check your email to confirm your account, then log in."
    );
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
          maxWidth: "500px",
          background: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Rate-It
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666666",
            marginBottom: "28px",
          }}
        >
          Create Hotel Account
        </p>

        <form onSubmit={handleSignup}>
          <label
            htmlFor="hotelName"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Hotel Name
          </label>

          <input
            id="hotelName"
            type="text"
            value={hotelName}
            onChange={(event) => setHotelName(event.target.value)}
            placeholder="Your hotel name"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
            }}
          />

          <label
            htmlFor="location"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Hotel Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, country"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
            }}
          />

          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Hotel Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hotel@example.com"
            autoComplete="email"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
            }}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
            }}
          />

          <label
            htmlFor="confirmPassword"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border: "1px solid #d0d0d0",
              borderRadius: "8px",
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "8px",
                background: "#fff0f0",
                color: "#c62828",
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
                background: "#effaf0",
                color: "#247a32",
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
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#111111",
              color: "#ffffff",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Create Hotel Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/hotel/login")}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            border: "1px solid #dddddd",
            borderRadius: "8px",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          Already have a hotel account? Log in
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "12px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#666666",
          }}
        >
          Back to Rate-It
        </button>
      </div>
    </main>
  );
}
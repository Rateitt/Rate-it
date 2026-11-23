"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: submitError } = await supabase
        .from("contact_messages")
        .insert([
          {
            full_name: fullName.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          },
        ]);

      if (submitError) {
        throw submitError;
      }

      setSuccess(
        "Thank you for contacting Rate-It. Your message has been received."
      );

      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError(
        "We could not send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Link href="/">
            <img
              src="/logo.png"
              alt="Rate-It"
              style={{ height: "48px", width: "auto" }}
            />
          </Link>

          <Link
            href="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: "750px",
          margin: "0 auto",
          padding: "55px 20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <p
            style={{
              color: "#2563eb",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "13px",
            }}
          >
            Rate-It Support
          </p>

          <h1
            style={{
              fontSize: "38px",
              color: "#111827",
              margin: "12px 0",
            }}
          >
            Contact Us
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: "17px",
              lineHeight: "1.7",
            }}
          >
            Have a question or need assistance?
            Send us a message. Our team will be happy
            to help with your enquiry.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="fullName"
              style={labelStyle}
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              required
              maxLength={150}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={labelStyle}>
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="subject" style={labelStyle}>
              Subject
            </label>

            <input
              id="subject"
              type="text"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you need help with?"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label htmlFor="message" style={labelStyle}>
              Your Message
            </label>

            <textarea
              id="message"
              required
              maxLength={5000}
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe how we can help you..."
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "150px",
              }}
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                color: "#15803d",
                background: "#f0fdf4",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "8px",
              background: loading ? "#6b7280" : "#111827",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending Message..." : "Send Message"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Thank you for choosing Rate-It.
          Discover. Compare. Stay.
        </p>
      </section>
    </main>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: "700",
  marginBottom: "9px",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  fontFamily: "Arial, sans-serif",
};
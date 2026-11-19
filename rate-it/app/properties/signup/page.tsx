"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ProviderSignup() {
  const router = useRouter();

  const [form, setForm] = useState({
    business_name: "",
    provider_type: "car_rental",
    contact_name: "",
    phone: "",
    email: "",
    business_address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function registerProvider(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: signupError,
      } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            business_name: form.business_name,
            provider_type: form.provider_type,
            contact_name: form.contact_name,
            phone: form.phone,
            business_address: form.business_address,
          },
        },
      });

      if (signupError) throw signupError;
      if (!user) throw new Error("Account creation failed.");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(
          "Your account has been created. Please confirm your email, then sign in. Your provider profile still needs to be created after sign-in."
        );
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("providers")
        .insert({
          user_id: user.id,
          business_name: form.business_name.trim(),
          provider_type: form.provider_type,
          contact_name: form.contact_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          business_address: form.business_address.trim(),
          verification_status: "pending",
        });

      if (profileError) throw profileError;

      setMessage("Registration successful! Your account is pending verification.");

      setTimeout(() => {
        router.push("/providers/dashboard");
      }, 1500);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-sm border p-7">
        <h1 className="text-3xl font-bold text-blue-950">
          Become a Rate-It Provider
        </h1>

        <p className="text-gray-600 mt-2 mb-7">
          Register your business and list your services on Rate-It.
        </p>

        <form onSubmit={registerProvider} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Business name</label>
            <input
              name="business_name"
              value={form.business_name}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Provider type</label>
            <select
              name="provider_type"
              value={form.provider_type}
              onChange={updateField}
              className="w-full border rounded-lg p-3"
            >
              <option value="hotel">Hotel</option>
              <option value="property_rental">Property rental</option>
              <option value="car_rental">Car rental</option>
              <option value="airport_transfer">Airport transfer</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Contact person</label>
            <input
              name="contact_name"
              value={form.contact_name}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3"
              placeholder="+256..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Business email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3"
              placeholder="business@example.com"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Business address</label>
            <input
              name="business_address"
              value={form.business_address}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3"
              placeholder="City, country"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={8}
              className="w-full border rounded-lg p-3"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-950 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create provider account"}
          </button>
        </form>

        {message && (
          <p className="mt-5 p-3 rounded-lg bg-blue-50 text-blue-900">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already registered?{" "}
          <a href="/login" className="text-blue-700 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
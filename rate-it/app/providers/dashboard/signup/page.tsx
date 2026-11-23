"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function ProviderSignupPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState("property_rental");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            business_name: businessName.trim(),
            provider_type: providerType,
            contact_name: contactName.trim(),
            phone: phone.trim(),
            business_address: businessAddress.trim(),
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Registration could not be completed.");
      }

      if (!data.session) {
        setMessage(
          "Your account has been created. Please confirm your email, then sign in. Your provider profile must be completed after confirmation."
        );
        return;
      }

      const { error: profileError } = await supabase
        .from("providers")
        .upsert(
          {
            user_id: data.user.id,
            business_name: businessName.trim(),
            provider_type: providerType,
            contact_name: contactName.trim(),
            phone: phone.trim(),
            email: cleanEmail,
            business_address: businessAddress.trim(),
            verification_status: "pending",
          },
          { onConflict: "user_id" }
        );

      if (profileError) throw profileError;

      router.push("/providers/dashboard");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          Register as a Provider
        </h1>

        <p className="mb-6 text-gray-600">
          Join Rate-It and list your services on our marketplace.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Business Name</label>
            <input required value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Enter business name" />
          </div>

          <div>
            <label className="mb-1 block font-medium">Provider Type</label>
            <select value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              className="w-full rounded-lg border p-3">
              <option value="property_rental">Property Rental</option>
              <option value="car_rental">Car Rental</option>
              <option value="airport_transfer">Airport Transfer</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">Contact Person</label>
            <input required value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Full name" />
          </div>

          <div>
            <label className="mb-1 block font-medium">Phone Number</label>
            <input required value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Phone number" />
          </div>

          <div>
            <label className="mb-1 block font-medium">Email Address</label>
            <input required type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Email address" />
          </div>

          <div>
            <label className="mb-1 block font-medium">Business Address</label>
            <input required value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="City and business address" />
          </div>

          <div>
            <label className="mb-1 block font-medium">Password</label>
            <input required type="password" minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Create a password" />
          </div>

          {message && (
            <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-50">
            {loading ? "Creating Account..." : "Register as Provider"}
          </button>
        </form>
      </div>
    </main>
  );
}
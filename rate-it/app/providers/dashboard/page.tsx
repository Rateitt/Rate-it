"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Provider = {
  id: string;
  name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  status?: string;
  verification_status?: string;
};

export default function ProviderDashboard() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState({
    hotels: 0,
    properties: 0,
    vehicles: 0,
    transfers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Please sign in to access your provider dashboard.");
        setLoading(false);
        return;
      }

      const { data: providerData, error } = await supabase
        .from("providers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !providerData) {
        setMessage(
          "No provider profile was found for this account. Please contact Rate-It support."
        );
        setLoading(false);
        return;
      }

      setProvider(providerData as Provider);

      const [hotels, properties, vehicles, transfers] =
        await Promise.all([
          supabase.from("hotels").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("property").select("id", { count: "exact", head: true }).eq("provider_id", providerData.id),
          supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("provider_id", providerData.id),
          supabase.from("transfer_services").select("id", { count: "exact", head: true }).eq("provider_id", providerData.id),
        ]);

      setServices({
        hotels: hotels.count || 0,
        properties: properties.count || 0,
        vehicles: vehicles.count || 0,
        transfers: transfers.count || 0,
      });

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading provider dashboard...
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="bg-white rounded-xl border p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Provider account</h1>
          <p className="text-gray-600">{message}</p>
          <a href="/login" className="inline-block mt-6 bg-blue-700 text-white px-6 py-3 rounded-lg">
            Sign in
          </a>
        </div>
      </main>
    );
  }

  const cards = [
    { name: "Hotels", count: services.hotels, url: "/hotel/dashboard" },
    { name: "Properties", count: services.properties, url: "/properties" },
    { name: "Car rentals", count: services.vehicles, url: "/cars" },
    { name: "Airport transfers", count: services.transfers, url: "/transfers" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rate-It Provider Portal</h1>
            <p className="text-blue-200 text-sm mt-1">
              Manage your marketplace services
            </p>
          </div>
          <button
            onClick={signOut}
            className="bg-white text-blue-950 rounded-lg px-5 py-2 font-semibold"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <div className="bg-white border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold">
            Welcome, {provider.business_name || provider.name || "Provider"}
          </h2>
          <p className="text-gray-500 mt-2">
            {provider.email || ""}
          </p>
          <p className="text-gray-500 mt-1">
            {provider.city || ""} {provider.country || ""}
          </p>
          <p className="mt-4 text-sm">
            Verification status:{" "}
            <strong>
              {provider.verification_status || provider.status || "Pending"}
            </strong>
          </p>
        </div>

        <h2 className="text-xl font-bold mb-5">Your services</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <a
              href={card.url}
              key={card.name}
              className="bg-white border rounded-xl p-6 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{card.name}</h3>
              <p className="text-3xl font-bold text-blue-700 mt-4">
                {card.count}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Registered listings
              </p>
              <span className="text-blue-700 text-sm mt-4 inline-block">
                Manage services →
              </span>
            </a>
          ))}
        </div>

        <div className="bg-white border rounded-xl p-6 mt-8">
          <h2 className="font-bold text-xl mb-3">Provider support</h2>
          <p className="text-gray-600">
            Need help managing your listings or bookings?
            Contact Rate-It support.
          </p>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Transfer = {
  id: string | number;
  provider_id?: string;
  name?: string;
  service_name?: string;
  vehicle_type?: string;
  airport?: string;
  pickup_location?: string;
  destination?: string;
  city?: string;
  country?: string;
  price?: number;
  price_per_trip?: number;
  currency?: string;
  seats?: number;
  description?: string;
  status?: string;
};

export default function TransfersPage() {
  const [services, setServices] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransfers() {
      const { data, error } = await supabase
        .from("transfer_services")
        .select("*")
        .limit(100);

      if (error) {
        setError("Unable to load airport transfer services.");
      } else {
        setServices((data || []) as Transfer[]);
      }

      setLoading(false);
    }

    loadTransfers();
  }, []);

  const filteredServices = services.filter((service) => {
    const details = [
      service.name,
      service.service_name,
      service.vehicle_type,
      service.airport,
      service.pickup_location,
      service.destination,
      service.city,
      service.country,
    ].join(" ").toLowerCase();

    return details.includes(search.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>
          <nav className="flex gap-4 text-sm">
            <a href="/hotels">Hotels</a>
            <a href="/properties">Properties</a>
            <a href="/cars">Cars</a>
            <a href="/transfers">Transfers</a>
          </nav>
        </div>
      </header>

      <section className="bg-blue-950 text-white px-5 py-16 text-center">
        <p className="text-blue-300 font-semibold mb-3">
          RATE-IT AIRPORT TRANSFERS
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-5">
          Your journey starts here
        </h1>

        <p className="text-blue-100 mb-8">
          Find reliable airport pickups and private transfers.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search airport, destination or vehicle"
          className="w-full max-w-2xl p-4 rounded-xl text-gray-900"
        />
      </section>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold mb-7">
          Airport transfer services
        </h2>

        {loading && <p>Loading transfer services...</p>}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center border">
            <h3 className="text-xl font-bold mb-2">
              No transfer services available yet
            </h3>
            <p className="text-gray-500">
              New airport transfer providers will appear here.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="bg-white rounded-xl border overflow-hidden shadow-sm"
            >
              <div className="h-44 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">
                  Transfer vehicle
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold">
                  {service.name ||
                    service.service_name ||
                    service.vehicle_type ||
                    "Airport transfer"}
                </h3>

                <p className="text-gray-500 mt-3">
                  {service.airport || service.pickup_location || "Pickup location available on request"}
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Destination: {service.destination || "Contact provider"}
                </p>

                {service.seats && (
                  <p className="text-sm text-gray-600 mt-2">
                    {service.seats} passengers
                  </p>
                )}

                <p className="text-gray-600 text-sm mt-3">
                  {service.description}
                </p>

                <div className="flex justify-between items-center mt-5">
                  <div>
                    <p className="text-blue-800 font-bold">
                      {service.currency || "UGX"}{" "}
                      {(service.price ?? service.price_per_trip)?.toLocaleString() || "Contact"}
                    </p>
                    <p className="text-xs text-gray-500">Per trip</p>
                  </div>

                  <a
                    href={`/transfers/book?service=${encodeURIComponent(String(service.id))}`}
                    className="bg-blue-700 text-white rounded-lg px-5 py-3 font-semibold"
                  >
                    Book transfer
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Vehicle = {
  id: string | number;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
  city?: string;
  country?: string;
  pickup_location?: string;
  price_per_day?: number;
  currency?: string;
  seats?: number;
  transmission?: string;
  fuel?: string;
  features?: string[];
  status?: string;
  [key: string]: unknown;
};

export default function CarsPage() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCars() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .limit(100);

      if (error) {
        setError("Unable to load vehicles. Please try again.");
      } else {
        setCars((data || []) as Vehicle[]);
      }

      setLoading(false);
    }

    loadCars();
  }, []);

  const filteredCars = cars.filter((car) => {
    const text = [
      car.make,
      car.model,
      car.type,
      car.city,
      car.country,
      car.pickup_location,
    ].join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
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
          RATE-IT CAR RENTALS
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-5">
          Find the right car for your journey
        </h1>
        <p className="text-blue-100 mb-8">
          Compare vehicles, prices and rental options.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city, car model or vehicle type"
          className="w-full max-w-2xl p-4 rounded-xl text-gray-900"
        />
      </section>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-bold mb-7">
          Available rental vehicles
        </h2>

        {loading && <p>Loading vehicles...</p>}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && filteredCars.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center border">
            <h3 className="text-xl font-bold mb-2">
              No vehicles available yet
            </h3>
            <p className="text-gray-500">
              Check back soon for rental vehicles.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <article
              key={car.id}
              className="bg-white rounded-xl border overflow-hidden shadow-sm"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Vehicle photo</span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-xl">
                  {car.make} {car.model}
                </h3>

                <p className="text-gray-500 mt-2">
                  {car.year || "Year not specified"} · {car.type || "Vehicle"}
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  {car.city}, {car.country}
                </p>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  {car.seats && <p>{car.seats} seats</p>}
                  {car.transmission && <p>{car.transmission}</p>}
                  {car.fuel && <p>{car.fuel}</p>}
                </div>

                <div className="mt-5 flex justify-between items-center">
                  <div>
                    <p className="text-blue-800 font-bold">
                      {car.currency || "UGX"}{" "}
                      {car.price_per_day?.toLocaleString() || "Contact"}
                    </p>
                    <p className="text-xs text-gray-500">Per day</p>
                  </div>

                  <a
                    href={`/cars/${car.id}`}
                    className="bg-blue-700 text-white rounded-lg px-5 py-3 font-semibold"
                  >
                    View car
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
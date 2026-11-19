"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Vehicle = {
  id: string | number;
  make?: string;
  model?: string;
  year?: number;
  vehicle_type?: string;
  type?: string;
  city?: string;
  country?: string;
  pickup_location?: string;
  price_per_day?: number;
  currency?: string;
  seats?: number;
  transmission?: string;
  fuel_type?: string;
  features?: string[] | string;
  status?: string;
};

type VehiclePhoto = {
  id: string | number;
  image_url: string;
};

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [car, setCar] = useState<Vehicle | null>(null);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCar() {
      if (!id) return;

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("This vehicle could not be found.");
        setLoading(false);
        return;
      }

      setCar(data as Vehicle);

      const { data: photoData } = await supabase
        .from("vehicle_photos")
        .select("*")
        .eq("vehicle_id", id);

      setPhotos((photoData || []) as VehiclePhoto[]);
      setLoading(false);
    }

    loadCar();
  }, [id]);

  if (loading) {
    return <main className="p-10 text-center">Loading vehicle...</main>;
  }

  if (error || !car) {
    return (
      <main className="min-h-screen p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Vehicle unavailable</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => router.push("/cars")}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Back to cars
        </button>
      </main>
    );
  }

  const vehicleType = car.vehicle_type || car.type || "Vehicle";
  const fuel = car.fuel_type || "Not specified";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-5">
        <div className="max-w-6xl mx-auto flex justify-between">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>
          <a href="/cars" className="text-blue-700 font-semibold">
            All cars
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold mb-3">
          {car.make} {car.model}
        </h1>

        <p className="text-gray-600 mb-7">
          {car.city}, {car.country}
        </p>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.image_url}
                alt={`${car.make} ${car.model}`}
                className="w-full h-72 object-cover rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center mb-8">
            <p className="text-gray-500">Vehicle photos not available</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-5">Vehicle details</h2>

            <div className="grid grid-cols-2 gap-5 text-gray-700">
              <p><strong>Year:</strong> {car.year || "Not specified"}</p>
              <p><strong>Type:</strong> {vehicleType}</p>
              <p><strong>Seats:</strong> {car.seats || "Not specified"}</p>
              <p><strong>Transmission:</strong> {car.transmission || "Not specified"}</p>
              <p><strong>Fuel:</strong> {fuel}</p>
              <p><strong>Pickup:</strong> {car.pickup_location || "Contact provider"}</p>
            </div>

            {car.features && (
              <div className="mt-7">
                <h3 className="font-bold mb-3">Features</h3>
                {Array.isArray(car.features) ? (
                  <ul className="list-disc pl-5 text-gray-600">
                    {car.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">{car.features}</p>
                )}
              </div>
            )}
          </section>

          <aside className="bg-white border rounded-xl p-6 h-fit">
            <p className="text-gray-500 mb-2">Rental price</p>
            <p className="text-2xl font-bold text-blue-800 mb-1">
              {car.currency || "UGX"}{" "}
              {car.price_per_day?.toLocaleString() || "Contact provider"}
            </p>
            <p className="text-sm text-gray-500 mb-6">Per day</p>

            <button
              onClick={() => router.push(`/cars/${car.id}/book`)}
              className="w-full bg-blue-700 text-white font-semibold rounded-lg py-3"
            >
              Book this car
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Confirm rental details with the provider before travelling.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
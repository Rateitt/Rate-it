"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Vehicle = {
  id: string | number;
  make?: string;
  model?: string;
  price_per_day?: number;
  currency?: string;
  city?: string;
  pickup_location?: string;
  status?: string;
};

export default function CarBookingPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<Vehicle | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCar() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", carId)
        .single();

      if (error || !data) {
        setMessage("Vehicle could not be found.");
      } else {
        setCar(data as Vehicle);
        setPickupLocation(data.pickup_location || data.city || "");
      }

      setLoading(false);
    }

    if (carId) loadCar();
  }, [carId]);

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!car || !startDate || !endDate) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setMessage("Return date must be after pickup date.");
      return;
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/login");
      return;
    }

    const pickup = new Date(startDate);
    const returnDate = new Date(endDate);
    const days = Math.ceil(
      (returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = days * Number(car.price_per_day || 0);

    setSubmitting(true);

    const { error } = await supabase.from("vehicle_bookings").insert({
      vehicle_id: car.id,
      customer_user_id: authData.user.id,
      pickup_date: startDate,
      return_date: endDate,
      pickup_location: pickupLocation,
      rental_days: days,
      total_price: totalPrice,
      currency: car.currency || "UGX",
      status: "pending",
      payment_status: "unpaid",
      special_request: notes,
    });

    setSubmitting(false);

    if (error) {
      setMessage(
        "We could not submit your booking. Please try again later."
      );
      return;
    }

    router.push("/cars/bookings");
  }

  if (loading) {
    return <main className="p-10 text-center">Loading car details...</main>;
  }

  if (!car) {
    return (
      <main className="p-10 text-center">
        <p>{message || "Vehicle not found."}</p>
        <a href="/cars" className="text-blue-700 underline">
          Return to cars
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border p-6 md:p-8">
        <a href={`/cars/${car.id}`} className="text-blue-700 text-sm">
          ← Back to car details
        </a>

        <h1 className="text-3xl font-bold mt-5 mb-2">
          Book {car.make} {car.model}
        </h1>

        <p className="text-gray-500 mb-7">
          {car.city || "Location not specified"} ·{" "}
          {car.currency || "UGX"}{" "}
          {Number(car.price_per_day || 0).toLocaleString()} per day
        </p>

        <form onSubmit={handleBooking} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">
              Pickup date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Return date
            </label>
            <input
              type="date"
              required
              min={startDate || new Date().toISOString().split("T")[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Pickup location
            </label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Enter pickup location"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Special requests
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3"
              placeholder="Any additional information"
            />
          </div>

          {startDate && endDate && new Date(endDate) > new Date(startDate) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-semibold">Estimated rental total</p>
              <p className="text-xl font-bold text-blue-800 mt-1">
                {car.currency || "UGX"}{" "}
                {(
                  Math.ceil(
                    (new Date(endDate).getTime() -
                      new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) * Number(car.price_per_day || 0)
                ).toLocaleString()}
              </p>
            </div>
          )}

          {message && (
            <p className="text-red-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg p-4"
          >
            {submitting ? "Submitting booking..." : "Submit booking"}
          </button>
        </form>
      </div>
    </main>
  );
}
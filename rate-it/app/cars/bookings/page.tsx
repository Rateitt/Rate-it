"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CarBooking = {
  id: string | number;
  vehicle_id: string | number;
  pickup_date?: string;
  return_date?: string;
  rental_days?: number;
  total_price?: number;
  currency?: string;
  status?: string;
  payment_status?: string;
  pickup_location?: string;
  created_at?: string;
};

export default function CarBookingsPage() {
  const [bookings, setBookings] = useState<CarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("vehicle_bookings")
        .select("*")
        .eq("customer_user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Unable to load your car bookings. Please try again.");
      } else {
        setBookings((data || []) as CarBooking[]);
      }

      setLoading(false);
    }

    loadBookings();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>
          <a href="/cars" className="text-blue-700 font-semibold">
            Browse cars
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold mb-2">
          My Car Bookings
        </h1>
        <p className="text-gray-500 mb-8">
          View your car rental reservations and their status.
        </p>

        {loading && (
          <p className="text-gray-600">Loading your bookings...</p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <h2 className="text-xl font-bold mb-2">
              No car bookings yet
            </h2>
            <p className="text-gray-500 mb-6">
              Your car rental bookings will appear here.
            </p>
            <a
              href="/cars"
              className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse rental cars
            </a>
          </div>
        )}

        <div className="space-y-5">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="bg-white border rounded-xl p-5 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">
                    Car Booking #{booking.id}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Vehicle ID: {booking.vehicle_id}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {booking.status || "Pending"}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {booking.payment_status || "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                <div>
                  <p className="text-gray-500">Pickup date</p>
                  <p className="font-semibold">
                    {booking.pickup_date || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Return date</p>
                  <p className="font-semibold">
                    {booking.return_date || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Rental days</p>
                  <p className="font-semibold">
                    {booking.rental_days ?? "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Total price</p>
                  <p className="font-bold text-blue-800">
                    {booking.currency || "UGX"}{" "}
                    {Number(booking.total_price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {booking.pickup_location && (
                <p className="text-sm text-gray-600 mt-5">
                  Pickup location: {booking.pickup_location}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
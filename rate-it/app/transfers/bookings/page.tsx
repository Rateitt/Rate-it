"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TransferBooking = {
  id: string | number;
  transfer_service_id?: string | number;
  pickup_date?: string;
  pickup_time?: string;
  pickup_location?: string;
  dropoff_location?: string;
  passengers?: number;
  total_price?: number;
  currency?: string;
  status?: string;
  payment_status?: string;
  special_request?: string;
  created_at?: string;
};

export default function TransferBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<TransferBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("transfer_bookings")
        .select("*")
        .eq("customer_user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Unable to load your transfer bookings. Please try again.");
      } else {
        setBookings((data || []) as TransferBooking[]);
      }

      setLoading(false);
    }

    loadBookings();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>
          <a href="/transfers" className="text-blue-700 font-semibold">
            Browse transfers
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold mb-2">
          My Airport Transfer Bookings
        </h1>

        <p className="text-gray-500 mb-8">
          View your airport pickup and transfer reservations.
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
              No transfer bookings yet
            </h2>

            <p className="text-gray-500 mb-6">
              Your airport transfer reservations will appear here.
            </p>

            <a
              href="/transfers"
              className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse airport transfers
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
                    Transfer Booking #{booking.id}
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Service ID: {booking.transfer_service_id || "Not specified"}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6 text-sm">
                <div>
                  <p className="text-gray-500">Pickup date</p>
                  <p className="font-semibold">
                    {booking.pickup_date || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Pickup time</p>
                  <p className="font-semibold">
                    {booking.pickup_time || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Passengers</p>
                  <p className="font-semibold">
                    {booking.passengers ?? "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Pickup location</p>
                  <p className="font-semibold">
                    {booking.pickup_location || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Drop-off location</p>
                  <p className="font-semibold">
                    {booking.dropoff_location || "Not specified"}
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

              {booking.special_request && (
                <div className="mt-5 text-sm">
                  <p className="text-gray-500">Special requests</p>
                  <p>{booking.special_request}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Property = {
  id: string | number;
  title?: string | null;
};

type PropertyBooking = {
  id: string | number;
  property_id: string | number;
  customer_user_id?: string | null;
  "check-in"?: string | null;
  check_out?: string | null;
  guests?: number | null;
  nights?: number | null;
  total_price?: number | null;
  currency?: string | null;
  status?: string | null;
  payment_status?: string | null;
  special_requests?: string | null;
  created_at?: string | null;
};

export default function PropertyBookingsPage() {
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in to view your property bookings.");
        setLoading(false);
        return;
      }

      const { data: provider, error: providerError } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (providerError) throw providerError;

      if (!provider) {
        setError("Your provider profile could not be found.");
        setLoading(false);
        return;
      }

      const { data: propertyRows, error: propertyError } = await supabase
        .from("property")
        .select("id, title")
        .eq("provider_id", provider.id);

      if (propertyError) throw propertyError;

      const ownedProperties = (propertyRows || []) as Property[];
      setProperties(ownedProperties);

      if (ownedProperties.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const propertyIds = ownedProperties.map((property) => property.id);

      const { data: bookingRows, error: bookingError } = await supabase
        .from("property_bookings")
        .select("*")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });

      if (bookingError) throw bookingError;

      setBookings((bookingRows || []) as PropertyBooking[]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Could not load property bookings.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(
    bookingId: string | number,
    status: "confirmed" | "cancelled"
  ) {
    setUpdatingId(bookingId);
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("property_bookings")
        .update({ status })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );

      setMessage(
        status === "confirmed"
          ? "Booking confirmed successfully."
          : "Booking cancelled successfully."
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Could not update this booking.";
      setError(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  }

  function propertyName(propertyId: string | number) {
    return (
      properties.find((property) => String(property.id) === String(propertyId))
        ?.title || "Property"
    );
  }

  function formatDate(value?: string | null) {
    if (!value) return "Not provided";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString();
  }

  function formatAmount(booking: PropertyBooking) {
    const amount = Number(booking.total_price || 0);
    const currency = booking.currency || "UGX";

    return `${currency} ${amount.toLocaleString()}`;
  }

  function statusStyle(status?: string | null) {
    switch ((status || "pending").toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl text-center">
          Loading property bookings...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Property Bookings
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage bookings for your properties.
            </p>
          </div>

          <button
            onClick={loadBookings}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Your properties</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {properties.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total bookings</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Pending bookings</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                bookings.filter(
                  (booking) =>
                    (booking.status || "pending").toLowerCase() === "pending"
                ).length
              }
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No property bookings yet
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bookings for your listed properties will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = (booking.status || "pending").toLowerCase();

              return (
                <section
                  key={booking.id}
                  className="rounded-xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {propertyName(booking.property_id)}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Booking reference: {booking.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                        booking.status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatDate(booking["check-in"])}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatDate(booking.check_out)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {booking.guests ?? "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Nights</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {booking.nights ?? "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Total booking amount</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatAmount(booking)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Payment arrangement</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        Pay at property
                      </p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Special requests
                      </p>
                      <p className="mt-1 text-sm text-gray-800">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}

                  {booking.created_at && (
                    <p className="mt-4 text-xs text-gray-500">
                      Booking received: {formatDate(booking.created_at)}
                    </p>
                  )}

                  {status !== "cancelled" && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                      {status !== "confirmed" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.id, "confirmed")
                          }
                          disabled={updatingId === booking.id}
                          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                        >
                          {updatingId === booking.id
                            ? "Updating..."
                            : "Confirm booking"}
                        </button>
                      )}

                      <button
                        onClick={() =>
                          updateBookingStatus(booking.id, "cancelled")
                        }
                        disabled={updatingId === booking.id}
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {updatingId === booking.id
                          ? "Updating..."
                          : "Cancel booking"}
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
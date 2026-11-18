"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Property = Record<string, any>;

export default function PropertyBookingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = String(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState("UGX");

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    async function loadProperty() {
      const { data, error } = await supabase
        .from("property")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (error || !data) {
        setMessage("Property could not be found.");
        return;
      }

      setProperty(data);

      const price =
        data.price_per_night ??
        data.nightly_price ??
        data.price ??
        data.rent_price ??
        0;

      setCurrency(data.currency || "UGX");

      if (!Number(price) || Number(price) <= 0) {
        setMessage("The property price has not been configured yet.");
      }
    }

    loadProperty();
  }, [propertyId]);

  async function calculatePrice() {
    setMessage("");
    setTotalPrice(null);

    if (!checkIn || !checkOut || !property) {
      setMessage("Please select your check-in and check-out dates.");
      return;
    }

    if (checkIn < today || checkOut <= checkIn) {
      setMessage("Please select valid future dates.");
      return;
    }

    const start = new Date(`${checkIn}T00:00:00Z`);
    const end = new Date(`${checkOut}T00:00:00Z`);
    const nights = Math.round(
      (end.getTime() - start.getTime()) / 86400000
    );

    const basePrice = Number(
      property.price_per_night ??
      property.nightly_price ??
      property.price ??
      property.rent_price ??
      0
    );

    if (!basePrice || basePrice <= 0) {
      setMessage("This property does not have a valid nightly price.");
      return;
    }

    const { data: availability, error } = await supabase
      .from("property_availability")
      .select("availability,is_available,price_override")
      .eq("property_id", propertyId)
      .gte("availability", checkIn)
      .lt("availability", checkOut);

    if (error) {
      setMessage("Could not check availability: " + error.message);
      return;
    }

    if (!availability || availability.length !== nights) {
      setMessage(
        "Availability has not been confirmed for every night. Please contact the property."
      );
      return;
    }

    if (availability.some((day) => day.is_available !== true)) {
      setMessage("Sorry, this property is unavailable for some selected dates.");
      return;
    }

    const total = availability.reduce((sum, day) => {
      const override = Number(day.price_override);
      return sum + (override > 0 ? override : basePrice);
    }, 0);

    setTotalPrice(total);
    setMessage("Dates are available. You can continue with your booking.");
  }

  async function submitBooking() {
    setMessage("");

    if (!property || !checkIn || !checkOut || totalPrice === null) {
      setMessage("Please check availability and calculate the price first.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Please sign in before making a booking.");
        router.push("/login");
        return;
      }

      const start = new Date(`${checkIn}T00:00:00Z`);
      const end = new Date(`${checkOut}T00:00:00Z`);
      const nights = Math.round(
        (end.getTime() - start.getTime()) / 86400000
      );

      // Check for another booking covering any of the selected dates.
      const { data: existingBookings, error: bookingCheckError } =
        await supabase
          .from("property_bookings")
          .select("id,status")
          .eq("property_id", propertyId)
          .lt("check_in_date", checkOut)
          .gt("check_out_date", checkIn);

      if (bookingCheckError) {
        throw bookingCheckError;
      }

      const blockingStatuses = ["pending", "confirmed"];

      if (
        existingBookings?.some((booking) =>
          blockingStatuses.includes(
            String(booking.status || "").toLowerCase()
          )
        )
      ) {
        setMessage("These dates have already been booked. Please choose other dates.");
        return;
      }

      // Recheck daily availability immediately before saving.
      const { data: latestAvailability, error: availabilityError } =
        await supabase
          .from("property_availability")
          .select("availability,is_available")
          .eq("property_id", propertyId)
          .gte("availability", checkIn)
          .lt("availability", checkOut);

      if (availabilityError) {
        throw availabilityError;
      }

      if (
        !latestAvailability ||
        latestAvailability.length !== nights ||
        latestAvailability.some((day) => day.is_available !== true)
      ) {
        setMessage("Availability has changed. Please check your dates again.");
        setTotalPrice(null);
        return;
      }

      const { error: insertError } = await supabase
        .from("property_bookings")
        .insert({
          property_id: propertyId,
          customer_user_id: user.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests,
          nights,
          total_price: totalPrice,
          currency,
          status: "pending",
          payment_status: "pay_at_property",
          special_requests: specialRequests,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("Your booking request has been submitted successfully.");
      setTimeout(() => router.push("/properties"), 1500);
    } catch (error: any) {
      setMessage(error.message || "Booking could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  const propertyName =
    property?.name ||
    property?.title ||
    property?.property_name ||
    "Property";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          Book {propertyName}
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Choose your dates and confirm your booking details.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Check-in date</label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setTotalPrice(null);
              }}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Check-out date</label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setTotalPrice(null);
              }}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Guests</label>
            <input
              type="number"
              min="1"
              max="30"
              value={guests}
              onChange={(e) =>
                setGuests(Math.max(1, Number(e.target.value)))
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Special requests
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any requests for the property?"
              className="w-full rounded-lg border p-3"
              rows={3}
            />
          </div>

          <button
            type="button"
            onClick={calculatePrice}
            className="w-full rounded-lg bg-gray-800 p-3 font-semibold text-white"
          >
            Check availability and price
          </button>

          {totalPrice !== null && (
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="font-semibold">Total for your stay</p>
              <p className="text-2xl font-bold">
                {currency} {totalPrice.toLocaleString()}
              </p>
            </div>
          )}

          {message && (
            <p className="rounded-lg bg-gray-100 p-3 text-sm">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={submitBooking}
            disabled={loading || totalPrice === null}
            className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm booking request"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Payment is made directly at the property.
          </p>
        </div>
      </div>
    </main>
  );
}
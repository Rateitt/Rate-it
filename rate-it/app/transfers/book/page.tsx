"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TransferService = {
  id: string | number;
  service_name: string;
  description?: string;
  airport_name?: string;
  pickup_location?: string;
  dropoff_location?: string;
  vehicle_type?: string;
  max_passengers?: number;
  price?: number;
  currency?: string;
};

export default function TransferBookingPage() {
  const router = useRouter();

  const [services, setServices] = useState<TransferService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from("transfer_services")
        .select("*")
        .eq("status", "active");

      if (error) {
        setMessage("Unable to load transfer services.");
      } else {
        const available = (data || []) as TransferService[];
        setServices(available);

        if (available.length > 0) {
          setServiceId(String(available[0].id));
          setPickup(available[0].pickup_location || "");
          setDropoff(available[0].dropoff_location || "");
        }
      }

      setLoading(false);
    }

    loadServices();
  }, []);

  const selectedService = services.find(
    (service) => String(service.id) === serviceId
  );

  function changeService(value: string) {
    setServiceId(value);
    const service = services.find(
      (item) => String(item.id) === value
    );

    if (service) {
      setPickup(service.pickup_location || "");
      setDropoff(service.dropoff_location || "");
    }
  }

  async function handleBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedService || !pickupDate || !pickupTime || !pickup || !dropoff) {
      setMessage("Please complete all required fields.");
      return;
    }

    const passengerCount = Number(passengers);

    if (
      passengerCount < 1 ||
      (selectedService.max_passengers &&
        passengerCount > selectedService.max_passengers)
    ) {
      setMessage("Please enter a valid number of passengers.");
      return;
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("transfer_bookings")
      .insert({
        transfer_service_id: selectedService.id,
        customer_user_id: authData.user.id,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        pickup_location: pickup,
        dropoff_location: dropoff,
        passengers: passengerCount,
        total_price: selectedService.price || 0,
        currency: selectedService.currency || "UGX",
        status: "pending",
        payment_status: "unpaid",
        special_request: notes,
      });

    setSubmitting(false);

    if (error) {
      setMessage("Unable to submit your booking. Please try again.");
      return;
    }

    router.push("/transfers/bookings");
  }

  if (loading) {
    return <main className="p-10 text-center">Loading transfer services...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-6 md:p-8">
        <a href="/transfers" className="text-blue-700 text-sm">
          ← Back to airport transfers
        </a>

        <h1 className="text-3xl font-bold mt-5 mb-2">
          Book an Airport Transfer
        </h1>

        <p className="text-gray-500 mb-7">
          Arrange your airport pickup or drop-off with Rate-It.
        </p>

        {message && (
          <p className="bg-red-50 text-red-700 rounded-lg p-3 mb-5">
            {message}
          </p>
        )}

        {services.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="font-semibold">No transfer services available yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Please check back later.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-5">
            <div>
              <label className="block font-semibold mb-2">
                Select transfer service
              </label>
              <select
                value={serviceId}
                onChange={(e) => changeService(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.service_name}
                    {service.vehicle_type ? ` - ${service.vehicle_type}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold">
                  {selectedService.service_name}
                </p>
                {selectedService.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedService.description}
                  </p>
                )}
                <p className="text-blue-800 font-bold mt-2">
                  {selectedService.currency || "UGX"}{" "}
                  {Number(selectedService.price || 0).toLocaleString()}
                </p>
                {selectedService.max_passengers && (
                  <p className="text-sm text-gray-600 mt-1">
                    Maximum passengers: {selectedService.max_passengers}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block font-semibold mb-2">Pickup date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Pickup time</label>
              <input
                type="time"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Pickup location
              </label>
              <input
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Airport or pickup address"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Drop-off location
              </label>
              <input
                required
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Hotel or destination address"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Number of passengers
              </label>
              <input
                type="number"
                min="1"
                max={selectedService?.max_passengers || undefined}
                required
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Special requests
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Flight number, luggage details or other requests"
                className="w-full border rounded-lg p-3"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg p-4"
            >
              {submitting ? "Submitting..." : "Submit transfer booking"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
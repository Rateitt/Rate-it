"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Item = {
  id: string;
  [key: string]: any;
};

type Provider = {
  id: string;
  user_id: string;
  business_name: string;
  provider_type: string;
  email: string;
  verification_status: string;
};

export default function ProviderDashboard() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [listings, setListings] = useState<Item[]>([]);
  const [bookings, setBookings] = useState<Item[]>([]);
  const [commissions, setCommissions] = useState<Item[]>([]);
  const [payouts, setPayouts] = useState<Item[]>([]);
  const [availability, setAvailability] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [property, setProperty] = useState({
    title: "",
    description: "",
    property_type: "Apartment",
    country: "Uganda",
    city: "",
    address: "",
    bedrooms: "1",
    bathrooms: "1",
    max_guests: "2",
    price_per_night: "",
    currency: "UGX",
    amenities: "",
  });

  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vehicle_type: "SUV",
    registration_number: "",
    seats: "5",
    transmission: "Automatic",
    fuel_type: "Petrol",
    country: "Uganda",
    city: "",
    pickup_location: "",
    price_per_day: "",
    currency: "UGX",
    features: "",
  });

  const [transfer, setTransfer] = useState({
    service_name: "",
    description: "",
    airport_name: "",
    pickup_location: "",
    dropoff_location: "",
    vehicle_type: "Private car",
    max_passengers: "4",
    price: "",
    currency: "UGX",
  });

  const listingTable = (type: string) => {
    if (type === "car_rental") return "vehicles";
    if (type === "airport_transfer") return "transfer_services";
    return "properties";
  };

  const bookingTable = (type: string) => {
    if (type === "car_rental") return "vehicle_bookings";
    if (type === "airport_transfer") return "transfer_bookings";
    return "property_bookings";
  };

  const bookingForeignKey = (type: string) => {
    if (type === "car_rental") return "vehicle_id";
    if (type === "airport_transfer") return "transfer_service_id";
    return "property_id";
  };

  async function loadDashboard() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setMessage("Please sign in to access your provider dashboard.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setMessage("Your provider profile could not be found.");
        return;
      }

      setProvider(profile as Provider);

      const type = profile.provider_type;
      const table = listingTable(type);

      const { data: listingData, error: listingError } = await supabase
        .from(table)
        .select("*")
        .eq("provider_id", profile.id)
        .order("created_at", { ascending: false });

      if (listingError) throw listingError;

      const loadedListings = listingData || [];
      setListings(loadedListings);

      const listingIds = loadedListings.map((item: Item) => item.id);

      if (listingIds.length > 0) {
        const foreignKey = bookingForeignKey(type);

        const { data: bookingData } = await supabase
          .from(bookingTable(type))
          .select("*")
          .in(foreignKey, listingIds)
          .order("created_at", { ascending: false });

        setBookings(bookingData || []);
      } else {
        setBookings([]);
      }

      const { data: commissionData } = await supabase
        .from("commissions")
        .select("*")
        .eq("provider_id", profile.id)
        .order("created_at", { ascending: false });

      setCommissions(commissionData || []);

      const { data: payoutData } = await supabase
        .from("provider_payouts")
        .select("*")
        .eq("provider_id", profile.id)
        .order("requested_at", { ascending: false });

      setPayouts(payoutData || []);

      if (type === "property_rental" && listingIds.length > 0) {
        const { data: availabilityData } = await supabase
          .from("property_availability")
          .select("*")
          .in("property_id", listingIds)
          .order("available_date", { ascending: true });

        setAvailability(availabilityData || []);
      } else {
        setAvailability([]);
      }
    } catch (error: any) {
      setMessage(error.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function saveListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!provider) return;

    setSaving(true);
    setMessage("");

    try {
      let table = listingTable(provider.provider_type);
      let payload: Record<string, any>;

      if (provider.provider_type === "property_rental") {
        payload = {
          provider_id: provider.id,
          title: property.title,
          description: property.description,
          property_type: property.property_type,
          country: property.country,
          city: property.city,
          address: property.address,
          bedrooms: Number(property.bedrooms),
          bathrooms: Number(property.bathrooms),
          max_guests: Number(property.max_guests),
          price_per_night: Number(property.price_per_night),
          currency: property.currency,
          amenities: property.amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          status: "published",
        };
      } else if (provider.provider_type === "car_rental") {
        payload = {
          provider_id: provider.id,
          make: vehicle.make,
          model: vehicle.model,
          year: Number(vehicle.year),
          vehicle_type: vehicle.vehicle_type,
          registration_number: vehicle.registration_number,
          seats: Number(vehicle.seats),
          transmission: vehicle.transmission,
          fuel_type: vehicle.fuel_type,
          country: vehicle.country,
          city: vehicle.city,
          pickup_location: vehicle.pickup_location,
          price_per_day: Number(vehicle.price_per_day),
          currency: vehicle.currency,
          features: vehicle.features
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          status: "published",
        };
      } else if (provider.provider_type === "airport_transfer") {
        payload = {
          provider_id: provider.id,
          service_name: transfer.service_name,
          description: transfer.description,
          airport_name: transfer.airport_name,
          pickup_location: transfer.pickup_location,
          dropoff_location: transfer.dropoff_location,
          vehicle_type: transfer.vehicle_type,
          max_passengers: Number(transfer.max_passengers),
          price: Number(transfer.price),
          currency: transfer.currency,
          status: "published",
        };
      } else {
        throw new Error("Your provider account type is not supported.");
      }

      const { error } = await supabase.from(table).insert(payload);

      if (error) throw error;

      setMessage("Your listing has been added successfully.");
      await loadDashboard();
    } catch (error: any) {
      setMessage(error.message || "Could not save your listing.");
    } finally {
      setSaving(false);
    }
  }

  async function updateBookingStatus(id: string, status: string) {
    if (!provider) return;

    setMessage("");

    try {
      const { error } = await supabase
        .from(bookingTable(provider.provider_type))
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setMessage("Booking status updated.");
      await loadDashboard();
    } catch (error: any) {
      setMessage(error.message || "Could not update booking.");
    }
  }

  async function updateAvailability(id: string, isAvailable: boolean) {
    setMessage("");

    try {
      const { error } = await supabase
        .from("property_availability")
        .update({ is_available: isAvailable })
        .eq("id", id);

      if (error) throw error;

      setMessage("Availability updated.");
      await loadDashboard();
    } catch (error: any) {
      setMessage(error.message || "Could not update availability.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function money(value: any, currency = "UGX") {
    const amount = Number(value || 0);
    return `${currency} ${amount.toLocaleString()}`;
  }

  function displayName(item: Item) {
    return (
      item.title ||
      item.service_name ||
      [item.make, item.model].filter(Boolean).join(" ") ||
      "Listing"
    );
  }

  if (loading) {
    return <main className="p-8">Loading provider dashboard...</main>;
  }

  if (!provider) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-3 text-2xl font-bold">Provider Dashboard</h1>
        <p>{message || "Please sign in to continue."}</p>
        <a className="mt-4 inline-block text-blue-600" href="/providers/signup">
          Register as a provider
        </a>
      </main>
    );
  }

  const tabs = [
    "overview",
    "listings",
    "add listing",
    "bookings",
    "availability",
    "commissions",
    "payouts",
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-gray-600">{provider.business_name}</p>
        </div>

        <button
          onClick={signOut}
          className="rounded-lg bg-gray-900 px-4 py-2 text-white"
        >
          Sign out
        </button>
      </div>

      <div className="rounded-xl border p-4">
        <p>
          <strong>Business:</strong> {provider.business_name}
        </p>
        <p>
          <strong>Provider type:</strong>{" "}
          {provider.provider_type.replaceAll("_", " ")}
        </p>
        <p>
          <strong>Email:</strong> {provider.email}
        </p>
        <p>
          <strong>Verification:</strong>{" "}
          <span className="capitalize">
            {provider.verification_status || "pending"}
          </span>
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900">
          {message}
        </div>
      )}

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 capitalize ${
              activeTab === tab
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-gray-500">Total listings</p>
            <p className="text-3xl font-bold">{listings.length}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-gray-500">Total bookings</p>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="rounded-xl border p-5">
            <p className="text-gray-500">Payout records</p>
            <p className="text-3xl font-bold">{payouts.length}</p>
          </div>
        </section>
      )}

      {activeTab === "listings" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">My Listings</h2>
          {listings.length === 0 ? (
            <p>You have not added any listings yet.</p>
          ) : (
            listings.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <h3 className="font-semibold">{displayName(item)}</h3>
                <p className="text-sm text-gray-600">
                  Status: {item.status || "Not specified"}
                </p>
                <p className="break-all text-xs text-gray-400">
                  Listing ID: {item.id}
                </p>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "add listing" && (
        <section className="rounded-xl border p-5">
          <h2 className="mb-4 text-xl font-bold">Add a New Listing</h2>

          <form onSubmit={saveListing} className="space-y-3">
            {provider.provider_type === "property_rental" && (
              <>
                <input required placeholder="Property title" className="w-full rounded border p-3" value={property.title} onChange={(e) => setProperty({ ...property, title: e.target.value })} />
                <textarea placeholder="Description" className="w-full rounded border p-3" value={property.description} onChange={(e) => setProperty({ ...property, description: e.target.value })} />
                <input required placeholder="Property type" className="w-full rounded border p-3" value={property.property_type} onChange={(e) => setProperty({ ...property, property_type: e.target.value })} />
                <input required placeholder="Country" className="w-full rounded border p-3" value={property.country} onChange={(e) => setProperty({ ...property, country: e.target.value })} />
                <input required placeholder="City" className="w-full rounded border p-3" value={property.city} onChange={(e) => setProperty({ ...property, city: e.target.value })} />
                <input required placeholder="Full address" className="w-full rounded border p-3" value={property.address} onChange={(e) => setProperty({ ...property, address: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" min="0" placeholder="Bedrooms" className="rounded border p-3" value={property.bedrooms} onChange={(e) => setProperty({ ...property, bedrooms: e.target.value })} />
                  <input required type="number" min="0" placeholder="Bathrooms" className="rounded border p-3" value={property.bathrooms} onChange={(e) => setProperty({ ...property, bathrooms: e.target.value })} />
                  <input required type="number" min="1" placeholder="Maximum guests" className="rounded border p-3" value={property.max_guests} onChange={(e) => setProperty({ ...property, max_guests: e.target.value })} />
                  <input required type="number" min="1" placeholder="Price per night" className="rounded border p-3" value={property.price_per_night} onChange={(e) => setProperty({ ...property, price_per_night: e.target.value })} />
                </div>
                <input required placeholder="Currency e.g. UGX" className="w-full rounded border p-3" value={property.currency} onChange={(e) => setProperty({ ...property, currency: e.target.value })} />
                <input placeholder="Amenities separated by commas" className="w-full rounded border p-3" value={property.amenities} onChange={(e) => setProperty({ ...property, amenities: e.target.value })} />
              </>
            )}

            {provider.provider_type === "car_rental" && (
              <>
                <input required placeholder="Vehicle make" className="w-full rounded border p-3" value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} />
                <input required placeholder="Vehicle model" className="w-full rounded border p-3" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
                <input required type="number" placeholder="Year" className="w-full rounded border p-3" value={vehicle.year} onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })} />
                <input required placeholder="Vehicle type" className="w-full rounded border p-3" value={vehicle.vehicle_type} onChange={(e) => setVehicle({ ...vehicle, vehicle_type: e.target.value })} />
                <input required placeholder="Registration number" className="w-full rounded border p-3" value={vehicle.registration_number} onChange={(e) => setVehicle({ ...vehicle, registration_number: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" min="1" placeholder="Seats" className="rounded border p-3" value={vehicle.seats} onChange={(e) => setVehicle({ ...vehicle, seats: e.target.value })} />
                  <input required placeholder="Transmission" className="rounded border p-3" value={vehicle.transmission} onChange={(e) => setVehicle({ ...vehicle, transmission: e.target.value })} />
                  <input required placeholder="Fuel type" className="rounded border p-3" value={vehicle.fuel_type} onChange={(e) => setVehicle({ ...vehicle, fuel_type: e.target.value })} />
                  <input required placeholder="Country" className="rounded border p-3" value={vehicle.country} onChange={(e) => setVehicle({ ...vehicle, country: e.target.value })} />
                </div>
                <input required placeholder="City" className="w-full rounded border p-3" value={vehicle.city} onChange={(e) => setVehicle({ ...vehicle, city: e.target.value })} />
                <input required placeholder="Pickup location" className="w-full rounded border p-3" value={vehicle.pickup_location} onChange={(e) => setVehicle({ ...vehicle, pickup_location: e.target.value })} />
                <input required type="number" min="1" placeholder="Price per day" className="w-full rounded border p-3" value={vehicle.price_per_day} onChange={(e) => setVehicle({ ...vehicle, price_per_day: e.target.value })} />
                <input required placeholder="Currency e.g. UGX" className="w-full rounded border p-3" value={vehicle.currency} onChange={(e) => setVehicle({ ...vehicle, currency: e.target.value })} />
                <input placeholder="Features separated by commas" className="w-full rounded border p-3" value={vehicle.features} onChange={(e) => setVehicle({ ...vehicle, features: e.target.value })} />
              </>
            )}

            {provider.provider_type === "airport_transfer" && (
              <>
                <input required placeholder="Service name" className="w-full rounded border p-3" value={transfer.service_name} onChange={(e) => setTransfer({ ...transfer, service_name: e.target.value })} />
                <textarea placeholder="Description" className="w-full rounded border p-3" value={transfer.description} onChange={(e) => setTransfer({ ...transfer, description: e.target.value })} />
                <input placeholder="Airport name" className="w-full rounded border p-3" value={transfer.airport_name} onChange={(e) => setTransfer({ ...transfer, airport_name: e.target.value })} />
                <input required placeholder="Pickup location" className="w-full rounded border p-3" value={transfer.pickup_location} onChange={(e) => setTransfer({ ...transfer, pickup_location: e.target.value })} />
                <input required placeholder="Drop-off location" className="w-full rounded border p-3" value={transfer.dropoff_location} onChange={(e) => setTransfer({ ...transfer, dropoff_location: e.target.value })} />
                <input required placeholder="Vehicle type" className="w-full rounded border p-3" value={transfer.vehicle_type} onChange={(e) => setTransfer({ ...transfer, vehicle_type: e.target.value })} />
                <input required type="number" min="1" placeholder="Maximum passengers" className="w-full rounded border p-3" value={transfer.max_passengers} onChange={(e) => setTransfer({ ...transfer, max_passengers: e.target.value })} />
                <input required type="number" min="1" placeholder="Transfer price" className="w-full rounded border p-3" value={transfer.price} onChange={(e) => setTransfer({ ...transfer, price: e.target.value })} />
                <input required placeholder="Currency e.g. UGX" className="w-full rounded border p-3" value={transfer.currency} onChange={(e) => setTransfer({ ...transfer, currency: e.target.value })} />
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit Listing"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "bookings" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Booking Management</h2>
          {bookings.length === 0 ? (
            <p>No bookings found for your listings.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="space-y-2 rounded-xl border p-4">
                <p><strong>Booking:</strong> {booking.id}</p>
                <p><strong>Status:</strong> {booking.status || "Pending"}</p>
                <p><strong>Payment:</strong> {booking.payment_status || "Not specified"}</p>
                <p><strong>Amount:</strong> {money(booking.total_price || booking.total_amount || booking.price, booking.currency)}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateBookingStatus(booking.id, "confirmed")} className="rounded bg-green-700 px-3 py-2 text-white">Confirm</button>
                  <button onClick={() => updateBookingStatus(booking.id, "cancelled")} className="rounded bg-red-700 px-3 py-2 text-white">Cancel</button>
                  <button onClick={() => updateBookingStatus(booking.id, "completed")} className="rounded bg-gray-700 px-3 py-2 text-white">Complete</button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "availability" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Property Availability</h2>
          {provider.provider_type !== "property_rental" ? (
            <p>Availability management for this provider type will be handled separately.</p>
          ) : availability.length === 0 ? (
            <p>No property availability records found yet.</p>
          ) : (
            availability.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p><strong>Date:</strong> {item.available_date}</p>
                  <p><strong>Available:</strong> {item.is_available ? "Yes" : "No"}</p>
                  {item.price_override != null && (
                    <p><strong>Price override:</strong> {item.price_override}</p>
                  )}
                </div>
                <button
                  onClick={() => updateAvailability(item.id, !item.is_available)}
                  className="rounded-lg bg-blue-700 px-3 py-2 text-white"
                >
                  Mark {item.is_available ? "Unavailable" : "Available"}
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "commissions" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Commissions</h2>
          {commissions.length === 0 ? (
            <p>No commission records found.</p>
          ) : (
            commissions.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <p><strong>Booking amount:</strong> {money(item.booking_amount, item.currency)}</p>
                <p><strong>Commission rate:</strong> {item.booking_rate ?? "—"}%</p>
                <p><strong>Commission:</strong> {money(item.commission_amount, item.currency)}</p>
                <p><strong>Status:</strong> {item.status || "Not specified"}</p>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "payouts" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Provider Payouts</h2>
          {payouts.length === 0 ? (
            <p>No payout records found.</p>
          ) : (
            payouts.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <p><strong>Amount:</strong> {money(item.amount, item.currency)}</p>
                <p><strong>Method:</strong> {item.payout_method || "Not specified"}</p>
                <p><strong>Status:</strong> {item.status || "Not specified"}</p>
                <p><strong>Reference:</strong> {item.payout_reference || "—"}</p>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}
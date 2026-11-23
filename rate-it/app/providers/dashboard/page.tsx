"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Item = {
  id: string | number;
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

type PayoutDetails = {
  payout_method: string;
  mobile_money_network: string;
  mobile_money_phone: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
};

const emptyPayoutDetails: PayoutDetails = {
  payout_method: "mobile_money",
  mobile_money_network: "",
  mobile_money_phone: "",
  bank_name: "",
  bank_account_name: "",
  bank_account_number: "",
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
  const [bookingError, setBookingError] = useState("");
  const [payoutDetails, setPayoutDetails] =
    useState<PayoutDetails>(emptyPayoutDetails);
  const [payoutDetailsSaved, setPayoutDetailsSaved] = useState(false);

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

  function listingTable(type: string) {
    if (type === "car_rental") return "vehicles";
    if (type === "airport_transfer") return "transfer_services";
    return "property";
  }

  function bookingTable(type: string) {
    if (type === "car_rental") return "vehicle_bookings";
    if (type === "airport_transfer") return "transfer_bookings";
    return "property_bookings";
  }

  function bookingForeignKey(type: string) {
    if (type === "car_rental") return "vehicle_id";
    if (type === "airport_transfer") return "transfer_service_id";
    return "property_id";
  }

  function bookingTypeLabel(type: string) {
    if (type === "car_rental") return "Car rental";
    if (type === "airport_transfer") return "Airport transfer";
    return "Property rental";
  }

  function isPremiumActive(item: Item) {
    const status = String(
      item.premium_status || item.subscription_status || ""
    ).toLowerCase();

    const explicitlyPremium =
      item.is_premium === true ||
      item.premium === true ||
      status === "active" ||
      status === "premium" ||
      status === "approved";

    if (!explicitlyPremium) return false;

    const expiry =
      item.premium_expires_at ||
      item.subscription_expires_at ||
      item.featured_until;

    if (!expiry) return true;

    const expiryDate = new Date(expiry);

    return (
      !Number.isNaN(expiryDate.getTime()) &&
      expiryDate.getTime() >= Date.now()
    );
  }

  async function loadDashboard() {
    setLoading(true);
    setMessage("");
    setBookingError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setMessage("Please sign in to access your provider dashboard.");
        setProvider(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setProvider(null);
        setMessage("Your provider profile could not be found.");
        return;
      }

      setProvider(profile as Provider);

      // Load the provider's saved payout destination.
      const { data: payoutDetailsData, error: payoutDetailsError } =
        await supabase
          .from("provider_payout_details")
          .select("*")
          .eq("provider_id", profile.id)
          .maybeSingle();

      if (payoutDetailsError) {
        throw new Error(
          `Payout details could not be loaded: ${payoutDetailsError.message}`
        );
      }

      if (payoutDetailsData) {
        setPayoutDetails({
          payout_method: payoutDetailsData.payout_method || "mobile_money",
          mobile_money_network:
            payoutDetailsData.mobile_money_network || "",
          mobile_money_phone: payoutDetailsData.mobile_money_phone || "",
          bank_name: payoutDetailsData.bank_name || "",
          bank_account_name: payoutDetailsData.bank_account_name || "",
          bank_account_number:
            payoutDetailsData.bank_account_number || "",
        });
        setPayoutDetailsSaved(true);
      } else {
        setPayoutDetails(emptyPayoutDetails);
        setPayoutDetailsSaved(false);
      }

      const type = profile.provider_type;
      const table = listingTable(type);

      const { data: listingData, error: listingError } = await supabase
        .from(table)
        .select("*")
        .eq("provider_id", profile.id)
        .order("created_at", { ascending: false });

      if (listingError) throw listingError;

      const loadedListings = listingData || [];

      loadedListings.sort(
        (a: Item, b: Item) =>
          Number(isPremiumActive(b)) - Number(isPremiumActive(a))
      );

      setListings(loadedListings);

      const listingIds = loadedListings.map((item: Item) => item.id);

      if (listingIds.length > 0) {
        const foreignKey = bookingForeignKey(type);

        const { data: bookingData, error: bookingLoadError } = await supabase
          .from(bookingTable(type))
          .select("*")
          .in(foreignKey, listingIds)
          .order("created_at", { ascending: false });

        if (bookingLoadError) {
          setBookings([]);
          setBookingError(
            `Unable to load ${bookingTypeLabel(type).toLowerCase()} bookings: ${bookingLoadError.message}`
          );
        } else {
          setBookings(bookingData || []);
          setBookingError("");
        }
      } else {
        setBookings([]);
        setBookingError("");
      }

      const { data: commissionData, error: commissionError } = await supabase
        .from("commissions")
        .select("*")
        .eq("provider_id", profile.id)
        .order("created_at", { ascending: false });

      if (commissionError) {
        setCommissions([]);
        setMessage(
          `Commission records could not be loaded: ${commissionError.message}`
        );
      } else {
        setCommissions(commissionData || []);
      }

      const { data: payoutData, error: payoutError } = await supabase
        .from("provider_payouts")
        .select("*")
        .eq("provider_id", profile.id)
        .order("requested_at", { ascending: false });

      if (payoutError) throw payoutError;

      setPayouts(payoutData || []);

      if (type === "property_rental" && listingIds.length > 0) {
        const { data: availabilityData, error: availabilityError } =
          await supabase
            .from("property_availability")
            .select("*")
            .in("property_id", listingIds)
            .order("available_date", { ascending: true });

        if (availabilityError) throw availabilityError;

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

  useEffect(() => {
    loadDashboard();
  }, []);

  async function savePayoutDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!provider) return;

    setSaving(true);
    setMessage("");

    try {
      const method = payoutDetails.payout_method;

      if (method === "mobile_money") {
        if (
          !payoutDetails.mobile_money_network.trim() ||
          !payoutDetails.mobile_money_phone.trim()
        ) {
          throw new Error(
            "Enter your mobile money network and phone number."
          );
        }
      } else if (method === "bank_transfer") {
        if (
          !payoutDetails.bank_name.trim() ||
          !payoutDetails.bank_account_name.trim() ||
          !payoutDetails.bank_account_number.trim()
        ) {
          throw new Error(
            "Enter your bank name, account name and account number."
          );
        }
      } else {
        throw new Error("Please select a valid payout method.");
      }

      const payload = {
        provider_id: provider.id,
        payout_method: method,
        mobile_money_network:
          method === "mobile_money"
            ? payoutDetails.mobile_money_network.trim()
            : null,
        mobile_money_phone:
          method === "mobile_money"
            ? payoutDetails.mobile_money_phone.trim()
            : null,
        bank_name:
          method === "bank_transfer"
            ? payoutDetails.bank_name.trim()
            : null,
        bank_account_name:
          method === "bank_transfer"
            ? payoutDetails.bank_account_name.trim()
            : null,
        bank_account_number:
          method === "bank_transfer"
            ? payoutDetails.bank_account_number.trim()
            : null,
        verification_status: "pending",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("provider_payout_details")
        .upsert(payload, { onConflict: "provider_id" });

      if (error) throw error;

      setPayoutDetailsSaved(true);
      setMessage(
        "Your payout details have been saved. They are awaiting verification."
      );
    } catch (error: any) {
      setMessage(error.message || "Could not save payout details.");
    } finally {
      setSaving(false);
    }
  }

  async function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!provider) return;

    setSaving(true);
    setMessage("");

    try {
      const table = listingTable(provider.provider_type);
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

  async function updateBookingStatus(id: string | number, status: string) {
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

  async function updateAvailability(id: string | number, isAvailable: boolean) {
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
    return `${currency} ${Number(value || 0).toLocaleString()}`;
  }

  function formatDate(value: any) {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Not available"
      : date.toLocaleString();
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
    "payout details",
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
        <p><strong>Business:</strong> {provider.business_name}</p>
        <p>
          <strong>Provider type:</strong>{" "}
          {provider.provider_type.replaceAll("_", " ")}
        </p>
        <p><strong>Email:</strong> {provider.email}</p>
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
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  isPremiumActive(item)
                    ? "border-yellow-500 bg-yellow-50"
                    : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{displayName(item)}</h3>
                  {isPremiumActive(item) && (
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-yellow-950">
                      ★ PREMIUM
                    </span>
                  )}
                </div>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Booking Management</h2>
              <p className="text-sm text-gray-600">
                {bookingTypeLabel(provider.provider_type)} bookings
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Refresh bookings
            </button>
          </div>

          {bookingError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Booking records could not be loaded.</p>
              <p className="mt-1 text-sm">{bookingError}</p>
            </div>
          )}

          {!bookingError && bookings.length === 0 ? (
            <p>No bookings found for your listings.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="space-y-2 rounded-xl border p-4">
                <p><strong>Booking:</strong> {booking.id}</p>
                <p><strong>Status:</strong> {booking.status || "Pending"}</p>
                <p><strong>Payment:</strong> {booking.payment_status || "Not specified"}</p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {money(
                    booking.total_price || booking.total_amount || booking.price,
                    booking.currency
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateBookingStatus(booking.id, "confirmed")}
                    className="rounded bg-green-700 px-3 py-2 text-white"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking.id, "cancelled")}
                    className="rounded bg-red-700 px-3 py-2 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateBookingStatus(booking.id, "completed")}
                    className="rounded bg-gray-700 px-3 py-2 text-white"
                  >
                    Complete
                  </button>
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
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
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
          <h2 className="text-xl font-bold">Provider Payout History</h2>
          {payouts.length === 0 ? (
            <p>No payout records found.</p>
          ) : (
            payouts.map((item) => (
              <div key={item.id} className="space-y-3 rounded-xl border p-4">
                <p><strong>Amount:</strong> {money(item.amount, item.currency)}</p>
                <p><strong>Payment method:</strong> {item.payout_method || "Not specified"}</p>
                <p><strong>Status:</strong> <span className="capitalize">{item.status || "Not specified"}</span></p>
                <p><strong>Payout reference:</strong> {item.payout_reference || "Not yet provided"}</p>
                <p><strong>Date requested:</strong> {formatDate(item.requested_at)}</p>
                <p><strong>Date paid:</strong> {item.paid_at ? formatDate(item.paid_at) : "Not yet paid"}</p>
                <div>
                  <strong>Admin notes:</strong>
                  <p className="mt-1 whitespace-pre-wrap text-gray-600">
                    {item.notes || "No additional notes."}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "payout details" && (
        <section className="max-w-2xl space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-xl font-bold">Payout Details</h2>
            <p className="mt-1 text-sm text-gray-600">
              Add the mobile-money number or bank account where your eligible
              car-rental and airport-transfer earnings can be paid.
            </p>
          </div>

          {payoutDetailsSaved && (
            <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Payout details have been saved. Verification may still be pending.
            </p>
          )}

          <form onSubmit={savePayoutDetails} className="space-y-4">
            <div>
              <label className="mb-1 block font-semibold">
                Payout method
              </label>
              <select
                required
                className="w-full rounded border p-3"
                value={payoutDetails.payout_method}
                onChange={(e) =>
                  setPayoutDetails({
                    ...payoutDetails,
                    payout_method: e.target.value,
                  })
                }
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </div>

            {payoutDetails.payout_method === "mobile_money" && (
              <>
                <div>
                  <label className="mb-1 block font-semibold">
                    Mobile money network
                  </label>
                  <select
                    required
                    className="w-full rounded border p-3"
                    value={payoutDetails.mobile_money_network}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        mobile_money_network: e.target.value,
                      })
                    }
                  >
                    <option value="">Select network</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold">
                    Mobile money phone number
                  </label>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. +2567XXXXXXXX"
                    className="w-full rounded border p-3"
                    value={payoutDetails.mobile_money_phone}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        mobile_money_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {payoutDetails.payout_method === "bank_transfer" && (
              <>
                <div>
                  <label className="mb-1 block font-semibold">
                    Bank name
                  </label>
                  <input
                    required
                    placeholder="Bank name"
                    className="w-full rounded border p-3"
                    value={payoutDetails.bank_name}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        bank_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold">
                    Account holder name
                  </label>
                  <input
                    required
                    placeholder="Name on bank account"
                    className="w-full rounded border p-3"
                    value={payoutDetails.bank_account_name}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        bank_account_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold">
                    Bank account number
                  </label>
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Bank account number"
                    className="w-full rounded border p-3"
                    value={payoutDetails.bank_account_number}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        bank_account_number: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving payout details..." : "Save Payout Details"}
            </button>
          </form>

          <p className="text-xs text-gray-500">
            Your payout details are stored in a protected database table.
            Saving them does not itself send money or mark a payout as paid.
          </p>
        </section>
      )}
    </main>
  );
}
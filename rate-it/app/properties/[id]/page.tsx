"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title?: string;
  name?: string;
  property_name?: string;
  description?: string;
  location?: string;
  city?: string;
  address?: string;
  country?: string;
  property_type?: string;
  price_per_night?: number;
  nightly_price?: number;
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  amenities?: string[] | string;
  status?: string;
  is_premium?: boolean;
  premium?: boolean;
  premium_status?: string;
  subscription_status?: string;
  premium_expires_at?: string;
  subscription_expires_at?: string;
  featured_until?: string;
};

type PropertyPhoto = {
  id: string;
  image_url?: string;
  photo_url?: string;
  url?: string;
};

function isPremiumActive(property: Property): boolean {
  const status = (
    property.premium_status ||
    property.subscription_status ||
    ""
  ).toLowerCase();

  const markedPremium =
    property.is_premium === true ||
    property.premium === true ||
    status === "active" ||
    status === "premium" ||
    status === "approved";

  if (!markedPremium) return false;

  const expiry =
    property.premium_expires_at ||
    property.subscription_expires_at ||
    property.featured_until;

  if (expiry && new Date(expiry).getTime() <= Date.now()) {
    return false;
  }

  return true;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = String(params.id);

  const [property, setProperty] = useState<Property | null>(null);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      setLoading(true);
      setError("");

      const { data, error: propertyError } = await supabase
        .from("property")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (propertyError || !data) {
        setError("Property could not be found.");
        setLoading(false);
        return;
      }

      setProperty(data as Property);

      const { data: photoData } = await supabase
        .from("property_photos")
        .select("*")
        .eq("property_id", propertyId);

      setPhotos((photoData || []) as PropertyPhoto[]);
      setLoading(false);
    }

    loadProperty();
  }, [propertyId]);

  const propertyName =
    property?.name ||
    property?.title ||
    property?.property_name ||
    "Property";

  const location =
    property?.location ||
    property?.city ||
    property?.address ||
    property?.country ||
    "Location available on request";

  const price = Number(
    property?.price_per_night ??
    property?.nightly_price ??
    property?.price ??
    0
  );

  const currency = property?.currency || "UGX";
  const premiumActive = property ? isPremiumActive(property) : false;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading property details...
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Property not found
        </h1>
        <p className="text-gray-600 mb-5">{error}</p>
        <button
          onClick={() => router.push("/properties")}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Browse properties
        </button>
      </main>
    );
  }

  const amenities = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === "string"
      ? property.amenities.split(",").map((item) => item.trim())
      : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>
          <a href="/properties" className="font-medium text-blue-700">
            All properties
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">{propertyName}</h1>

          {premiumActive && (
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-sm font-bold">
              ★ PREMIUM
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-7">{location}</p>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {photos.map((photo, index) => {
              const image =
                photo.image_url || photo.photo_url || photo.url;

              return image ? (
                <img
                  key={photo.id || index}
                  src={image}
                  alt={`${propertyName} photo ${index + 1}`}
                  className="w-full h-72 object-cover rounded-xl"
                />
              ) : null;
            })}
          </div>
        ) : (
          <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 mb-8">
            Property photos coming soon
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              About this property
            </h2>

            <p className="text-gray-700 whitespace-pre-line">
              {property.description || "Discover this property on Rate-It."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-7">
              <div>
                <p className="text-gray-500 text-sm">Property type</p>
                <p className="font-semibold">
                  {property.property_type || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Bedrooms</p>
                <p className="font-semibold">
                  {property.bedrooms ?? "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Bathrooms</p>
                <p className="font-semibold">
                  {property.bathrooms ?? "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Maximum guests</p>
                <p className="font-semibold">
                  {property.max_guests ?? "Not specified"}
                </p>
              </div>
            </div>

            {amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-3">Amenities</h2>
                <ul className="list-disc pl-6 grid grid-cols-2 gap-2">
                  {amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="bg-white rounded-xl p-6 shadow-sm h-fit">
            <p className="text-gray-500 text-sm mb-2">
              Price per night
            </p>

            <p className="text-2xl font-bold text-blue-800 mb-6">
              {price > 0
                ? `${currency} ${price.toLocaleString()}`
                : "Contact for price"}
            </p>

            <button
              onClick={() =>
                router.push(
                  `/properties/${encodeURIComponent(propertyId)}/book`
                )
              }
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg"
            >
              Book this property
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Payment is made directly at the property.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
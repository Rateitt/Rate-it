"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type RecordData = Record<string, unknown>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function getValue(
  item: RecordData,
  keys: string[]
): string {
  for (const key of keys) {
    const value = item[key];

    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return "";
}

function getImage(item: RecordData): string {
  return getValue(item, [
    "image_url",
    "photo_url",
    "image",
    "photo",
    "cover_image",
    "main_image",
    "url",
  ]);
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<RecordData[]>([]);
  const [photos, setPhotos] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      setError("");

      try {
        const [propertyResult, photoResult] = await Promise.all([
          supabase.from("property").select("*").limit(100),
          supabase.from("property_photos").select("*").limit(500),
        ]);

        if (propertyResult.error) {
          throw propertyResult.error;
        }

        setProperties(propertyResult.data || []);
        setPhotos(photoResult.data || []);
      } catch (err) {
        console.error("Property loading error:", err);
        setError("Unable to load properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const name = getValue(property, [
        "property_name",
        "name",
        "title",
        "property_title",
      ]);

      const location = getValue(property, [
        "location",
        "city",
        "address",
        "country",
      ]);

      const propertyType = getValue(property, [
        "property_type",
        "type",
        "category",
      ]);

      const matchesSearch =
        `${name} ${location} ${propertyType}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        type === "All" ||
        propertyType.toLowerCase().includes(type.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [properties, search, type]);

  function propertyImage(property: RecordData): string {
    const propertyId = getValue(property, ["id"]);

    const relatedPhoto = photos.find((photo) => {
      const photoPropertyId = getValue(photo, [
        "property_id",
        "propertyId",
        "listing_id",
      ]);

      return photoPropertyId === propertyId && getImage(photo);
    });

    return (
      (relatedPhoto && getImage(relatedPhoto)) ||
      getImage(property)
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-5 py-5 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Rate-It
          </a>

          <nav className="flex gap-5 text-sm font-medium">
            <a href="/hotels" className="hover:text-blue-700">
              Hotels
            </a>
            <a href="/properties" className="text-blue-700">
              Properties
            </a>
            <a href="/cars" className="hover:text-blue-700">
              Cars
            </a>
            <a href="/transfers" className="hover:text-blue-700">
              Transfers
            </a>
          </nav>
        </div>
      </header>

      <section className="bg-blue-950 text-white px-5 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-blue-300 font-semibold mb-3">
            RATE-IT PROPERTY RENTALS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mb-5">
            Find your perfect place to stay
          </h1>

          <p className="text-blue-100 mb-9">
            Discover apartments, houses, villas and holiday homes.
          </p>

          <div className="bg-white rounded-xl p-3 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="search"
              placeholder="Where do you want to stay?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 text-gray-900 outline-none"
            />

            <button
              onClick={() => setSearch(search.trim())}
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Explore properties
            </h2>
            <p className="text-gray-500 mt-2">
              Find a place that feels like home.
            </p>
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-lg p-3 bg-white"
          >
            <option value="All">All properties</option>
            <option value="Apartment">Apartments</option>
            <option value="House">Houses</option>
            <option value="Villa">Villas</option>
            <option value="Holiday">Holiday homes</option>
          </select>
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">
              Loading properties...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 text-red-700 p-5 rounded-xl">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="block mt-3 underline font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProperties.length === 0 && (
          <div className="bg-white border rounded-xl p-12 text-center">
            <h3 className="text-xl font-bold mb-3">
              No properties found
            </h3>
            <p className="text-gray-500">
              Try another destination or check back later.
            </p>
          </div>
        )}

        {!loading && !error && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProperties.map((property, index) => {
              const id = getValue(property, ["id"]);

              const name =
                getValue(property, [
                  "property_name",
                  "name",
                  "title",
                  "property_title",
                ]) || "Property";

              const location = getValue(property, [
                "location",
                "city",
                "address",
                "country",
              ]);

              const description = getValue(property, [
                "description",
                "details",
              ]);

              const price = getValue(property, [
                "price_per_night",
                "price_per_day",
                "nightly_price",
                "price",
              ]);

              const currency =
                getValue(property, ["currency"]) || "UGX";

              const image = propertyImage(property);

              return (
                <article
                  key={id || index}
                  className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition"
                >
                  <div className="h-56 bg-gray-200 relative">
                    {image ? (
                      <div
                        role="img"
                        aria-label={name}
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${image.replace(/"/g, '\\"')}")`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Property photo coming soon
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">
                      {name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-3">
                      {location || "Location available on request"}
                    </p>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-5">
                      {description || "Discover this property on Rate-It."}
                    </p>

                    <div className="flex justify-between items-center gap-3">
                      <div>
                        {price ? (
                          <>
                            <p className="font-bold text-blue-800">
                              {currency} {Number(price).toLocaleString()}
                            </p>
                            <span className="text-xs text-gray-500">
                              Price listed
                            </span>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Contact for price
                          </p>
                        )}
                      </div>

                      {id ? (
                        <a
                          href={`/properties/${encodeURIComponent(id)}`}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg text-sm font-semibold"
                        >
                          View property
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Details unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="bg-blue-950 text-white py-8 text-center mt-10">
        <p className="font-bold text-xl mb-2">RATE-IT</p>
        <p className="text-blue-200 text-sm">
          Discover. Compare. Stay.
        </p>
        <p className="text-blue-300 text-xs mt-4">
          © {new Date().getFullYear()} Rate-It. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Hotel = {
  id: number;
  hotel_name: string;
  location: string | null;
  description: string | null;
};

type HotelPhoto = {
  id: number;
  hotel_id: number;
  image_url: string;
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCatalogData() {
      setLoading(true);

      try {
        const { data: hotelsData, error: hotelsError } = await supabase
          .from("hotels")
          .select("id, hotel_name, location, description")
          .order("created_at", { ascending: false });

        if (hotelsError) {
          throw hotelsError;
        }

        const { data: photosData, error: photosError } = await supabase
          .from("hotel_photos")
          .select("id, hotel_id, image_url");

        if (photosError) {
          throw photosError;
        }

        /*
         * Remove duplicate hotel listings from the customer catalogue.
         *
         * The newest record is kept because the query is ordered
         * by created_at descending.
         */
        const uniqueHotels: Hotel[] = [];
        const seenHotels = new Set<string>();

        for (const hotel of hotelsData || []) {
          const hotelKey = [
            hotel.hotel_name?.trim().toLowerCase() || "",
            hotel.location?.trim().toLowerCase() || "",
          ].join("|");

          if (!seenHotels.has(hotelKey)) {
            seenHotels.add(hotelKey);
            uniqueHotels.push(hotel);
          }
        }

        setHotels(uniqueHotels);
        setPhotos(photosData || []);
      } catch (error) {
        console.error("Catalog synchronization failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCatalogData();
  }, []);

  const filteredHotels = hotels.filter((hotel) => {
    const searchText = search.toLowerCase().trim();

    return (
      hotel.hotel_name?.toLowerCase().includes(searchText) ||
      hotel.location?.toLowerCase().includes(searchText)
    );
  });

  function getHotelImage(hotelId: number) {
    const foundPhoto = photos.find(
      (photo) => photo.hotel_id === hotelId
    );

    return foundPhoto
      ? foundPhoto.image_url
      : "https://images.unsplash.com/photo-1566073771259-6a8506099945";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e5e5",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#000",
            fontSize: "26px",
            fontWeight: "bold",
          }}
        >
          Rate-It
        </Link>

        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            padding: "10px 15px",
          }}
        >
          Sign In
        </Link>
      </header>

      <section
        style={{
          background: "#000",
          color: "#fff",
          padding: "45px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "34px",
            margin: "0 0 10px",
          }}
        >
          Find your stay
        </h1>

        <p
          style={{
            margin: "0 0 25px",
            color: "#ccc",
          }}
        >
          Discover and compare hotels on Rate-It
        </p>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by hotel or destination"
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "16px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            outline: "none",
          }}
        />
      </section>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "35px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            Hotels
          </h2>

          <span
            style={{
              color: "#666",
              fontSize: "14px",
            }}
          >
            {filteredHotels.length} result
            {filteredHotels.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            Loading hotels...
          </div>
        ) : filteredHotels.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "50px 25px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #e5e5e5",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              No hotels found
            </h3>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              {search
                ? "Try another hotel name or destination."
                : "Hotels will appear here when they are available."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredHotels.map((hotel) => (
              <article
                key={hotel.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e5e5e5",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: "190px",
                    width: "100%",
                    background: "#e9e9e9",
                  }}
                >
                  <img
                    src={getHotelImage(hotel.id)}
                    alt={hotel.hotel_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: "20px",
                    }}
                  >
                    {hotel.hotel_name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    📍{" "}
                    {hotel.location || "Location not provided"}
                  </p>

                  <p
                    style={{
                      color: "#555",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      minHeight: "42px",
                      flex: 1,
                    }}
                  >
                    {hotel.description ||
                      "Discover this hotel on Rate-It."}
                  </p>

                  <Link
                    href={`/hotels/${hotel.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      background: "#000",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "13px",
                      borderRadius: "8px",
                      marginTop: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    View Hotel
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  hotel_name: string;
  location: string | null;
  description: string | null;
};

type HotelPhoto = {
  id: number;
  image_url: string;
};

type Room = {
  id: number;
  hotel_id: number;
  room_name: string | null;
  description: string | null;
  price: number | null;
  available_rooms: number | null;
  created_at: string;
};

export default function HotelDetailsPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomErrorMessage, setRoomErrorMessage] = useState("");

  useEffect(() => {
    async function loadHotel() {
      try {
        const pathname = window.location.pathname;
        const parts = pathname.split("/").filter(Boolean);
        const hotelIdFromUrl = parts[parts.length - 1];

        if (!hotelIdFromUrl) {
          setErrorMessage("Hotel ID is missing from the URL.");
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        const numericHotelId = Number(hotelIdFromUrl);

        if (Number.isNaN(numericHotelId)) {
          setErrorMessage(`Invalid hotel ID: ${hotelIdFromUrl}`);
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        console.log("Loading hotel ID:", numericHotelId);

        /*
         * LOAD HOTEL
         */
        const { data: hotelData, error: hotelError } =
          await supabase
            .from("hotels")
            .select(
              "id, hotel_name, location, description"
            )
            .eq("id", numericHotelId)
            .maybeSingle();

        if (hotelError) {
          console.error("Hotel error:", hotelError);

          setErrorMessage(
            `Hotel error: ${hotelError.message}`
          );

          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        if (!hotelData) {
          setErrorMessage(
            `No hotel was found with ID ${numericHotelId}.`
          );

          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        setHotel(hotelData);

        /*
         * LOAD HOTEL PHOTOS
         */
        const {
          data: photoData,
          error: photoError,
        } = await supabase
          .from("hotel_photos")
          .select("id, image_url")
          .eq("hotel_id", numericHotelId)
          .order("created_at", {
            ascending: false,
          });

        if (photoError) {
          console.error("Photo error:", photoError);
        } else {
          setPhotos(photoData || []);
        }

        /*
         * LOAD ROOMS
         */
        setRoomsLoading(true);
        setRoomErrorMessage("");

        console.log(
          "Loading rooms for hotel ID:",
          numericHotelId
        );

        const {
          data: roomData,
          error: roomError,
        } = await supabase
          .from("rooms")
          .select(
            "id, hotel_id, room_name, description, price, available_rooms, created_at"
          )
          .eq("hotel_id", numericHotelId)
          .order("created_at", {
            ascending: false,
          });

        console.log("Room data:", roomData);
        console.log("Room error:", roomError);

        if (roomError) {
          setRoomErrorMessage(
            `Room loading error: ${roomError.message}`
          );

          setRooms([]);
        } else {
          setRooms(roomData || []);
        }

        setRoomsLoading(false);
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);

        setErrorMessage(
          "Something went wrong while loading the hotel."
        );

        setLoading(false);
        setRoomsLoading(false);
      }
    }

    loadHotel();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e5e5e5",
          }}
        >
          <h2>Loading hotel...</h2>

          <p style={{ color: "#666666" }}>
            Please wait while we load the hotel
            information.
          </p>
        </div>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f7",
          padding: "40px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e5e5e5",
          }}
        >
          <h1>Hotel could not be loaded</h1>

          <p
            style={{
              color: "#b00020",
              lineHeight: "1.6",
            }}
          >
            {errorMessage}
          </p>

          <Link
            href="/hotels"
            style={{
              display: "inline-block",
              marginTop: "20px",
              background: "#000000",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Back to Hotels
          </Link>
        </div>
      </main>
    );
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
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/hotels"
            style={{
              color: "#000000",
              textDecoration: "none",
              fontSize: "26px",
              fontWeight: "bold",
            }}
          >
            Rate-It
          </Link>

          <Link
            href="/hotels"
            style={{
              color: "#333333",
              textDecoration: "none",
            }}
          >
            ← Back to Hotels
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* HOTEL INFORMATION */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #e5e5e5",
          }}
        >
          {/* HOTEL PHOTOS */}

          {photos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  photos.length === 1
                    ? "1fr"
                    : "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "4px",
                background: "#eeeeee",
              }}
            >
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.image_url}
                  alt={hotel.hotel_name}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                height: "300px",
                background: "#e9e9e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777777",
                fontSize: "18px",
              }}
            >
              Hotel photo
            </div>
          )}

          <div
            style={{
              padding: "35px",
            }}
          >
            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "34px",
              }}
            >
              {hotel.hotel_name}
            </h1>

            <p
              style={{
                color: "#666666",
                fontSize: "16px",
                marginBottom: "25px",
              }}
            >
              📍{" "}
              {hotel.location ||
                "Location not provided"}
            </p>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #eeeeee",
                margin: "25px 0",
              }}
            />

            <h2>About this hotel</h2>

            <p
              style={{
                color: "#555555",
                lineHeight: "1.7",
                fontSize: "16px",
              }}
            >
              {hotel.description ||
                "Discover this hotel on Rate-It."}
            </p>
          </div>
        </div>

        {/* ROOMS */}

        <section
          style={{
            marginTop: "35px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              marginBottom: "20px",
            }}
          >
            Available rooms
          </h2>

          {roomsLoading ? (
            <div
              style={{
                background: "#ffffff",
                padding: "30px",
                borderRadius: "12px",
                border: "1px solid #e5e5e5",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#666666",
                }}
              >
                Loading available rooms...
              </p>
            </div>
          ) : roomErrorMessage ? (
            <div
              style={{
                background: "#fff5f5",
                padding: "30px",
                borderRadius: "12px",
                border: "1px solid #f0caca",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: "#b00020",
                }}
              >
                Could not load rooms
              </h3>

              <p
                style={{
                  marginBottom: 0,
                  color: "#7a0000",
                  lineHeight: "1.6",
                }}
              >
                {roomErrorMessage}
              </p>
            </div>
          ) : rooms.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                padding: "30px",
                borderRadius: "12px",
                border: "1px solid #e5e5e5",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#666666",
                }}
              >
                No rooms are currently listed
                for this hotel.
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
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: "#ffffff",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px",
                      fontSize: "21px",
                    }}
                  >
                    {room.room_name || "Room"}
                  </h3>

                  {room.description && (
                    <p
                      style={{
                        color: "#666666",
                        lineHeight: "1.5",
                      }}
                    >
                      {room.description}
                    </p>
                  )}

                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      marginTop: "20px",
                      marginBottom: "8px",
                    }}
                  >
                    {room.price !== null
                      ? `${Number(
                          room.price
                        ).toLocaleString()} per night`
                      : "Price not provided"}
                  </p>

                  <p
                    style={{
                      color:
                        room.available_rooms !== null &&
                        room.available_rooms > 0
                          ? "#176b35"
                          : "#b00020",
                      fontWeight: "600",
                    }}
                  >
                    {room.available_rooms !== null
                      ? room.available_rooms > 0
                        ? `${room.available_rooms} room${
                            room.available_rooms === 1
                              ? ""
                              : "s"
                          } available`
                        : "No rooms available"
                      : "Availability not provided"}
                  </p>

                  <Link
                    href={`/hotels/${hotel.id}/book?room=${room.id}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      background:
                        room.available_rooms !== null &&
                        room.available_rooms <= 0
                          ? "#999999"
                          : "#000000",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "13px",
                      borderRadius: "8px",
                      marginTop: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    Book Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
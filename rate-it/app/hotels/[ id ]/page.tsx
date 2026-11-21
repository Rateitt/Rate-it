"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  hotel_name: string;
  location: string | null;
  description: string | null;
  verification_status?: string | null;
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
        const parts = window.location.pathname.split("/").filter(Boolean);
        const hotelIdFromUrl = parts[parts.length - 1];

        if (!hotelIdFromUrl) {
          setErrorMessage("Hotel ID is missing from the URL.");
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        const numericHotelId = Number(hotelIdFromUrl);

        if (!Number.isFinite(numericHotelId)) {
          setErrorMessage(`Invalid hotel ID: ${hotelIdFromUrl}`);
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        const { data: hotelData, error: hotelError } = await supabase
          .from("hotels")
          .select(
            "id, hotel_name, location, description, verification_status"
          )
          .eq("id", numericHotelId)
          .maybeSingle();

        if (hotelError) {
          setErrorMessage(`Hotel error: ${hotelError.message}`);
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        if (!hotelData) {
          setErrorMessage(`No hotel was found with ID ${numericHotelId}.`);
          setLoading(false);
          setRoomsLoading(false);
          return;
        }

        setHotel(hotelData as Hotel);

        const { data: photoData, error: photoError } = await supabase
          .from("hotel_photos")
          .select("id, image_url")
          .eq("hotel_id", numericHotelId)
          .order("created_at", { ascending: false });

        if (!photoError) {
          setPhotos(photoData || []);
        } else {
          console.error("Photo error:", photoError);
        }

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select(
            "id, hotel_id, room_name, description, price, available_rooms, created_at"
          )
          .eq("hotel_id", numericHotelId)
          .order("created_at", { ascending: false });

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-bold">Loading hotel...</h2>
          <p className="mt-2 text-gray-600">
            Please wait while we load the hotel information.
          </p>
        </div>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="min-h-screen bg-gray-50 p-5 sm:p-10">
        <div className="mx-auto max-w-2xl rounded-xl border bg-white p-10 text-center">
          <h1 className="text-2xl font-bold">
            Hotel could not be loaded
          </h1>
          <p className="mt-4 text-red-700">{errorMessage}</p>
          <Link
            href="/hotels"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white"
          >
            Back to Hotels
          </Link>
        </div>
      </main>
    );
  }

  const isVerified =
    hotel.verification_status?.toLowerCase() === "approved";

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <header className="border-b bg-white px-5 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/hotels"
            className="text-2xl font-bold text-black"
          >
            Rate-It
          </Link>

          <Link href="/hotels" className="text-gray-700 hover:underline">
            ← Back to Hotels
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {photos.length > 0 ? (
            <div
              className="grid gap-1 bg-gray-100"
              style={{
                gridTemplateColumns:
                  photos.length === 1
                    ? "1fr"
                    : "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.image_url}
                  alt={hotel.hotel_name}
                  className="block h-72 w-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center bg-gray-100 text-lg text-gray-500">
              Hotel photo
            </div>
          )}

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {hotel.hotel_name}
              </h1>

              {isVerified && (
                <span
                  title="This hotel has been verified by Rate-It"
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-1.43.93-2.63 2.22-3.04a3.25 3.25 0 0 1 4.49-4.49A3.25 3.25 0 0 1 12 2.25c1.43 0 2.63.93 3.04 2.22a3.25 3.25 0 0 1 4.49 4.49A3.25 3.25 0 0 1 21.75 12c0 1.43-.93 2.63-2.22 3.04a3.25 3.25 0 0 1-4.49 4.49A3.25 3.25 0 0 1 12 21.75c-1.43 0-2.63-.93-3.04-2.22a3.25 3.25 0 0 1-4.49-4.49A3.25 3.25 0 0 1 2.25 12Zm13.28-1.78a.75.75 0 0 0-1.06-1.06l-3.72 3.72-1.22-1.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l4.25-4.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            <p className="mt-3 text-gray-600">
              📍 {hotel.location || "Location not provided"}
            </p>

            <hr className="my-7 border-gray-200" />

            <h2 className="text-xl font-bold">About this hotel</h2>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-600">
              {hotel.description || "Discover this hotel on Rate-It."}
            </p>
          </div>
        </div>

        <section className="mt-9">
          <h2 className="mb-5 text-2xl font-bold">
            Available rooms
          </h2>

          {roomsLoading ? (
            <div className="rounded-xl border bg-white p-8 text-gray-600">
              Loading available rooms...
            </div>
          ) : roomErrorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-700">
              <h3 className="font-bold">Could not load rooms</h3>
              <p className="mt-2">{roomErrorMessage}</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-gray-600">
              No rooms are currently listed for this hotel.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const unavailable =
                  room.available_rooms !== null &&
                  room.available_rooms <= 0;

                return (
                  <article
                    key={room.id}
                    className="rounded-xl border bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-xl font-bold">
                      {room.room_name || "Room"}
                    </h3>

                    {room.description && (
                      <p className="mt-3 leading-6 text-gray-600">
                        {room.description}
                      </p>
                    )}

                    <p className="mt-5 text-xl font-bold">
                      {room.price !== null
                        ? `${Number(room.price).toLocaleString()} per night`
                        : "Price not provided"}
                    </p>

                    <p
                      className={`mt-2 font-semibold ${
                        unavailable ? "text-red-700" : "text-green-700"
                      }`}
                    >
                      {room.available_rooms !== null
                        ? unavailable
                          ? "No rooms available"
                          : `${room.available_rooms} room${
                              room.available_rooms === 1 ? "" : "s"
                            } available`
                        : "Availability not provided"}
                    </p>

                    <Link
                      href={`/hotels/${hotel.id}/book?room=${room.id}`}
                      aria-disabled={unavailable}
                      className={`mt-5 block rounded-lg px-4 py-3 text-center font-bold text-white ${
                        unavailable
                          ? "pointer-events-none bg-gray-400"
                          : "bg-black hover:bg-gray-800"
                      }`}
                    >
                      Book Now
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
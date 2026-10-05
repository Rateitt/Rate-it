"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

type Hotel = {
  id: number;
  hotel_name: string;
  location: string | null;
};

type Room = {
  id: number;
  hotel_id: number;
  room_name: string | null;
  description: string | null;
  price: number | null;
  available_rooms: number | null;
};

export default function BookingPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [roomsBooked, setRoomsBooked] = useState(1);

  const [paymentMethod, setPaymentMethod] =
    useState("pay_at_hotel");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadBookingInformation() {
      try {
        setLoading(true);
        setErrorMessage("");

        const pathname = window.location.pathname;

        const searchParams = new URLSearchParams(
          window.location.search
        );

        const parts = pathname.split("/").filter(Boolean);

        const hotelIdFromUrl = parts[parts.length - 2];

        const roomIdFromUrl = searchParams.get("room");

        if (!hotelIdFromUrl) {
          setErrorMessage("Hotel ID is missing.");
          setLoading(false);
          return;
        }

        if (!roomIdFromUrl) {
          setErrorMessage("Room ID is missing.");
          setLoading(false);
          return;
        }

        const hotelId = Number(hotelIdFromUrl);
        const roomId = Number(roomIdFromUrl);

        if (Number.isNaN(hotelId)) {
          setErrorMessage("Invalid hotel ID.");
          setLoading(false);
          return;
        }

        if (Number.isNaN(roomId)) {
          setErrorMessage("Invalid room ID.");
          setLoading(false);
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setErrorMessage(
            "Please sign in before making a booking."
          );
          setLoading(false);
          return;
        }

        setCustomerId(user.id);

        const { data: hotelData, error: hotelError } =
          await supabase
            .from("hotels")
            .select("id, hotel_name, location")
            .eq("id", hotelId)
            .maybeSingle();

        if (hotelError) {
          setErrorMessage(
            `Hotel error: ${hotelError.message}`
          );
          setLoading(false);
          return;
        }

        if (!hotelData) {
          setErrorMessage("Hotel not found.");
          setLoading(false);
          return;
        }

        setHotel(hotelData);

        const { data: roomData, error: roomError } =
          await supabase
            .from("rooms")
            .select(
              "id, hotel_id, room_name, description, price, available_rooms"
            )
            .eq("id", roomId)
            .eq("hotel_id", hotelId)
            .maybeSingle();

        if (roomError) {
          setErrorMessage(
            `Room error: ${roomError.message}`
          );
          setLoading(false);
          return;
        }

        if (!roomData) {
          setErrorMessage(
            "The selected room could not be found."
          );
          setLoading(false);
          return;
        }

        setRoom(roomData);

        const { data: customerData } =
          await supabase
            .from("customers")
            .select("full_name, email, phone")
            .eq("id", user.id)
            .maybeSingle();

        if (customerData) {
          setFullName(customerData.full_name || "");

          setEmail(
            customerData.email || user.email || ""
          );

          setPhone(customerData.phone || "");
        } else {
          setEmail(user.email || "");
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Unexpected booking page error:",
          error
        );

        setErrorMessage(
          "Something went wrong while loading the booking page."
        );

        setLoading(false);
      }
    }

    loadBookingInformation();
  }, []);

  function calculateNights() {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
      end.getTime() - start.getTime();

    const nights = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return nights > 0 ? nights : 0;
  }

  const nights = calculateNights();

  const pricePerNight =
    room?.price !== null && room?.price !== undefined
      ? Number(room.price)
      : 0;

  const totalPrice =
    nights * pricePerNight * roomsBooked;

  async function handleBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!customerId) {
      setErrorMessage(
        "Your customer account could not be identified. Please sign in again."
      );
      return;
    }

    if (!hotel || !room) {
      setErrorMessage(
        "Hotel or room information is missing."
      );
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    if (!phone.trim()) {
      setErrorMessage(
        "Please enter your phone number."
      );
      return;
    }

    if (!checkIn || !checkOut) {
      setErrorMessage(
        "Please select your check-in and check-out dates."
      );
      return;
    }

    if (nights <= 0) {
      setErrorMessage(
        "Check-out must be after check-in."
      );
      return;
    }

    if (guests < 1) {
      setErrorMessage(
        "There must be at least 1 guest."
      );
      return;
    }

    if (roomsBooked < 1) {
      setErrorMessage(
        "Please select at least 1 room."
      );
      return;
    }

    if (
      room.available_rooms !== null &&
      roomsBooked > room.available_rooms
    ) {
      setErrorMessage(
        `Only ${room.available_rooms} room${
          room.available_rooms === 1 ? "" : "s"
        } currently available.`
      );
      return;
    }

    if (paymentMethod !== "pay_at_hotel") {
      setErrorMessage(
        "Please select a payment method."
      );
      return;
    }

    setBooking(true);

    /*
     * Save the customer's latest contact details.
     */
    const { error: customerUpsertError } =
      await supabase
        .from("customers")
        .upsert(
          {
            id: customerId,
            full_name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          {
            onConflict: "id",
          }
        );

    if (customerUpsertError) {
      console.error(
        "Customer profile update error:",
        customerUpsertError
      );
    }

    /*
     * Create the booking.
     *
     * The customer selected:
     * Pay at hotel.
     *
     * Therefore the booking starts with:
     * payment_status = unpaid
     *
     * Rate-It does not collect card details.
     */
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        hotel_id: hotel.id,
        room_id: room.id,
        customer_id: customerId,
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        check_in: checkIn,
        check_out: checkOut,
        guests,
        rooms_booked: roomsBooked,
        price_per_night: pricePerNight,
        total_price: totalPrice,
        status: "pending",
        payment_status: "unpaid",
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "Booking creation error:",
        error
      );

      setErrorMessage(
        `Booking could not be created: ${error.message}`
      );

      setBooking(false);
      return;
    }

    setBookingId(data?.id || null);

    setSuccessMessage(
      "Your booking request has been created successfully. Payment will be made directly to the hotel."
    );

    setBooking(false);
  }

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
          <h2>Loading booking...</h2>

          <p style={{ color: "#666666" }}>
            Please wait while we prepare your booking.
          </p>
        </div>
      </main>
    );
  }

  if (successMessage) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f7",
          fontFamily: "Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "650px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "40px",
            borderRadius: "14px",
            border: "1px solid #e5e5e5",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            ✓
          </div>

          <h1>Booking Confirmed</h1>

          <p
            style={{
              color: "#555555",
              lineHeight: "1.6",
            }}
          >
            {successMessage}
          </p>

          {bookingId && (
            <p
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                marginTop: "25px",
              }}
            >
              Booking ID: #{bookingId}
            </p>
          )}

          <div
            style={{
              background: "#f7f7f7",
              borderRadius: "10px",
              padding: "20px",
              marginTop: "25px",
              textAlign: "left",
            }}
          >
            <p>
              <strong>Guest:</strong>{" "}
              {fullName}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {phone}
            </p>

            <p>
              <strong>Hotel:</strong>{" "}
              {hotel?.hotel_name}
            </p>

            <p>
              <strong>Room:</strong>{" "}
              {room?.room_name || "Room"}
            </p>

            <p>
              <strong>Check-in:</strong>{" "}
              {checkIn}
            </p>

            <p>
              <strong>Check-out:</strong>{" "}
              {checkOut}
            </p>

            <p>
              <strong>Guests:</strong>{" "}
              {guests}
            </p>

            <p>
              <strong>Rooms:</strong>{" "}
              {roomsBooked}
            </p>

            <p>
              <strong>Nights:</strong>{" "}
              {nights}
            </p>

            <p>
              <strong>Total:</strong>{" "}
              {Number(totalPrice).toLocaleString()}
            </p>

            <p>
              <strong>Payment method:</strong>{" "}
              Pay at hotel
            </p>

            <p>
              <strong>Payment status:</strong>{" "}
              Unpaid
            </p>
          </div>

          <Link
            href="/hotels"
            style={{
              display: "inline-block",
              marginTop: "25px",
              background: "#000000",
              color: "#ffffff",
              padding: "13px 25px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Back to Hotels
          </Link>
        </div>
      </main>
    );
  }

  if (!hotel || !room) {
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
          }}
        >
          <h1>Booking unavailable</h1>

          <p
            style={{
              color: "#b00020",
              marginTop: "15px",
            }}
          >
            {errorMessage ||
              "The selected hotel or room could not be loaded."}
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
          }}
        >
          <Link
            href="/hotels"
            style={{
              textDecoration: "none",
              color: "#000000",
              fontSize: "26px",
              fontWeight: "bold",
            }}
          >
            Rate-It
          </Link>

          <Link
            href={`/hotels/${hotel.id}`}
            style={{
              textDecoration: "none",
              color: "#333333",
            }}
          >
            ← Back to Hotel
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "14px",
              border: "1px solid #e5e5e5",
            }}
          >
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "30px",
              }}
            >
              Complete your booking
            </h1>

            <p
              style={{
                color: "#666666",
                marginBottom: "30px",
              }}
            >
              {hotel.hotel_name}
            </p>

            <div
              style={{
                background: "#f7f7f7",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "25px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "21px",
                }}
              >
                {room.room_name || "Selected room"}
              </h2>

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
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: 0,
                }}
              >
                {pricePerNight.toLocaleString()} per night
              </p>
            </div>

            <form onSubmit={handleBooking}>
              <h2
                style={{
                  fontSize: "21px",
                  marginBottom: "18px",
                }}
              >
                Guest details
              </h2>

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Full name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "15px",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "15px",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Phone number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Enter your phone number"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "28px",
                  fontSize: "15px",
                }}
              />

              <h2
                style={{
                  fontSize: "21px",
                  marginBottom: "18px",
                }}
              >
                Stay details
              </h2>

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Check-in
              </label>

              <input
                type="date"
                value={checkIn}
                onChange={(event) =>
                  setCheckIn(event.target.value)
                }
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "15px",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Check-out
              </label>

              <input
                type="date"
                value={checkOut}
                onChange={(event) =>
                  setCheckOut(event.target.value)
                }
                min={checkIn || undefined}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "15px",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Number of guests
              </label>

              <input
                type="number"
                min="1"
                value={guests}
                onChange={(event) =>
                  setGuests(
                    Math.max(
                      1,
                      Number(event.target.value)
                    )
                  )
                }
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "15px",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "7px",
                }}
              >
                Number of rooms
              </label>

              <input
                type="number"
                min="1"
                max={
                  room.available_rooms !== null
                    ? room.available_rooms
                    : undefined
                }
                value={roomsBooked}
                onChange={(event) =>
                  setRoomsBooked(
                    Math.max(
                      1,
                      Number(event.target.value)
                    )
                  )
                }
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #cccccc",
                  borderRadius: "8px",
                  marginBottom: "25px",
                  fontSize: "15px",
                }}
              />

              <h2
                style={{
                  fontSize: "21px",
                  marginBottom: "12px",
                }}
              >
                Payment
              </h2>

              <div
                style={{
                  border: "1px solid #dddddd",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "25px",
                  background: "#fafafa",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pay_at_hotel"
                    checked={
                      paymentMethod === "pay_at_hotel"
                    }
                    onChange={() =>
                      setPaymentMethod("pay_at_hotel")
                    }
                    style={{
                      marginTop: "4px",
                    }}
                  />

                  <span>
                    <strong>Pay at hotel</strong>

                    <span
                      style={{
                        display: "block",
                        color: "#666666",
                        fontSize: "14px",
                        marginTop: "5px",
                        lineHeight: "1.5",
                      }}
                    >
                      Pay the hotel directly when you arrive.
                      Rate-It will not collect or store your
                      card details for this booking.
                    </span>
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div
                  style={{
                    background: "#fff0f0",
                    border: "1px solid #ffcccc",
                    color: "#b00020",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "18px",
                    fontSize: "14px",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={booking}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "none",
                  background: booking
                    ? "#555555"
                    : "#000000",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: booking
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {booking
                  ? "Creating booking..."
                  : "Confirm Booking"}
              </button>
            </form>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "14px",
              border: "1px solid #e5e5e5",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "24px",
              }}
            >
              Booking summary
            </h2>

            <p>
              <strong>Guest:</strong>{" "}
              {fullName || "Not entered"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {email || "Not entered"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {phone || "Not entered"}
            </p>

            <p>
              <strong>Hotel:</strong>{" "}
              {hotel.hotel_name}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {hotel.location ||
                "Location not provided"}
            </p>

            <p>
              <strong>Room:</strong>{" "}
              {room.room_name || "Room"}
            </p>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #eeeeee",
                margin: "20px 0",
              }}
            />

            <p>
              <strong>Check-in:</strong>{" "}
              {checkIn || "—"}
            </p>

            <p>
              <strong>Check-out:</strong>{" "}
              {checkOut || "—"}
            </p>

            <p>
              <strong>Nights:</strong>{" "}
              {nights || "—"}
            </p>

            <p>
              <strong>Guests:</strong>{" "}
              {guests}
            </p>

            <p>
              <strong>Rooms:</strong>{" "}
              {roomsBooked}
            </p>

            <p>
              <strong>Price per night:</strong>{" "}
              {pricePerNight.toLocaleString()}
            </p>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid #eeeeee",
                margin: "20px 0",
              }}
            />

            <p
              style={{
                fontSize: "25px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Total:{" "}
              {totalPrice > 0
                ? totalPrice.toLocaleString()
                : "—"}
            </p>

            <p>
              <strong>Payment method:</strong>{" "}
              Pay at hotel
            </p>

            <p
              style={{
                color: "#666666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Payment is made directly to the hotel.
              Rate-It does not collect card details on
              this booking page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
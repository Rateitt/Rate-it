"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Hotel = {
  id: number;
  user_id: string;
  hotel_name: string | null;
  location: string | null;
  description: string | null;
  verification_status: string | null;
  verification_notes: string | null;
  verified_at: string | null;
};

export default function HotelDashboardPage() {
  const router = useRouter();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/hotel/login");
        return;
      }

      const { data, error } = await supabase
        .from("hotels")
        .select(
          "id, user_id, hotel_name, location, description, verification_status, verification_notes, verified_at"
        )
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error || !data) {
        await supabase.auth.signOut();
        router.replace("/hotel/login");
        return;
      }

      setHotel(data);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/hotel/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading hotel dashboard...</p>
      </main>
    );
  }

  if (!hotel) {
    return null;
  }

  const verificationStatus = hotel.verification_status || "pending";

  const statusLabel =
    verificationStatus === "approved"
      ? "Verified"
      : verificationStatus === "rejected"
      ? "Verification Rejected"
      : "Verification Pending";

  const statusBackground =
    verificationStatus === "approved"
      ? "#e8f7ee"
      : verificationStatus === "rejected"
      ? "#fdecec"
      : "#fff7df";

  const statusText =
    verificationStatus === "approved"
      ? "#18794e"
      : verificationStatus === "rejected"
      ? "#b42318"
      : "#8a6116";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Rate-It</h1>
            <p style={{ color: "#666" }}>Hotel Partner Dashboard</p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </header>

        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {hotel.hotel_name || "Your Hotel"}
          </h2>

          <p>
            <strong>Location:</strong>{" "}
            {hotel.location || "No location added"}
          </p>

          <p>
            {hotel.description || "No hotel description added yet."}
          </p>
        </section>

        {/* Verification Section */}
        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "25px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 8px 0" }}>
                Hotel Verification
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#666",
                  lineHeight: 1.5,
                }}
              >
                Verification helps customers know that your hotel is a
                genuine Rate-It partner.
              </p>
            </div>

            <div
              style={{
                background: statusBackground,
                color: statusText,
                padding: "10px 16px",
                borderRadius: "999px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {statusLabel}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
            }}
          >
            {verificationStatus === "pending" && (
              <>
                <h3 style={{ marginTop: 0 }}>
                  Your verification is pending
                </h3>

                <p
                  style={{
                    color: "#555",
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  Rate-It will review your hotel information and
                  verification details. Once your hotel has been approved,
                  it can receive the Rate-It Verified status.
                </p>
              </>
            )}

            {verificationStatus === "approved" && (
              <>
                <h3 style={{ marginTop: 0 }}>
                  Your hotel is verified ✓
                </h3>

                <p
                  style={{
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  Your hotel has been verified by Rate-It.
                </p>

                {hotel.verified_at && (
                  <p
                    style={{
                      color: "#666",
                      marginBottom: 0,
                    }}
                  >
                    Verified on{" "}
                    {new Date(hotel.verified_at).toLocaleDateString()}
                  </p>
                )}
              </>
            )}

            {verificationStatus === "rejected" && (
              <>
                <h3 style={{ marginTop: 0 }}>
                  Verification needs attention
                </h3>

                <p
                  style={{
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  Your verification was not approved. Please review the
                  information below and contact Rate-It if you need help.
                </p>

                {hotel.verification_notes && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "15px",
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid #eee",
                    }}
                  >
                    <strong>Rate-It notes:</strong>

                    <p
                      style={{
                        marginBottom: 0,
                        color: "#555",
                        lineHeight: 1.5,
                      }}
                    >
                      {hotel.verification_notes}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          <button
            onClick={() => router.push("/hotel/information")}
            style={cardStyle}
          >
            <h3>Hotel Information</h3>
            <p>Edit your hotel details.</p>
          </button>

          <button
            onClick={() => router.push("/hotel/rooms")}
            style={cardStyle}
          >
            <h3>Rooms</h3>
            <p>Manage rooms and prices.</p>
          </button>

          <button
            onClick={() => router.push("/hotel/bookings")}
            style={cardStyle}
          >
            <h3>Bookings</h3>
            <p>View customer bookings.</p>
          </button>

          <button
            onClick={() => router.push("/hotel/ratings")}
            style={cardStyle}
          >
            <h3>Ratings</h3>
            <p>View your hotel ratings.</p>
          </button>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "none",
  borderRadius: "14px",
  padding: "25px",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};
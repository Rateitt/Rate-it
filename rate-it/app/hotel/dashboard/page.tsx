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
        .select("id, user_id, hotel_name, location, description")
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
          <h2>{hotel.hotel_name || "Your Hotel"}</h2>
          <p>
            <strong>Location:</strong>{" "}
            {hotel.location || "No location added"}
          </p>
          <p>
            {hotel.description || "No hotel description added yet."}
          </p>
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
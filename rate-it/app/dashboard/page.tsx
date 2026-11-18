"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Customer = {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, email, phone")
        .eq("email", user.email)
        .maybeSingle();

      if (error || !data) {
        setCustomer({
          id: 0,
          full_name: user.user_metadata?.full_name || "Customer",
          email: user.email || "",
          phone: user.user_metadata?.phone || null,
        });
      } else {
        setCustomer(data);
      }

      setLoading(false);
    }

    loadCustomer();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
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
        <p>Loading your account...</p>
      </main>
    );
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
            <p style={{ color: "#666", marginTop: "6px" }}>
              Customer Dashboard
            </p>
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
            Welcome, {customer?.full_name || "Customer"}!
          </h2>

          <p style={{ color: "#666" }}>
            Your Rate-It account is ready.
          </p>

          <p>
            <strong>Email:</strong> {customer?.email || "Not available"}
          </p>

          {customer?.phone && (
            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>
          )}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          <button
            onClick={() => router.push("/hotels")}
            style={cardStyle}
          >
            <h3>Find Hotels</h3>
            <p>Discover and compare hotels on Rate-It.</p>
          </button>

          <button
            onClick={() => router.push("/bookings")}
            style={cardStyle}
          >
            <h3>My Bookings</h3>
            <p>View your hotel bookings and reservations.</p>
          </button>

          <button
            onClick={() => router.push("/")}
            style={cardStyle}
          >
            <h3>Search Hotels</h3>
            <p>Return to the Rate-It hotel search.</p>
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
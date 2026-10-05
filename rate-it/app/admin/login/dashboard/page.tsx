"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Stats = {
  hotels: number;
  customers: number;
  bookings: number;
  ratings: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats>({
    hotels: 0,
    customers: 0,
    bookings: 0,
    ratings: 0,
  });

  useEffect(() => {
    async function loadAdminDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      /*
       * Admin access is controlled by Supabase app_metadata.
       *
       * Only a user whose app_metadata contains:
       *
       * {
       *   "role": "admin"
       * }
       *
       * will be allowed into this dashboard.
       */
      const role = user.app_metadata?.role;

      if (role !== "admin") {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);

      const [
        hotelsResult,
        customersResult,
        bookingsResult,
        ratingsResult,
      ] = await Promise.all([
        supabase.from("hotels").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("ratings").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        hotels: hotelsResult.count ?? 0,
        customers: customersResult.count ?? 0,
        bookings: bookingsResult.count ?? 0,
        ratings: ratingsResult.count ?? 0,
      });

      setLoading(false);
    }

    loadAdminDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Loading admin dashboard...</p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "18px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            Rate-It Admin
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#d1d5db",
              fontSize: "14px",
            }}
          >
            Platform management dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            border: "1px solid #6b7280",
            borderRadius: "8px",
            background: "transparent",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Sign out
        </button>
      </header>

      {/* MAIN CONTENT */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "35px 24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "30px",
          }}
        >
          Dashboard
        </h2>

        <p
          style={{
            margin: "0 0 30px",
            color: "#6b7280",
          }}
        >
          Monitor and manage the Rate-It marketplace.
        </p>

        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Hotels
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "32px",
              }}
            >
              {stats.hotels}
            </strong>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Customers
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "32px",
              }}
            >
              {stats.customers}
            </strong>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Bookings
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "32px",
              }}
            >
              {stats.bookings}
            </strong>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Ratings
            </p>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "32px",
              }}
            >
              {stats.ratings}
            </strong>
          </div>
        </div>

        {/* MANAGEMENT */}
        <h2
          style={{
            margin: "0 0 18px",
            fontSize: "24px",
          }}
        >
          Management
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "18px",
          }}
        >
          <button
            type="button"
            onClick={() => alert("Hotel management will be connected next.")}
            style={{
              textAlign: "left",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Hotels</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Review and manage hotels on Rate-It.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Customer management will be connected next.")
            }
            style={{
              textAlign: "left",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Customers</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              View and manage customer accounts.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Booking management will be connected next.")
            }
            style={{
              textAlign: "left",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Bookings</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Monitor bookings across the platform.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              alert("Ratings management will be connected next.")
            }
            style={{
              textAlign: "left",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
              cursor: "pointer",
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Ratings & Reviews</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Review ratings and customer feedback.
            </p>
          </button>
        </div>
      </section>
    </main>
  );
}
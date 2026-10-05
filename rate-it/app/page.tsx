"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1f2937",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          {/* RATE-IT LOGO */}
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "28px",
              fontWeight: "800",
              color: "#111827",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Rate-It
          </button>

          {/* CUSTOMER ACTIONS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                border: "none",
                background: "transparent",
                color: "#111827",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #111827",
                background: "#ffffff",
                color: "#111827",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Create an account
            </button>

            <button
              type="button"
              onClick={() => alert("Rate-It support will be available soon.")}
              style={{
                border: "none",
                background: "transparent",
                color: "#111827",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Need help?
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          background: "#f3f7ff",
          padding: "70px 24px 90px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "46px",
              lineHeight: "1.1",
              margin: "0 0 14px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Find your next stay
          </h1>

          <p
            style={{
              fontSize: "19px",
              color: "#4b5563",
              margin: "0 0 35px",
            }}
          >
            Discover hotels, compare rooms and prices, and book your stay with
            confidence.
          </p>

          {/* SEARCH BOX */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                gap: "10px",
                alignItems: "stretch",
              }}
            >
              <input
                type="text"
                placeholder="Where are you going?"
                style={{
                  padding: "15px",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                  fontSize: "15px",
                  minWidth: 0,
                }}
              />

              <input
                type="date"
                style={{
                  padding: "15px",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                  fontSize: "15px",
                  minWidth: 0,
                }}
              />

              <input
                type="date"
                style={{
                  padding: "15px",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                  fontSize: "15px",
                  minWidth: 0,
                }}
              />

              <select
                defaultValue="2"
                style={{
                  padding: "15px",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                  fontSize: "15px",
                  minWidth: 0,
                  background: "#ffffff",
                }}
              >
                <option value="1">1 guest</option>
                <option value="2">2 guests</option>
                <option value="3">3 guests</option>
                <option value="4">4 guests</option>
                <option value="5">5 guests</option>
                <option value="6">6 guests</option>
              </select>

              <button
                type="button"
                onClick={() => router.push("/hotels")}
                style={{
                  padding: "15px 25px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY RATE-IT */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 24px",
        }}
      >
        <h2
          style={{
            fontSize: "30px",
            margin: "0 0 30px",
            color: "#111827",
          }}
        >
          Why book with Rate-It?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
            }}
          >
            <h3>Discover</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Find hotels and destinations for your next trip.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
            }}
          >
            <h3>Compare</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Compare rooms, prices and hotel information in one place.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "25px",
            }}
          >
            <h3>Stay</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
              Choose your hotel and book your stay with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* HOTEL OWNER SECTION */}
      <section
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "55px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "30px",
              }}
            >
              Are you a hotel owner?
            </h2>

            <p
              style={{
                margin: 0,
                color: "#d1d5db",
                fontSize: "17px",
              }}
            >
              Create your hotel account and manage your property on Rate-It.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/hotel/signup")}
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#111827",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            List your hotel
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "30px 24px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            © 2026 Rate-It
          </p>

          <button
            type="button"
            onClick={() => router.push("/hotel/login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Hotel Login
          </button>
        </div>
      </footer>
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";

const countries = [
  {
    name: "Uganda",
    description: "Explore destinations, hotels and unforgettable stays.",
    path: "/uganda",
    flag: "🇺🇬",
  },
  {
    name: "Kenya",
    description: "Discover hotels and destinations across Kenya.",
    path: "/kenya",
    flag: "🇰🇪",
  },
  {
    name: "Tanzania",
    description: "Explore Tanzania, Zanzibar and beautiful destinations.",
    path: "/tanzania",
    flag: "🇹🇿",
  },
  {
    name: "Rwanda",
    description: "Discover hotels and accommodation across Rwanda.",
    path: "/rwanda",
    flag: "🇷🇼",
  },
];

const services = [
  {
    title: "Hotels",
    description:
      "Discover hotels, compare rooms and prices, and book your next stay.",
    icon: "🏨",
    path: "/hotels",
    action: "Explore hotels",
  },
  {
    title: "Property Rentals",
    description:
      "Find holiday homes, apartments, villas and private accommodation.",
    icon: "🏡",
    path: "/properties",
    action: "Explore properties",
  },
  {
    title: "Car Rentals",
    description:
      "Find vehicles for business trips, holidays and everyday travel.",
    icon: "🚗",
    path: "/cars",
    action: "Explore cars",
  },
  {
    title: "Airport Transfers",
    description:
      "Arrange convenient airport pickups and transfers to your destination.",
    icon: "✈️",
    path: "/transfers",
    action: "Book a transfer",
  },
];

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
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/logo.png"
              alt="Rate-It"
              style={{
                height: "48px",
                width: "auto",
                display: "block",
              }}
            />
          </button>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
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
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          background: "#f3f7ff",
          padding: "70px 24px 85px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#2563eb",
              fontWeight: "700",
              letterSpacing: "2px",
              fontSize: "13px",
              textTransform: "uppercase",
            }}
          >
            Discover. Compare. Stay.
          </p>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 54px)",
              lineHeight: "1.1",
              margin: "15px 0",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Hotels. Homes. Cars. Transfers.
          </h1>

          <p
            style={{
              fontSize: "19px",
              color: "#4b5563",
              margin: "0 0 35px",
              lineHeight: "1.7",
            }}
          >
            Everything you need for your next journey, all in one place.
            Discover, compare and book across Africa and beyond.
          </p>

          {/* HOTEL SEARCH */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                fontSize: "19px",
                margin: "0 0 15px",
                color: "#111827",
              }}
            >
              Find your next hotel
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "10px",
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
                aria-label="Check-in date"
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
                aria-label="Check-out date"
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
                aria-label="Number of guests"
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
                Search Hotels
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR MARKETPLACE SERVICES */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "65px 24px",
        }}
      >
        <div style={{ marginBottom: "35px" }}>
          <p
            style={{
              color: "#2563eb",
              fontWeight: "700",
              letterSpacing: "2px",
              fontSize: "13px",
              textTransform: "uppercase",
            }}
          >
            Explore Rate-It
          </p>

          <h2
            style={{
              fontSize: "32px",
              color: "#111827",
              margin: "10px 0",
            }}
          >
            Everything for your journey
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Choose the service you need and explore available options.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "22px",
          }}
        >
          {services.map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => router.push(service.path)}
              style={{
                textAlign: "left",
                padding: "28px",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                background: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                transition: "transform 0.2s",
              }}
            >
              <span
                style={{
                  fontSize: "42px",
                  display: "block",
                  marginBottom: "18px",
                }}
              >
                {service.icon}
              </span>

              <h3
                style={{
                  fontSize: "22px",
                  color: "#111827",
                  margin: "0 0 12px",
                }}
              >
                {service.title}
              </h3>

              <p
                style={{
                  color: "#6b7280",
                  lineHeight: "1.7",
                  minHeight: "75px",
                  margin: 0,
                }}
              >
                {service.description}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "22px",
                  color: "#2563eb",
                  fontWeight: "700",
                }}
              >
                {service.action} →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* WHY RATE-IT */}
      <section
        style={{
          background: "#f8fafc",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "30px",
              margin: "0 0 30px",
              color: "#111827",
            }}
          >
            Why choose Rate-It?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                title: "Discover",
                description:
                  "Explore hotels, properties, vehicles and transfers.",
              },
              {
                title: "Compare",
                description:
                  "Compare available options and make informed choices.",
              },
              {
                title: "Book",
                description:
                  "Choose the services you need for your journey.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "25px",
                }}
              >
                <h3>{item.title}</h3>
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: "1.7",
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE COUNTRIES */}
      <section
        style={{
          background: "#ffffff",
          padding: "65px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "35px" }}>
            <p
              style={{
                color: "#2563eb",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "13px",
              }}
            >
              Explore Africa with Rate-It
            </p>

            <h2
              style={{
                fontSize: "32px",
                color: "#111827",
                margin: "10px 0",
              }}
            >
              Discover destinations across Africa
            </h2>

            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              Find accommodation and travel services across
              East Africa and beyond.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "22px",
            }}
          >
            {countries.map((country) => (
              <button
                key={country.name}
                type="button"
                onClick={() => router.push(country.path)}
                style={{
                  textAlign: "left",
                  padding: "28px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                }}
              >
                <span style={{ fontSize: "38px" }}>
                  {country.flag}
                </span>

                <h3
                  style={{
                    fontSize: "23px",
                    color: "#111827",
                    margin: "18px 0 10px",
                  }}
                >
                  {country.name}
                </h3>

                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: "1.6",
                    minHeight: "50px",
                  }}
                >
                  {country.description}
                </p>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "15px",
                    color: "#2563eb",
                    fontWeight: "700",
                  }}
                >
                  Explore {country.name} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER SECTION */}
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
              Become a Rate-It provider
            </h2>

            <p
              style={{
                margin: 0,
                color: "#d1d5db",
                fontSize: "17px",
                lineHeight: "1.7",
              }}
            >
              List your hotel and grow your business with Rate-It.
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
            © 2026 Rate-It. Discover. Compare. Stay.
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
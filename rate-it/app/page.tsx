"use client";

import { useEffect, useState } from "react";
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
    description: "Discover hotels, compare rooms and prices, and book your next stay.",
    icon: "🏨",
    path: "/hotels",
    action: "Explore hotels",
  },
  {
    title: "Property Rentals",
    description: "Find holiday homes, apartments, villas and private accommodation.",
    icon: "🏡",
    path: "/properties",
    action: "Explore properties",
  },
  {
    title: "Car Rentals",
    description: "Find vehicles for business trips, holidays and everyday travel.",
    icon: "🚗",
    path: "/cars",
    action: "Explore cars",
  },
  {
    title: "Airport Transfers",
    description: "Arrange convenient airport pickups and transfers.",
    icon: "✈️",
    path: "/transfers",
    action: "Book a transfer",
  },
];

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2000&q=85",
    location: "Explore Uganda",
    category: "Uganda 🇺🇬",
  },
  {
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=2000&q=85",
    location: "Discover Uganda's beautiful landscapes",
    category: "Uganda 🇺🇬",
  },
  {
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=2000&q=85",
    location: "Experience unforgettable African adventures",
    category: "Uganda 🇺🇬",
  },
  {
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=2000&q=85",
    location: "Find your next Ugandan destination",
    category: "Uganda 🇺🇬",
  },
  {
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=2000&q=85",
    location: "Discover beautiful Kenya",
    category: "Kenya 🇰🇪",
  },
  {
    image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=2000&q=85",
    location: "Experience the African safari",
    category: "Kenya 🇰🇪",
  },
  {
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2000&q=85",
    location: "Explore Kenya's natural beauty",
    category: "Kenya 🇰🇪",
  },
  {
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=85",
    location: "Plan your next Kenyan escape",
    category: "Kenya 🇰🇪",
  },
  {
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=2000&q=85",
    location: "Discover Zanzibar's tropical beaches",
    category: "Tanzania 🇹🇿",
  },
  {
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=2000&q=85",
    location: "Experience Tanzania's beautiful coastline",
    category: "Tanzania 🇹🇿",
  },
  {
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2000&q=85",
    location: "Explore unforgettable destinations",
    category: "Tanzania 🇹🇿",
  },
  {
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=85",
    location: "Discover Tanzania's natural beauty",
    category: "Tanzania 🇹🇿",
  },
  {
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=2000&q=85",
    location: "Discover beautiful Rwanda",
    category: "Rwanda 🇷🇼",
  },
  {
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2000&q=85",
    location: "Explore Rwanda's stunning landscapes",
    category: "Rwanda 🇷🇼",
  },
  {
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=85",
    location: "Experience memorable adventures",
    category: "Rwanda 🇷🇼",
  },
  {
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=2000&q=85",
    location: "Plan your Rwanda getaway",
    category: "Rwanda 🇷🇼",
  },
  {
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=2000&q=85",
    location: "Find hotels and compare prices",
    category: "Hotels 🏨",
  },
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000&q=85",
    location: "Find your perfect holiday home",
    category: "Property Rentals 🏡",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=85",
    location: "Find a vehicle for your journey",
    category: "Car Rentals 🚗",
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2000&q=85",
    location: "Arrange convenient airport transfers",
    category: "Airport Transfers ✈️",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

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
          position: "relative",
          zIndex: 5,
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
            }}
          >
            <img
              src="/logo.png"
              alt="Rate-It"
              style={{ height: "48px", width: "auto", display: "block" }}
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
            <button onClick={() => router.push("/about")} style={navButton}>
              About
            </button>

            <button
              onClick={() => router.push("/login")}
              style={navButton}
            >
              Sign in
            </button>

            <button
              onClick={() => router.push("/signup")}
              style={{
                ...navButton,
                padding: "10px 18px",
                border: "1px solid #111827",
                borderRadius: "8px",
              }}
            >
              Create an account
            </button>

            <button
              onClick={() => router.push("/contact")}
              style={navButton}
            >
              Need help?
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SLIDESHOW */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "75px 24px 85px",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          background: "#172033",
        }}
      >
        {heroSlides.map((slide, index) => (
          <img
            key={`${slide.category}-${index}`}
            src={slide.image}
            alt={slide.location}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: activeSlide === index ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              zIndex: 0,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(5,15,30,0.88), rgba(5,15,30,0.48))",
            zIndex: 1,
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <p
            style={{
              color: "#ffffff",
              fontWeight: "700",
              letterSpacing: "3px",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          >
            Discover. Compare. Stay.
          </p>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 62px)",
              lineHeight: "1.12",
              margin: "18px 0",
              fontWeight: "800",
              color: "#ffffff",
              maxWidth: "850px",
            }}
          >
            Hotels. Homes. Cars. Transfers.
          </h1>

          <p
            style={{
              fontSize: "19px",
              color: "#f3f4f6",
              margin: "0 0 20px",
              lineHeight: "1.7",
              maxWidth: "700px",
            }}
          >
            Everything you need for your next journey, all in one place.
            Discover, compare and book across East Africa and beyond.
          </p>

          {/* FREE PROVIDER LISTING ANNOUNCEMENT */}
          <div
            style={{
              maxWidth: "760px",
              background: "rgba(15, 23, 42, 0.82)",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "12px",
              padding: "20px 22px",
              marginBottom: "30px",
              backdropFilter: "blur(5px)",
            }}
          >
            <p
              style={{
                color: "#86efac",
                fontWeight: "800",
                letterSpacing: "1.5px",
                fontSize: "13px",
                margin: "0 0 9px",
              }}
            >
              FREE PROVIDER LISTINGS
            </p>

            <h2
              style={{
                color: "#ffffff",
                fontSize: "clamp(21px, 3vw, 30px)",
                lineHeight: "1.3",
                margin: "0 0 10px",
              }}
            >
              List your hotel, property, rental car or airport transfer for FREE!
            </h2>

            <p
              style={{
                color: "#e5e7eb",
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Grow your business and reach customers across East Africa
              and beyond with Rate-It.
            </p>
          </div>

          {/* HOTEL SEARCH */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "22px",
              boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
              maxWidth: "1100px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                margin: "0 0 17px",
                color: "#111827",
              }}
            >
              Find your next hotel
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Where are you going?"
                style={inputStyle}
              />

              <input
                type="date"
                aria-label="Check-in date"
                style={inputStyle}
              />

              <input
                type="date"
                aria-label="Check-out date"
                style={inputStyle}
              />

              <select
                defaultValue="2"
                aria-label="Number of guests"
                style={inputStyle}
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
                style={primaryButton}
              >
                Search Hotels
              </button>
            </div>
          </div>

          {/* SLIDESHOW INDICATORS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "25px",
              flexWrap: "wrap",
            }}
          >
            {heroSlides.map((slide, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show slide ${index + 1}: ${slide.category}`}
                aria-pressed={activeSlide === index}
                onClick={() => setActiveSlide(index)}
                style={{
                  width: activeSlide === index ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "20px",
                  border: "none",
                  padding: 0,
                  background:
                    activeSlide === index
                      ? "#ffffff"
                      : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          <p
            style={{
              color: "#ffffff",
              fontSize: "13px",
              marginTop: "10px",
            }}
          >
            {heroSlides[activeSlide].category} · {activeSlide + 1} of 20
          </p>
        </div>
      </section>

      {/* MARKETPLACE SERVICES */}
      <section style={sectionStyle}>
        <div style={{ marginBottom: "35px" }}>
          <p style={eyebrowStyle}>Explore Rate-It</p>
          <h2 style={headingStyle}>Everything for your journey</h2>
          <p style={paragraphStyle}>
            Choose the service you need and explore available options.
          </p>
        </div>

        <div style={gridStyle}>
          {services.map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => router.push(service.path)}
              style={serviceCard}
            >
              <span style={{ fontSize: "42px", display: "block", marginBottom: "18px" }}>
                {service.icon}
              </span>

              <h3 style={{ fontSize: "22px", color: "#111827", margin: "0 0 12px" }}>
                {service.title}
              </h3>

              <p style={{ color: "#6b7280", lineHeight: "1.7", minHeight: "75px", margin: 0 }}>
                {service.description}
              </p>

              <span style={{ display: "inline-block", marginTop: "22px", color: "#2563eb", fontWeight: "700" }}>
                {service.action} →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* WHY RATE-IT */}
      <section style={{ ...sectionStyle, background: "#f8fafc" }}>
        <h2 style={{ ...headingStyle, marginBottom: "30px" }}>
          Why choose Rate-It?
        </h2>

        <div style={gridStyle}>
          {[
            {
              title: "Discover",
              description: "Explore hotels, properties, vehicles and transfers.",
            },
            {
              title: "Compare",
              description: "Compare available options and make informed choices.",
            },
            {
              title: "Book",
              description: "Choose the services you need for your journey.",
            },
          ].map((item) => (
            <div key={item.title} style={serviceCard}>
              <h3>{item.title}</h3>
              <p style={paragraphStyle}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE COUNTRIES */}
      <section style={sectionStyle}>
        <div style={{ marginBottom: "35px" }}>
          <p style={eyebrowStyle}>Explore East Africa with Rate-It</p>
          <h2 style={headingStyle}>Discover destinations across East Africa</h2>
          <p style={paragraphStyle}>
            Find accommodation and travel services across East Africa and beyond.
          </p>
        </div>

        <div style={gridStyle}>
          {countries.map((country) => (
            <button
              key={country.name}
              type="button"
              onClick={() => router.push(country.path)}
              style={serviceCard}
            >
              <span style={{ fontSize: "38px" }}>{country.flag}</span>

              <h3 style={{ fontSize: "23px", color: "#111827", margin: "18px 0 10px" }}>
                {country.name}
              </h3>

              <p style={paragraphStyle}>{country.description}</p>

              <span style={{ color: "#2563eb", fontWeight: "700" }}>
                Explore {country.name} →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FREE PROVIDER SECTION */}
      <section
        id="provider"
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
            <h2 style={{ margin: "0 0 12px", fontSize: "30px" }}>
              List your business on Rate-It for FREE!
            </h2>

            <p style={{ margin: 0, color: "#d1d5db", fontSize: "17px", lineHeight: "1.7" }}>
              Hotels, property rentals, car rentals and airport transfer
              providers are welcome to join Rate-It and showcase their services.
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
          <p style={{ margin: 0, color: "#6b7280" }}>
            © 2026 Rate-It. Discover. Compare. Stay.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/about")} style={footerButton}>
              About
            </button>

            <button onClick={() => router.push("/contact")} style={footerButton}>
              Contact Us
            </button>

            <button onClick={() => router.push("/hotel/login")} style={footerButton}>
              Hotel Login
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}

const navButton = {
  border: "none",
  background: "transparent",
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const inputStyle = {
  padding: "15px",
  border: "1px solid #9ca3af",
  borderRadius: "8px",
  fontSize: "15px",
  minWidth: 0,
  background: "#ffffff",
};

const primaryButton = {
  padding: "15px 25px",
  border: "none",
  borderRadius: "8px",
  background: "#111827",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const sectionStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "65px 24px",
};

const eyebrowStyle = {
  color: "#2563eb",
  fontWeight: "700",
  letterSpacing: "2px",
  fontSize: "13px",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  fontSize: "32px",
  color: "#111827",
  margin: "10px 0",
};

const paragraphStyle = {
  color: "#6b7280",
  fontSize: "16px",
  lineHeight: "1.7",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "22px",
};

const serviceCard = {
  textAlign: "left" as const,
  padding: "28px",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  background: "#ffffff",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
};

const footerButton = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "15px",
};
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Stats = {
  hotels: number;
  customers: number;
  bookings: number;
  ratings: number;
  properties: number;
  vehicles: number;
  transfers: number;
};

const managementLinks = [
  {
    title: "Hotels",
    description: "View and manage hotel listings.",
    href: "/hotels",
  },
  {
    title: "Property Rentals",
    description: "Manage property rental listings.",
    href: "/properties",
  },
  {
    title: "Car Rentals",
    description: "Manage vehicles and rental listings.",
    href: "/cars",
  },
  {
    title: "Airport Transfers",
    description: "Manage transfer services.",
    href: "/transfers",
  },
  {
    title: "Payments & Commissions",
    description: "Review payments and provider payouts.",
    href: "/admin/login/payments",
  },
  {
    title: "Provider Accounts",
    description: "View provider accounts.",
    href: "/providers/dashboard",
  },
  {
    title: "Verification Centre",
    description: "Review provider verification applications.",
    href: "/admin/login/verification",
  },
  {
    title: "Hotel Bookings",
    description: "Open the hotel booking marketplace.",
    href: "/hotels",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [stats, setStats] = useState<Stats>({
    hotels: 0,
    customers: 0,
    bookings: 0,
    ratings: 0,
    properties: 0,
    vehicles: 0,
    transfers: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/admin/login");
          return;
        }

        if (user.app_metadata?.role !== "admin") {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        if (!active) return;

        setAuthorized(true);

        const tables = [
          "hotels",
          "customers",
          "bookings",
          "ratings",
          "property",
          "vehicles",
          "transfer_services",
        ] as const;

        const results = await Promise.all(
          tables.map((table) =>
            supabase
              .from(table)
              .select("*", { count: "exact", head: true })
          )
        );

        if (!active) return;

        const failed = results.find((result) => result.error);

        if (failed) {
          setErrorMessage(
            "Some statistics could not be loaded. Check Supabase table permissions."
          );
        }

        setStats({
          hotels: results[0].count ?? 0,
          customers: results[1].count ?? 0,
          bookings: results[2].count ?? 0,
          ratings: results[3].count ?? 0,
          properties: results[4].count ?? 0,
          vehicles: results[5].count ?? 0,
          transfers: results[6].count ?? 0,
        });
      } catch {
        if (active) {
          setErrorMessage("Unable to load dashboard statistics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading Rate-It Admin Dashboard...
      </main>
    );
  }

  if (!authorized) return null;

  const statistics = [
    ["Hotels", stats.hotels],
    ["Customers", stats.customers],
    ["Bookings", stats.bookings],
    ["Ratings", stats.ratings],
    ["Properties", stats.properties],
    ["Vehicles", stats.vehicles],
    ["Transfer Services", stats.transfers],
  ];

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-gray-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rate-It Admin</h1>
            <p className="text-gray-300 mt-1">
              Marketplace management dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-gray-500 rounded-lg px-5 py-3"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>

        <p className="text-gray-600 mt-2 mb-8">
          Monitor the Rate-It marketplace.
        </p>

        {errorMessage && (
          <div className="bg-yellow-100 text-yellow-900 p-4 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {statistics.map(([label, value]) => (
            <div
              key={label}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
              <p className="text-gray-500">{label}</p>
              <p className="text-3xl font-bold mt-3">{value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-5">
          Marketplace Management
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {managementLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold">{item.title}</h3>

              <p className="text-gray-600 mt-2">
                {item.description}
              </p>

              <p className="text-blue-700 font-semibold mt-4">
                Open management →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
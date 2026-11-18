"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
};

const managementLinks = [
  {
    title: "Hotels",
    description: "View hotels listed on Rate-It.",
    href: "/hotels",
  },
  {
    title: "Property Rentals",
    description: "Manage Airbnb-style property listings.",
    href: "/properties",
  },
  {
    title: "Car Rentals",
    description: "View available rental vehicles.",
    href: "/cars",
  },
  {
    title: "Airport Transfers",
    description: "Manage airport transfer services.",
    href: "/transfers",
  },
  {
    title: "Payments & Commissions",
    description: "Review payments, commissions and provider payouts.",
    href: "/admin/payments",
  },
  {
    title: "Provider Accounts",
    description: "Open provider account management.",
    href: "/providers/dashboard",
  },
  {
    title: "Verification Centre",
    description: "Approve or reject provider verification applications.",
    href: "/admin/verification",
  },
];

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

      setAuthorized(true);

      const [
        hotelsResult,
        customersResult,
        bookingsResult,
        ratingsResult,
      ] = await Promise.all([
        supabase.from("hotels").select("*", {
          count: "exact",
          head: true,
        }),
        supabase.from("customers").select("*", {
          count: "exact",
          head: true,
        }),
        supabase.from("bookings").select("*", {
          count: "exact",
          head: true,
        }),
        supabase.from("ratings").select("*", {
          count: "exact",
          head: true,
        }),
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
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading Rate-It Admin Dashboard...</p>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-gray-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rate-It Admin</h1>
            <p className="text-gray-300 mt-1">
              Platform management dashboard
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
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Monitor and manage the Rate-It marketplace.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            ["Hotels", stats.hotels],
            ["Customers", stats.customers],
            ["Bookings", stats.bookings],
            ["Ratings", stats.ratings],
          ].map(([label, value]) => (
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
            <a
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
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
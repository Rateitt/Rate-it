"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Commission = {
  id: string;
  provider_id: string | null;
  provider: string | null;
  payment_id: string | null;
  booking_type: string | null;
  booking_id: string | null;
  booking_amount: number | string | null;
  booking_rate: number | string | null;
  commission_amount: number | string | null;
  currency: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [hotelCount, setHotelCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    setLoading(true);
    setMessage("");

    try {
      const [commissionResult, hotelResult] = await Promise.all([
        supabase
          .from("commissions")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("hotels")
          .select("id", { count: "exact", head: true }),
      ]);

      if (commissionResult.error) throw commissionResult.error;

      setCommissions((commissionResult.data || []) as Commission[]);
      setHotelCount(hotelResult.count || 0);

      if (hotelResult.error) {
        setMessage(
          "Commission records loaded, but the hotel registration count could not be retrieved."
        );
      }
    } catch (error: any) {
      setMessage(error.message || "Could not load commission records.");
    } finally {
      setLoading(false);
    }
  }

  async function updateCommissionStatus(
    commissionId: string,
    newStatus: string
  ) {
    const confirmed = window.confirm(
      newStatus === "paid"
        ? "Confirm that this commission has actually been received?"
        : "Change this commission status?"
    );

    if (!confirmed) return;

    setUpdating(commissionId);
    setMessage("");

    try {
      const { error } = await supabase
        .from("commissions")
        .update({ status: newStatus })
        .eq("id", commissionId);

      if (error) throw error;

      setMessage("Commission status updated successfully.");
      await loadCommissions();
    } catch (error: any) {
      setMessage(error.message || "Could not update commission.");
    } finally {
      setUpdating(null);
    }
  }

  const filteredCommissions = useMemo(() => {
    return commissions.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !searchText ||
        String(item.provider || "").toLowerCase().includes(searchText) ||
        String(item.provider_id || "").toLowerCase().includes(searchText) ||
        String(item.booking_id || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        String(item.status || "").toLowerCase() === statusFilter;

      const itemMonth = item.created_at
        ? item.created_at.slice(0, 7)
        : "";

      const matchesMonth =
        monthFilter === "all" || itemMonth === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [commissions, search, statusFilter, monthFilter]);

  const totalOutstanding = filteredCommissions
    .filter((item) => item.status !== "paid")
    .reduce(
      (total, item) => total + Number(item.commission_amount || 0),
      0
    );

  const totalCollected = filteredCommissions
    .filter((item) => item.status === "paid")
    .reduce(
      (total, item) => total + Number(item.commission_amount || 0),
      0
    );

  const totalCommission = filteredCommissions.reduce(
    (total, item) => total + Number(item.commission_amount || 0),
    0
  );

  const months = Array.from(
    new Set(
      commissions
        .map((item) => item.created_at?.slice(0, 7))
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  function formatMoney(value: number | string | null, currency: string | null) {
    return `${currency || "UGX"} ${Number(value || 0).toLocaleString()}`;
  }

  function exportCSV() {
    const headers = [
      "Date",
      "Provider",
      "Provider ID",
      "Booking Type",
      "Booking ID",
      "Booking Amount",
      "Commission Rate",
      "Commission Amount",
      "Currency",
      "Status",
    ];

    const rows = filteredCommissions.map((item) => [
      item.created_at,
      item.provider || "",
      item.provider_id || "",
      item.booking_type || "",
      item.booking_id || "",
      item.booking_amount || 0,
      item.booking_rate || 0,
      item.commission_amount || 0,
      item.currency || "",
      item.status || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rate-it-commission-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        Loading commission management...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commission Management
            </h1>
            <p className="mt-2 text-gray-600">
              Track provider commissions and hotel commission collections.
            </p>
          </div>

          <button
            onClick={loadCommissions}
            className="rounded-lg border bg-white px-4 py-2"
          >
            Refresh records
          </button>
        </div>

        {message && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
            {message}
          </div>
        )}

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-bold">Hotel registration milestone</h2>

          <p className="mt-2 text-gray-600">
            Registered hotels: <strong>{hotelCount}</strong> / 250
          </p>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-700"
              style={{
                width: `${Math.min((hotelCount / 250) * 100, 100)}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-600">
            {hotelCount >= 250
              ? "The 250-hotel milestone has been reached. The planned hotel commission rate is 10%."
              : `${250 - hotelCount} more hotel registrations until the planned commission milestone. No hotel commission should be charged before the milestone.`}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total commissions</p>
            <p className="mt-2 text-2xl font-bold">
              {totalCommission.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Combined currencies; see individual records below
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Outstanding commissions</p>
            <p className="mt-2 text-2xl font-bold text-orange-700">
              {totalOutstanding.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Collected commissions</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {totalCollected.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Commission records</h2>

            <button
              onClick={exportCSV}
              className="rounded-lg bg-blue-950 px-4 py-2 text-white"
            >
              Export CSV report
            </button>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search provider or booking ID"
              className="rounded-lg border p-3"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border p-3"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border p-3"
            >
              <option value="all">All months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {filteredCommissions.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
              No commission records found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCommissions.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">
                        {item.provider || "Provider"}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Provider ID: {item.provider_id || "Not recorded"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Booking type: {item.booking_type || "Not specified"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Booking ID: {item.booking_id || "Not recorded"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Date:{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                        item.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Booking amount</p>
                      <p className="font-semibold">
                        {formatMoney(item.booking_amount, item.currency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Commission rate</p>
                      <p className="font-semibold">
                        {item.booking_rate ?? 0}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Commission amount
                      </p>
                      <p className="font-bold text-blue-900">
                        {formatMoney(item.commission_amount, item.currency)}
                      </p>
                    </div>
                  </div>

                  {item.status !== "paid" && (
                    <button
                      disabled={updating === item.id}
                      onClick={() =>
                        updateCommissionStatus(item.id, "paid")
                      }
                      className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {updating === item.id
                        ? "Updating..."
                        : "Mark commission as collected"}
                    </button>
                  )}

                  {item.status === "paid" && (
                    <p className="mt-4 text-sm font-medium text-green-700">
                      Commission marked as collected.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
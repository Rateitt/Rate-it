"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Verification = {
  id: string | number;
  provider_id?: string;
  hotel_name?: string;
  business_name?: string;
  name?: string;
  provider_type?: string;
  verification_status?: string;
  status?: string;
  verification_notes?: string;
  verified_at?: string;
  created_at?: string;
};

function formatDate(value?: string) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleString();
}

export default function VerificationDashboard() {
  const router = useRouter();

  const [records, setRecords] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState<string | number | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("provider_verifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setMessage("Unable to load verification records: " + error.message);
      setRecords([]);
    } else {
      setRecords((data || []) as Verification[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !user || user.app_metadata?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }

      await loadRecords();
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router, loadRecords]);

  async function updateStatus(
    record: Verification,
    status: "Approved" | "Rejected"
  ) {
    const notes = window.prompt(
      `Enter verification notes for ${status.toLowerCase()}:`,
      record.verification_notes || ""
    );

    if (notes === null) return;

    if (status === "Rejected" && !notes.trim()) {
      setMessage("Please provide a reason for rejecting this application.");
      return;
    }

    const currentStatus = (
      record.verification_status ||
      record.status ||
      "Pending"
    ).toLowerCase();

    if (currentStatus !== "pending") {
      setMessage("Only pending applications can be updated.");
      return;
    }

    if (
      !window.confirm(
        `Confirm ${status.toLowerCase()} this provider application?`
      )
    ) {
      return;
    }

    setSaving(record.id);
    setMessage("");

    const { data, error } = await supabase
      .from("provider_verifications")
      .update({
        status,
        verification_status: status,
        verification_notes: notes.trim(),
        verified_at:
          status === "Approved" ? new Date().toISOString() : null,
      })
      .eq("id", record.id)
      .eq("status", record.status || "Pending")
      .select("id");

    if (error) {
      setMessage("Update failed: " + error.message);
    } else if (!data || data.length === 0) {
      setMessage(
        "The application was not updated. Please refresh and check its current status."
      );
    } else {
      setMessage(`Provider application ${status.toLowerCase()} successfully.`);
      await loadRecords();
    }

    setSaving(null);
  }

  function getStatus(record: Verification) {
    return record.verification_status || record.status || "Pending";
  }

  const pendingCount = records.filter(
    (record) => getStatus(record).toLowerCase() === "pending"
  ).length;

  const approvedCount = records.filter(
    (record) => getStatus(record).toLowerCase() === "approved"
  ).length;

  const rejectedCount = records.filter(
    (record) => getStatus(record).toLowerCase() === "rejected"
  ).length;

  const filtered = records.filter((record) => {
    return (
      filter === "All" ||
      getStatus(record).toLowerCase() === filter.toLowerCase()
    );
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Rate-It Verification Centre
            </h1>
            <p className="mt-1 text-blue-200">
              Review and manage provider verification applications.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/login/dashboard")}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-950"
          >
            Admin Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold">
            Provider verification applications
          </h2>

          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border bg-white p-3"
            >
              <option value="All">All applications</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={loadRecords}
              disabled={loading}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total applications</p>
            <p className="mt-2 text-3xl font-bold">{records.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>
        </div>

        {message && (
          <div
            className="mb-5 rounded-lg border bg-white p-4 text-sm"
            role="status"
          >
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading verification applications...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <h3 className="text-xl font-bold">
              No verification records found
            </h3>
            <p className="mt-2 text-gray-500">
              Applications will appear here when providers submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((record) => {
              const status = getStatus(record);
              const normalizedStatus = status.toLowerCase();
              const isPending = normalizedStatus === "pending";
              const isSaving = saving === record.id;

              return (
                <article
                  key={record.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">
                        {record.business_name ||
                          record.hotel_name ||
                          record.name ||
                          "Provider application"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        Provider type: {record.provider_type || "Provider"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Provider ID: {record.provider_id || "Not specified"}
                      </p>

                      <p className="mt-3 text-sm text-gray-600">
                        Date submitted: {formatDate(record.created_at)}
                      </p>

                      <p className="text-sm text-gray-600">
                        Date verified: {formatDate(record.verified_at)}
                      </p>

                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold">Admin notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                          {record.verification_notes || "No admin notes yet."}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 md:min-w-40">
                      <span
                        className={`rounded-lg px-4 py-2 text-center text-sm font-bold ${
                          normalizedStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : normalizedStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {status}
                      </span>

                      {isPending && (
                        <>
                          <button
                            disabled={isSaving}
                            onClick={() => updateStatus(record, "Approved")}
                            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Approve"}
                          </button>

                          <button
                            disabled={isSaving}
                            onClick={() => updateStatus(record, "Rejected")}
                            className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
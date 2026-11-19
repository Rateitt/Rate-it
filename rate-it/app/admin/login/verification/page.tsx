"use client";

import { useEffect, useState } from "react";
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

export default function VerificationDashboard() {
  const router = useRouter();

  const [records, setRecords] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState<string | number | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.app_metadata?.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    await loadRecords();
  }

  async function loadRecords() {
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
  }

  async function updateStatus(
    record: Verification,
    status: "Approved" | "Rejected"
  ) {
    const notes = window.prompt(
      `Enter verification notes for ${status.toLowerCase()}:`,
      record.verification_notes || ""
    );

    if (notes === null) return;

    setSaving(record.id);
    setMessage("");

    const { error } = await supabase
      .from("provider_verifications")
      .update({
        status,
        verification_status: status,
        verification_notes: notes,
        verified_at:
          status === "Approved" ? new Date().toISOString() : null,
      })
      .eq("id", record.id);

    if (error) {
      setMessage("Update failed: " + error.message);
    } else {
      setMessage(`Verification record ${status.toLowerCase()}.`);
      await loadRecords();
    }

    setSaving(null);
  }

  const filtered = records.filter((record) => {
    const status =
      record.verification_status || record.status || "Pending";

    return (
      filter === "All" ||
      status.toLowerCase() === filter.toLowerCase()
    );
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold">
            Rate-It Verification Centre
          </h1>
          <p className="mt-1 text-blue-200">
            Review and manage provider verification records.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row">
          <h2 className="text-2xl font-bold">
            Verification applications
          </h2>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
              className="rounded-lg bg-blue-700 px-5 py-3 text-white disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-blue-50 p-4 text-blue-800">
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
              const status =
                record.verification_status ||
                record.status ||
                "Pending";

              const isPending =
                status.toLowerCase() === "pending";

              return (
                <article
                  key={record.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <h3 className="text-lg font-bold">
                        {record.business_name ||
                          record.hotel_name ||
                          record.name ||
                          "Provider application"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Type: {record.provider_type || "Provider"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Provider ID: {record.provider_id || "Not specified"}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        Submitted:{" "}
                        {record.created_at
                          ? new Date(record.created_at).toLocaleDateString()
                          : "Not specified"}
                      </p>

                      {record.verification_notes && (
                        <p className="mt-3 text-sm text-gray-600">
                          Notes: {record.verification_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-semibold">
                        Status: {status}
                      </span>

                      {isPending && (
                        <>
                          <button
                            disabled={saving === record.id}
                            onClick={() =>
                              updateStatus(record, "Approved")
                            }
                            className="rounded-lg bg-green-700 px-5 py-3 text-white disabled:opacity-50"
                          >
                            {saving === record.id
                              ? "Saving..."
                              : "Approve"}
                          </button>

                          <button
                            disabled={saving === record.id}
                            onClick={() =>
                              updateStatus(record, "Rejected")
                            }
                            className="rounded-lg bg-red-700 px-5 py-3 text-white disabled:opacity-50"
                          >
                            {saving === record.id
                              ? "Saving..."
                              : "Reject"}
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
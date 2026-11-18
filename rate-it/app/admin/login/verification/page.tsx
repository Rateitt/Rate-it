"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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
  const [records, setRecords] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState<string | number | null>(null);

  async function loadRecords() {
    setLoading(true);

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
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRecords();
  }, []);

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

    return filter === "All" || status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            Rate-It Verification Centre
          </h1>
          <p className="text-blue-200 mt-1">
            Review and manage provider verification records.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-7">
          <h2 className="text-2xl font-bold">
            Verification applications
          </h2>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border bg-white rounded-lg p-3"
            >
              <option value="All">All applications</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={loadRecords}
              disabled={loading}
              className="bg-blue-700 text-white px-5 py-3 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-5">
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading verification applications...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center">
            <h3 className="font-bold text-xl">
              No verification records found
            </h3>
            <p className="text-gray-500 mt-2">
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

              return (
                <article
                  key={record.id}
                  className="bg-white border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    <div>
                      <h3 className="font-bold text-lg">
                        {record.business_name ||
                          record.hotel_name ||
                          record.name ||
                          "Provider application"}
                      </h3>

                      <p className="text-gray-500 text-sm mt-2">
                        Type: {record.provider_type || "Provider"}
                      </p>

                      <p className="text-gray-500 text-sm">
                        Provider ID: {record.provider_id || "Not specified"}
                      </p>

                      <p className="text-gray-500 text-sm mt-2">
                        Submitted: {record.created_at
                          ? new Date(record.created_at).toLocaleDateString()
                          : "Not specified"}
                      </p>

                      {record.verification_notes && (
                        <p className="text-gray-600 text-sm mt-3">
                          Notes: {record.verification_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="font-semibold text-sm">
                        Status: {status}
                      </span>

                      {status.toLowerCase() === "pending" && (
                        <>
                          <button
                            disabled={saving === record.id}
                            onClick={() => updateStatus(record, "Approved")}
                            className="bg-green-700 text-white rounded-lg px-5 py-3 disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            disabled={saving === record.id}
                            onClick={() => updateStatus(record, "Rejected")}
                            className="bg-red-700 text-white rounded-lg px-5 py-3 disabled:opacity-50"
                          >
                            Reject
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
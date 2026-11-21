"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Verification = {
  id: string;
  provider_id: string;
  status: string;
  reviewer_notes?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  business_name?: string;
  provider_type?: string;
  user_id?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not specified"
    : date.toLocaleString();
}

export default function VerificationDashboard() {
  const router = useRouter();

  const [records, setRecords] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("provider_verifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setMessage("Unable to load applications: " + error.message);
      setRecords([]);
      setLoading(false);
      return;
    }

    const verificationRecords = (data || []) as Verification[];
    const providerIds = [
      ...new Set(
        verificationRecords
          .map((record) => record.provider_id)
          .filter(Boolean)
      ),
    ];

    let providers: {
      id: string;
      user_id: string;
      business_name: string;
      provider_type: string;
    }[] = [];

    if (providerIds.length > 0) {
      const { data: providerData, error: providerError } = await supabase
        .from("providers")
        .select("id, user_id, business_name, provider_type")
        .in("id", providerIds);

      if (providerError) {
        setMessage(
          "Applications loaded, but provider details could not be loaded: " +
            providerError.message
        );
      } else {
        providers = providerData || [];
      }
    }

    const combined = verificationRecords.map((record) => {
      const provider = providers.find(
        (item) => item.id === record.provider_id
      );

      return {
        ...record,
        user_id: provider?.user_id,
        business_name: provider?.business_name,
        provider_type: provider?.provider_type,
      };
    });

    setRecords(combined);
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
      record.reviewer_notes || ""
    );

    if (notes === null) return;

    if (status === "Rejected" && !notes.trim()) {
      setMessage("Please provide a reason for rejecting this application.");
      return;
    }

    if ((record.status || "Pending").toLowerCase() !== "pending") {
      setMessage("Only pending applications can be updated.");
      return;
    }

    if (!record.provider_id) {
      setMessage("This application has no provider ID.");
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

    // Find the provider and the hotel connected to that provider.
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("user_id")
      .eq("id", record.provider_id)
      .maybeSingle();

    if (providerError || !provider?.user_id) {
      setMessage(
        "Unable to find the provider account: " +
          (providerError?.message || "Provider account not found.")
      );
      setSaving(null);
      return;
    }

    const { data: hotels, error: hotelLookupError } = await supabase
      .from("hotels")
      .select("id")
      .eq("user_id", provider.user_id);

    if (hotelLookupError) {
      setMessage(
        "Unable to find the provider's hotel: " + hotelLookupError.message
      );
      setSaving(null);
      return;
    }

    const reviewedAt = new Date().toISOString();

    // Update the verification application using your actual columns.
    const { data, error } = await supabase
      .from("provider_verifications")
      .update({
        status,
        reviewer_notes: notes.trim(),
        reviewed_at: reviewedAt,
      })
      .eq("id", record.id)
      .eq("status", record.status || "Pending")
      .select("id");

    if (error) {
      setMessage("Verification update failed: " + error.message);
      setSaving(null);
      return;
    }

    if (!data || data.length === 0) {
      setMessage(
        "The application was not updated. Refresh and check its current status."
      );
      setSaving(null);
      return;
    }

    // Synchronize the decision with every hotel belonging to this provider.
    if (hotels && hotels.length > 0) {
      const { error: hotelUpdateError } = await supabase
        .from("hotels")
        .update({
          verification_status: status,
          verification_notes: notes.trim(),
          verified_at: status === "Approved" ? reviewedAt : null,
        })
        .eq("user_id", provider.user_id);

      if (hotelUpdateError) {
        setMessage(
          `Application ${status.toLowerCase()}, but hotel verification could not be synchronized: ${hotelUpdateError.message}`
        );
        await loadRecords();
        setSaving(null);
        return;
      }

      setMessage(
        status === "Approved"
          ? "Provider approved. The hotel's blue verified tick is now activated."
          : "Provider rejected. The hotel's verified tick has been removed."
      );
    } else {
      setMessage(
        `Provider application ${status.toLowerCase()}, but no hotel listing was found for this provider yet.`
      );
    }

    await loadRecords();
    setSaving(null);
  }

  const pendingCount = records.filter(
    (record) => (record.status || "Pending").toLowerCase() === "pending"
  ).length;

  const approvedCount = records.filter(
    (record) => record.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = records.filter(
    (record) => record.status?.toLowerCase() === "rejected"
  ).length;

  const filtered = records.filter(
    (record) =>
      filter === "All" ||
      (record.status || "Pending").toLowerCase() === filter.toLowerCase()
  );

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
              const status = record.status || "Pending";
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
                        {record.business_name || "Provider application"}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        Provider type: {record.provider_type || "Provider"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Provider ID: {record.provider_id}
                      </p>

                      <p className="mt-3 text-sm text-gray-600">
                        Date submitted: {formatDate(record.created_at)}
                      </p>

                      <p className="text-sm text-gray-600">
                        Date reviewed: {formatDate(record.reviewed_at)}
                      </p>

                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold">Admin notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                          {record.reviewer_notes || "No admin notes yet."}
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
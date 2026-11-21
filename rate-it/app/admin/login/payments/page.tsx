"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Row = Record<string, unknown>;

type TableData = {
  rows: Row[];
  error: string;
};

function RecordsSection({
  title,
  data,
}: {
  title: string;
  data: TableData;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>

      {data.error && (
        <p className="text-sm text-red-600">{data.error}</p>
      )}

      {!data.error && data.rows.length === 0 && (
        <p className="text-sm text-gray-500">
          No records available yet.
        </p>
      )}

      {data.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Record ID</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="border-b">
                  <td className="p-3 font-semibold">
                    {String(row.id ?? "—")}
                  </td>
                  <td className="p-3">
                    <details>
                      <summary className="cursor-pointer text-blue-700">
                        View record
                      </summary>
                      <pre className="mt-3 whitespace-pre-wrap break-words rounded bg-gray-50 p-3 text-xs">
                        {JSON.stringify(row, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PayoutsSection({
  data,
  onAction,
  busyId,
}: {
  data: TableData;
  onAction: (
    id: string,
    action: "approve" | "reject" | "paid"
  ) => Promise<void>;
  busyId: string | null;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">
        Provider Payout Management
      </h2>

      {data.error && (
        <p className="mb-4 text-sm text-red-600">{data.error}</p>
      )}

      {!data.error && data.rows.length === 0 && (
        <p className="text-sm text-gray-500">
          No provider payout records available yet.
        </p>
      )}

      {data.rows.length > 0 && (
        <div className="space-y-4">
          {data.rows.map((row, index) => {
            const id = String(row.id ?? index);
            const status = String(row.status ?? "").toLowerCase();
            const isBusy = busyId === id;

            return (
              <div
                key={id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      Payout #{id}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Provider: {String(row.provider_id ?? "—")}
                    </p>

                    <p className="text-sm text-gray-600">
                      Amount: {String(row.amount ?? "—")}{" "}
                      {String(row.currency ?? "")}
                    </p>

                    <p className="text-sm text-gray-600">
                      Method: {String(row.payout_method ?? "—")}
                    </p>

                    <p className="text-sm text-gray-600">
                      Reference: {String(row.payout_reference ?? "—")}
                    </p>

                    <p className="text-sm text-gray-600">
                      Requested: {String(row.requested_at ?? "—")}
                    </p>

                    <p className="text-sm text-gray-600">
                      Paid: {String(row.paid_at ?? "Not paid")}
                    </p>

                    <p className="mt-2 text-sm">
                      Status:{" "}
                      <span className="font-bold uppercase">
                        {status || "Unknown"}
                      </span>
                    </p>

                    {row.notes != null && (
                      <p className="mt-1 text-sm text-gray-600">
                        Notes: {String(row.notes)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => onAction(id, "approve")}
                          disabled={isBusy}
                          className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => onAction(id, "reject")}
                          disabled={isBusy}
                          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {status === "approved" && (
                      <button
                        onClick={() => onAction(id, "paid")}
                        disabled={isBusy}
                        className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Mark as Paid
                      </button>
                    )}

                    {status === "paid" && (
                      <span className="rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-800">
                        Payment Completed
                      </span>
                    )}

                    {isBusy && (
                      <span className="self-center text-xs text-gray-500">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function PaymentsDashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [payments, setPayments] = useState<TableData>({
    rows: [],
    error: "",
  });

  const [commissions, setCommissions] = useState<TableData>({
    rows: [],
    error: "",
  });

  const [payouts, setPayouts] = useState<TableData>({
    rows: [],
    error: "",
  });

  async function loadRecords() {
    setLoading(true);

    try {
      const results = await Promise.all([
        supabase.from("payments").select("*").limit(100),
        supabase.from("commissions").select("*").limit(100),
        supabase.from("provider_payouts").select("*").limit(100),
      ]);

      const [paymentResult, commissionResult, payoutResult] = results;

      setPayments({
        rows: paymentResult.data || [],
        error: paymentResult.error?.message || "",
      });

      setCommissions({
        rows: commissionResult.data || [],
        error: commissionResult.error?.message || "",
      });

      setPayouts({
        rows: payoutResult.data || [],
        error: payoutResult.error?.message || "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load financial records."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePayoutAction(
    id: string,
    action: "approve" | "reject" | "paid"
  ) {
    setMessage("");

    const payout = payouts.rows.find(
      (row) => String(row.id) === id
    );

    if (!payout) {
      setMessage("Payout record not found.");
      return;
    }

    const currentStatus = String(payout.status ?? "").toLowerCase();

    let updates: Record<string, unknown> = {};

    if (action === "approve") {
      if (currentStatus !== "pending") {
        setMessage("Only pending payouts can be approved.");
        return;
      }

      if (!window.confirm("Approve this provider payout?")) {
        return;
      }

      updates = { status: "approved" };
    }

    if (action === "reject") {
      if (currentStatus !== "pending") {
        setMessage("Only pending payouts can be rejected.");
        return;
      }

      const reason = window.prompt(
        "Enter the reason for rejecting this payout:"
      );

      if (!reason?.trim()) {
        setMessage("A rejection reason is required.");
        return;
      }

      const existingNotes = String(payout.notes ?? "");

      updates = {
        status: "rejected",
        notes: [
          existingNotes,
          `Rejection reason: ${reason.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
      };
    }

    if (action === "paid") {
      if (currentStatus !== "approved") {
        setMessage("Only approved payouts can be marked as paid.");
        return;
      }

      const reference = window.prompt(
        "Enter the payment transaction reference:"
      );

      if (!reference?.trim()) {
        setMessage("Payment reference is required.");
        return;
      }

      if (!window.confirm("Confirm that the provider has received this payment?")) {
        return;
      }

      updates = {
        status: "paid",
        payout_reference: reference.trim(),
        paid_at: new Date().toISOString(),
      };
    }

    setBusyId(id);

    try {
      const { data, error } = await supabase
        .from("provider_payouts")
        .update(updates)
        .eq("id", id)
        .eq("status", currentStatus)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(
          "Payout was not updated. Check its current status and administrator permissions."
        );
      }

      setMessage("Payout updated successfully.");
      await loadRecords();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update payout."
      );
    } finally {
      setBusyId(null);
    }
  }

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

      setAuthorized(true);
      await loadRecords();
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Checking administrator access...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Rate-It Financial Management
            </h1>

            <p className="mt-1 text-sm text-blue-200">
              Payments, commissions and provider payouts
            </p>
          </div>

          <Link
            href="/admin/login/dashboard"
            className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-950"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Financial Records
            </h2>

            <p className="mt-1 text-gray-500">
              Payments, commissions and provider payout management.
            </p>
          </div>

          <button
            onClick={loadRecords}
            disabled={loading}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {message && (
          <div
            className="mb-6 rounded-lg border bg-white p-4 text-sm"
            role="status"
          >
            {message}
          </div>
        )}

        {loading ? (
          <p className="py-10">Loading financial records...</p>
        ) : (
          <div className="space-y-7">
            <RecordsSection
              title="Payment Records"
              data={payments}
            />

            <RecordsSection
              title="Commission Records"
              data={commissions}
            />

            <PayoutsSection
              data={payouts}
              onAction={handlePayoutAction}
              busyId={busyId}
            />
          </div>
        )}

        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-3 text-xl font-bold">
            Rate-It Commission Policy
          </h2>

          <ul className="space-y-2 text-gray-600">
            <li>• First 250 hotel signups: no hotel commissions.</li>
            <li>• After 250 hotel signups: planned 10% hotel commission.</li>
            <li>• Car rentals: online payment and commission support.</li>
            <li>• Airport transfers: online payment and commission support.</li>
            <li>• Hotel guests pay directly at the hotel.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
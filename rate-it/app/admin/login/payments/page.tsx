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
    <section className="bg-white border rounded-xl p-5 shadow-sm">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {data.error && (
        <p className="text-red-600 text-sm">{data.error}</p>
      )}

      {!data.error && data.rows.length === 0 && (
        <p className="text-gray-500 text-sm">
          No records available yet.
        </p>
      )}

      {data.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
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
                      <pre className="mt-3 whitespace-pre-wrap break-words text-xs bg-gray-50 p-3 rounded">
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

export default function PaymentsDashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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
        supabase.from("provider payouts").select("*").limit(100),
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
    } catch {
      setPayments({
        rows: [],
        error: "Unable to load financial records.",
      });
    } finally {
      setLoading(false);
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
      <main className="min-h-screen flex items-center justify-center">
        Checking administrator access...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Rate-It Financial Management
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Payments, commissions and provider payouts
            </p>
          </div>

          <Link
            href="/admin/login/dashboard"
            className="bg-white text-blue-950 px-4 py-2 rounded-lg font-semibold"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-10">
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Financial Records
            </h2>
            <p className="text-gray-500 mt-1">
              Existing financial database records.
            </p>
          </div>

          <button
            onClick={loadRecords}
            disabled={loading}
            className="bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="py-10">Loading financial records...</p>
        ) : (
          <div className="space-y-7">
            <RecordsSection title="Payment Records" data={payments} />
            <RecordsSection title="Commission Records" data={commissions} />
            <RecordsSection title="Provider Payouts" data={payouts} />
          </div>
        )}

        <section className="bg-white border rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold mb-3">
            Rate-It Commission Policy
          </h2>

          <ul className="text-gray-600 space-y-2">
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
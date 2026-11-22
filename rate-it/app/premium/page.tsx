"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Account = {
  id: string | number;
  type: "hotel" | "provider";
  name: string;
  category: string;
};

const packages = [
  { days: 7, price: 5, ugx: "18,500" },
  { days: 30, price: 10, ugx: "37,000" },
  { days: 90, price: 35, ugx: "129,500", best: true },
  { days: 365, price: 65, ugx: "240,500" },
];

export default function PremiumPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData.user) {
        setMessage("Please sign in using your hotel or provider account.");
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const [hotelResult, providerResult] = await Promise.all([
        supabase
          .from("hotels")
          .select("id, hotel_name")
          .eq("user_id", userId)
          .maybeSingle(),

        supabase
          .from("providers")
          .select("id, business_name, provider_type")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      const foundAccounts: Account[] = [];

      if (hotelResult.data) {
        foundAccounts.push({
          id: hotelResult.data.id,
          type: "hotel",
          name: hotelResult.data.hotel_name || "My Hotel",
          category: "Hotel",
        });
      }

      if (providerResult.data) {
        foundAccounts.push({
          id: providerResult.data.id,
          type: "provider",
          name: providerResult.data.business_name,
          category: providerResult.data.provider_type,
        });
      }

      if (hotelResult.error || providerResult.error) {
        setMessage("Unable to load your account. Please try again.");
      } else if (foundAccounts.length === 0) {
        setMessage("No hotel or provider account was found for this login.");
      } else {
        setAccounts(foundAccounts);
        setSelectedAccount(
          `${foundAccounts[0].type}:${foundAccounts[0].id}`
        );
      }

      setLoading(false);
    }

    loadAccounts();
  }, []);

  const account = accounts.find(
    (item) => `${item.type}:${item.id}` === selectedAccount
  );

  const chosenPackage = packages.find(
    (item) => item.days === selectedPackage
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Rate-It Premium
          </h1>
          <p className="mt-3 text-gray-600">
            Increase your visibility and grow your business on Rate-It.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">
            Loading your account...
          </p>
        ) : message ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-700">{message}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <a
                href="/hotel/login"
                className="font-semibold text-blue-600"
              >
                Hotel Login
              </a>
              <a
                href="/providers/dashboard/login"
                className="font-semibold text-blue-600"
              >
                Provider Login
              </a>
            </div>
          </div>
        ) : (
          <>
            <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Your account
              </h2>

              {accounts.length > 1 ? (
                <div className="space-y-3">
                  {accounts.map((item) => {
                    const value = `${item.type}:${item.id}`;

                    return (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-4"
                      >
                        <input
                          type="radio"
                          name="account"
                          value={value}
                          checked={selectedAccount === value}
                          onChange={() => setSelectedAccount(value)}
                        />
                        <span>
                          <strong>{item.name}</strong>
                          <span className="ml-2 text-sm text-gray-500">
                            {item.category}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : account ? (
                <p className="text-gray-700">
                  <strong>{account.name}</strong> — {account.category}
                </p>
              ) : null}
            </section>

            <section>
              <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                Choose your Premium package
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {packages.map((item) => (
                  <div
                    key={item.days}
                    className={`relative rounded-xl border bg-white p-6 shadow-sm ${
                      selectedPackage === item.days
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200"
                    }`}
                  >
                    {item.best && (
                      <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        Best long-term value
                      </span>
                    )}

                    <h3 className="text-2xl font-bold text-gray-900">
                      {item.days} Days
                    </h3>

                    <p className="mt-4 text-3xl font-bold text-gray-900">
                      ${item.price}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Approx. UGX {item.ugx}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedPackage(item.days)}
                      className={`mt-6 w-full rounded-lg px-4 py-3 font-semibold ${
                        selectedPackage === item.days
                          ? "bg-blue-700 text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {selectedPackage === item.days
                        ? "Selected"
                        : "Choose package"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {chosenPackage && account && (
              <section className="mt-8 rounded-xl border border-blue-200 bg-white p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Package selected
                </h2>

                <p className="mt-3 text-gray-700">
                  {account.name} — {chosenPackage.days} days
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ${chosenPackage.price}
                </p>

                <p className="mt-4 text-sm text-gray-500">
                  Your selection is ready. Pesapal payment and automatic
                  Premium activation will be connected in the next step.
                  No payment has been made.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
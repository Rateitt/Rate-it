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
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData.user) {
        setMessage("Please sign in using your hotel or provider account.");
        setLoading(false);
        return;
      }

      setEmail(userData.user.email || "");

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

  async function handlePayment() {
    if (!account || !chosenPackage) {
      setMessage("Please select an account and Premium package.");
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setMessage("Please enter your first name, last name and phone number.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setPaying(true);
    setMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch("/api/pesapal/premium/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountType: account.type,
          accountId: account.id,
          durationDays: chosenPackage.days,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          countryCode: "UG",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to start Premium payment.");
      }

      if (!result.redirectUrl) {
        throw new Error("Pesapal did not provide a payment link.");
      }

      window.location.assign(result.redirectUrl);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      setPaying(false);
    }
  }

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
        ) : message && accounts.length === 0 ? (
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
                      onClick={() => {
                        setSelectedPackage(item.days);
                        setMessage("");
                      }}
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
              <section className="mt-8 rounded-xl border border-blue-200 bg-white p-6">
                <h2 className="text-center text-xl font-bold text-gray-900">
                  Complete your Premium purchase
                </h2>

                <p className="mt-3 text-center text-gray-700">
                  {account.name} — {chosenPackage.days} days
                </p>

                <p className="mt-2 text-center text-2xl font-bold text-gray-900">
                  ${chosenPackage.price}
                </p>

                <div className="mx-auto mt-6 max-w-xl space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      required
                    />
                  </div>

                  {message && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {message}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full rounded-lg bg-blue-700 px-6 py-4 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paying
                      ? "Connecting to Pesapal..."
                      : `Pay $${chosenPackage.price} with Pesapal`}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Your Premium subscription will only activate after
                    successful payment confirmation from Pesapal.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
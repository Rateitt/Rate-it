import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-6xl">
          About Rate-It
        </h1>
        <p className="mt-5 text-xl">
          Discover. Compare. Stay.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-gray-200">
          Your marketplace for discovering hotels, holiday
          properties, car rentals and airport transfers.
        </p>
      </section>

      <section className="mx-auto max-w-5xl space-y-12 px-6 py-14">
        <div>
          <h2 className="text-2xl font-bold">Who We Are</h2>
          <p className="mt-4 leading-8 text-gray-700">
            Rate-It is an online accommodation and travel
            marketplace connecting travellers with hotels,
            property rentals, car rental providers and airport
            transfer services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="mt-4 leading-8 text-gray-700">
            To make discovering, comparing and accessing
            accommodation and travel services easier,
            more convenient and accessible.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">What We Offer</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              ["Hotels", "Discover hotels, compare rooms and prices, and make bookings."],
              ["Property Rentals", "Find apartments, holiday homes and places to stay."],
              ["Car Rentals", "Discover vehicles for your journeys."],
              ["Airport Transfers", "Find convenient airport transportation."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Our Journey</h2>
          <p className="mt-4 leading-8 text-gray-700">
            We are starting in East Africa, including Uganda,
            Kenya, Tanzania and Rwanda, with ambitions to
            expand across Africa and eventually worldwide.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="mt-4 leading-8 text-gray-700">
            To become a trusted global marketplace for
            accommodation and travel services.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Our Commitment</h2>
          <p className="mt-4 leading-8 text-gray-700">
            We believe in transparency, accessibility and
            connecting travellers with service providers.
          </p>
        </div>

        <div className="border-t pt-8 text-center">
          <h2 className="text-2xl font-bold">
            Discover your next destination.
          </h2>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-950 px-8 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Explore Rate-It
          </Link>
        </div>
      </section>
    </main>
  );
}
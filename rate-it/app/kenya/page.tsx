import Link from "next/link";

const destinations = [
  {
    name: "Nairobi",
    description: "Discover hotels in Kenya's capital city.",
  },
  {
    name: "Mombasa",
    description: "Find coastal hotels and beach stays.",
  },
  {
    name: "Kisumu",
    description: "Explore hotels near Lake Victoria.",
  },
  {
    name: "Nakuru",
    description: "Discover stays in the Great Rift Valley.",
  },
  {
    name: "Naivasha",
    description: "Find relaxing stays near Lake Naivasha.",
  },
];

export default function KenyaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest">
          Rate-It | Kenya
        </p>
        <h1 className="text-4xl font-bold md:text-6xl">
          Discover Hotels in Kenya
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
          Discover, compare and book hotels, rooms and stays across Kenya.
        </p>
        <Link
          href="/hotels"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-950"
        >
          Explore Hotels
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">
          Explore Kenya Destinations
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/hotels?destination=${encodeURIComponent(destination.name)}`}
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-xl font-bold text-gray-900">
                {destination.name}
              </h3>
              <p className="mt-2 text-gray-600">
                {destination.description}
              </p>
              <span className="mt-5 inline-block font-semibold text-blue-700">
                Find Hotels →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
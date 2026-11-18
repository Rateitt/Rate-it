import Link from "next/link";

const destinations = [
  {
    name: "Kigali",
    description: "Discover hotels in Rwanda's capital city.",
  },
  {
    name: "Musanze",
    description: "Find accommodation near Volcanoes National Park.",
  },
  {
    name: "Rubavu",
    description: "Explore hotels along the beautiful shores of Lake Kivu.",
  },
  {
    name: "Huye",
    description: "Discover comfortable stays in southern Rwanda.",
  },
  {
    name: "Nyagatare",
    description: "Explore accommodation in eastern Rwanda.",
  },
];

export default function RwandaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest">
          Rate-It | Rwanda
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Discover Hotels in Rwanda
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
          Discover, compare and book hotels, rooms and stays across Rwanda.
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
          Explore Rwanda Destinations
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
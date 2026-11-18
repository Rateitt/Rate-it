import Link from "next/link";

const destinations = [
  "Kampala",
  "Entebbe",
  "Jinja",
  "Mbarara",
  "Fort Portal",
  "Gulu",
  "Mbale",
  "Kabale",
  "Kisoro",
  "Rukungiri",
  "Bushenyi",
  "Hoima",
  "Masaka",
  "Arua",
  "Soroti",
  "Lira",
  "Tororo",
  "Iganga",
  "Mukono",
  "Kasese",
  "Bundibugyo",
  "Kanungu",
  "Ntungamo",
  "Moroto",
  "Kotido",
  "Kaabong",
  "Kidepo Valley National Park",
  "Bwindi Impenetrable Forest",
  "Queen Elizabeth National Park",
  "Murchison Falls National Park",
  "Lake Mburo National Park",
  "Kibale Forest National Park",
  "Mgahinga Gorilla National Park",
  "Rwenzori Mountains National Park",
  "Semuliki National Park",
  "Mount Elgon National Park",
  "Sipi Falls",
  "Lake Bunyonyi",
  "Lake Mutanda",
  "Lake Victoria",
  "Ssese Islands",
  "Ziwa Rhino Sanctuary",
  "Mabamba Swamp",
  "Pian Upe Wildlife Reserve",
  "Kidepo",
  "Bwindi",
  "Kalangala",
  "Nakasongola",
  "Pakwach",
  "Nebbi",
];

export default function UgandaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest">
          Rate-It | Uganda
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Discover Hotels in Uganda
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
          Discover, compare and book hotels, rooms and stays
          across Uganda's cities, towns and beautiful destinations.
        </p>

        <Link
          href="/hotels"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-950"
        >
          Explore Hotels
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="mb-3 text-3xl font-bold text-gray-900">
          Explore Uganda
        </h2>

        <p className="mb-8 text-gray-600">
          Explore 50 destinations and find accommodation across Uganda.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination}
              href={`/hotels?destination=${encodeURIComponent(destination)}`}
              className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-xl font-bold text-gray-900">
                {destination}
              </h3>

              <p className="mt-2 text-gray-600">
                Find hotels and accommodation in {destination}.
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
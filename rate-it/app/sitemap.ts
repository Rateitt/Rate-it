import type { MetadataRoute } from "next";

const baseUrl = "https://rate-it-three.vercel.app";

const destinations: Record<string, string[]> = {
  uganda: [
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
  ],
  kenya: [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Naivasha",
  ],
  rwanda: [
    "Kigali",
    "Musanze",
    "Rubavu",
    "Huye",
    "Nyagatare",
  ],
  tanzania: [
    "Dar es Salaam",
    "Zanzibar",
    "Arusha",
    "Dodoma",
    "Mwanza",
  ],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/uganda`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/kenya`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/rwanda`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tanzania`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/transfers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/hotel/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/hotel/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const destinationPages: MetadataRoute.Sitemap = Object.values(
    destinations
  ).flatMap((countryDestinations) =>
    countryDestinations.map((destination) => ({
      url: `${baseUrl}/hotels?destination=${encodeURIComponent(destination)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))
  );

  return [...mainPages, ...destinationPages];
}
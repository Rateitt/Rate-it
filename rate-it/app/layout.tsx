import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Rate-It | Discover. Compare. Stay.",
    template: "%s | Rate-It",
  },
  description:
    "Discover, compare and book hotels, rooms and prices across Uganda and beyond. Find your perfect stay with Rate-It.",
  keywords: [
    "Rate-It",
    "hotels in Uganda",
    "hotel booking Uganda",
    "hotels in Kampala",
    "hotels in Entebbe",
    "hotels in Jinja",
    "hotels in Mbarara",
    "hotels in Mbale",
    "hotels in Fort Portal",
    "hotels in Gulu",
    "hotels in Masaka",
    "hotels in Kabale",
    "hotels in Hoima",
    "hotels in Arua",
    "hotels in Soroti",
    "hotels in Lira",
    "hotels in Rukungiri",
    "hotels in Kisoro",
    "hotels in Bushenyi",
    "Uganda hotels",
    "hotel rooms Uganda",
    "hotel prices Uganda",
  ],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "reN3aLnKBKcPhG-F6BQ_9265VK19u1rVJ3aasfOHRUg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Supabase server credentials are missing.");
    }

    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase
      .from("premium_subscriptions")
      .select("hotel_id")
      .eq("status", "active")
      .not("hotel_id", "is", null)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      throw new Error(error.message);
    }

    const hotelIds = [
      ...new Set(
        (data || [])
          .map((subscription) => Number(subscription.hotel_id))
          .filter((id) => Number.isFinite(id))
      ),
    ];

    return NextResponse.json(
      { hotelIds },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Premium hotel lookup failed:", error);

    return NextResponse.json(
      { error: "Could not load Premium hotels." },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is missing.");

      return NextResponse.json(
        { error: "Cron security is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server credentials are missing.");
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("premium_subscriptions")
      .update({
        status: "expired",
        updated_at: now,
      })
      .eq("status", "active")
      .lte("expires_at", now)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Premium expiry check completed.",
      expiredCount: data?.length || 0,
      checkedAt: now,
    });
  } catch (error) {
    console.error("Premium expiry cron error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Premium expiry check failed.",
      },
      { status: 500 }
    );
  }
}
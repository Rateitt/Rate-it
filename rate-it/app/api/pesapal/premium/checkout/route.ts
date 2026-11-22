import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { submitPesapalOrder } from "../../../../../lib/pesapal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICES: Record<number, number> = {
  7: 5,
  30: 10,
  90: 35,
  365: 65,
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server credentials are not configured.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please sign in before purchasing Premium." },
        { status: 401 }
      );
    }

    const accessToken = authorization.substring(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      throw new Error("Supabase authentication is not configured.");
    }

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session is invalid. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const accountType = body.accountType;
    const accountId = body.accountId;
    const durationDays = Number(body.durationDays);

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || user.email || "").trim();
    const phone = String(body.phone || "").trim();
    const countryCode = String(body.countryCode || "UG")
      .trim()
      .toUpperCase();

    if (!["hotel", "provider"].includes(accountType)) {
      return NextResponse.json(
        { error: "Invalid account type." },
        { status: 400 }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(PRICES, durationDays)) {
      return NextResponse.json(
        { error: "Please select a valid Premium package." },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        {
          error:
            "Please provide your first name, last name, email and phone number.",
        },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "Account information is missing." },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    let providerId: string | null = null;
    let hotelId: number | null = null;

    if (accountType === "provider") {
      const { data: provider, error } = await admin
        .from("providers")
        .select("id, user_id")
        .eq("id", accountId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!provider) {
        return NextResponse.json(
          { error: "This provider account does not belong to you." },
          { status: 403 }
        );
      }

      providerId = provider.id;
    }

    if (accountType === "hotel") {
      const parsedHotelId = Number(accountId);

      if (!Number.isSafeInteger(parsedHotelId) || parsedHotelId <= 0) {
        return NextResponse.json(
          { error: "Invalid hotel account." },
          { status: 400 }
        );
      }

      const { data: hotel, error } = await admin
        .from("hotels")
        .select("id, user_id")
        .eq("id", parsedHotelId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!hotel) {
        return NextResponse.json(
          { error: "This hotel account does not belong to you." },
          { status: 403 }
        );
      }

      hotelId = hotel.id;
    }

    const ipnId = process.env.PESAPAL_IPN_ID;
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://rate-it-three.vercel.app";

    if (!ipnId) {
      throw new Error("Pesapal IPN is not configured.");
    }

    const amount = PRICES[durationDays];
    const currency = "USD";

    const { data: subscription, error: subscriptionError } = await admin
      .from("premium_subscriptions")
      .insert({
        provider_id: providerId,
        hotel_id: hotelId,
        duration_days: durationDays,
        amount,
        currency,
        status: "pending",
      })
      .select("id")
      .single();

    if (subscriptionError) throw subscriptionError;

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        customer_user_id: user.id,
        booking_type: "premium",
        booking_id: subscription.id,
        amount,
        currency,
        payment_method: "online",
        payment_provider: "Pesapal",
        status: "pending",
      })
      .select("id")
      .single();

    if (paymentError) throw paymentError;

    const { error: linkError } = await admin
      .from("premium_subscriptions")
      .update({
        payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (linkError) throw linkError;

    const merchantReference = `RI-PREMIUM-${subscription.id}`;

    const pesapalResponse = await submitPesapalOrder({
      id: merchantReference,
      amount,
      currency,
      description: `Rate-It Premium - ${durationDays} days`,
      callback_url: `${siteUrl}/api/pesapal`,
      notification_id: ipnId,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      country_code: countryCode,
    });

    const redirectUrl =
      pesapalResponse?.redirect_url ||
      pesapalResponse?.redirectUrl;

    if (!redirectUrl) {
      throw new Error("Pesapal did not return a payment redirect URL.");
    }

    return NextResponse.json({
      success: true,
      message: "Premium payment checkout created.",
      redirectUrl,
      subscriptionId: subscription.id,
      paymentId: payment.id,
      merchantReference,
    });
  } catch (error) {
    console.error("Premium checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Premium checkout.",
      },
      { status: 500 }
    );
  }
}
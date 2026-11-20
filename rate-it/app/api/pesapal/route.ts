import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  submitPesapalOrder,
  getPesapalTransactionStatus,
} from "../../../lib/pesapal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IPN_ID = process.env.PESAPAL_IPN_ID;

const BOOKING_TABLES: Record<string, string[]> = {
  car: ["vehicle_bookings"],
  transfer: ["transfer_bookings"],
  property: ["property_bookings", "property bookings"],
};

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SITE_URL is missing.");
  }

  return url.replace(/\/$/, "");
}

function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Supabase server credentials are missing.");
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

async function getUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase authentication credentials are missing.");
  }

  const token = authorization.slice(7);
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function getBooking(
  service: string,
  bookingId: string,
  userId?: string
) {
  const tables = BOOKING_TABLES[service];

  if (!tables) {
    throw new Error("Unsupported payment service.");
  }

  const supabase: any = getAdminClient();

  for (const table of tables) {
    let query = supabase
      .from(table)
      .select("*")
      .eq("id", bookingId);

    if (userId) {
      query = query.eq("customer_user_id", userId);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      return { data, table };
    }
  }

  return null;
}

async function verifyPayment(
  trackingId: string,
  merchantReference: string
) {
  const match = merchantReference.match(
    /^RI-(car|transfer|property)-(.+)$/
  );

  if (!match) {
    throw new Error("Invalid payment reference.");
  }

  const service = match[1];
  const bookingId = match[2];

  const booking = await getBooking(service, bookingId);

  if (!booking) {
    throw new Error("Booking was not found.");
  }

  const payment = await getPesapalTransactionStatus(trackingId);

  if (payment.merchant_reference !== merchantReference) {
    throw new Error("Payment reference does not match.");
  }

  const bookingAmount = Number(booking.data.total_price);
  const paidAmount = Number(payment.amount);

  if (
    !Number.isFinite(bookingAmount) ||
    !Number.isFinite(paidAmount) ||
    Math.abs(bookingAmount - paidAmount) > 0.01
  ) {
    throw new Error("Payment amount does not match the booking.");
  }

  if (
    String(booking.data.currency).toUpperCase() !==
    String(payment.currency).toUpperCase()
  ) {
    throw new Error("Payment currency does not match.");
  }

  const statusCode = Number(payment.status_code);

  const paymentStatus =
    statusCode === 1
      ? "paid"
      : statusCode === 2
        ? "failed"
        : statusCode === 3
          ? "reversed"
          : "pending";

  if (paymentStatus !== "pending") {
    const supabase: any = getAdminClient();

    const { error } = await supabase
      .from(booking.table)
      .update({ payment_status: paymentStatus })
      .eq("id", bookingId);

    if (error) {
      throw new Error("Could not update the booking payment status.");
    }
  }

  return { service, bookingId, paymentStatus };
}

// Start a Pesapal payment.
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in before making a payment." },
        { status: 401 }
      );
    }

    if (!IPN_ID) {
      throw new Error("PESAPAL_IPN_ID is missing.");
    }

    const body = await request.json();
    const service = String(body.service || "");
    const bookingId = String(body.bookingId || "");

    if (!service || !bookingId) {
      return NextResponse.json(
        { error: "Service and booking ID are required." },
        { status: 400 }
      );
    }

    const booking = await getBooking(service, bookingId, user.id);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or does not belong to you." },
        { status: 404 }
      );
    }

    if (booking.data.payment_status === "paid") {
      return NextResponse.json(
        { error: "This booking has already been paid." },
        { status: 409 }
      );
    }

    const amount = Number(booking.data.total_price);
    const currency = String(booking.data.currency || "").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0 || !currency) {
      return NextResponse.json(
        { error: "Invalid booking amount or currency." },
        { status: 400 }
      );
    }

    const email = String(body.email || user.email || "");
    const phone = String(body.phone || "");
    const firstName = String(body.firstName || "");
    const lastName = String(body.lastName || "");
    const countryCode = String(body.countryCode || "UG");

    if (!email || !phone || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Customer billing details are required." },
        { status: 400 }
      );
    }

    const merchantReference = `RI-${service}-${bookingId}`;

    if (merchantReference.length > 50) {
      throw new Error("Booking reference is too long.");
    }

    const baseUrl = getBaseUrl();

    const order = await submitPesapalOrder({
      id: merchantReference,
      amount,
      currency,
      description: `Rate-It ${service} booking`,
      callback_url: `${baseUrl}/api/pesapal`,
      notification_id: IPN_ID,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      country_code: countryCode,
    });

    if (!order.redirect_url || !order.order_tracking_id) {
      throw new Error("Pesapal did not return a checkout URL.");
    }

    return NextResponse.json({
      success: true,
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
      merchantReference,
    });
  } catch (error) {
    console.error("Pesapal payment error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not start payment.",
      },
      { status: 500 }
    );
  }
}

// Receive Pesapal callbacks and IPN notifications.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const trackingId = params.get("OrderTrackingId") || "";
  const merchantReference =
    params.get("OrderMerchantReference") || "";
  const notificationType =
    params.get("OrderNotificationType") || "";

  const isIPN = notificationType === "IPNCHANGE";

  const ipnResponse = (status: number) =>
    NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: trackingId,
      orderMerchantReference: merchantReference,
      status,
    });

  try {
    if (!trackingId || !merchantReference) {
      if (isIPN) return ipnResponse(500);

      return NextResponse.redirect(
        new URL("/?payment=invalid", getBaseUrl())
      );
    }

    const result = await verifyPayment(
      trackingId,
      merchantReference
    );

    if (isIPN) {
      return ipnResponse(200);
    }

    const callbackUrl = new URL("/", getBaseUrl());

    callbackUrl.searchParams.set("payment", result.paymentStatus);
    callbackUrl.searchParams.set("service", result.service);
    callbackUrl.searchParams.set("booking", result.bookingId);

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error("Pesapal callback/IPN error:", error);

    if (isIPN) {
      return ipnResponse(500);
    }

    const callbackUrl = new URL("/", getBaseUrl());
    callbackUrl.searchParams.set("payment", "verification_failed");

    return NextResponse.redirect(callbackUrl);
  }
}
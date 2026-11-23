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

const COMMISSION_RATE = 10;
const PROVIDER_SHARE_RATE = 90;

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

async function getProviderId(
  service: string,
  booking: any
): Promise<string> {
  const supabase: any = getAdminClient();

  let result: any;

  if (service === "car") {
    if (!booking.vehicle_id) {
      throw new Error("The vehicle booking has no vehicle ID.");
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("provider_id")
      .eq("id", booking.vehicle_id)
      .maybeSingle();

    if (error) {
      throw new Error("Could not find the vehicle provider.");
    }

    result = data;
  } else if (service === "transfer") {
    if (!booking.transfer_service_id) {
      throw new Error("The transfer booking has no service ID.");
    }

    const { data, error } = await supabase
      .from("transfer_services")
      .select("provider_id")
      .eq("id", booking.transfer_service_id)
      .maybeSingle();

    if (error) {
      throw new Error("Could not find the transfer provider.");
    }

    result = data;
  } else {
    throw new Error("Commissions are not enabled for this service.");
  }

  if (!result?.provider_id) {
    throw new Error("The booking provider could not be identified.");
  }

  return String(result.provider_id);
}

async function recordSuccessfulPayment(
  service: string,
  bookingId: string,
  booking: any,
  trackingId: string,
  paidAmount: number,
  currency: string
) {
  if (service !== "car" && service !== "transfer") {
    return;
  }

  const supabase: any = getAdminClient();
  const customerUserId = booking.customer_user_id;

  if (!customerUserId) {
    throw new Error("The booking customer could not be identified.");
  }

  const providerId = await getProviderId(service, booking);

  const { data: existingPayment, error: existingPaymentError } =
    await supabase
      .from("payments")
      .select("id, booking_id, booking_type, customer_user_id, status")
      .eq("provider_transaction_id", trackingId)
      .maybeSingle();

  if (existingPaymentError) {
    throw new Error("Could not check the existing payment record.");
  }

  let paymentId: string;

  if (existingPayment) {
    if (
      String(existingPayment.booking_id) !== String(bookingId) ||
      existingPayment.booking_type !== service
    ) {
      throw new Error(
        "This Pesapal transaction is already linked to another booking."
      );
    }

    paymentId = String(existingPayment.id);

    if (existingPayment.status !== "paid") {
      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (updatePaymentError) {
        throw new Error("Could not update the existing payment record.");
      }
    }
  } else {
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        customer_user_id: customerUserId,
        booking_type: service,
        booking_id: bookingId,
        amount: paidAmount,
        currency,
        payment_method: "online",
        payment_provider: "Pesapal",
        provider_transaction_id: trackingId,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (paymentError || !newPayment?.id) {
      throw new Error(
        paymentError?.message || "Could not save the payment record."
      );
    }

    paymentId = String(newPayment.id);
  }

  const commissionAmount = Number(
    ((paidAmount * COMMISSION_RATE) / 100).toFixed(2)
  );

  const providerAmount = Number(
    ((paidAmount * PROVIDER_SHARE_RATE) / 100).toFixed(2)
  );

  const { data: existingCommission, error: commissionCheckError } =
    await supabase
      .from("commissions")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

  if (commissionCheckError) {
    throw new Error("Could not check the existing commission record.");
  }

  if (!existingCommission) {
    const { error: commissionError } = await supabase
      .from("commissions")
      .insert({
        provider_id: providerId,
        payment_id: paymentId,
        booking_type: service,
        booking_id: bookingId,
        booking_amount: paidAmount,
        commission_rate: COMMISSION_RATE,
        commission_amount: commissionAmount,
        currency,
        status: "pending",
      });

    if (commissionError) {
      throw new Error(
        commissionError.message || "Could not save the commission."
      );
    }
  }

  // Create one pending payout record per successful payment.
  // The unique payment_id index prevents duplicate payout records.
  const { data: existingPayout, error: payoutCheckError } =
    await supabase
      .from("provider_payouts")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();

  if (payoutCheckError) {
    throw new Error("Could not check the existing provider payout.");
  }

  if (!existingPayout) {
    const { error: payoutError } = await supabase
      .from("provider_payouts")
      .insert({
        provider_id: providerId,
        payment_id: paymentId,
        booking_type: service,
        booking_id: bookingId,
        amount: providerAmount,
        currency,
        payout_method: "awaiting_setup",
        payout_reference: trackingId,
        status: "pending",
        requested_at: new Date().toISOString(),
        notes: "90% provider share. Awaiting automated payout integration.",
      });

    if (payoutError) {
      throw new Error(
        payoutError.message || "Could not create the provider payout record."
      );
    }
  }
}

/**
 * Verify and activate a Premium subscription after Pesapal confirms payment.
 * Premium payments do not generate booking commissions.
 */
async function verifyPremiumPayment(
  trackingId: string,
  merchantReference: string
) {
  const match = merchantReference.match(/^RI-PREMIUM-(.+)$/);

  if (!match) {
    throw new Error("Invalid Premium payment reference.");
  }

  const subscriptionId = match[1];
  const supabase: any = getAdminClient();

  const { data: subscription, error: subscriptionError } =
    await supabase
      .from("premium_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .maybeSingle();

  if (subscriptionError || !subscription) {
    throw new Error("Premium subscription was not found.");
  }

  if (!subscription.payment_id) {
    throw new Error("The Premium subscription has no payment record.");
  }

  const { data: paymentRecord, error: paymentRecordError } =
    await supabase
      .from("payments")
      .select("*")
      .eq("id", subscription.payment_id)
      .maybeSingle();

  if (paymentRecordError || !paymentRecord) {
    throw new Error("Premium payment record was not found.");
  }

  if (
    paymentRecord.booking_type !== "premium" ||
    String(paymentRecord.booking_id) !== String(subscriptionId)
  ) {
    throw new Error("Premium payment record does not match the subscription.");
  }

  const payment = await getPesapalTransactionStatus(trackingId);

  if (payment.merchant_reference !== merchantReference) {
    throw new Error("Premium payment reference does not match.");
  }

  const expectedAmount = Number(subscription.amount);
  const paidAmount = Number(payment.amount);
  const expectedCurrency = String(subscription.currency || "").toUpperCase();
  const paidCurrency = String(payment.currency || "").toUpperCase();

  if (
    !Number.isFinite(expectedAmount) ||
    !Number.isFinite(paidAmount) ||
    Math.abs(expectedAmount - paidAmount) > 0.01
  ) {
    throw new Error("Premium payment amount does not match.");
  }

  if (!expectedCurrency || expectedCurrency !== paidCurrency) {
    throw new Error("Premium payment currency does not match.");
  }

  if (
    paymentRecord.provider_transaction_id &&
    paymentRecord.provider_transaction_id !== trackingId
  ) {
    throw new Error("This Premium subscription has another Pesapal transaction.");
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

  const paymentUpdate: Record<string, any> = {
    status: paymentStatus,
    provider_transaction_id: trackingId,
    payment_provider: "Pesapal",
    payment_method: "online",
  };

  if (paymentStatus === "paid") {
    paymentUpdate.paid_at =
      paymentRecord.paid_at || new Date().toISOString();
  }

  const { error: updatePaymentError } = await supabase
    .from("payments")
    .update(paymentUpdate)
    .eq("id", subscription.payment_id);

  if (updatePaymentError) {
    throw new Error("Could not update the Premium payment record.");
  }

  if (paymentStatus === "paid") {
    if (subscription.status !== "active") {
      const startsAt = new Date();
      const expiresAt = new Date(startsAt);

      expiresAt.setDate(
        expiresAt.getDate() + Number(subscription.duration_days)
      );

      const { error: activateError } = await supabase
        .from("premium_subscriptions")
        .update({
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: startsAt.toISOString(),
        })
        .eq("id", subscriptionId);

      if (activateError) {
        throw new Error("Payment succeeded, but Premium activation failed.");
      }
    }
  } else if (paymentStatus === "reversed") {
    if (subscription.status === "active") {
      const { error: cancelError } = await supabase
        .from("premium_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (cancelError) {
        throw new Error("Could not cancel the reversed Premium subscription.");
      }
    }
  }

  return {
    service: "premium",
    bookingId: subscriptionId,
    paymentStatus,
  };
}

async function verifyPayment(
  trackingId: string,
  merchantReference: string
) {
  if (merchantReference.startsWith("RI-PREMIUM-")) {
    return verifyPremiumPayment(trackingId, merchantReference);
  }

  const match = merchantReference.match(
    /^RI-(car|transfer|property)-(.+)$/
  );

  if (!match) {
    throw new Error("Invalid payment reference.");
  }

  const service = match[1];
  const bookingId = match[2];

  if (service === "property") {
    throw new Error(
      "Online payments for property rentals are not enabled yet."
    );
  }

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
  const currency = String(payment.currency || "").toUpperCase();

  if (
    !Number.isFinite(bookingAmount) ||
    !Number.isFinite(paidAmount) ||
    Math.abs(bookingAmount - paidAmount) > 0.01
  ) {
    throw new Error("Payment amount does not match the booking.");
  }

  if (
    String(booking.data.currency).toUpperCase() !== currency
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

  if (paymentStatus === "paid") {
    await recordSuccessfulPayment(
      service,
      bookingId,
      booking.data,
      trackingId,
      paidAmount,
      currency
    );
  }

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

    if (service === "property") {
      return NextResponse.json(
        {
          error:
            "Online payments for property rentals are not enabled yet. Please pay the provider directly.",
        },
        { status: 403 }
      );
    }

    if (service !== "car" && service !== "transfer") {
      return NextResponse.json(
        { error: "Unsupported payment service." },
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
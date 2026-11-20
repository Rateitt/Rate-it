const PESAPAL_BASE_URL =
  process.env.PESAPAL_ENVIRONMENT === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

function getCredentials() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Pesapal credentials are not configured.");
  }

  return {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  };
}

async function pesapalRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${PESAPAL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid response from Pesapal.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || "Pesapal request failed."
    );
  }

  return data;
}

export async function getPesapalToken(): Promise<string> {
  const data = await pesapalRequest("/api/Auth/RequestToken", {
    method: "POST",
    body: JSON.stringify(getCredentials()),
  });

  if (!data.token) {
    throw new Error("Pesapal did not return an access token.");
  }

  return data.token;
}

export async function registerPesapalIPN(
  notificationUrl: string
): Promise<any> {
  const token = await getPesapalToken();

  return pesapalRequest("/api/URLSetup/RegisterIPN", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: notificationUrl,
      ipn_notification_type: "GET",
    }),
  });
}

export async function submitPesapalOrder(order: {
  id: string;
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  notification_id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  country_code: string;
}): Promise<any> {
  const token = await getPesapalToken();

  return pesapalRequest("/api/Transactions/SubmitOrderRequest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      description: order.description,
      callback_url: order.callback_url,
      notification_id: order.notification_id,
      billing_address: {
        email_address: order.email,
        phone_number: order.phone,
        first_name: order.first_name,
        last_name: order.last_name,
        country_code: order.country_code,
      },
    }),
  });
}

export async function getPesapalTransactionStatus(
  orderTrackingId: string
): Promise<any> {
  const token = await getPesapalToken();

  return pesapalRequest(
    `/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(
      orderTrackingId
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
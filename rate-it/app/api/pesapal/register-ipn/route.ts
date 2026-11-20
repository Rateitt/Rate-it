import { NextResponse } from "next/server";
import { registerPesapalIPN } from "../../../../lib/pesapal";

export async function GET() {
  try {
    const notificationUrl =
      "https://rate-it-three.vercel.app/api/pesapal";

    const result = await registerPesapalIPN(notificationUrl);

    return NextResponse.json({
      success: true,
      message: "Pesapal IPN registered successfully.",
      pesapal_response: result,
    });
  } catch (error) {
    console.error("Pesapal IPN registration failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "IPN registration failed.",
      },
      { status: 500 }
    );
  }
}